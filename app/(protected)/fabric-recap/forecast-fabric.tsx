import React, { useEffect, useState } from "react"
import { View, Text, ScrollView } from "react-native"
import DropdownSelector from "@/components/DropdownSelector"
import { useDashboardStore } from "@/lib/zustand/useDashboardStore"
import { useFabricStore } from "@/lib/zustand/useFabricStore"
import { Card } from "@/components/ui/card"
import getMonthName from "@/lib/helper/getMonthName"
import { calculateLeastSquareForecast } from "@/lib/forecast/leastSquareForecast"

interface FabricRecap {
  name: string
  weights: number[] // berat kain per bulan dari Jan ke bulan n-1
}

interface PredictionResult {
  name: string
  predictedWeight: number
}

const FabricForecastScreen = () => {
  const [selectedFabric, setSelectedFabric] = useState<string | null>(null)
  const [predictionResult, setPredictionResult] =
    useState<PredictionResult | null>(null)
  const [calculationDetail, setCalculationDetail] = useState<string | null>(
    null
  )

  const [fabrics, setFabrics] = useState<FabricRecap[]>([])
  const { fabrics: fabricNames, fetchAllFabrics } = useFabricStore()
  const { getFabricsRecap } = useDashboardStore()

  const now = new Date()
  const currentMonth = now.getMonth() + 1 // Karena dimulai dari 0
  const currentYear = now.getFullYear()
  const usedMonthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ].slice(0, currentMonth)

  useEffect(() => {
    fetchAllFabrics()
    const monthlyData: FabricRecap[] = []

    for (let m = 1; m <= currentMonth; m++) {
      const recap = getFabricsRecap(m.toString(), currentYear.toString())
      recap.forEach((item: any) => {
        const fabricName = item?.fabricName
        const weight =
          typeof item?.totalWeight === "number" ? item.totalWeight : 0

        if (!fabricName || typeof fabricName !== "string") return

        const existingFabric = monthlyData.find((f) => f.name === fabricName)
        if (existingFabric) {
          existingFabric.weights[m - 1] = weight
        } else {
          const newFabric: FabricRecap = {
            name: fabricName,
            weights: new Array(12).fill(0),
          }
          newFabric.weights[m - 1] = weight
          monthlyData.push(newFabric)
        }
      })
    }
    setFabrics(monthlyData)
  }, [fetchAllFabrics, getFabricsRecap, currentMonth, currentYear])

  useEffect(() => {
    if (!selectedFabric) {
      setPredictionResult(null)
      return
    }

    const fabric = fabrics.find((f) => f.name === selectedFabric)
    if (!fabric) {
      setPredictionResult(null)
      return
    }

    const y = fabric.weights.slice(0, currentMonth - 1)
    const result = calculateLeastSquareForecast(y, currentMonth, currentYear)

    if (!result) {
      setPredictionResult(null)
      return
    }

    setPredictionResult({
      name: fabric.name,
      predictedWeight: result.predictedWeight,
    })
    setCalculationDetail(result.detail)
  }, [selectedFabric, fabrics])

  return (
    <ScrollView className="flex-1 bg-white p-5">
      <Text className="text-xl font-bold mb-4 text-center text-self-purple">
        Prediksi Stok Kain Bulan Ini
      </Text>

      <DropdownSelector
        label="Pilih Kain"
        placeholder="Pilih kain"
        options={fabricNames.map((f) => f.name)}
        value={selectedFabric}
        onChange={setSelectedFabric}
        searchable
        searchPlaceholder="Cari Nama Kain..."
      />

      {selectedFabric && (
        <Card variant="outline" className="mt-3">
          <Text className="text-lg font-semibold mb-2">Detail Penjualan</Text>
          <Text className="mb-2">Nama Kain: {selectedFabric}</Text>

          <View className="mb-2">
            {fabrics
              .find((f) => f.name === selectedFabric)
              ?.weights.slice(0, currentMonth - 1)
              .map((weight, index) => (
                <Text key={index}>
                  Penjualan {usedMonthLabels[index] || `Bulan ${index + 1}`}:{" "}
                  {weight.toFixed(2)} kg
                </Text>
              ))}
          </View>

          {predictionResult ? (
            <Text className="text-lg font-bold mt-2 text-self-purple">
              Prediksi penjualan {getMonthName(currentMonth.toString())}{" "}
              {currentYear}: {predictionResult.predictedWeight} kg
            </Text>
          ) : (
            <Text className="mt-2 text-gray-500">
              Tidak cukup data untuk prediksi
            </Text>
          )}

          {calculationDetail && (
            <Card variant="filled" className="rounded-lg mt-4">
              <Text className="font-semibold mb-1">Detail Perhitungan:</Text>
              <Text className="font-mono text-sm whitespace-pre-wrap">
                {calculationDetail}
              </Text>
            </Card>
          )}
        </Card>
      )}
    </ScrollView>
  )
}

export default FabricForecastScreen
