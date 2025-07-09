export const crawlerConfig = {
  // Danh sách URLs cần crawl
  urls: [
    "https://byd.1826.sg/",
    "https://byd.1826.sg/about",
    // Thêm URLs khác ở đây
  ],
  
  // Cài đặt crawler
  settings: {
    // Thời gian chờ giữa mỗi request (milliseconds)
    delayBetweenRequests: 1000,
    
    // Timeout cho mỗi request (milliseconds)
    requestTimeout: 10000,
    
    // Giới hạn độ dài text content
    maxTextLength: 5000,
    
    // Giới hạn số lượng links lấy từ mỗi trang
    maxLinks: 20,
    
    // Giới hạn số lượng images lấy từ mỗi trang
    maxImages: 10,
    
    // User-Agent header
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  },
  
  // Cài đặt output
  output: {
    // Thư mục lưu kết quả
    directory: "output",
    
    // Tên file kết quả chính
    resultFileName: "crawl_result.json",
    
    // Tên file báo cáo tóm tắt
    summaryFileName: "crawl_summary.json"
  }
}; 