// Interface untuk hasil prediksi
interface ForecastResult {
  predictedWeight: number // Berat yang diprediksi untuk bulan selanjutnya
  MAE: number // Mean Absolute Error (rata-rata galat absolut)
  a: number // Intercept
  b: number // Slope
  previousForecasts: number[] // Prediksi untuk bulan sebelumnya
}

export function calculateLeastSquareForecast(
  y: number[],
): ForecastResult | null {
  const n = y.length // Jumlah data yang tersedia
  if (n < 2) return null // Pastikan ada minimal 2 data untuk perhitungan

  // Membuat array x yang simetris terhadap titik tengah data
  const x = Array.from({ length: n }, (_, i) => i - Math.floor(n / 2))

  // Hitung jumlah total penjualan y
  const sumY = y.reduce((a, b) => a + b, 0)

  // Hitung ∑xy (jumlah hasil kali setiap x dengan y)
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0)

  // Hitung ∑x² (jumlah kuadrat setiap x)
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0)

  // Hitung rata-rata y sebagai intercept (a)
  const a = sumY / n

  // Hitung slope garis regresi (b)
  const b = sumXY / sumX2

  // Tentukan nilai x untuk bulan berikutnya (xNext = nilai x bulan terakhir + 1)
  const xNext = x[x.length - 1] + 1

  // Hitung prediksi penjualan untuk bulan berikutnya berdasarkan model regresi
  const forecast = a + b * xNext

  // Membuat array prediksi untuk bulan sebelumnya
  const previousForecasts = x.map((xi) => a + b * xi)

  // Hitung error absolut tiap bulan
  const absoluteErrors = y.map((actual, i) =>
    Math.abs(actual - previousForecasts[i])
  )

  // Hitung MAE = rata-rata error absolut
  const MAE = absoluteErrors.reduce((sum, err) => sum + err, 0) / n

  // Kembalikan hasil prediksi, MAE, dan variabel yang diperlukan
  return {
    predictedWeight: parseFloat(forecast.toFixed(2)),
    MAE,
    a,
    b,
    previousForecasts,
  }
}
