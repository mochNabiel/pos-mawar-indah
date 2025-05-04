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
import { Controller } from "react-hook-form"

type SelectQuantityTypeProps = {
  control: any
  name: string
}

const quantityTypes = [
  { label: "Ecer", value: "ecer" },
  { label: "Grosir", value: "grosir" },
  { label: "Roll", value: "roll" },
]

export const SelectQuantityType = ({
  control,
  name,
}: SelectQuantityTypeProps) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={{ required: true }}
      render={({ field }) => (
        <Select onValueChange={field.onChange} selectedValue={field.value}>
          <SelectTrigger variant="outline" size="md">
            <SelectInput placeholder="Pilih Tipe Kuantitas" />
            <SelectIcon as={ChevronDownIcon} className="mr-3" />
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent>
              <SelectDragIndicatorWrapper>
                <SelectDragIndicator />
              </SelectDragIndicatorWrapper>
              {quantityTypes.map((qt) => (
                <SelectItem key={qt.value} label={qt.label} value={qt.value} />
              ))}
            </SelectContent>
          </SelectPortal>
        </Select>
      )}
    />
  )
}
