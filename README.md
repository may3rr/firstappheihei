# 台球记录应用

一个用于记录台球比赛结果的 Web 应用。

## 功能特点

- 记录比赛胜负
- 实时统计胜率
- 今日战况展示
- 总排行榜
- 支持撤回比赛记录

## 部署说明

1. 克隆仓库：
```bash
git clone <repository-url>
cd <repository-name>
```

2. 安装依赖：
```bash
cd server
npm install
```

3. 配置环境变量：
   - 复制环境变量模板文件：
     ```bash
     cp .env.example .env
     ```
   - 编辑 `.env` 文件，填入实际的配置值：
     - `MONGODB_URI`: MongoDB 连接字符串
     - `PORT`: 服务器端口（可选，默认 3000）

4. 初始化数据库：
```bash
npm run init-db
```

5. 启动服务器：
   - 开发环境：
     ```bash
     npm run dev
     ```
   - 生产环境：
     ```bash
     npm start
     ```

## 环境变量说明

- `MONGODB_URI`: MongoDB 数据库连接字符串
  - 格式：`mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority`
  - 示例：`mongodb+srv://user:pass@cluster0.xxx.mongodb.net/billiards?retryWrites=true&w=majority`

- `PORT`: 服务器监听端口
  - 默认值：3000
  - 可选配置

## 注意事项

1. 不要将 `.env` 文件提交到 Git 仓库
2. 确保 MongoDB 数据库已创建并可访问
3. 确保服务器 IP 已添加到 MongoDB Atlas 的 IP 白名单中

## 生产环境部署

1. 在生产服务器上设置环境变量：
   ```bash
   # Linux/Mac
   export MONGODB_URI="your-mongodb-uri"
   export PORT=3000

   # Windows
   set MONGODB_URI=your-mongodb-uri
   set PORT=3000
   ```

2. 或者使用进程管理器（如 PM2）：
   ```bash
   # ecosystem.config.js
   module.exports = {
     apps: [{
       name: "billiards-app",
       script: "src/index.js",
       env: {
         MONGODB_URI: "your-mongodb-uri",
         PORT: 3000
       }
     }]
   }
   ```

## 技术栈

- 前端：HTML5, CSS3, JavaScript
- 后端：Node.js, Express
- 数据库：MongoDB
- 实时通信：Socket.IO 