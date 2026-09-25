# Feature Specification: Agenda (Calendario)

**Feature Branch**: `006-agenda-calendario`

**Created**: 2026-09-25

**Status**: Draft

**Input**: User description: "Módulo: Agenda (Calendario). Como administrador de Quinta Serrano, quiero ver de un vistazo qué días están ocupados por cada quinta y qué días hay visitas programadas, para organizarme rápido desde el celular sin tener que revisar reserva por reserva."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver el calendario del mes con ocupación marcada (Priority: P1)

Como administrador, al abrir la app quiero ver directamente el calendario del
mes actual, con cada día marcado según qué quinta tiene reservada y si hay una
visita programada, para organizarme de un vistazo.

**Why this priority**: Es el propósito central del módulo y la primera pantalla
que ve el administrador después de ingresar a la app; sin esto no hay vista
consolidada de la agenda.

**Independent Test**: Se puede probar de forma aislada (con datos de reservas y
visitas ya cargados) abriendo la app después del login y verificando que el
calendario del mes actual muestra los días marcados con el color
correspondiente a cada quinta ocupada o a una visita.

**Acceptance Scenarios**:

1. **Given** el administrador completó el ingreso por el módulo Acceso, **When**
   la app termina de cargar, **Then** ve directamente el calendario del mes
   actual con todos sus días.
2. **Given** un día tiene una reserva para Quinta Serrano 1, **When** el
   administrador ve el calendario, **Then** ese día está marcado con el color
   asignado a Quinta Serrano 1.
3. **Given** un día tiene una reserva para Quinta Serrano 2, **When** el
   administrador ve el calendario, **Then** ese día está marcado con el color
   asignado a Quinta Serrano 2.
4. **Given** un día tiene una visita programada, **When** el administrador ve
   el calendario, **Then** ese día está marcado con el color asignado a
   visitas.
5. **Given** un día tiene reservas simultáneas para Quinta Serrano 1 y Quinta
   Serrano 2, **When** el administrador ve el calendario, **Then** ese día
   muestra una marca doble (un indicador por quinta), visualmente distinguible
   de un día con una sola quinta ocupada.

---

### User Story 2 - Navegar entre meses con swipe (Priority: P2)

Como administrador, quiero deslizar el dedo hacia la izquierda o la derecha
para moverme entre meses, sin usar botones de flecha, para navegar rápido
desde el celular.

**Why this priority**: Mejora la usabilidad de la navegación mensual, pero el
módulo ya entrega valor mostrando el mes actual (User Story 1) sin este
gesto.

**Independent Test**: Se puede probar de forma aislada deslizando el dedo
sobre el calendario y verificando que cambia al mes anterior o siguiente según
la dirección del gesto.

**Acceptance Scenarios**:

1. **Given** el administrador está viendo el calendario de un mes, **When**
   desliza el dedo hacia la izquierda, **Then** el calendario avanza al mes
   siguiente.
2. **Given** el administrador está viendo el calendario de un mes, **When**
   desliza el dedo hacia la derecha, **Then** el calendario retrocede al mes
   anterior.

---

### User Story 3 - Abrir el detalle o la carga desde un día (Priority: P1)

Como administrador, quiero tocar un día del calendario para ver el detalle de
lo que hay cargado ese día, o para iniciar una carga nueva si no hay nada,
para acceder rápido a la información o a la acción que necesito.

**Why this priority**: Es el mecanismo principal de interacción entre la vista
de calendario y los módulos de Reservas y Visitas; sin esto el calendario es
solo informativo.

**Independent Test**: Se puede probar de forma aislada tocando un día sin
datos y verificando que se abre el formulario de alta con la fecha
precargada, y tocando un día con datos y verificando que se abre el detalle
correspondiente.

**Acceptance Scenarios**:

1. **Given** un día del calendario no tiene ninguna reserva ni visita cargada,
   **When** el administrador lo toca, **Then** se abre el formulario de alta
   de reserva o visita con esa fecha precargada.
2. **Given** un día del calendario tiene una reserva y/o una visita cargada,
   **When** el administrador lo toca, **Then** ve el detalle de lo que hay
   registrado ese día (reserva y/o visita).
3. **Given** el administrador está viendo el detalle de un día con una reserva,
   **When** accede a la opción de editar el estado de la seña, **Then** puede
   marcarla como pagada sin salir del flujo de detalle del día.

