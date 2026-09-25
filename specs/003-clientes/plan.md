# Implementation Plan: Clientes

**Branch**: `003-clientes` | **Date**: 2026-09-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-clientes/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Módulo que mantiene el registro histórico de clientes (nombre, teléfono,
fecha de alta) y expone un buscador reutilizable para el flujo de carga de
reservas. Sin pantalla de alta manual: los clientes se crean únicamente desde
el módulo Reservas, a través del componente compartido `BuscadorClientes`. El
teléfono NO es un identificador único validado por el sistema (FR-008 del
spec, confirmado explícitamente): el buscador solo lista coincidencias
parciales por nombre o teléfono, y es el administrador quien decide si
reutilizar un cliente existente o crear uno nuevo. El conteo de "cantidad de
reservas" se calcula en tiempo real vía query a `reservas` (sin contador
propio desincronizable), filtrando por `clienteId` y `estado == "utilizada"`.

## Technical Context

**Language/Version**: TypeScript (modo estricto) sobre React 18

**Primary Dependencies**: React 18, Vite, Firebase SDK (Firestore)

**Storage**: Firebase Firestore, colección `clientes`; lectura filtrada de la
colección `reservas` (propiedad del módulo Reservas) para calcular historial
y conteo

**Testing**: Checklist de pruebas manuales guiadas (Estrategia de Pruebas de
la constitución)

**Target Platform**: Navegador móvil (mobile-first); mismo build que el
resto de la app

**Project Type**: Web application (frontend-only; Firestore como
persistencia y sincronización)

**Performance Goals**: Lista de clientes visible en menos de 5 segundos
(SC-001); búsqueda de un cliente en menos de 10 segundos (SC-002); selección
de cliente en el buscador de reservas en menos de 15 segundos (SC-003)

**Constraints**: Requiere sesión activa vía el módulo Acceso (Firestore
exige `request.auth != null`, ver `001-acceso`); sin roles ni permisos
diferenciados (Principio II, VIII); TypeScript estricto (Principio IV); CSS
por componente sin estilos inline (Principio VI); sin pantalla de alta/edición
manual de clientes (FR-007 del spec)

**Scale/Scope**: Volumen bajo (decenas a pocos cientos de clientes en el
horizonte del proyecto); búsqueda client-side sobre la lista ya sincronizada,
sin necesidad de un servicio de búsqueda dedicado

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Mobile-First Siempre | PASS — `ListaClientes`, `DetalleCliente` y `BuscadorClientes` son listas/formularios de una columna, dimensionados para touch. |
| II. Simplicidad Ante Todo | PASS — sin contador desincronizable (se calcula por query), sin pantalla de alta manual, sin servicio de búsqueda dedicado (filtro client-side suficiente para el volumen esperado). |
| III. Sincronización en Tiempo Real | PASS — `useClientes()` y `useReservasPorCliente()` usan `onSnapshot`; el historial y el conteo de un cliente se actualizan solos ante cualquier cambio de estado de una reserva en otro dispositivo. |
| IV. TypeScript Estricto | PASS — tipo `Cliente` explícito, sin `any`. |
| V. Estructura de Carpetas Minimalista | PASS — subcarpeta `clientes/` en `components/`, sin carpetas nuevas de nivel superior; `BuscadorClientes` se ubica de forma que sea importable tanto desde Clientes como desde Reservas sin duplicar código. |
| VI. Estilos Separados por Componente | PASS — un `.css` por componente. |
| VII. Especificación Atómica por Módulo | PASS — corresponde 1:1 al spec `003-clientes`. |
| VIII. Acceso por Clave Compartida | N/A para este módulo — no introduce lógica de autenticación; depende de que `001-acceso` ya haya autenticado la sesión de Firestore. |

Sin violaciones. No se requiere entrada en Complexity Tracking.

**Nota de alineación con el spec**: se evaluó y descartó explícitamente tratar
el teléfono como campo único validado a nivel de escritura (discutido con el
usuario antes de este plan). Se mantiene el comportamiento de FR-008: sin
validación automática de unicidad: el campo `telefono` no lleva ninguna
restricción de unicidad a nivel de Firestore ni de aplicación.

## Project Structure

### Documentation (this feature)

```text
specs/003-clientes/
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
│   └── clientes/
│       ├── ListaClientes.tsx
│       ├── ListaClientes.css
│       ├── DetalleCliente.tsx
│       ├── DetalleCliente.css
│       ├── BuscadorClientes.tsx     # componente compartido, importado también por el módulo Reservas
│       └── BuscadorClientes.css
├── hooks/
│   ├── useClientes.ts
│   └── useReservasPorCliente.ts
└── types/
    └── cliente.ts
```

**Structure Decision**: Se agrega la subcarpeta `clientes/` en
`components/`, siguiendo la misma convención de `quintas/` y `acceso/` ya
establecida. `BuscadorClientes` vive físicamente en `components/clientes/`
(es dueño natural del concepto "cliente"), pero se diseña como componente
autocontenido para que el módulo Reservas lo importe directamente sin
duplicar lógica de búsqueda, consistente con el Principio V (no crear una
carpeta compartida nueva del tipo `components/shared/` solo para este caso).

## Complexity Tracking

*No aplica: sin violaciones de la Constitution Check.*
