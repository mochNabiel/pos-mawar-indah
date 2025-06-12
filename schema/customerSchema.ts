import { z } from "zod"

const customerSchema = z.object({
  name: z.string().min(1, "Nama Customer wajib diisi"),
  countryCode: z.string().nonempty("Pilih kode negara"),
  phoneNumber: z
    .string()
    .min(6, "Nomor telepon minimal 6 digit")
    .regex(/^\d+$/, "Hanya boleh angka"),
  company: z.string().min(1, "Nama Perusahaan wajib diisi"),
})

export type TCustomerSchema = z.infer<typeof customerSchema>
export default customerSchema
