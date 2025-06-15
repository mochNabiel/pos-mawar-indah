import getMonthName from "../helper/getMonthName"

interface ForecastResult {
  predictedWeight: number // Berat yang diprediksi
  detail: string // Detail langkah perhitungan
}

export function calculateLeastSquareForecast(
  y: number[], // Data penjualan per bulan
  currentMonth: number, // Bulan saat ini
  currentYear: number // Tahun saat ini
): ForecastResult | null {
  const n = y.length // Menghitung jumlah data penjualan
  if (n < 2) return null // Pastikan ada cukup data untuk perhitungan

  // Membuat array x yang simetris terhadap titik tengah
  const x = Array.from({ length: n }, (_, i) => i - Math.floor(n / 2))

  // Menghitung jumlah total dari y
  const sumY = y.reduce((a, b) => a + b, 0)

  // Menghitung jumlah hasil kali x dan y (∑xy)
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0)

  // Menghitung jumlah kuadrat dari x (∑x²)
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0)

  // Menghitung rata-rata y (a)
  const a = sumY / n

  // Menghitung kemiringan garis (b)
  const b = sumXY / sumX2

  // Nilai x untuk bulan berikutnya
  const xNext = x[x.length - 1] + 1

  // Menghitung prediksi penjualan untuk bulan berikutnya
  const forecast = a + b * xNext

  // Menghitung langkah-langkah hasil kali x dan y
  const xySteps = x
    .map((xi, i) => `${xi} × ${y[i].toFixed(2)} = ${(xi * y[i]).toFixed(2)}`)
    .join("\n   ")

  // Menghitung langkah-langkah kuadrat dari x
  const x2Steps = x.map((xi) => `${xi}² = ${xi * xi}`).join("\n   ")

  // Menyusun detail perhitungan
  const detail = `
1. Ambil data penjualan kain dari bulan Januari hingga bulan sebelumnya (total ${n} bulan):
   y = [${y.map((val) => val.toFixed(2)).join(", ")}] (dalam satuan kg)

2. Tentukan nilai x yang simetris terhadap titik tengah:
   x = [${x.join(", ")}]

3. Hitung jumlah total:
   a. Jumlah hasil kali x dan y (∑xy):
   ${xySteps}
   ∑xy = ${sumXY.toFixed(2)}

   b. Jumlah kuadrat dari x (∑x²):
   ${x2Steps}
   ∑x² = ${sumX2}

4. Hitung rata-rata y (a):
   a = ∑y / n = ${sumY.toFixed(2)} / ${n} = ${a.toFixed(2)}

5. Hitung kemiringan garis (b):
   b = ∑xy / ∑x² = ${sumXY.toFixed(2)} / ${sumX2} = ${b.toFixed(2)}

6. Prediksi penjualan untuk bulan berikutnya:
   - Gunakan x selanjutnya = ${xNext}
   - Gunakan rumus: y = a + b * x
   - y = ${a.toFixed(2)} + (${b.toFixed(2)} × ${xNext}) = ${forecast.toFixed(2)}

Jadi, prediksi penjualan kain untuk bulan ${getMonthName(
    currentMonth.toString()
  )} ${currentYear} adalah sekitar ${forecast.toFixed(2)} kg.
`.trim()

  // Mengembalikan hasil prediksi dan detail perhitungan
  return {
    predictedWeight: parseFloat(forecast.toFixed(2)),
    detail,
  }
}
