import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import type { Visita } from "../types/visita";

function rangoDelMes(mes: number, año: number): { desde: string; hasta: string } {
  const desde = `${año}-${String(mes).padStart(2, "0")}-01`;
  const ultimoDia = new Date(año, mes, 0).getDate();
  const hasta = `${año}-${String(mes).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;
  return { desde, hasta };
}

export function useVisitasDelMes(mes: number, año: number): {
  visitas: Visita[];
  cargando: boolean;
  error: Error | null;
} {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const { desde, hasta } = rangoDelMes(mes, año);
    const q = query(
      collection(db, "visitas"),
      where("fecha", ">=", desde),
      where("fecha", "<=", hasta),
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setVisitas(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Visita),
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

  return { visitas, cargando, error };
}
