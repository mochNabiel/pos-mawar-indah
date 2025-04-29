import { useEffect, useState } from "react"
import { useFabricStore } from "@/lib/zustand/useFabricStore"
import { FabricWithId } from "@/types/fabric"

export function useFabricByKode(kode: string) {
  const { fabrics, fetchAllFabrics, findFabricByKode } = useFabricStore()
  const [fabric, setFabric] = useState<FabricWithId | undefined>(() =>
    findFabricByKode(kode)
  )

  useEffect(() => {
    if (!fabric && fabrics.length === 0) {
      fetchAllFabrics().then(() => {
        setFabric(findFabricByKode(kode))
      })
    } else {
      setFabric(findFabricByKode(kode))
    }
  }, [kode, fabrics])

  return fabric
}
