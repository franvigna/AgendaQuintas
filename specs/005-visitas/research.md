# Research: Visitas

**Feature**: 005-visitas | **Date**: 2026-09-25

Todo el enfoque técnico vino especificado explícitamente por el usuario, sin
marcadores `NEEDS CLARIFICATION`. Esta investigación confirma decisiones
concretas dentro de ese enfoque.

## Decisión: Sin referencia a la colección `clientes`

**Decision**: El documento de `visitas` no tiene ningún campo `clienteId` ni
lógica que cree o busque un Cliente. `nombreVisitante` y
`telefonoVisitante` son campos de texto libres, propios de la Visita.

**Rationale**: Confirmado explícitamente en el spec de Visitas (FR-008,
clarificado previamente vía `/speckit-clarify`) y reafirmado en este input:
"visitar no implica que la persona vaya a alquilar". Desacoplar Visitas de
Clientes evita que el módulo Clientes se llene de registros de personas que
solo miraron una quinta sin intención de alquilar, manteniendo el propósito
original de Clientes (historial de quienes efectivamente alquilaron).

**Alternatives considered**: Crear un Cliente automáticamente también desde
una visita (como sí ocurre desde una Reserva) — era el comportamiento
original antes de la clarificación de `003-clientes`/`005-visitas`;
descartado y ya corregido en ambos specs.

## Decisión: Sin validación de conflicto con Reservas

**Decision**: `crearVisita()` no consulta la colección `reservas` en ningún
momento; se puede crear una visita para una quinta/fecha que ya tiene una
reserva activa, y viceversa.

**Rationale**: FR-007 del spec de Visitas (clarificado vía `/speckit-clarify`)
establece que ambos módulos operan de forma completamente independiente en
cuanto a validación de disponibilidad. Simplifica la implementación
(Principio II): no hay necesidad de leer la colección `reservas` desde este
módulo.

**Alternatives considered**: Mostrar una advertencia no bloqueante si ya
existe una reserva ese día — era una opción considerada durante la
clarificación original de Visitas, mencionada y descartada a favor de la
Opción A (coexistencia sin restricción, ni siquiera advertencia).

## Decisión: Selector de tipo integrado al FAB existente de Reservas

**Decision**: No se crea un segundo botón flotante para Visitas. Se
modifica `BotonFlotanteNuevaReserva` (de `004-reservas`) para que, al
tocarlo, presente primero un selector "Reserva" | "Visita", y según la
elección, abra `FormularioReserva` o `FormularioVisita`.

**Rationale**: Es lo que especifica el input del usuario, y evita una UI
mobile-first con dos FABs superpuestos compitiendo por el mismo espacio de
pantalla (Principio I y II). El mismo patrón aplica al tocar un día vacío
del calendario (módulo Agenda): el selector de tipo se presenta ahí
también.

**Alternatives considered**: FAB separado para Visitas — descartado
explícitamente por el usuario, que especifica reutilizar el mismo botón con
un selector de tipo.

## Nota de dependencia con `006-agenda-calendario`

**Observación**: El plan de Agenda ya asume la existencia de
`useVisitasDelMes(mes, año)` con esta firma exacta (ver
`006-agenda-calendario/contracts/calendario-interfaces.md`). Este plan la
concreta sin cambios respecto a lo ya anticipado: sin filtro adicional (una
visita no tiene estado ni se cancela), y el filtro por rango de fecha es
análogo al de `useReservasDelMes`.

## Nota de alcance: sin edición ni cancelación

**Decision**: Este plan no incluye ninguna función `editarVisita` ni
`cancelarVisita`/`eliminarVisita`. Una vez creada, una visita es inmutable
desde la UI.

**Rationale**: El spec vigente de `005-visitas` no define esas User
Stories (a diferencia de `004-reservas`, que sí las incorporó en su
clarificación más reciente). El propio usuario señaló explícitamente esta
asimetría como una decisión consciente, no un olvido, y indicó que
requeriría un `/speckit-clarify` propio antes de agregarla.

**Alternatives considered**: Agregar edición/cancelación por paridad
directa con Reservas sin pasar por clarificación — descartado: cambiaría
el alcance del spec sin que el usuario lo haya pedido explícitamente para
este módulo.

## Resumen

No quedan unknowns pendientes. Es el módulo más simple del proyecto: sin
estados, sin relaciones con Clientes o Reservas, sin edición/cancelación.
