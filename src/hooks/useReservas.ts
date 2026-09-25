import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import type { Reserva } from "../types/reserva";

export function useReservas(): {
  reservas: Reserva[];
  cargando: boolean;
  error: Error | null;
} {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "reservas"),
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
  }, []);

  return { reservas, cargando, error };
}
