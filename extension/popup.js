let crawlResults = [];

document.addEventListener('DOMContentLoaded', async function() {
    // Get current tab URL
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    document.getElementById('currentUrl').textContent = tab.url;
    
    // Load saved results
    const saved = await chrome.storage.local.get(['crawlResults']);
    if (saved.crawlResults) {
        crawlResults = saved.crawlResults;
        displayResults();
        showDownloadSection();
    }
    
    // Event listeners
    document.getElementById('crawlCurrent').addEventListener('click', crawlCurrentPage);
    document.getElementById('crawlBulk').addEventListener('click', crawlBulkUrls);
    document.getElementById('downloadJson').addEventListener('click', () => downloadFile('json'));
    document.getElementById('downloadCsv').addEventListener('click', () => downloadFile('csv'));
});

async function crawlCurrentPage() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    showStatus('📡 Đang crawl trang hiện tại...', 'loading');
    
    try {
        const result = await crawlPage(tab.url);
        crawlResults = [result];
        await chrome.storage.local.set({ crawlResults });
        
        showStatus('✅ Crawl thành công!', 'success');
        displayResults();
        showDownloadSection();
    } catch (error) {
        showStatus(`❌ Lỗi: ${error.message}`, 'error');
    }
}

async function crawlBulkUrls() {
    const urlsText = document.getElementById('bulkUrls').value.trim();
    if (!urlsText) {
        showStatus('❌ Vui lòng nhập URLs!', 'error');
        return;
    }
    
    const urls = urlsText.split('\n')
        .map(url => url.trim())
        .filter(url => url && isValidUrl(url));
        
    if (urls.length === 0) {
        showStatus('❌ Không tìm thấy URLs hợp lệ!', 'error');
        return;
    }
    
    showStatus(`🚀 Đang crawl ${urls.length} trang...`, 'loading');
    crawlResults = [];
    
    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        showStatus(`📡 Crawl ${i + 1}/${urls.length}: ${url}`, 'loading');
        
        try {
            const result = await crawlPage(url);
            crawlResults.push(result);
        } catch (error) {
            crawlResults.push({
                url,
                error: error.message,
                crawledAt: new Date().toISOString()
            });
        }
        
        // Delay to avoid overwhelming servers
        if (i < urls.length - 1) {
            await sleep(1000);
        }
    }
    
    await chrome.storage.local.set({ crawlResults });
    showStatus(`✅ Hoàn thành! Crawl ${crawlResults.length} trang.`, 'success');
    displayResults();
    showDownloadSection();
}

async function crawlPage(url) {
    // Create a new tab to crawl the page
    const tab = await chrome.tabs.create({ url, active: false });
    
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            chrome.tabs.remove(tab.id);
            reject(new Error('Timeout'));
        }, 15000);
        
        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
            if (tabId === tab.id && changeInfo.status === 'complete') {
                chrome.tabs.onUpdated.removeListener(listener);
                clearTimeout(timeout);
                
                // Execute content script to extract data
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
}

// This function will be injected into the page
function extractPageData() {
    const title = document.querySelector('title')?.textContent?.trim() || '';
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const keywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
    
    // Remove script and style tags for clean text
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

function displayResults() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    
    crawlResults.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        if (result.error) {
            resultItem.innerHTML = `
                <div class="result-url">❌ ${result.url}</div>
                <div class="result-meta">Lỗi: ${result.error}</div>
            `;
        } else {
            resultItem.innerHTML = `
                <div class="result-url">✅ ${result.url}</div>
                <div class="result-title">${result.title || 'Không có tiêu đề'}</div>
                <div class="result-meta">
                    ${result.links?.length || 0} links, ${result.images?.length || 0} images
                </div>
            `;
        }
        
        resultsDiv.appendChild(resultItem);
    });
}

function showDownloadSection() {
    document.getElementById('downloadSection').classList.remove('hidden');
}

function downloadFile(format) {
    let content, filename, mimeType;
    
    if (format === 'json') {
        content = JSON.stringify(crawlResults, null, 2);
        filename = 'crawl_results.json';
        mimeType = 'application/json';
    } else if (format === 'csv') {
        content = convertToCSV(crawlResults);
        filename = 'crawl_results.csv';
        mimeType = 'text/csv';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
        url,
        filename,
        saveAs: true
    }, () => {
        URL.revokeObjectURL(url);
    });
}

function convertToCSV(data) {
    if (!data.length) return '';
    
    const headers = ['url', 'title', 'description', 'keywords', 'text', 'links_count', 'images_count', 'error', 'crawledAt'];
    const csvContent = [
        headers.join(','),
        ...data.map(row => [
            `"${row.url || ''}"`,
            `"${(row.title || '').replace(/"/g, '""')}"`,
            `"${(row.description || '').replace(/"/g, '""')}"`,
            `"${(row.keywords || '').replace(/"/g, '""')}"`,
            `"${(row.text || '').replace(/"/g, '""').substring(0, 1000)}"`,
            row.links?.length || 0,
            row.images?.length || 0,
            `"${row.error || ''}"`,
            `"${row.crawledAt || ''}"`
        ].join(','))
    ].join('\n');
    
    return csvContent;
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.classList.remove('hidden');
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
} 