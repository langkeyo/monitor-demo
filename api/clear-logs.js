import { kv } from '@vercel/kv'

export default async function handler(request, response) {
  try {
    await kv.del('all_logs') // 直接删这个key
    return response.status(200).json({ success: true, message: '云端已重置' })
  } catch (error) {
    return response.status(500).json({ error: '清空失败' })
  }
}
