import { z } from "zod"

const fabricSchema = z.object({
  code: z.string().min(1, "Kode kain wajib diisi"),
  name: z.string().min(1, "Nama kain wajib diisi"),
  retailPrice: z
    .string()
    .min(1, "Harga ecer wajib diisi")
    .refine((v) => !isNaN(Number(v)), {
      message: "Harus berupa angka",
    }),
  wholesalePrice: z
    .string()
    .min(1, "Harga grosir wajib diisi")
    .refine((v) => !isNaN(Number(v)), {
      message: "Harus berupa angka",
    }),
  rollPrice: z
    .string()
    .min(1, "Harga roll wajib diisi")
    .refine((v) => !isNaN(Number(v)), {
      message: "Harus berupa angka",
    }),
  color: z.enum(["PUTIH", "HITAM", "WARNA LAIN"]),
})

export type TFabricSchema = z.infer<typeof fabricSchema>
export default fabricSchema
