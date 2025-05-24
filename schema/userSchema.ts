import { z } from "zod"

export const userSchema = z
  .object({
    name: z.string().min(1, { message: "Nama harus diisi" }),
    email: z
      .string()
      .min(1, { message: "Email harus diisi" })
      .email({ message: "Email tidak valid" }),
    password: z.string().min(6, { message: "Password minimal 6 karakter" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Konfirmasi password minimal 6 karakter" }),
    role: z.enum(["admin", "superadmin"], { message: "Pilih role yang valid" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  })

export type UserSchema = z.infer<typeof userSchema>
