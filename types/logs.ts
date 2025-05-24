import { Timestamp } from "firebase/firestore"

export type AdminAction = "create" | "update" | "delete"

export type LogTarget = "fabric" | "customer" | "transaction"

export interface Log {
  id: string // ID dokumen log di Firestore
  adminId: string // ID Admin
  adminName: string | null | undefined // Nama admin, untuk ditampilkan di notifikasi
  action: AdminAction // Aksi yang dilakukan (create, update, delete)
  target: LogTarget // Target objek yang diubah (fabric, customer, transaction)
  targetId: string // ID objek yang diubah (misal: id kain/customer/transaksi)
  description: string // Deskripsi singkat aksi, misalnya "Menambahkan kain baru"
  timestamp: Timestamp // Waktu aksi terjadi
  read: boolean // Apakah log sudah dibaca oleh superadmin
}
