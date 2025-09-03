"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format, differenceInDays, startOfYear, endOfYear, subYears, startOfQuarter, endOfQuarter, subQuarters, subMonths } from "date-fns"
import { de } from "date-fns/locale"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  className?: string
  placeholder?: string
}

export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = "Zeitraum wählen"
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(value)

  React.useEffect(() => {
    setDate(value)
  }, [value])

  const handleSelect = (newDate: DateRange | undefined) => {
    setDate(newDate)
    onChange?.(newDate)
  }

  // Quick select options
  const quickSelects = [
    {
      label: "Letztes Jahr",
      action: () => {
        const lastYear = subYears(new Date(), 1)
        handleSelect({
          from: startOfYear(lastYear),
          to: endOfYear(lastYear)
        })
      }
    },
    {
      label: "Aktuelles Jahr",
      action: () => {
        const currentYear = new Date()
        handleSelect({
          from: startOfYear(currentYear),
          to: endOfYear(currentYear)
        })
      }
    },
    {
      label: "Letztes Quartal",
      action: () => {
        const lastQuarter = subQuarters(new Date(), 1)
        handleSelect({
          from: startOfQuarter(lastQuarter),
          to: endOfQuarter(lastQuarter)
        })
      }
    },
    {
      label: "Letzte 12 Monate",
      action: () => {
        const endDate = new Date()
        const startDate = subMonths(endDate, 12)
        handleSelect({
          from: startDate,
          to: endDate
        })
      }
    }
  ]

  const formatDateRange = () => {
    if (!date?.from) return placeholder
    
    if (date.to) {
      const days = differenceInDays(date.to, date.from) + 1
      return `${format(date.from, "dd.MM.yyyy", { locale: de })} - ${format(date.to, "dd.MM.yyyy", { locale: de })} (${days} Tage)`
    }
    
    return format(date.from, "dd.MM.yyyy", { locale: de })
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b space-y-2">
            <p className="text-sm font-medium text-muted-foreground mb-2">Schnellauswahl</p>
            <div className="grid grid-cols-2 gap-2">
              {quickSelects.map((item) => (
                <Button
                  key={item.label}
                  variant="outline"
                  size="sm"
                  onClick={item.action}
                  className="justify-start text-xs"
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={de}
            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
          />
          {date?.from && date?.to && (
            <div className="p-3 border-t bg-muted/50">
              <p className="text-sm text-center">
                <span className="font-medium">{differenceInDays(date.to, date.from) + 1} Tage</span> ausgewählt
              </p>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}