import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import type { Cliente } from "../types/cliente";

export function useClientes(): {
  clientes: Cliente[];
  cargando: boolean;
  error: Error | null;
} {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "clientes"),
      (snapshot) => {
        setClientes(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Cliente),
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

  return { clientes, cargando, error };
}
