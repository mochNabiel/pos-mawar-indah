import {
  Control,
  UseFormGetValues,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form"
import { Fabric } from "./fabric"

export type TransactionCard = {
  fabricName: string
  quantityType: string
  weight: string
  pricePerKg: number
  discountPerKg?: number
  discount: number
  totalPrice: number
  useDiscount: boolean
}
export interface TransactionCardProps {
  index: number
  control: Control<any>
  watch: UseFormWatch<any>
  setValue: UseFormSetValue<any>
  getValues: UseFormGetValues<any>
  cardData: TransactionCard
  fabrics: Fabric[]
  onRemove: () => void
  isRemovable: boolean
}

export type Transaction = {
  invCode: string
  adminName: string
  customerName: string
  cards: TransactionCard[]
  subTotal: number
  totalDiscount: number
  totalTransaction: number
  createdAt: Date
}

export interface TransactionWithId extends Transaction {
  id: string
}
