# 🚀 Sentinel-Monitor | 前端全栈异常监控系统

这是一个基于 **原生 JS + Serverless + Redis** 构建的轻量级前端监控系统。它不仅仅能捕获代码错误，还能通过用户行为分析和 AI 潜力拓展，真实还原“案发现场”

## ✨ 核心特性

- 🛡️**全方位捕获**：支持 JS 运行时错误、Promise 异常、404 静态资源加载失败监控。
- ⚡ **性能追踪**：基于 Performance API，实时采集 DNS 解析、白屏时间、整页加载耗时。
- 😠 **行为分析**：内置“愤怒点击（Rage Click）”检测逻辑，识别用户操作障碍
- 📝 **行为面包屑**：自动记录报错前的 5 次用户操作路径，精准还原复现步骤。
- ☁️ **Serverless 架构**：后端采用 Vercel Functions + Vercel KV（Redis），实现零成本、高并发的数据存储。
- 📊 **可视化看板**：集成 ECharts，动态展示异常分布饼图及性能趋势。
- 🎨 **体验优化**：独创 Canvas 自动容错，图片加载时自动生成优雅的占位图。

## 🛠️ 技术栈

- **前端**：Vanilla JS（ES6+），ECharts，Canvas API
- **后端**：Nodejs（Vercel Serverless Functions）
- **数据库**：Vercel KV（Redis）
- **部署**：Vercel

## 📦 快速开始

1. **克隆项目**

```bash
git clone https://github.com/langkeyo/monitor-demo.git
```

2. 环境变量配置 - 在根目录创建 **.env.local**，配置你的 Vercel KV 密钥。
3. 启动开发服务器

```bash
vercel dev
```
