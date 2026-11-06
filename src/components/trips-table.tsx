import { createColumnHelper, tableFeatures, useTable } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDuration, formatTime, type Trip } from '@/lib/trips'
import { cn } from '@/lib/utils'

const features = tableFeatures({})
const col = createColumnHelper<typeof features, Trip>()

export function TransferBadge({ trip }: { trip: Trip }) {
  if (trip.stops === 0) {
    return <Badge className="bg-emerald-600 text-white">Nonstop</Badge>
  }
  if (trip.transfers === 0) {
    return <Badge className="bg-emerald-100 text-emerald-800">Direct</Badge>
  }
  return (
    <Badge className="bg-amber-100 text-amber-800">
      {trip.transfers} transfer{trip.transfers > 1 ? 's' : ''}
    </Badge>
  )
}

const columns = col.columns([
  col.accessor('depart', {
    header: 'Depart',
    cell: (c) => <span className="font-semibold text-maroon">{formatTime(c.getValue())}</span>,
  }),
  col.accessor('arrive', {
    header: 'Arrive',
    cell: (c) => formatTime(c.getValue()),
  }),
  col.accessor('durationMin', {
    header: 'Duration',
    cell: (c) => <span className="font-semibold tabular-nums">{formatDuration(c.getValue())}</span>,
  }),
  col.accessor((t) => t.origin.short, {
    id: 'from',
    header: 'From',
    cell: (c) => <span className="inline-block min-w-32 whitespace-normal">{c.getValue()}</span>,
  }),
  col.accessor((t) => t.destination.short, {
    id: 'to',
    header: 'To',
    cell: (c) => <span className="inline-block min-w-32 whitespace-normal">{c.getValue()}</span>,
  }),
  col.display({
    id: 'type',
    header: 'Transfers',
    cell: (c) => <TransferBadge trip={c.row.original} />,
  }),
  col.accessor('stops', {
    header: 'Stops',
    cell: (c) => <span className="tabular-nums">{c.getValue()}</span>,
  }),
  col.accessor('routes', {
    header: 'Route',
    cell: (c) => (
      <span className="font-mono text-xs whitespace-nowrap">{c.getValue().join(' → ')}</span>
    ),
  }),
  col.accessor('fareFrom', {
    header: 'Fare',
    cell: (c) => {
      const v = c.getValue()
      return v == null ? '—' : <span className="tabular-nums">${v.toFixed(0)}</span>
    },
  }),
])

export function TripsTable({
  trips,
  selectedId,
  onSelect,
}: {
  trips: Trip[]
  selectedId: string | null
  onSelect: (trip: Trip) => void
}) {
  const table = useTable({ features, columns, data: trips, getRowId: (t) => t.id })

  return (
    <Table>
      <TableHeader className="bg-maroon">
        {table.getHeaderGroups().map((hg) => (
          <TableRow key={hg.id} className="hover:bg-transparent">
            {hg.headers.map((h) => (
              <TableHead key={h.id} className="font-semibold text-gold">
                <table.FlexRender header={h} />
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row, i) => {
          const selected = row.id === selectedId
          return (
            <TableRow
              key={row.id}
              onClick={() => onSelect(row.original)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(row.original)}
              tabIndex={0}
              aria-selected={selected}
              className={cn(
                'cursor-pointer focus-visible:outline-2 focus-visible:outline-gold',
                i === 0 && 'bg-gold-soft/50',
                selected && 'bg-gold-soft hover:bg-gold-soft shadow-[inset_4px_0_0_var(--umd-maroon)]',
                !row.original.bookable && 'opacity-50',
              )}
            >
              {row.getAllCells().map((cell) => (
                <TableCell key={cell.id}>
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
