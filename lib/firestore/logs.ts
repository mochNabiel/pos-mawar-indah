import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp
} from "firebase/firestore";
import { Log } from "@/types/logs";
import { db } from "@/utils/firebase";

const logsCollection = collection(db, "logs");

// Tambah log baru
export const addLog = async ({
  adminName,
  action,
  target,
  targetId,
  description,
}: Omit<Log, "id" | "timestamp" | "read">) => {
  await addDoc(logsCollection, {
    adminName,
    action,
    target,
    targetId,
    description,
    timestamp: Timestamp.now(),
    read: false,
  });
};

// Ambil semua log (default urut terbaru)
export const getLogs = async (): Promise<Log[]> => {
  const q = query(logsCollection, orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Log[];
};

// Tandai log sebagai sudah dibaca
export const markAsRead = async (id: string) => {
  const logRef = doc(db, "logs", id);
  await updateDoc(logRef, {
    read: true,
  });
};

// Hapus log
export const deleteLog = async (id: string) => {
  const logRef = doc(db, "logs", id);
  await deleteDoc(logRef);
};

// Ambil jumlah log yang belum dibaca
export const getUnreadLogsCount = async (): Promise<number> => {
  const q = query(logsCollection, where("read", "==", false));
  const snapshot = await getDocs(q);
  return snapshot.size;
};
