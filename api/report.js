import { kv } from '@vercel/kv'

// Vercel Serverless Function 规范
export default async function handler(request, response) {
  // 1. 只允许 POST 请求（上报通常用 POST）
  if (request.method === 'POST') {
    const data = request.body

    // 给数据加一个唯一的 ID 和时间戳
    const logId = `log:${Date.now()}`

    try {
      // 1. 把这一条日志存进去（用 lpush 存进一个名为 "all_logs" 的列表里）
      // lpush 就像是往数组头部赛一个东西
      await kv.lpush('all_logs', JSON.stringify(data))

      // 2. 为了防止数据爆炸，我们只保留最近的 100 条
      await kv.ltrim('all_logs', 0, 99)

      return response.status(200).json({ success: true })
    } catch (error) {
      console.error('数据库写入失败：', error)
      return response.status(500).json({ error: '写入云端失败' })
    }
  }
}
