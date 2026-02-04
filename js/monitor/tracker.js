// js/monitor/tracker.js
import { storage } from './storage.js'

let reportHandler = null // 存放外部传进来的回调

export const userActions = []

export function initTracker(callback) {
  reportHandler = callback
  fetchHistoryLogs()

  // 1. JS 错误
  window.onerror = (msg, _url, line) => {
    handleReport({ type: 'JS错误', msg: `${msg} at ${line}` })
  }

  // 2. 资源/404
  window.addEventListener(
    'error',
    (e) => {
      if (e.target.localName && e.target.localName !== 'body') {
        drawPlaceholder(e.target)
        handleReport({
          type: '资源错误',
          tag: e.target.localName,
          url: e.target.src.slice(0, 20)
        })
      }
    },
    true
  )

  // 3. Promise
  window.addEventListener('unhandledrejection', (e) => {
    handleReport({ type: 'Promise错误', msg: e.reason })
  })

  // 愤怒点击检测逻辑
  let clickCount = 0
  let lastTarget = null
  let lastClickTime = 0

  // 4. 点击行为
  window.addEventListener(
    'click',
    (e) => {
      /** @type {HTMLButtonElement} */
      const target = e.target
      if (target.tagName !== 'BUTTON') return // 只监测按钮

      const now = Date.now()

      // 如果点击的是同一个按钮，且两次点击间隔小于 500ms
      if (target === lastTarget && now - lastClickTime < 500) {
        clickCount++
      } else {
        clickCount = 1 // 换了按钮或者间隔长了，重置计数
      }

      lastTarget = target
      lastClickTime = now

      // 如果 1 秒内（或者连续）点了 5 次以上
      if (clickCount >= 5) {
        handleReport({
          type: '用户行为异常',
          msg: `检测到愤怒点击：按钮 [${target.innerHTML}] 被暴力连击`,
          tag: 'Rage-Click'
        })
        clickCount = 0 // 触发后重置，防止重复报警
      }

      // 记录行为路径
      userActions.push(`[${target.innerText}]`)
      if (userActions.length > 5) userActions.shift()
    },
    true
  )

  // 历史记录加载（放在 load 事件里比较稳妥）
  window.addEventListener('load', async () => {
    try {
      const res = await fetch('/api/get-logs')
      const cloudLogs = await res.json()

      // 注意：从 KV 拿回来的通常是字符串数组，得转一下
      cloudLogs.forEach((logStr) => {
        const log = typeof logStr === 'string' ? JSON.parse(logStr) : logStr
        handleReport(log, true) // 作为历史记录渲染出来
      })
    } catch (error) {
      console.error('拉去云端日志失败', error)
    }
  })
}

async function fetchHistoryLogs() {
  try {
    // ✨ 这里的路径也要注意！微前端下建议写绝对路径，防止 404
    const API_BASE = 'http://localhost:3001' // 你的 Vercel Serverless 地址

    console.log('开始同步云端历史记录...')
    const res = await fetch(`${API_BASE}/api/get-logs`)
    const cloudLogs = await res.json()

    cloudLogs.forEach((logStr) => {
      const log = typeof logStr === 'string' ? JSON.parse(logStr) : logStr
      handleReport(log, true)
    })
  } catch (error) {
    console.error('拉取云端日志失败', error)
  }
}

export function handleReport(data, isHistory = false) {
  // 1. 如果不是历史记录，就补充路径信息并保存
  if (!isHistory) {
    data.path = [...userActions] // 记录此时此刻的动作快照
    data.time = data.time || new Date().toLocaleTimeString()
    // 双保险（存在本地）
    storage.save(data)

    //【核心】上报到远程 Serverless 接口
    fetch('/api/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data) // 把报错对象转成字符串发出去
    })
      .then((res) => res.json())
      .then((data) => console.log('云端响应：', data.message))
      .catch((err) => console.error('上报云端失败：', err))
  }

  //【关键】如果有回调，就把数据传出去
  if (typeof reportHandler === 'function') {
    reportHandler(data, isHistory)
  }
}

function drawPlaceholder(target) {
  if (target.tagName !== 'IMG') return

  const cvs = document.createElement('canvas')
  const ctx = cvs.getContext('2d')
  const size = 150
  cvs.width = size * devicePixelRatio
  cvs.height = size * devicePixelRatio
  cvs.style.width = cvs.style.height = size + 'px'

  ctx.beginPath()
  // 缩放 & 字体
  ctx.scale(devicePixelRatio, devicePixelRatio)
  ctx.fillStyle = '#333'
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = 'red'
  ctx.font = '16px sans-serif'

  // 居中对齐
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // 画出来
  ctx.fillText('资源加载失败了', size / 2, size / 2)
  ctx.closePath()

  const b64 = cvs.toDataURL('image/png')
  target.src = b64
}
