// js/monitor/index.js
import { initTracker } from './tracker.js'
import { initPerf } from './perf.js'

export default {
  start(options) {
    console.log('🚀 监控系统已启动...')
    initTracker(options.onReport)
    initPerf(options.onReport)
  }
}
