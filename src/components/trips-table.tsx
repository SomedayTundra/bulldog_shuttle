import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from 'lucide-react'
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

const features = tableFeatures({ rowSortingFeature, sortedRowModel: createSortedRowModel() })
const col = createColumnHelper<typeof features, Trip>()

export type { SortingState }

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
  col.accessor((t) => t.fareFrom ?? undefined, {
    id: 'fare',
    header: 'Fare',
    sortUndefined: 'last',
    cell: (c) => {
      const v = c.getValue()
      return v == null ? '—' : <span className="tabular-nums">${v.toFixed(0)}</span>
    },
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
  col.accessor('transfers', {
    header: 'Transfers',
    sortFn: (a, b) => a.original.transfers - b.original.transfers || a.original.stops - b.original.stops,
    cell: (c) => <TransferBadge trip={c.row.original} />,
  }),
  col.accessor('stops', {
    header: 'Stops',
    cell: (c) => <span className="tabular-nums">{c.getValue()}</span>,
  }),
  col.accessor((t) => t.routes.join(' → '), {
    id: 'route',
    header: 'Route',
    cell: (c) => (
      <span className="font-mono text-xs whitespace-nowrap">{c.getValue()}</span>
    ),
  }),
])

export function TripsTable({
  trips,
  selectedId,
  onSelect,
  sorting,
  onSortingChange,
}: {
  trips: Trip[]
  selectedId: string | null
  onSelect: (trip: Trip) => void
  sorting: SortingState
  onSortingChange: (updater: SortingState | ((old: SortingState) => SortingState)) => void
}) {
  const table = useTable({
    features,
    columns,
    data: trips,
    getRowId: (t) => t.id,
    sortDescFirst: false,
    state: { sorting },
    onSortingChange,
  })
  // The incoming order ranks trips by the user's preferences; keep marking the
  // best match even when a column sort moves it.
  const bestId = trips[0]?.id

  return (
    <Table>
      <TableHeader className="bg-maroon">
        {table.getHeaderGroups().map((hg) => (
          <TableRow key={hg.id} className="hover:bg-transparent">
            {hg.headers.map((h) => {
              const sorted = h.column.getIsSorted()
              const SortIcon = sorted === 'asc' ? ArrowUpIcon : sorted === 'desc' ? ArrowDownIcon : ArrowUpDownIcon
              return (
                <TableHead
                  key={h.id}
                  className="font-semibold text-gold"
                  aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined}
                >
                  <button
                    type="button"
                    onClick={h.column.getToggleSortingHandler()}
                    className="-mx-1 inline-flex items-center gap-1 rounded px-1 hover:text-white focus-visible:outline-2 focus-visible:outline-gold"
                  >
                    <table.FlexRender header={h} />
                    <SortIcon className={cn('size-3.5', !sorted && 'opacity-40')} />
                  </button>
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => {
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
                row.id === bestId && 'bg-gold-soft/50',
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
