import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import type { Visita } from "../types/visita";

export function useVisitas(): {
  visitas: Visita[];
  cargando: boolean;
  error: Error | null;
} {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "visitas"),
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
  }, []);

  return { visitas, cargando, error };
}
