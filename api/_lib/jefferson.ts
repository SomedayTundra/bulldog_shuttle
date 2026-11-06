// Thin client for the public API behind ride.jeffersonlines.com.
// The key and carrier code below ship in that site's own JavaScript bundle.

const API = 'https://ride-api.jeffersonlines.com/tickets'
const CARRIER_ID = 202
const HEADERS = {
  'TDS-Carrier-Code': 'JL',
  'TDS-Api-Key': '36A854DB-A2B3-4FC8-A232-4857AF28112B',
  'Content-Type': 'application/json',
  Origin: 'https://ride.jeffersonlines.com',
  Referer: 'https://ride.jeffersonlines.com/',
}

interface RawStop {
  stopUuid: string
  stopId: number
  stationName: string
  displayBusinessName?: string
  address: string
  city: { cityId: number; name: string }
  state: { abbreviation: string; name: string }
  timeZone: string
}

interface RawFare {
  name: string
  type: string
  amount: number
}

interface RawSegment {
  departStop: RawStop
  arriveStop: RawStop
  schedule: { scheduleNumber: string; trueNumber: string }
  departTime: string
  arriveTime: string
  transfer: boolean
  layoverDuration: number
}

interface RawProduct {
  scheduleRun: {
    scheduleRunUuid: string
    departTime: string
    arriveTime: string
    travelDuration: number
    remainingCapacity: number
    soldOut: boolean
    pastSalesCutoffTime: boolean
    alreadyDeparted: boolean
    scheduleComponents: unknown[]
  }
  segments: RawSegment[]
  railgunFares: Record<string, { fares: RawFare[] }[]>
  fees: { description: string; amount: number }[]
}

export interface City {
  id: string // "Minneapolis|MN"
  name: string
  state: string
  stopCount: number
}

export interface StopInfo {
  name: string
  short: string // e.g. "U of MN - Huron Blvd" or "Minneapolis Bus Station"
  address: string
}

export interface Leg {
  route: string
  from: StopInfo
  to: StopInfo
  depart: string
  arrive: string
  stopsAlongTheWay: number
}

