import { useState } from "react";
import { useQuintas } from "../../hooks/useQuintas";
import { FormularioQuinta } from "./FormularioQuinta";
import type { Quinta } from "../../types/quinta";
import "./ConfiguracionQuintas.css";

export function ConfiguracionQuintas() {
  const { quintas, cargando } = useQuintas();
  const [quintaSeleccionada, setQuintaSeleccionada] = useState<Quinta | null>(null);

  if (cargando) {
    return <p className="configuracion-quintas__mensaje">Cargando quintas...</p>;
  }

  if (quintaSeleccionada !== null) {
    return (
      <div className="configuracion-quintas">
        <button
          className="configuracion-quintas__volver"
          onClick={() => setQuintaSeleccionada(null)}
        >
          ← Volver
        </button>
        <FormularioQuinta
          quinta={quintaSeleccionada}
          onGuardado={() => setQuintaSeleccionada(null)}
        />
      </div>
    );
  }

  return (
    <div className="configuracion-quintas">
      <h1 className="configuracion-quintas__titulo">Quintas</h1>
      <ul className="configuracion-quintas__lista">
        {quintas.map((quinta) => (
          <li key={quinta.id}>
            <button
              className="configuracion-quintas__item"
              onClick={() => setQuintaSeleccionada(quinta)}
            >
              {quinta.nombre}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
