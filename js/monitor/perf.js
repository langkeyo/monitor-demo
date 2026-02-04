import { handleReport } from './tracker.js'

// js/monitor/perf.js
export function initPerf(_options) {
  // 页面性能监控（看网页加载到底花了多久）
  window.addEventListener('load', () => {
    console.log('hello')
    // 这里用 setTimeout 是为了确保数据已经生成
    setTimeout(() => {
      const [entry] = performance.getEntriesByType('navigation')
      const loadTime = {
        type: '页面加载性能',
        // DNS 解析耗时
        dns: entry.domainLookupEnd - entry.domainLookupStart,
        // TCP 连接耗时
        tcp: entry.connectEnd - entry.connectStart,
        // 关键：白屏事件（从请求到开始解析）
        whiteScreen: entry.responseStart - entry.startTime,
        // 核心：整页加载总耗时
        totalTime: entry.loadEventEnd - entry.startTime
      }

      handleReport(loadTime)
    }, 500)
  })
}
