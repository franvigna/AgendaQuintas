# Feature Specification: Reservas

**Feature Branch**: `004-reservas`

**Created**: 2026-09-25

**Status**: Draft

**Input**: User description: "Módulo: Reservas. Como administrador de Quinta Serrano, quiero cargar una reserva de forma rápida y que el sistema calcule solo el precio total y la seña, para no tener que hacer cuentas a mano ni perder el control de qué está pagado."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cargar una reserva con cálculo automático de precio (Priority: P1)

Como administrador, quiero cargar una reserva completando quinta, cliente,
fecha y cantidad de personas, y que el sistema calcule automáticamente el
precio total y la seña sugerida, para no tener que hacer cuentas a mano.

**Why this priority**: Es el propósito central del módulo y la razón principal
por la que existe: eliminar el cálculo manual de precios.

**Independent Test**: Se puede probar de forma aislada iniciando una carga
desde el botón "+" o desde un día del calendario, completando los datos
requeridos, y verificando que el resumen muestra un precio total correcto
según la configuración vigente de la quinta elegida.

**Acceptance Scenarios**:

1. **Given** el administrador toca el botón flotante "+" en la pantalla de
   Calendario, **When** se abre el formulario de carga, **Then** puede
   completar quinta, nombre del cliente, teléfono, fecha y cantidad de
   personas.
2. **Given** el administrador toca directamente un día del calendario, **When**
   se abre el formulario de carga, **Then** la fecha aparece precargada con el
   día seleccionado.
3. **Given** el administrador completó quinta, fecha y cantidad de personas,
   **When** el sistema calcula el precio, **Then** el resumen muestra el
   precio total (precio base según día de semana o fin de semana, más costo
   por persona extra si la cantidad supera la capacidad base de la quinta, más
   costo por hora extra si se cargaron horas extra) y el monto de seña
   sugerido.
4. **Given** el administrador confirma la carga con el resumen visible, **When**
   guarda la reserva, **Then** el sistema persiste el precio total calculado
   como un valor fijo asociado a esa reserva (snapshot), en estado "Pendiente
   de seña".
5. **Given** existe una reserva ya guardada con un precio calculado, **When** la
   configuración de precios de la quinta cambia posteriormente, **Then** el
   precio total de la reserva ya guardada no se recalcula ni se modifica.

---

### User Story 2 - Marcar la seña como pagada (Priority: P1)

Como administrador, quiero marcar manualmente que la seña de una reserva fue
pagada, para llevar control de qué reservas están confirmadas.

**Why this priority**: Es central para el segundo objetivo del módulo: no
perder el control de qué está pagado.

**Independent Test**: Se puede probar de forma aislada con una reserva en
estado "Pendiente de seña", marcando la seña como pagada, y verificando que el
estado cambia a "Señada".

**Acceptance Scenarios**:

1. **Given** una reserva está en estado "Pendiente de seña", **When** el
   administrador la marca manualmente como señada, **Then** el estado de la
   reserva cambia a "Señada".

---

### User Story 3 - Editar una reserva existente (Priority: P2)

Como administrador, quiero poder editar los datos de una reserva ya cargada
(fecha, cantidad de personas, quinta, horas extra, etc.) mientras no esté
"Utilizada", para corregir errores de carga o ajustar los datos si cambian
las condiciones del alquiler.

**Why this priority**: Mejora la flexibilidad operativa del módulo, pero no
es indispensable para el flujo mínimo de carga y cobro (User Stories 1 y 2).

**Independent Test**: Se puede probar de forma aislada abriendo una reserva
en estado "Pendiente de seña" o "Señada", modificando un campo (ej. cantidad
de personas), guardando, y verificando que el cambio persiste.

**Acceptance Scenarios**:

1. **Given** una reserva está en estado "Pendiente de seña" o "Señada",
   **When** el administrador edita cualquiera de sus datos (quinta, cliente,
   fecha, cantidad de personas, horas extra) y guarda, **Then** los cambios
   se persisten en esa reserva.
2. **Given** una reserva editada cambia datos que afectan el cálculo de
   precio (quinta, fecha, cantidad de personas, horas extra), **When** se
   guarda la edición, **Then** el sistema recalcula `precioTotal` y
   `señaMonto` con la configuración vigente de la quinta en ese momento
   (dejan de reflejar el snapshot original de la creación).
3. **Given** una reserva está en estado "Utilizada" (visual), **When** el
   administrador intenta editarla, **Then** el sistema impide la edición.

---

### User Story 4 - Cancelar una reserva (Priority: P2)

Como administrador, quiero poder cancelar una reserva en estado "Pendiente de
seña" o "Señada", para liberar la fecha de esa quinta en el calendario sin
perder el registro histórico de que existió.

**Why this priority**: Cubre el caso de que un alquiler acordado no se
concrete; no bloquea el flujo mínimo de carga y cobro.

