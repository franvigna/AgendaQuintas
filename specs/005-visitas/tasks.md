---

description: "Task list template for feature implementation"
---

# Tasks: Visitas

**Input**: Design documents from `/specs/005-visitas/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No se solicitaron tests automatizados explícitamente (Estrategia de Pruebas de la constitución: checklists manuales para el MVP). No se generan tareas de test; la validación se hace contra `quickstart.md`.

**Organization**: Tareas agrupadas por user story (spec.md).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- **[Story]**: A qué user story pertenece (US1, US2)

## Path Conventions

Single project (frontend-only), rutas bajo `src/` en la raíz del repositorio, según `plan.md`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Estructura de archivos propia de este módulo.

- [ ] T001 Crear la carpeta `src/components/visitas/` y archivos vacíos `FormularioVisita.tsx`, `FormularioVisita.css`
- [ ] T002 [P] Crear `src/types/visita.ts` (archivo vacío, se completa en Foundational)

**Checkpoint**: estructura de archivos lista.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tipo de datos, hook de lectura mensual y función de creación que ambas user stories necesitan.

**⚠️ CRITICAL**: no iniciar trabajo de ninguna user story hasta completar esta fase.

- [ ] T003 Definir en `src/types/visita.ts` la interfaz `Visita` con los campos `id: string`, `quintaId: string` (debe referenciar un documento existente en `quintas`), `fecha: string` (formato ISO `"YYYY-MM-DD"`), `nombreVisitante: string` (no vacío), `telefonoVisitante?: string` (opcional, sin validación de formato), `creadoEn: Timestamp` (autogenerado), según `data-model.md`
- [ ] T004 Implementar `useVisitasDelMes(mes, año)` en `src/hooks/useVisitasDelMes.ts`: se suscribe vía `onSnapshot` a una query de `visitas` filtrada por rango de `fecha` correspondiente al mes/año dados (análogo a `useReservasDelMes` del módulo Reservas, sin filtro de estado ya que Visita no tiene ese campo); expone `{ visitas: Visita[], cargando: boolean, error: Error | null }`
- [ ] T005 Implementar la función `crearVisita(datos: { quintaId: string; fecha: string; nombreVisitante: string; telefonoVisitante?: string })` en un archivo de servicio (ej. `src/services/visitas.ts`): crea un nuevo documento en `visitas` con `creadoEn: serverTimestamp()`, **sin ninguna validación de conflicto** con otras visitas o con reservas existentes (FR-007), y sin crear ni referenciar ningún documento en la colección `clientes` (FR-008)

**Checkpoint**: tipo de datos, lectura mensual y creación de visitas listos — las user stories pueden empezar.

---

## Phase 3: User Story 1 - Registrar una visita (Priority: P1) 🎯 MVP

**Goal**: Permitir registrar una visita a una quinta indicando quinta, fecha, nombre de quien visita y teléfono opcional, accediendo desde el mismo botón "+" que Reservas.

**Independent Test**: Iniciar la carga desde el botón "+" eligiendo tipo "Visita", completar los datos, y verificar que la visita queda registrada (quickstart.md, Escenarios 1 y 2).

### Implementation for User Story 1

- [ ] T006 [US1] Implementar `FormularioVisita` en `src/components/visitas/FormularioVisita.tsx` (+ `.css`): recibe `fechaInicial?: string` y `onGuardado: () => void` como props; renderiza selector de quinta (vía `useQuintas()` del módulo Quintas), selector de fecha (precargado si `fechaInicial` está presente), campo de nombre (requerido) y campo de teléfono (opcional) (FR-003, FR-004)
- [ ] T007 [US1] Conectar el botón de confirmar de `FormularioVisita` a `crearVisita` (T005); al completarse, invocar `onGuardado`
- [ ] T008 [US1] Modificar `BotonFlotanteNuevaReserva` (ya existente desde `004-reservas`, en `src/components/reservas/BotonFlotanteNuevaReserva.tsx`) para que, al tocarlo, presente primero un selector de tipo `"Reserva" | "Visita"`; si se elige "Visita", abrir `FormularioVisita` (T006) en vez de `FormularioReserva` (FR-001)
- [ ] T009 [US1] Verificar que, al tocar un día del calendario y elegir el tipo "Visita" en el selector presentado, `FormularioVisita` se abra con la fecha de ese día precargada en `fechaInicial` (FR-002)

**Checkpoint**: User Story 1 completamente funcional — se puede registrar una visita de punta a punta, desde el FAB o desde un día del calendario.

---

## Phase 4: User Story 2 - Ver visitas en el calendario (Priority: P1)

**Goal**: Mostrar las visitas registradas en el calendario con un color distinto al de las reservas, para distinguir de un vistazo qué días tienen una visita.

**Independent Test**: Con una visita ya registrada, abrir el calendario y verificar que se muestra en el día correspondiente con un color distinto al de una reserva (quickstart.md, Escenario 3).

### Implementation for User Story 2

- [ ] T010 [US2] Verificar que el módulo Agenda (`006-agenda-calendario`) consuma `useVisitasDelMes` (T004) para obtener las visitas del mes visible; si el módulo Agenda ya está implementado, confirmar que la integración funcione con esta implementación concreta del hook
- [ ] T011 [US2] Verificar (junto con el módulo Agenda) que cada día con al menos una visita muestre el marcador de color asignado a "visita" (definido en `src/constants/colores.ts` del módulo Agenda), visualmente distinto al de las quintas ocupadas (FR-005)

**Checkpoint**: User Story 2 funciona de forma independiente (asumiendo que el módulo Agenda ya expone la lógica de pintado) — las visitas se distinguen visualmente de las reservas en el calendario.

---

## Phase 4b: User Story 3 - Cargar una reserva a partir de una visita (Priority: P2, agregada 2026-09-25)

**Goal**: Ofrecer, desde el detalle de una visita, una acción para iniciar la carga de una reserva con quinta/fecha/nombre precargados.

**Independent Test**: Abrir el detalle de una visita, tocar "Crear reserva desde esta visita", y verificar que se abre `FormularioReserva` con quinta y fecha precargadas y el buscador de clientes con el nombre ya escrito (FR-009).

### Implementation for User Story 3

- [ ] T011a [US3] Agregar props opcionales `busquedaInicial`/`telefonoInicial` a `BuscadorClientes` (`src/components/clientes/BuscadorClientes.tsx`, módulo Clientes) para precargar el campo de búsqueda y el teléfono de alta
- [ ] T011b [US3] Agregar props opcionales `quintaIdInicial`, `nombreClienteInicial`, `telefonoClienteInicial` a `FormularioReserva` (módulo Reservas) para precargar quinta y pasar los valores iniciales al `BuscadorClientes` embebido
- [ ] T011c [US3] Agregar en el detalle de una visita (dentro de `ListaProximosAlquileres`, módulo Reservas) el botón "Crear reserva desde esta visita" que abre `FormularioReserva` en modo `"crear"` con los valores de la visita precargados (FR-009)

**Checkpoint**: User Story 3 funciona de forma independiente — se puede iniciar una reserva a partir de una visita sin crear nada automáticamente.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validación final y ejecución de la guía de quickstart.

- [ ] T012 Ejecutar manualmente los 6 escenarios de `quickstart.md` de punta a punta (incluyendo la coexistencia libre con Reservas y la ausencia de relación con Clientes) y registrar el resultado en un checklist de verificación del módulo
- [ ] T013 [P] Revisar que ningún componente de este módulo use estilos inline (`style={{...}}`), consistente con el Principio VI de la constitución
- [ ] T014 [P] Revisar que no haya ningún uso de `any` en los archivos de este módulo (Principio IV: TypeScript estricto)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias, puede iniciar de inmediato
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA ambas user stories
- **User Stories (Phase 3-4)**: dependen de completar Foundational
  - US1 depende de que `BotonFlotanteNuevaReserva` ya exista (módulo Reservas, `004-reservas`) para poder modificarlo (T008)
  - US2 depende de que el módulo Agenda (`006-agenda-calendario`) ya consuma hooks de tipo `useXxxDelMes`; si Agenda todavía no está implementado, T010-T011 quedan como verificación pendiente hasta que lo esté
- **Polish (Phase 5)**: depende de que ambas user stories estén completas

### User Story Dependencies

- **US1 (P1)**: puede iniciar apenas termine Foundational; requiere que el componente `BotonFlotanteNuevaReserva` del módulo Reservas ya exista para modificarlo (T008), pero no depende de que Reservas esté 100% implementado más allá de ese componente
- **US2 (P1)**: depende de Foundational (T004) y de la implementación del módulo Agenda para verificarse de punta a punta; el hook en sí (T004) puede darse por completo sin esperar a Agenda

### Within Each User Story

- Componente de formulario antes de conectar la función de guardado
- Modificación del FAB compartido (T008) después de que `FormularioVisita` (T006) exista

### Parallel Opportunities

- T001 y T002 (Setup) en paralelo
- T003 y (preparación de) T004/T005 pueden solaparse una vez definida la interfaz `Visita`
- T013 y T014 (Polish) en paralelo

---

## Parallel Example: Foundational Phase

```bash
# Tras T003 (tipo Visita), en paralelo:
Task: "Implementar useVisitasDelMes en src/hooks/useVisitasDelMes.ts"
Task: "Implementar crearVisita en src/services/visitas.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 y 2 - ambas P1)

