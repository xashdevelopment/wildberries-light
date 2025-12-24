const http = require('http');
const https = require('https');
const url = require('url');

// Wildberries API configuration
const WB_API_BASE = 'https://search.wb.ru';
const WB_API_PATH = '/exactmatch/ru/common/v4/search';

// CORS headers for all responses
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
};

/**
 * Proxy server for Wildberries API
 * This server bypasses CORS restrictions by making requests server-side
 * and forwarding responses to the frontend
 */

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(204, corsHeaders);
        res.end();
        return;
    }

    // Route: /api/search - Product search
    if (parsedUrl.pathname === '/api/search' && req.method === 'GET') {
        handleSearchRequest(req, res, parsedUrl);
        return;
    }

    // Route: /api/health - Health check
    if (parsedUrl.pathname === '/api/health' && req.method === 'GET') {
        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({ status: 'ok', message: 'Wildberries Proxy Server is running' }));
        return;
    }

    // 404 for unknown routes
    res.writeHead(404, corsHeaders);
    res.end(JSON.stringify({ error: 'Not found' }));
});

/**
 * Handle product search requests
 * Forwards request to Wildberries API and returns response
 */
function handleSearchRequest(req, res, parsedUrl) {
    const query = parsedUrl.query.query || '';
    const resultset = parsedUrl.query.resultset || 'catalog';
    const dest = parsedUrl.query.dest || '-1257784';

    // Build the Wildberries API URL
    // The API expects parameters in a specific format
    const apiParams = new URLSearchParams({
        query: query,
        resultset: resultset,
        dest: dest
    });

    const apiUrl = `${WB_API_BASE}${WB_API_PATH}?${apiParams.toString()}`;

    console.log(`[Search] Proxying request: ${apiUrl}`);

    // Forward request to Wildberries API
    const apiReq = https.request(apiUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
            'Origin': 'https://www.wildberries.ru',
            'Referer': 'https://www.wildberries.ru/'
        },
        timeout: 10000 // 10 second timeout
    }, (apiRes) => {
        let data = '';

        // Collect response data
        apiRes.on('data', (chunk) => {
            data += chunk;
        });

        // Process complete response
        apiRes.on('end', () => {
            console.log(`[Search] API response status: ${apiRes.statusCode}`);

            // Forward the response with CORS headers
            res.writeHead(apiRes.statusCode, corsHeaders);
            res.end(data);
        });
    });

    // Handle API request errors
    apiReq.on('error', (error) => {
        console.error(`[Search] API request failed: ${error.message}`);
        res.writeHead(502, corsHeaders);
        res.end(JSON.stringify({
            error: 'Bad Gateway',
            message: 'Failed to connect to Wildberries API',
            details: error.message
        }));
    });

    // Handle timeout
    apiReq.on('timeout', () => {
        console.error('[Search] API request timed out');
        apiReq.destroy();
        res.writeHead(504, corsHeaders);
        res.end(JSON.stringify({
            error: 'Gateway Timeout',
            message: 'Wildberries API request timed out'
        }));
    });

    apiReq.end();
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('Wildberries Proxy Server Started');
    console.log('='.repeat(60));
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('');
    console.log('Available endpoints:');
    console.log(`  GET /api/search?query=<search_term>&resultset=catalog&dest=-1257784`);
    console.log(`  GET /api/health`);
    console.log('');
    console.log('Press Ctrl+C to stop');
    console.log('='.repeat(60));
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.close(() => {
        console.log('Server stopped');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\nShutting down server...');
    server.close(() => {
        console.log('Server stopped');
        process.exit(0);
    });
});
