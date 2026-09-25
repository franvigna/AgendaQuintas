import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function crearVisita(datos: {
  quintaId: string;
  fecha: string;
  nombreVisitante: string;
  telefonoVisitante?: string;
}): Promise<string> {
  const ref = await addDoc(collection(db, "visitas"), {
    ...datos,
    creadoEn: serverTimestamp(),
  });
  return ref.id;
}
