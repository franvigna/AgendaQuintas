import type { Timestamp } from "firebase/firestore";

export interface Visita {
  id: string;
  quintaId: string;
  fecha: string;
  nombreVisitante: string;
  telefonoVisitante?: string;
  creadoEn: Timestamp;
}
