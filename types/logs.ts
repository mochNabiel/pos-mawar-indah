export type AdminAction = "tambah" | "update" | "hapus"

export type LogTarget = "kain" | "customer" | "transaksi"

export interface Log {
  id: string
  adminName: string | undefined
  adminRole: string | undefined
  action: AdminAction
  target: LogTarget
  targetId: string
  description: string
  timestamp: Date
  read: boolean
}
