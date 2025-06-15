import React, { useState, useEffect } from "react"
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
import { Button, ButtonText } from "@/components/ui/button"
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal"

interface MonthPickerProps {
  selectedMonth: string | null
  selectedYear: string | null
  onApply: (month: string | null, year: string | null) => void
}

const MonthPicker: React.FC<MonthPickerProps> = ({
  selectedMonth,
  selectedYear,
  onApply,
}) => {
  const [showModal, setShowModal] = useState(false)

  // Temp state untuk simpan pilihan sementara di modal
  const [tempMonth, setTempMonth] = useState<string | null>(selectedMonth)
  const [tempYear, setTempYear] = useState<string | null>(selectedYear)

  // Sinkronisasi temp state dengan props hanya saat modal ditutup
  useEffect(() => {
    if (!showModal) {
      setTempMonth(selectedMonth)
      setTempYear(selectedYear)
    }
  }, [selectedMonth, selectedYear, showModal])

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

  // Event handler dipanggil hanya saat user klik Terapkan
  const handleApply = () => {
    onApply(tempMonth, tempYear) // update global selected month & year lewat callback prop
    setShowModal(false)
  }

  return (
    <View>
      <Button
        variant="outline"
        size="lg"
        className="rounded-lg mb-4"
        onPress={() => setShowModal(true)}
      >
        <ButtonText>Pilih Bulan dan Tahun</ButtonText>
      </Button>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="md">
        <ModalBackdrop />
        <ModalContent>
          <ModalBody>
            <View className="w-full gap-3">
              <View>
                <Select
                  selectedValue={tempMonth ?? ""}
                  onValueChange={setTempMonth}
                  accessibilityLabel="Pilih Bulan"
                >
                  <SelectTrigger
                    variant="outline"
                    size="lg"
                    className="rounded-lg"
                  >
                    <SelectInput
                      placeholder="Pilih Bulan"
                      value={
                        tempMonth
                          ? months.find((m) => m.value === tempMonth)?.label
                          : ""
                      }
                    />
                    <SelectIcon
                      className="ml-auto mr-2"
                      size="sm"
                      as={ChevronDownIcon}
                    />
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

              <View>
                <Select
                  selectedValue={tempYear ?? ""}
                  onValueChange={setTempYear}
                  accessibilityLabel="Pilih Tahun"
                >
                  <SelectTrigger
                    variant="outline"
                    size="lg"
                    className="rounded-lg"
                  >
                    <SelectInput
                      placeholder="Pilih Tahun"
                      value={tempYear ?? ""}
                    />
                    <SelectIcon
                      className="ml-auto mr-2"
                      size="sm"
                      as={ChevronDownIcon}
                    />
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
          </ModalBody>
          <ModalFooter className="flex gap-3 items-center">
            <Button
              variant="outline"
              size="lg"
              action="secondary"
              className="rounded-lg flex-1"
              onPress={() => setShowModal(false)}
            >
              <ButtonText>Batal</ButtonText>
            </Button>
            <Button
              size="lg"
              className="rounded-lg flex-1"
              onPress={handleApply}
            >
              <ButtonText>Terapkan</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </View>
  )
}

export default MonthPicker
