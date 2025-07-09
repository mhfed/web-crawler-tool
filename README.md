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

## 🌐 **Deploy lên Vercel**

### **Bước 1: Chuẩn bị Deploy**

```bash
# Đảm bảo tất cả dependencies đã cài
npm install

# Test local trước khi deploy  
npm run dev
# ✅ Mở http://localhost:2000 để test
```

### **Bước 2: Tạo tài khoản Vercel**

1. 🌐 Truy cập [vercel.com](https://vercel.com)
2. 📝 **Sign up** với GitHub account
3. ✅ **Connect GitHub** để import projects

### **Bước 3: Deploy từ GitHub**

```bash
# Push code lên GitHub
git add .
git commit -m "✨ Add Vercel deployment config"
git push origin main
```

### **Bước 4: Import Project trên Vercel**

1. 🌐 Vào [vercel.com/dashboard](https://vercel.com/dashboard)
2. 🔗 Click **"New Project"**
3. 📂 **Import** your GitHub repository
4. ⚙️ **Configure** project:
   - **Framework Preset**: `Other`
   - **Build Command**: `npm run build`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`
5. 🚀 Click **"Deploy"**

### **Bước 5: Deploy từ CLI (Nhanh hơn)**

```bash
# Cài Vercel CLI
npm i -g vercel

# Login Vercel
vercel login

# Deploy project
vercel

# Follow prompts:
# ? Set up and deploy "~/Documents/craw"? [Y/n] y
# ? Which scope? [Your username]
# ? Link to existing project? [y/N] n  
# ? What's your project's name? web-crawler-tool
# ? In which directory is your code located? ./

# Production deploy
vercel --prod
```

### **Bước 6: Cấu hình Domain (Optional)**

```bash
# Add custom domain
vercel domains add yourdomain.com

# Link domain to project  
vercel alias your-vercel-url.vercel.app yourdomain.com
```

### **🎯 Kết quả Deploy**

Sau khi deploy thành công:

- **✅ Live URL**: `https://your-project.vercel.app`
- **✅ API Endpoint**: `https://your-project.vercel.app/api/crawl`
- **✅ Auto-deploy**: Mỗi lần push code mới
- **✅ HTTPS**: Free SSL certificate
- **✅ Global CDN**: Deploy toàn cầu

### **🔧 Environment Variables (Nếu cần)**

Trong Vercel Dashboard > Settings > Environment Variables:

```bash
NODE_ENV=production
```

### **🐛 Troubleshooting Deploy**

#### Lỗi "Function timeout"?
```json
// vercel.json
{
  "functions": {
    "server.js": {
      "maxDuration": 60
    }
  }
}
```

#### Lỗi "Module not found"?
```bash
# Xóa node_modules và reinstall
rm -rf node_modules package-lock.json
npm install
vercel --prod
```

#### Build thất bại?
```bash
# Check engines trong package.json
"engines": {
  "node": ">=18.0.0"
}
```

### **📊 Monitor Performance**

- **🔍 Analytics**: Vercel Dashboard > Analytics
- **⚡ Speed Insights**: Automatic performance monitoring  
- **🚨 Error Tracking**: Real-time error logs
- **📈 Usage**: Function invocations, bandwidth

### **🔄 Update App**

```bash
# Local changes
git add .
git commit -m "🚀 Update crawler features"
git push origin main

# ✅ Vercel auto-deploys in ~30 seconds!
```

---

**🎉 Unlimited Mode giúp bạn crawl TOÀN BỘ dữ liệu mà không bỏ sót gì!**

**🌐 Deploy lên Vercel để sử dụng từ bất kỳ đâu với URL công khai!** 