import { ArrowRightIcon, ClockIcon, ExternalLinkIcon, RepeatIcon, TicketIcon, UsersIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Mascot } from '@/components/mascot'
import { TransferBadge } from '@/components/trips-table'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatDate, formatDuration, formatTime, type Trip } from '@/lib/trips'
import { cn } from '@/lib/utils'

const BOOKING_URL = 'https://ride.jeffersonlines.com/'

const Time = ({ iso }: { iso: string }) => (
  <strong className="font-bold whitespace-nowrap text-maroon">{formatTime(iso)}</strong>
)
const Place = ({ children }: { children: ReactNode }) => (
  <mark className="rounded bg-gold px-1 py-0.5 font-semibold text-maroon-dark">{children}</mark>
)
const Route = ({ children }: { children: ReactNode }) => (
  <Badge className="bg-maroon font-mono text-gold">{children}</Badge>
)

function Step({ n, tone = 'maroon', children }: { n: ReactNode; tone?: 'maroon' | 'amber' | 'green'; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        className={cn(
          'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold',
          tone === 'maroon' && 'bg-maroon text-gold',
          tone === 'amber' && 'bg-amber-500 text-white',
          tone === 'green' && 'bg-emerald-600 text-white',
        )}
      >
        {n}
      </span>
      <div className="leading-relaxed">{children}</div>
    </li>
  )
}

export function TripDetails({ trip, date }: { trip: Trip; date: string }) {
  let n = 0
  return (
    <Card className="overflow-hidden border-2 border-maroon pt-0">
      <CardHeader className="relative bg-maroon pt-4 pb-4 text-white">
        <Mascot className="absolute -top-3 right-2 size-20 opacity-90" title="" />
        <CardDescription className="text-gold">{formatDate(date)}</CardDescription>
        <CardTitle className="pr-20 text-xl">
          {formatTime(trip.depart)} <ArrowRightIcon className="inline size-4 text-gold" /> {formatTime(trip.arrive)}
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2 pt-1 text-sm">
          <span className="flex items-center gap-1">
            <ClockIcon className="size-4 text-gold" />
            {formatDuration(trip.durationMin)}
          </span>
          <TransferBadge trip={trip} />
          <span className="flex items-center gap-1">
            <UsersIcon className="size-4 text-gold" />
            {trip.seatsLeft} seats left
          </span>
        </div>
      </CardHeader>

      <CardContent className="grid gap-5 pt-1">
        {!trip.bookable && (
          <p className="rounded-md bg-red-50 p-2 text-sm font-medium text-red-700">
            This departure is sold out or past its sales cutoff.
          </p>
        )}

        <section>
          <h3 className="mb-2 text-sm font-bold tracking-wide text-maroon uppercase">Your trip</h3>
          <ol className="grid gap-3 text-sm">
            {trip.legs.map((leg, i) => (
              <div key={i} className="contents">
                {i > 0 && (
                  <Step n={<RepeatIcon className="size-3.5" />} tone="amber">
                    <span className="font-semibold text-amber-700">Transfer</span> at <Place>{leg.from.name}</Place>.{' '}
                    <span className="font-semibold text-amber-700">
                      {formatDuration(trip.layovers[i - 1]?.minutes ?? 0)} layover
                    </span>
                    .
                  </Step>
                )}
                <Step n={++n}>
                  Board <Route>{leg.route}</Route> at <Place>{leg.from.name}</Place>
                  {i === 0 && <span className="text-muted-foreground"> ({leg.from.address})</span>} at{' '}
                  <Time iso={leg.depart} />.{' '}
                  {leg.stopsAlongTheWay === 0 ? (
                    <span className="font-semibold text-emerald-700">No stops</span>
                  ) : (
                    <span>
                      {leg.stopsAlongTheWay} stop{leg.stopsAlongTheWay > 1 ? 's' : ''} along the way
                    </span>
                  )}{' '}
                  to <Place>{leg.to.name}</Place>, arriving <Time iso={leg.arrive} />.
                </Step>
              </div>
            ))}
            <Step n="✓" tone="green">
              Arrive at <Place>{trip.destination.name}</Place>{' '}
              <span className="text-muted-foreground">({trip.destination.address})</span> at{' '}
              <Time iso={trip.arrive} />.
            </Step>
          </ol>
        </section>

        <Separator />

        <section>
          <h3 className="mb-2 text-sm font-bold tracking-wide text-maroon uppercase">To book</h3>
          <ol className="grid gap-3 text-sm">
            <Step n={1}>
              Open <span className="font-semibold">ride.jeffersonlines.com</span> and choose <strong>one-way</strong>.
            </Step>
            <Step n={2}>
              From: <Place>{trip.origin.name}</Place> · To: <Place>{trip.destination.name}</Place> · Date:{' '}
              <strong className="text-maroon">{formatDate(date)}</strong>
            </Step>
            <Step n={3}>
              Pick the <Time iso={trip.depart} /> departure on{' '}
              {trip.routes.map((r, i) => (
                <span key={r}>
                  {i > 0 && ' → '}
                  <Route>{r}</Route>
                </span>
              ))}
              .
            </Step>
          </ol>
        </section>

        {trip.fares.length > 0 && (
          <div className="rounded-lg bg-gold-soft p-3 text-sm">
            <div className="mb-1 flex items-center gap-1.5 font-bold text-maroon">
              <TicketIcon className="size-4" /> Fares (1 adult, one-way)
            </div>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              {trip.fares.map((f) => (
                <li key={f.name} className="flex justify-between gap-2">
                  <span className="truncate text-muted-foreground">{f.name}</span>
                  <span className={cn('tabular-nums', f.amount === trip.fareFrom && 'font-bold text-maroon')}>
                    ${f.amount.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            {trip.processingFee > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                Plus a ${trip.processingFee.toFixed(2)} processing fee. Prices can change before you buy.
              </p>
            )}
          </div>
        )}

        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ size: 'lg' }), 'w-full bg-maroon text-gold hover:bg-maroon-dark')}
        >
          Book on Jefferson Lines <ExternalLinkIcon />
        </a>
      </CardContent>
    </Card>
  )
}
