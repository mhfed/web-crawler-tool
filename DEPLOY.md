# 🚀 Hướng dẫn Deploy Web Crawler

Có nhiều cách để public dự án Web Crawler này. Dưới đây là hướng dẫn chi tiết cho từng phương án:

## 🌐 1. Web App (Khuyến nghị)

### Chạy local:
```bash
npm install
npm run web
```
Mở trình duyệt tại `http://localhost:3000`

### Deploy lên Vercel (Miễn phí):
1. Tạo tài khoản tại [vercel.com](https://vercel.com)
2. Cài đặt Vercel CLI:
   ```bash
   npm i -g vercel
   ```
3. Deploy:
   ```bash
   vercel --prod
   ```

### Deploy lên Netlify (Miễn phí):
1. Tạo tài khoản tại [netlify.com](https://netlify.com)
2. Kéo thả thư mục `public` vào Netlify Dashboard
3. Hoặc dùng CLI:
   ```bash
   npm i -g netlify-cli
   netlify deploy --prod --dir=public
   ```

### Deploy lên Railway (Miễn phí):
1. Tạo tài khoản tại [railway.app](https://railway.app)
2. Connect GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm run web`

## 🔌 2. Chrome Extension

### Cài đặt local:
1. Mở Chrome, vào `chrome://extensions/`
2. Bật "Developer mode"
3. Click "Load unpacked"
4. Chọn thư mục `extension`
5. Extension sẽ xuất hiện trong toolbar

### Publish lên Chrome Web Store:
1. Tạo tài khoản developer tại [Chrome Web Store](https://chrome.google.com/webstore/devconsole)
2. Nộp phí đăng ký $5 (một lần)
3. Zip thư mục `extension`
4. Upload và submit để review
5. Thời gian review: 1-3 ngày

### Publish lên Firefox Add-ons:
1. Tạo file `manifest_v2.json` cho Firefox
2. Tạo tài khoản tại [Firefox Developer Hub](https://addons.mozilla.org/developers/)
3. Upload và submit (miễn phí)

## 📦 3. NPM Package

### Publish lên NPM:
```bash
# Login NPM
npm login

# Publish
npm publish
```

### Sử dụng:
```bash
npm install web-crawler-tool
```

```javascript
import { crawlPage } from 'web-crawler-tool';
const result = await crawlPage('https://example.com');
```

## ☁️ 4. API Service

### Deploy lên Heroku:
1. Tạo `Procfile`:
   ```
   web: npm run web
   ```
2. Deploy:
   ```bash
   git add .
   git commit -m "Initial commit"
   heroku create your-app-name
   git push heroku main
   ```

### Deploy lên Google Cloud Run:
1. Tạo `Dockerfile`:
   ```dockerfile
   FROM node:18
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 3000
   CMD ["npm", "run", "web"]
   ```
2. Deploy:
   ```bash
   gcloud run deploy --source .
   ```

## 🖥️ 5. Desktop App (Electron)

### Tạo Electron app:
```bash
npm install electron --save-dev
```

Tạo `electron-main.js`:
```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    }
  });
  
  win.loadFile('public/index.html');
}

app.whenReady().then(createWindow);
```

## 🎯 So sánh các phương án:

| Phương án | Độ khó | Chi phí | Thời gian | Khả năng tiếp cận |
|-----------|--------|---------|-----------|-------------------|
| Web App | ⭐⭐ | Miễn phí | 5 phút | Cao |
| Extension | ⭐⭐⭐ | $5 | 2-3 ngày | Trung bình |
| NPM | ⭐⭐⭐⭐ | Miễn phí | 10 phút | Developer |
| API Service | ⭐⭐⭐ | Miễn phí/Trả phí | 30 phút | Cao |
| Desktop | ⭐⭐⭐⭐⭐ | Miễn phí | 2-3 giờ | Trung bình |

## 🚀 Khuyến nghị:

1. **Bắt đầu với Web App** - Dễ nhất, deploy nhanh
2. **Sau đó làm Extension** - Tiện dụng cho người dùng
3. **NPM Package** - Cho developers khác sử dụng
4. **API Service** - Nếu muốn tích hợp vào app khác

## 📞 Hỗ trợ:

Nếu gặp khó khăn, hãy:
1. Kiểm tra console logs
2. Đọc error messages
3. Tìm kiếm trên Stack Overflow
4. Hỏi trên GitHub Issues 