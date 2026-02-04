// bluetooth.js
import { handleReport } from './js/monitor/tracker.js'

console.log('我的浏览器支持蓝牙吗？', navigator.bluetooth)

window.searchBluetooth = async function searchBluetooth() {
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
