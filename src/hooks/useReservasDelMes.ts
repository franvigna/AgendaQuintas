import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import type { Reserva } from "../types/reserva";

function rangoDelMes(mes: number, año: number): { desde: string; hasta: string } {
  const desde = `${año}-${String(mes).padStart(2, "0")}-01`;
  const ultimoDia = new Date(año, mes, 0).getDate();
  const hasta = `${año}-${String(mes).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;
  return { desde, hasta };
}

export function useReservasDelMes(mes: number, año: number): {
  reservas: Reserva[];
  cargando: boolean;
  error: Error | null;
} {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const { desde, hasta } = rangoDelMes(mes, año);
    const q = query(
      collection(db, "reservas"),
      where("fecha", ">=", desde),
      where("fecha", "<=", hasta),
      where("estado", "!=", "cancelada"),
    );
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
  }, [mes, año]);

  return { reservas, cargando, error };
}
