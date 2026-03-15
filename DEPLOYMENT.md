# Production Deployment Guide

Follow these steps to deploy the AI Content Optimizer to Cloudflare Workers for public usage.

## 1. Prerequisites
- [Cloudflare Account](https://dash.cloudflare.com/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed and authenticated (`npx wrangler login`)

## 2. Secrets & Environment Variables

### GROQ_API_KEY (Required)
Do **NOT** add your API key to `wrangler.toml`. Use Cloudflare Secrets instead:
```bash
npx wrangler secret put GROQ_API_KEY
```
*When prompted, paste your Groq API key.*

### ALLOWED_ORIGINS (Highly Recommended)
To prevent other websites from using your backend, restrict CORS to your frontend domain:
```bash
npx wrangler secret put ALLOWED_ORIGINS
```
*Enter your production URL (e.g., `https://your-app.pages.dev`). For multiple domains, use a comma-separated list.*

## 3. Deployment
Run the following command to deploy the worker:
```bash
npx wrangler deploy
```

## 4. Security Checklist
- [x] **Rate Limiting**: Enabled (5 requests per minute per IP).
- [x] **Input Validation**: Hard caps on message length (500 chars for query, 10,000 for content).
- [x] **CORS restricted**: Use `ALLOWED_ORIGINS` secret.
- [x] **Security Headers**: X-Frame-Options (DENY), X-Content-Type-Options (nosniff), and Referrer-Policy are automatically managed by the backend.
- [x] **Model Mapping**: Frontend engine selector is now mapped to backend model IDs.

## 5. Local Testing
If you want to run the full stack locally (including the frontend), simply run:
```bash
node server.js
```
The app will be available at `http://127.0.0.1:8787`.
