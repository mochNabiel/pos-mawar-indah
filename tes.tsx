import React, { useEffect, useState } from "react"
import { View, Text, ScrollView, Dimensions } from "react-native"
import DropdownSelector from "@/components/DropdownSelector"
import { useDashboardStore } from "@/lib/zustand/useDashboardStore"
import { useFabricStore } from "@/lib/zustand/useFabricStore"
import { Card } from "@/components/ui/card"
import getMonthName from "@/lib/helper/getMonthName"
import { calculateLeastSquareForecast } from "@/lib/forecast/leastSquareForecast"
import { LineChart } from "react-native-chart-kit"

interface FabricRecap {
  name: string
  weights: number[] // berat kain per bulan dari Jan ke bulan n-1
}

interface PredictionResult {
  name: string
  predictedWeight: number
  MAE: number
  a: number // Intercept
  b: number // Slope
  previousForecasts: number[]
}

const screenWidth = Dimensions.get("window").width

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  propsForBackgroundLines: {
    stroke: "#ffffff",
  },
  strokeWidth: 2,
  shadowColor: "#ffffff",
  barPercentage: 0.5,
  decimalPlaces: 2,
  useShadowColorFromDataset: false,
  propsForDots: {
    r: "4",
  },
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
  ].slice(0, currentMonth + 1)

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
    const result = calculateLeastSquareForecast(y)

    if (!result) {
      setPredictionResult(null)
      return
    }

    setPredictionResult({
      name: fabric.name,
      predictedWeight: result.predictedWeight,
      MAE: result.MAE,
      a: result.a, // Intercept
      b: result.b, // Slope
      previousForecasts: result.previousForecasts,
    })
  }, [selectedFabric, fabrics])

  return (
    <ScrollView className="flex-1 bg-white p-5">
      <Text className="text-2xl font-bold mb-4 text-center text-self-purple">
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
        <Card variant="outline" className="rounded-lg mt-3 mb-20">
          <Text className="text-lg font-semibold mb-2">Detail Penjualan</Text>
          <Text className="mb-2">Nama Kain: {selectedFabric}</Text>

          {/* Tabel data penjualan dengan desain seperti tabel perbandingan */}
          <View className="mb-2 border-b border-gray-300 rounded-lg">
            {/* Header tabel */}
            <View className="flex-row justify-between p-0 py-2 rounded-t-lg border-b border-gray-300">
              <Text className="font-bold flex-1">Bulan</Text>
              <Text className="font-bold flex-1 text-center">
                Penjualan (kg)
              </Text>
            </View>
            {/* Baris data */}
            {fabrics
              .find((f) => f.name === selectedFabric)
              ?.weights.slice(0, currentMonth - 1)
              .map((weight, index) => (
                <View
                  key={index}
                  className="flex-row justify-between py-1 border-b border-gray-200"
                >
                  <Text className="flex-1">
                    {usedMonthLabels[index] || `Bulan ${index + 1}`}
                  </Text>
                  <Text className="flex-1 text-center">
                    {weight.toFixed(2)}
                  </Text>
                </View>
              ))}
          </View>

          {predictionResult ? (
            <>
              <Text className="text-lg font-bold mt-2 text-self-purple">
                Prediksi penjualan {getMonthName(currentMonth.toString())}{" "}
                {currentYear}: {predictionResult.predictedWeight} kg
              </Text>
              <Text className="text-lg font-bold text-self-purple">
                MAE: {predictionResult.MAE.toFixed(2)} kg
              </Text>
              <Text className="text-lg font-bold text-self-purple">
                Intercept (a): {predictionResult.a.toFixed(2)} kg
              </Text>
              <Text className="text-lg font-bold text-self-purple">
                Slope (b): {predictionResult.b.toFixed(2)} kg
              </Text>

              <View className="mt-4 p-4 bg-gray-100 rounded-lg">
                <Text className="font-semibold mb-2 text-self-purple">
                  Langkah-langkah Perhitungan:
                </Text>

                {/* Tampilkan nilai X */}
                <Text className="mb-1">
                  1. Nilai X (simetris terhadap titik tengah):{" "}
                  {(() => {
                    const n = predictionResult?.previousForecasts.length ?? 0
                    if (n === 0) return ""
                    const x = Array.from(
                      { length: n },
                      (_, i) => i - Math.floor(n / 2)
                    )
                    return "[" + x.join(", ") + "]"
                  })()}
                </Text>

                {/* Tampilkan nilai Y (data aktual) */}
                <Text className="mb-1">
                  2. Data Y (penjualan aktual):{" "}
                  {(() => {
                    if (!selectedFabric) return ""
                    const fabric = fabrics.find(
                      (f) => f.name === selectedFabric
                    )
                    if (!fabric) return ""
                    const n = predictionResult?.previousForecasts.length ?? 0
                    const y = fabric.weights.slice(0, n)
                    return "[" + y.map((v) => v.toFixed(2)).join(", ") + "]"
                  })()}
                </Text>

                <Text className="mb-1">
                  3. Intercept (a): {predictionResult?.a.toFixed(2)}
                </Text>

                <Text className="mb-1">
                  4. Slope (b): {predictionResult?.b.toFixed(2)}
                </Text>

                <Text className="mb-1">5. Model regresi: y = a + b * x</Text>

                <Text className="mb-1">
                  6. Prediksi penjualan untuk bulan Juni (x bulan terakhir + 1):{" "}
                  {predictionResult?.predictedWeight.toFixed(2)} kg
                </Text>

                <Text className="mb-1">
                  7. MAE (Mean Absolute Error):{" "}
                  {predictionResult?.MAE.toFixed(2)} kg
                </Text>
              </View>

              <View className="mt-4 mb-4">
                <Text className="font-semibold mb-2">
                  Tabel Perbandingan Penjualan:
                </Text>
                <View className="flex-row items-center justify-between border-b border-gray-300 pb-1 mb-1">
                  <Text className="font-bold flex-1">Bulan</Text>
                  <Text className="font-bold flex-1 text-center">
                    Aktual (kg)
                  </Text>
                  <Text className="font-bold flex-1 text-center">
                    Prediksi (kg)
                  </Text>
                  <Text className="font-bold flex-1 text-center">
                    Error Absolut/Selisih (kg)
                  </Text>
                </View>
                {fabrics
                  .find((f) => f.name === selectedFabric)
                  ?.weights.slice(0, currentMonth - 1)
                  .map((weight, index) => {
                    const forecast = predictionResult.previousForecasts[index]
                    const difference = Math.abs(weight - forecast) // Gunakan selisih absolute
                    return (
                      <View
                        key={index}
                        className="flex-row justify-between py-1 border-b border-gray-200"
                      >
                        <Text className="flex-1">{usedMonthLabels[index]}</Text>
                        <Text className="flex-1 text-center">
                          {weight.toFixed(2)}
                        </Text>
                        <Text className="flex-1 text-center">
                          {forecast.toFixed(2)}
                        </Text>
                        <Text className="flex-1 text-center">
                          {difference.toFixed(2)}
                        </Text>
                      </View>
                    )
                  })}
              </View>

              <Text className="font-semibold mb-2">
                Grafik Penjualan Aktual vs Prediksi
              </Text>
              <ScrollView horizontal>
                <LineChart
                  data={{
                    labels: usedMonthLabels.slice(0, currentMonth),
                    datasets: [
                      {
                        data:
                          fabrics
                            .find((f) => f.name === selectedFabric)
                            ?.weights.slice(0, currentMonth - 1)
                            .map((w) => Number(w.toFixed(2))) || [],
                        color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`,
                        strokeWidth: 3,
                        withDots: true,
                      },
                      {
                        data: [
                          ...predictionResult.previousForecasts.map((p) =>
                            Number(p.toFixed(2))
                          ),
                          predictionResult.predictedWeight,
                        ],
                        color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
                        strokeWidth: 3,
                        withDots: true,
                      },
                    ],
                    legend: ["Aktual", "Prediksi"],
                  }}
                  width={screenWidth}
                  height={260}
                  chartConfig={chartConfig}
                  fromZero={true}
                  withShadow={false}
                  style={{
                    borderRadius: 16,
                  }}
                />
              </ScrollView>
            </>
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
