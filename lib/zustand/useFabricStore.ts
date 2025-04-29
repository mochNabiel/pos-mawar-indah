import { create } from "zustand"
import {
  getAllFabrics,
  createFabric,
  updateFabricInDb,
  deleteFabricInDb,
} from "@/lib/firestore/fabric"
import { FabricStore, Fabric, FabricWithId } from "@/types/fabric"

export const useFabricStore = create<FabricStore>((set, get) => ({
  fabrics: [],
  isLoading: false,

  fetchAllFabrics: async () => {
    set({ isLoading: true })
    const data = await getAllFabrics()
    set({ fabrics: data, isLoading: false })
  },

  findFabricByKode: (kode: string) => {
    return get().fabrics.find((f) => f.kode === kode)
  },

  addFabric: async (data: Fabric) => {
    const docRef = await createFabric(data)
    const newFabric: FabricWithId = { id: docRef.id, ...data }
    set((state) => ({ fabrics: [...state.fabrics, newFabric] }))
  },

  updateFabric: async (kode: string, data: Partial<Fabric>) => {
    await updateFabricInDb(kode, data)
    set((state) => ({
      fabrics: state.fabrics.map((f) =>
        f.kode === kode ? { ...f, ...data } : f
      ),
    }))
  },

  deleteFabric: async (kode: string) => {
    try {
      await deleteFabricInDb(kode) 
      set((state) => ({
        fabrics: state.fabrics.filter((f) => f.kode !== kode),  // Menghapus kain dari state
      }))
    } catch (error) {
      console.error("Gagal menghapus kain: ", error)
    }
  }
}))
