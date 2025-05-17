import React from "react"
import { View, Text } from "react-native"
import { Button, ButtonText } from "@/components/ui/button"
import { Feather } from "@expo/vector-icons"

interface PaginationFooterProps {
  currentPage: number
  hasMore: boolean
  loading: boolean
  onPrev: () => void
  onNext: () => void
}

// Komponen footer pagination dengan tombol prev/next dan info halaman
export function PaginationFooter({
  currentPage,
  hasMore,
  loading,
  onPrev,
  onNext,
}: PaginationFooterProps) {
  return (
    <View className="w-full flex-row items-center justify-between mb-20">
      <Button
        onPress={onPrev}
        isDisabled={currentPage === 1 || loading}
        size="lg"
        className="rounded-lg"
      >
        <ButtonText>
          <Feather name="arrow-left" size={24} />
        </ButtonText>
      </Button>
      <Text className="text-lg font-semibold px-2">Halaman {currentPage}</Text>
      <Button
        onPress={onNext}
        isDisabled={!hasMore || loading}
        size="lg"
        className="rounded-lg"
      >
        <ButtonText>
          <Feather name="arrow-right" size={24} />
        </ButtonText>
      </Button>
    </View>
  )
}
