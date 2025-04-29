export type Fabric = {
  code: string
  name: string
  retailPrice: number
  wholesalePrice: number
  rollPrice: number
  color: "PUTIH" | "HITAM" | "WARNA LAIN"
}

export type FabricWithId = Fabric & { id: string }

export type FabricStore = {
  fabrics: FabricWithId[]
  isLoading: boolean
  fetchAllFabrics: () => Promise<void>
  findFabricByCode: (code: string) => FabricWithId | undefined
  addFabric: (data: Fabric) => Promise<void>
  updateFabric: (id: string, data: Partial<Fabric>) => Promise<void>
  deleteFabric: (id: string) => Promise<void>
}
