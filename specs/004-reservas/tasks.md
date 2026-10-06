---

description: "Task list template for feature implementation"
---

# Tasks: Reservas

**Input**: Design documents from `/specs/004-reservas/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No se solicitaron tests automatizados explícitamente (la Estrategia de Pruebas de la constitución prioriza checklists manuales para el MVP). No se generan tareas de test; la validación de cada historia se hace contra los escenarios de `quickstart.md`.

**Organization**: Tareas agrupadas por user story (spec.md) para permitir implementación y prueba independiente de cada una.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- **[Story]**: A qué user story pertenece (US1 a US5)
- Se incluye la ruta de archivo exacta en cada descripción

## Path Conventions

Single project (frontend-only), rutas bajo `src/` en la raíz del repositorio, según `plan.md`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialización de la estructura de archivos propia de este módulo (no crea el proyecto Vite en sí, que ya existe desde módulos anteriores).

- [ ] T001 Crear la carpeta `src/components/reservas/` y archivos vacíos `BotonFlotanteNuevaReserva.tsx`, `BotonFlotanteNuevaReserva.css`, `FormularioReserva.tsx`, `FormularioReserva.css`, `DetalleReserva.tsx`, `DetalleReserva.css`, `ListaProximosAlquileres.tsx`, `ListaProximosAlquileres.css`
- [ ] T002 [P] Crear `src/utils/calcularPrecioReserva.ts` y `src/utils/getEstadoVisual.ts` (archivos vacíos, carpeta `utils/` nueva de nivel superior según plan.md)
- [ ] T003 [P] Crear `src/types/reserva.ts` con el tipo base `Reserva` (sin lógica todavía)

**Checkpoint**: estructura de archivos lista para implementar la lógica del módulo.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tipos, funciones puras y hooks base que TODAS las user stories necesitan. Ninguna historia puede implementarse antes de completar esta fase.

**⚠️ CRITICAL**: No iniciar trabajo de ninguna user story hasta completar esta fase.

- [ ] T004 Definir en `src/types/reserva.ts` el tipo `EstadoPersistido = "pendiente_seña" | "señada" | "cancelada"`, el tipo `EstadoVisual = "pendiente_seña" | "señada" | "utilizada" | "cancelada"`, y la interfaz `Reserva` completa con los campos `id: string`, `quintaId: string`, `clienteId: string`, `fecha: string` (ISO `"YYYY-MM-DD"`), `cantidadPersonas: number`, `horasExtra: number`, `precioTotal: number`, `señaMonto: number`, `señaPagada: boolean`, `estado: EstadoPersistido`, `creadoEn: Timestamp`, `actualizadoEn: Timestamp`, según `data-model.md`
- [ ] T005 [P] Implementar `calcularPrecioReserva(quinta, cantidadPersonas, horasExtra, fecha)` en `src/utils/calcularPrecioReserva.ts` como función pura que aplica la fórmula de `data-model.md`: `precioBase = esFinDeSemana(fecha) ? quinta.precioFinde : quinta.precioSemana`; `personasExtra = max(0, cantidadPersonas - quinta.capacidadBase)`; `precioTotal = precioBase + (personasExtra × quinta.costoPersonaExtra) + (horasExtra × quinta.costoHoraExtra)`; `señaMonto = precioTotal × (quinta.porcentajeSeña / 100)`. Incluir la función auxiliar `esFinDeSemana(fecha)` (sábado o domingo)
- [ ] T006 [P] Implementar `getEstadoVisual(reserva: { estado: EstadoPersistido; fecha: string })` en `src/utils/getEstadoVisual.ts` como función pura: si `reserva.estado === "cancelada"` devuelve `"cancelada"` (prioridad visual); si no y `reserva.fecha < hoyISO()` devuelve `"utilizada"` (independientemente de si el estado persistido es `"pendiente_seña"` o `"señada"`); en cualquier otro caso devuelve `reserva.estado` tal cual
- [ ] T007 Implementar `useReservas()` en `src/hooks/useReservas.ts`: se suscribe vía `onSnapshot` a toda la colección `reservas` sin filtro, expone `{ reservas: Reserva[], cargando: boolean, error: Error | null }`
- [ ] T008 Implementar la función de escritura `crearReserva(datos)` en un archivo de servicio (ej. `src/services/reservas.ts`, junto a `editarReserva`, `marcarSeñaPagada`, `cancelarReserva` de fases posteriores): recibe `{ quintaId, clienteId, fecha, cantidadPersonas, horasExtra }`, usa `calcularPrecioReserva` con la quinta vigente (vía `useQuintas()`/lectura directa), valida que no exista otra reserva **activa** (`estado != "cancelada"`) para la misma `quintaId` + `fecha` (FR-012), y de no haber conflicto crea el documento en Firestore con `estado: "pendiente_seña"`, `señaPagada: false`, `creadoEn: serverTimestamp()`, `actualizadoEn: serverTimestamp()`

**Checkpoint**: tipos, cálculo de precio, derivación de estado visual, lectura y creación base listos — las user stories pueden empezar.

---

## Phase 3: User Story 1 - Cargar una reserva con cálculo automático de precio (Priority: P1) 🎯 MVP

**Goal**: Permitir al administrador cargar una reserva completando quinta, cliente, fecha y cantidad de personas, viendo el precio total y la seña sugerida calculados automáticamente antes de confirmar.

**Independent Test**: Iniciar una carga desde el botón "+" o desde un día del calendario, completar los datos requeridos, y verificar que el resumen muestra un precio total correcto según la configuración vigente de la quinta elegida (quickstart.md, Escenario 1).

### Implementation for User Story 1

- [ ] T009 [US1] Implementar `BotonFlotanteNuevaReserva` en `src/components/reservas/BotonFlotanteNuevaReserva.tsx` (+ `.css`): FAB visible en la pantalla de Calendario que abre `FormularioReserva` en modo `"crear"` al tocarlo (FR-001)
- [ ] T010 [US1] Implementar en `FormularioReserva` (`src/components/reservas/FormularioReserva.tsx`, + `.css`) el modo `"crear"`: campos para quinta (selector desde `useQuintas()`), cliente (embebiendo `BuscadorClientes` del módulo Clientes), fecha (con soporte para recibir una fecha precargada como prop, FR-002), cantidad de personas y horas extra (FR-003)
- [ ] T011 [US1] Agregar en `FormularioReserva` el resumen en vivo de precio: invocar `calcularPrecioReserva` con cada cambio de quinta/fecha/cantidadPersonas/horasExtra y mostrar `precioTotal` y `señaMonto` calculados antes de confirmar (FR-004, FR-005)
- [ ] T012 [US1] Conectar el botón de confirmar de `FormularioReserva` (modo `"crear"`) a `crearReserva` (T008); mostrar el mensaje de error si la validación de unicidad quinta+fecha rechaza la carga (Edge Case: quinta ya reservada ese día)
- [ ] T013 [US1] Implementar `ListaProximosAlquileres` en `src/components/reservas/ListaProximosAlquileres.tsx` (+ `.css`): consume `useReservas()`, filtra en memoria por `fecha >= hoy` y `estado != "cancelada"`, ordena por fecha ascendente

**Checkpoint**: User Story 1 completamente funcional — se puede cargar una reserva de punta a punta con cálculo automático de precio, de forma independiente del resto de las historias.

---

## Phase 4: User Story 2 - Marcar la seña como pagada (Priority: P1)

**Goal**: Permitir marcar manualmente que la seña de una reserva fue pagada, cambiando su estado de "Pendiente de seña" a "Señada".

**Independent Test**: Con una reserva en estado "Pendiente de seña", marcarla como señada y verificar que el estado cambia (quickstart.md, Escenario 5).

### Implementation for User Story 2

- [ ] T014 [US2] Implementar `DetalleReserva` en `src/components/reservas/DetalleReserva.tsx` (+ `.css`): muestra los datos de una reserva (quinta, cliente, fecha, cantidad de personas, horas extra, `precioTotal`, `señaMonto`, `señaPagada`, estado visual vía `getEstadoVisual`)
- [ ] T015 [US2] Implementar la función `marcarSeñaPagada(reservaId)` en el servicio de reservas: actualiza `señaPagada: true` y `estado: "señada"`; MUST rechazar (no ejecutar la escritura) si `getEstadoVisual(reserva) === "utilizada"` o si `reserva.estado === "cancelada"` (FR-010, FR-013)
- [ ] T016 [US2] Agregar en `DetalleReserva` el control para marcar la seña como pagada, visible solo si `getEstadoVisual(reserva) === "pendiente_seña"`, conectado a `marcarSeñaPagada` (T015)

**Checkpoint**: User Stories 1 y 2 funcionan juntas de forma independiente — cargar y cobrar una reserva sin necesitar edición ni cancelación.

---

## Phase 5: User Story 3 - Editar una reserva existente (Priority: P2)

**Goal**: Permitir editar cualquier dato de una reserva (quinta, cliente, fecha, cantidad de personas, horas extra) mientras no esté "Utilizada", recalculando precio y seña con la configuración vigente de la quinta en el momento de guardar.

**Independent Test**: Abrir una reserva en estado "Pendiente de seña" o "Señada", modificar un campo (ej. cantidad de personas), guardar, y verificar que el cambio persiste y el precio se recalculó (quickstart.md, Escenarios 3 y 4).

### Implementation for User Story 3

- [ ] T017 [US3] Agregar a `FormularioReserva` (`src/components/reservas/FormularioReserva.tsx`) el modo `"editar"`: recibe una `Reserva` existente como prop opcional, precarga todos los campos (quinta, cliente, fecha, cantidad de personas, horas extra) con sus valores actuales
- [ ] T018 [US3] Implementar la función `editarReserva(reservaId, datos)` en el servicio de reservas: recalcula `precioTotal`/`señaMonto` con `calcularPrecioReserva` usando la quinta vigente al momento de guardar (FR-015), valida unicidad quinta+fecha contra otras reservas **activas** excluyendo la reserva propia que se edita (Edge Case: editar a una combinación en conflicto), actualiza los campos provistos más `actualizadoEn: serverTimestamp()`; MUST rechazar si `getEstadoVisual(reserva) === "utilizada"` o si `reserva.estado === "cancelada"` (FR-013)
- [ ] T019 [US3] Conectar el botón de guardar de `FormularioReserva` (modo `"editar"`) a `editarReserva` (T018); mostrar mensaje de error si la validación de conflicto de quinta+fecha rechaza el guardado
- [ ] T020 [US3] Agregar en `DetalleReserva` el botón "Editar", visible solo si `getEstadoVisual(reserva) !== "utilizada"` y `reserva.estado !== "cancelada"`, que abre `FormularioReserva` en modo `"editar"` con esa reserva precargada (FR-013, FR-014)

**Checkpoint**: User Story 3 funciona de forma independiente — se puede editar y reprogramar una reserva no utilizada, con el precio recalculado correctamente, sin afectar la funcionalidad de US1/US2.

---

## Phase 6: User Story 4 - Cancelar una reserva (Priority: P2)

**Goal**: Permitir cancelar una reserva en estado "Pendiente de seña" o "Señada", liberando la fecha de esa quinta en el calendario sin borrar el registro histórico.

**Independent Test**: Cancelar una reserva no utilizada y verificar que el día vuelve a mostrarse libre en el calendario, mientras la reserva sigue apareciendo en el historial del cliente (quickstart.md, Escenario 6).

### Implementation for User Story 4

- [ ] T021 [US4] Implementar la función `cancelarReserva(reservaId)` en el servicio de reservas: actualiza `estado: "cancelada"` y `actualizadoEn: serverTimestamp()`, sin borrar el documento (FR-016, FR-019); MUST rechazar si `getEstadoVisual(reserva) === "utilizada"` o si `reserva.estado === "cancelada"` (no se cancela dos veces, FR-017)
- [ ] T022 [US4] Agregar en `DetalleReserva` el botón "Cancelar reserva", habilitado solo si `getEstadoVisual(reserva) === "pendiente_seña"` o `"señada"` (es decir, no "utilizada" ni ya "cancelada"), con confirmación antes de ejecutar, conectado a `cancelarReserva` (T021)
- [ ] T023 [US4] Ajustar `useReservasDelMes(mes, año)` en `src/hooks/useReservasDelMes.ts` para agregar el filtro `where("estado", "!=", "cancelada")` a la query de Firestore (FR-018), de forma que una reserva cancelada libere el día en el calendario (consumido por el módulo Agenda)
- [ ] T024 [US4] Verificar (o ajustar si ya existe) que `useReservasPorCliente(clienteId)` (propiedad del módulo Clientes, consumida aquí) **NO** incluya el filtro de cancelación, de forma que el historial del cliente siga mostrando reservas canceladas con su estado visible (FR-019)

**Checkpoint**: User Story 4 funciona de forma independiente — cancelar libera el calendario sin perder trazabilidad en el historial del cliente, sin afectar US1/US2/US3.

---

## Phase 7: User Story 5 - Transición automática a "Utilizada" (Priority: P2)

**Goal**: Mostrar automáticamente como "Utilizada" una reserva cuya fecha ya pasó, sin requerir acción manual ni persistir el cambio.

**Independent Test**: Con una reserva cuya fecha es anterior a la fecha actual, verificar que se muestra como "Utilizada" sin ninguna acción manual (quickstart.md, Escenario 8).

### Implementation for User Story 5

- [ ] T025 [US5] Verificar que todos los puntos de la UI que muestran el estado de una reserva (`DetalleReserva`, `ListaProximosAlquileres`) usen `getEstadoVisual(reserva)` (T006) para decidir qué mostrar, en vez de leer `reserva.estado` directamente, de forma que una reserva "pendiente_seña" o "señada" con fecha vencida se muestre como "Utilizada" sin ninguna escritura en Firestore (FR-009)

**Checkpoint**: Las 5 user stories funcionan de forma independiente y en conjunto — módulo Reservas completo.

---

## Phase 7b: User Story 6 - Revertir una seña marcada como pagada por error (Priority: P3)

**Goal**: Permitir marcar o desmarcar "seña pagada" desde el modo edición, y mostrar el monto restante en el detalle.

**Independent Test**: Editar una reserva "Señada", desmarcar "seña pagada", guardar, y verificar que vuelve a "Pendiente de seña" (quickstart.md).

### Implementation for User Story 6

- [ ] T025a [US6] Ampliar `editarReserva` en el servicio de reservas para aceptar `señaPagada?: boolean` en `datos`; si está presente, actualizar también `estado` a `"señada"` o `"pendiente_seña"` según corresponda (FR-021)
- [ ] T025b [US6] Agregar en `FormularioReserva` (modo `"editar"`) un checkbox de "Seña pagada", precargado con `reserva.señaPagada`, conectado al nuevo parámetro de `editarReserva` (T025a)
- [ ] T025c [US6] Agregar en `DetalleReserva` el monto restante a pagar (`precioTotal - señaMonto`), junto al precio total y la seña (FR-020)

**Checkpoint**: User Story 6 funciona de forma independiente — se puede corregir una seña marcada por error y ver el monto restante.

---

## Phase 7c: Integración con Visitas en "Próximos alquileres" (agregado 2026-09-25, post-implementación)

**Goal**: Mostrar visitas futuras junto a reservas en `ListaProximosAlquileres`, con un toggle para ocultarlas (FR-022).

**Independent Test**: Con una reserva y una visita futuras cargadas, abrir "Próximos alquileres" y verificar que ambas aparecen ordenadas por fecha, la visita con la etiqueta "Visita"; togglear el control y verificar que la visita desaparece de la lista sin afectar las reservas mostradas.

### Implementation

- [ ] T025d Ajustar `ListaProximosAlquileres` (`src/components/reservas/ListaProximosAlquileres.tsx`) para combinar `useReservas()` (excluyendo canceladas y pasadas) con `useVisitasDelMes` del módulo Visitas (o un hook equivalente sin filtro de mes) para las visitas futuras, ordenando ambos conjuntos juntos por fecha (FR-022)
- [ ] T025e Agregar en `ListaProximosAlquileres` un toggle "Mostrar visitas" (activado por defecto) que oculta los items de tipo Visita sin afectar las reservas mostradas (FR-022)
- [ ] T025f Al tocar un item de tipo Visita en la lista, mostrar sus datos simples (quinta, fecha, nombre, teléfono si tiene) sin las acciones de `DetalleReserva` (editar/cancelar/seña), ya que Visita no tiene esas acciones

**Checkpoint**: "Próximos alquileres" muestra reservas y visitas combinadas, con la opción de ocultar visitas.

---

## Phase 7d: Monto real de seña al marcarla como pagada (corregido 2026-09-30)

**Goal**: Al crear una reserva, `señaMonto` sigue siendo el 30% sugerido (no editable ahí). Al marcar la seña como pagada, el administrador ingresa el monto real que pagó el cliente, que reemplaza `señaMonto`; además se puede revertir una seña marcada por error (FR-008, FR-008a, FR-021).

**Independent Test**: Crear una reserva (señaMonto = sugerido). Marcar "seña pagada" ingresando un monto distinto al sugerido (ej. la mitad); verificar que `señaMonto` pasa a ese valor y "Restante" se recalcula en consecuencia. Tocar "Revertir a pendiente de seña" y verificar que vuelve a "Pendiente de seña" sin perder el último monto cargado.

### Implementation

- [x] T025g ~~(revertido)~~ `crearReserva` vuelve a calcular `señaMonto` internamente (30% sugerido), sin recibirlo del formulario
- [x] T025h ~~(revertido)~~ `editarReserva` ya no acepta `señaMonto` ni `señaPagada` entre sus campos
- [x] T025i ~~(revertido)~~ `FormularioReserva` ya no tiene un campo editable de seña ni el checkbox de "seña pagada"; solo muestra la seña sugerida como texto informativo
- [ ] T025k Ajustar `marcarSeñaPagada(reservaId, montoPagado)` en el servicio de reservas para recibir el monto real pagado y persistirlo en `señaMonto` (reemplazando el valor existente), además de `señaPagada: true` y `estado: "señada"` (FR-008)
- [ ] T025l Implementar `revertirSeñaPagada(reservaId)` en el servicio de reservas: `señaPagada: false`, `estado: "pendiente_seña"`, sin tocar `señaMonto` (FR-008a)
- [ ] T025m Ajustar `DetalleReserva`: "Marcar seña como pagada" abre un input numérico (precargado con el `señaMonto` actual) en vez de ejecutar la acción directamente; al confirmar, invoca `marcarSeñaPagada` con ese monto. Agregar botón "Revertir a pendiente de seña", visible solo cuando el estado visual es "Señada", conectado a `revertirSeñaPagada`

**Checkpoint**: la seña sugerida es solo una referencia; el monto oficial se carga al marcarla como pagada, y se puede revertir sin perder el registro.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Validación final y ejecución de la guía de quickstart.

- [ ] T026 Ejecutar manualmente los 8 escenarios de `quickstart.md` de punta a punta y registrar el resultado en un checklist de verificación del módulo
- [ ] T027 [P] Revisar que ningún componente de este módulo use estilos inline (`style={{...}}`), consistente con el Principio VI de la constitución
- [ ] T028 [P] Revisar que no haya ningún uso de `any` en los archivos de este módulo (Principio IV: TypeScript estricto)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias, puede iniciar de inmediato
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA todas las user stories
- **User Stories (Phase 3-7)**: todas dependen de completar Foundational
  - US1 y US2 (P1) no dependen entre sí más allá de compartir `DetalleReserva`/`FormularioReserva` como archivos (ver nota de conflicto de archivo abajo)
  - US3 depende de que `FormularioReserva` ya exista en modo `"crear"` (T010, de US1) para agregarle el modo `"editar"`
  - US4 depende de que `DetalleReserva` ya exista (T014, de US2) para agregarle el botón de cancelar
  - US5 depende de `getEstadoVisual` (T006, Foundational) pero no de ninguna otra user story — es una verificación transversal
- **Polish (Phase 8)**: depende de que todas las user stories deseadas estén completas

### User Story Dependencies

- **US1 (P1)**: puede iniciar apenas termine Foundational; sin dependencia de otras historias
- **US2 (P1)**: puede iniciar apenas termine Foundational; comparte el archivo `DetalleReserva.tsx` con US4, pero la tarea T014 (creación del componente) es prerequisito compartido
- **US3 (P2)**: requiere que `FormularioReserva.tsx` ya tenga el modo `"crear"` (T010) para poder agregarle el modo `"editar"` sin reescribir el archivo desde cero
- **US4 (P2)**: requiere que `DetalleReserva.tsx` ya exista (T014) para agregarle el botón "Cancelar reserva"
- **US5 (P2)**: independiente de US3/US4, solo depende de la fase Foundational

### Within Each User Story

- Funciones de servicio (crear/editar/cancelar/marcar) antes de conectarlas a la UI
- Componente base antes de agregarle botones/modos adicionales

### Parallel Opportunities

- T002 y T003 (Setup) en paralelo
- T005 y T006 (Foundational: `calcularPrecioReserva` y `getEstadoVisual`, archivos distintos) en paralelo
- T027 y T028 (Polish) en paralelo
- US1 y US2 pueden trabajarse en paralelo por distintos desarrolladores una vez completada Foundational, coordinando la creación inicial de `DetalleReserva.tsx` (T014) para evitar conflicto de archivo

---

## Parallel Example: Foundational Phase

```bash
# Lanzar en paralelo las dos funciones puras de utils:
Task: "Implementar calcularPrecioReserva en src/utils/calcularPrecioReserva.ts"
Task: "Implementar getEstadoVisual en src/utils/getEstadoVisual.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 y 2 - ambas P1)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (bloqueante)
3. Completar Phase 3: User Story 1 (cargar reserva con cálculo automático)
4. Completar Phase 4: User Story 2 (marcar seña pagada)
5. **DETENER y VALIDAR**: ejecutar Escenarios 1, 2, 5 de quickstart.md
6. Este es el MVP funcional: cargar y cobrar reservas

### Incremental Delivery

1. Setup + Foundational → base lista
2. US1 → probar independientemente → demo (cálculo automático de precio funcionando)
3. US2 → probar independientemente → demo (control de señas)
4. US3 → probar independientemente → demo (edición con recálculo)
5. US4 → probar independientemente → demo (cancelación sin perder historial)
6. US5 → probar independientemente → demo (estado "Utilizada" automático)
7. Cada historia agrega valor sin romper las anteriores

---

## Notes

- [P] = archivos distintos, sin dependencias entre sí
- Confirmado explícitamente por el usuario: alta (T009-T013), edición (T017-T020) y cancelación (T021-T022) quedan como tareas separadas y verificables, NO agrupadas en una tarea genérica de "CRUD de reservas"
- El ajuste del filtro en `useReservasDelMes` para excluir `"cancelada"` es su propia tarea explícita (T023), distinta de la implementación de la cancelación en sí (T021)
- Sin tareas de test automatizado: se valida contra `quickstart.md` (Estrategia de Pruebas de la constitución)
- Evitar: tareas vagas, dos tareas escribiendo el mismo archivo en paralelo, dependencias cruzadas entre historias que rompan su independencia