---

### Edge Cases

- ¿Qué pasa si un día tiene una visita y además una o ambas quintas
  reservadas? El día debe mostrar tanto la marca de visita como la marca de
  cada quinta ocupada, de forma simultánea y distinguible.
- ¿Qué pasa si el administrador toca un día del mes anterior o siguiente que
  se muestra parcialmente en los bordes de la grilla mensual? El
  comportamiento debe ser el mismo que tocar cualquier otro día: abrir detalle
  o alta según corresponda para esa fecha.
- ¿Qué pasa si el administrador desliza rápidamente varias veces seguidas? El
  calendario debe avanzar o retroceder un mes por cada gesto de swipe
  reconocido, sin perder la sincronía entre el gesto y el mes mostrado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST mostrar, como pantalla inicial tras un ingreso
  exitoso por el módulo Acceso, el calendario del mes actual con todos sus
  días.
- **FR-002**: El sistema MUST marcar cada día del calendario con un color
  distinto según corresponda a: Quinta Serrano 1 ocupada, Quinta Serrano 2
  ocupada, o visita programada.
- **FR-003**: El sistema MUST mostrar una marca doble (un indicador
  independiente por quinta) en cualquier día donde ambas quintas tengan una
  reserva simultánea, de forma visualmente distinguible de un día con una sola
  quinta ocupada.
- **FR-004**: El sistema MUST permitir navegar al mes anterior o siguiente
  mediante un gesto de deslizamiento horizontal (swipe), sin depender de
  botones de flecha.
- **FR-005**: El sistema MUST, al tocar un día sin ninguna reserva ni visita
  registrada, abrir el formulario de alta de reserva o visita con esa fecha
  precargada.
- **FR-006**: El sistema MUST, al tocar un día con al menos una reserva o
  visita registrada, mostrar el detalle de lo registrado ese día.
- **FR-007**: El sistema MUST permitir, desde el detalle de un día con una
  reserva, editar el estado de la seña (marcarla como pagada) sin salir de ese
  flujo de detalle.
- **FR-008**: El sistema MUST NOT ofrecer, dentro de este módulo, una vista
  semanal o diaria del calendario; únicamente vista mensual.
- **FR-009**: El sistema MUST NOT depender de datos propios: toda la
  información mostrada en el calendario proviene de los módulos Reservas y
  Visitas.

### Key Entities

Este módulo no introduce entidades propias. Consume y combina datos de las
entidades **Reserva** (módulo Reservas) y **Visita** (módulo Visitas) para
representarlos visualmente en una vista de calendario mensual.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El administrador puede identificar, con un solo vistazo al
  calendario del mes, qué días tienen cada quinta ocupada y qué días tienen
  una visita programada, sin abrir el detalle de ningún día.
- **SC-002**: El administrador puede cambiar de mes usando únicamente gestos de
  deslizamiento, sin necesidad de tocar ningún botón de navegación.
- **SC-003**: El administrador puede acceder al detalle de cualquier día con
  datos cargados, o al formulario de alta de un día vacío, en un solo toque
  desde el calendario.
- **SC-004**: El 100% de los días con reservas simultáneas de ambas quintas
  muestran una marca doble distinguible de un día con una sola quinta
  ocupada.

## Assumptions

- El módulo Acceso ya resuelve el ingreso a la app y redirige a esta vista de
  calendario tras una autenticación exitosa, tal como está definido en la
  especificación del módulo Acceso; este módulo no repite esa lógica.
- La asignación específica de colores (qué color corresponde a Quinta Serrano
  1, cuál a Quinta Serrano 2, y cuál a visita) es una decisión de diseño
  visual que se resuelve en la fase de planificación/implementación; esta
  especificación solo requiere que sean tres colores distintos y
  consistentes.
- La exportación del calendario como imagen, mencionada como funcionalidad de
  una versión anterior, queda fuera de alcance de esta especificación y se
  evaluará como una mejora futura independiente.
- El detalle de un día con reserva y/o visita puede mostrar información de
  ambas si coexisten (por ejemplo, una visita y una reserva de otra quinta el
  mismo día); este módulo asume que el detalle combina toda la información
  disponible para esa fecha, delegando el contenido específico de cada tipo de
  registro a los módulos Reservas y Visitas.
