# Research: Reservas

**Feature**: 004-reservas | **Date**: 2026-09-25 (revisado)

Este research reemplaza la versión anterior tras la clarificación que agregó
edición y cancelación de reservas. Todo el enfoque técnico vino especificado
explícitamente por el usuario, sin marcadores `NEEDS CLARIFICATION`.

## Decisión: Recálculo de precio/seña en cada creación Y edición (no solo al crear)

**Decision**: `precioTotal` y `señaMonto` se recalculan cada vez que se
escribe el documento (creación o edición), usando la configuración vigente
de la quinta en ese momento exacto. Entre escrituras, los valores
permanecen fijos (no cambian solo porque la quinta cambie de precio).

**Rationale**: Es lo que especificó el usuario explícitamente en esta
revisión, y es coherente con la User Story 3 del spec (edición): si el
administrador corrige la cantidad de personas o la fecha de una reserva, el
precio debe reflejar esa corrección, no quedar congelado con el valor
original incorrecto. Sigue respetando FR-006 del spec (inmutabilidad frente
a cambios de la quinta que no involucran editar la reserva misma).

**Alternatives considered**: Mantener el precio original inmutable incluso
al editar, y solo permitir editar campos que no afectan el precio —
descartado explícitamente por el usuario ("Al guardar cambios, se recalculan
precioTotal y señaMonto").

## Decisión: Estado "Cancelada" como tercer valor persistido, sin borrado

**Decision**: El campo `estado` admite `"pendiente_seña"`, `"señada"`,
`"cancelada"`. Cancelar es una actualización de ese campo (más
`actualizadoEn`), nunca un `deleteDoc`.

**Rationale**: FR-019 del spec exige explícitamente conservar la reserva en
Firestore y en el historial del cliente tras cancelarla; borrar el
documento perdería esa trazabilidad. Consistente con Principio II: un campo
de estado adicional es más simple que mantener una colección separada de
"reservas canceladas" o un soft-delete con flag booleano aparte (ya existe
`estado`, se reutiliza).

**Alternatives considered**: Colección separada `reservas_canceladas` —
descartada por complejidad innecesaria (Principio II) y porque el propio
usuario especificó "el documento nunca se borra", implicando que sigue
viviendo en `reservas`.

## Decisión: Filtro de cancelación en `useReservasDelMes`, no en `useReservasPorCliente`

**Decision**: `useReservasDelMes(mes, año)` agrega
`where("estado", "!=", "cancelada")` a su query. `useReservasPorCliente(clienteId)`
NO agrega ese filtro: devuelve todas las reservas del cliente,
incluyendo canceladas.

**Rationale**: Especificado explícitamente por el usuario. Tiene sentido de
negocio: el calendario debe reflejar disponibilidad real (una cancelada
libera el día), mientras que el historial de un cliente debe ser completo
para responder "cuántas veces intentó alquilar", incluyendo intentos que no
se concretaron.

**Alternatives considered**: Aplicar el mismo filtro en ambos hooks por
consistencia — descartado explícitamente por el usuario, quien diferenció
el comportamiento a propósito.

**Nota de coherencia con `003-clientes`**: el conteo de "cantidad de
reservas" en el módulo Clientes (FR-009 de ese spec) ya se definió como
"solo estado Utilizada" (derivado, no `"cancelada"` ni ningún otro valor
persistido), por lo que una reserva cancelada no suma al conteo aunque sí
aparezca en el historial completo. Esto ya es coherente sin cambios
adicionales en Clientes.

**Nota de coherencia con `006-agenda-calendario`**: el research.md de ese
módulo ya anticipó esta exclusión ("useReservasDelMes MUST excluir las
reservas en estado Cancelada"); este plan la concreta con el filtro
`where("estado", "!=", "cancelada")`. Sin cambios adicionales pendientes en
Agenda.

## Decisión: `where("estado", "!=", "cancelada")` vs. `where("estado", "in", [...])`

**Decision**: Se usa el operador `!=` de Firestore sobre el campo `estado`.

**Rationale**: Firestore soporta `!=` de forma nativa desde hace tiempo;
es más simple y más resistente a cambios futuros (si se agregara un cuarto
valor persistido, `!=` lo seguiría excluyendo correctamente sin tocar la
query) que enumerar `in: ["pendiente_seña", "señada"]`.

**Alternatives considered**: `where("estado", "in", ["pendiente_seña", "señada"])` —
funcionalmente equivalente hoy, pero más frágil ante un futuro cuarto
estado persistido; se prefiere `!=` por robustez (Principio II: menos
mantenimiento futuro).

## Decisión: `ListaProximosAlquileres` incluye Visitas, con toggle para ocultarlas (agregado 2026-09-25, post-implementación)

**Decision**: `ListaProximosAlquileres` (pantalla "Próximos alquileres")
combina reservas activas futuras (`useReservas()`, excluyendo canceladas) y
visitas futuras (`useVisitasDelMes` del módulo Visitas, o un hook análogo
sin filtro de mes), ordenadas juntas por fecha. Cada visita se muestra con
el mismo formato de item que una reserva (fecha, quinta, nombre), pero con
la etiqueta "Visita" en lugar de un estado de seña. Un toggle visible en la
pantalla permite ocultar las visitas y ver solo reservas; por defecto las
visitas se muestran.

**Rationale**: Pedido explícito del usuario tras probar el módulo Visitas:
quiere ver de un vistazo todo lo próximo (alquileres y visitas) sin tener
que cruzar dos pantallas, pero sin perder la opción de filtrar solo
reservas si lo prefiere en un momento dado.

**Impacto en Visitas (`005-visitas`)**: este es el primer consumidor de
datos de Visitas fuera del propio módulo Agenda; no cambia el modelo de
datos de Visita ni agrega campos, solo agrega un nuevo lugar de lectura.

**Alternatives considered**: Pantallas separadas ("Próximos alquileres" y
"Próximas visitas") — descartado explícitamente por el usuario, que pidió
verlas juntas por defecto.

## Resumen

No quedan unknowns pendientes. Este research reemplaza la versión previa;
las decisiones de la versión anterior que siguen vigentes sin cambios
(snapshot al crear si no hay edición posterior, unicidad quinta/fecha
verificada en el cliente, `getEstadoVisual` basado en fecha vencida
independiente del estado persistido) no se repiten aquí — ver
`data-model.md` para el detalle consolidado y actualizado.
