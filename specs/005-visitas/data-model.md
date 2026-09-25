# Data Model: Visitas

**Feature**: 005-visitas | **Date**: 2026-09-25

## Entidad: Visita

Corresponde a la entidad "Visita" definida en [spec.md](./spec.md).

**Colección Firestore**: `visitas`

| Campo | Tipo | Requerido | Validación | Notas |
|---|---|---|---|---|
| `id` | `string` | Autogenerado | — | Id de documento de Firestore |
| `quintaId` | `string` | Sí | Debe referenciar un documento existente en `quintas` | — |
| `fecha` | `string` | Sí | Formato ISO `"YYYY-MM-DD"` | — |
| `nombreVisitante` | `string` | Sí | No vacío | Campo de texto propio de la Visita; NO crea ni referencia un Cliente |
| `telefonoVisitante` | `string` | No (opcional) | — | Sin validación de formato |
| `creadoEn` | `timestamp` | Sí (autogenerado) | — | `serverTimestamp()` al crear |

### Validaciones

- `quintaId` y `fecha` requeridos; `nombreVisitante` no vacío.
- `telefonoVisitante` puede omitirse (FR-004 del spec).
- Sin ninguna validación de unicidad ni de conflicto con otras visitas o
  reservas (FR-007 del spec, y Assumptions: se permite más de una visita
  por quinta/día).

### Relaciones

- **Visita → Quinta**: referencia por `quintaId`, de solo lectura (el
  selector de quinta en `FormularioVisita` consume `useQuintas()`).
- **Sin relación con Cliente ni con Reserva**: decisión de diseño
  confirmada, no un campo pendiente de agregar.

### Estados / Transiciones

No aplica: Visita no tiene campo `estado` ni ciclo de vida. Es un registro
simple, inmutable una vez creado (sin edición ni cancelación en esta
versión, ver research.md).
