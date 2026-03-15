# AI Content Optimizer (A/B Tester)
**Public URL:** [www.maximuslabs.ai/tools/ai-content-optimizer](https://www.maximuslabs.ai/tools/ai-content-optimizer)


This tool A/B tests your content for AI search engines (GEO) using real LLMs to evaluate effectiveness.

## Prerequisites
- **Node.js**: Ensure you have Node.js (v18+) installed.
- **Groq API Key**: A valid key is required for evaluation. This should be placed in `.dev.vars`.

## Setup Instructions

1. **Install Dependencies**:
   Open your terminal in this directory and run:
   ```bash
   npm install
   ```

2. **Configure API Key**:
   Create or update [.dev.vars](file:///c:/Users/user/V1%20AI%20Content%20Optimizer%20%28AB%20Tester%29/.dev.vars) in the root directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

3. **Run Locally**:
   Start the local server (ports 8787 by default):
   ```bash
   npm start
   ```

4. **Access the Tool**:
   Open your browser and navigate to:
   [http://127.0.0.1:8787](http://127.0.0.1:8787)

   The server handles both the API logic and serving the user interface (`index.html`).

## Troubleshooting
- **Port Conflict**: If port 8787 is already in use, you will see an `EADDRINUSE` error. You can kill the existing process or set a different port via environment variables: `PORT=9000 npm start`.
- **API Key Errors**: Ensure your `.dev.vars` file is correctly formatted with your Groq API key.
- **Failed to Fetch**: Ensure the server is running and you are accessing it via the provided local URL.
