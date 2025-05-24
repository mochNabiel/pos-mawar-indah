import { Timestamp } from "firebase/firestore"

export interface Log {
  action: "create" | "update" | "delete"
  target: "fabric" | "customer" | "transaction"
  targetId: string
  message: string
  userId: string
  userName: string
  isRead: boolean
  createdAt: Timestamp
}

export interface LogWithId extends Log {
  id: string
}
