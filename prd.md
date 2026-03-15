Tool 2: AI Content Optimizer (A/B Tester)
2.1 Overview
Tool Name: AI Content Optimizer
Purpose: A/B test two content variations to see which one an LLM prefers to cite for a given search query. Simulates AI search engine citation behavior over multiple rounds with randomized ordering to eliminate position bias.
Use Case: SEOs optimizing meta descriptions, page titles, content snippets, or full paragraphs for AI search citation. Marketers comparing different copy approaches for AEO effectiveness.
Complexity: MEDIUM-HIGH - Requires LLM API calls, multiple rounds, position-bias randomization, statistical logic, and real-time progress updates via SSE.

2.2 UI Specification
2.2.1 Page Layout
•	Page Header: "AI Content Optimizer"
•	Subtitle: "A/B test your content for AI SEO. Discover which copy AI search engines prefer."

2.2.2 Input Section
The following form fields should be presented in a clean, vertical layout:
10.	Text Input: "What are you trying to optimize for?" - placeholder: "eg. Best corporate card for startups"
11.	Dropdown: "AI Search Engine" - options: "OpenAI ChatGPT" (default), "Google Gemini", "Anthropic Claude", "Perplexity"
12.	Textarea A: "Option A" - large textarea with placeholder showing example content
13.	Textarea B: "Option B" - large textarea with placeholder showing example content
14.	Primary CTA Button: "A/B Test Variations ->"

2.2.3 Loading State
•	Progress bar showing "Running round X of 20..."
•	Each completed round updates in real-time via Server-Sent Events (SSE)
•	Show the running score (e.g., A: 5 | B: 3) as rounds complete

2.2.4 Output Section
•	Winner Announcement: "Option A won 17 of 20 rounds" with a visual bar chart (horizontal stacked bar showing A vs B wins)
•	Confidence Level: Displayed as "High Confidence (85%)" / "Medium Confidence (65%)" / "Low Confidence (<60%)"
•	Round-by-Round Breakdown: Expandable/collapsible section showing each round's winner and the LLM's reasoning
•	Summary Explanation: A synthesized paragraph explaining why the winner was preferred across rounds

2.3 Complete Backend Logic
2.3.1 API Endpoint
Endpoint: POST /api/content-optimizer
Response Type: text/event-stream (Server-Sent Events for real-time updates)

2.3.2 Request Body
{
  "query": "best corporate card for startups",
  "model": "openai",
  "optionA": "Make expense management easy with Brex...",
  "optionB": "Simplify expense management with Ramp...",
  "rounds": 20
}

2.3.3 Core Algorithm
async function runABTest(query, optionA, optionB, model, rounds = 20) {
  const results = [];
  
  for (let i = 0; i < rounds; i++) {
    // CRITICAL: Randomize order each round to eliminate position bias
    const isAFirst = Math.random() > 0.5;
    const first = isAFirst ? optionA : optionB;
    const second = isAFirst ? optionB : optionA;
    const firstLabel = isAFirst ? 'A' : 'B';
    const secondLabel = isAFirst ? 'B' : 'A';
    
    const userPrompt = `A user searches: "${query}"
 
You find two potential sources to cite in your response:
 
--- OPTION ${firstLabel} ---
${first}
--- END OPTION ${firstLabel} ---
 
--- OPTION ${secondLabel} ---
${second}
--- END OPTION ${secondLabel} ---
 
Which option would you cite in your response to the user?
Consider: Relevance, Clarity, Specificity, Trustworthiness, User Intent.
 
Respond with ONLY a JSON object:
{"winner": "A" or "B", "reason": "brief explanation"}`;
 
    const response = await callLLMAPI(model, SYSTEM_PROMPT, userPrompt);
    const parsed = JSON.parse(response);
    
    results.push({
      round: i + 1,
      winner: parsed.winner,
      reason: parsed.reason,
      orderWasSwapped: !isAFirst
    });
    
    // Send SSE update after each round
    sendSSE({ type: 'round_complete', data: results[results.length - 1] });
  }
  
  const aWins = results.filter(r => r.winner === 'A').length;
  const bWins = results.filter(r => r.winner === 'B').length;
  
  return {
    winner: aWins > bWins ? 'A' : 'B',
    scoreA: aWins,
    scoreB: bWins,
    totalRounds: rounds,
    confidence: Math.abs(aWins - bWins) / rounds,
    rounds: results
  };
}

2.3.4 SSE (Server-Sent Events) Implementation
Use Server-Sent Events to stream round-by-round results to the frontend in real-time:
// Cloudflare Worker SSE pattern
export default {
  async fetch(request, env) {
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();
    
    // Start processing in background
    (async () => {
      try {
        const body = await request.json();
        for (let i = 0; i < body.rounds; i++) {
          const roundResult = await runSingleRound(body, i);
          await writer.write(
            encoder.encode(`data: ${JSON.stringify(roundResult)}\n\n`)
          );
        }
        await writer.write(encoder.encode(`data: [DONE]\n\n`));
      } finally {
        await writer.close();
      }
    })();
    
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        ...corsHeaders,
      },
    });
  }
};

2.4 System Prompt
The following system prompt is sent to the LLM for each round of the A/B test:
You are an AI search engine evaluating which search result to cite
in your response to a user's query. You are simulating the behavior
of a large language model that retrieves web results and must choose
which source to reference.
 
Your evaluation criteria:
1. RELEVANCE: How directly does the content address the user's query?
2. SPECIFICITY: Does it contain specific, useful details vs. generic claims?
3. CLARITY: Is the content well-written, clear, easy to extract info from?
4. AUTHORITY: Does the content signal expertise and trustworthiness?
5. CITATION-WORTHINESS: Would citing this content genuinely help the user?
 
Rules:
- You MUST pick exactly one winner. No ties.
- You must NOT be biased by the order in which options are presented.
- Evaluate based purely on content quality relative to the query.
- Respond ONLY with a JSON object:
  {"winner": "A" or "B", "reason": "one-sentence explanation"}

2.5 LLM API Recommendation
Recommended Model: OpenAI GPT-4o-mini
•	Cost: $0.15/1M input tokens, $0.60/1M output tokens
•	At 20 rounds per test, estimated cost: ~$0.01-0.02 per test
•	Fast enough for real-time round-by-round updates
•	Quality sufficient for preference comparison tasks
Alternative: If simulating a specific engine (e.g., Google Gemini), use that provider's API for more authentic simulation. However, GPT-4o-mini is the best cost/quality tradeoff for the general case.

2.6 API Infrastructure
•	Deployment: Cloudflare Worker or Vercel Edge Function
•	Rate Limit: 5 tests per IP per hour (to prevent API cost abuse)
•	Timeout: 60 seconds (allows for 20 sequential LLM calls)
•	Error Handling: If an individual round fails, retry once. If retry fails, skip that round and note it in results.
