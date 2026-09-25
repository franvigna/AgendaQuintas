---

description: "Task list template for feature implementation"
---

# Tasks: Agenda (Calendario)

**Input**: Design documents from `/specs/006-agenda-calendario/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No se solicitaron tests automatizados explícitamente (Estrategia de Pruebas de la constitución: checklists manuales para el MVP). No se generan tareas de test; la validación se hace contra `quickstart.md`.

**Organization**: Tareas agrupadas por user story (spec.md).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- **[Story]**: A qué user story pertenece (US1, US2, US3)

## Path Conventions

Single project (frontend-only), rutas bajo `src/` en la raíz del repositorio, según `plan.md`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Estructura de archivos propia de este módulo, incluyendo la carpeta nueva `src/constants/` justificada en plan.md.

- [ ] T001 Crear la carpeta `src/components/calendario/` y archivos vacíos `Calendario.tsx`, `Calendario.css`, `DiaCalendario.tsx`, `DiaCalendario.css`, `ModalDetalleDia.tsx`, `ModalDetalleDia.css`
- [ ] T002 [P] Crear la carpeta `src/constants/` y el archivo `colores.ts` (vacío, se completa en Foundational)
- [ ] T003 [P] Crear `src/hooks/useGestoSwipe.ts` (archivo vacío, se completa en User Story 2)

**Checkpoint**: estructura de archivos lista.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Colores centralizados y tipo derivado de composición que todas las user stories necesitan.

**⚠️ CRITICAL**: no iniciar trabajo de ninguna user story hasta completar esta fase.

- [ ] T004 Definir en `src/constants/colores.ts` las constantes `colorQuintaSerrano1`, `colorQuintaSerrano2` y `colorVisita` (valores de color placeholder, ajustables cuando se defina la paleta final según Assumptions del spec)
- [ ] T005 Definir (como tipo TypeScript, sin persistencia) la forma `DiaConEventos` según `data-model.md`: `{ fecha: string; reservas: Reserva[]; visitas: Visita[] }`, donde `reservas` proviene de `useReservasDelMes` (módulo Reservas, ya filtrado para excluir estado `"cancelada"`) y `visitas` de `useVisitasDelMes` (módulo Visitas), ambos filtrados por `fecha` en el componente `Calendario`

**Checkpoint**: colores y tipo de composición listos — las user stories pueden empezar.

---

## Phase 3: User Story 1 - Ver el calendario del mes con ocupación marcada (Priority: P1) 🎯 MVP

**Goal**: Mostrar, como pantalla inicial tras el login, el calendario del mes actual con cada día marcado según qué quinta tiene reservada y si hay una visita programada, incluyendo marca doble cuando ambas quintas están ocupadas el mismo día.

**Independent Test**: Con datos de reservas y visitas ya cargados, abrir la app después del login y verificar que el calendario del mes actual muestra los días marcados con el color correspondiente a cada quinta ocupada o a una visita (quickstart.md, Escenario 2).

### Implementation for User Story 1

- [ ] T006 [US1] Implementar `Calendario` en `src/components/calendario/Calendario.tsx` (+ `.css`): mantiene el mes visible en `useState` local (inicializado en el mes actual), consume `useReservasDelMes(mes, año)` (módulo Reservas) y `useVisitasDelMes(mes, año)` (módulo Visitas) para el mes visible, renderiza una grilla de hasta 42 celdas (FR-001)
- [ ] T007 [US1] Implementar `DiaCalendario` en `src/components/calendario/DiaCalendario.tsx` (+ `.css`): recibe `fecha`, `reservas` y `visitas` ya filtradas para ese día por el padre; renderiza el número de día y hasta 3 marcadores de color usando las constantes de `src/constants/colores.ts` (T004): `colorQuintaSerrano1` si hay alguna reserva de esa quinta, `colorQuintaSerrano2` si hay alguna reserva de esa quinta, `colorVisita` si `visitas.length > 0` (FR-002)
- [ ] T008 [US1] Agregar en `DiaCalendario` la marca doble (un indicador independiente por quinta) cuando el día recibe reservas de ambas quintas simultáneamente, visualmente distinguible de un día con una sola quinta ocupada (FR-003)
- [ ] T009 [US1] Conectar `Calendario` (T006) para filtrar, por cada día de la grilla, las `reservas` y `visitas` del mes que correspondan a esa `fecha` exacta, y pasarlas como props a cada `DiaCalendario`

**Checkpoint**: User Story 1 completamente funcional — el calendario del mes muestra correctamente la ocupación de ambas quintas y las visitas, de forma independiente.

---

## Phase 4: User Story 2 - Navegar entre meses con swipe (Priority: P2)

**Goal**: Permitir deslizar el dedo hacia la izquierda o la derecha para moverse entre meses, sin botones de flecha, usando gestos táctiles nativos.

**Independent Test**: Deslizar el dedo sobre el calendario y verificar que cambia al mes anterior o siguiente según la dirección del gesto (quickstart.md, Escenario 4).

### Implementation for User Story 2

- [ ] T010 [US2] Implementar `useGestoSwipe(onSwipeIzquierda, onSwipeDerecha, umbralPx?)` en `src/hooks/useGestoSwipe.ts`: calcula la distancia horizontal entre los eventos nativos `touchstart` y `touchend`; si supera `umbralPx` (default 50) hacia la izquierda invoca `onSwipeIzquierda`, hacia la derecha invoca `onSwipeDerecha`; expone `{ onTouchStart, onTouchEnd }` para conectar a un elemento, sin usar ninguna librería externa de gestos
- [ ] T011 [US2] Conectar `useGestoSwipe` (T010) en `Calendario` (T006): `onSwipeIzquierda` avanza el mes visible (`useState`) al mes siguiente, `onSwipeDerecha` lo retrocede al mes anterior (FR-004)

**Checkpoint**: User Story 2 funciona de forma independiente — navegación entre meses por gesto, sin afectar la lógica de marcado de días de US1.

---

## Phase 5: User Story 3 - Abrir el detalle o la carga desde un día (Priority: P1)

**Goal**: Al tocar un día del calendario, abrir el formulario de alta si no tiene nada cargado, o mostrar el detalle combinado si tiene una reserva y/o visita, incluyendo acceso rápido para editar el estado de la seña.

**Independent Test**: Tocar un día sin datos y verificar que se abre el formulario de alta con la fecha precargada; tocar un día con datos y verificar que se abre el detalle correspondiente (quickstart.md, Escenarios 5 y 6).

### Implementation for User Story 3

- [ ] T012 [US3] Implementar `ModalDetalleDia` en `src/components/calendario/ModalDetalleDia.tsx` (+ `.css`): recibe `fecha`, `reservas`, `visitas` y `onCerrar`; si `reservas.length === 0 && visitas.length === 0`, renderiza el selector de tipo "Reserva" | "Visita" (o directamente `FormularioReserva`, según lo implementado en `005-visitas`) con `fecha` precargada; si hay al menos una reserva o visita, renderiza el detalle combinado delegando el contenido específico a `DetalleReserva` (módulo Reservas) y al detalle correspondiente del módulo Visitas (FR-005, FR-006)
- [ ] T013 [US3] Conectar en `DiaCalendario` (T007) el evento `onTap` para que, al tocar la celda, se abra `ModalDetalleDia` (T012) con la `fecha`, `reservas` y `visitas` de ese día
- [ ] T014 [US3] Verificar que, dentro de `ModalDetalleDia`, cuando se muestra el detalle de una reserva, el control de "marcar seña pagada" (ya implementado en `DetalleReserva` del módulo Reservas) esté accesible sin salir del flujo de detalle del día (FR-007)

**Checkpoint**: User Story 3 funciona de forma independiente — abrir detalle o alta desde cualquier día, de forma independiente de US2 (swipe) y complementaria a US1 (marcado visual).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validación final y ejecución de la guía de quickstart.

- [ ] T015 Ejecutar manualmente los 6 escenarios de `quickstart.md` de punta a punta (incluyendo el Escenario 3, que depende de que `useReservasDelMes` del módulo Reservas ya excluya reservas "Canceladas") y registrar el resultado en un checklist de verificación del módulo
- [ ] T016 [P] Revisar que ningún componente de este módulo use estilos inline (`style={{...}}`), consistente con el Principio VI de la constitución
- [ ] T017 [P] Revisar que no haya ningún uso de `any` en los archivos de este módulo (Principio IV: TypeScript estricto)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias, puede iniciar de inmediato
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA todas las user stories
- **User Stories (Phase 3-5)**: dependen de completar Foundational
  - US1 es prerequisito estructural de US2 y US3: `Calendario` (T006) y `DiaCalendario` (T007) deben existir antes de agregarles el gesto de swipe (US2) o la apertura de detalle/alta (US3)
  - US2 y US3 no dependen entre sí
- **Polish (Phase 6)**: depende de que las user stories deseadas estén completas

### User Story Dependencies

- **US1 (P1)**: puede iniciar apenas termine Foundational; sin dependencia de otras historias; **depende externamente** de que `useReservasDelMes` (módulo Reservas) y `useVisitasDelMes` (módulo Visitas) ya estén implementados
- **US2 (P2)**: depende de que `Calendario` (T006, de US1) ya exista para conectarle el gesto
- **US3 (P1)**: depende de que `DiaCalendario` (T007, de US1) ya exista para conectarle el evento `onTap`; **depende externamente** de `DetalleReserva` (módulo Reservas) y del detalle correspondiente de Visitas

### Within Each User Story

- Componente base (`Calendario`, `DiaCalendario`) antes de agregarle comportamiento adicional (swipe, apertura de detalle)

### Parallel Opportunities

- T002 y T003 (Setup) en paralelo
- T004 y T005 (Foundational, archivos distintos) en paralelo
- T016 y T017 (Polish) en paralelo
- T010 (`useGestoSwipe`, US2) puede implementarse en paralelo a T012 (`ModalDetalleDia`, US3), ya que son archivos independientes, una vez completada US1

---

## Parallel Example: Setup Phase

```bash
# Lanzar en paralelo:
Task: "Crear src/constants/colores.ts (archivo vacío)"
Task: "Crear src/hooks/useGestoSwipe.ts (archivo vacío)"
```

## Parallel Example: User Stories 2 y 3 (tras US1)

```bash
# Un desarrollador en US2, otro en US3, en paralelo:
Task: "Implementar useGestoSwipe en src/hooks/useGestoSwipe.ts"
Task: "Implementar ModalDetalleDia en src/components/calendario/ModalDetalleDia.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 y 3 - ambas P1)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (bloqueante)
3. Completar Phase 3: User Story 1 (ver calendario con ocupación marcada)
4. Completar Phase 5: User Story 3 (abrir detalle o alta desde un día)
5. **DETENER y VALIDAR**: ejecutar Escenarios 1, 2, 5 y 6 de quickstart.md
6. Este es el MVP funcional: calendario informativo + interacción completa
   (aunque sin navegación por swipe todavía)

