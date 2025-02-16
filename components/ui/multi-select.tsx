import Select from 'react-select'
import { cn } from "@/lib/utils"

export type Option = {
  label: string
  value: string
}

interface MultiSelectProps {
  options: Option[]
  selected: Option[]
  onChange: (options: Option[]) => void
  placeholder?: string
  emptyMessage?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Selecione itens...",
  emptyMessage = "Nenhum item encontrado."
}: MultiSelectProps) {
  return (
    <Select
      isMulti
      value={selected}
      onChange={(newValue) => onChange(newValue as Option[])}
      options={options}
      placeholder={placeholder}
      noOptionsMessage={() => emptyMessage}
      unstyled
      classNames={{
        container: () => "min-w-[300px]",
        control: (state) => cn(
          "flex min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-within:ring-1 focus-within:ring-ring",
          state.isFocused && "ring-2 ring-ring ring-offset-2 ring-offset-background",
          state.isDisabled && "cursor-not-allowed opacity-50"
        ),
        valueContainer: () => "flex flex-wrap gap-1",
        multiValue: () => cn(
          "flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5",
          "dark:bg-secondary/80"
        ),
        multiValueLabel: () => "text-sm text-secondary-foreground",
        multiValueRemove: () => cn(
          "rounded-md hover:bg-secondary-hover hover:text-secondary-foreground",
          "dark:hover:bg-secondary-hover/80"
        ),
        placeholder: () => "text-muted-foreground",
        input: () => "text-sm text-foreground placeholder:text-muted-foreground",
        menu: () => cn(
          "mt-2 overflow-hidden rounded-md border border-input bg-popover text-popover-foreground shadow-md",
          "dark:bg-popover/80"
        ),
        menuList: () => "p-1",
        option: (state) => cn(
          "relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none",
          "hover:bg-accent hover:text-accent-foreground",
          state.isFocused && "bg-accent text-accent-foreground",
          state.isSelected && "bg-primary text-primary-foreground",
          "dark:hover:bg-accent/80 dark:hover:text-accent-foreground",
          state.isSelected && "dark:bg-primary/80"
        ),
        noOptionsMessage: () => "p-2 text-center text-sm text-muted-foreground"
      }}
    />
  )
}
