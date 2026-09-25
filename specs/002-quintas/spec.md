# Feature Specification: Quintas

**Feature Branch**: `002-quintas`

**Created**: 2026-09-25

**Status**: Draft

**Input**: User description: "Módulo: Quintas. Como administrador de Quinta Serrano, quiero configurar los datos y precios de cada una de mis dos quintas, para que el sistema pueda calcular automáticamente el costo de una reserva sin que yo tenga que hacer cuentas a mano."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver la lista de quintas configuradas (Priority: P1)

Como administrador, entro a la pantalla de Configuración y quiero ver la lista de
las quintas existentes, para elegir cuál quiero editar.

**Why this priority**: Es el punto de entrada al módulo; sin esta vista no se
puede acceder a la edición de ninguna quinta.

**Independent Test**: Se puede probar de forma aislada entrando a Configuración
y verificando que se listan Quinta Serrano 1 y Quinta Serrano 2 con sus datos
principales visibles.

**Acceptance Scenarios**:

1. **Given** el administrador está en la pantalla de Configuración, **When** la
   pantalla carga, **Then** ve listadas las dos quintas existentes (Quinta
   Serrano 1 y Quinta Serrano 2) identificadas por su nombre.

---

### User Story 2 - Editar los datos y precios de una quinta (Priority: P1)

Como administrador, quiero entrar al detalle de una quinta y editar cualquiera
de sus valores configurables (capacidad, precios, horario, costos extra), para
que el sistema calcule reservas con datos actualizados.

**Why this priority**: Es el propósito central del módulo; permite mantener
actualizada la información que usará el módulo de Reservas para calcular
costos.

**Independent Test**: Se puede probar de forma aislada entrando a una quinta,
modificando un valor (por ejemplo el precio de fin de semana), guardando, y
verificando que el nuevo valor persiste al volver a entrar a esa quinta.

**Acceptance Scenarios**:

1. **Given** el administrador entró al detalle de una quinta, **When** ve la
   pantalla de edición, **Then** puede ver y modificar: nombre, capacidad base,
   precio base día de semana, precio base fin de semana, costo por persona
   extra, horario estándar (hora de inicio y hora de fin), y costo por hora
   extra.
2. **Given** el administrador modificó uno o más valores de una quinta, **When**
   confirma guardar, **Then** los cambios se persisten y quedan disponibles de
   inmediato para el cálculo de nuevas reservas.
3. **Given** el administrador modificó el precio de una quinta que ya tiene
   reservas existentes cargadas con el precio anterior, **When** guarda el
   cambio, **Then** el sistema permite el cambio sin restricciones ni
   advertencias bloqueantes (las reservas existentes son responsabilidad del
   módulo Reservas, no de este módulo).

---

### Edge Cases

- ¿Qué pasa si el administrador intenta guardar un valor numérico negativo o no
  numérico en un campo de precio, capacidad, u hora? El sistema debe rechazar
  el guardado y mostrar un mensaje de validación, sin persistir el cambio.
- ¿Qué pasa si el administrador ingresa una hora de fin anterior o igual a la
  hora de inicio en el horario estándar? El sistema debe rechazar el guardado
  y mostrar un mensaje de validación.
- ¿Qué pasa si el costo por persona extra o el costo por hora extra se dejan en
  blanco o en cero? El sistema debe permitirlo, ya que estos valores todavía no
  tienen un monto definido por el negocio y no deben bloquear el uso del resto
  del módulo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST listar todas las quintas existentes en la
  pantalla de Configuración, mostrando al menos su nombre.
- **FR-002**: El sistema MUST permitir acceder al detalle de edición de una
  quinta desde la lista.
- **FR-003**: El sistema MUST permitir editar, por cada quinta, los siguientes
  campos: nombre, capacidad base, precio base día de semana, precio base fin
  de semana, costo por persona extra, hora de inicio del horario estándar,
  hora de fin del horario estándar, costo por hora extra, y porcentaje de
  seña.
- **FR-004**: El sistema MUST validar que capacidad base, precios y costos
  sean valores numéricos no negativos antes de guardar.
