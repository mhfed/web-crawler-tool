import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { crawlerConfig } from "./config.js";
import { generateHtmlReport, saveDataInMultipleFormats } from "./utils.js";

// Hàm crawl một trang web
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
      text: text.substring(0, crawlerConfig.settings.maxTextLength), // Giới hạn text để tránh quá dài
      links: links.slice(0, crawlerConfig.settings.maxLinks), // Giới hạn links
      images: images.slice(0, crawlerConfig.settings.maxImages), // Giới hạn images
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

// Hàm chính để crawl nhiều URLs
async function crawlWebsite() {
  const urls = crawlerConfig.urls;
  
  const pages = [];
  const delayTime = crawlerConfig.settings.delayBetweenRequests;
  
  console.log(`Bắt đầu crawl ${urls.length} trang...`);
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const page = await crawlPage(url);
    pages.push(page);
    
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
  saveDataInMultipleFormats(pages, outputDir, "crawl_result");
  
  console.log(`✅ Hoàn thành! Đã crawl ${pages.length} trang.`);
  
  // Tạo báo cáo tóm tắt
  const summary = {
    totalPages: pages.length,
    successfulPages: pages.filter(p => !p.error).length,
    failedPages: pages.filter(p => p.error).length,
    crawledAt: new Date().toISOString()
  };
  
  const summaryFile = path.join(outputDir, crawlerConfig.output.summaryFileName);
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2), 'utf8');
  
  // Tạo báo cáo HTML
  generateHtmlReport(pages, outputDir);
  
  console.log(`📊 Báo cáo tóm tắt: ${summaryFile}`);
  console.log(`   - Thành công: ${summary.successfulPages} trang`);
  console.log(`   - Thất bại: ${summary.failedPages} trang`);
}

// Chạy crawler
(async () => {
  try {
    await crawlWebsite();
  } catch (error) {
    console.error("Lỗi trong quá trình crawl:", error);
  }
})(); 