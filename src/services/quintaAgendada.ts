import { addDoc, collection, deleteDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

export async function toggleQuintaAgendada(quintaId: string, fecha: string): Promise<void> {
  const q = query(
    collection(db, "quintaAgendada"),
    where("quintaId", "==", quintaId),
    where("fecha", "==", fecha),
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    await addDoc(collection(db, "quintaAgendada"), { quintaId, fecha });
  } else {
    await Promise.all(snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref)));
  }
}
