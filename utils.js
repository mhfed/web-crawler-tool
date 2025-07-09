import fs from "fs";
import path from "path";

// Hàm để validate URL
export function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Hàm để normalize URL
export function normalizeUrl(url, baseUrl) {
  try {
    return new URL(url, baseUrl).href;
  } catch (_) {
    return null;
  }
}

// Hàm để tạo tên file an toàn từ URL
export function createSafeFileName(url) {
  return url
    .replace(/https?:\/\//, '')
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .substring(0, 50);
}

// Hàm để đọc URLs từ file text
export function readUrlsFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#') && isValidUrl(line));
  } catch (error) {
    console.error(`Lỗi đọc file URLs: ${error.message}`);
    return [];
  }
}

// Hàm để lưu dữ liệu crawl với format khác nhau
export function saveDataInMultipleFormats(data, outputDir, baseName) {
  const formats = {
    json: () => JSON.stringify(data, null, 2),
    csv: () => {
      if (!Array.isArray(data) || data.length === 0) return '';
      
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(item => 
        Object.values(item).map(value => 
          typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        ).join(',')
      );
      
      return [headers, ...rows].join('\n');
    }
  };

  Object.entries(formats).forEach(([format, converter]) => {
    try {
      const fileName = `${baseName}.${format}`;
      const filePath = path.join(outputDir, fileName);
      fs.writeFileSync(filePath, converter(), 'utf8');
      console.log(`📄 Đã lưu ${format.toUpperCase()}: ${filePath}`);
    } catch (error) {
      console.error(`Lỗi lưu ${format}: ${error.message}`);
    }
  });
}

// Hàm để tạo báo cáo HTML
export function generateHtmlReport(pages, outputDir) {
  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Báo cáo Crawler</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .page { border: 1px solid #ccc; margin: 20px 0; padding: 15px; border-radius: 5px; }
        .error { background-color: #ffe6e6; }
        .success { background-color: #e6ffe6; }
        .url { font-weight: bold; color: #0066cc; }
        .title { font-size: 18px; margin: 10px 0; }
        .meta { color: #666; font-size: 14px; }
        .text { margin: 10px 0; max-height: 200px; overflow-y: auto; }
        .links, .images { margin: 10px 0; }
        .summary { background: #f0f0f0; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>Báo cáo Crawler</h1>
    
    <div class="summary">
        <h2>Tóm tắt</h2>
        <p><strong>Tổng số trang:</strong> ${pages.length}</p>
        <p><strong>Thành công:</strong> ${pages.filter(p => !p.error).length}</p>
        <p><strong>Lỗi:</strong> ${pages.filter(p => p.error).length}</p>
        <p><strong>Thời gian crawl:</strong> ${new Date().toLocaleString('vi-VN')}</p>
    </div>

    ${pages.map(page => `
        <div class="page ${page.error ? 'error' : 'success'}">
            <div class="url">${page.url}</div>
            
            ${page.error ? `
                <div style="color: red;"><strong>Lỗi:</strong> ${page.error}</div>
            ` : `
                <div class="title">${page.title || 'Không có tiêu đề'}</div>
                <div class="meta">
                    ${page.description ? `<p><strong>Mô tả:</strong> ${page.description}</p>` : ''}
                    ${page.keywords ? `<p><strong>Keywords:</strong> ${page.keywords}</p>` : ''}
                </div>
                <div class="text">
                    <strong>Nội dung:</strong><br>
                    ${page.text ? page.text.substring(0, 500) + (page.text.length > 500 ? '...' : '') : 'Không có nội dung'}
                </div>
                ${page.links && page.links.length > 0 ? `
                    <div class="links">
                        <strong>Links (${page.links.length}):</strong>
                        <ul>
                            ${page.links.slice(0, 5).map(link => `<li><a href="${link.href}">${link.text}</a></li>`).join('')}
                            ${page.links.length > 5 ? '<li>...</li>' : ''}
                        </ul>
                    </div>
                ` : ''}
                ${page.images && page.images.length > 0 ? `
                    <div class="images">
                        <strong>Hình ảnh (${page.images.length}):</strong>
                        <ul>
                            ${page.images.slice(0, 3).map(img => `<li>${img.src} ${img.alt ? `(${img.alt})` : ''}</li>`).join('')}
                            ${page.images.length > 3 ? '<li>...</li>' : ''}
                        </ul>
                    </div>
                ` : ''}
            `}
            
            <div class="meta">
                <small>Crawled at: ${page.crawledAt}</small>
            </div>
        </div>
    `).join('')}
</body>
</html>`;

  const reportPath = path.join(outputDir, 'crawl_report.html');
  fs.writeFileSync(reportPath, html, 'utf8');
  console.log(`📋 Báo cáo HTML: ${reportPath}`);
} 