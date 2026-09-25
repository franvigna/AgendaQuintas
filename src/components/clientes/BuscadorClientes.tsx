import { useState } from "react";
import { useClientes } from "../../hooks/useClientes";
import { esTelefonoValido } from "../../utils/validarTelefono";
import { editarCliente } from "../../services/clientes";
import type { Cliente } from "../../types/cliente";
import "./BuscadorClientes.css";

interface BuscadorClientesProps {
  onSeleccionar: (cliente: Cliente) => void;
  onCrearNuevo: (datos: { nombre: string; telefono: string }) => void;
  busquedaInicial?: string;
  telefonoInicial?: string;
}

export function BuscadorClientes({
  onSeleccionar,
  onCrearNuevo,
  busquedaInicial,
  telefonoInicial,
}: BuscadorClientesProps) {
  const { clientes } = useClientes();
  const [busqueda, setBusqueda] = useState(busquedaInicial ?? "");
  const [telefonoNuevo, setTelefonoNuevo] = useState(telefonoInicial ?? "");
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [coincidenciaTelefono, setCoincidenciaTelefono] = useState<Cliente | null>(null);
  const [renombrando, setRenombrando] = useState(false);

  const busquedaNormalizada = busqueda.trim().toLowerCase();
  const coincidencias =
    busquedaNormalizada === ""
      ? []
      : clientes.filter(
          (cliente) =>
            cliente.nombre.toLowerCase().includes(busquedaNormalizada) ||
            cliente.telefono.toLowerCase().includes(busquedaNormalizada),
        );

  function manejarCambioTelefono(valor: string): void {
    setTelefonoNuevo(valor);
    setErrorValidacion(null);
    if (esTelefonoValido(valor)) {
      const existente = clientes.find((c) => c.telefono === valor.trim());
      setCoincidenciaTelefono(existente ?? null);
    } else {
      setCoincidenciaTelefono(null);
    }
  }

  function manejarCrearNuevo(): void {
    const nombre = busqueda.trim();
    if (nombre === "") {
      setErrorValidacion("El nombre no puede estar vacío.");
      return;
    }
    if (!esTelefonoValido(telefonoNuevo)) {
      setErrorValidacion("El teléfono debe tener exactamente 10 dígitos (ej. 1122223333).");
      return;
    }
    setErrorValidacion(null);
    onCrearNuevo({ nombre, telefono: telefonoNuevo.trim() });
    setBusqueda("");
    setTelefonoNuevo("");
    setCoincidenciaTelefono(null);
  }

  async function manejarRenombrarYUsar(): Promise<void> {
    if (coincidenciaTelefono === null) {
      return;
    }
    const nombreNuevo = busqueda.trim();
    setRenombrando(true);
    try {
      await editarCliente(coincidenciaTelefono.id, {
        nombre: nombreNuevo,
        telefono: coincidenciaTelefono.telefono,
      });
      onSeleccionar({ ...coincidenciaTelefono, nombre: nombreNuevo });
    } finally {
      setRenombrando(false);
    }
  }

  return (
    <div className="buscador-clientes">
      <input
        className="buscador-clientes__input"
        type="text"
        placeholder="Buscar por nombre o teléfono"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {busquedaNormalizada !== "" && coincidencias.length > 0 && (
        <ul className="buscador-clientes__lista">
          {coincidencias.map((cliente) => (
            <li key={cliente.id}>
              <button
                className="buscador-clientes__item"
                onClick={() => onSeleccionar(cliente)}
              >
                {cliente.nombre} — {cliente.telefono}
              </button>
            </li>
          ))}
        </ul>
      )}

      {busquedaNormalizada !== "" && coincidencias.length === 0 && (
        <div className="buscador-clientes__nuevo">
          <p className="buscador-clientes__nuevo-titulo">
            No hay coincidencias para "{busqueda}". Ingresá el teléfono para crear un
            cliente nuevo con ese nombre:
          </p>
          <input
            className="buscador-clientes__input"
            type="text"
            placeholder="Teléfono (10 dígitos)"
            value={telefonoNuevo}
            onChange={(e) => manejarCambioTelefono(e.target.value)}
          />

          {coincidenciaTelefono !== null ? (
            <div className="buscador-clientes__aviso">
              <p>
                Ese teléfono ya pertenece a {coincidenciaTelefono.nombre}. El teléfono es
                único por cliente: elegí una opción.
              </p>
              <button
                className="buscador-clientes__boton-secundario"
                onClick={() => onSeleccionar(coincidenciaTelefono)}
                disabled={renombrando}
              >
                Usar {coincidenciaTelefono.nombre}
              </button>
              <button
                className="buscador-clientes__boton-secundario"
                onClick={manejarRenombrarYUsar}
                disabled={renombrando}
              >
                Renombrar a "{busqueda.trim()}" y usar este cliente
              </button>
            </div>
          ) : (
            <>
              {errorValidacion !== null && (
                <p className="buscador-clientes__error">{errorValidacion}</p>
              )}
              <button className="buscador-clientes__boton" onClick={manejarCrearNuevo}>
                Crear cliente nuevo
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
