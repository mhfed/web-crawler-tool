import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { crawlerConfig } from "./config.js";
import { generateHtmlReport, saveDataInMultipleFormats, readUrlsFromFile } from "./utils.js";

// Import hàm crawlPage từ crawler.js (copy lại để độc lập)
async function crawlPage(url) {
  try {
    console.log(`Đang crawl: ${url}`);
    
    const { data } = await axios.get(url, {
      timeout: crawlerConfig.settings.requestTimeout,
      headers: {
        'User-Agent': crawlerConfig.settings.userAgent
      }
    });
    
    const $ = cheerio.load(data);
    
    // Lấy thông tin cơ bản
    const title = $("title").text().trim();
    const description = $('meta[name="description"]').attr('content') || '';
    const keywords = $('meta[name="keywords"]').attr('content') || '';
    
    // Lấy nội dung text từ body, loại bỏ script và style
    $('script, style, nav, footer, header').remove();
    const text = $("body").text().replace(/\s+/g, " ").trim();
    
    // Lấy tất cả links
    const links = [];
    $('a[href]').each((i, el) => {
      const href = $(el).attr('href');
      const linkText = $(el).text().trim();
      if (href && linkText) {
        links.push({ href, text: linkText });
      }
    });
    
    // Lấy images
    const images = [];
    $('img[src]').each((i, el) => {
      const src = $(el).attr('src');
      const alt = $(el).attr('alt') || '';
      if (src) {
        images.push({ src, alt });
      }
    });
    
    return {
      url,
      title,
      description,
      keywords,
      text: text.substring(0, crawlerConfig.settings.maxTextLength),
      links: links.slice(0, crawlerConfig.settings.maxLinks),
      images: images.slice(0, crawlerConfig.settings.maxImages),
      crawledAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`Lỗi khi crawl ${url}:`, error.message);
    return {
      url,
      error: error.message,
      crawledAt: new Date().toISOString()
    };
  }
}

// Hàm chờ (delay) giữa các request
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Hàm chính để crawl từ file URLs
async function crawlFromFile(urlsFile = 'urls.txt') {
  console.log(`📂 Đọc URLs từ file: ${urlsFile}`);
  
  const urls = readUrlsFromFile(urlsFile);
  
  if (urls.length === 0) {
    console.log('❌ Không tìm thấy URLs hợp lệ trong file!');
    console.log('Vui lòng kiểm tra file urls.txt và thêm URLs.');
    return;
  }
  
  const pages = [];
  const delayTime = crawlerConfig.settings.delayBetweenRequests;
  
  console.log(`🚀 Bắt đầu crawl ${urls.length} trang từ file...`);
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const page = await crawlPage(url);
    pages.push(page);
    
    // Hiển thị tiến độ
    const progress = ((i + 1) / urls.length * 100).toFixed(1);
    console.log(`⏳ Tiến độ: ${i + 1}/${urls.length} (${progress}%)`);
    
    // Chờ giữa các request để tránh spam
    if (i < urls.length - 1) {
      await delay(delayTime);
    }
  }
  
  // Tạo thư mục output nếu chưa có
  const outputDir = crawlerConfig.output.directory;
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  
  // Lưu kết quả dưới nhiều định dạng
  saveDataInMultipleFormats(pages, outputDir, "crawl_from_file");
  
  console.log(`✅ Hoàn thành! Đã crawl ${pages.length} trang từ file.`);
  
  // Tạo báo cáo tóm tắt
  const summary = {
    totalPages: pages.length,
    successfulPages: pages.filter(p => !p.error).length,
    failedPages: pages.filter(p => p.error).length,
    sourceFile: urlsFile,
    crawledAt: new Date().toISOString()
  };
  
  const summaryFile = path.join(outputDir, "crawl_from_file_summary.json");
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2), 'utf8');
  
  // Tạo báo cáo HTML
  generateHtmlReport(pages, outputDir);
  
  console.log(`📊 Báo cáo tóm tắt: ${summaryFile}`);
  console.log(`   - Thành công: ${summary.successfulPages} trang`);
  console.log(`   - Thất bại: ${summary.failedPages} trang`);
  console.log(`   - File nguồn: ${summary.sourceFile}`);
}

// Chạy crawler từ file
(async () => {
  try {
    const urlsFile = process.argv[2] || 'urls.txt';
    await crawlFromFile(urlsFile);
  } catch (error) {
    console.error("Lỗi trong quá trình crawl từ file:", error);
  }
})(); 