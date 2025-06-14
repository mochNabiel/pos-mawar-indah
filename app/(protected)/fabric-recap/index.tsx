import React, { useEffect, useState } from "react"
import { FlatList, ScrollView, View } from "react-native"
import { useDashboardStore } from "@/lib/zustand/useDashboardStore"
import { Heading } from "@/components/ui/heading"
import { Text } from "@/components/ui/text"
import { Card } from "@/components/ui/card"
import MonthPicker from "@/components/MonthPicker"
import { Button, ButtonText } from "@/components/ui/button"
import { Center } from "@/components/ui/center"
import LoadingMessage from "@/components/LoadingMessage"
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal"
import getMonthName from "@/lib/helper/getMonthName"
import { Feather } from "@expo/vector-icons"

export default function FabricRecap() {
  const { loading, getFabricsRecap } = useDashboardStore()

  const [selectedMonth, setSelectedMonth] = useState<string | null>(
    new Date().getMonth() + 1 + ""
  )
  const [selectedYear, setSelectedYear] = useState<string | null>(
    new Date().getFullYear() + ""
  )
  const [showModal, setShowModal] = useState<boolean>(false)
  const [fabricsData, setFabricsData] = useState<any[]>([])

  useEffect(() => {
    fetchFabricsRecap()
  }, [selectedMonth, selectedYear])

  const fetchFabricsRecap = () => {
    const data = getFabricsRecap(selectedMonth, selectedYear)
    setFabricsData(data || [])
  }

  const handleApply = (month: string | null, year: string | null) => {
    if (month) setSelectedMonth(month)
    if (year) setSelectedYear(year)
    setShowModal(false)
  }

  if (loading) {
    return <LoadingMessage message="Memuat Data Kain..." />
  }

  return (
    <ScrollView className="p-5 bg-white flex-1">
      <View className="mb-6">
        <Heading size="2xl" className="text-self-purple mb-3">
          Rekap Kain {getMonthName(selectedMonth)} {selectedYear}
        </Heading>
        <Button
          variant="outline"
          className="rounded-lg"
          onPress={() => setShowModal(true)}
        >
          <ButtonText>Pilih Bulan dan Tahun</ButtonText>
        </Button>

        {/* Modal untuk memilih bulan dan tahun */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="md">
          <ModalBackdrop />
          <ModalContent>
            <ModalBody>
              <MonthPicker
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onMonthChange={setSelectedMonth}
                onYearChange={setSelectedYear}
                onApply={() => handleApply(selectedMonth, selectedYear)}
              />
            </ModalBody>
            <ModalFooter className="flex-row gap-3 items-center">
              <Button
                variant="outline"
                action="secondary"
                className="rounded-lg flex-1"
                onPress={() => setShowModal(false)}
              >
                <ButtonText>Batal</ButtonText>
              </Button>
              <Button
                className="rounded-lg flex-1"
                onPress={() => handleApply(selectedMonth, selectedYear)}
              >
                <ButtonText>Terapkan</ButtonText>
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </View>

      {/* List of Fabrics */}
      {fabricsData.length === 0 ? (
        <Center>
          <Text className="text-center text-self-purple mt-5">
            Tidak ada data kain untuk bulan ini.
          </Text>
        </Center>
      ) : (
        <FlatList
          data={fabricsData}
          keyExtractor={(item) => item.fabricName}
          renderItem={({ item }) => (
            <Card size="md" variant="outline" className="rounded-lg mb-3">
              <View className="gap-1">
                <Heading size="lg">{item.fabricName}</Heading>
                <View className="flex-row items-center gap-2">
                  <Feather name="package" size={20} color="#BF40BF" />
                  <Text className="text-self-purple text-lg font-semibold">
                    {item.totalWeight.toFixed(2)} kg
                  </Text>
                </View>
              </View>
            </Card>
          )}
        />
      )}
    </ScrollView>
  )
}
