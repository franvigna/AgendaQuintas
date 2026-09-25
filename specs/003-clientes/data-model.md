# Data Model: Clientes

**Feature**: 003-clientes | **Date**: 2026-09-25

## Entidad: Cliente

Corresponde a la entidad "Cliente" definida en [spec.md](./spec.md).

**Colección Firestore**: `clientes`

| Campo | Tipo | Requerido | Validación | Notas |
|---|---|---|---|---|
| `id` | `string` | Autogenerado | — | Id de documento de Firestore |
| `nombre` | `string` | Sí | No vacío | Editable solo al momento de creación (desde el buscador en Reservas); sin edición posterior en este módulo (FR-007) |
| `telefono` | `string` | Sí | No vacío | **No es único** a nivel de sistema (FR-008, confirmado); dos documentos pueden compartir el mismo valor |
| `fechaAlta` | `timestamp` | Sí (autogenerado) | — | Fecha de creación del documento, asignada por el sistema al crear el cliente |

### Validaciones

- `nombre` y `telefono` no vacíos al crear el cliente (validación mínima de
  formulario, ya que se ingresan solo una vez desde el flujo de carga de
  Reservas).
- Sin validación de formato de teléfono más allá de "no vacío": el spec no
  especifica un formato particular (ej. código de país), y no se justifica
  agregar esa validación sin un requisito explícito (Principio II).

### Relaciones

- **Cliente → Reserva** (módulo `004-reservas`): relación uno-a-muchos,
  materializada como el campo `clienteId` en cada documento de `reservas`
  (propiedad del módulo Reservas), no como un array de ids en Cliente. El
  historial y el conteo de un cliente se derivan consultando `reservas` por
  `clienteId`, nunca al revés.

### Estados / Transiciones

No aplica: Cliente no tiene una máquina de estados propia. Se crea una única
vez (FR-005/FR-006a) y no se edita ni elimina desde este módulo (FR-007).

## Entidad derivada (no persistida): Resumen de Cliente para listado

Usada por `ListaClientes`, se computa combinando `Cliente` con una
agregación en memoria de `reservas` filtradas por `clienteId` y
`estado == "utilizada"`.

| Campo | Origen | Notas |
|---|---|---|
| `nombre` | `Cliente.nombre` | — |
| `telefono` | `Cliente.telefono` | — |
| `cantidadReservas` | `count(reservas donde clienteId == cliente.id y estado == "utilizada")` | Calculado en tiempo real, no persistido (ver research.md) |
