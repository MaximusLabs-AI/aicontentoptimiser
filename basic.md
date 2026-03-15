Executive Summary
This Product Requirements Document (PRD) provides exhaustive specifications for building a suite of 8 Answer Engine Optimization (AEO) tools for Maximus Labs.

AEO (Answer Engine Optimization) is the practice of optimizing web content to be discovered, cited, and recommended by AI-powered search engines such as ChatGPT Search, Google AI Mode, Perplexity, and Claude.

The tools are designed to help SEOs, content marketers, and digital strategists optimize their content for this new paradigm of AI-driven search. Each tool targets a specific aspect of the AEO workflow — from content cleanup to crawlability analysis to competitive testing.

Target Audience
SEO professionals transitioning from traditional SEO to AEO

Content marketers producing AI-optimized content at scale

Digital agencies offering AEO services to clients

Founders and product teams building content strategies for AI visibility

Tech Stack Overview
Frontend: Webflow (existing site) with embedded custom HTML/CSS/JS blocks

Backend: Serverless functions on Cloudflare Workers (primary) or Vercel Edge Functions (fallback)

Database: Cloudflare D1 (SQLite) for the Prompts Explorer tool

LLM API: OpenAI — GPT-4o-mini for cost-sensitive tools, GPT-4o for quality-sensitive tools

Caching: Cloudflare Workers KV for rate limiting and response caching

