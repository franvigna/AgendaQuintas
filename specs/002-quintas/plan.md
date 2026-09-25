# Implementation Plan: Quintas

**Branch**: `002-quintas` | **Date**: 2026-09-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-quintas/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Módulo de configuración CRUD para las Quintas: listar las dos quintas
existentes y editar sus datos y precios (capacidad, precios base, costos
extra, horario estándar, porcentaje de seña). Los datos viven en Firestore
(colección `quintas`) y se consumen en tiempo real vía `onSnapshot`, para que
un cambio de precio hecho por un usuario esté disponible de inmediato para
los otros 2 usuarios y para el cálculo de nuevas reservas (Principio III de la
constitución). Es CRUD simple, sin lógica de negocio compleja: la única regla
no trivial es que los cambios de precio no afectan reservas ya creadas
(responsabilidad del módulo Reservas, no de este).

## Technical Context

**Language/Version**: TypeScript (modo estricto) sobre React 18

**Primary Dependencies**: React 18, Vite, Firebase SDK (Firestore, `onSnapshot`)

**Storage**: Firebase Firestore, colección `quintas` (documentos con id
autogenerado o slug, ver Data Model)

**Testing**: Checklist de pruebas manuales guiadas (consistente con la
Estrategia de Pruebas de la constitución; sin suite automatizada exhaustiva
en el MVP)

**Target Platform**: Navegador móvil (mobile-first); Vercel o Netlify para
hosting estático del build de Vite

**Project Type**: Web application (frontend-only; Firestore actúa como
backend administrado, sin servidor propio)

**Performance Goals**: Cambios guardados visibles en los demás dispositivos
en tiempo real (segundos), acorde a la latencia estándar de `onSnapshot` de
Firestore; no hay meta de throughput dado el volumen de uso (3 usuarios, 2
documentos)

**Constraints**: Mobile-first (Principio I); sin roles ni permisos
diferenciados (Principio II, VIII); TypeScript estricto sin `any` (Principio
IV); CSS en archivo separado por componente, sin estilos inline (Principio
VI)

**Scale/Scope**: 2 documentos en la colección `quintas` (con posibilidad de
agregar más a futuro por código, sin UI de alta/baja); 3 usuarios
concurrentes como máximo

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Mobile-First Siempre | PASS — `ConfiguracionQuintas` y `FormularioQuinta` se diseñan como listas y formularios de una sola columna, con inputs y controles dimensionados para touch, sin layout específico de desktop. |
| II. Simplicidad Ante Todo | PASS — CRUD directo sobre 2 documentos, sin roles, sin abstracciones de repositorio genérico ni capas adicionales; se accede a Firestore directamente desde el hook `useQuintas`. |
| III. Sincronización en Tiempo Real | PASS — `useQuintas` se suscribe vía `onSnapshot`, no hace polling ni depende de un fetch único; los cambios de un dispositivo llegan a los demás sin acción manual. |
| IV. TypeScript Estricto | PASS — el modelo `Quinta` se tipa explícitamente (interface), sin `any`; validación de formulario tipada. |
| V. Estructura de Carpetas Minimalista | PASS — se reutiliza la estructura general del proyecto (`src/components`, `src/hooks`, `src/types`, `src/services` o equivalente ya definido en la raíz); este módulo no introduce carpetas nuevas más allá de los archivos de sus propios componentes/hook. |
| VI. Estilos Separados por Componente | PASS — `ConfiguracionQuintas.css` y `FormularioQuinta.css` uno por componente, sin `style={{...}}` inline. |
| VII. Especificación Atómica por Módulo | PASS — este plan corresponde 1:1 al spec de `002-quintas`, generado previamente vía `/speckit-specify`. |
| VIII. Acceso por Clave Compartida | N/A para este módulo — no introduce ni modifica lógica de autenticación. |

Sin violaciones. No se requiere entrada en Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/002-quintas/
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
│   └── quintas/
│       ├── ConfiguracionQuintas.tsx
│       ├── ConfiguracionQuintas.css
│       ├── FormularioQuinta.tsx
│       └── FormularioQuinta.css
├── hooks/
│   └── useQuintas.ts
├── types/
│   └── quinta.ts
└── services/
    └── firebase.ts       # inicialización compartida del SDK de Firebase (ya existente o creada una sola vez para todo el proyecto)
```

**Structure Decision**: Aplicación web de un solo proyecto frontend (React +
Vite), sin backend propio — Firestore actúa como capa de persistencia y
sincronización administrada. Se sigue la convención ya establecida en la raíz
del repo (`src/components`, `src/hooks`, `src/types`, `src/services`),
agregando una subcarpeta `quintas/` dentro de `components/` para agrupar los 2
componentes de este módulo, consistente con el Principio V (estructura
minimalista: no se crean carpetas nuevas de nivel superior, solo la
subcarpeta necesaria para este módulo).

## Complexity Tracking

*No aplica: sin violaciones de la Constitution Check.*
