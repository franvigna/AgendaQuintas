# Implementation Plan: Reservas

**Branch**: `004-reservas` | **Date**: 2026-09-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-reservas/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

> **Revisión**: este plan reemplaza por completo la versión anterior,
> generada antes de que el spec incorporara edición y cancelación de
> reservas (User Stories 3 y 4, FR-014 a FR-019). Ver Sync Impact abajo.

## Summary

Módulo central de carga, edición y cancelación de reservas. `precioTotal` y
`señaMonto` se recalculan usando la configuración vigente de la quinta tanto
al crear como al editar una reserva (ya no son un snapshot fijo desde la
creación: son un snapshot "de la última operación de escritura"). El campo
`estado` persistido admite 3 valores (`"pendiente_seña"`, `"señada"`,
`"cancelada"`); "Utilizada" sigue siendo un cuarto estado puramente visual,
derivado en el cliente. Una reserva cancelada nunca se borra, pero se
excluye de las consultas que alimentan el calendario, aunque permanece
visible en el historial del cliente.

## Technical Context

**Language/Version**: TypeScript (modo estricto) sobre React 18

**Primary Dependencies**: React 18, Vite, Firebase SDK (Firestore); consume
`useQuintas()` (módulo Quintas) y `BuscadorClientes`/`crearCliente()` (módulo
Clientes)

**Storage**: Firebase Firestore, colección `reservas`

**Testing**: Checklist de pruebas manuales guiadas (Estrategia de Pruebas de
la constitución), con foco especial en: recálculo correcto al editar, y en
que la exclusión de canceladas funcione en `useReservasDelMes` pero no en
`useReservasPorCliente`

**Target Platform**: Navegador móvil (mobile-first)

**Project Type**: Web application (frontend-only)

**Performance Goals**: Carga o edición completa de una reserva en menos de
2 minutos (SC-001); resumen de precio/seña recalculado en vivo sin demora
perceptible

**Constraints**: Requiere sesión activa vía módulo Acceso; `precioTotal`/
`señaMonto` se recalculan en cada creación o edición, pero nunca por un
cambio de precio de la quinta ocurrido después de la última escritura
(FR-006, FR-015 del spec); estado "Utilizada" nunca se persiste (FR-009);
una reserva "Utilizada" o "Cancelada" no se puede editar ni volver a
cancelar (FR-013, FR-017); una sola reserva **activa** por quinta/fecha
(FR-012, FR-018); TypeScript estricto (Principio IV); CSS por componente sin
estilos inline (Principio VI)

**Scale/Scope**: Volumen bajo (decenas/cientos de reservas en el horizonte
del proyecto)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Mobile-First Siempre | PASS — `FormularioReserva` (crear/editar) y `DetalleReserva` (con botones Editar/Cancelar) son de una sola columna, dimensionados para touch. |
| II. Simplicidad Ante Todo | PASS — se reutiliza el mismo `FormularioReserva` para crear y editar (modo `"crear" \| "editar"`) en vez de duplicar el formulario; cancelación es un simple cambio de campo `estado`, sin borrado ni lógica de soft-delete separada. |
| III. Sincronización en Tiempo Real | PASS — `useReservas()`, `useReservasDelMes()` y `useReservasPorCliente()` usan `onSnapshot`; una edición o cancelación hecha por un usuario se refleja de inmediato en los demás dispositivos (calendario y/o historial de cliente según corresponda). |
| IV. TypeScript Estricto | PASS — tipo `Reserva` con union de 3 valores para `estado`, sin `any`. |
| V. Estructura de Carpetas Minimalista | PASS — misma subcarpeta `reservas/` en `components/` y `utils/` ya justificada en el plan original; no se agregan carpetas nuevas por esta revisión. |
| VI. Estilos Separados por Componente | PASS — un `.css` por componente. |
| VII. Especificación Atómica por Módulo | PASS — corresponde 1:1 al spec `004-reservas` ya clarificado. |
| VIII. Acceso por Clave Compartida | N/A para este módulo. |

Sin violaciones. No se requiere entrada en Complexity Tracking.

## Sync Impact (respecto al plan anterior)

| Aspecto | Plan anterior | Este plan |
|---|---|---|
| `estado` persistido | 2 valores (`pendiente_seña`, `señada`) | 3 valores (+ `cancelada`) |
| `precioTotal`/`señaMonto` | Snapshot fijo solo al crear, inmutable para siempre | Recalculado en cada creación **y edición**; inmutable solo entre ediciones |
| Edición de reserva | No contemplada | `FormularioReserva` con modo `"crear" \| "editar"` |
| Cancelación | No contemplada | Botón en `DetalleReserva`, cambia `estado` a `"cancelada"`, sin borrar el documento |
| `useReservasDelMes` | Sin filtro de estado | Filtra `estado != "cancelada"` |
| `useReservasPorCliente` | Sin filtro de estado (ya era así) | Se mantiene sin filtro — debe mostrar canceladas |
| Campo `actualizadoEn` | No existía | Nuevo campo, `serverTimestamp()` en cada edición |

**Impacto en otros módulos ya planificados** (ver research.md para el
detalle): el contrato de Clientes (`003-clientes/contracts/`) y el de
Agenda (`006-agenda-calendario/contracts/` y `research.md`) ya anticipaban
la exclusión de canceladas en `useReservasDelMes`; este plan la concreta.

## Project Structure

### Documentation (this feature)

```text
specs/004-reservas/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── reservas/
│       ├── BotonFlotanteNuevaReserva.tsx
│       ├── BotonFlotanteNuevaReserva.css
│       ├── FormularioReserva.tsx        # modo "crear" | "editar"; importa BuscadorClientes
│       ├── FormularioReserva.css
│       ├── DetalleReserva.tsx           # incluye botones Editar y Cancelar reserva
│       ├── DetalleReserva.css
│       ├── ListaProximosAlquileres.tsx
│       └── ListaProximosAlquileres.css
├── hooks/
│   ├── useReservas.ts
│   ├── useReservasDelMes.ts        # filtra estado != "cancelada"
│   └── useReservasPorCliente.ts    # sin ese filtro (módulo Clientes)
├── types/
│   └── reserva.ts
└── utils/
    ├── calcularPrecioReserva.ts
    └── getEstadoVisual.ts
```

**Structure Decision**: Misma estructura del plan original; no se agregan
carpetas. `useReservasPorCliente` ya pertenece conceptualmente al módulo
Clientes (definido en su propio plan) pero se lista aquí como recordatorio
de que consume la colección `reservas` de este módulo sin el filtro de
cancelación.

## Complexity Tracking

*No aplica: sin violaciones de la Constitution Check.*
