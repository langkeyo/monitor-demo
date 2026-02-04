/**
 * @typedef {import('@vladmandic/face-api')} faceapi
 */
/** @type {faceapi} */
let faceapi = window.faceapi

async function ensureModels() {
  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
  await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
}

window.inspectData = async function inspectData() {
  console.log('hello')
  /** @type {HTMLVideoElement} */
  const video = /** @type {HTMLVideoElement} */ (
    document.getElementById('ai-video')
  )

  // 打开摄像头
  const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
  video.srcObject = stream
  await video.play()

  // 确保模型加载
  await ensureModels()

  // 跑一次检测
  const rawResult = await faceapi
    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceExpressions()

  console.log('这是 AI 返回的原始数组：', rawResult)

  if (rawResult.length > 0) {
    // 2. 看看数组里的第 0 个元素（也就是第一张脸）
    const firstFace = rawResult[0]
    console.log('第一张脸的详细数据：', firstFace)

    // 3. 重点看表情数据
    const expressions = firstFace.expressions
    console.log('表情权重对象：', expressions)

    // 这一步你就能看到为什么要用 Object.entries 了
    // 因为 expressions 是个对象：{neutral: 0.9, happy: 0.01, ...}
    // 它不是按高低排序的，所以我们要自己处理它
  } else {
    console.log('没找到脸，请正对着摄像头再试一次')
  }
}
