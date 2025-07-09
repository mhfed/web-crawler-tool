// Background script for Web Crawler Extension

chrome.runtime.onInstalled.addListener(() => {
    console.log('Web Crawler Extension installed');
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'crawlPage') {
        // Handle crawl requests
        crawlPageInBackground(request.url)
            .then(result => sendResponse({ success: true, data: result }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Will respond asynchronously
    }
});

async function crawlPageInBackground(url) {
    try {
        // Create a new tab for crawling
        const tab = await chrome.tabs.create({ url, active: false });
        
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                chrome.tabs.remove(tab.id);
                reject(new Error('Crawl timeout'));
            }, 15000);
            
            chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
                if (tabId === tab.id && changeInfo.status === 'complete') {
                    chrome.tabs.onUpdated.removeListener(listener);
                    clearTimeout(timeout);
                    
                    // Extract data from the page
                    chrome.scripting.executeScript({
                        target: { tabId },
                        function: extractPageData
                    }, (results) => {
                        chrome.tabs.remove(tab.id);
                        
                        if (chrome.runtime.lastError) {
                            reject(new Error(chrome.runtime.lastError.message));
                        } else {
                            resolve(results[0].result);
                        }
                    });
                }
            });
        });
    } catch (error) {
        throw new Error(`Failed to crawl ${url}: ${error.message}`);
    }
}

function extractPageData() {
    // This function is injected into the target page
    const title = document.querySelector('title')?.textContent?.trim() || '';
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const keywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
    
    // Get clean text content
    const bodyClone = document.body.cloneNode(true);
    bodyClone.querySelectorAll('script, style, nav, footer, header').forEach(el => el.remove());
    const text = bodyClone.textContent?.replace(/\s+/g, ' ')?.trim()?.substring(0, 5000) || '';
    
    // Extract links
    const links = Array.from(document.querySelectorAll('a[href]'))
        .slice(0, 20)
        .map(a => ({
            href: a.getAttribute('href'),
            text: a.textContent?.trim() || ''
        }))
        .filter(link => link.href && link.text);
    
    // Extract images
    const images = Array.from(document.querySelectorAll('img[src]'))
        .slice(0, 10)
        .map(img => ({
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt') || ''
        }))
        .filter(img => img.src);
    
    return {
        url: window.location.href,
        title,
        description,
        keywords,
        text,
        links,
        images,
        crawledAt: new Date().toISOString()
    };
} 