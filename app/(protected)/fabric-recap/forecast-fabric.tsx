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
  predictedWeight: number // Berat yang diprediksi untuk bulan selanjutnya
  MAE: number // Mean Absolute Error (rata-rata absolut error)
  MAPE: number // Mean Absolute Percentage Error (rata-rata persentase absolut error)
  a: number // Intercept
  b: number // Slope
  previousForecasts: number[] // Prediksi untuk bulan sebelumnya
  x: number[] // Array nilai x
  y: number[] // Array nilai y
  absoluteErrors: number[] // Array error absolut
  percentageErrors: number[] // Array persentase error
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
      MAPE: result.MAPE,
      a: result.a, // Intercept
      b: result.b, // Slope
      previousForecasts: result.previousForecasts,
      x: result.x, // Array nilai x
      y: result.y, // Array nilai y
      absoluteErrors: result.absoluteErrors, // Array error absolut
      percentageErrors: result.percentageErrors, // Array persentase error
    })
  }, [selectedFabric, fabrics])

  return (
    <ScrollView className="flex-1 bg-white p-5">
      <Text className="text-2xl font-bold mb-4 text-center text-self-purple">
        Prediksi Stok Kain Bulan {getMonthName(currentMonth.toString())}{" "}
        {currentYear}
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
              <Text className="font-bold flex-1">Periode</Text>
              <Text className="font-bold flex-1 text-center">
                Penjualan (kg)
              </Text>
            </View>
            {/* Baris data */}
            {predictionResult.y.map((weight, index) => (
              <View
                key={index}
                className="flex-row justify-between py-1 border-b border-gray-200"
              >
                <Text className="flex-1">
                  {usedMonthLabels[index] || `Bulan ${index + 1}`} {currentYear}
                </Text>
                <Text className="flex-1 text-center">{weight.toFixed(2)}</Text>
              </View>
            ))}
          </View>

          {/* Hasil */}
          <Text className="text-xl font-semibold text-self-purple">
            Prediksi penjualan {getMonthName(currentMonth.toString())}{" "}
            {currentYear} adalah {predictionResult.predictedWeight} kg
          </Text>
          <Text className="text-xl font-semibold text-self-purple">
            MAE = {predictionResult.MAE.toFixed(2)} kg
          </Text>
          <Text className="text-xl font-semibold text-self-purple">
            MAPE = {predictionResult.MAPE.toFixed(2)} %
          </Text>

          <Button
            variant="outline"
            onPress={() => setShowDetail(!showDetail)}
            className="mb-3 mt-5 rounded-lg"
          >
            <View className="flex-row items-center gap-1">
              <ButtonText>
                {showDetail
                  ? "Sembunyikan Detail Perhitungan"
                  : "Tampilkan Detail Perhitungan"}
              </ButtonText>
              <Feather
                name={showDetail ? "chevron-up" : "chevron-down"}
                size={16}
              />
            </View>
          </Button>

          {showDetail && (
            <Card variant="outline" className="rounded-lg">
              <Text className="text-xl text-center font-semibold mb-2">
                Detail Perhitungan
              </Text>

              {/* 1. Nilai X */}
              <Text className="mb-1">
                1. Nilai X: [{predictionResult.x.join(", ")}]
              </Text>

              {/* 2. Nilai Y */}
              <Text className="mb-1">
                2. Data Y: [
                {predictionResult.y.map((v) => v.toFixed(2)).join(", ")}]
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
                    <Text className="font-bold flex-1">X²</Text>
                    <Text className="font-bold flex-1">XY</Text>
                  </View>
                  {predictionResult.x.map((val, index) => (
                    <View
                      key={index}
                      className="flex-row justify-between py-1 border-b border-gray-200"
                    >
                      <Text className="flex-1">{val}</Text>
                      <Text className="flex-1">
                        {predictionResult.y[index].toFixed(2)}
                      </Text>
                      <Text className="flex-1">{(val * val).toFixed(2)}</Text>
                      <Text className="flex-1">
                        {(val * predictionResult.y[index]).toFixed(2)}
                      </Text>
                    </View>
                  ))}
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

              {/* 6. Prediksi bulan depan */}
              <Text className="mb-1">
                6. Prediksi penjualan {currentMonth} {currentYear}:{" "}
                {predictionResult.predictedWeight.toFixed(2)} kg
              </Text>

              {/* 7. Tabel aktual, prediksi, dan error absolut */}
              <View className="mt-2 mb-2">
                <Text className="font-semibold text-center text-self-purple mb-2">
                  Tabel Perbandingan Penjualan
                </Text>
                <View className="flex-row items-center justify-between border-b pb-1 mb-1">
                  <Text className="font-bold flex-1">Periode</Text>
                  <Text className="font-bold flex-1 text-center">
                    Aktual (kg)
                  </Text>
                  <Text className="font-bold flex-1 text-center">
                    Prediksi (kg)
                  </Text>
                  <Text className="font-bold flex-1 text-center">
                    Error Absolut (kg)
                  </Text>
                  <Text className="font-bold flex-1 text-center">
                    Persentase Error (%)
                  </Text>
                </View>
                {predictionResult.y.map((weight, index) => {
                  const forecast = predictionResult.previousForecasts[index]
                  const difference = Math.abs(weight - forecast)
                  const percentageError =
                    weight === 0 ? 0 : (difference / weight) * 100
                  return (
                    <View
                      key={index}
                      className="flex-row justify-between py-1 border-b border-gray-200"
                    >
                      <Text className="flex-1">
                        {usedMonthLabels[index]} {currentYear}
                      </Text>
                      <Text className="flex-1 text-center">
                        {weight.toFixed(2)}
                      </Text>
                      <Text className="flex-1 text-center">
                        {forecast.toFixed(2)}
                      </Text>
                      <Text className="flex-1 text-right">
                        {difference.toFixed(2)}
                      </Text>
                      <Text className="flex-1 text-right">
                        {percentageError.toFixed(2)} %
                      </Text>
                    </View>
                  )
                })}
              </View>

              {/* 8. MAE */}
              <Text className="mt-5">
                8. MAE (Mean Absolute Error): {predictionResult.MAE.toFixed(2)}{" "}
                kg
              </Text>

              {/* 9. MAPE */}
              <Text className="mb-5">
                9. MAPE (Mean Absolute Percentage Error):{" "}
                {predictionResult.MAPE.toFixed(2)} % (mengabaikan nilai
                penjualan 0)
              </Text>

              {/* 10. Grafik Perbandingan Aktual vs Prediksi */}
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
                            predictionResult.y.map((w) =>
                              Number(w.toFixed(2))
                            ) || [],
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