**Independent Test**: Se puede probar de forma aislada cancelando una
reserva no utilizada y verificando que el día vuelve a mostrarse libre en el
calendario, mientras la reserva sigue apareciendo en el historial del
cliente.

**Acceptance Scenarios**:

1. **Given** una reserva está en estado "Pendiente de seña" o "Señada",
   **When** el administrador la cancela, **Then** su estado pasa a
   "Cancelada".
2. **Given** una reserva pasó a estado "Cancelada", **When** se consulta el
   calendario para esa quinta y fecha, **Then** el día se muestra libre
   (disponible para una nueva reserva).
3. **Given** una reserva pasó a estado "Cancelada", **When** se consulta el
   historial del cliente asociado, **Then** esa reserva sigue apareciendo en
   el historial, marcada como "Cancelada".
4. **Given** una reserva está en estado "Utilizada" (visual), **When** el
   administrador intenta cancelarla, **Then** el sistema impide la
   cancelación.

---

### User Story 5 - Transición automática a "Utilizada" (Priority: P2)

Como administrador, quiero que el sistema marque automáticamente como
"Utilizada" una reserva cuya fecha ya pasó, para no tener que actualizar
manualmente el estado de reservas viejas.

**Why this priority**: Mejora la exactitud del estado histórico sin
intervención manual, pero el módulo puede operar (con estados desactualizados)
sin este comportamiento automático mientras se construyen las historias P1.

**Independent Test**: Se puede probar de forma aislada con una reserva cuya
fecha es anterior a la fecha actual y verificando que su estado pasa a
"Utilizada" sin acción manual.

**Acceptance Scenarios**:

1. **Given** una reserva tiene una fecha anterior a la fecha actual y su
   estado es "Pendiente de seña" o "Señada", **When** el sistema evalúa su
   estado, **Then** lo cambia automáticamente a "Utilizada".

---

### User Story 6 - Revertir una seña marcada como pagada por error (Priority: P3)

Como administrador, quiero poder revertir a "Pendiente de seña" una reserva
que marqué como "Señada" por error, para corregir el error sin tener que
cancelar y recrear la reserva.

**Why this priority**: Corrección de un error de operación, no el flujo
principal; el módulo ya es funcional sin esto (US1+US2), pero un error de
tipeo sin forma de corregirlo deja el estado incorrecto de forma permanente.

**Independent Test**: Se puede probar de forma aislada abriendo el modo
edición de una reserva en estado "Señada", desmarcando "seña pagada", y
verificando que el estado vuelve a "Pendiente de seña".

**Acceptance Scenarios**:

1. **Given** una reserva está en estado "Señada", **When** el administrador
   abre el modo edición y desmarca "seña pagada", **Then** al guardar el
   estado de la reserva vuelve a "Pendiente de seña".
2. **Given** una reserva está en estado "Pendiente de seña", **When** el
   administrador abre el modo edición y marca "seña pagada", **Then** al
   guardar el estado de la reserva pasa a "Señada" (equivalente a la acción
   de US2, pero disponible también desde edición).

---

### Edge Cases

- ¿Qué pasa si el administrador intenta cargar una reserva para una quinta que
  ya tiene otra reserva activa (no cancelada) cargada en la misma fecha? El
  sistema debe impedir la carga y mostrar un mensaje indicando que la quinta
  ya está reservada ese día (ver Assumptions sobre esta regla).
- ¿Qué pasa si el administrador intenta cargar una reserva para una quinta y
  fecha que ya tuvo una reserva cancelada? El sistema lo permite: una
  reserva "Cancelada" no cuenta como ocupación para la validación de
  unicidad quinta/fecha.
- ¿Qué pasa si el administrador carga una cantidad de personas menor a la
  capacidad base de la quinta? El sistema calcula el precio total usando
  únicamente el precio base correspondiente, sin sumar costo por persona
  extra.
- ¿Qué pasa si el administrador no carga horas extra? El sistema calcula el
  precio total sin sumar costo por hora extra.
- ¿Qué pasa si el administrador intenta marcar como "Señada" una reserva que ya
  está en estado "Utilizada"? El sistema debe impedir el cambio de estado
  manual sobre una reserva ya utilizada.
- ¿Qué pasa si el administrador no encuentra al cliente en el buscador dentro
  del formulario de carga? El sistema ofrece crear un cliente nuevo con el
  nombre y teléfono ingresados, según el comportamiento definido por el
  módulo Clientes.
- ¿Qué pasa si el administrador edita una reserva y cambia la quinta o la
  fecha a una combinación que ya tiene otra reserva activa? El sistema debe
  impedir el guardado de esa edición, con el mismo mensaje que al cargar una
  reserva nueva en conflicto.
