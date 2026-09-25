# Data Model: Clientes

**Feature**: 003-clientes | **Date**: 2026-09-25

## Entidad: Cliente

Corresponde a la entidad "Cliente" definida en [spec.md](./spec.md).

**Colección Firestore**: `clientes`

| Campo | Tipo | Requerido | Validación | Notas |
|---|---|---|---|---|
| `id` | `string` | Autogenerado | — | Id de documento de Firestore |
| `nombre` | `string` | Sí | No vacío | Se carga inicialmente desde el buscador en Reservas; editable después desde el detalle del cliente (FR-007, FR-010) |
| `telefono` | `string` | Sí | Exactamente 10 dígitos numéricos; **único** entre clientes (FR-008a) | Editable desde el detalle del cliente (FR-007, FR-010, FR-011) |
| `fechaAlta` | `timestamp` | Sí (autogenerado) | — | Fecha de creación del documento, asignada por el sistema al crear el cliente |

### Validaciones

- `nombre` no vacío, tanto al crear como al editar el cliente.
- `telefono` debe ser exactamente 10 dígitos numéricos (ej. `"1122223333"`,
  sin espacios, guiones ni código de país), tanto al crear como al editar el
  cliente. Si no cumple el formato, el sistema MUST rechazar el guardado y
  mostrar un mensaje de validación (FR-011).

### Relaciones

- **Cliente → Reserva** (módulo `004-reservas`): relación uno-a-muchos,
  materializada como el campo `clienteId` en cada documento de `reservas`
  (propiedad del módulo Reservas), no como un array de ids en Cliente. El
  historial y el conteo de un cliente se derivan consultando `reservas` por
  `clienteId`, nunca al revés.

### Estados / Transiciones

No aplica: Cliente no tiene una máquina de estados propia. Se crea una única
vez (FR-005/FR-006a) desde el buscador de Reservas; `nombre` y `telefono`
pueden editarse después desde el detalle del cliente (FR-007, User Story 5),
sin afectar el historial de reservas asociado. No se elimina desde este
módulo.

## Entidad derivada (no persistida): Resumen de Cliente para listado

Usada por `ListaClientes`, se computa combinando `Cliente` con una
agregación en memoria de `reservas` filtradas por `clienteId` y
`estado == "utilizada"`.

| Campo | Origen | Notas |
|---|---|---|
| `nombre` | `Cliente.nombre` | — |
| `telefono` | `Cliente.telefono` | — |
| `cantidadReservas` | `count(reservas donde clienteId == cliente.id y estado == "utilizada")` | Calculado en tiempo real, no persistido (ver research.md) |
