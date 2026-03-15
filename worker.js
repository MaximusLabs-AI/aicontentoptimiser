// ─── Configuration ───────────────────────────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5;      // max requests per window per IP
const MAX_QUERY_LENGTH = 500;           // characters
const MAX_CONTENT_LENGTH = 10000;       // characters per option
const MAX_ROUNDS = 30;                  // hard cap on rounds

// In-memory rate limit store (resets when the Worker isolate is recycled).
// For production at scale, replace with Durable Objects or Workers KV.
const rateLimitStore = new Map();

// ─── Model Mapping ──────────────────────────────────────────────────────────
// Maps the frontend "AI Search Engine" selector to Groq-supported model IDs.
const MODEL_MAP = {
    openai: 'llama-3.3-70b-versatile',
    gemini: 'gemma2-9b-it',
    claude: 'mixtral-8x7b-32768',
    perplexity: 'llama-3.1-70b-versatile',
};
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Derive a client identifier from the request (IP or CF header).
 */
function getClientIP(request) {
    return (
        request.headers.get('CF-Connecting-IP') ||
        request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
        request.headers.get('X-Real-IP') ||
        'unknown'
    );
}

/**
 * Simple sliding-window rate limiter.
 * Returns { allowed: boolean, remaining: number, retryAfterSec: number }
 */
function checkRateLimit(clientIP) {
    const now = Date.now();
    let entry = rateLimitStore.get(clientIP);

    // Purge stale entries periodically (lazy cleanup)
    if (rateLimitStore.size > 10000) {
        for (const [key, val] of rateLimitStore) {
            if (now - val.windowStart > RATE_LIMIT_WINDOW_MS) rateLimitStore.delete(key);
        }
    }

    if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
        entry = { windowStart: now, count: 1 };
        rateLimitStore.set(clientIP, entry);
        return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, retryAfterSec: 0 };
    }

    entry.count++;
    if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
        const retryAfterSec = Math.ceil((entry.windowStart + RATE_LIMIT_WINDOW_MS - now) / 1000);
        return { allowed: false, remaining: 0, retryAfterSec };
    }

    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count, retryAfterSec: 0 };
}

/**
 * Build CORS headers from allowed origins list.
 */
function buildCorsHeaders(request, env) {
    const origin = request.headers.get('Origin');
    // ALLOWED_ORIGINS can be set as an env var: comma-separated list, or '*' for dev
    const allowedRaw = env.ALLOWED_ORIGINS || '*';
    let allowedOrigin = '';

    if (allowedRaw === '*') {
        // Development / permissive mode
        allowedOrigin = origin || '*';
    } else {
        const allowed = allowedRaw.split(',').map(o => o.trim());
        allowedOrigin = allowed.includes(origin) ? origin : allowed[0];
    }

    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400', // cache preflight for 24h
    };
}

/**
 * Standard security headers applied to every response.
 */
const SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

/**
 * Sanitise a string: trim and truncate to maxLen.
 */
function sanitize(str, maxLen) {
    if (typeof str !== 'string') return '';
    return str.trim().slice(0, maxLen);
}