Ambas historias son P1: registrar una visita (US1) y verla en el calendario
(US2) son las dos mitades del mismo propósito central del módulo.

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (bloqueante)
3. Completar Phase 3: User Story 1 (registrar visita)
4. Completar Phase 4: User Story 2 (ver en calendario, requiere Agenda)
5. **DETENER y VALIDAR**: ejecutar Escenarios 1, 2 y 3 de quickstart.md
6. Este es el MVP funcional completo del módulo Visitas

### Incremental Delivery

1. Setup + Foundational → lectura mensual y creación de visitas listas
2. US1 → probar independientemente (registrar visita desde el FAB o el
   calendario) → demo parcial
3. US2 → probar en conjunto con el módulo Agenda (marcador de color) → demo
   completa
4. Con US1 + US2, el módulo Visitas queda 100% funcional; no quedan
   incrementos P2/P3 pendientes (el spec solo define estas 2 historias,
   ambas P1)

---

## Notes

- [P] = archivos distintos, sin dependencias entre sí
- Registrar visita (T006-T009) y verla en el calendario (T010-T011) quedaron
  en tareas separadas y verificables, no agrupadas en una tarea genérica de
  "implementar módulo Visitas"
- Sin tareas de test automatizado: se valida contra `quickstart.md`
  (Estrategia de Pruebas de la constitución)
- Este módulo NO incluye edición ni cancelación de una visita ya cargada
  (decisión explícita, fuera de alcance del spec vigente; ver research.md)
- **MVP sugerido**: User Stories 1 y 2, ambas P1 — no hay historias P2/P3 en
  este spec, por lo que el MVP y el alcance completo del módulo coinciden.
