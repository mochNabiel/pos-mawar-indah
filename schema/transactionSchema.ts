import { z } from "zod";

// Define the schema for a single card in the transaction
const cardSchema = z.object({
  fabricName: z.string().min(1, "Nama kain wajib diisi"),
  quantityType: z.string().min(1, "Tipe kuantitas wajib diisi"),
  weight: z.string().min(0, "Berat harus lebih besar dari 0"),
  pricePerKg: z.number().min(0, "Harga per kg harus lebih besar dari 0"),
  discountPerKg: z.number().min(0, "Diskon per kg harus lebih besar dari 0"),
  discount: z.number().min(0, "Diskon harus lebih besar dari 0"),
  totalPrice: z.number().min(0, "Total harga harus lebih besar dari 0"),
  useDiscount: z.boolean(),
});

// Define the main transaction schema
const transactionSchema = z.object({
  adminName: z.string().min(1, "Nama admin wajib diisi"),
  customerName: z.string().min(1, "Nama customer wajib diisi"),
  cards: z.array(cardSchema).min(1, "Minimal satu item transaksi wajib diisi"),
  subTotal: z.number().min(0, "Subtotal harus lebih besar dari 0"),
  totalDiscount: z.number().min(0, "Total diskon harus lebih besar dari 0"),
  totalTransaction: z.number().min(0, "Total transaksi harus lebih besar dari 0"),
  createdAt: z.date(),
  invoiceCode: z.string().min(1, "Kode transaksi wajib diisi"), // Optional: if you want to include invoice code
});

// Export the inferred type
export type TTransactionSchema = z.infer<typeof transactionSchema>;
export default transactionSchema;
