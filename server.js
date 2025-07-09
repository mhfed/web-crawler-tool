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
        const { 
            url, 
            maxText = 5000, 
            maxLinks = 20, 
            maxImages = 10,
            includeHeadings = false,
            includeMetaTags = false,
            includeStructure = false,
            unlimited = false
        } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        
        const mode = unlimited ? 'Unlimited' : 'Limited';
        console.log(`🕷️ Crawling (${mode}): ${url}`);
        
        // Fetch the page with higher timeout for unlimited mode
        const { data } = await axios.get(url, {
            timeout: unlimited ? 30000 : 15000,
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
        const fullText = $('body').text().replace(/\s+/g, ' ').trim();
        const text = (maxText === 0 || unlimited) ? fullText : fullText.substring(0, maxText);
        
        // Extract links
        const links = [];
        $('a[href]').each((i, el) => {
            // Stop if we have enough links in limited mode
            if (!unlimited && maxLinks > 0 && links.length >= maxLinks) {
                return false; // Break out of each loop
            }
            
            const href = $(el).attr('href');
            const linkText = $(el).text().trim();
            
            // Only add valid links with both href and text
            if (href && linkText && href.length > 0 && linkText.length > 0) {
                links.push({ href, text: linkText });
            }
        });
        
        // Extract images
        const images = [];
        $('img[src]').each((i, el) => {
            // Stop if we have enough images in limited mode
            if (!unlimited && maxImages > 0 && images.length >= maxImages) {
                return false; // Break out of each loop
            }
            
            const src = $(el).attr('src');
            const alt = $(el).attr('alt') || '';
            
            // Only add valid images with src
            if (src && src.length > 0) {
                images.push({ src, alt });
            }
        });
        
        // Extract additional data for unlimited mode
        let extraData = {};
        
        if (unlimited || includeHeadings) {
            extraData.headings = [];
            $('h1, h2, h3, h4, h5, h6').each((i, el) => {
                const level = $(el).prop('tagName');
                const headingText = $(el).text().trim();
                if (headingText) {
                    extraData.headings.push({ level, text: headingText });
                }
            });
        }
        
        if (unlimited || includeMetaTags) {
            extraData.metaTags = [];
            $('meta').each((i, el) => {
                const name = $(el).attr('name') || $(el).attr('property') || '';
                const content = $(el).attr('content') || '';
                if (name && content) {
                    extraData.metaTags.push({ name, content });
                }
            });
        }
        
        if (unlimited || includeStructure) {
            extraData.structure = {
                totalElements: $('*').length,
                forms: $('form').length,
                tables: $('table').length,
                videos: $('video').length,
                iframes: $('iframe').length,
                buttons: $('button').length,
                inputs: $('input').length
            };
        }
        
        const result = {
            url,
            title,
            description,
            keywords,
            text,
            textLength: text.length,
            links,
            linksCount: links.length,
            images,
            imagesCount: images.length,
            ...extraData,
            crawlMode: unlimited ? 'unlimited' : 'limited',
            crawledAt: new Date().toISOString()
        };
        
        // Debug logs
        console.log(`✅ Successfully crawled: ${url}`);
        console.log(`📊 Results: ${text.length} chars, ${links.length} links, ${images.length} images`);
        if (extraData.headings) {
            console.log(`📑 Found ${extraData.headings.length} headings`);
        }
        
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