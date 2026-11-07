import { useQuery } from '@tanstack/react-query'
import { ArrowLeftRightIcon, CalendarIcon, SunIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Mascot } from '@/components/mascot'
import { CityPicker } from '@/components/city-picker'
import { TripDetails } from '@/components/trip-details'
import { TripsTable, type SortingState } from '@/components/trips-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  TIME_OF_DAY,
  applyPreferences,
  fetchCities,
  fetchTrips,
  formatDate,
  today,
  type Preferences,
  type TimeOfDay,
} from '@/lib/trips'
import { useStoredState } from '@/lib/use-stored-state'

const DEFAULT_PREFS: Preferences = {
  timeOfDay: 'any',
  allowTransfers: false,
  minimizeStops: true,
  preferShortest: true,
}

const DEFAULT_SORTING: SortingState = [{ id: 'depart', desc: false }]

const isCityId = (v: unknown): v is string => typeof v === 'string' && v.includes('|')

const isPreferences = (v: unknown): v is Preferences => {
  if (typeof v !== 'object' || v === null) return false
  const p = v as Record<string, unknown>
  return (
    TIME_OF_DAY.some((t) => t.value === p.timeOfDay) &&
    typeof p.allowTransfers === 'boolean' &&
    typeof p.minimizeStops === 'boolean' &&
    typeof p.preferShortest === 'boolean'
  )
}

function Toggle({
  id,
  label,
  checked,
  onChange,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2">
      <Label htmlFor={id} className="text-maroon">
        {label}
      </Label>
      <div className="flex items-center gap-2 text-xs font-semibold">
        <span className={checked ? 'text-maroon' : 'text-muted-foreground'}>{checked ? 'Yes' : 'No'}</span>
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={onChange}
          className="data-checked:bg-maroon"
        />
      </div>
    </div>
  )
}

