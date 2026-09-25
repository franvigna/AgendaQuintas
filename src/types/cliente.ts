import type { Timestamp } from "firebase/firestore";

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  fechaAlta: Timestamp;
}
