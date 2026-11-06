import mascotUrl from '@/assets/mascot.svg'
import { cn } from '@/lib/utils'

// Bulldog Shuttle mascot: a gopher riding a bulldog riding a bus (original art,
// option 7 in mascot-options/). Pass title="" when the image is purely decorative.
export function Mascot({ className, title = 'Bulldog Shuttle mascot' }: { className?: string; title?: string }) {
  return (
    <img
      src={mascotUrl}
      alt={title}
      aria-hidden={title === '' || undefined}
      draggable={false}
      className={cn('shrink-0 object-contain select-none', className)}
    />
  )
}
