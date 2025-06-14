import React, { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { Button, ButtonText } from "@/components/ui/button"

import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue"
import { useRouter } from "expo-router"

interface DropdownSelectorProps {
  label: string
  placeholder: string
  value: string | null
  options: string[]
  onChange: (value: string) => void
  searchable?: boolean
  searchPlaceholder?: string
  addDataLink?: string
}

const DropdownSelector: React.FC<DropdownSelectorProps> = ({
  placeholder,
  value,
  options,
  onChange,
  searchable = false,
  searchPlaceholder = "Cari...",
  addDataLink,
}) => {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 500)

  const filteredOptions = searchable
    ? options.filter((option) =>
        option.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
    : options

  return (
    <View className="flex flex-row gap-5 items-center mb-2">
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="flex-1 flex-row items-center justify-between p-2 py-3 border border-gray-300 rounded-lg"
      >
        <Text
          className={
            value ? "text-base text-black" : "text-base text-typography-500"
          }
        >
          {value || placeholder}
        </Text>
        <Feather name="chevron-down" color="gray" />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          onPress={() => setOpen(false)}
          className="flex-1 bg-black bg-opacity-25 justify-center items-center"
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 justify-center items-center"
          >
            <Pressable>
              <View className="w-[90vw] bg-white rounded-lg shadow-lg p-4">
                {searchable && (
                  <TextInput
                    placeholder={searchPlaceholder}
                    placeholderTextColor="gray"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    className="p-2 border border-gray-300 rounded-lg mb-2"
                  />
                )}

                <ScrollView style={{ maxHeight: 200 }}>
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((item) => (
                      <TouchableOpacity
                        key={item}
                        onPress={() => {
                          onChange(item)
                          setOpen(false)
                        }}
                        className="p-3 border-b border-gray-300"
                      >
                        <Text className="text-black">{item}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View>
                      <Text className="text-center p-3">
                        Data yang dicari tidak ditemukan
                      </Text>
                      {addDataLink && (
                        <Button
                          variant="link"
                          onPress={() => {
                            router.push(addDataLink as any)
                            setOpen(false)
                          }}
                        >
                          <Feather name="plus" color="#BF40BF" />
                          <ButtonText className="text-self-purple">
                            Tambah Data
                          </ButtonText>
                        </Button>
                      )}
                    </View>
                  )}
                </ScrollView>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  )
}

export default DropdownSelector
