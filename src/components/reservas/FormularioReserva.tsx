import { useEffect, useState } from "react";
import { useQuintas } from "../../hooks/useQuintas";
import { useClientes } from "../../hooks/useClientes";
import { BuscadorClientes } from "../clientes/BuscadorClientes";
import { crearCliente } from "../../services/clientes";
import { crearReserva, editarReserva } from "../../services/reservas";
import { calcularPrecioReserva } from "../../utils/calcularPrecioReserva";
import type { Reserva } from "../../types/reserva";
import "./FormularioReserva.css";

interface FormularioReservaProps {
  modo: "crear" | "editar";
  reserva?: Reserva;
  fechaInicial?: string;
  quintaIdInicial?: string;
  nombreClienteInicial?: string;
  telefonoClienteInicial?: string;
  onGuardado: () => void;
}

export function FormularioReserva({
  modo,
  reserva,
  fechaInicial,
  quintaIdInicial,
  nombreClienteInicial,
  telefonoClienteInicial,
  onGuardado,
}: FormularioReservaProps) {
  const { quintas } = useQuintas();
  const { clientes } = useClientes();
  const [quintaId, setQuintaId] = useState(reserva?.quintaId ?? quintaIdInicial ?? "");
  const [clienteId, setClienteId] = useState(reserva?.clienteId ?? "");
  const [fecha, setFecha] = useState(reserva?.fecha ?? fechaInicial ?? "");
  const [cantidadPersonas, setCantidadPersonas] = useState(
    reserva?.cantidadPersonas ?? 1,
  );
  const [horasExtra, setHorasExtra] = useState(reserva?.horasExtra ?? 0);
  const [señaPagada, setSeñaPagada] = useState(reserva?.señaPagada ?? false);
  const [señaMonto, setSeñaMonto] = useState(reserva?.señaMonto ?? 0);
  const [señaTocadaManualmente, setSeñaTocadaManualmente] = useState(modo === "editar");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const quintaSeleccionada = quintas.find((q) => q.id === quintaId);
  const clienteSeleccionado = clientes.find((c) => c.id === clienteId);
  const resumen =
    quintaSeleccionada && fecha !== ""
      ? calcularPrecioReserva(quintaSeleccionada, cantidadPersonas, horasExtra, fecha)
      : null;

  const señaSugerida = resumen?.señaMonto;
  useEffect(() => {
    if (!señaTocadaManualmente && señaSugerida !== undefined) {
      setSeñaMonto(señaSugerida);
    }
  }, [señaSugerida, señaTocadaManualmente]);

  async function manejarConfirmar(): Promise<void> {
    if (quintaId === "" || clienteId === "" || fecha === "") {
      setError("Completá quinta, cliente y fecha.");
      return;
    }
    if (!Number.isInteger(cantidadPersonas) || cantidadPersonas <= 0) {
      setError("La cantidad de personas debe ser un entero mayor a 0.");
      return;
    }
    if (horasExtra < 0) {
      setError("Las horas extra no pueden ser negativas.");
      return;
    }
    if (señaMonto < 0) {
      setError("El monto de seña no puede ser negativo.");
      return;
    }

    setError(null);
    setGuardando(true);
    try {
      if (modo === "crear") {
        await crearReserva({
          quintaId,
          clienteId,
          fecha,
          cantidadPersonas,
          horasExtra,
          señaMonto,
        });
      } else if (reserva) {
        await editarReserva(reserva.id, {
          quintaId,
          clienteId,
          fecha,
          cantidadPersonas,
          horasExtra,
          señaMonto,
          señaPagada,
        });
      }
      onGuardado();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la reserva.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="formulario-reserva">
      <label className="formulario-reserva__campo">
        Quinta
        <select value={quintaId} onChange={(e) => setQuintaId(e.target.value)}>
          <option value="">Seleccionar quinta</option>
          {quintas.map((q) => (
            <option key={q.id} value={q.id}>
              {q.nombre}
            </option>
          ))}
        </select>
      </label>

      {clienteId === "" ? (
        <BuscadorClientes
          busquedaInicial={nombreClienteInicial}
          telefonoInicial={telefonoClienteInicial}
          onSeleccionar={(c) => setClienteId(c.id)}
          onCrearNuevo={(datos) => {
            crearCliente(datos)
              .then((id) => setClienteId(id))
              .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "Error al crear el cliente.");
              });
          }}
        />
      ) : (
        <div className="formulario-reserva__cliente-elegido">
          Cliente: {clienteSeleccionado?.nombre ?? "cargando..."}{" "}
          <button type="button" onClick={() => setClienteId("")}>
            Cambiar
          </button>
        </div>
      )}

      <label className="formulario-reserva__campo">
        Fecha
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </label>

      <label className="formulario-reserva__campo">
        Cantidad de personas
        <input
          type="number"
          value={cantidadPersonas}
          onChange={(e) => setCantidadPersonas(Number(e.target.value))}
        />
      </label>

      <label className="formulario-reserva__campo">
        Horas extra
        <input
          type="number"
          value={horasExtra}
          onChange={(e) => setHorasExtra(Number(e.target.value))}
        />
      </label>

      <label className="formulario-reserva__campo">
        Seña (sugerida: {resumen ? `$${resumen.señaMonto.toLocaleString("es-AR")}` : "-"})
        <input
          type="number"
          value={señaMonto}
          onChange={(e) => {
            setSeñaTocadaManualmente(true);
            setSeñaMonto(Number(e.target.value));
          }}
        />
      </label>

      {modo === "editar" && (
        <label className="formulario-reserva__campo formulario-reserva__campo--checkbox">
          <input
            type="checkbox"
            checked={señaPagada}
            onChange={(e) => setSeñaPagada(e.target.checked)}
          />
          Seña pagada
        </label>
      )}

      {resumen && (
        <div className="formulario-reserva__resumen">
          <p>Precio total: ${resumen.precioTotal.toLocaleString("es-AR")}</p>
          <p>Seña: ${señaMonto.toLocaleString("es-AR")}</p>
          <p>Restante: ${(resumen.precioTotal - señaMonto).toLocaleString("es-AR")}</p>
        </div>
      )}

      {error !== null && <p className="formulario-reserva__error">{error}</p>}

      <button
        className="formulario-reserva__boton"
        onClick={manejarConfirmar}
        disabled={guardando}
      >
        {modo === "crear" ? "Confirmar reserva" : "Guardar cambios"}
      </button>
    </div>
  );
}
