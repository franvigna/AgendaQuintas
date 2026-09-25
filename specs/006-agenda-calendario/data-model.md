# Data Model: Agenda (Calendario)

**Feature**: 006-agenda-calendario | **Date**: 2026-09-25

Este módulo no introduce entidades propias ni colección en Firestore (FR-009
del spec). Los siguientes son tipos de composición/vista, derivados en el
cliente a partir de `Reserva` (módulo Reservas) y `Visita` (módulo Visitas).

## Tipo derivado: `DiaConEventos`

Representa lo que ocurre en un día específico del calendario, combinando
reservas activas y visitas de ese día.

| Campo | Tipo | Origen | Notas |
|---|---|---|---|
| `fecha` | `string` (ISO `"YYYY-MM-DD"`) | Calculado por la grilla del mes | — |
| `reservas` | `Reserva[]` | `useReservasDelMes` filtrado por `fecha` | Ya excluye reservas "Canceladas" (contrato de `useReservasDelMes`, ver research.md) |
| `visitas` | `Visita[]` | `useVisitasDelMes` filtrado por `fecha` | — |

### Derivación de color/marcadores por día

```text
marcadores(dia) =
  [colorQuintaSerrano1 si existe alguna reserva de esa quinta en dia.reservas]
  + [colorQuintaSerrano2 si existe alguna reserva de esa quinta en dia.reservas]
  + [colorVisita si dia.visitas.length > 0]
```

Un día puede tener 0, 1, 2 o 3 marcadores simultáneos (ambas quintas
reservadas + una visita), todos visualmente distinguibles entre sí (FR-002,
FR-003 del spec).

### Validaciones

No aplica: este módulo es de solo lectura/composición, no escribe ni valida
datos propios.

### Relaciones

- **DiaConEventos → Reserva** (módulo Reservas): agregación por `fecha`,
  de solo lectura.
- **DiaConEventos → Visita** (módulo Visitas): agregación por `fecha`, de
  solo lectura.

### Estados / Transiciones

No aplica: no hay entidad con ciclo de vida propio en este módulo. El
"estado" de un día (libre, con reserva, con visita, con ambas) es
puramente derivado y se recalcula en cada render a partir de los datos
sincronizados de Reservas y Visitas.
