import type { EstadoVisual } from "../types/reserva";

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getEstadoVisual(
  reserva: { estado: "pendiente_seña" | "señada" | "cancelada"; fecha: string },
): EstadoVisual {
  if (reserva.estado === "cancelada") {
    return "cancelada";
  }
  if (reserva.fecha < hoyISO()) {
    return "utilizada";
  }
  return reserva.estado;
}
