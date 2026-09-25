# Implementation Plan: Visitas

**Branch**: `005-visitas` | **Date**: 2026-09-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-visitas/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Módulo de registro simple de visitas (sin ciclo de vida ni estados):
guarda quinta, fecha, nombre y teléfono opcional de quien visita, sin
referenciar en ningún momento la colección `clientes` (decisión confirmada
en el spec) ni validar conflicto alguno con Reservas (coexistencia libre,
también confirmada). Se accede desde el mismo punto de entrada que Reservas
(`BotonFlotanteNuevaReserva`), agregando un selector de tipo
"Reserva" | "Visita" como primer paso del formulario.

## Technical Context

**Language/Version**: TypeScript (modo estricto) sobre React 18

**Primary Dependencies**: React 18, Vite, Firebase SDK (Firestore); consume
`useQuintas()` (módulo Quintas) para el selector de quinta

**Storage**: Firebase Firestore, colección `visitas`

**Testing**: Checklist de pruebas manuales guiadas (Estrategia de Pruebas de
la constitución)

**Target Platform**: Navegador móvil (mobile-first)

**Project Type**: Web application (frontend-only)

**Performance Goals**: Registro completo de una visita en menos de 1 minuto
(SC-001 del spec)

**Constraints**: Sin dependencia de Clientes ni de Reservas (spec,
Assumptions); sin validación de conflicto con Reservas (FR-007 del spec);
sin edición ni cancelación en esta versión (fuera de alcance, ver nota del
usuario); TypeScript estricto (Principio IV); CSS por componente sin
estilos inline (Principio VI)

**Scale/Scope**: Volumen bajo, análogo al resto del proyecto; sin
paginación en el hook mensual

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Mobile-First Siempre | PASS — `FormularioVisita` es un formulario corto de una columna, dimensionado para touch. |
| II. Simplicidad Ante Todo | PASS — sin ciclo de vida, sin edición/cancelación (no pedidas), sin validación cruzada con Reservas; es el módulo más simple del proyecto por diseño explícito. |
| III. Sincronización en Tiempo Real | PASS — `useVisitasDelMes` usa `onSnapshot`; una visita cargada por un usuario aparece de inmediato en el calendario de los demás. |
| IV. TypeScript Estricto | PASS — tipo `Visita` explícito, sin `any`. |
| V. Estructura de Carpetas Minimalista | PASS — subcarpeta `visitas/` en `components/`, sin carpetas nuevas de nivel superior. |
| VI. Estilos Separados por Componente | PASS — `FormularioVisita.css` propio. |
| VII. Especificación Atómica por Módulo | PASS — corresponde 1:1 al spec `005-visitas`. |
| VIII. Acceso por Clave Compartida | N/A para este módulo. |

Sin violaciones. No se requiere entrada en Complexity Tracking.

**Nota de alcance (documentada explícitamente por el usuario, no una
omisión)**: este plan no incluye edición ni cancelación de una visita ya
cargada, a diferencia de la paridad que sí tiene Reservas. El propio spec
(`005-visitas/spec.md`) no contempla esas User Stories. Si se desea esa
paridad a futuro, corresponde primero un `/speckit-clarify` corto sobre el
spec, y luego re-planificar este módulo.

## Project Structure

### Documentation (this feature)

```text
specs/005-visitas/
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
│   └── visitas/
│       ├── FormularioVisita.tsx
│       └── FormularioVisita.css
├── components/
│   └── reservas/
│       └── BotonFlotanteNuevaReserva.tsx  # ya existente (004-reservas); se le agrega el selector de tipo "Reserva" | "Visita"
├── hooks/
│   └── useVisitasDelMes.ts
└── types/
    └── visita.ts
```

**Structure Decision**: Subcarpeta `visitas/` en `components/`, consistente
con el resto del proyecto. `BotonFlotanteNuevaReserva` (ya existente desde
`004-reservas`) se modifica in-place para agregar el selector de tipo, en
vez de crear un botón flotante nuevo duplicado — consistente con el
Principio II (reutilizar el punto de entrada existente) y evitar dos FABs
compitiendo por el mismo espacio en una UI mobile-first.

## Complexity Tracking

*No aplica: sin violaciones de la Constitution Check.*
