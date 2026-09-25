# Contract: Interfaces del módulo Agenda (Calendario)

**Feature**: 006-agenda-calendario | **Date**: 2026-09-25

Sin API HTTP ni acceso propio a Firestore. El contrato es la interfaz de
composición entre los hooks de otros módulos y los componentes de este.

## Dependencias externas asumidas (contratos de otros módulos)

```ts
// Del módulo Reservas (004-reservas)
function useReservasDelMes(mes: number, año: number): {
  reservas: Reserva[]; // MUST excluir reservas en estado "Cancelada"
  cargando: boolean;
  error: Error | null;
};

// Del módulo Visitas (005-visitas, a definir en su propio plan)
function useVisitasDelMes(mes: number, año: number): {
  visitas: Visita[];
  cargando: boolean;
  error: Error | null;
};
```

- **Precondición de este módulo**: `useReservasDelMes` ya filtra reservas
  canceladas antes de devolverlas (ver research.md). Si esa exclusión no
  está implementada en el módulo Reservas, un día con una reserva cancelada
  se mostraría incorrectamente como ocupado.

## Componente `Calendario`

```ts
interface CalendarioProps {
  mesInicial?: { mes: number; año: number }; // default: mes actual
}

function Calendario(props: CalendarioProps): JSX.Element;
```

- **Comportamiento**: mantiene el mes visible en `useState` local; usa
  `useReservasDelMes`/`useVisitasDelMes` para el mes visible; renderiza una
  grilla de `DiaCalendario` (hasta 42 celdas); captura gestos de swipe
  horizontal vía `useGestoSwipe` para cambiar de mes.

## Hook `useGestoSwipe(onSwipeIzquierda, onSwipeDerecha, umbralPx?)`

```ts
function useGestoSwipe(
  onSwipeIzquierda: () => void,
  onSwipeDerecha: () => void,
  umbralPx?: number // default: 50
): {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
};
```

- **Comportamiento**: calcula la distancia horizontal entre `touchstart` y
  `touchend`; si supera `umbralPx` hacia la izquierda, invoca
  `onSwipeIzquierda` (avanza mes); si supera el umbral hacia la derecha,
  invoca `onSwipeDerecha` (retrocede mes). No usa ninguna librería externa.

## Componente `DiaCalendario`

```ts
interface DiaCalendarioProps {
  fecha: string; // ISO "YYYY-MM-DD"
  reservas: Reserva[]; // ya filtradas para este día por el padre
  visitas: Visita[];    // ya filtradas para este día por el padre
  onTap: (fecha: string) => void;
}

function DiaCalendario(props: DiaCalendarioProps): JSX.Element;
```

- **Comportamiento**: renderiza el número de día y hasta 3 marcadores de
  color (Quinta Serrano 1, Quinta Serrano 2, Visita) según lo que reciba en
  `reservas`/`visitas` (usando las constantes de `src/constants/colores.ts`).
  Al tocar la celda, invoca `onTap(fecha)`; no decide por sí mismo si abrir
  detalle o alta (esa decisión la toma el padre/`ModalDetalleDia`).

## Componente `ModalDetalleDia`

```ts
interface ModalDetalleDiaProps {
  fecha: string;
  reservas: Reserva[];
  visitas: Visita[];
  onCerrar: () => void;
}

function ModalDetalleDia(props: ModalDetalleDiaProps): JSX.Element;
```

- **Comportamiento**: si `reservas.length === 0 && visitas.length === 0`,
  renderiza `FormularioReserva` (o el selector Reserva/Visita del módulo
  Visitas) con `fecha` precargada. Si hay al menos una reserva o visita,
  renderiza el detalle combinado de ambas (delegando el contenido específico
  a `DetalleReserva` del módulo Reservas y al detalle correspondiente del
  módulo Visitas).
