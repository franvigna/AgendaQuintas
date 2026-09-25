# Feature Specification: Visitas

**Feature Branch**: `005-visitas`

**Created**: 2026-09-25

**Status**: Draft

**Input**: User description: "Módulo: Visitas. Como administrador de Quinta Serrano, quiero registrar los días en que alguien va a visitar una quinta antes de decidir alquilarla, para no perder el control de la agenda y evitar superponer una visita con otra actividad."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar una visita (Priority: P1)

Como administrador, quiero registrar una visita a una quinta indicando quinta,
fecha, nombre de quien visita y teléfono opcional, para no perder el control
de la agenda.

**Why this priority**: Es el propósito central del módulo; sin esto no hay
forma de dejar constancia de una visita programada.

**Independent Test**: Se puede probar de forma aislada iniciando la carga
desde el botón "+" eligiendo tipo "Visita", completando los datos, y
verificando que la visita queda registrada.

**Acceptance Scenarios**:

1. **Given** el administrador toca el botón flotante "+" en la pantalla de
   Calendario, **When** elige el tipo "Visita" en vez de "Reserva", **Then** se
   abre un formulario para completar quinta, fecha, nombre de quien visita y
   teléfono (opcional).
2. **Given** el administrador toca directamente un día del calendario y elige
   la opción "Visita", **When** se abre el formulario, **Then** la fecha
   aparece precargada con el día seleccionado.
3. **Given** el administrador completó quinta, fecha y nombre de quien visita
   (con o sin teléfono), **When** confirma la carga, **Then** la visita queda
   registrada y asociada a la quinta y fecha indicadas.

---

### User Story 2 - Ver visitas en el calendario (Priority: P1)

Como administrador, quiero ver las visitas registradas en el calendario con un
color distinto al de las reservas, para distinguir de un vistazo qué días
tienen una visita y cuáles una reserva confirmada.

**Why this priority**: Es lo que le da valor práctico al registro de visitas:
poder verlas junto con las reservas para evitar superposiciones al planificar
la agenda.

**Independent Test**: Se puede probar de forma aislada con una visita ya
registrada, abriendo el calendario, y verificando que se muestra en el día
correspondiente con un color distinto al de una reserva.

**Acceptance Scenarios**:

1. **Given** existe una visita registrada para una fecha determinada, **When**
   el administrador consulta el calendario, **Then** ve esa visita marcada en
   el día correspondiente con un color visualmente distinto al de una reserva.

---

### Edge Cases

- ¿Qué pasa si se intenta cargar una visita para una quinta y fecha que ya
  tiene una reserva registrada (o viceversa)? El sistema lo permite sin
  restricción: una visita y una reserva coexisten libremente para la misma
  quinta y fecha, sin ninguna validación cruzada entre los módulos Visitas y
  Reservas.
- ¿Qué pasa si se intenta cargar más de una visita para la misma quinta el
  mismo día? No se especifica una restricción de unicidad para visitas (a
  diferencia de reservas); se permite más de una visita por quinta por día, ya
  que una visita no reserva la quinta en firme.
- ¿Qué pasa si el administrador no completa el teléfono de quien visita? El
  sistema debe permitir guardar la visita igualmente, ya que el teléfono es
  opcional.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir iniciar la carga de una visita desde el
  mismo botón flotante "+" utilizado para reservas, ofreciendo una opción para
  elegir el tipo "Visita".
- **FR-002**: El sistema MUST permitir iniciar la carga de una visita tocando
  directamente un día del calendario y eligiendo la opción "Visita",
  precargando esa fecha en el formulario.
- **FR-003**: El sistema MUST requerir, para guardar una visita, al menos:
  quinta, fecha y nombre de quien visita.
- **FR-004**: El sistema MUST permitir completar el teléfono de quien visita
  como campo opcional.
- **FR-005**: El sistema MUST mostrar las visitas registradas en el calendario
  (módulo Agenda) con un color visualmente distinto al utilizado para las
  reservas.
- **FR-006**: El sistema MUST NOT ofrecer, dentro de este módulo, conversión
  automática de una visita en reserva, ni recordatorios o notificaciones sobre
  visitas próximas.
- **FR-007**: El sistema MUST permitir que una visita y una reserva coexistan
  para la misma quinta y la misma fecha, sin aplicar ninguna validación
  cruzada ni restricción entre ambas.
- **FR-008**: El sistema MUST NOT crear ni asociar un registro de Cliente al
  registrar una visita; el nombre y teléfono de quien visita se guardan
  únicamente en la entidad Visita.

### Key Entities

- **Visita**: Representa la intención de conocer una quinta antes de decidir
  alquilarla. Atributos: quinta asociada, fecha, nombre de quien visita,
  teléfono (opcional).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El administrador puede registrar una visita completa en menos de
  1 minuto desde que toca "+" o un día del calendario.
- **SC-002**: El 100% de las visitas registradas se muestran en el calendario
  con un color distinguible del de las reservas.
- **SC-003**: El administrador puede identificar, con solo mirar el calendario,
  si un día tiene una visita, una reserva, ambas, o ninguna, sin necesidad de
  abrir el detalle de cada una.

## Assumptions

- La pantalla de Calendario (módulo Agenda) ya provee la estructura de
  navegación y el botón flotante "+"; este módulo especifica el flujo de carga
  de una visita y su representación visual, no la estructura general del
  calendario.
- Se asume que no existe restricción de unicidad para visitas: se permite
  registrar más de una visita para la misma quinta en la misma fecha, ya que
  una visita no compromete la disponibilidad de la quinta de forma firme (a
  diferencia de una reserva).
- Este módulo depende del módulo Quintas para la referencia a la quinta
  correspondiente, tal como lo indica el input. No depende del módulo
  Clientes: el nombre y teléfono de quien visita se registran directamente en
  la Visita, sin crear ni asociar un registro de Cliente (confirmado vía
  /speckit-clarify).
- La coexistencia sin restricción entre visitas y reservas para una misma
  quinta/fecha (FR-007) es una regla de negocio confirmada, no una asunción:
  el módulo Visitas y el módulo Reservas operan de forma completamente
  independiente entre sí en cuanto a validación de disponibilidad.
