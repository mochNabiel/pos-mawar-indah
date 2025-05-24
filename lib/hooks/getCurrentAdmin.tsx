import { auth } from "@/utils/firebase"

export const getCurrentAdmin = () => {
  const user = auth.currentUser
  if (!user) throw new Error("User belum login")

  return {
    id: user.uid,
    name: user.displayName || "Unknown Admin",
    email: user.email || "",
  }
}