- **FR-004a**: El sistema MUST validar que el porcentaje de seña sea un valor
  numérico entre 0 y 100 antes de guardar.
- **FR-005**: El sistema MUST validar que la hora de fin del horario estándar
  sea posterior a la hora de inicio antes de guardar.
- **FR-006**: El sistema MUST persistir los cambios guardados y ponerlos
  disponibles de inmediato para cualquier cálculo posterior de reservas.
- **FR-007**: El sistema MUST permitir modificar el precio de una quinta sin
  restricciones, independientemente de si existen reservas ya cargadas con el
  precio anterior (la inmutabilidad del precio histórico de una reserva es
  responsabilidad del módulo Reservas).
- **FR-008**: El sistema MUST modelar los datos de cada quinta de forma que
  admita agregar quintas adicionales en el futuro por código, sin rediseño del
  modelo de datos, aunque la interfaz de usuario de este módulo no ofrezca
  alta ni baja de quintas.
- **FR-009**: El sistema MUST permitir que costo por persona extra y costo por
  hora extra queden en cero o sin definir, dado que sus montos finales están
  pendientes de decisión de negocio.
- **FR-010**: El sistema MUST inicializar los datos con los siguientes valores
  semilla: Quinta Serrano 1 (capacidad base 50, precio día de semana $300.000,
  precio fin de semana $350.000, horario 10:00 a 19:00) y Quinta Serrano 2
  (capacidad base 40, precio día de semana $250.000, precio fin de semana
  $300.000, horario 10:00 a 19:00), ambas con costo por persona extra y costo
  por hora extra en cero, y con porcentaje de seña en 30%.

### Key Entities

- **Quinta**: Representa una propiedad administrada dentro del sistema.
  Atributos: nombre, capacidad base, precio base día de semana, precio base
  fin de semana, costo por persona extra, hora de inicio del horario estándar,
  hora de fin del horario estándar, costo por hora extra, porcentaje de seña.
  En el estado inicial del sistema existen exactamente dos instancias (Quinta
  Serrano 1 y Quinta Serrano 2), pero el modelo no limita la cantidad a
  futuro.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El administrador puede ver los datos completos de cualquiera de
  las dos quintas en menos de 5 segundos desde que entra a Configuración.
- **SC-002**: El administrador puede editar y guardar un cambio en los datos de
  una quinta en menos de 1 minuto.
- **SC-003**: El 100% de los cambios guardados en una quinta están disponibles
  para el cálculo de nuevas reservas inmediatamente después de guardar, sin
  pasos adicionales de sincronización manual.
- **SC-004**: El 100% de los intentos de guardar un valor inválido (numérico
  negativo, no numérico, u horario inconsistente) son rechazados con un
  mensaje de validación claro, sin persistir el cambio.

## Assumptions

- "Configuración" es una pantalla o sección ya prevista dentro de la
  navegación general de la app; este módulo especifica su contenido para el
  caso de uso de Quintas, no la estructura general de navegación.
- Los montos exactos de costo por persona extra y costo por hora extra no
  están definidos por el negocio al momento de esta especificación; se tratan
  como campos configurables con valor inicial en cero, editables luego sin
  restricciones adicionales, consistente con lo indicado por el usuario.
- El porcentaje de seña es configurable de forma independiente por cada
  quinta (no un valor global), con 30% como valor semilla para ambas quintas,
  confirmado vía /speckit-clarify. El módulo Reservas usa este porcentaje
  sobre el precio total calculado para sugerir el monto de seña.
- La moneda de los precios es pesos argentinos (ARS), inferido del formato
  "$300.000" usado en el input; no se especifica soporte multi-moneda y se
  asume que está fuera de alcance.
- No existe un historial de cambios de precio visible en este módulo; solo se
  mantiene el valor vigente. El versionado de precios en reservas ya
  existentes es responsabilidad exclusiva del módulo Reservas, según lo
  indicado explícitamente por el usuario.
- Alta y baja de quintas desde la UI está fuera de alcance de este módulo, tal
  como lo indica el input; el modelo de datos debe permitirlo a nivel de
  código sin comprometerse a una interfaz para ello en este módulo.
