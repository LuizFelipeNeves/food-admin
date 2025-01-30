'use client'

import { Input } from "./input"
import { useState } from "react"

interface TimeValue {
  hours: string
  minutes: string
}

interface TimeInputProps {
  value: TimeValue
  onChange: (value: TimeValue) => void
}

export function TimeInput({ value, onChange }: TimeInputProps) {
  const [localValue, setLocalValue] = useState(value)

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let hours = e.target.value.replace(/\D/g, '')
    if (hours.length > 2) hours = hours.slice(0, 2)
    if (parseInt(hours) > 23) hours = '23'
    
    const newValue = { ...localValue, hours }
    setLocalValue(newValue)
    onChange(newValue)
  }

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let minutes = e.target.value.replace(/\D/g, '')
    if (minutes.length > 2) minutes = minutes.slice(0, 2)
    if (parseInt(minutes) > 59) minutes = '59'
    
    const newValue = { ...localValue, minutes }
    setLocalValue(newValue)
    onChange(newValue)
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        type="text"
        value={localValue.hours}
        onChange={handleHoursChange}
        className="w-12 px-1 text-center"
        maxLength={2}
      />
      <span>:</span>
      <Input
        type="text"
        value={localValue.minutes}
        onChange={handleMinutesChange}
        className="w-12 px-1 text-center"
        maxLength={2}
      />
    </div>
  )
}
