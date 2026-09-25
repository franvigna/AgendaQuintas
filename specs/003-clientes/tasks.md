---

description: "Task list template for feature implementation"
---

# Tasks: Clientes

**Input**: Design documents from `/specs/003-clientes/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No se solicitaron tests automatizados explícitamente (Estrategia de Pruebas de la constitución: checklists manuales para el MVP). No se generan tareas de test; la validación se hace contra `quickstart.md`.

**Organization**: Tareas agrupadas por user story (spec.md).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- **[Story]**: A qué user story pertenece (US1, US2, US3, US4)

## Path Conventions

Single project (frontend-only), rutas bajo `src/` en la raíz del repositorio, según `plan.md`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Estructura de archivos propia de este módulo.

- [ ] T001 Crear la carpeta `src/components/clientes/` y archivos vacíos `ListaClientes.tsx`, `ListaClientes.css`, `DetalleCliente.tsx`, `DetalleCliente.css`, `BuscadorClientes.tsx`, `BuscadorClientes.css`
- [ ] T002 [P] Crear `src/types/cliente.ts` (archivo vacío, se completa en Foundational)

**Checkpoint**: estructura de archivos lista.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tipo de datos y hooks de lectura que todas las user stories necesitan.

**⚠️ CRITICAL**: no iniciar trabajo de ninguna user story hasta completar esta fase.

- [ ] T003 Definir en `src/types/cliente.ts` la interfaz `Cliente` con los campos `id: string`, `nombre: string` (no vacío), `telefono: string` (no vacío, **sin restricción de unicidad**, dos documentos pueden compartir el mismo valor según FR-008), `fechaAlta: Timestamp` (autogenerado), según `data-model.md`
- [ ] T004 Implementar `useClientes()` en `src/hooks/useClientes.ts`: se suscribe a toda la colección `clientes` de Firestore vía `onSnapshot`, expone `{ clientes: Cliente[], cargando: boolean, error: Error | null }`
- [ ] T005 Implementar `useReservasPorCliente(clienteId)` en `src/hooks/useReservasPorCliente.ts`: se suscribe vía `onSnapshot` a `query(collection(db, "reservas"), where("clienteId", "==", clienteId))`; expone `{ reservas: Reserva[], cantidadUtilizadas: number, cargando: boolean, error: Error | null }`, donde `cantidadUtilizadas` se calcula aplicando `getEstadoVisual(reserva)` (función del módulo Reservas) sobre cada reserva y contando las que resultan `"utilizada"` — **NO** usar un filtro `where("estado", "==", "utilizada")` en la query, ya que ese valor nunca se persiste en Firestore (ver contrato)
- [ ] T006 Implementar la función `crearCliente(datos: { nombre: string; telefono: string })` en un archivo de servicio (ej. `src/services/clientes.ts`): crea un nuevo documento en `clientes` con `fechaAlta: serverTimestamp()`, devuelve el `id` generado; sin ninguna validación de unicidad de teléfono (FR-008)

**Checkpoint**: tipo de datos, lectura de clientes, lectura de reservas por cliente y creación de cliente listos — las user stories pueden empezar.

---

## Phase 3: User Story 1 - Ver listado de clientes (Priority: P1) 🎯 MVP

**Goal**: Mostrar en la pestaña Clientes la lista de todos los clientes registrados con nombre, teléfono y cantidad de reservas en estado "Utilizada".

**Independent Test**: Entrar a la pestaña Clientes con datos ya cargados y verificar que la lista muestra nombre, teléfono y cantidad de reservas de cada cliente (quickstart.md, Escenario 1).

### Implementation for User Story 1

- [ ] T007 [US1] Implementar `ListaClientes` en `src/components/clientes/ListaClientes.tsx` (+ `.css`): consume `useClientes()` (T004) y, para cada cliente, `useReservasPorCliente(cliente.id)` (T005) para mostrar `nombre`, `telefono` y `cantidadUtilizadas` (FR-001)
- [ ] T008 [US1] Agregar en `ListaClientes` el estado vacío cuando `clientes.length === 0`, indicando que todavía no hay clientes cargados (Acceptance Scenario 2 de US1)

**Checkpoint**: User Story 1 completamente funcional — se puede ver la lista de clientes de forma independiente.

---

## Phase 4: User Story 2 - Ver el detalle e historial de un cliente (Priority: P1)

**Goal**: Permitir tocar un cliente en la lista y ver todas sus reservas pasadas (fecha, quinta, estado).

**Independent Test**: Tocar un cliente con reservas cargadas y verificar que se listan todas sus reservas con fecha, quinta y estado (quickstart.md, Escenario 5).

### Implementation for User Story 2

- [ ] T009 [US2] Implementar `DetalleCliente` en `src/components/clientes/DetalleCliente.tsx` (+ `.css`): consume `useReservasPorCliente(clienteId)` (T005) y renderiza la lista completa de `reservas`, cada una con fecha, quinta y estado (FR-003)
- [ ] T010 [US2] Agregar en `ListaClientes` (T007) la navegación al detalle de un cliente al tocar un ítem, abriendo `DetalleCliente` con ese `clienteId` (FR-002)

**Checkpoint**: User Stories 1 y 2 funcionan juntas — ver lista y acceder al historial de cualquier cliente, de forma independiente.

---

## Phase 5: User Story 3 - Buscar un cliente (Priority: P2)

**Goal**: Permitir buscar un cliente por nombre o por teléfono dentro de la lista de Clientes, para encontrarlo rápido sin recorrer toda la lista.

**Independent Test**: Escribir parte de un nombre o teléfono en el buscador de la lista y verificar que se filtra correctamente (quickstart.md, Escenario 4).

### Implementation for User Story 3

- [ ] T011 [US3] Agregar en `ListaClientes` (T007) un input de búsqueda que filtre en memoria el array de `useClientes()` por coincidencia parcial, insensible a mayúsculas/minúsculas, de `nombre` o `telefono` (FR-004)
- [ ] T012 [US3] Agregar en `ListaClientes` el estado vacío específico de "sin coincidencias" cuando la búsqueda no encuentra ningún cliente, distinto del estado vacío de "sin clientes cargados" (T008) (Edge Case del spec)

**Checkpoint**: User Story 3 funciona de forma independiente — búsqueda en la lista de Clientes, sin afectar US1/US2.

---

## Phase 6: User Story 4 - Elegir o crear cliente al cargar una reserva (Priority: P1)

**Goal**: Ofrecer, dentro del flujo de carga de una reserva, un buscador de clientes por nombre o teléfono que muestre coincidencias existentes como opciones seleccionables, o permita crear un cliente nuevo si no hay coincidencias — sin ninguna lógica automática de matching.

**Independent Test**: Con un stub de carga de reserva, escribir un nombre o teléfono en el buscador del formulario de reserva, verificar que se listan coincidencias existentes, y verificar que al no haber coincidencias se ofrece la opción de crear un cliente nuevo (quickstart.md, Escenarios 2 y 3).

### Implementation for User Story 4

- [ ] T013 [US4] Implementar `BuscadorClientes` en `src/components/clientes/BuscadorClientes.tsx` (+ `.css`) como componente compartido: recibe `onSeleccionar: (cliente: Cliente) => void` y `onCrearNuevo: (datos: { nombre: string; telefono: string }) => void`; renderiza un input de búsqueda que filtra en memoria la lista de `useClientes()` (T004) por coincidencia parcial de `nombre` o `telefono` (mismo criterio de filtrado que T011, reutilizable pero implementado en este componente independiente) y muestra los resultados como opciones seleccionables (FR-005)
- [ ] T014 [US4] Agregar en `BuscadorClientes` la acción de "crear cliente nuevo" cuando no hay coincidencias: reutiliza el texto ya escrito en el buscador como `nombre` (sin pedirlo de nuevo) y solicita únicamente `telefono` (10 dígitos, FR-011), invocando `onCrearNuevo` con esos datos (FR-006a)
- [ ] T015 [US4] Verificar que, al invocar `onSeleccionar(cliente)` desde `BuscadorClientes`, el llamador (módulo Reservas) reciba el `nombre` y `telefono` ya guardados del cliente elegido sin permitir editarlos desde ese flujo (FR-006)
- [ ] T015a [US4] Agregar en `BuscadorClientes` la validación de unicidad de teléfono al crear un cliente nuevo: si el teléfono ingresado coincide con el de un cliente ya existente, el sistema NO crea un cliente nuevo; en su lugar ofrece usar el cliente existente tal cual (invocando `onSeleccionar`) o renombrarlo al nombre recién ingresado (invocando `editarCliente` y luego `onSeleccionar`) (FR-008a)
- [ ] T020a [US5] Agregar en `DetalleCliente` (T020) la misma validación de unicidad de teléfono al editar: rechazar el guardado si el nuevo teléfono ya pertenece a otro cliente distinto del que se está editando (FR-008a)

**Checkpoint**: User Story 4 funciona de forma independiente (con un stub de llamador) — el componente `BuscadorClientes` queda listo para que el módulo Reservas lo embeba en su formulario de carga.

---

## Phase 6b: User Story 5 - Corregir los datos de un cliente ya cargado (Priority: P2)

**Goal**: Permitir editar `nombre` y `telefono` de un cliente ya creado desde su detalle, sin afectar su historial de reservas.

**Independent Test**: Entrar al detalle de un cliente existente, editar nombre y/o teléfono, guardar, y verificar que persiste y que el historial de reservas asociado no cambia.

### Implementation for User Story 5

- [ ] T019 [US5] Implementar la función `editarCliente(id, datos)` en `src/services/clientes.ts`: actualiza `nombre` y `telefono` del documento `clientes/{id}`, sin tocar la colección `reservas` (FR-007, FR-010)
- [ ] T020 [US5] Agregar en `DetalleCliente` (T009) un modo de edición de `nombre`/`telefono` con validación de campos no vacíos antes de guardar (FR-010), conectado a `editarCliente` (T019)

**Checkpoint**: User Story 5 funciona de forma independiente — se puede corregir nombre/teléfono de cualquier cliente sin afectar su historial.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validación final y ejecución de la guía de quickstart.

- [ ] T016 Ejecutar manualmente los 6 escenarios de `quickstart.md` de punta a punta (algunos requieren un stub o el módulo Reservas ya implementado) y registrar el resultado en un checklist de verificación del módulo
- [ ] T017 [P] Revisar que ningún componente de este módulo use estilos inline (`style={{...}}`), consistente con el Principio VI de la constitución
- [ ] T018 [P] Revisar que no haya ningún uso de `any` en los archivos de este módulo (Principio IV: TypeScript estricto)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias, puede iniciar de inmediato
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA todas las user stories
- **User Stories (Phase 3-6)**: dependen de completar Foundational
  - US2 depende de que `ListaClientes` ya exista (T007, de US1) para agregarle la navegación al detalle (T010)
  - US3 depende de que `ListaClientes` ya exista (T007, de US1) para agregarle el buscador
  - US4 (`BuscadorClientes`) es un componente independiente de `ListaClientes`/`DetalleCliente`; solo depende de Foundational (T004, T006)
- **Polish (Phase 7)**: depende de que todas las user stories deseadas estén completas

### User Story Dependencies

- **US1 (P1)**: puede iniciar apenas termine Foundational; sin dependencia de otras historias
- **US2 (P1)**: requiere que `ListaClientes` (T007) ya exista para conectar la navegación (T010), aunque `DetalleCliente` (T009) en sí mismo puede implementarse en paralelo
- **US3 (P2)**: requiere que `ListaClientes` (T007) ya exista para agregarle el buscador
- **US4 (P1)**: independiente de US1/US2/US3 — es un componente compartido consumido por el módulo Reservas, no por `ListaClientes`

### Within Each User Story

- Hook de lectura antes de conectar el componente
- Componente base antes de agregarle comportamiento adicional (navegación, búsqueda)

### Parallel Opportunities

- T001 y T002 (Setup) en paralelo
- T009 (`DetalleCliente`, US2) y T013-T014 (`BuscadorClientes`, US4) en paralelo con T007 (`ListaClientes`, US1), al ser archivos distintos sin dependencia entre sí
- T017 y T018 (Polish) en paralelo

---

## Parallel Example: Foundational Phase

```bash
# Lanzar en paralelo tras T003 (tipo Cliente):
Task: "Implementar useClientes en src/hooks/useClientes.ts"
Task: "Implementar useReservasPorCliente en src/hooks/useReservasPorCliente.ts"
```

## Parallel Example: User Stories tras Foundational

```bash
# Tres desarrolladores en paralelo:
Task: "Implementar ListaClientes en src/components/clientes/ListaClientes.tsx"
Task: "Implementar DetalleCliente en src/components/clientes/DetalleCliente.tsx"
Task: "Implementar BuscadorClientes en src/components/clientes/BuscadorClientes.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2 y 4 - todas P1)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (bloqueante)
3. Completar Phase 3: User Story 1 (ver listado)
4. Completar Phase 4: User Story 2 (ver detalle/historial)
5. Completar Phase 6: User Story 4 (buscador/alta de cliente, componente compartido)
6. **DETENER y VALIDAR**: ejecutar Escenarios 1, 2, 3 y 5 de quickstart.md
7. Este es el MVP funcional: registro histórico completo + capacidad de asociar clientes desde Reservas

### Incremental Delivery

1. Setup + Foundational → lectura de clientes y reservas por cliente lista
2. US1 → probar independientemente (lista visible) → demo parcial
3. US2 → probar independientemente (historial de un cliente) → demo
4. US4 → probar independientemente (buscador/alta, con stub de Reservas) → demo (MVP completo, ya que las 3 son P1)
5. US3 (P2, búsqueda en la lista) → incremento posterior, mejora de usabilidad sin bloquear el MVP

---

## Notes

- [P] = archivos distintos, sin dependencias entre sí
- Cada flujo funcional (listado, detalle, búsqueda en lista, buscador/alta
  compartido) quedó en tareas separadas y verificables dentro de su propia
  user story, no agrupadas en una tarea genérica de "CRUD de Clientes"
- Sin tareas de test automatizado: se valida contra `quickstart.md`
  (Estrategia de Pruebas de la constitución)
- **MVP sugerido**: User Stories 1, 2 y 4 (las 3 marcadas P1 en el spec) —
  ver listado, ver historial, y el buscador/alta compartido que necesita el
  módulo Reservas. User Story 3 (P2, búsqueda dentro de la lista de
  Clientes) queda como incremento posterior de usabilidad, independientemente
  entregable sin afectar las historias P1 ya completas.
