import React, { useState, useEffect } from "react"
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input"
import { SearchIcon } from "@/components/ui/icon"
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue"

type SearchBarProps = {
  onDebouncedChange: (value: string) => void
  placeholder?: string
  debounceDelay?: number
  initialValue?: string
}

export default function SearchBar({
  onDebouncedChange,
  placeholder = "Cari...",
  debounceDelay = 700,
  initialValue = "",
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialValue)
  const debouncedQuery = useDebouncedValue(searchQuery, debounceDelay)

  useEffect(() => {
    onDebouncedChange(debouncedQuery)
  }, [debouncedQuery, onDebouncedChange])

  return (
    <Input className="flex-row gap-1 rounded-lg" size="lg">
      <InputSlot className="pl-3">
        <InputIcon as={SearchIcon} />
      </InputSlot>
      <InputField
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={placeholder}
      />
    </Input>
  )
}
