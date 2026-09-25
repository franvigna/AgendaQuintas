import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Quinta } from "../types/quinta";
import type { Reserva } from "../types/reserva";
import { calcularPrecioReserva } from "../utils/calcularPrecioReserva";
import { getEstadoVisual } from "../utils/getEstadoVisual";

async function obtenerQuinta(quintaId: string): Promise<Quinta> {
  const snapshot = await getDoc(doc(db, "quintas", quintaId));
  if (!snapshot.exists()) {
    throw new Error("La quinta seleccionada no existe.");
  }
  return { id: snapshot.id, ...snapshot.data() } as Quinta;
}

async function existeConflicto(
  quintaId: string,
  fecha: string,
  reservaIdAExcluir?: string,
): Promise<boolean> {
  const q = query(
    collection(db, "reservas"),
    where("quintaId", "==", quintaId),
    where("fecha", "==", fecha),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.some((docSnap) => {
    if (docSnap.id === reservaIdAExcluir) {
      return false;
    }
    const reserva = docSnap.data() as Reserva;
    return reserva.estado !== "cancelada";
  });
}

export async function crearReserva(datos: {
  quintaId: string;
  clienteId: string;
  fecha: string;
  cantidadPersonas: number;
  horasExtra: number;
  señaMonto: number;
}): Promise<string> {
  if (datos.señaMonto < 0) {
    throw new Error("El monto de seña no puede ser negativo.");
  }

  const quinta = await obtenerQuinta(datos.quintaId);

  if (await existeConflicto(datos.quintaId, datos.fecha)) {
    throw new Error("Esa quinta ya tiene una reserva activa para esa fecha.");
  }

  const { precioTotal } = calcularPrecioReserva(
    quinta,
    datos.cantidadPersonas,
    datos.horasExtra,
    datos.fecha,
  );

  const ref = await addDoc(collection(db, "reservas"), {
    ...datos,
    precioTotal,
    señaPagada: false,
    estado: "pendiente_seña",
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });

  return ref.id;
}

async function obtenerReserva(reservaId: string): Promise<Reserva> {
  const snapshot = await getDoc(doc(db, "reservas", reservaId));
  if (!snapshot.exists()) {
    throw new Error("La reserva no existe.");
  }
  return { id: snapshot.id, ...snapshot.data() } as Reserva;
}

function asegurarEditable(reserva: Reserva): void {
  if (getEstadoVisual(reserva) === "utilizada") {
    throw new Error("No se puede modificar una reserva ya utilizada.");
  }
  if (reserva.estado === "cancelada") {
    throw new Error("No se puede modificar una reserva cancelada.");
  }
}

export async function editarReserva(
  reservaId: string,
  datos: Partial<{
    quintaId: string;
    clienteId: string;
    fecha: string;
    cantidadPersonas: number;
    horasExtra: number;
    señaMonto: number;
    señaPagada: boolean;
  }>,
): Promise<void> {
  if (datos.señaMonto !== undefined && datos.señaMonto < 0) {
    throw new Error("El monto de seña no puede ser negativo.");
  }

  const reservaActual = await obtenerReserva(reservaId);
  asegurarEditable(reservaActual);

  const quintaId = datos.quintaId ?? reservaActual.quintaId;
  const fecha = datos.fecha ?? reservaActual.fecha;
  const cantidadPersonas = datos.cantidadPersonas ?? reservaActual.cantidadPersonas;
  const horasExtra = datos.horasExtra ?? reservaActual.horasExtra;

  if (await existeConflicto(quintaId, fecha, reservaId)) {
    throw new Error("Esa quinta ya tiene una reserva activa para esa fecha.");
  }

  const quinta = await obtenerQuinta(quintaId);
  const { precioTotal } = calcularPrecioReserva(quinta, cantidadPersonas, horasExtra, fecha);

  const estado =
    datos.señaPagada === undefined
      ? undefined
      : datos.señaPagada
        ? "señada"
        : "pendiente_seña";

  await updateDoc(doc(db, "reservas", reservaId), {
    ...datos,
    ...(estado !== undefined ? { estado } : {}),
    precioTotal,
    actualizadoEn: serverTimestamp(),
  });
}

export async function marcarSeñaPagada(reservaId: string): Promise<void> {
  const reserva = await obtenerReserva(reservaId);
  asegurarEditable(reserva);

  await updateDoc(doc(db, "reservas", reservaId), {
    señaPagada: true,
    estado: "señada",
    actualizadoEn: serverTimestamp(),
  });
}

export async function cancelarReserva(reservaId: string): Promise<void> {
  const reserva = await obtenerReserva(reservaId);
  asegurarEditable(reserva);

  await updateDoc(doc(db, "reservas", reservaId), {
    estado: "cancelada",
    actualizadoEn: serverTimestamp(),
  });
}