export default function App() {
  const [from, setFrom] = useStoredState('from', 'Duluth|MN', isCityId)
  const [to, setTo] = useStoredState('to', 'Minneapolis|MN', isCityId)
  const [date, setDate] = useState(today)
  const [prefs, setPrefs] = useStoredState('prefs', DEFAULT_PREFS, isPreferences)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // Lives here (not in TripsTable) so a filter change keeps it; a new search resets it.
  const [sorting, setSorting] = useState<SortingState>(DEFAULT_SORTING)
  const searchKey = `${from}>${to}@${date}`
  const [sortedFor, setSortedFor] = useState(searchKey)
  if (sortedFor !== searchKey) {
    setSortedFor(searchKey)
    setSorting(DEFAULT_SORTING)
  }
  const setPref = <K extends keyof Preferences>(k: K, v: Preferences[K]) =>
    setPrefs((p) => ({ ...p, [k]: v }))

  const cities = useQuery({ queryKey: ['cities'], queryFn: fetchCities, staleTime: Infinity })
  const search = useQuery({
    queryKey: ['trips', from, to, date],
    queryFn: () => fetchTrips(from, to, date),
    enabled: from !== to && !!date,
    staleTime: 5 * 60 * 1000,
  })

  const trips = useMemo(
    () => applyPreferences(search.data?.trips ?? [], prefs),
    [search.data, prefs],
  )
  const selected = trips.find((t) => t.id === selectedId) ?? null
  const hiddenCount = (search.data?.trips.length ?? 0) - trips.length

  return (
    <div className="relative min-h-svh overflow-x-hidden">
      <Mascot
        title=""
        className="pointer-events-none fixed -right-24 -bottom-24 size-[28rem] opacity-[0.06]"
      />

      <header className="border-b-4 border-gold bg-maroon text-white">
        <div className="mx-auto flex max-w-[96rem] items-center gap-4 px-4 py-4">
          <Mascot className="size-18 drop-shadow-md" />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Bulldog <span className="text-gold">Shuttle</span>
            </h1>
            <p className="text-sm text-white/80">
              Sniffs every Jefferson Lines stop in both cities so you don't have to.
            </p>
          </div>
        </div>
      </header>

      <main className="relative mx-auto grid max-w-[96rem] gap-6 px-4 py-6">
        <Card className="border-gold/60">
          <CardContent className="grid gap-4">
            <div className="grid items-end gap-3 md:grid-cols-[1fr_auto_1fr_12rem_12rem]">
              <CityPicker id="from" label="Departure city" cities={cities.data} value={from} onChange={setFrom} />
              <Button
                variant="outline"
                size="icon"
                aria-label="Swap cities"
                className="mb-0.5 justify-self-center border-maroon text-maroon hover:bg-gold-soft"
                onClick={() => {
                  setFrom(to)
                  setTo(from)
                }}
              >
                <ArrowLeftRightIcon />
              </Button>
              <CityPicker id="to" label="Arrival city" cities={cities.data} value={to} onChange={setTo} />
              <div className="grid gap-1.5">
                <Label htmlFor="date" className="flex items-center gap-1.5 text-maroon">
                  <CalendarIcon className="size-3.5" /> Travel date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => e.target.value && setDate(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="tod" className="flex items-center gap-1.5 text-maroon">
                  <SunIcon className="size-3.5" /> Departure time
                </Label>
                <Select
                  items={TIME_OF_DAY}
                  value={prefs.timeOfDay}
                  onValueChange={(v) => v && setPref('timeOfDay', v as TimeOfDay)}
                >
                  <SelectTrigger id="tod" className="w-full bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OF_DAY.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                        <span className="ml-auto text-xs text-muted-foreground">{t.hint}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Toggle id="transfers" label="Allow transfers?" checked={prefs.allowTransfers} onChange={(v) => setPref('allowTransfers', v)} />
              <Toggle id="stops" label="Minimize stops?" checked={prefs.minimizeStops} onChange={(v) => setPref('minimizeStops', v)} />
              <Toggle id="shortest" label="Prefer shortest trips?" checked={prefs.preferShortest} onChange={(v) => setPref('preferShortest', v)} />
            </div>
            {cities.isError && (
              <p className="text-sm text-red-700">Couldn't load the city list: {cities.error.message}</p>
            )}
          </CardContent>
        </Card>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]">
          <section className="grid gap-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold text-maroon">
                {from.split('|')[0]} → {to.split('|')[0]}
                <span className="ml-2 text-sm font-normal text-muted-foreground">{formatDate(date)}</span>
              </h2>
              {search.data && (
                <p className="text-sm text-muted-foreground">
                  <strong className="text-maroon">{trips.length}</strong> trip{trips.length === 1 ? '' : 's'}
                  {hiddenCount > 0 && <> ({hiddenCount} hidden by your filters)</>} from{' '}
                  {search.data.pairsSearched} stop pair{search.data.pairsSearched === 1 ? '' : 's'}
                  {search.data.pairsFailed > 0 && (
                    <span className="text-amber-700"> · {search.data.pairsFailed} failed</span>
                  )}
                </p>
              )}
            </div>

            <Card className="overflow-hidden py-0">
              {from === to ? (
                <Empty message="Pick two different cities." />
              ) : search.isPending ? (
                <Loading />
              ) : search.isError ? (
                <Empty message={`Search failed: ${search.error.message}`} />
              ) : trips.length === 0 ? (
                <Empty
                  message={
                    search.data.trips.length
                      ? 'No trips match your filters. Try allowing transfers or another time of day.'
                      : 'No Jefferson Lines trips between these cities on this date.'
                  }
                />
              ) : (
                <TripsTable
                  trips={trips}
                  selectedId={selected?.id ?? null}
                  onSelect={(t) => setSelectedId(t.id)}
                  sorting={sorting}
                  onSortingChange={setSorting}
                />
              )}
            </Card>
            {trips.length > 0 && (
              <p className="text-xs text-muted-foreground">
                The highlighted row is the best match for your preferences. Click a column header to sort, or any trip for
                step-by-step instructions.
              </p>
            )}
          </section>

          <aside className="xl:sticky xl:top-4">
            {selected ? (
              <TripDetails trip={selected} date={date} />
            ) : (
              <Card className="items-center border-dashed border-maroon/40 bg-white/70 py-10 text-center">
                <Mascot className="size-24" />
                <p className="max-w-56 text-sm text-muted-foreground">
                  Pick a trip from the table and I'll fetch your boarding instructions.
                </p>
              </Card>
            )}
          </aside>
        </div>
      </main>

      <footer className="relative mx-auto max-w-[96rem] px-4 pb-8 text-xs text-muted-foreground">
        Unofficial tool. Schedules and fares come live from Jefferson Lines; always confirm before you buy. Not affiliated with
        Jefferson Lines or the University of Minnesota Duluth.
      </footer>
    </div>
  )
}

function Loading() {
  return (
    <div className="grid gap-3 p-6">
      <div className="flex items-center gap-3 text-maroon">
        <Mascot className="size-12 animate-bounce" />
        <p className="font-semibold">Sniffing out routes at every stop…</p>
      </div>
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="h-8 w-full bg-gold-soft" />
      ))}
    </div>
  )
}

function Empty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-10 text-center text-muted-foreground">
      <Mascot className="size-16 opacity-70" />
      <p className="max-w-sm">{message}</p>
    </div>
  )
}
