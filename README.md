# 🕷️ Web Crawler Tool - Advanced

**Công cụ crawl dữ liệu website mạnh mẽ với tính năng Unlimited Mode**

## 🚀 **Tính năng nổi bật**

### ⚡ **Normal Mode** (Nhanh)
- ✅ Crawl cơ bản: title, description, text (5,000 ký tự)
- ✅ Links (20), Images (10)
- ✅ Tốc độ cao, phù hợp crawl nhiều trang

### 🔥 **Unlimited Mode** (Đầy đủ)
- ✅ **Crawl toàn bộ text** không giới hạn
- ✅ **Tất cả links và images** 
- ✅ **Headings** (H1-H6) với cấu trúc
- ✅ **Meta tags** đầy đủ (OpenGraph, Twitter Cards, etc.)
- ✅ **Cấu trúc trang** (forms, tables, buttons, inputs)
- ✅ **Thống kê chi tiết** (tổng elements, divs, spans, etc.)

## 📊 **So sánh hiệu suất**

| Chế độ | Text | Links | Images | Extra Data | Tốc độ |
|--------|------|-------|--------|------------|--------|
| Normal | 5K ký tự | 20 | 10 | Cơ bản | ⚡ Nhanh |
| Unlimited | Toàn bộ | Tất cả | Tất cả | Đầy đủ | 🐌 Chậm hơn |

**Ví dụ với coolmate.me:**
- Normal: ~500 ký tự, 20 links, 10 images
- Unlimited: **7,616 ký tự**, **58 links**, **123 images**, **39 headings**, **20 meta tags**

## 🛠️ **Cách sử dụng**

### 1. **Web Interface**
```bash
npm run web
# Mở http://localhost:2000
# ✅ Tick "Unlimited Mode" để crawl đầy đủ
```

### 2. **Command Line**
```bash
# Normal crawl
npm run crawl-file

# Unlimited crawl (chỉnh config.js)
npm run crawl-unlimited
```

### 3. **API Endpoint**
```javascript
// POST /api/crawl
{
  "url": "https://example.com",
  "unlimited": true,
  "includeHeadings": true,
  "includeMetaTags": true,
  "includeStructure": true
}
```

## 📁 **Cấu trúc dữ liệu Unlimited**

```json
{
  "url": "https://coolmate.me",
  "title": "COOLMATE - Thương Hiệu Thời Trang...",
  "description": "Trải nghiệm mua sắm thời trang...",
  "keywords": "thời trang nam, quần áo nam...",
  "text": "Toàn bộ nội dung trang...",
  "textLength": 7616,
  "links": [...], // Tất cả links
  "linksCount": 58,
  "images": [...], // Tất cả images  
  "imagesCount": 123,
  "headings": [
    {"level": "H1", "text": "COOLMATE"},
    {"level": "H2", "text": "Sản phẩm mới"}
  ],
  "headingsCount": 39,
  "metaTags": [
    {"name": "og:title", "content": "COOLMATE..."},
    {"name": "twitter:card", "content": "summary"}
  ],
  "metaTagsCount": 20,
  "structure": {
    "totalElements": 1409,
    "forms": 0,
    "tables": 0,
    "videos": 0,
    "buttons": 120,
    "inputs": 0,
    "divs": 441,
    "spans": 66
  },
  "crawlMode": "unlimited",
  "crawledAt": "2025-07-09T07:06:02.895Z"
}
```

## ⚙️ **Cấu hình**

File `config.js`:

```javascript
export const crawlerConfig = {
  // Normal mode settings
  settings: {
    maxTextLength: 5000,  // 0 = unlimited
    maxLinks: 20,         // 0 = unlimited
    maxImages: 10,        // 0 = unlimited
    delayBetweenRequests: 1000
  },
  
  // Unlimited mode settings
  unlimited: {
    maxTextLength: 0,     // Unlimited
    maxLinks: 0,          // Unlimited
    maxImages: 0,         // Unlimited
    delayBetweenRequests: 2000, // Slower for stability
    includeHeadings: true,
    includeMetaTags: true,
    includeStructure: true
  }
}
```

## 🎯 **Khi nào dùng Unlimited Mode?**

### ✅ **Nên dùng khi:**
- Phân tích chi tiết 1 website
- Nghiên cứu cấu trúc trang
- Crawl dữ liệu marketing (headings, meta tags)
- Audit SEO toàn diện
- Phân tích đối thủ cạnh tranh

### ❌ **Không nên dùng khi:**
- Crawl hàng trăm/nghìn URLs
- Cần tốc độ cao
- Chỉ cần thông tin cơ bản
- Crawl định kỳ/tự động

## 🚨 **Lưu ý quan trọng**

- **Unlimited Mode chậm hơn** 2-3 lần so với Normal Mode
- **Dữ liệu lớn hơn** 5-10 lần, cần nhiều storage
- **Timeout cao hơn** (30s vs 15s)
- **Delay cao hơn** (2s vs 1s) để tránh spam server
- **Memory usage cao hơn** khi crawl trang lớn

## 📦 **Kết quả Export**

Unlimited Mode xuất thêm:
- **JSON chi tiết** với tất cả fields
- **CSV mở rộng** với cột headings, structure
- **HTML Report** với sections mới cho meta tags, structure
- **Statistics summary** so sánh với Normal Mode

## 🔧 **Troubleshooting**

### Unlimited crawl bị timeout?
```javascript
// Tăng timeout trong config.js
unlimited: {
  requestTimeout: 60000, // 60 seconds
}
```

### Memory error với trang lớn?
```javascript
// Giới hạn một phần
unlimited: {
  maxTextLength: 50000, // Thay vì 0 (unlimited)
  maxLinks: 500,        // Thay vì 0 (unlimited)
}
```

### Server reject requests?
```javascript
// Tăng delay
unlimited: {
  delayBetweenRequests: 5000, // 5 seconds
}
```

## 🌟 **Demo nhanh**

```bash
# Cài đặt
npm install

# Test Normal Mode
echo "https://coolmate.me" > test.txt
npm run crawl-file

# Test Unlimited Mode  
npm run web
# ✅ Tick "Unlimited Mode"
# Paste: https://coolmate.me
# Click "Bắt đầu Crawl"
```

## 📞 **Hỗ trợ**

- 🐛 **Bug reports:** [GitHub Issues](https://github.com/user/repo/issues)
- 💡 **Feature requests:** [GitHub Discussions](https://github.com/user/repo/discussions)
- 📖 **Documentation:** [Wiki](https://github.com/user/repo/wiki)

---

**🎉 Unlimited Mode giúp bạn crawl TOÀN BỘ dữ liệu mà không bỏ sót gì!** 