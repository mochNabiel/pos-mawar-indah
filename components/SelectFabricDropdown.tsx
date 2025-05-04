import { Controller } from "react-hook-form"
import { View, Text } from "react-native"
import { Feather } from "@expo/vector-icons"
import SelectDropdown from "react-native-select-dropdown"
import { useFabricStore } from "@/lib/zustand/useFabricStore"

type SelectFabricDropdownProps = {
  control: any
  name: string
}

export const SelectFabricDropdown = ({
  control,
  name,
}: SelectFabricDropdownProps) => {
  const { fabrics, fetchAllFabrics } = useFabricStore()

  // Auto-fetch jika kosong
  if (fabrics.length === 0) fetchAllFabrics()

  return (
    <Controller
      control={control}
      name={name}
      rules={{ required: true }}
      render={({ field }) => (
        <SelectDropdown
          data={fabrics}
          search
          searchPlaceHolder="Cari kain"
          defaultValue={fabrics.find((f) => f.name === field.value)}
          onSelect={(selected) => field.onChange(selected.name)}
          renderButton={(selectedItem) => (
            <View className="border rounded-xl p-2 px-3 bg-white flex-row justify-between items-center">
              <Text className="text-md">
                {selectedItem ? selectedItem.name : "Pilih Kain"}
              </Text>
              <Feather name="chevron-down" size={16} color="gray" />
            </View>
          )}
          renderItem={(item, index, isSelected) => (
            <View
              key={index}
              className={`p-3 border-b ${
                isSelected ? "bg-gray-200" : "bg-white"
              }`}
            >
              <Text className="text-md">{item.name}</Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          disableAutoScroll={true}
          dropdownStyle={{ width: "100%", marginTop: 4 }}
        />
      )}
    />
  )
}
