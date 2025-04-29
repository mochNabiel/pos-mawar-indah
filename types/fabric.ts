export type Fabric = {
  kode: string
  nama: string
  hargaEcer: number
  hargaGrosir: number
  hargaRoll: number
  warna: "PUTIH" | "HITAM" | "WARNA LAIN"
}

export type FabricWithId = Fabric & { id: string }

export type FabricStore = {
  fabrics: FabricWithId[]
  isLoading: boolean
  fetchAllFabrics: () => Promise<void>
  findFabricByKode: (kode: string) => FabricWithId | undefined
  addFabric: (data: Fabric) => Promise<void>
  updateFabric: (id: string, data: Partial<Fabric>) => Promise<void>
  deleteFabric: (id: string) => Promise<void>
}

