export type AdminAction = "tambah" | "update" | "hapus"

export type LogTarget = "kain" | "customer" | "transaksi"

export interface Log {
  id: string // ID dokumen log di Firestore
  adminName: string | undefined  // Nama admin, untuk ditampilkan di notifikasi
  adminRole: string | undefined // Role Admin
  action: AdminAction // Aksi yang dilakukan (create, update, delete)
  target: LogTarget // Target objek yang diubah (fabric, customer, transaction)
  targetId: string // ID objek yang diubah (misal: id kain/customer/transaksi)
  description: string // Deskripsi singkat aksi, misalnya "Menambahkan kain baru"
  timestamp: Date // Waktu aksi terjadi
  read: boolean // Apakah log sudah dibaca oleh superadmin
}
