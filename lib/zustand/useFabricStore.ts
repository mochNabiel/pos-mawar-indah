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

  findFabricByCode: (code: string) => {
    return get().fabrics.find((f) => f.code === code)
  },

  addFabric: async (data: Fabric) => {
    const docRef = await createFabric(data)
    const newFabric: FabricWithId = { id: docRef.id, ...data }
    set((state) => ({ fabrics: [...state.fabrics, newFabric] }))
  },

  updateFabric: async (code: string, data: Partial<Fabric>) => {
    await updateFabricInDb(code, data)
    set((state) => ({
      fabrics: state.fabrics.map((f) =>
        f.code === code ? { ...f, ...data } : f
      ),
    }))
  },

  deleteFabric: async (code: string) => {
    try {
      await deleteFabricInDb(code) 
      set((state) => ({
        fabrics: state.fabrics.filter((f) => f.code !== code),  // Menghapus kain dari state
      }))
    } catch (error) {
      console.error("Gagal menghapus kain: ", error)
    }
  }
}))
