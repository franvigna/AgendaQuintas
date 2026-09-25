# Implementation Plan: Agenda (Calendario)

**Branch**: `006-agenda-calendario` | **Date**: 2026-09-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-agenda-calendario/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Vista de calendario mensual sin datos propios en Firestore: compone en
tiempo real los datos de `useReservasDelMes` (módulo Reservas) y
`useVisitasDelMes` (módulo Visitas) para pintar cada día con el color
correspondiente (Quinta Serrano 1, Quinta Serrano 2, visita, o combinación),
navega entre meses con gestos táctiles nativos (sin librería de gestos), y
delega a `FormularioReserva`/`ModalDetalleDia` la interacción de tocar un
día. El estado de qué mes se está viendo es efímero y local a cada
dispositivo (`useState`), no sincronizado entre usuarios.

## Technical Context

**Language/Version**: TypeScript (modo estricto) sobre React 18

**Primary Dependencies**: React 18, Vite; consume `useReservasDelMes()`
(módulo Reservas) y `useVisitasDelMes()` (módulo Visitas, a definir en su
propio plan); sin librerías externas de gestos táctiles (eventos nativos
`touchstart`/`touchend`)

**Storage**: N/A — este módulo no tiene colección propia en Firestore (FR-009
del spec); es una vista de composición

**Testing**: Checklist de pruebas manuales guiadas (Estrategia de Pruebas de
la constitución), con foco en la correcta combinación visual de múltiples
fuentes de datos por día

**Target Platform**: Navegador móvil (mobile-first); pantalla inicial tras
el login (módulo Acceso)

**Project Type**: Web application (frontend-only; vista de agregación pura)

**Performance Goals**: Cambio de mes fluido con el gesto de swipe, sin
demora perceptible (los datos del mes destino ya deberían estar
disponibles o cargarse casi instantáneamente vía `onSnapshot` de
`useReservasDelMes`/`useVisitasDelMes`)

**Constraints**: Mobile-first (Principio I); sin librería de gestos externa
(decisión explícita del usuario, alineada con Principio II); vista solo
mensual, sin semanal/diaria (FR-008 del spec); colores como constantes
ajustables (paleta final pendiente, Assumptions del spec); TypeScript
estricto (Principio IV); CSS por componente sin estilos inline (Principio
VI)

**Scale/Scope**: Un mes de grilla (hasta 6 semanas × 7 días = 42 celdas)
renderizado por vez; volumen de reservas/visitas por mes bajo (acorde al
resto del proyecto)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Mobile-First Siempre | PASS — grilla de calendario y gestos táctiles diseñados exclusivamente para viewport móvil; sin soporte de navegación con mouse/flechas de teclado. |
| II. Simplicidad Ante Todo | PASS — gestos táctiles nativos en vez de una librería externa (menor superficie, menor bundle); estado del mes visible como `useState` simple, sin Redux/Context innecesario para un solo componente. |
| III. Sincronización en Tiempo Real | PASS — `useReservasDelMes`/`useVisitasDelMes` (ambos vía `onSnapshot` en sus módulos de origen) hacen que una reserva o visita cargada por otro usuario aparezca en el calendario sin recargar. El mes visible en sí es intencionalmente local (no sincronizado), consistente con que es un dato de navegación efímero, no de negocio. |
| IV. TypeScript Estricto | PASS — tipos explícitos para las props de `Calendario`, `DiaCalendario`, `ModalDetalleDia`. |
| V. Estructura de Carpetas Minimalista | PASS — subcarpeta `calendario/` en `components/`; constante de colores en `src/constants/colores.ts` (única adición de carpeta nueva, justificada abajo). |
| VI. Estilos Separados por Componente | PASS — un `.css` por componente. |
| VII. Especificación Atómica por Módulo | PASS — corresponde 1:1 al spec `006-agenda-calendario`. |
| VIII. Acceso por Clave Compartida | N/A para este módulo. |

Sin violaciones. `src/constants/` es una carpeta nueva de nivel superior,
justificada en Complexity Tracking por ser un caso límite del Principio V.

**Nota de alineación con `004-reservas` (clarificación reciente)**: el spec
de Reservas ahora incluye un estado "Cancelada" que debe excluirse de las
consultas de ocupación (FR-018 de ese módulo). Este plan asume que
`useReservasDelMes()` ya filtra (o expone un campo para filtrar) las
reservas canceladas antes de que `Calendario` las reciba, de forma que un
día con una reserva cancelada se muestre libre. Se documenta en
Assumptions/research.md para trazabilidad, ya que no es una regla nueva de
este módulo sino una consecuencia de lo ya definido en Reservas.

## Project Structure

### Documentation (this feature)

```text
specs/006-agenda-calendario/
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
│   └── calendario/
│       ├── Calendario.tsx
│       ├── Calendario.css
│       ├── DiaCalendario.tsx
│       ├── DiaCalendario.css
│       ├── ModalDetalleDia.tsx
│       └── ModalDetalleDia.css
├── hooks/
│   └── useGestoSwipe.ts        # encapsula touchstart/touchend + umbral de distancia
└── constants/
    └── colores.ts              # colorQuintaSerrano1, colorQuintaSerrano2, colorVisita
```

**Structure Decision**: Subcarpeta `calendario/` en `components/`,
consistente con el resto del proyecto. Se agrega `src/constants/` como
carpeta nueva de nivel superior — ver Complexity Tracking para la
justificación puntual, ya que en principio el Principio V favorece no crear
carpetas nuevas.

## Complexity Tracking

| Violación (aparente) | Por qué es necesaria | Alternativa más simple descartada |
|---|---|---|
| Nueva carpeta `src/constants/` de nivel superior | Los 3 colores del calendario son un valor de configuración transversal, no propio de un solo componente: se necesitan en `DiaCalendario` (pintar el día) y potencialmente en una leyenda o en `ModalDetalleDia`. Colocarlos dentro de `components/calendario/` los ata a un solo módulo cuando conceptualmente son un dato de configuración de toda la app (como ya existen `hooks/`, `types/`, `services/` de nivel superior). | Definir los colores como constantes locales dentro de `Calendario.tsx` — descartado porque el propio usuario pidió un archivo de configuración separado, fácil de ajustar cuando se defina la paleta final (Assumptions del spec original: "decisión de diseño visual que se resuelve en la fase de planificación"); duplicarlos inline en cada componente que los necesite violaría DRY sin beneficio. |
