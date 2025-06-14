import React, { useEffect, useState } from "react"
import { View, Text, ScrollView } from "react-native"
import DropdownSelector from "@/components/DropdownSelector"
import { useDashboardStore } from "@/lib/zustand/useDashboardStore"
import { useFabricStore } from "@/lib/zustand/useFabricStore"
import { Card } from "@/components/ui/card"

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

    // Ambil data y: dari bulan Januari sampai bulan sekarang - 1
    const y = fabric.weights.slice(0, currentMonth - 1)
    const n = y.length

    if (n < 2) {
      setPredictionResult(null)
      return
    }

    // Buat x yang simetris terhadap pusat (misal n=5 → x=[-2,-1,0,1,2])
    const x = Array.from({ length: n }, (_, i) => i - Math.floor(n / 2))

    // Hitung parameter a dan b
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0)
    const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0)

    const a = sumY / n
    const b = sumXY / sumX2

    const xNext = x[x.length - 1] + 1 // Prediksi di titik waktu selanjutnya
    const forecast = a + b * xNext

    setPredictionResult({
      name: fabric.name,
      predictedWeight: parseFloat(forecast.toFixed(2)),
    })
  }, [selectedFabric, fabrics])

  return (
    <ScrollView className="flex-1 bg-white p-5">
      <Text className="text-xl font-bold mb-4">
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
            <Text className="mt-2 font-semibold text-green-600">
              Prediksi Bulan Ini: {predictionResult.predictedWeight} kg
            </Text>
          ) : (
            <Text className="mt-2 text-gray-500">
              Tidak cukup data untuk prediksi
            </Text>
          )}
        </Card>
      )}
    </ScrollView>
  )
}

export default FabricForecastScreen