- ¿Qué pasa si el administrador intenta editar o cancelar una reserva ya
  "Utilizada"? El sistema impide ambas acciones (ver User Stories 3 y 4).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir iniciar la carga de una reserva desde un
  botón flotante "+" visible en la pantalla de Calendario.
- **FR-002**: El sistema MUST permitir iniciar la carga de una reserva tocando
  directamente un día del calendario, precargando esa fecha en el formulario.
- **FR-003**: El sistema MUST requerir, para guardar una reserva, al menos:
  quinta, un cliente asociado (elegido mediante el buscador de clientes o
  creado nuevo con nombre y teléfono), fecha y cantidad de personas.
- **FR-004**: El sistema MUST calcular el precio total de la reserva usando la
  configuración vigente de la quinta elegida al momento de la carga: precio
  base según corresponda a día de semana o fin de semana, más costo por
  persona extra por cada persona que supere la capacidad base, más costo por
  hora extra por cada hora cargada por encima del horario estándar.
- **FR-005**: El sistema MUST mostrar al administrador, antes de confirmar la
  carga, un resumen con el precio total calculado y el monto de seña
  sugerido, calculado como el porcentaje de seña configurado para la quinta
  elegida (ver módulo Quintas) aplicado sobre el precio total.
- **FR-006**: El sistema MUST persistir el precio total calculado como un valor
  fijo (snapshot) asociado a la reserva al momento de guardarla, de forma que
  cambios posteriores en la configuración de precios de la quinta no alteren
  reservas ya guardadas.
- **FR-006a** (agregado 2026-09-25): El sistema MUST permitir al
  administrador editar manualmente el monto de seña (`señaMonto`) antes de
  confirmar la carga o una edición, sobreescribiendo el monto sugerido
  (FR-005) con el monto real efectivamente acordado o pagado, que puede ser
  menor, igual o mayor al sugerido. El sistema MUST NOT exigir que
  `señaMonto` coincida con el porcentaje de seña configurado para la quinta.
- **FR-007**: El sistema MUST asignar el estado "Pendiente de seña" a toda
  reserva nueva al momento de crearla.
- **FR-008**: El sistema MUST permitir marcar manualmente una reserva en
  estado "Pendiente de seña" como "Señada".
- **FR-009**: El sistema MUST cambiar automáticamente el estado de una reserva
  a "Utilizada" cuando su fecha ya pasó, sin requerir acción manual. Esta
  evaluación se realiza al vuelo (en el cliente/UI, comparando la fecha actual
  contra la fecha de la reserva) cada vez que se muestra la reserva, sin
  persistir el cambio de estado en la base de datos ni requerir un proceso
  programado en el backend.
- **FR-010**: El sistema MUST impedir cambios manuales de estado sobre una
  reserva que ya se encuentra en estado "Utilizada".
- **FR-011**: El sistema MUST asociar cada reserva a un cliente elegido por el
  administrador mediante el buscador de clientes del módulo Clientes (por
  nombre o teléfono), o a un cliente nuevo creado en el momento si no hay
  coincidencias; el sistema no determina automáticamente si es un cliente
  existente o nuevo.
- **FR-012**: El sistema MUST impedir cargar más de una reserva **activa**
  (no cancelada) para la misma quinta en la misma fecha, permitiendo en
  cambio reservas de quintas distintas en la misma fecha. Una reserva en
  estado "Cancelada" no cuenta para esta validación.
- **FR-013**: El sistema MUST NOT ofrecer, dentro de este módulo, funciones de
  edición, cancelación, o eliminación sobre una reserva en estado
  "Utilizada", ni cobro o pago online.
- **FR-014**: El sistema MUST permitir editar cualquier dato de una reserva
  (quinta, cliente, fecha, cantidad de personas, horas extra) mientras su
  estado visual no sea "Utilizada", incluyendo reprogramarla a otra fecha.
- **FR-015**: El sistema MUST recalcular `precioTotal` y `señaMonto` al
  guardar una edición que modifique quinta, fecha, cantidad de personas u
  horas extra, usando la configuración vigente de la quinta en el momento de
  guardar la edición (el snapshot deja de reflejar el momento de creación
  original y pasa a reflejar el momento de la última edición).
- **FR-016**: El sistema MUST permitir cancelar una reserva en estado
  "Pendiente de seña" o "Señada", cambiando su estado a "Cancelada".
- **FR-017**: El sistema MUST NOT permitir cancelar una reserva en estado
  visual "Utilizada".
- **FR-018**: El sistema MUST excluir las reservas en estado "Cancelada" de
  cualquier consulta que determine la ocupación de una quinta en el
  calendario (el día vuelve a mostrarse libre), y de la validación de
  unicidad quinta/fecha (FR-012).
- **FR-019**: El sistema MUST conservar una reserva "Cancelada" en Firestore
  y seguir mostrándola en el historial de reservas del cliente asociado
  (módulo Clientes), marcada con estado "Cancelada".
