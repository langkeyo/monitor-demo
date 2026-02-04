// js/monitor/ai.js
import { handleReport } from './tracker.js'

const faceapi = window.faceapi

/**
 * 核心逻辑：从 AI 返回的复杂对象中，提取最有价值的信息
 * @param {Object} expressions
 */
function analyzeEmotion(expressions) {
  // 1. 把对象编程数组并排序
  const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1])

  // 2. 拿到最强烈的那个表情
  const [topEmotion, confidence] = sorted[0]

  // 3. 设定一个“阈值”：只有当 AI 把握超过 60% 时，我们才当真
  if (confidence > 0.6) {
    // 4. 判定“异常心情”：愤怒或悲伤
    if (topEmotion === 'angry' || topEmotion === 'sad') {
      return {
        isAnomalous: true,
        emotion: topEmotion,
        score: (confidence * 100).toFixed(1)
      }
    }
  }
  return { isAnomalous: false }
}

/**
 * 启动函数
 * @param {string} videoDomId
 * @param {string} statusDomId
 */
export async function initAI(videoDomId, statusDomId) {
  /** @type {HTMLVideoElement} */
  const video = /** @type {HTMLVideoElement} */ (
    document.getElementById(videoDomId)
  )
  /** @type {HTMLElement} */
  const status = /** @type {HTMLElement} */ (
    document.getElementById(statusDomId)
  )
  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'

  // 加载模型
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
  ])

  status.innerText = 'AI 脑细胞激活成功！'

  // 开启摄像头
  navigator.mediaDevices.getUserMedia({ video: {} }).then((stream) => {
    video.srcObject = stream

    // 开启循环检测（每 3 秒看一眼）
    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions()

      if (detections.length) {
        // 拿到第一张脸的表情，传给我们的分析器
        const result = analyzeEmotion(detections[0].expressions)

        // 如果分析结果是“异常”，就上报
        if (result.isAnomalous) {
          handleReport({
            type: '用户情绪异常',
            msg: `AI 察觉到用户感到 ${result.emotion} (置信度 ${result.score}%)`,
            tag: 'AI-Logic'
          })
          status.innerText = `检测到负面情绪：${result.emotion}! 已记录。`
        } else {
          status.innerText = '用户情绪稳定'
        }
      }
    }, 3000)
  })
}
