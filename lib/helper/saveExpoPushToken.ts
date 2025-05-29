import { setDoc, doc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { auth } from "@/utils/firebase";

export async function saveExpoPushToken(token: string) {
  const user = auth.currentUser;
  if (!user) return;

  await setDoc(
    doc(db, "users", user.uid),
    { expoPushToken: token },
    { merge: true }
  );
}
