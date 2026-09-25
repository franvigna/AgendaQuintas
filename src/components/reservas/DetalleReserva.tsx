import { useState } from "react";
import { useQuintas } from "../../hooks/useQuintas";
import { useClientes } from "../../hooks/useClientes";
import { getEstadoVisual } from "../../utils/getEstadoVisual";
import { marcarSeñaPagada, cancelarReserva } from "../../services/reservas";
import { FormularioReserva } from "./FormularioReserva";
import type { Reserva } from "../../types/reserva";
import "./DetalleReserva.css";

interface DetalleReservaProps {
  reserva: Reserva;
}

const ETIQUETA_ESTADO: Record<string, string> = {
  pendiente_seña: "Pendiente de seña",
  señada: "Señada",
  utilizada: "Utilizada",
  cancelada: "Cancelada",
};

export function DetalleReserva({ reserva }: DetalleReservaProps) {
  const { quintas } = useQuintas();
  const { clientes } = useClientes();
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);

  const quinta = quintas.find((q) => q.id === reserva.quintaId);
  const cliente = clientes.find((c) => c.id === reserva.clienteId);
  const estadoVisual = getEstadoVisual(reserva);
  const esEditable = estadoVisual !== "utilizada" && reserva.estado !== "cancelada";

  async function manejarMarcarSeñaPagada(): Promise<void> {
    setProcesando(true);
    setError(null);
    try {
      await marcarSeñaPagada(reserva.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al marcar la seña como pagada.");
    } finally {
      setProcesando(false);
    }
  }

  async function manejarCancelar(): Promise<void> {
    if (!confirm("¿Confirmás que querés cancelar esta reserva?")) {
      return;
    }
    setProcesando(true);
    setError(null);
    try {
      await cancelarReserva(reserva.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cancelar la reserva.");
    } finally {
      setProcesando(false);
    }
  }

  if (editando) {
    return (
      <FormularioReserva
        modo="editar"
        reserva={reserva}
        onGuardado={() => setEditando(false)}
      />
    );
  }

  return (
    <div className="detalle-reserva">
      <p className="detalle-reserva__quinta">{quinta?.nombre ?? "Quinta desconocida"}</p>
      <p className="detalle-reserva__cliente">{cliente?.nombre ?? "Cliente desconocido"}</p>
      <p>Fecha: {reserva.fecha}</p>
      <p>Cantidad de personas: {reserva.cantidadPersonas}</p>
      <p>Horas extra: {reserva.horasExtra}</p>
      <p>Precio total: ${reserva.precioTotal.toLocaleString("es-AR")}</p>
      <p>Seña: ${reserva.señaMonto.toLocaleString("es-AR")} ({reserva.señaPagada ? "pagada" : "pendiente"})</p>
      <p>Restante: ${(reserva.precioTotal - reserva.señaMonto).toLocaleString("es-AR")}</p>
      <p className="detalle-reserva__estado">Estado: {ETIQUETA_ESTADO[estadoVisual]}</p>

      {error !== null && <p className="detalle-reserva__error">{error}</p>}

      <div className="detalle-reserva__acciones">
        {estadoVisual === "pendiente_seña" && (
          <button
            className="detalle-reserva__boton"
            onClick={manejarMarcarSeñaPagada}
            disabled={procesando}
          >
            Marcar seña como pagada
          </button>
        )}

        {esEditable && (
          <button className="detalle-reserva__boton" onClick={() => setEditando(true)}>
            Editar
          </button>
        )}

        {esEditable && (
          <button
            className="detalle-reserva__boton-cancelar"
            onClick={manejarCancelar}
            disabled={procesando}
          >
            Cancelar reserva
          </button>
        )}
      </div>
    </div>
  );
}
