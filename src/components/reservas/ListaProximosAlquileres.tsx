import { useState } from "react";
import { useReservas } from "../../hooks/useReservas";
import { useVisitas } from "../../hooks/useVisitas";
import { useQuintas } from "../../hooks/useQuintas";
import { useClientes } from "../../hooks/useClientes";
import { getEstadoVisual } from "../../utils/getEstadoVisual";
import { DetalleReserva } from "./DetalleReserva";
import { FormularioReserva } from "./FormularioReserva";
import type { Reserva } from "../../types/reserva";
import type { Visita } from "../../types/visita";
import "./ListaProximosAlquileres.css";

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

const ETIQUETA_ESTADO: Record<string, string> = {
  pendiente_seña: "Pendiente de seña",
  señada: "Señada",
  utilizada: "Utilizada",
  cancelada: "Cancelada",
};

type Item =
  | { tipo: "reserva"; fecha: string; reserva: Reserva }
  | { tipo: "visita"; fecha: string; visita: Visita };

export function ListaProximosAlquileres() {
  const { reservas, cargando: cargandoReservas } = useReservas();
  const { visitas, cargando: cargandoVisitas } = useVisitas();
  const { quintas } = useQuintas();
  const { clientes } = useClientes();
  const [reservaSeleccionada, setReservaSeleccionada] = useState<Reserva | null>(null);
  const [visitaSeleccionada, setVisitaSeleccionada] = useState<Visita | null>(null);
  const [creandoReservaDesdeVisita, setCreandoReservaDesdeVisita] = useState<Visita | null>(
    null,
  );
  const [mostrarVisitas, setMostrarVisitas] = useState(true);

  if (cargandoReservas || cargandoVisitas) {
    return <p className="lista-proximos__mensaje">Cargando...</p>;
  }

  if (reservaSeleccionada !== null) {
    const reservaActual =
      reservas.find((r) => r.id === reservaSeleccionada.id) ?? reservaSeleccionada;
    return (
      <div className="lista-proximos">
        <button
          className="lista-proximos__volver"
          onClick={() => setReservaSeleccionada(null)}
        >
          ← Volver
        </button>
        <DetalleReserva reserva={reservaActual} />
      </div>
    );
  }

  if (creandoReservaDesdeVisita !== null) {
    return (
      <div className="lista-proximos">
        <button
          className="lista-proximos__volver"
          onClick={() => setCreandoReservaDesdeVisita(null)}
        >
          ← Volver
        </button>
        <FormularioReserva
          modo="crear"
          quintaIdInicial={creandoReservaDesdeVisita.quintaId}
          fechaInicial={creandoReservaDesdeVisita.fecha}
          nombreClienteInicial={creandoReservaDesdeVisita.nombreVisitante}
          telefonoClienteInicial={creandoReservaDesdeVisita.telefonoVisitante}
          onGuardado={() => setCreandoReservaDesdeVisita(null)}
        />
      </div>
    );
  }

  if (visitaSeleccionada !== null) {
    const quinta = quintas.find((q) => q.id === visitaSeleccionada.quintaId);
    return (
      <div className="lista-proximos">
        <button
          className="lista-proximos__volver"
          onClick={() => setVisitaSeleccionada(null)}
        >
          ← Volver
        </button>
        <div className="lista-proximos__detalle-visita">
          <p className="lista-proximos__quinta">{quinta?.nombre ?? "Quinta desconocida"}</p>
          <p>Fecha: {visitaSeleccionada.fecha}</p>
          <p>Visitante: {visitaSeleccionada.nombreVisitante}</p>
          {visitaSeleccionada.telefonoVisitante !== undefined && (
            <p>Teléfono: {visitaSeleccionada.telefonoVisitante}</p>
          )}
          <button
            className="lista-proximos__boton-crear-reserva"
            onClick={() => setCreandoReservaDesdeVisita(visitaSeleccionada)}
          >
            Crear reserva desde esta visita
          </button>
        </div>
      </div>
    );
  }

  const hoy = hoyISO();

  const items: Item[] = [
    ...reservas
      .filter((r) => r.fecha >= hoy && r.estado !== "cancelada")
      .map((reserva): Item => ({ tipo: "reserva", fecha: reserva.fecha, reserva })),
    ...(mostrarVisitas
      ? visitas
          .filter((v) => v.fecha >= hoy)
          .map((visita): Item => ({ tipo: "visita", fecha: visita.fecha, visita }))
      : []),
  ].sort((a, b) => a.fecha.localeCompare(b.fecha));

  return (
    <div className="lista-proximos">
      <label className="lista-proximos__toggle">
        <input
          type="checkbox"
          checked={mostrarVisitas}
          onChange={(e) => setMostrarVisitas(e.target.checked)}
        />
        Mostrar visitas
      </label>

      {items.length === 0 ? (
        <p className="lista-proximos__mensaje">No hay próximos alquileres.</p>
      ) : (
        <ul className="lista-proximos__lista">
          {items.map((item) => {
            if (item.tipo === "reserva") {
              const { reserva } = item;
              const quinta = quintas.find((q) => q.id === reserva.quintaId);
              const cliente = clientes.find((c) => c.id === reserva.clienteId);
              return (
                <li key={`reserva-${reserva.id}`}>
                  <button
                    className="lista-proximos__item"
                    onClick={() => setReservaSeleccionada(reserva)}
                  >
                    <span className="lista-proximos__fecha">{reserva.fecha}</span>
                    <span className="lista-proximos__quinta">
                      {quinta?.nombre ?? "Quinta desconocida"}
                    </span>
                    <span className="lista-proximos__cliente">
                      {cliente?.nombre ?? "Cliente desconocido"}
                    </span>
                    <span className="lista-proximos__estado">
                      {ETIQUETA_ESTADO[getEstadoVisual(reserva)]}
                    </span>
                  </button>
                </li>
              );
            }

            const { visita } = item;
            const quinta = quintas.find((q) => q.id === visita.quintaId);
            return (
              <li key={`visita-${visita.id}`}>
                <button
                  className="lista-proximos__item"
                  onClick={() => setVisitaSeleccionada(visita)}
                >
                  <span className="lista-proximos__fecha">{visita.fecha}</span>
                  <span className="lista-proximos__quinta">
                    {quinta?.nombre ?? "Quinta desconocida"}
                  </span>
                  <span className="lista-proximos__cliente">{visita.nombreVisitante}</span>
                  <span className="lista-proximos__estado">Visita</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
