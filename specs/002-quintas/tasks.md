---

description: "Task list template for feature implementation"
---

# Tasks: Quintas

**Input**: Design documents from `/specs/002-quintas/`

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

- [ ] T001 Crear la carpeta `src/components/quintas/` y archivos vacíos `ConfiguracionQuintas.tsx`, `ConfiguracionQuintas.css`, `FormularioQuinta.tsx`, `FormularioQuinta.css`
- [ ] T002 [P] Crear `src/types/quinta.ts` (archivo vacío, se completa en Foundational)
- [ ] T003 [P] Verificar que `src/services/firebase.ts` ya inicialice el SDK de Firebase (Firestore); si no existe, crearlo con la configuración compartida del proyecto

**Checkpoint**: estructura de archivos lista.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tipo de datos, hook de lectura y datos semilla que ambas user stories necesitan.

**⚠️ CRITICAL**: no iniciar trabajo de ninguna user story hasta completar esta fase.

- [ ] T004 Definir en `src/types/quinta.ts` la interfaz `Quinta` con los campos `id: string`, `nombre: string` (no vacío), `capacidadBase: number` (`>= 0`), `precioSemana: number` (`>= 0`), `precioFinde: number` (`>= 0`), `costoPersonaExtra: number` (`>= 0`, puede ser 0), `horarioInicio: string` (formato `"HH:mm"`), `horarioFin: string` (formato `"HH:mm"`, debe ser posterior a `horarioInicio`), `costoHoraExtra: number` (`>= 0`, puede ser 0), `porcentajeSeña: number` (rango `[0, 100]`), según `data-model.md`
- [ ] T005 Implementar `useQuintas()` en `src/hooks/useQuintas.ts`: se suscribe a la colección `quintas` de Firestore vía `onSnapshot` al montar, se desuscribe al desmontar, expone `{ quintas: Quinta[], cargando: boolean, error: Error | null }`, sin paginación ni filtros
- [ ] T006 Cargar los datos semilla en Firestore (script de setup único, fuera de la UI): documento "Quinta Serrano 1" (`capacidadBase: 50`, `precioSemana: 300000`, `precioFinde: 350000`, `costoPersonaExtra: 0`, `horarioInicio: "10:00"`, `horarioFin: "19:00"`, `costoHoraExtra: 0`, `porcentajeSeña: 30`) y "Quinta Serrano 2" (`capacidadBase: 40`, `precioSemana: 250000`, `precioFinde: 300000`, `costoPersonaExtra: 0`, `horarioInicio: "10:00"`, `horarioFin: "19:00"`, `costoHoraExtra: 0`, `porcentajeSeña: 30`), según FR-010 y los datos semilla de `data-model.md`

**Checkpoint**: tipo de datos, lectura en tiempo real y datos semilla listos — las user stories pueden empezar.

---

## Phase 3: User Story 1 - Ver la lista de quintas configuradas (Priority: P1) 🎯 MVP

**Goal**: Permitir al administrador ver la lista de las quintas existentes desde la pantalla de Configuración, para elegir cuál editar.

**Independent Test**: Entrar a Configuración y verificar que se listan Quinta Serrano 1 y Quinta Serrano 2 con sus datos principales visibles (quickstart.md, Escenario 1).

### Implementation for User Story 1

- [ ] T007 [US1] Implementar `ConfiguracionQuintas` en `src/components/quintas/ConfiguracionQuintas.tsx` (+ `.css`): consume `useQuintas()` (T005) y renderiza una lista mostrando al menos el `nombre` de cada quinta (FR-001)
- [ ] T008 [US1] Agregar en `ConfiguracionQuintas` la navegación al detalle de edición de una quinta al tocar un ítem de la lista (FR-002), abriendo `FormularioQuinta` (implementado en User Story 2) con esa quinta

**Checkpoint**: User Story 1 completamente funcional — se puede ver la lista de quintas de forma independiente (aunque la edición completa depende de US2 para el detalle).

---

## Phase 4: User Story 2 - Editar los datos y precios de una quinta (Priority: P1)

**Goal**: Permitir entrar al detalle de una quinta y editar cualquiera de sus valores configurables, persistiendo los cambios de inmediato para el cálculo de reservas.

**Independent Test**: Entrar a una quinta, modificar un valor (ej. precio de fin de semana), guardar, y verificar que el nuevo valor persiste al volver a entrar a esa quinta (quickstart.md, Escenario 2).

### Implementation for User Story 2

