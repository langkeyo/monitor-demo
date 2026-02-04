// js/monitor/index.js
import { initTracker } from './tracker.js'
import { initPerf } from './perf.js'
import { initAI } from './ai.js'

export default {
  /**
   *
   * @param {any} options
   */
  start(options) {
    console.log('🚀 监控系统已启动...', options)
    initTracker(options.onReport)
    initPerf(options.onReport)

    // 2. 传入对应的 DOM ID 启动 AI
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => {
        initAI('ai-video', 'ai-status')
      })
    } else {
      setTimeout(() => initAI('ai-video', 'ai-status'), 5000)
    }
  }
}
