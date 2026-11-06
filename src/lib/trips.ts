import type { City, Trip, TripSearch } from '../../api/_lib/jefferson.ts'

export type { City, Trip, TripSearch }

export type TimeOfDay = 'any' | 'morning' | 'midday' | 'evening'

export const TIME_OF_DAY: { value: TimeOfDay; label: string; hint: string }[] = [
  { value: 'any', label: "Don't care", hint: 'Any time' },
  { value: 'morning', label: 'Morning', hint: 'Before 11 AM' },
  { value: 'midday', label: 'Midday', hint: '11 AM – 4 PM' },
  { value: 'evening', label: 'Evening', hint: 'After 4 PM' },
]

export interface Preferences {
  timeOfDay: TimeOfDay
  allowTransfers: boolean
  minimizeStops: boolean
  preferShortest: boolean
}

// Times come back as station-local ISO strings ("2026-10-14T09:00:00-05:00");
// read the clock digits directly so they show in the station's time zone.
const clock = (iso: string) => {
  const [h, m] = iso.slice(11, 16).split(':').map(Number)
  return { h, m }
}

export function formatTime(iso: string) {
  const { h, m } = clock(iso)
  const suffix = h < 12 ? 'AM' : 'PM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`
}

export function formatDuration(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`
}

export function formatDate(ymd: string) {
  return new Date(`${ymd}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function matchesTimeOfDay(trip: Trip, tod: TimeOfDay) {
  const { h } = clock(trip.depart)
  switch (tod) {
    case 'morning':
      return h < 11
    case 'midday':
      return h >= 11 && h < 16
    case 'evening':
      return h >= 16
    default:
      return true
  }
}

export function applyPreferences(trips: Trip[], prefs: Preferences) {
  const filtered = trips.filter(
    (t) => matchesTimeOfDay(t, prefs.timeOfDay) && (prefs.allowTransfers || t.transfers === 0),
  )
  const keys: ((t: Trip) => number)[] = []
  if (prefs.minimizeStops) keys.push((t) => t.transfers, (t) => t.stops)
  if (prefs.preferShortest) keys.push((t) => t.durationMin)
  keys.push((t) => Date.parse(t.depart))
  return filtered.sort((a, b) => {
    for (const key of keys) {
      const diff = key(a) - key(b)
      if (diff) return diff
    }
    return 0
  })
}

export function tomorrow() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`)
  return body as T
}

export const fetchCities = () => getJson<City[]>('/api/cities')

export const fetchTrips = (from: string, to: string, date: string) =>
  getJson<TripSearch>(
    `/api/trips?${new URLSearchParams({ from, to, date })}`,
  )
