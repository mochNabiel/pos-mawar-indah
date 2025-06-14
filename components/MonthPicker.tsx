import React from "react"
import { View } from "react-native"
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectItem,
} from "@/components/ui/select"
import { ChevronDownIcon } from "@/components/ui/icon"

interface MonthPickerProps {
  selectedMonth: string | null // Props untuk bulan yang dipilih
  selectedYear: string | null // Props untuk tahun yang dipilih
  onMonthChange: (month: string | null) => void // Callback untuk perubahan bulan
  onYearChange: (year: string | null) => void // Callback untuk perubahan tahun
  onApply: () => void // Callback untuk menerapkan pilihan
}

const MonthPicker: React.FC<MonthPickerProps> = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}) => {
  const months = [
    { label: "Januari", value: "1" },
    { label: "Februari", value: "2" },
    { label: "Maret", value: "3" },
    { label: "April", value: "4" },
    { label: "Mei", value: "5" },
    { label: "Juni", value: "6" },
    { label: "Juli", value: "7" },
    { label: "Agustus", value: "8" },
    { label: "September", value: "9" },
    { label: "Oktober", value: "10" },
    { label: "November", value: "11" },
    { label: "Desember", value: "12" },
  ]

  const currentYear = new Date().getFullYear()
  const yearsData = Array.from({ length: 10 }, (_, i) =>
    (currentYear - i).toString()
  )
  const years = yearsData.filter((year) => parseInt(year, 10) >= 2025)

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 mb-4">
      <View className="flex-row w-full justify-between gap-3">
        <View className="flex-1">
          <Select
            onValueChange={onMonthChange}
            selectedValue={selectedMonth || ""}
            accessibilityLabel="Pilih Bulan"
          >
            <SelectTrigger variant="outline" size="md" className="rounded-lg">
              <SelectInput
                placeholder="Pilih Bulan"
                className="text-md"
                value={
                  selectedMonth
                    ? months.find((m) => m.value === selectedMonth)?.label
                    : ""
                }
              />
              <SelectIcon className="ml-auto mr-2" size="sm" as={ChevronDownIcon} />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                {months.map((month) => (
                  <SelectItem
                    key={month.value}
                    label={month.label}
                    value={month.value}
                  />
                ))}
              </SelectContent>
            </SelectPortal>
          </Select>
        </View>

        <View className="flex-1">
          <Select
            onValueChange={onYearChange}
            selectedValue={selectedYear || ""}
            accessibilityLabel="Pilih Tahun"
          >
            <SelectTrigger variant="outline" size="md" className="rounded-lg">
              <SelectInput
                placeholder="Pilih Tahun"
                className="text-md"
                value={selectedYear || ""}
              />
              <SelectIcon className="ml-auto mr-2" size="sm" as={ChevronDownIcon} />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                {years.map((year) => (
                  <SelectItem key={year} label={year} value={year} />
                ))}
              </SelectContent>
            </SelectPortal>
          </Select>
        </View>
      </View>
    </View>
  )
}

export default MonthPicker
