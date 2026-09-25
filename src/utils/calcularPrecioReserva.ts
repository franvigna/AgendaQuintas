import type { Quinta } from "../types/quinta";

function esFinDeSemana(fecha: string): boolean {
  const diaSemana = new Date(`${fecha}T00:00:00`).getDay();
  return diaSemana === 0 || diaSemana === 6;
}

export function calcularPrecioReserva(
  quinta: Quinta,
  cantidadPersonas: number,
  horasExtra: number,
  fecha: string,
): { precioTotal: number; señaMonto: number } {
  const precioBase = esFinDeSemana(fecha) ? quinta.precioFinde : quinta.precioSemana;
  const personasExtra = Math.max(0, cantidadPersonas - quinta.capacidadBase);
  const precioTotal =
    precioBase +
    personasExtra * quinta.costoPersonaExtra +
    horasExtra * quinta.costoHoraExtra;
  const señaMonto = precioTotal * (quinta.porcentajeSeña / 100);

  return { precioTotal, señaMonto };
}
