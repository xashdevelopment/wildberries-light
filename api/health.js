/**
 * Vercel Serverless Function - Health Check
 * 
 * Simple endpoint to verify the API is running
 * 
 * Endpoint: GET /api/health
 */

export default function handler(req, res) {
    res.status(200).json({
        status: 'ok',
        service: 'wildberries-proxy',
        version: '1.0.0',
        environment: process.env.VERCEL_ENV || 'development',
        timestamp: new Date().toISOString(),
        uptime: process.uptime ? Math.floor(process.uptime()) : null
    });
}
