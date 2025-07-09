import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 2000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to crawl a page (bypass CORS)
app.post('/api/crawl', async (req, res) => {
    try {
        const { url, maxText = 5000, maxLinks = 20, maxImages = 10 } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        
        console.log(`🕷️ Crawling: ${url}`);
        
        // Fetch the page
        const { data } = await axios.get(url, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive'
            }
        });
        
        const $ = cheerio.load(data);
        
        // Extract data
        const title = $('title').text().trim();
        const description = $('meta[name="description"]').attr('content') || '';
        const keywords = $('meta[name="keywords"]').attr('content') || '';
        
        // Remove unwanted elements
        $('script, style, nav, footer, header').remove();
        const text = $('body').text().replace(/\s+/g, ' ').trim().substring(0, maxText);
        
        // Extract links
        const links = [];
        $('a[href]').each((i, el) => {
            if (links.length >= maxLinks) return false;
            const href = $(el).attr('href');
            const linkText = $(el).text().trim();
            if (href && linkText) {
                links.push({ href, text: linkText });
            }
        });
        
        // Extract images
        const images = [];
        $('img[src]').each((i, el) => {
            if (images.length >= maxImages) return false;
            const src = $(el).attr('src');
            const alt = $(el).attr('alt') || '';
            if (src) {
                images.push({ src, alt });
            }
        });
        
        const result = {
            url,
            title,
            description,
            keywords,
            text,
            links,
            images,
            crawledAt: new Date().toISOString()
        };
        
        console.log(`✅ Successfully crawled: ${url}`);
        res.json(result);
        
    } catch (error) {
        console.error(`❌ Error crawling: ${error.message}`);
        res.status(500).json({ 
            error: error.message,
            url: req.body.url,
            crawledAt: new Date().toISOString()
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Web Crawler Server đang chạy tại:`);
    console.log(`   Local: http://localhost:${PORT}`);
    console.log(`   Network: http://0.0.0.0:${PORT}`);
    console.log(`\n📱 Mở trình duyệt và truy cập địa chỉ trên để sử dụng!`);
}); 