- [ ] T009 [US2] Implementar `FormularioQuinta` en `src/components/quintas/FormularioQuinta.tsx` (+ `.css`): formulario controlado que recibe una `Quinta` existente como prop y renderiza campos editables para `nombre`, `capacidadBase`, `precioSemana`, `precioFinde`, `costoPersonaExtra`, `horarioInicio`, `horarioFin`, `costoHoraExtra`, `porcentajeSeña` (FR-003)
- [ ] T010 [US2] Implementar en `FormularioQuinta` la validación local antes de guardar: rechazar si `capacidadBase`, `precioSemana`, `precioFinde`, `costoPersonaExtra` o `costoHoraExtra` son negativos o no numéricos (FR-004); rechazar si `porcentajeSeña` está fuera del rango `[0, 100]` (FR-004a); rechazar si `horarioFin` no es estrictamente posterior a `horarioInicio` (FR-005); mostrar un mensaje de validación claro en cada caso sin persistir el cambio (SC-004)
- [ ] T011 [US2] Implementar la función `guardarQuinta(id, datos)` (ej. en `src/services/quintas.ts`): actualiza el documento `quintas/{id}` en Firestore con los campos provistos, ya validados por T010; sin ninguna validación cruzada contra reservas existentes (FR-007, el guardado es incondicional una vez pasada la validación local)
- [ ] T012 [US2] Conectar el botón de guardar de `FormularioQuinta` a `guardarQuinta` (T011); verificar que costo por persona extra y costo por hora extra puedan guardarse en 0 sin bloquear el guardado del resto de los campos (FR-009)

**Checkpoint**: User Stories 1 y 2 funcionan juntas — se puede ver y editar cualquier quinta de punta a punta.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validación final y ejecución de la guía de quickstart.

- [ ] T013 Ejecutar manualmente los 4 escenarios de `quickstart.md` de punta a punta (incluyendo el Escenario 4, que depende del módulo Reservas ya implementado) y registrar el resultado en un checklist de verificación del módulo
- [ ] T014 [P] Revisar que ningún componente de este módulo use estilos inline (`style={{...}}`), consistente con el Principio VI de la constitución
- [ ] T015 [P] Revisar que no haya ningún uso de `any` en los archivos de este módulo (Principio IV: TypeScript estricto)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias, puede iniciar de inmediato
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA ambas user stories
- **User Stories (Phase 3-4)**: dependen de completar Foundational
  - US1 (T007) es prerequisito de T008 (navegación al detalle), que a su vez depende de que `FormularioQuinta` exista (US2, T009) para poder navegar a algo real
  - US2 puede implementarse en paralelo a US1 en cuanto a la lógica de formulario y validación (T009-T011), pero la conexión final de "tocar la lista y abrir el formulario" (T008) requiere ambos componentes
- **Polish (Phase 5)**: depende de que ambas user stories estén completas

### User Story Dependencies

- **US1 (P1)**: puede iniciar apenas termine Foundational; su Independent Test (ver la lista) no requiere que la edición esté terminada
- **US2 (P1)**: puede iniciar apenas termine Foundational; su Independent Test (editar y persistir) no requiere que `ConfiguracionQuintas` esté terminado, siempre que `FormularioQuinta` pueda probarse de forma aislada con una quinta de prueba

### Within Each User Story

- Componente de formulario/lista antes de conectar la lógica de guardado
- Validación (T010) antes de conectar el guardado real (T011-T012)

### Parallel Opportunities

- T002 y T003 (Setup) en paralelo
- T007 (lista, US1) y T009-T010 (formulario y validación, US2) pueden trabajarse en paralelo por distintos desarrolladores, ya que son archivos distintos; la integración final (T008) requiere ambos
- T014 y T015 (Polish) en paralelo

---

## Parallel Example: Setup Phase

```bash
# Lanzar en paralelo:
Task: "Crear src/types/quinta.ts (archivo vacío)"
Task: "Verificar/crear src/services/firebase.ts"
```

## Parallel Example: User Stories 1 y 2 (tras Foundational)

```bash
# Un desarrollador en US1, otro en US2, en paralelo:
Task: "Implementar ConfiguracionQuintas en src/components/quintas/ConfiguracionQuintas.tsx"
Task: "Implementar FormularioQuinta en src/components/quintas/FormularioQuinta.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 y 2 - ambas P1)

Ambas historias son P1 y se complementan: no hay un MVP parcial más chico que
"ver la lista + poder editar", ya que el propósito del módulo es exactamente
ese ciclo completo de configuración.

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (bloqueante)
3. Completar Phase 3: User Story 1 (ver lista)
4. Completar Phase 4: User Story 2 (editar y persistir)
5. **DETENER y VALIDAR**: ejecutar Escenarios 1, 2 y 3 de quickstart.md
6. Este es el MVP funcional completo del módulo Quintas

### Incremental Delivery

1. Setup + Foundational → datos semilla cargados, lectura en tiempo real lista
2. US1 → probar independientemente (lista visible) → demo parcial
3. US2 → probar independientemente (edición y validación) → demo completa
4. Con US1 + US2, el módulo Quintas queda 100% funcional; no quedan
   incrementos P2/P3 pendientes (el spec solo define estas 2 historias, ambas
   P1)

---

## Notes

- [P] = archivos distintos, sin dependencias entre sí
- Cada flujo funcional (listar, editar+validar, guardar) quedó en tareas
  separadas y verificables, no agrupadas en una tarea genérica de "CRUD de
  Quintas"
- Sin tareas de test automatizado: se valida contra `quickstart.md`
  (Estrategia de Pruebas de la constitución)
- **MVP sugerido**: User Stories 1 y 2, ambas P1 — no hay historias P2/P3 en
  este spec, por lo que el MVP y el alcance completo del módulo coinciden.
  No queda ningún incremento posterior pendiente para este módulo salvo
  trabajo fuera de su alcance declarado (alta/baja de quintas desde la UI,
  explícitamente fuera de alcance según el spec).
