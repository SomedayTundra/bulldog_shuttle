import { MapPinIcon } from 'lucide-react'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { Label } from '@/components/ui/label'
import type { City } from '@/lib/trips'

const cityLabel = (c: City) => `${c.name}, ${c.state}`

export function CityPicker({
  id,
  label,
  cities,
  value,
  onChange,
}: {
  id: string
  label: string
  cities: City[] | undefined
  value: string
  onChange: (cityId: string) => void
}) {
  const selected = cities?.find((c) => c.id === value) ?? null
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="flex items-center gap-1.5 text-maroon">
        <MapPinIcon className="size-3.5" />
        {label}
      </Label>
      <Combobox
        items={cities ?? []}
        value={selected}
        onValueChange={(c: City | null) => c && onChange(c.id)}
        itemToStringLabel={cityLabel}
        isItemEqualToValue={(a: City, b: City) => a.id === b.id}
        limit={60}
        disabled={!cities}
      >
        <ComboboxInput
          id={id}
          className="w-full bg-white"
          placeholder={cities ? 'Type a city…' : value.replace('|', ', ')}
        />
        <ComboboxContent>
          <ComboboxEmpty>No Jefferson Lines city by that name.</ComboboxEmpty>
          <ComboboxList>
            {(c: City) => (
              <ComboboxItem key={c.id} value={c}>
                <span>{cityLabel(c)}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {c.stopCount} stop{c.stopCount === 1 ? '' : 's'}
                </span>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
