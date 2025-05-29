import { getDocs, collection, query, where } from "firebase/firestore"
import { sendPushNotification } from "./sendPushNotification"
import { db } from "@/utils/firebase"

export async function notifySuperadmins(message: {
  title: string
  body: string
}) {
  const q = query(collection(db, "users"), where("role", "==", "superadmin"))
  const snap = await getDocs(q)

  snap.forEach((doc) => {
    const token = doc.data().expoPushToken
    if (token) {
      sendPushNotification(token, message.title, message.body)
    }
  })
}
