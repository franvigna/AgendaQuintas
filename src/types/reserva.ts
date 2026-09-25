import type { Timestamp } from "firebase/firestore";

export type EstadoPersistido = "pendiente_seña" | "señada" | "cancelada";
export type EstadoVisual = "pendiente_seña" | "señada" | "utilizada" | "cancelada";

export interface Reserva {
  id: string;
  quintaId: string;
  clienteId: string;
  fecha: string;
  cantidadPersonas: number;
  horasExtra: number;
  precioTotal: number;
  señaMonto: number;
  señaPagada: boolean;
  estado: EstadoPersistido;
  creadoEn: Timestamp;
  actualizadoEn: Timestamp;
}
