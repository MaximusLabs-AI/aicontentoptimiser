# Production Deployment Guide

## Option 1: Render.com (Recommended for Node.js)

Follow these steps to deploy the AI Content Optimizer to Render.com.

### 1. Prepare Your Repository
1. Initialize a Git repository if you haven't already:
   ```bash
   git init
   git add .
   git commit -m "Initialize project"
   ```
2. Create a new repository on GitHub/GitLab/Bitbucket and push your code.

### 2. Create Render Web Service
1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Configure the service:
   - **Name**: `ai-content-optimizer`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click **Advanced** to add Environment Variables:
   - `GROQ_API_KEY`: Your secret API key from Groq.
   - `ALLOWED_ORIGINS`: `https://www.maximuslabs.ai` (or `*` if you want it accessible from anywhere).
   - `PORT`: `8787` (Render will automatically detect this, but you can set it explicitly).

### 3. Custom Domain & Path Configuration
The user wants the public URL to be: `www.maximuslabs.ai/tools/ai-content-optimizer`.

Since Render provides a URL like `https://ai-content-optimizer.onrender.com`, you have two ways to map it:

#### A. Reverse Proxy (Nginx / Cloudflare Workers) - Best for SEO
If your main site (`maximuslabs.ai`) is on another server, configure a reverse proxy:
- **Cloudflare Worker Example**:
  ```javascript
  async function handleRequest(request) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/tools/ai-content-optimizer')) {
      const targetPath = url.pathname.replace('/tools/ai-content-optimizer', '');
      const newUrl = new URL(targetPath, 'https://ai-content-optimizer.onrender.com');
      return fetch(new Request(newUrl, request));
    }
  }
  ```

#### B. Direct Custom Domain
1. In Render, go to **Settings** > **Custom Domains**.
2. Add `tools.maximuslabs.ai` or similar. Note: Mapping a sub-path like `/tools/...` directly to a different root service usually requires a reverse proxy as shown above.

---

## Option 2: Cloudflare Workers (Original)

### 1. Prerequisites
- [Cloudflare Account](https://dash.cloudflare.com/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed and authenticated (`npx wrangler login`)

### 2. Secrets & Environment Variables

#### GROQ_API_KEY (Required)
```bash
npx wrangler secret put GROQ_API_KEY
```

#### ALLOWED_ORIGINS (Highly Recommended)
```bash
npx wrangler secret put ALLOWED_ORIGINS
```

### 3. Deployment
```bash
npx wrangler deploy
```

---

## Security Checklist
- [x] **Rate Limiting**: Enabled (5 requests per minute per IP).
- [x] **Input Validation**: Hard caps on message length.
- [x] **CORS restricted**: Use `ALLOWED_ORIGINS` secret.
- [x] **Security Headers**: Managed by `worker.js`.

## Local Testing
```bash
npm start
```
The app will be available at `http://localhost:8787`.
