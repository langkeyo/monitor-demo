// js/visualizer.js
import { storage } from './monitor/storage.js'
import * as echarts from 'echarts'

let myChart

export function renderChart(root) {
  if (!root) return

  const logs = storage.get().filter((log) => log.type.match(/错误|异常/))

  // 1. 数据加工：统计各类错误的数量
  const stats = logs.reduce((acc, log) => {
    acc[log.type] = (acc[log.type] || 0) + 1
    return acc
  }, {})

  const chartData = Object.keys(stats).map((key) => ({
    name: key,
    value: stats[key]
  }))

  // 在容器内寻找元素，而不是全局寻找
  const chartDom = root.querySelector('#chart-main')

  // 2. 使用 EChars 渲染（假设页面有个 id 为 chart-main 的容器）
  myChart = myChart || echarts.init(chartDom)
  myChart.setOption({
    title: { text: '异常类型分布统计', left: 'center' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        data: chartData
      }
    ]
  })
}