export interface Trip {
  id: string
  depart: string // ISO with offset
  arrive: string
  durationMin: number
  transfers: number
  stops: number // intermediate stops, transfer points included
  origin: StopInfo
  destination: StopInfo
  routes: string[]
  legs: Leg[]
  layovers: { at: string; minutes: number }[]
  fareFrom: number | null
  fares: { name: string; amount: number }[]
  processingFee: number
  seatsLeft: number
  bookable: boolean
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}/${path}`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`Jefferson API ${path} returned ${res.status}`)
  }
  return res.json() as Promise<T>
}

// The stop list is ~1 MB and rarely changes; keep it per warm instance.
const STOP_TTL_MS = 60 * 60 * 1000
let stopCache: { at: number; stops: Promise<RawStop[]> } | null = null

function getStops(): Promise<RawStop[]> {
  if (!stopCache || Date.now() - stopCache.at > STOP_TTL_MS) {
    const stops = post<RawStop[]>('stop', {
      carrierId: CARRIER_ID,
      type: 'ORIGIN',
      cityMode: false,
    })
    stops.catch(() => {
      stopCache = null
    })
    stopCache = { at: Date.now(), stops }
  }
  return stopCache.stops
}

const cityId = (s: RawStop) => `${s.city.name}|${s.state.abbreviation}`

export async function listCities(): Promise<City[]> {
  const byCity = new Map<string, City>()
  for (const s of await getStops()) {
    const id = cityId(s)
    const city = byCity.get(id)
    if (city) city.stopCount++
    else byCity.set(id, { id, name: s.city.name, state: s.state.abbreviation, stopCount: 1 })
  }
  return [...byCity.values()].sort((a, b) =>
    a.name === b.name ? a.state.localeCompare(b.state) : a.name.localeCompare(b.name),
  )
}

const stopInfo = (s: RawStop): StopInfo => ({
  name: s.stationName,
  short: /\((.+)\)\s*$/.exec(s.stationName)?.[1] ?? s.displayBusinessName ?? s.stationName,
  address: s.address,
})

function normalize(p: RawProduct): Trip {
  const run = p.scheduleRun
  const legs: Leg[] = []
  const layovers: Trip['layovers'] = []
  for (const seg of p.segments) {
    const last = legs.at(-1)
    if (last && last.route === seg.schedule.trueNumber && !seg.transfer) {
      last.to = stopInfo(seg.arriveStop)
      last.arrive = seg.arriveTime
      last.stopsAlongTheWay++
    } else {
      if (last) {
        const minutes = Math.round(
          (Date.parse(seg.departTime) - Date.parse(last.arrive)) / 60000,
        )
        layovers.push({ at: last.to.name, minutes })
      }
      legs.push({
        route: seg.schedule.trueNumber,
        from: stopInfo(seg.departStop),
        to: stopInfo(seg.arriveStop),
        depart: seg.departTime,
        arrive: seg.arriveTime,
        stopsAlongTheWay: 0,
      })
    }
  }

  const fareMap = new Map<string, number>()
  for (const groups of Object.values(p.railgunFares ?? {})) {
    for (const g of groups) {
      for (const f of g.fares) {
        const prev = fareMap.get(f.name)
        if (prev === undefined || f.amount < prev) fareMap.set(f.name, f.amount)
      }
    }
  }
  const fares = [...fareMap].map(([name, amount]) => ({ name, amount }))
  fares.sort((a, b) => a.amount - b.amount)

  const first = p.segments[0]
  const final = p.segments.at(-1)!
  return {
    id: run.scheduleRunUuid + first.departStop.stopId + final.arriveStop.stopId,
    depart: run.departTime,
    arrive: run.arriveTime,
    durationMin: run.travelDuration,
    transfers: legs.length - 1,
    stops: p.segments.length - 1,
    origin: stopInfo(first.departStop),
    destination: stopInfo(final.arriveStop),
    routes: legs.map((l) => l.route),
    legs,
    layovers,
    fareFrom: fares[0]?.amount ?? null,
    fares,
    processingFee: p.fees?.find((f) => /processing/i.test(f.description))?.amount ?? 0,
    seatsLeft: run.remainingCapacity,
    bookable: !run.soldOut && !run.pastSalesCutoffTime && !run.alreadyDeparted,
  }
}

async function schedules(origin: RawStop, destination: RawStop, date: string) {
  const res = await post<{ scheduleProducts?: RawProduct[] }>('v3/schedule', {
    purchaseType: 'SCHEDULE_BOOK',
    origin,
    destination,
    departDate: date,
    cityMode: false,
    isReturn: false,
    passengerCounts: { Adult: 1, Military: 0, Senior: 0, Student: 0, Child: 0 },
    fareSearchInformation: {
      outboundSpecialFareId: null,
      outboundTravelDate: date,
      returningSearch: false,
      returningTravelDate: null,
    },
  })
  return (res.scheduleProducts ?? []).map(normalize)
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>) {
  const out: R[] = new Array(items.length)
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const i = next++
      out[i] = await fn(items[i])
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return out
}

export interface TripSearch {
  trips: Trip[]
  pairsSearched: number
  pairsFailed: number
}

// Searches every stop in `fromCity` against every stop in `toCity`.
export async function searchTrips(
  fromCity: string,
  toCity: string,
  date: string,
): Promise<TripSearch> {
  const stops = await getStops()
  const origins = stops.filter((s) => cityId(s) === fromCity)
  const destinations = stops.filter((s) => cityId(s) === toCity)
  const pairs = origins.flatMap((o) => destinations.map((d) => [o, d] as const))

  let pairsFailed = 0
  const results = await mapLimit(pairs, 8, ([o, d]) =>
    schedules(o, d, date).catch(() => {
      pairsFailed++
      return [] as Trip[]
    }),
  )

  const seen = new Set<string>()
  const trips = results.flat().filter((t) => !seen.has(t.id) && seen.add(t.id))
  return { trips, pairsSearched: pairs.length, pairsFailed }
}
