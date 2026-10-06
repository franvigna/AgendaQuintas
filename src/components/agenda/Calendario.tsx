import { useState } from "react";
import { useQuintas } from "../../hooks/useQuintas";
import { useQuintaAgendadaDelMes } from "../../hooks/useQuintaAgendadaDelMes";
import { useGestoSwipe } from "../../hooks/useGestoSwipe";
import { toggleQuintaAgendada } from "../../services/quintaAgendada";
import "./Calendario.css";

const CLASES_COLOR = ["calendario__color-0", "calendario__color-1"];
const NUMEROS_ROMANOS = ["I", "II"];

function hoy(): Date {
  return new Date();
}

function diasDelMes(mes: number, año: number): number {
  return new Date(año, mes, 0).getDate();
}

function primerDiaSemana(mes: number, año: number): number {
  const dia = new Date(año, mes - 1, 1).getDay();
  return (dia + 6) % 7;
}

function formatearFecha(mes: number, año: number, dia: number): string {
  return `${año}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

const NOMBRES_MES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const NOMBRES_DIA_SEMANA = [
  "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado",
];

const ABREVIATURAS_DIA_SEMANA = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

function nombreDiaSemana(mes: number, año: number, dia: number): string {
  return NOMBRES_DIA_SEMANA[new Date(año, mes - 1, dia).getDay()];
}

function formatearFechaLegible(mes: number, dia: number): string {
  return `${dia} de ${NOMBRES_MES[mes - 1]}`;
}

export function Calendario() {
  const fechaActual = hoy();
  const [mes, setMes] = useState(fechaActual.getMonth() + 1);
  const [año, setAño] = useState(fechaActual.getFullYear());
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);
  const [direccionAnimacion, setDireccionAnimacion] = useState<"siguiente" | "anterior">(
    "siguiente",
  );

  const { quintas } = useQuintas();
  const { agendadas } = useQuintaAgendadaDelMes(mes, año);

  const quintasOrdenadas = [...quintas].sort((a, b) => a.nombre.localeCompare(b.nombre));

  function manejarMesAnterior(): void {
    setDireccionAnimacion("anterior");
    if (mes === 1) {
      setMes(12);
      setAño(año - 1);
    } else {
      setMes(mes - 1);
    }
  }

  function manejarMesSiguiente(): void {
    setDireccionAnimacion("siguiente");
    if (mes === 12) {
      setMes(1);
      setAño(año + 1);
    } else {
      setMes(mes + 1);
    }
  }

  const gestoSwipe = useGestoSwipe(manejarMesSiguiente, manejarMesAnterior);

  async function manejarToggle(quintaId: string): Promise<void> {
    if (diaSeleccionado === null) {
      return;
    }
    await toggleQuintaAgendada(quintaId, diaSeleccionado);
    setDiaSeleccionado(null);
  }

  const totalDias = diasDelMes(mes, año);
  const inicioSemana = primerDiaSemana(mes, año);
  const celdas: Array<number | null> = [
    ...Array(inicioSemana).fill(null),
    ...Array.from({ length: totalDias }, (_, i) => i + 1),
  ];

  const fechaHoy = formatearFecha(
    fechaActual.getMonth() + 1,
    fechaActual.getFullYear(),
    fechaActual.getDate(),
  );

  return (
    <div className="calendario">
      <div className="calendario__header">
        <button className="calendario__nav" onClick={manejarMesAnterior}>
          ←
        </button>
        <span className="calendario__titulo">
          {NOMBRES_MES[mes - 1]} {año}
        </span>
        <button className="calendario__nav" onClick={manejarMesSiguiente}>
          →
        </button>
      </div>

      <div className="calendario__encabezados">
        {ABREVIATURAS_DIA_SEMANA.map((abreviatura) => (
          <span key={abreviatura} className="calendario__encabezado">
            {abreviatura}
          </span>
        ))}
      </div>

      <div
        key={`${año}-${mes}`}
        className={`calendario__grilla calendario__grilla--${direccionAnimacion}`}
        onTouchStart={gestoSwipe.onTouchStart}
        onTouchEnd={gestoSwipe.onTouchEnd}
      >
        {celdas.map((dia, indice) => {
          if (dia === null) {
            return <div key={`vacio-${indice}`} className="calendario__celda-vacia" />;
          }
          const fecha = formatearFecha(mes, año, dia);
          const quintasDeEseDia = quintasOrdenadas
            .map((quinta, i) => ({
              quinta,
              clase: CLASES_COLOR[i % CLASES_COLOR.length],
              romano: NUMEROS_ROMANOS[i % NUMEROS_ROMANOS.length],
            }))
            .filter(({ quinta }) =>
              agendadas.some((a) => a.quintaId === quinta.id && a.fecha === fecha),
            );

          const esHoy = fecha === fechaHoy;

          return (
            <button
              key={fecha}
              className={`calendario__dia ${esHoy ? "calendario__dia--hoy" : ""}`.trim()}
              onClick={() => setDiaSeleccionado(fecha)}
            >
              <span className="calendario__numero">{dia}</span>
              <span className="calendario__marcas">
                {quintasDeEseDia.map(({ quinta, clase, romano }) => (
                  <span key={quinta.id} className={`calendario__marca ${clase}`}>
                    {romano}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <div className="calendario__referencias">
        {quintasOrdenadas.map((quinta, indice) => (
          <span key={quinta.id} className="calendario__referencia">
            <span
              className={`calendario__punto ${CLASES_COLOR[indice % CLASES_COLOR.length]}`}
            />
            {quinta.nombre}
          </span>
        ))}
      </div>

      {diaSeleccionado !== null && (
        <div className="calendario__popup-overlay" onClick={() => setDiaSeleccionado(null)}>
          <div className="calendario__popup" onClick={(e) => e.stopPropagation()}>
            <button
              className="calendario__popup-x"
              onClick={() => setDiaSeleccionado(null)}
              aria-label="Cerrar"
            >
              ×
            </button>
            <div className="calendario__popup-titulo">
              <span className="calendario__popup-dia-semana">
                {nombreDiaSemana(mes, año, Number(diaSeleccionado.slice(-2)))}
              </span>
              <span className="calendario__popup-fecha">
                {formatearFechaLegible(mes, Number(diaSeleccionado.slice(-2)))}
              </span>
            </div>
            {quintasOrdenadas.map((quinta, indice) => {
              const marcada = agendadas.some(
                (a) => a.quintaId === quinta.id && a.fecha === diaSeleccionado,
              );
              const claseColor = marcada
                ? "calendario__popup-boton--desmarcar"
                : CLASES_COLOR[indice % CLASES_COLOR.length];
              return (
                <button
                  key={quinta.id}
                  className={`calendario__popup-boton ${claseColor}`}
                  onClick={() => manejarToggle(quinta.id)}
                >
                  {marcada ? "Desmarcar" : "Marcar"} {quinta.nombre}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
