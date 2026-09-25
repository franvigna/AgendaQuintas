# Contract: Acceso a datos de Reservas

**Feature**: 004-reservas | **Date**: 2026-09-25 (revisado tras edición/cancelación)

Sin API HTTP propia; el frontend habla directo con Firestore. Este contrato
es consumido por los módulos Clientes (historial/conteo) y Agenda
(marcadores de calendario).

## Tipo `Reserva`

```ts
type EstadoPersistido = "pendiente_seña" | "señada" | "cancelada";
type EstadoVisual = "pendiente_seña" | "señada" | "utilizada" | "cancelada";

interface Reserva {
  id: string;
  quintaId: string;
  clienteId: string;
  fecha: string; // ISO "YYYY-MM-DD"
  cantidadPersonas: number;
  horasExtra: number;
  precioTotal: number;
  señaMonto: number;
  señaPagada: boolean;
  estado: EstadoPersistido;
  creadoEn: Timestamp;
  actualizadoEn: Timestamp;
}
```

## Función pura `getEstadoVisual(reserva): EstadoVisual`

```ts
function getEstadoVisual(reserva: Pick<Reserva, "estado" | "fecha">): EstadoVisual;
```

- **Comportamiento**: si `reserva.estado === "cancelada"`, devuelve
  `"cancelada"` directamente (prioridad visual, ver data-model.md). En caso
  contrario, si `reserva.fecha < hoy`, devuelve `"utilizada"`; si no,
  devuelve `reserva.estado` tal cual.
- **Contrato para consumidores**: cualquier módulo que necesite el estado
  visual de una reserva MUST usar esta función.

## Función `calcularPrecioReserva(quinta, cantidadPersonas, horasExtra, fecha)`

Sin cambios respecto al plan anterior — función pura, ver
[data-model.md](./../data-model.md#fórmula-de-cálculo-re-ejecutada-en-cada-creación-o-edición).
Ahora se invoca tanto desde `crearReserva` como desde `editarReserva` (ver
abajo).

## Hook `useReservas()`

Sin cambios: se suscribe a toda la colección `reservas` vía `onSnapshot`,
sin filtro de estado.

## Hook `useReservasDelMes(mes, año)`

```ts
function useReservasDelMes(mes: number, año: number): {
  reservas: Reserva[]; // excluye estado === "cancelada"
  cargando: boolean;
  error: Error | null;
};
```

- **Comportamiento**: se suscribe vía `onSnapshot` a una query de
  `reservas` filtrada por rango de `fecha` del mes/año dados, agregando
  `where("estado", "!=", "cancelada")`.
- **Consumido por**: el módulo Agenda, para pintar el calendario (una
  reserva cancelada no debe mostrarse como ocupación).

## Hook `useReservasPorCliente(clienteId)` (propiedad conceptual de Clientes, documentado aquí por el impacto)

```ts
function useReservasPorCliente(clienteId: string): {
  reservas: Reserva[]; // incluye TODAS, sin excluir "cancelada"
  cargando: boolean;
  error: Error | null;
};
```

- **Comportamiento**: se suscribe vía `onSnapshot` a
  `query(collection(db, "reservas"), where("clienteId", "==", clienteId))`,
  **sin** el filtro de cancelación. El historial de un cliente debe
  incluir reservas canceladas, mostrando su estado explícitamente.
- **Conteo de "Utilizadas"** (módulo Clientes, FR-009 de ese spec): sigue
  contando solo `getEstadoVisual(r) === "utilizada"`, lo cual ya excluye
  naturalmente las canceladas sin necesidad de un filtro adicional.

## Función `crearReserva(datos): Promise<string>`

```ts
function crearReserva(datos: {
  quintaId: string;
  clienteId: string;
  fecha: string;
  cantidadPersonas: number;
  horasExtra: number;
}): Promise<string>;
```

- **Comportamiento**: calcula `precioTotal`/`señaMonto` con la quinta
  vigente, valida unicidad quinta+fecha contra reservas **activas**
  (`estado != "cancelada"`), y crea el documento con
  `estado: "pendiente_seña"`, `señaPagada: false`,
  `creadoEn: serverTimestamp()`, `actualizadoEn: serverTimestamp()`.

## Función `editarReserva(reservaId, datos): Promise<void>`

```ts
function editarReserva(
  reservaId: string,
  datos: Partial<{
    quintaId: string;
    clienteId: string;
    fecha: string;
    cantidadPersonas: number;
    horasExtra: number;
  }>
): Promise<void>;
```

- **Comportamiento**: recalcula `precioTotal`/`señaMonto` con la quinta
  vigente (usando `quintaId` nuevo si se cambió), valida unicidad
  quinta+fecha contra otras reservas activas (excluyendo la propia reserva
  que se está editando), actualiza los campos provistos y
  `actualizadoEn: serverTimestamp()`. No modifica `estado` ni `señaPagada`.
- **Precondición**: MUST rechazarse si `getEstadoVisual(reserva) === "utilizada"`
  o si `reserva.estado === "cancelada"` (FR-013).

## Función `marcarSeñaPagada(reservaId): Promise<void>`

Sin cambios: actualiza `señaPagada: true` y `estado: "señada"`.
Precondición: rechazado si `getEstadoVisual(reserva) === "utilizada"` o si
ya está `"cancelada"`.

## Función `cancelarReserva(reservaId): Promise<void>`

```ts
function cancelarReserva(reservaId: string): Promise<void>;
```

- **Comportamiento**: actualiza `estado: "cancelada"` y
  `actualizadoEn: serverTimestamp()`. No borra el documento (FR-019).
- **Precondición**: MUST rechazarse si `getEstadoVisual(reserva) === "utilizada"`
  o si `reserva.estado === "cancelada"` (no se cancela dos veces, FR-017).
- **Postcondición**: la reserva desaparece de `useReservasDelMes` (libera el
  día en el calendario) pero sigue apareciendo en
  `useReservasPorCliente` (historial completo del cliente, FR-019).
