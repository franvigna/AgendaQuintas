# Contract: Acceso a datos de Visitas

**Feature**: 005-visitas | **Date**: 2026-09-25

Sin API HTTP propia. Consumido principalmente por el módulo Agenda
(`useVisitasDelMes`) y por el propio `FormularioVisita`.

## Tipo `Visita`

```ts
interface Visita {
  id: string;
  quintaId: string;
  fecha: string; // ISO "YYYY-MM-DD"
  nombreVisitante: string;
  telefonoVisitante?: string;
  creadoEn: Timestamp;
}
```

## Hook `useVisitasDelMes(mes, año)`

```ts
function useVisitasDelMes(mes: number, año: number): {
  visitas: Visita[];
  cargando: boolean;
  error: Error | null;
};
```

- **Comportamiento**: se suscribe vía `onSnapshot` a una query de
  `visitas` filtrada por rango de `fecha` correspondiente al mes/año
  dados (análogo a `useReservasDelMes` del módulo Reservas, sin filtro de
  estado ya que Visita no tiene ese campo).
- **Consumido por**: el módulo Agenda (`006-agenda-calendario`), que ya
  anticipó esta firma exacta en su propio contrato.

## Función `crearVisita(datos): Promise<string>`

```ts
function crearVisita(datos: {
  quintaId: string;
  fecha: string;
  nombreVisitante: string;
  telefonoVisitante?: string;
}): Promise<string>;
```

- **Comportamiento**: crea un nuevo documento en `visitas` con
  `creadoEn: serverTimestamp()`, sin ninguna validación de conflicto con
  otras visitas o con reservas existentes.
- **No implementa**: edición ni eliminación (fuera de alcance de esta
  versión, ver research.md).

## Componente `FormularioVisita`

```ts
interface FormularioVisitaProps {
  fechaInicial?: string; // precargada si se abrió tocando un día del calendario
  onGuardado: () => void;
}

function FormularioVisita(props: FormularioVisitaProps): JSX.Element;
```

- **Comportamiento**: selector de quinta (vía `useQuintas()`), selector de
  fecha (precargado si `fechaInicial` está presente), campo de nombre
  (requerido) y teléfono (opcional). Al confirmar, invoca `crearVisita` y
  luego `onGuardado`.

## Modificación de contrato existente: `BotonFlotanteNuevaReserva`

- **Cambio**: al tocarlo, ahora presenta primero un selector de tipo
  `"Reserva" | "Visita"` antes de abrir el formulario correspondiente
  (`FormularioReserva` o `FormularioVisita`). Este cambio se implementa
  sobre el componente ya definido en `004-reservas`, no se documenta un
  contrato nuevo aparte.
