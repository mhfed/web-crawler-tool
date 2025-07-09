// Content script for Web Crawler Extension
// This script runs on every webpage and can communicate with the popup

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractData') {
        try {
            const data = extractCurrentPageData();
            sendResponse({ success: true, data });
        } catch (error) {
            sendResponse({ success: false, error: error.message });
        }
    }
});

function extractCurrentPageData() {
    // Extract page data from current page
    const title = document.querySelector('title')?.textContent?.trim() || '';
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const keywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
    
    // Get clean text content
    const bodyClone = document.body.cloneNode(true);
    bodyClone.querySelectorAll('script, style, nav, footer, header, .ads, .advertisement').forEach(el => el.remove());
    const text = bodyClone.textContent?.replace(/\s+/g, ' ')?.trim()?.substring(0, 5000) || '';
    
    // Extract links
    const links = Array.from(document.querySelectorAll('a[href]'))
        .slice(0, 20)
        .map(a => {
            const href = a.getAttribute('href');
            const text = a.textContent?.trim() || '';
            
            // Convert relative URLs to absolute
            let fullUrl = href;
            if (href && !href.startsWith('http') && !href.startsWith('//')) {
                try {
                    fullUrl = new URL(href, window.location.origin).href;
                } catch (e) {
                    fullUrl = href;
                }
            }
            
            return { href: fullUrl, text };
        })
        .filter(link => link.href && link.text && !link.href.startsWith('javascript:'));
    
    // Extract images
    const images = Array.from(document.querySelectorAll('img[src]'))
        .slice(0, 10)
        .map(img => {
            const src = img.getAttribute('src');
            const alt = img.getAttribute('alt') || '';
            
            // Convert relative URLs to absolute
            let fullSrc = src;
            if (src && !src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:')) {
                try {
                    fullSrc = new URL(src, window.location.origin).href;
                } catch (e) {
                    fullSrc = src;
                }
            }
            
            return { src: fullSrc, alt };
        })
        .filter(img => img.src);
    
    // Extract headings for better content structure
    const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
        .slice(0, 10)
        .map(h => h.textContent?.trim())
        .filter(text => text);
    
    return {
        url: window.location.href,
        title,
        description,
        keywords,
        text,
        links,
        images,
        headings,
        crawledAt: new Date().toISOString()
    };
}

// Add a subtle indicator that the extension is active (optional)
console.log('🕷️ Web Crawler Extension loaded on:', window.location.href); 