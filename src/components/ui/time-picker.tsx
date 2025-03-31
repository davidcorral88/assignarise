
import * as React from "react"
import { Input } from "@/components/ui/input"

interface TimePickerDemoProps {
  value: string
  onChange: (value: string) => void
}

export function TimePickerDemo({ value, onChange }: TimePickerDemoProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <Input
      type="time"
      value={value}
      onChange={handleChange}
      className="w-full"
    />
  )
}
