// main.js
import {
  renderWithQiankun,
  qiankunWindow
} from 'vite-plugin-qiankun/dist/helper.js'
import Monitor from './js/monitor/index.js'
import { renderChart } from './js/visualizer.js'

// 样式也要手动导入
import './css/style.css'

function render(props = {}) {
  // 注意：在微前端环境下，我们要找 container 下的元素
  const { container } = props
  const root = container
    ? container.querySelector('#app')
    : document.getElementById('#app')

  // 绑定按钮事件（因为 HTML 里的 onclick 找不到全局函数了）
  if (root) {
    root.querySelector('#btn-error-js')?.addEventListener('click', () => {
      console.log(undefinedVariable) // 故意制造错误
    })
    root
      .querySelector('#btn-error-not-found')
      ?.addEventListener('click', () => {
        const img = new Image()
        img.style.marginTop = '8px'
        img.style.borderRadius = '8px'
        img.src = ' https://this-is-a-404-image.jpg' // 一个不存在的图片
        root.appendChild(img)
      })
    root.querySelector('#btn-error-promise')?.addEventListener('click', () => {
      return new Promise((resolve, reject) => {
        // 模拟一个异步操作失败
        reject('服务器返回：403 无权限')
      })
    })
    root
      .querySelector('#btn-clear-cloud')
      ?.addEventListener('click', async () => {
        if (confirm('确定要删除云端所有监控记录吗？此操作不可逆！')) {
          await fetch('/api/clear-logs')
          location.reload()
        }
      })
    root.querySelector('#btn-refresh')?.addEventListener('click', () => {
      renderChart()
    })
    root
      .querySelector('#btn-bluetooth')
      ?.addEventListener('click', async () => {
        try {
          console.log('🚩 正在精准搜索 TG01...')

          const device = await navigator.bluetooth.requestDevice({
            // 接受所有设备（不能和 filters 混用）
            acceptAllDevices: true,
            // 虽然接受所有涉笔，但是需要读电量，依然要声明
            optionalServices: ['battery_service']
          })

          console.log('找到了！', device.name)

          // 下一步：连接 GATT 服务器
          await connectToDevice(device)

          // 2. 监听设备断开事件
          device.addEventListener('gattserverdisconnected', () => {
            console.log('❌ 设备已断开连接')
          })
        } catch (error) {
          console.log('没搜到指定设备，请确保耳机处于“配对状态”：', error)
        }
      })
  }

  // 启动监控
  Monitor.start({
    onReport: (data, isHistory) => {
      // 同样，这里的 renderLogs 也需要感知 container
      renderLogs(data, isHistory, root)
      renderChart(root)
    }
  })
}

// 使用插件提供的帮助函数
renderWithQiankun({
  mount(props) {
    console.log('监控子应用挂载', props)
    render(props)
  },
  bootstrap() {},
  unmount(props) {
    console.log('监控子应用卸载')
  },
  update(props) {}
})

// 如果不是在 qiankun 环境下，独立运行
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}

function renderLogs(data, isHistory, root) {
  const list = root.querySelector('#log-list')
  if (!list) return

  const item = document.createElement('div')

  // 统一管理类名
  const typeClass =
    data.type === 'JS错误'
      ? 'item-js-error'
      : data.type === '页面加载性能'
        ? 'item-perf'
        : data.tag === 'Rage-Click'
          ? 'item-rage'
          : ''
  const historyClass = isHistory ? 'is-history' : ''

  item.className = `error-item ${typeClass} ${historyClass}`

  const pathStr =
    data.path && data.path.length > 0 ? data.path.join(' -> ') : '无'

  item.innerHTML = `
        [${data.time}] 🚨 ${data.type}<br>
        内容: ${data.msg || data.url || ''}<br>
        <small>操作路径：${pathStr}</small>
    `
  list.prepend(item)
}

/**
 * 连接设备
 *
 * @async
 * @param {BluetoothDevice} device
 * @returns {*}
 */
async function connectToDevice(device) {
  // 1. 连接到 GATT 服务器（就像拨通电话）
  console.log('正在拨号（连接 GATT）...')
  const server = await device.gatt.connect()

  // 2. 获取服务（就像进到对应的办公室，比如“电量科”）
  console.log('进入电量服务部')
  const service = await server.getPrimaryService('battery_service')

  // 3. 获取特征值（就像找到对应的文件柜，比如“剩余电量文件”）
  console.log('找到电量数据表...')
  const characteristic = await service.getCharacteristic('battery_level')

  // 4. 读取数据（就像读出文件里的数字）
  console.log('正在读取数值...')
  const value = await characteristic.readValue()

  // 5. 解析数据（蓝牙发回的是字节流 DataView，需要转成数字）
  const batteryLevel = value.getUint8(0)
  console.log(`成功！你的设备电量为：${batteryLevel}%`)

  //【联动监控】如果电量低于 20%，记录一条行为日志
  if (batteryLevel < 20) {
    handleReport({ type: '硬件状态', msg: '设备电量过低', tag: 'IoT' })
  }
}
