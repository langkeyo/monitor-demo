import { kv } from '@vercel/kv'

export default async function handler(request, response) {
  try {
    // 从云端 Redis 的 "all_logs" 列表中取出第 0 到 100 条数据
    const logs = await kv.lrange('all_logs', 0, 100)
    return response.status(200).json(logs)
  } catch (error) {
    return response.status(500).json({ error: '读取云端失败' })
  }
}
