import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { Quinta } from "../types/quinta";

export function guardarQuinta(
  id: string,
  datos: Partial<Omit<Quinta, "id">>,
): Promise<void> {
  return updateDoc(doc(db, "quintas", id), datos);
}
