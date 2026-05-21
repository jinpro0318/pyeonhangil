/**
 * GPS 트립 기록 (월간 통계용)
 * - Navigation 진입 시 시작, Arrived 또는 도착 감지 시 종료
 * - localStorage에 일별·월별 누적
 */

const KEY = 'pyeonhangil_trips'
const ACTIVE_KEY = 'pyeonhangil_trip_active'

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

function saveAll(list) {
  try {
    const trimmed = list.slice(-500)
    localStorage.setItem(KEY, JSON.stringify(trimmed))
  } catch {}
}

export function startTrip(destination) {
  const trip = {
    id: `trip_${Date.now()}`,
    startTs: Date.now(),
    endTs: null,
    distance: 0,
    destination: destination ? { name: destination.name, lat: destination.lat, lng: destination.lng } : null,
  }
  try {
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(trip))
  } catch {}
  return trip
}

export function getActiveTrip() {
  try {
    const raw = localStorage.getItem(ACTIVE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function endTrip(distance) {
  const active = getActiveTrip()
  if (!active) return null
  const finished = {
    ...active,
    endTs: Date.now(),
    distance: Math.max(0, Math.round(distance || active.distance || 0)),
  }
  const all = loadAll()
  all.push(finished)
  saveAll(all)
  try {
    localStorage.removeItem(ACTIVE_KEY)
  } catch {}
  return finished
}

export function cancelTrip() {
  try {
    localStorage.removeItem(ACTIVE_KEY)
  } catch {}
}

function inMonth(ts, year, month) {
  const d = new Date(ts)
  return d.getFullYear() === year && d.getMonth() === month
}

export function getMonthlyStats(date = new Date()) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const trips = loadAll().filter((t) => t.endTs && inMonth(t.endTs, year, month))
  const count = trips.length
  const totalMeters = trips.reduce((sum, t) => sum + (t.distance || 0), 0)
  return {
    count,
    totalMeters,
    totalKm: Math.round((totalMeters / 1000) * 10) / 10,
  }
}

export function getAllTrips() {
  return loadAll()
}
