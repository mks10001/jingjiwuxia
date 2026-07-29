# Jingji Wuxia Backend Demo

这是 demo 后端，基于 Node.js + Express + SQLite。

快速启动：

1. 安装依赖：
   cd backend
   npm install

2. 初始化数据库并写入示例数据：
   npm run init-db

3. 启动后端：
   npm start

默认监听端口：4000

示例 API：
- POST /api/creations  (form-data: title, description, type, image file)
- GET /api/creations
- POST /api/creations/:id/submit
- GET /api/admin/review
- POST /api/admin/review/:id  { action: 'approve' | 'reject' }
- GET /api/listings
- POST /api/listings/:id/buy  { buyer_id }
- GET /api/creators/:id/balance
- POST /api/payouts/request  { creator_id, amount }
- POST /api/reports

注意：这是演示用 demo，不适合生产环境。