### Incremental Delivery

1. Setup + Foundational → colores y tipo de composición listos
2. US1 → probar independientemente (calendario marcado correctamente) →
   demo parcial
3. US3 → probar independientemente (abrir detalle/alta desde un día) →
   demo (MVP funcional, sin swipe)
4. US2 (P2, navegación por swipe) → incremento posterior de usabilidad,
   sin bloquear el MVP
5. Cada historia agrega valor sin romper las anteriores

---

## Notes

- [P] = archivos distintos, sin dependencias entre sí
- Ver calendario marcado (T006-T009), navegar por swipe (T010-T011), y
  abrir detalle/alta (T012-T014) quedaron en tareas separadas y verificables
  dentro de su propia user story, no agrupadas en una tarea genérica de
  "implementar módulo Agenda"
- Sin tareas de test automatizado: se valida contra `quickstart.md`
  (Estrategia de Pruebas de la constitución)
- Este módulo no tiene datos propios en Firestore (FR-009); depende
  externamente de que los módulos Reservas y Visitas ya expongan
  `useReservasDelMes`/`useVisitasDelMes` con el contrato documentado
- **MVP sugerido**: User Stories 1 y 3 (ambas P1) — ver el calendario
  marcado correctamente y poder interactuar con cualquier día (detalle o
  alta). User Story 2 (P2, navegación por swipe) queda como incremento
  posterior de usabilidad, independientemente entregable sin afectar las
  historias P1 ya completas (el mes actual siempre es visible sin
  necesidad de navegar).
