# Data Model: Reservas

**Feature**: 004-reservas | **Date**: 2026-09-25 (revisado tras edición/cancelación)

## Entidad: Reserva

Corresponde a la entidad "Reserva" definida en [spec.md](./spec.md).

**Colección Firestore**: `reservas`

| Campo | Tipo | Requerido | Validación | Notas |
|---|---|---|---|---|
| `id` | `string` | Autogenerado | — | Id de documento de Firestore |
| `quintaId` | `string` | Sí | Debe referenciar un documento existente en `quintas` | Editable en modo edición |
| `clienteId` | `string` | Sí | Debe referenciar un documento existente en `clientes` | Editable en modo edición |
| `fecha` | `string` | Sí | Formato ISO `"YYYY-MM-DD"` | Editable en modo edición (reprogramación) |
| `cantidadPersonas` | `number` | Sí | Entero > 0 | Editable en modo edición |
| `horasExtra` | `number` | No (default 0) | >= 0 | Editable en modo edición |
| `precioTotal` | `number` | Sí (calculado) | — | Recalculado en cada creación/edición; fijo entre escrituras |
| `señaMonto` | `number` | Sí (calculado) | — | Recalculado junto con `precioTotal` |
| `señaPagada` | `boolean` | Sí (default `false`) | — | Editable manualmente vía `DetalleReserva` |
| `estado` | `"pendiente_seña" \| "señada" \| "cancelada"` | Sí | Solo estos 3 valores | **"utilizada" nunca es un valor persistido** |
| `creadoEn` | `timestamp` | Sí (autogenerado) | — | `serverTimestamp()` al crear, no cambia después |
| `actualizadoEn` | `timestamp` | Sí (autogenerado) | — | `serverTimestamp()` en cada creación o edición |

### Fórmula de cálculo (re-ejecutada en cada creación o edición)

```text
precioBase = esFinDeSemana(fecha) ? quinta.precioFinde : quinta.precioSemana
personasExtra = max(0, cantidadPersonas - quinta.capacidadBase)
precioTotal = precioBase
            + (personasExtra × quinta.costoPersonaExtra)
            + (horasExtra × quinta.costoHoraExtra)
señaMonto = precioTotal × (quinta.porcentajeSeña / 100)
```

`esFinDeSemana(fecha)` es verdadero si el día de la semana de `fecha` es
sábado o domingo. La fórmula se ejecuta con los valores de `quinta` vigentes
en el momento exacto de la escritura (creación o edición), no con valores
históricos.

### Validaciones

- `cantidadPersonas` debe ser un entero positivo.
- `horasExtra` >= 0 si se provee; default 0.
- No se permite crear ni editar una reserva de forma que quede duplicando
  `quintaId` + `fecha` con otra reserva **activa** (estado distinto de
  `"cancelada"`) — verificado en el cliente antes de escribir.
- `precioTotal` y `señaMonto` no son editables directamente por el usuario:
  se derivan siempre de `calcularPrecioReserva`.
- Edición y cancelación MUST rechazarse si `getEstadoVisual(reserva) === "utilizada"`.
- Cancelación MUST rechazarse además si `estado === "cancelada"` (no se
  cancela dos veces).

### Relaciones

- **Reserva → Quinta**: referencia por `quintaId`; se lee la configuración
  vigente en cada creación o edición (no solo en la creación original).
- **Reserva → Cliente**: referencia por `clienteId`; puede cambiar de
  cliente al editar la reserva.

### Estados / Transiciones

```text
[creación] --> "pendiente_seña"
"pendiente_seña" --(marcar seña pagada)--> "señada"
"pendiente_seña" --(cancelar)--> "cancelada"
"señada" --(cancelar)--> "cancelada"
"pendiente_seña" --(editar, sin cambiar estado)--> "pendiente_seña" (con precio recalculado)
"señada" --(editar, sin cambiar estado)--> "señada" (con precio recalculado)
"cancelada" --(sin transiciones posibles)-->
```

- **"Utilizada" sigue sin ser un valor persistido.** Se deriva con la misma
  función pura del plan anterior, sin cambios en su lógica:

  ```ts
  function getEstadoVisual(reserva: { estado: EstadoPersistido; fecha: string }): EstadoVisual {
    if (reserva.fecha < hoyISO()) {
      return "utilizada";
    }
    return reserva.estado; // "pendiente_seña" | "señada" | "cancelada"
  }
  ```

  Nota: una reserva `"cancelada"` cuya fecha ya pasó técnicamente cumple
  `fecha < hoy`, pero en la práctica no importa mostrarla como "utilizada"
  en ningún flujo (una cancelada no se edita, no se vuelve a cancelar, y no
  cuenta para el conteo de "Utilizadas" del módulo Clientes, que exige
  `estado === "señada"` implícitamente al no considerar "cancelada"). Los
  componentes de UI que muestran el estado de una reserva cancelada deben
  priorizar mostrar "Cancelada" explícitamente en vez de invocar
  `getEstadoVisual` sobre ella (mostrar "cancelada" tiene prioridad visual
  sobre el cálculo de vencimiento).
- Ni edición ni cancelación son posibles sobre una reserva cuyo estado
  visual (`getEstadoVisual`) es `"utilizada"` (FR-013, FR-017).
- Cancelación no es posible sobre una reserva ya `"cancelada"`.
