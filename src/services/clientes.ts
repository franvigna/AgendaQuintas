import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function crearCliente(datos: {
  nombre: string;
  telefono: string;
}): Promise<string> {
  const ref = await addDoc(collection(db, "clientes"), {
    ...datos,
    fechaAlta: serverTimestamp(),
  });
  return ref.id;
}

export function editarCliente(
  id: string,
  datos: { nombre: string; telefono: string },
): Promise<void> {
  return updateDoc(doc(db, "clientes", id), datos);
}