- **FR-020**: El sistema MUST mostrar, en el detalle de una reserva, el monto
  restante a pagar (`precioTotal - señaMonto`), además del precio total y el
  monto de seña.
- **FR-021**: El sistema MUST permitir, desde el modo edición de una reserva
  no "Utilizada" ni "Cancelada", cambiar manualmente el indicador de seña
  pagada en cualquier sentido (marcar o desmarcar), ajustando el `estado`
  entre "Pendiente de seña" y "Señada" en consecuencia al guardar.
- **FR-022**: El sistema MUST mostrar, en la pantalla "Próximos alquileres",
  tanto las reservas activas futuras como las visitas futuras (módulo
  Visitas) ordenadas juntas por fecha, cada visita distinguida con la
  etiqueta "Visita" en lugar de un estado de seña. El sistema MUST ofrecer
  un control para ocultar las visitas de esa lista, mostrándolas por
  defecto.
- **FR-023** (agregado 2026-09-25): El sistema MUST permitir editar
  `señaMonto` desde el modo edición de una reserva no "Utilizada" ni
  "Cancelada" (FR-006a), sin recalcularlo automáticamente cuando la edición
  solo modifica otros campos (quinta, fecha, cantidad de personas, horas
  extra) — `señaMonto` solo cambia si el administrador lo edita
  explícitamente.

### Key Entities

- **Reserva**: Representa el alquiler de una quinta por parte de un cliente en
  una fecha determinada. Atributos: quinta asociada, cliente asociado
  (referencia a la entidad Cliente del módulo Clientes), fecha, cantidad de
  personas, horas extra utilizadas (si aplica), precio total (snapshot,
  recalculado en cada edición hasta que la reserva queda "Utilizada"), monto
  de seña sugerido, indicador de seña pagada, estado ("Pendiente de seña",
  "Señada", "Cancelada", "Utilizada" — este último calculado, no persistido).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El administrador puede completar la carga de una reserva, desde
  que toca "+" o un día del calendario hasta guardarla, en menos de 2 minutos.
- **SC-002**: El 100% de las reservas guardadas muestran un precio total
  calculado automáticamente, sin que el administrador realice cálculos
  manuales.
- **SC-003**: El 100% de las reservas guardadas conservan su precio original
  aun después de cambios posteriores en la configuración de precios de la
  quinta correspondiente.
- **SC-004**: El 100% de las reservas cuya fecha ya pasó muestran estado
  "Utilizada" sin intervención manual del administrador.
- **SC-005**: El administrador puede identificar, para cualquier reserva, si la
  seña fue pagada o no, en menos de 5 segundos de consultar su estado.
- **SC-006**: El 100% de las reservas canceladas liberan de inmediato la
  fecha de su quinta en el calendario, sin intervención manual adicional.
- **SC-007**: El 100% de las reservas canceladas permanecen visibles en el
  historial del cliente asociado, marcadas como "Cancelada".

## Assumptions

- Se asume que sábado y domingo son considerados "fin de semana", y el resto
  de los días (incluido viernes) son considerados "día de semana", para
  determinar qué precio base de la quinta aplica. Esta asunción está marcada
  por el usuario como no bloqueante y sujeta a confirmación posterior; puede
  ajustarse sin impacto estructural en el modelo de datos.
- Se asume que no se puede cargar más de una reserva para la misma quinta en
  la misma fecha, pero sí reservas de quintas distintas en la misma fecha
  (reflejado en FR-012). Esta asunción está marcada por el usuario como no
  bloqueante y sujeta a confirmación posterior.
- Se asume que no existe un tope máximo de personas más allá de la capacidad
  base de la quinta: el costo por persona extra se sigue sumando sin límite
  superior. Esta asunción está marcada por el usuario como no bloqueante y
  sujeta a confirmación posterior.
- El monto de seña sugerido se calcula aplicando el porcentaje de seña
  configurado por quinta (módulo Quintas, valor semilla 30%) sobre el precio
  total, confirmado vía /speckit-clarify. El monto sugerido es editable por el
  administrador antes de guardar.
- La transición automática a "Utilizada" (FR-009) se evalúa al vuelo en el
  cliente/UI, comparando la fecha actual contra la fecha de la reserva cada
  vez que se muestra, sin persistir el cambio en la base de datos ni requerir
  un proceso programado en el backend, confirmado vía /speckit-clarify. Como
  consecuencia, el estado "Utilizada" que ve cada usuario se deriva en el
  momento de la consulta y no depende de que otro dispositivo haya "marcado"
  la reserva.
- Este módulo depende de los módulos Quintas (para la configuración de precios
  y porcentaje de seña vigentes) y Clientes (que provee el buscador de
  clientes usado en el flujo de carga), tal como lo indica el input.