// ─── Main Worker ─────────────────────────────────────────────────────────────
export default {
    async fetch(request, env) {
        const corsHeaders = buildCorsHeaders(request, env);

        // ── Preflight ────────────────────────────────────────────────────
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: { ...corsHeaders, ...SECURITY_HEADERS } });
        }

        // ── Method guard ─────────────────────────────────────────────────
        if (request.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
                status: 405,
                headers: { ...corsHeaders, ...SECURITY_HEADERS, 'Content-Type': 'application/json' },
            });
        }

        // ── Rate limiting ────────────────────────────────────────────────
        const clientIP = getClientIP(request);
        const rateResult = checkRateLimit(clientIP);

        if (!rateResult.allowed) {
            return new Response(
                JSON.stringify({
                    error: `Rate limit exceeded. Please wait ${rateResult.retryAfterSec}s before trying again.`,
                }),
                {
                    status: 429,
                    headers: {
                        ...corsHeaders,
                        ...SECURITY_HEADERS,
                        'Content-Type': 'application/json',
                        'Retry-After': String(rateResult.retryAfterSec),
                    },
                },
            );
        }

        // ── Streaming response setup ─────────────────────────────────────
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = new TextEncoder();

        // Start background process
        (async () => {
            try {
                // ── Parse & validate body ────────────────────────────────
                let body;
                try {
                    body = await request.json();
                } catch (_) {
                    await writer.write(encoder.encode(`data: ${JSON.stringify({ error: 'Invalid JSON body' })}\n\n`));
                    await writer.close();
                    return;
                }

                const query = sanitize(body.query, MAX_QUERY_LENGTH);
                const optionA = sanitize(body.optionA, MAX_CONTENT_LENGTH);
                const optionB = sanitize(body.optionB, MAX_CONTENT_LENGTH);
                const modelKey = typeof body.model === 'string' ? body.model.toLowerCase() : 'openai';
                const rounds = Math.min(Math.max(parseInt(body.rounds, 10) || 20, 1), MAX_ROUNDS);

                if (!env.GROQ_API_KEY || env.GROQ_API_KEY === 'your_api_key_here') {
                    await writer.write(encoder.encode(`data: ${JSON.stringify({ error: 'API key is not configured. Please contact the administrator.' })}\n\n`));
                    await writer.close();
                    return;
                }

                if (!query || !optionA || !optionB) {
                    await writer.write(encoder.encode(`data: ${JSON.stringify({ error: 'Missing required fields: query, optionA, and optionB are all required.' })}\n\n`));
                    await writer.close();
                    return;
                }

                // Resolve the Groq model ID from the frontend key
                const groqModel = MODEL_MAP[modelKey] || DEFAULT_MODEL;

                const allResults = [];
                let scoreA = 0;
                let scoreB = 0;

                for (let i = 0; i < rounds; i++) {
                    try {
                        // Randomize order each round to eliminate position bias
                        const isAFirst = Math.random() > 0.5;
                        const first = isAFirst ? optionA : optionB;
                        const second = isAFirst ? optionB : optionA;
                        const firstLabel = isAFirst ? 'A' : 'B';
                        const secondLabel = isAFirst ? 'B' : 'A';

                        const systemPrompt = `You are an AI search engine evaluating which search result to cite in your response to a user's query.
Your evaluation criteria:
1. RELEVANCE: How directly does the content address the user's query?
2. SPECIFICITY: Does it contain specific, useful details vs. generic claims?
3. CLARITY: Is the content well-written, clear, easy to extract info from?
4. AUTHORITY: Does the content signal expertise and trustworthiness?
5. CITATION-WORTHINESS: Would citing this content genuinely help the user?

Rules:
- You MUST pick exactly one winner. No ties.
- You must NOT be biased by the order in which options are presented.
- Respond ONLY with a JSON object: {"winner": "A" or "B", "reason": "one-sentence explanation"}`;

                        const userPrompt = `A user searches: "${query}"
(Internal Reference: Round ${i + 1}-${Math.random().toString(36).substring(7)})

You find two potential sources to cite in your response:

--- OPTION ${firstLabel} ---
${first}
--- END OPTION ${firstLabel} ---

--- OPTION ${secondLabel} ---
${second}
--- END OPTION ${secondLabel} ---

Which option would you cite in your response to the user?`;

                        const response = await callGroq(env.GROQ_API_KEY, groqModel, systemPrompt, userPrompt);

                        // Robust winner detection
                        const rawWinner = String(response.winner || '').trim().toUpperCase();
                        const winner = rawWinner === 'A' || rawWinner === 'B' ? rawWinner : (Math.random() > 0.5 ? 'A' : 'B');

                        const roundResult = {
                            round: i + 1,
                            winner: winner,
                            reason: response.reason || 'No reason provided.',
                            orderWasSwapped: !isAFirst,
                        };

                        allResults.push(roundResult);
                        if (winner === 'A') scoreA++;
                        else scoreB++;

                        await writer.write(encoder.encode(`data: ${JSON.stringify(roundResult)}\n\n`));
                    } catch (roundErr) {
                        console.error(`Error in round ${i + 1}:`, roundErr);
                        await writer.write(encoder.encode(`data: ${JSON.stringify({ error: `Round ${i + 1} failed: ${roundErr.message}` })}\n\n`));
                    }
                }

                // ── Generate Final Synthesis ─────────────────────────────
                try {
                    const finalWinner = scoreA > scoreB ? 'A' : (scoreB > scoreA ? 'B' : 'Tie');

                    const synthesisSystemPrompt = `You are an expert content analyst. You have just completed ${rounds} rounds of blind A/B testing between two content options for the query: "${query}".
Your task is to provide a final, intelligent synthesis of the results.
The winner is Option ${finalWinner} (Option A wins: ${scoreA}, Option B wins: ${scoreB}).

Provide a JSON response with a "synthesis" field that includes:
1. A summary of why the winner was consistently preferred (strengths).
2. A constructive analysis of the loser's weaknesses.
3. A concluding statement on which content is better for search intent.

Keep it professional, insightful, and formatted with simple HTML (like <strong> and <em>) for emphasis.
Respond ONLY with a JSON object: {"synthesis": "your analysis here"}`;

                    const reasonsSummary = allResults.map(r => `Round ${r.round} Winner ${r.winner}: ${r.reason}`).join('\n');
                    const synthesisUserPrompt = `Here are the reasons given for each round:\n${reasonsSummary}\n\nPlease generate the final synthesis.`;

                    const finalResponse = await callGroq(env.GROQ_API_KEY, groqModel, synthesisSystemPrompt, synthesisUserPrompt);

                    await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'synthesis', winner: finalWinner, synthesis: finalResponse.synthesis })}\n\n`));
                } catch (synthErr) {
                    console.error('Error generating synthesis:', synthErr);
                    await writer.write(encoder.encode(`data: ${JSON.stringify({ error: `Synthesis failed: ${synthErr.message}` })}\n\n`));
                }

                await writer.write(encoder.encode(`data: [DONE]\n\n`));
            } catch (err) {
                console.error('Fatal worker error:', err);
                await writer.write(encoder.encode(`data: ${JSON.stringify({ error: `Fatal Error: ${err.message}` })}\n\n`));
            } finally {
                await writer.close();
            }
        })();

        return new Response(readable, {
            headers: {
                ...corsHeaders,
                ...SECURITY_HEADERS,
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Connection': 'keep-alive',
                'X-RateLimit-Remaining': String(rateResult.remaining),
            },
        });
    },
};

// ─── Groq API Caller ─────────────────────────────────────────────────────────
async function callGroq(apiKey, model, systemPrompt, userPrompt) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const errText = await response.text();
        let errMsg = errText;
        try {
            const errJson = JSON.parse(errText);
            errMsg = errJson.error?.message || errText;
        } catch (_) { /* ignore parse failure */ }
        throw new Error(`Groq API Error: ${errMsg}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    try {
        return JSON.parse(content);
    } catch (parseErr) {
        // Handle potential markdown code blocks in response
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[1] || jsonMatch[0]);
        }
        throw parseErr;
    }
}
