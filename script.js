(function () {
    const root = document.getElementById('ml-tool-content-optimizer');
    if (!root) return;

    // ─── Configuration ───────────────────────────────────────────────────────────
    const MAX_QUERY_LENGTH = 500;
    const MAX_CONTENT_LENGTH = 10000;
    const TOTAL_ROUNDS = 20;

    // ─── DOM Elements ────────────────────────────────────────────────────────────
    const form = root.querySelector('#ml-optimizer-form');
    const resultsSection = root.querySelector('#ml-results-section');
    const winnerAnnouncement = root.querySelector('#ml-winner-announcement');
    const confidenceLevel = root.querySelector('#ml-confidence-level');
    const progressBar = root.querySelector('#ml-progress-bar');
    const progressText = root.querySelector('#ml-progress-text');
    const scoreAEl = root.querySelector('#ml-score-a');
    const scoreBEl = root.querySelector('#ml-score-b');
    const barA = root.querySelector('#ml-bar-a');
    const barB = root.querySelector('#ml-bar-b');
    const roundsList = root.querySelector('#ml-rounds-list');
    const summaryExplanation = root.querySelector('#ml-summary-explanation');
    const submitBtn = root.querySelector('#ml-submit-btn');
    const resetBtn = root.querySelector('#ml-reset-btn');
    const formError = root.querySelector('#ml-form-error');
    const breakdownToggle = root.querySelector('#ml-breakdown-toggle');

    let isProcessing = false;

    // ─── Event Listeners ─────────────────────────────────────────────────────────

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (isProcessing) return;

        formError.classList.add('ml-tool-hidden');

        const formData = new FormData(form);
        const query = (formData.get('query') || '').trim();
        const optionA = (formData.get('optionA') || '').trim();
        const optionB = (formData.get('optionB') || '').trim();
        const model = formData.get('model');

        // Validation
        if (!query || !optionA || !optionB) {
            showError('All fields are required.');
            return;
        }

        if (optionA === optionB) {
            showError('Options are identical — please provide distinct content.');
            return;
        }

        if (optionA.length < 10 || optionB.length < 10) {
            showError('Options must be at least 10 characters long.');
            return;
        }

        if (query.length > MAX_QUERY_LENGTH || optionA.length > MAX_CONTENT_LENGTH || optionB.length > MAX_CONTENT_LENGTH) {
            showError('One or more fields exceed the character limit.');
            return;
        }

        prepareUI();
        await runOptimizer({ query, optionA, optionB, model, rounds: TOTAL_ROUNDS });
    });

    resetBtn.addEventListener('click', () => {
        if (isProcessing) return;
        form.reset();
        resultsSection.classList.add('ml-tool-hidden');
        formError.classList.add('ml-tool-hidden');
        root.scrollIntoView({ behavior: 'smooth' });
    });

    breakdownToggle.addEventListener('click', () => {
        const isHidden = roundsList.classList.toggle('ml-tool-hidden');
        const icon = breakdownToggle.querySelector('svg');
        if (icon) icon.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
    });

    // ─── Core Logic ──────────────────────────────────────────────────────────────

    async function runOptimizer(data) {
        isProcessing = true;
        let scoreA = 0;
        let scoreB = 0;
        let roundsCompleted = 0;

        try {
            const API_URL = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
                ? `http://localhost:8787/api/content-optimizer`
                : '/api/content-optimizer';

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Server error: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop();

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const payload = line.replace('data: ', '').trim();
                        if (payload === '[DONE]') {
                            finalizeResults(scoreA, scoreB, TOTAL_ROUNDS);
                            continue;
                        }

                        try {
                            const payloadData = JSON.parse(payload);
                            if (payloadData.type === 'synthesis') {
                                displaySynthesis(payloadData);
                            } else {
                                roundsCompleted++;
                                if (payloadData.winner === 'A') scoreA++;
                                else if (payloadData.winner === 'B') scoreB++;
                                updateRoundUI(payloadData, roundsCompleted, scoreA, scoreB);
                            }
                        } catch (err) {
                            console.error('Error parsing SSE payload:', err);
                        }
                    }
                }
            }
        } catch (error) {
            handleRunError(error);
        } finally {
            isProcessing = false;
            submitBtn.disabled = false;
            submitBtn.classList.remove('ml-tool-loading');
            submitBtn.querySelector('.ml-tool-btn-text').textContent = 'Run A/B Test';
        }
    }

    // ─── UI Helpers ────────────────────────────────────────────────────────────

    function prepareUI() {
        resultsSection.classList.remove('ml-tool-hidden');
        winnerAnnouncement.textContent = 'Comparing Variations...';
        confidenceLevel.textContent = 'Confidence: calculating...';
        progressBar.style.width = '0%';
        progressText.textContent = 'Initializing AI engine...';
        
        // Reset scores with animation support
        scoreAEl.textContent = '0';
        scoreBEl.textContent = '0';
        barA.style.width = '50%';
        barB.style.width = '50%';
        roundsList.innerHTML = '';
        summaryExplanation.innerHTML = '';

        submitBtn.disabled = true;
        submitBtn.classList.add('ml-tool-loading');
        submitBtn.querySelector('.ml-tool-btn-text').textContent = 'Analyzing...';
        
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function updateRoundUI(result, count, a, b) {
        const progress = (count / TOTAL_ROUNDS) * 100;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `Completed round ${count} of ${TOTAL_ROUNDS}...`;

        // Smooth number update
        animateValue(scoreAEl, parseInt(scoreAEl.textContent), a, 400);
        animateValue(scoreBEl, parseInt(scoreBEl.textContent), b, 400);

        const totalWins = (a + b) || 1;
        const percentA = (a / totalWins) * 100;
        barA.style.width = `${percentA}%`;
        barB.style.width = `${100 - percentA}%`;

        const roundEl = document.createElement('div');
        roundEl.className = 'ml-tool-round-item';
        roundEl.style.animation = 'ml-tool-fade-in 0.4s ease-out forwards';
        roundEl.innerHTML = `
            <div class="ml-tool-round-winner ${result.winner === 'A' ? 'ml-tool-winner-a' : 'ml-tool-winner-b'}">
                Round ${count}: Option ${escapeHtml(result.winner)} wins
            </div>
            <div class="ml-tool-round-reason">${escapeHtml(result.reason)}</div>
        `;
        roundsList.appendChild(roundEl);
    }

    function displaySynthesis(data) {
        summaryExplanation.innerHTML = `
            <strong>Expert Analysis:</strong><br>
            ${data.synthesis}
        `;
    }

    function finalizeResults(a, b, total) {
        const winner = a > b ? 'A' : (b > a ? 'B' : 'Tie');
        if (winner === 'Tie') {
            winnerAnnouncement.textContent = "Result: Statistical Tie";
        } else {
            winnerAnnouncement.textContent = `Variation ${winner} leads the comparison`;
        }

        const confidence = Math.abs(a - b) / total;
        let confidenceStr = 'Low Confidence';
        if (confidence >= 0.85) confidenceStr = 'High Confidence (85%+)';
        else if (confidence >= 0.65) confidenceStr = 'Medium Confidence (65%+)';
        
        confidenceLevel.textContent = `Confidence: ${confidenceStr}`;
    }

    function handleRunError(error) {
        winnerAnnouncement.textContent = 'Analysis interrupted';
        progressText.textContent = error.message;
        summaryExplanation.innerHTML = `<p style="color: var(--error-red);">${escapeHtml(error.message)}</p>`;
    }

    function showError(message) {
        formError.textContent = message;
        formError.classList.remove('ml-tool-hidden');
        formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function animateValue(obj, start, end, duration) {
        if (start === end) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    function escapeHtml(str) {
        if (typeof str !== 'string') return '';
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return str.replace(/[&<>"']/g, c => map[c]);
    }
})();
