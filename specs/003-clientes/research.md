# Research: Clientes

**Feature**: 003-clientes | **Date**: 2026-09-25

Todo el enfoque técnico vino especificado explícitamente por el usuario
(modelo de datos, cálculo de conteo vía query, búsqueda client-side), sin
marcadores `NEEDS CLARIFICATION` en el Technical Context. Se resolvió además
una discrepancia entre el input de este plan y el spec vigente (ver nota en
plan.md). Esta investigación confirma decisiones concretas dentro de ese
enfoque.

## Decisión: Conteo de reservas calculado vía query, no como campo propio

**Decision**: `useReservasPorCliente(clienteId)` suscribe a
`query(collection(db, "reservas"), where("clienteId", "==", clienteId))` vía
`onSnapshot`, y el conteo de "cantidad de reservas" (FR-009: solo estado
"Utilizada") se deriva filtrando ese resultado en el cliente, sin persistir
un contador en el documento de Cliente.

**Rationale**: Evita el problema clásico de contadores desincronizados
(Firestore no ofrece transacciones automáticas cross-documento sin código
adicional); consistente con el Principio II (Simplicidad) para el volumen de
datos esperado (bajo). El costo es una lectura de query en vez de leer un
campo, aceptable dado el volumen (decenas/cientos de reservas por cliente
como mucho).

**Alternatives considered**: Mantener un campo `cantidadReservas` en el
documento de Cliente, actualizado por un Cloud Function o por el cliente al
crear/actualizar una reserva — descartado explícitamente por el usuario
("evita mantener un contador desincronizado"); además requeriría lógica
adicional (functions o transacciones) que no se justifica para este volumen
(Principio II).

**Nota de implementación (detectada al planificar `004-reservas`)**: el
campo `estado` persistido en la colección `reservas` solo admite
`"pendiente_seña"` o `"señada"`; el valor `"utilizada"` nunca se escribe en
Firestore, se deriva en el cliente con `getEstadoVisual(reserva)` (definida
en el módulo Reservas). El filtro "en el cliente" mencionado arriba debe
aplicar esa función, no comparar `estado` directamente contra el string
`"utilizada"`. Ver `004-reservas/research.md` para el detalle completo.

## Decisión: Búsqueda client-side sobre la lista ya sincronizada

**Decision**: `BuscadorClientes` filtra el array ya obtenido por
`useClientes()` (que trae toda la colección vía `onSnapshot`) usando
coincidencia parcial insensible a mayúsculas sobre `nombre` y `telefono`, sin
queries adicionales a Firestore por cada tecleo.

**Rationale**: Firestore no soporta nativamente búsqueda de texto parcial
("contains") de forma eficiente sin un servicio externo (Algolia,
Elasticsearch, etc.); para el volumen esperado (bajo, según el propio input
del usuario) filtrar en memoria sobre la lista ya sincronizada es más simple
y no requiere infraestructura adicional (Principio II). Es también más
responsive: no hay round-trip de red por cada carácter tipeado.

**Alternatives considered**: Servicio de búsqueda dedicado (Algolia) —
explícitamente descartado por el usuario ("no hace falta un servicio de
búsqueda dedicado"). Queries de Firestore con `where(">=")/where("<=")` para
prefix-matching — descartado porque no soporta coincidencia "contiene" (solo
prefijo) y el usuario ya especificó filtro client-side.

## Decisión: Sin validación de unicidad de teléfono

**Decision**: El campo `telefono` no lleva ninguna restricción de unicidad,
ni a nivel de reglas de Firestore ni de validación en la aplicación. Crear un
cliente nuevo con un teléfono ya existente en otro documento es una operación
válida y permitida.

**Rationale**: FR-008 del spec (clarificado previamente vía
`/speckit-clarify`) establece explícitamente que el sistema no aplica ninguna
lógica automática de coincidencia; la decisión de reutilizar o crear un
cliente la toma siempre el administrador a partir de las coincidencias que
le muestra el buscador. Se confirmó con el usuario, ante la discrepancia
detectada con el input de este plan, mantener este comportamiento.

**Alternatives considered**: Validar unicidad de teléfono antes de crear
(rechazar si ya existe) — era la propuesta original del input de este plan;
descartada tras confirmar con el usuario que se mantiene el spec vigente
(FR-008), evitando revertir una clarificación ya cerrada.

## Resumen

No quedan unknowns pendientes. La única discrepancia detectada
(unicidad de teléfono) se resolvió manteniendo el spec vigente, según
confirmación explícita del usuario.
