import { useState } from "react";
import { useClientes } from "../../hooks/useClientes";
import { useReservasPorCliente } from "../../hooks/useReservasPorCliente";
import { DetalleCliente } from "./DetalleCliente";
import type { Cliente } from "../../types/cliente";
import "./ListaClientes.css";

interface ItemClienteProps {
  cliente: Cliente;
  onSeleccionar: (cliente: Cliente) => void;
}

function ItemCliente({ cliente, onSeleccionar }: ItemClienteProps) {
  const { cantidadUtilizadas } = useReservasPorCliente(cliente.id);

  return (
    <button className="lista-clientes__item" onClick={() => onSeleccionar(cliente)}>
      <span className="lista-clientes__nombre">{cliente.nombre}</span>
      <span className="lista-clientes__telefono">{cliente.telefono}</span>
      <span className="lista-clientes__reservas">{cantidadUtilizadas} reservas</span>
    </button>
  );
}

export function ListaClientes() {
  const { clientes, cargando } = useClientes();
  const [busqueda, setBusqueda] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);

  if (cargando) {
    return <p className="lista-clientes__mensaje">Cargando clientes...</p>;
  }

  if (clienteSeleccionado !== null) {
    const clienteActual =
      clientes.find((c) => c.id === clienteSeleccionado.id) ?? clienteSeleccionado;
    return (
      <div className="lista-clientes">
        <button
          className="lista-clientes__volver"
          onClick={() => setClienteSeleccionado(null)}
        >
          ← Volver
        </button>
        <h2 className="lista-clientes__titulo">{clienteActual.nombre}</h2>
        <DetalleCliente cliente={clienteActual} />
      </div>
    );
  }

  if (clientes.length === 0) {
    return <p className="lista-clientes__mensaje">Todavía no hay clientes cargados.</p>;
  }

  const busquedaNormalizada = busqueda.trim().toLowerCase();
  const clientesFiltrados =
    busquedaNormalizada === ""
      ? clientes
      : clientes.filter(
          (cliente) =>
            cliente.nombre.toLowerCase().includes(busquedaNormalizada) ||
            cliente.telefono.toLowerCase().includes(busquedaNormalizada),
        );

  return (
    <div className="lista-clientes">
      <h1 className="lista-clientes__titulo">Clientes</h1>
      <input
        className="lista-clientes__buscador"
        type="text"
        placeholder="Buscar por nombre o teléfono"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      {clientesFiltrados.length === 0 ? (
        <p className="lista-clientes__mensaje">No hay coincidencias.</p>
      ) : (
        <ul className="lista-clientes__lista">
          {clientesFiltrados.map((cliente) => (
            <li key={cliente.id}>
              <ItemCliente cliente={cliente} onSeleccionar={setClienteSeleccionado} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
