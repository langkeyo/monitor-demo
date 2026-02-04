// js/monitor/storage.js
const PREFIX = 'SENTINEL_'
const STORAGE_KEY = PREFIX + 'MONITOR_LOGS'

export const storage = {
  save(log) {
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    logs.push({ ...log, time: new Date().toLocaleTimeString() })
    if (logs.length > 50) logs.shift()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
  },
  get() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  },
  clear() {
    localStorage.removeItem(STORAGE_KEY)
  }
}
