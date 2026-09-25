import { useState } from "react";
import { useQuintas } from "../../hooks/useQuintas";
import { crearVisita } from "../../services/visitas";
import "./FormularioVisita.css";

interface FormularioVisitaProps {
  fechaInicial?: string;
  onGuardado: () => void;
}

export function FormularioVisita({ fechaInicial, onGuardado }: FormularioVisitaProps) {
  const { quintas } = useQuintas();
  const [quintaId, setQuintaId] = useState("");
  const [fecha, setFecha] = useState(fechaInicial ?? "");
  const [nombreVisitante, setNombreVisitante] = useState("");
  const [telefonoVisitante, setTelefonoVisitante] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function manejarConfirmar(): Promise<void> {
    if (quintaId === "" || fecha === "" || nombreVisitante.trim() === "") {
      setError("Completá quinta, fecha y nombre.");
      return;
    }

    setError(null);
    setGuardando(true);
    try {
      await crearVisita({
        quintaId,
        fecha,
        nombreVisitante: nombreVisitante.trim(),
        ...(telefonoVisitante.trim() !== ""
          ? { telefonoVisitante: telefonoVisitante.trim() }
          : {}),
      });
      onGuardado();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la visita.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="formulario-visita">
      <label className="formulario-visita__campo">
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

      <label className="formulario-visita__campo">
        Fecha
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </label>

      <label className="formulario-visita__campo">
        Nombre de quien visita
        <input
          type="text"
          value={nombreVisitante}
          onChange={(e) => setNombreVisitante(e.target.value)}
        />
      </label>

      <label className="formulario-visita__campo">
        Teléfono (opcional)
        <input
          type="text"
          value={telefonoVisitante}
          onChange={(e) => setTelefonoVisitante(e.target.value)}
        />
      </label>

      {error !== null && <p className="formulario-visita__error">{error}</p>}

      <button
        className="formulario-visita__boton"
        onClick={manejarConfirmar}
        disabled={guardando}
      >
        Registrar visita
      </button>
    </div>
  );
}
