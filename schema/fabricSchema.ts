import { z } from "zod";

const fabricSchema = z.object({
  kode: z.string().min(1, "Kode kain wajib diisi"),
  nama: z.string().min(1, "Nama kain wajib diisi"),
  hargaEcer: z
    .string()
    .min(1, "Harga ecer wajib diisi")
    .refine((v) => !isNaN(Number(v)), {
      message: "Harus berupa angka",
    }),
  hargaGrosir: z
    .string()
    .min(1, "Harga grosir wajib diisi")
    .refine((v) => !isNaN(Number(v)), {
      message: "Harus berupa angka",
    }),
  hargaRoll: z
    .string()
    .min(1, "Harga roll wajib diisi")
    .refine((v) => !isNaN(Number(v)), {
      message: "Harus berupa angka",
    }),
  warna: z.enum(["PUTIH", "HITAM", "WARNA LAIN"]),
});

export type TFabricSchema = z.infer<typeof fabricSchema>;
export default fabricSchema;