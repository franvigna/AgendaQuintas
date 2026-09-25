import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import type { Quinta } from "../types/quinta";

export function useQuintas(): {
  quintas: Quinta[];
  cargando: boolean;
  error: Error | null;
} {
  const [quintas, setQuintas] = useState<Quinta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "quintas"),
      (snapshot) => {
        setQuintas(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Quinta),
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

  return { quintas, cargando, error };
}
