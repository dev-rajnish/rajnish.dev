import { createClient } from 'redis';

let redis;

(async () => {
    redis = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    // Connect to Redis and handle connection errors
    redis.on('error', (err) => console.error('Redis Client Error:', err));
    await redis.connect().catch(console.error);
})();

export default async function handler(req, res) {
    try {
        // Ensure Redis is connected
        if (!redis || !redis.isOpen) {
            await redis.connect();
        }

        // Check if it's a set request by matching "/set" in the query
        const isSetRequest = req.url.includes('/set');

        if (isSetRequest) {
            const queryParams = { ...req.query };
            const [[shortcode, encodedLongUrl]] = Object.entries(queryParams);
            if (!shortcode || !encodedLongUrl) {
                return res.status(400).json({
                    error: 'Invalid format',
                    usage: `Use: ${process.env.DOMAIN || `http://${req.headers.host}`}/api/redirects/set?yourshortcode=https://example.com`
                });
            }

            const longUrl = decodeURIComponent(encodedLongUrl);

            try {
                new URL(longUrl);
            } catch (e) {
                return res.status(400).json({
                    error: 'Invalid URL format',
                    provided: longUrl
                });
            }

            const exists = await redis.get(shortcode);
            if (exists) {
                return res.status(200).json({
                    message: 'Shortcode already exists',
                    shortcode,
                    originalUrl: exists,
                    shortUrl: `${process.env.DOMAIN || `http://${req.headers.host}`}/${shortcode}`
                });
            }

            await redis.set(shortcode, longUrl);
            return res.status(200).json({
                message: 'URL shortened successfully',
                shortcode,
                originalUrl: longUrl,
                shortUrl: `${process.env.DOMAIN || `http://${req.headers.host}`}/${shortcode}`
            });
        } else {
            const urlParts = req.url.split('/');
            const shortcode = urlParts[urlParts.length - 1];
            if (!shortcode || shortcode === 'redirects') {
                return res.status(400).json({
                    error: 'Shortcode required',
                    usage: {
                        create: `${process.env.DOMAIN || `http://${req.headers.host}`}/api/redirects/set?yourshortcode=https://example.com`,
                        access: `${process.env.DOMAIN || `http://${req.headers.host}`}/api/redirects/yourshortcode`
                    }
                });
            }

            const url = await redis.get(shortcode);
            if (!url) {
                return res.status(404).json({
                    error: 'URL not found',
                    shortcode
                });
            }

            return res.redirect(url);
        }
    } catch (error) {
        console.error('Redis error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const config = {
    api: {
        bodyParser: true,
    },
};
