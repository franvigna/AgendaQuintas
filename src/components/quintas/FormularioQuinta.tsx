import { useState } from "react";
import type { FormEvent } from "react";
import type { Quinta } from "../../types/quinta";
import { guardarQuinta } from "../../services/quintas";
import "./FormularioQuinta.css";

interface FormularioQuintaProps {
  quinta: Quinta;
  onGuardado: () => void;
}

function validar(datos: Omit<Quinta, "id">): string | null {
  if (datos.nombre.trim() === "") {
    return "El nombre no puede estar vacío.";
  }
  const camposNoNegativos: Array<[string, number]> = [
    ["capacidadBase", datos.capacidadBase],
    ["precioSemana", datos.precioSemana],
    ["precioFinde", datos.precioFinde],
    ["costoPersonaExtra", datos.costoPersonaExtra],
    ["costoHoraExtra", datos.costoHoraExtra],
  ];
  for (const [campo, valor] of camposNoNegativos) {
    if (!Number.isFinite(valor) || valor < 0) {
      return `El campo ${campo} debe ser un número mayor o igual a 0.`;
    }
  }
  if (datos.porcentajeSeña < 0 || datos.porcentajeSeña > 100) {
    return "El porcentaje de seña debe estar entre 0 y 100.";
  }
  if (datos.horarioFin <= datos.horarioInicio) {
    return "El horario de fin debe ser posterior al horario de inicio.";
  }
  return null;
}

export function FormularioQuinta({ quinta, onGuardado }: FormularioQuintaProps) {
  const [datos, setDatos] = useState<Omit<Quinta, "id">>({
    nombre: quinta.nombre,
    capacidadBase: quinta.capacidadBase,
    precioSemana: quinta.precioSemana,
    precioFinde: quinta.precioFinde,
    costoPersonaExtra: quinta.costoPersonaExtra,
    horarioInicio: quinta.horarioInicio,
    horarioFin: quinta.horarioFin,
    costoHoraExtra: quinta.costoHoraExtra,
    porcentajeSeña: quinta.porcentajeSeña,
  });
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  function actualizarCampo<K extends keyof Omit<Quinta, "id">>(
    campo: K,
    valor: Omit<Quinta, "id">[K],
  ): void {
    setDatos((previo) => ({ ...previo, [campo]: valor }));
  }

  async function manejarSubmit(evento: FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault();
    const mensajeError = validar(datos);
    if (mensajeError !== null) {
      setErrorValidacion(mensajeError);
      return;
    }
    setErrorValidacion(null);
    setGuardando(true);
    try {
      await guardarQuinta(quinta.id, datos);
      onGuardado();
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form className="formulario-quinta" onSubmit={manejarSubmit}>
      <label className="formulario-quinta__campo">
        Nombre
        <input
          type="text"
          value={datos.nombre}
          onChange={(e) => actualizarCampo("nombre", e.target.value)}
        />
      </label>

      <label className="formulario-quinta__campo">
        Capacidad base
        <input
          type="number"
          value={datos.capacidadBase}
          onChange={(e) => actualizarCampo("capacidadBase", Number(e.target.value))}
        />
      </label>

      <label className="formulario-quinta__campo">
        Precio semana
        <input
          type="number"
          value={datos.precioSemana}
          onChange={(e) => actualizarCampo("precioSemana", Number(e.target.value))}
        />
      </label>

      <label className="formulario-quinta__campo">
        Precio fin de semana
        <input
          type="number"
          value={datos.precioFinde}
          onChange={(e) => actualizarCampo("precioFinde", Number(e.target.value))}
        />
      </label>

      <label className="formulario-quinta__campo">
        Costo por persona extra
        <input
          type="number"
          value={datos.costoPersonaExtra}
          onChange={(e) => actualizarCampo("costoPersonaExtra", Number(e.target.value))}
        />
      </label>

      <label className="formulario-quinta__campo">
        Horario de inicio
        <input
          type="time"
          value={datos.horarioInicio}
          onChange={(e) => actualizarCampo("horarioInicio", e.target.value)}
        />
      </label>

      <label className="formulario-quinta__campo">
        Horario de fin
        <input
          type="time"
          value={datos.horarioFin}
          onChange={(e) => actualizarCampo("horarioFin", e.target.value)}
        />
      </label>

      <label className="formulario-quinta__campo">
        Costo por hora extra
        <input
          type="number"
          value={datos.costoHoraExtra}
          onChange={(e) => actualizarCampo("costoHoraExtra", Number(e.target.value))}
        />
      </label>

      <label className="formulario-quinta__campo">
        Porcentaje de seña
        <input
          type="number"
          value={datos.porcentajeSeña}
          onChange={(e) => actualizarCampo("porcentajeSeña", Number(e.target.value))}
        />
      </label>

      {errorValidacion !== null && (
        <p className="formulario-quinta__error">{errorValidacion}</p>
      )}

      <button className="formulario-quinta__boton" type="submit" disabled={guardando}>
        Guardar
      </button>
    </form>
  );
}
