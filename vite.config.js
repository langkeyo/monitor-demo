// vite.config.js
import { defineConfig } from 'vite'
import qiankun from 'vite-plugin-qiankun'

export default defineConfig({
  base: '/monitor', // 这里的路径要和著引用访问的路径一致，或者写完整域名
  plugins: [
    // 这里的名称要和主应用注册的一致
    qiankun('sentinel-monitor', {
      useDevMode: true
    })
  ],
  server: {
    port: 5174,
    cors: true,
    origin: 'http://localhost:5174' // 强制资源从这个 origin 获取
  },
  assetsInclude: ['**/*.bin', '**/*.json']
})
