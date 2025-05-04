export type TransactionCard = {
  id: number
  fabricName: string | undefined
  quantityType: "ecer" | "grosir" | "roll" | undefined
  weight: string
  pricePerKg: number
  discountPerKg?: number
  discount: number
  totalPrice: number
  useDiscount: boolean
}
