import { useState } from "react";
import { useReservasPorCliente } from "../../hooks/useReservasPorCliente";
import { useQuintas } from "../../hooks/useQuintas";
import { useClientes } from "../../hooks/useClientes";
import { getEstadoVisual } from "../../utils/getEstadoVisual";
import { editarCliente } from "../../services/clientes";
import { esTelefonoValido } from "../../utils/validarTelefono";
import type { Cliente } from "../../types/cliente";
import "./DetalleCliente.css";

interface DetalleClienteProps {
  cliente: Cliente;
}

const ETIQUETA_ESTADO: Record<string, string> = {
  pendiente_seña: "Pendiente de seña",
  señada: "Señada",
  utilizada: "Utilizada",
  cancelada: "Cancelada",
};

export function DetalleCliente({ cliente }: DetalleClienteProps) {
  const { reservas, cargando } = useReservasPorCliente(cliente.id);
  const { quintas } = useQuintas();
  const { clientes } = useClientes();
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(cliente.nombre);
  const [telefono, setTelefono] = useState(cliente.telefono);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function manejarGuardar(): Promise<void> {
    if (nombre.trim() === "") {
      setErrorValidacion("El nombre no puede estar vacío.");
      return;
    }
    if (!esTelefonoValido(telefono)) {
      setErrorValidacion("El teléfono debe tener exactamente 10 dígitos (ej. 1122223333).");
      return;
    }
    const otroConEseTelefono = clientes.find(
      (c) => c.id !== cliente.id && c.telefono === telefono.trim(),
    );
    if (otroConEseTelefono !== undefined) {
      setErrorValidacion(`Ese teléfono ya pertenece a ${otroConEseTelefono.nombre}.`);
      return;
    }
    setErrorValidacion(null);
    setGuardando(true);
    try {
      await editarCliente(cliente.id, { nombre: nombre.trim(), telefono: telefono.trim() });
      setEditando(false);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      {editando ? (
        <div className="detalle-cliente__edicion">
          <label className="detalle-cliente__campo">
            Nombre
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </label>
          <label className="detalle-cliente__campo">
            Teléfono
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </label>
          {errorValidacion !== null && (
            <p className="detalle-cliente__error">{errorValidacion}</p>
          )}
          <div className="detalle-cliente__acciones">
            <button
              className="detalle-cliente__boton"
              onClick={manejarGuardar}
              disabled={guardando}
            >
              Guardar
            </button>
            <button
              className="detalle-cliente__boton-cancelar"
              onClick={() => {
                setNombre(cliente.nombre);
                setTelefono(cliente.telefono);
                setErrorValidacion(null);
                setEditando(false);
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button className="detalle-cliente__editar" onClick={() => setEditando(true)}>
          Editar datos
        </button>
      )}

      {cargando ? (
        <p className="detalle-cliente__mensaje">Cargando historial...</p>
      ) : reservas.length === 0 ? (
        <p className="detalle-cliente__mensaje">Este cliente todavía no tiene reservas.</p>
      ) : (
        <ul className="detalle-cliente__lista">
          {reservas.map((reserva) => {
            const quinta = quintas.find((q) => q.id === reserva.quintaId);
            const estado =
              reserva.estado === "cancelada" ? "cancelada" : getEstadoVisual(reserva);
            return (
              <li className="detalle-cliente__item" key={reserva.id}>
                <span className="detalle-cliente__fecha">{reserva.fecha}</span>
                <span className="detalle-cliente__quinta">
                  {quinta?.nombre ?? "Quinta desconocida"}
                </span>
                <span className="detalle-cliente__estado">{ETIQUETA_ESTADO[estado]}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
