import { useState } from "react";
import { FormularioReserva } from "./FormularioReserva";
import { FormularioVisita } from "../visitas/FormularioVisita";
import "./BotonFlotanteNuevaReserva.css";

interface BotonFlotanteNuevaReservaProps {
  fechaInicial?: string;
}

type Estado = "cerrado" | "eligiendo-tipo" | "reserva" | "visita";

export function BotonFlotanteNuevaReserva({ fechaInicial }: BotonFlotanteNuevaReservaProps) {
  const [estado, setEstado] = useState<Estado>("cerrado");

  if (estado === "eligiendo-tipo") {
    return (
      <div className="boton-flotante-reserva__modal">
        <button
          className="boton-flotante-reserva__cerrar"
          onClick={() => setEstado("cerrado")}
        >
          ← Volver
        </button>
        <p className="boton-flotante-reserva__pregunta">¿Qué querés cargar?</p>
        <div className="boton-flotante-reserva__opciones">
          <button
            className="boton-flotante-reserva__opcion"
            onClick={() => setEstado("reserva")}
          >
            Reserva
          </button>
          <button
            className="boton-flotante-reserva__opcion"
            onClick={() => setEstado("visita")}
          >
            Visita
          </button>
        </div>
      </div>
    );
  }

  if (estado === "reserva") {
    return (
      <div className="boton-flotante-reserva__modal">
        <button
          className="boton-flotante-reserva__cerrar"
          onClick={() => setEstado("cerrado")}
        >
          ← Volver
        </button>
        <FormularioReserva
          modo="crear"
          fechaInicial={fechaInicial}
          onGuardado={() => setEstado("cerrado")}
        />
      </div>
    );
  }

  if (estado === "visita") {
    return (
      <div className="boton-flotante-reserva__modal">
        <button
          className="boton-flotante-reserva__cerrar"
          onClick={() => setEstado("cerrado")}
        >
          ← Volver
        </button>
        <FormularioVisita
          fechaInicial={fechaInicial}
          onGuardado={() => setEstado("cerrado")}
        />
      </div>
    );
  }

  return (
    <button className="boton-flotante-reserva" onClick={() => setEstado("eligiendo-tipo")}>
      +
    </button>
  );
}
