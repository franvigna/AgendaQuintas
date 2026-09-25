# Data Model: Quintas

**Feature**: 002-quintas | **Date**: 2026-09-25

## Entidad: Quinta

Representa una propiedad administrada dentro del sistema. Corresponde a la
entidad "Quinta" definida en [spec.md](./spec.md).

**Colección Firestore**: `quintas`

| Campo | Tipo | Requerido | Validación | Notas |
|---|---|---|---|---|
| `id` | `string` | Autogenerado | — | Id de documento de Firestore, no editable desde la UI |
| `nombre` | `string` | Sí | No vacío | Ej. "Quinta Serrano 1" |
| `capacidadBase` | `number` | Sí | >= 0 | Cantidad de personas incluidas en el precio base |
| `precioSemana` | `number` | Sí | >= 0 | Precio base lunes a viernes |
| `precioFinde` | `number` | Sí | >= 0 | Precio base sábado y domingo |
| `costoPersonaExtra` | `number` | Sí | >= 0 | Costo por cada persona sobre `capacidadBase`; puede ser 0 |
| `horarioInicio` | `string` | Sí | Formato `"HH:mm"` | Hora de inicio del horario estándar incluido |
| `horarioFin` | `string` | Sí | Formato `"HH:mm"`, posterior a `horarioInicio` | Hora de fin del horario estándar incluido |
| `costoHoraExtra` | `number` | Sí | >= 0 | Costo por cada hora por encima de `horarioFin`; puede ser 0 |
| `porcentajeSeña` | `number` | Sí | 0-100 | Porcentaje del precio total sugerido como seña; default 30 |

### Validaciones (derivadas de FR-004, FR-004a, FR-005)

- Todos los campos numéricos (`capacidadBase`, `precioSemana`, `precioFinde`,
  `costoPersonaExtra`, `costoHoraExtra`) deben ser `>= 0`. Se rechaza el
  guardado si algún valor es negativo o no numérico.
- `porcentajeSeña` debe estar en el rango `[0, 100]`.
- `horarioFin` debe representar una hora estrictamente posterior a
  `horarioInicio` dentro del mismo día.

### Relaciones

- **Quinta → Reserva** (módulo `004-reservas`): una Reserva referencia una
  Quinta al momento de crearse, pero copia (snapshot) el precio calculado; no
  hay una referencia inversa desde Quinta hacia sus reservas en este módulo.
- **Quinta → Visita** (módulo `005-visitas`): una Visita referencia una
  Quinta; sin relación inversa modelada en este módulo.

### Datos semilla

| `nombre` | `capacidadBase` | `precioSemana` | `precioFinde` | `costoPersonaExtra` | `horarioInicio` | `horarioFin` | `costoHoraExtra` | `porcentajeSeña` |
|---|---|---|---|---|---|---|---|---|
| Quinta Serrano 1 | 50 | 300000 | 350000 | 0 | "10:00" | "19:00" | 0 | 30 |
| Quinta Serrano 2 | 40 | 250000 | 300000 | 0 | "10:00" | "19:00" | 0 | 30 |

### Estados / Transiciones

No aplica: Quinta no tiene una máquina de estados: es un registro de
configuración editable en cualquier momento (FR-006, FR-007), sin ciclo de
vida propio más allá de "existe y tiene valores vigentes".
