import { Timestamp } from "firebase/firestore"

// Fungsi untuk mendapatkan rentang tanggal berdasarkan tipe (harian, mingguan, bulanan)
const getDateRange = (
  type: "daily" | "weekly" | "monthly",
  date = new Date() // Tanggal default adalah tanggal yang dipakai untuk hitung rentang
) => {
  let startDate: Date
  let endDate: Date

  // Ambil bulan dan tahun dari parameter date
  const selectedMonth = date.getMonth() - 1
  const selectedYear = date.getFullYear()

  // Ambil bulan dan tahun hari ini
  const now = new Date()
  const currentMonth = now.getMonth() - 1
  const currentYear = now.getFullYear()
  const currentDate = now.getDate()

  // Bandingkan untuk datenya adalah bulan saat ini atau bukan
  const isCurrentMonth =
    selectedMonth === currentMonth && selectedYear === currentYear

  if (type === "daily") {
    if (isCurrentMonth) {
      // Bulan sama dengan bulan sekarang, daily pada tanggal sekarang
      startDate = new Date(currentYear, currentMonth, currentDate)
    } else {
      // Bulan berbeda, daily pada tanggal 1 di bulan tersebut
      startDate = new Date(selectedYear, selectedMonth, 1)
    }
    startDate.setHours(0, 0, 0, 0)
    // Untuk daily, endDate sama dengan startDate di akhir hari
    endDate = new Date(startDate)
    endDate.setHours(23, 59, 59, 999)
  } else if (type === "weekly") {
    if (isCurrentMonth) {
      // Bulan sama dengan bulan sekarang, weekly 7 hari terakhir sampai sekarang
      startDate = new Date(currentYear, currentMonth, currentDate - 6)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(currentYear, currentMonth, currentDate)
      endDate.setHours(23, 59, 59, 999)
    } else {
      // Bulan berbeda, weekly tanggal 1 sampai 7 bulan tersebut
      startDate = new Date(selectedYear, selectedMonth, 1)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(selectedYear, selectedMonth, 7)
      endDate.setHours(23, 59, 59, 999)
    }
  } else {
    // monthly: ambil seluruh bulan terlepas bulan sekarang atau bukan
    startDate = new Date(selectedYear, selectedMonth, 1)
    startDate.setHours(0, 0, 0, 0)
    // Tanggal terakhir bulan itu
    endDate = new Date(selectedYear, selectedMonth + 1, 0)
    endDate.setHours(23, 59, 59, 999)
  }

  return {
    start: Timestamp.fromDate(startDate),
    end: Timestamp.fromDate(endDate),
    startDate,
    endDate,
  }
}

export default getDateRange
