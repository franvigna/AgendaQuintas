import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import type { Reserva } from "../types/reserva";
import { getEstadoVisual } from "../utils/getEstadoVisual";

export function useReservasPorCliente(clienteId: string): {
  reservas: Reserva[];
  cantidadUtilizadas: number;
  cargando: boolean;
  error: Error | null;
} {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, "reservas"), where("clienteId", "==", clienteId));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setReservas(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Reserva),
        );
        setCargando(false);
      },
      (err) => {
        setError(err);
        setCargando(false);
      },
    );

    return unsubscribe;
  }, [clienteId]);

  const cantidadUtilizadas = reservas.filter(
    (r) => getEstadoVisual(r) === "utilizada",
  ).length;

  return { reservas, cantidadUtilizadas, cargando, error };
}
