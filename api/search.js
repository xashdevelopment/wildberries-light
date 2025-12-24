/**
 * Vercel Serverless Function - Wildberries API Proxy
 * 
 * This function proxies requests to the Wildberries search API,
 * bypassing CORS restrictions that prevent direct browser requests.
 * 
 * Endpoint: GET /api/search?query=<search_term>&resultset=catalog&dest=-1257784
 */

export default async function handler(req, res) {
    // ========================================
    // CORS Configuration
    // ========================================
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS preflight request for CORS
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // ========================================
    // Parse Query Parameters
    // ========================================
    const { query, resultset, dest } = req.query;

    // Validate required parameter
    if (!query) {
        res.status(400).json({
            error: 'Bad Request',
            message: 'Missing required parameter: query'
        });
        return;
    }

    // ========================================
    // Build Wildberries API URL
    // ========================================
    const apiParams = new URLSearchParams({
        query: query,
        resultset: resultset || 'catalog',
        dest: dest || '-1257784'
    });

    const wbApiUrl = `https://search.wb.ru/exactmatch/ru/common/v4/search?${apiParams.toString()}`;

    console.log(`[Search] Proxying request: ${wbApiUrl}`);

    try {
        // ========================================
        // Forward Request to Wildberries API
        // ========================================
        const response = await fetch(wbApiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
                'Origin': 'https://www.wildberries.ru',
                'Referer': 'https://www.wildberries.ru/'
            }
        });

        // Check for HTTP errors
        if (!response.ok) {
            console.error(`[Search] WB API error: ${response.status} ${response.statusText}`);
            res.status(response.status).json({
                error: 'Wildberries API Error',
                message: `API returned status ${response.status}`,
                details: response.statusText
            });
            return;
        }

        // Parse and forward response
        const data = await response.json();
        
        console.log(`[Search] Success - Products found: ${data.data?.products?.length || 0}`);
        
        // Forward the response with CORS headers
        res.status(200).json(data);

    } catch (error) {
        console.error(`[Search] Request failed: ${error.message}`);
        
        // Handle different error types
        if (error.name === 'AbortError') {
            res.status(504).json({
                error: 'Gateway Timeout',
                message: 'Wildberries API request timed out'
            });
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            res.status(502).json({
                error: 'Bad Gateway',
                message: 'Failed to connect to Wildberries API'
            });
        } else {
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to process request',
                details: error.message
            });
        }
    }
}
