import React, { useEffect, useState } from "react"
import { View, Text, ScrollView, Dimensions } from "react-native"
import DropdownSelector from "@/components/DropdownSelector"
import { useDashboardStore } from "@/lib/zustand/useDashboardStore"
import { useFabricStore } from "@/lib/zustand/useFabricStore"
import getMonthName from "@/lib/helper/getMonthName"
import { calculateLeastSquareForecast } from "@/lib/forecast/leastSquareForecast"
import { Button, ButtonText } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Feather } from "@expo/vector-icons"
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
  const [showDetail, setShowDetail] = useState<boolean>(false)

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

      {selectedFabric && predictionResult && (
        <View className="mt-3 mb-20">
          <Text className="font-semibold text-self-purple text-xl mb-2">
            {selectedFabric}
          </Text>

          {/* Tabel Penjualan Kain Bulanan */}
          <View className="mb-2 border-b border-gray-300 rounded-lg">
            <View className="flex-row justify-between p-0 py-2 rounded-t-lg border-b">
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

          {/* Hasil */}
          <Text className="text-xl font-semibold mt-2 mb-5 text-self-purple">
            Prediksi penjualan {getMonthName(currentMonth.toString())}{" "}
            {currentYear} adalah {predictionResult.predictedWeight} kg, dengan
            MAE {predictionResult.MAE.toFixed(2)} kg
          </Text>

          <Button
            variant="outline"
            onPress={() => {
              !showDetail ? setShowDetail(true) : setShowDetail(false)
            }}
            className="mb-3 rounded-lg"
          >
            {showDetail ? (
              <View className="flex-row items-center gap-1">
                <ButtonText>Sembunyikan Detail Perhitungan</ButtonText>
                <Feather name="chevron-up" size={16} />
              </View>
            ) : (
              <View className="flex-row items-center gap-1">
                <ButtonText>Tampilkan Detail Perhitungan</ButtonText>
                <Feather name="chevron-down" size={16} />
              </View>
            )}
          </Button>

          {showDetail && (
            <Card variant="outline" className="rounded-lg">
              <Text className="text-xl text-center font-semibold mb-2">
                Detail Perhitungan
              </Text>

              {/* 1. Nilai X */}
              <Text className="mb-1">
                1. Nilai X (simetris terhadap titik tengah):{" "}
                {(() => {
                  const n = predictionResult.previousForecasts.length ?? 0
                  if (n === 0) return ""
                  const x = Array.from(
                    { length: n },
                    (_, i) => i - Math.floor(n / 2)
                  )
                  return "[" + x.join(", ") + "]"
                })()}
              </Text>

              {/* 2. Nilai Y */}
              <Text className="mb-1">
                2. Data Y (penjualan aktual):{" "}
                {(() => {
                  if (!selectedFabric) return ""
                  const fabric = fabrics.find((f) => f.name === selectedFabric)
                  if (!fabric) return ""
                  const n = predictionResult.previousForecasts.length ?? 0
                  const y = fabric.weights.slice(0, n)
                  return "[" + y.map((v) => v.toFixed(2)).join(", ") + "]"
                })()}
              </Text>

              {/* 3. Tabel perhitungan X, Y, XY, dan X^2 */}
              <View className="mb-2 mt-2">
                <Text className="font-semibold text-center text-self-purple mb-2">
                  Tabel Perhitungan Nilai Trend
                </Text>
                <View className="mb-2 border-b border-gray-300 rounded-lg">
                  <View className="flex-row justify-between p-2 border-b">
                    <Text className="font-bold flex-1">X</Text>
                    <Text className="font-bold flex-1">Y</Text>
                    <Text className="font-bold flex-1">XY</Text>
                    <Text className="font-bold flex-1">X²</Text>
                  </View>
                  {(() => {
                    const n = predictionResult.previousForecasts.length ?? 0
                    const fabric = fabrics.find(
                      (f) => f.name === selectedFabric
                    )
                    if (!fabric) return null
                    const y = fabric.weights.slice(0, n)
                    const x = Array.from(
                      { length: n },
                      (_, i) => i - Math.floor(n / 2)
                    )
                    const sumY = y.reduce((acc, val) => acc + val, 0)
                    const sumXY = x.reduce((acc, val, i) => acc + val * y[i], 0)
                    const sumX2 = x.reduce((acc, val) => acc + val * val, 0)

                    return x
                      .map((val, index) => (
                        <View
                          key={index} // Pastikan key unik
                          className="flex-row justify-between py-1 border-b border-gray-200"
                        >
                          <Text className="flex-1">{val}</Text>
                          <Text className="flex-1">{y[index].toFixed(2)}</Text>
                          <Text className="flex-1">
                            {(val * y[index]).toFixed(2)}
                          </Text>
                          <Text className="flex-1">
                            {(val * val).toFixed(2)}
                          </Text>
                        </View>
                      ))
                      .concat(
                        <View
                          key="sum"
                          className="flex-row justify-between bg-self-purple/20 py-1 font-bold"
                        >
                          <Text className="flex-1">Total:</Text>
                          <Text className="flex-1">{sumY.toFixed(2)}</Text>
                          <Text className="flex-1">{sumXY.toFixed(2)}</Text>
                          <Text className="flex-1">{sumX2.toFixed(2)}</Text>
                        </View>
                      )
                  })()}
                </View>
              </View>

              {/* 4. Intercept (a) */}
              <Text className="mb-1">
                4. Intercept (a): {predictionResult.a.toFixed(2)} kg
              </Text>

              {/* 5. Slope (b) */}
              <Text className="mb-1">
                5. Slope (b): {predictionResult.b.toFixed(2)} kg
              </Text>

              {/* 6. Prediksi bulan Juni */}
              <Text className="mb-1">
                6. Prediksi penjualan (y = a + b * x) untuk bulan Juni:{" "}
                {predictionResult.predictedWeight.toFixed(2)} kg
              </Text>

              {/* 7. Tabel aktual, prediksi, dan error absolut */}
              <View className="mt-2 mb-2">
                <Text className="font-semibold text-center text-self-purple mb-2">
                  Tabel Perbandingan Penjualan
                </Text>
                <View className="flex-row items-center justify-between border-b pb-1 mb-1">
                  <Text className="font-bold flex-1">Bulan</Text>
                  <Text className="font-bold flex-1 text-center">
                    Aktual (kg)
                  </Text>
                  <Text className="font-bold flex-1 text-center">
                    Prediksi (kg)
                  </Text>
                  <Text className="font-bold flex-1 text-center">
                    Error Absolut (kg)
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
                        key={index} // Pastikan key unik
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

              {/* 8. MAE */}
              <Text className="mb-5">
                8. MAE (Mean Absolute Error): {predictionResult.MAE.toFixed(2)}{" "}
                kg
              </Text>

              {/* 9. Grafik Perbandingan Aktual vs Prediksi */}
              <View>
                <Text className="text-center font-semibold text-self-purple mb-2">
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
              </View>
            </Card>
          )}
        </View>
      )}
    </ScrollView>
  )
}

export default FabricForecastScreen
