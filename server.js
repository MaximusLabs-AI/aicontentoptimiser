import http from 'http';
import { TransformStream } from 'stream/web';
import worker from './worker.js';
import fs from 'fs';
import path from 'path';

// Load .dev.vars manually since it's not a standard .env
const devVarsPath = path.resolve('.dev.vars');
let vars = {};
try {
    vars = fs.readFileSync(devVarsPath, 'utf8')
        .split('\n')
        .reduce((acc, line) => {
            const [key, ...val] = line.split('=');
            if (key && val.length) acc[key.trim()] = val.join('=').trim().replace(/^["']|["']$/g, '');
            return acc;
        }, {});
} catch (err) {
    console.warn('⚠  Could not read .dev.vars — make sure the file exists and contains GROQ_API_KEY.');
}

// Serve static files for local dev
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

function serveStatic(req, res) {
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(process.cwd(), filePath);

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    try {
        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return false;
        const content = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
        return true;
    } catch {
        return false;
    }
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // Serve static assets for everything that isn't the API endpoint
    if (!url.pathname.startsWith('/api/')) {
        if (serveStatic(req, res)) return;
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
    }

    // ── API route ────────────────────────────────────────────────────────
    let body = null;
    if (req.method === 'POST') {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        body = Buffer.concat(chunks).toString();

        // Basic body size limit: 50 KB
        if (body.length > 50 * 1024) {
            res.writeHead(413, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Request body too large' }));
            return;
        }
    }

    const workerRequest = {
        method: req.method,
        headers: {
            get: (name) => req.headers[name.toLowerCase()],
        },
        url: url.toString(),
        json: async () => JSON.parse(body),
    };

    // Merge dev vars + process.env; also set ALLOWED_ORIGINS to permissive for local dev
    const env = { ALLOWED_ORIGINS: '*', ...vars, ...process.env };

    try {
        const response = await worker.fetch(workerRequest, env);

        // Copy headers from the worker response
        response.headers.forEach((value, key) => {
            res.setHeader(key, value);
        });

        res.statusCode = response.status || 200;

        if (response.body) {
            const reader = response.body.getReader();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(value);
            }
        }
        res.end();
    } catch (err) {
        console.error('Server Error:', err);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
    }
});

const PORT = process.env.PORT || 8787;
server.listen(PORT, '127.0.0.1', () => {
    console.log(`\n  🚀  Server running at  http://127.0.0.1:${PORT}\n`);
});
