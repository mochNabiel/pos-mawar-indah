export interface User {
  name: string
  email: string
  role: "admin" | "superadmin"
  createdAt: Date
}

export interface UserWithId extends User {
  id: string
}
