# Feature Specification: Clientes

**Feature Branch**: `003-clientes`

**Created**: 2026-09-25

**Status**: Draft

**Input**: User description: "Módulo: Clientes. Como administrador de Quinta Serrano, quiero tener un registro histórico de las personas que alquilan o visitan mis quintas, para saber si ya alquilaron antes y cuántas veces."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver listado de clientes (Priority: P1)

Como administrador, entro a la pestaña Clientes y quiero ver todos los clientes
registrados con su nombre, teléfono y cantidad de reservas, para tener una
vista general de quiénes ya alquilaron.

**Why this priority**: Es el punto de entrada al módulo; sin esta vista no hay
forma de acceder al historial de ningún cliente.

**Independent Test**: Se puede probar de forma aislada entrando a la pestaña
Clientes con datos ya cargados y verificando que la lista muestra nombre,
teléfono y cantidad de reservas de cada cliente.

**Acceptance Scenarios**:

1. **Given** existen clientes registrados, **When** el administrador entra a la
   pestaña Clientes, **Then** ve una lista con el nombre, teléfono y cantidad
   de reservas realizadas de cada cliente.
2. **Given** no existe ningún cliente registrado todavía, **When** el
   administrador entra a la pestaña Clientes, **Then** ve un estado vacío que
   indica que todavía no hay clientes cargados.

---

### User Story 2 - Ver el detalle e historial de un cliente (Priority: P1)

Como administrador, quiero tocar un cliente en la lista y ver todas sus
reservas pasadas (fecha, quinta, estado), para saber si ya alquiló antes y
cuántas veces.

**Why this priority**: Es el propósito central del módulo: dar visibilidad al
historial de un cliente específico.

**Independent Test**: Se puede probar de forma aislada tocando un cliente con
reservas cargadas y verificando que se listan todas sus reservas con fecha,
quinta y estado.

**Acceptance Scenarios**:

1. **Given** el administrador está en la lista de Clientes, **When** toca un
   cliente, **Then** ve el detalle de ese cliente con la lista completa de sus
   reservas pasadas, cada una con fecha, quinta y estado.

---

### User Story 3 - Buscar un cliente (Priority: P2)

Como administrador, quiero buscar un cliente por nombre o por teléfono, para
encontrarlo rápido sin recorrer toda la lista.

**Why this priority**: Mejora la usabilidad de la lista a medida que crece el
historial, pero el módulo es funcional sin este flujo (se puede recorrer la
lista manualmente).

**Independent Test**: Se puede probar de forma aislada escribiendo parte de un
nombre o teléfono en el buscador y verificando que la lista se filtra
correctamente.

**Acceptance Scenarios**:

1. **Given** el administrador está en la lista de Clientes, **When** escribe
   parte de un nombre en el buscador, **Then** la lista se filtra mostrando
   solo los clientes cuyo nombre contiene ese texto.
2. **Given** el administrador está en la lista de Clientes, **When** escribe
   parte de un teléfono en el buscador, **Then** la lista se filtra mostrando
   solo los clientes cuyo teléfono contiene ese texto.

---

### User Story 4 - Elegir o crear cliente al cargar una reserva (Priority: P1)

Como administrador, al cargar una reserva quiero buscar si el cliente ya existe
por nombre o teléfono y elegirlo de una lista, o crear uno nuevo si no
aparece, para no duplicar clientes ni depender de que el sistema adivine si es
la misma persona.

**Why this priority**: Es la única vía de alta de clientes en esta versión; sin
esto no se puede construir el historial que el módulo existe para mostrar.

**Independent Test**: Se puede probar de forma aislada (con un stub de carga de
reserva) escribiendo un nombre o teléfono en el buscador del formulario de
reserva, verificando que se listan coincidencias existentes, y verificando que
al no haber coincidencias se ofrece la opción de crear un cliente nuevo.

**Acceptance Scenarios**:

1. **Given** el administrador está cargando una reserva y escribe parte de un
   nombre o teléfono en el buscador de cliente, **When** existen clientes cuyo
   nombre o teléfono coincide parcialmente, **Then** el sistema muestra una
   lista de coincidencias para que el administrador elija una.
2. **Given** el administrador eligió un cliente existente de la lista de
   coincidencias, **When** confirma la reserva, **Then** la reserva se asocia a
   ese cliente, reutilizando su nombre y teléfono ya guardados.
3. **Given** el administrador escribió un nombre o teléfono que no coincide con
   ningún cliente existente, **When** confirma la carga, **Then** el sistema
   ofrece crear un cliente nuevo con los datos ingresados y lo asocia a la
   reserva.
4. **Given** el administrador tiene la opción de elegir un cliente existente o
   crear uno nuevo, **When** decide cuál de las dos opciones tomar, **Then** esa
   decisión queda a su criterio; el sistema no elige por él ni crea el cliente
   automáticamente.
5. **Given** el administrador está creando un cliente nuevo y el teléfono que
   ingresó coincide exactamente con el de un cliente ya existente, **When**
   confirma la creación, **Then** el sistema NO crea un cliente nuevo (el
   teléfono es único) y en su lugar le ofrece dos opciones: usar el cliente
   existente tal cual está, o renombrarlo al nombre recién ingresado y usar
   ese mismo cliente (actualizando su `nombre`).

---

### User Story 5 - Corregir los datos de un cliente ya cargado (Priority: P2)

Como administrador, quiero poder editar el nombre y/o teléfono de un cliente
ya creado desde su detalle, para corregir un error de carga (ej. cargué un
número de documento en vez del teléfono) sin tener que recrear el historial
de reservas asociado.

**Why this priority**: Es una corrección de datos, no el flujo principal del
módulo; el módulo es funcional sin esto (los datos se cargan una sola vez
desde el buscador), pero un error de tipeo sin forma de corregirlo dejaría
datos incorrectos de forma permanente.

**Independent Test**: Se puede probar de forma aislada entrando al detalle de
un cliente existente, editando su nombre o teléfono, guardando, y verificando
que el cambio persiste y que el historial de reservas asociado no se ve
afectado.

**Acceptance Scenarios**:

1. **Given** el administrador está en el detalle de un cliente, **When** edita
   su nombre y/o teléfono y guarda, **Then** el cambio persiste y se refleja
   de inmediato en la lista de Clientes y en cualquier lugar donde se muestre
   ese cliente.
2. **Given** el administrador edita un cliente que tiene reservas asociadas,
   **When** guarda el cambio, **Then** el historial de reservas de ese cliente
   permanece intacto (la edición no crea ni elimina reservas).
3. **Given** el administrador intenta guardar el nombre o el teléfono vacíos,
   **When** confirma, **Then** el sistema rechaza el guardado y muestra un
   mensaje de validación, sin persistir el cambio.

---

### Edge Cases

- ¿Qué pasa si el buscador de clientes (en la lista de Clientes o en el
  formulario de carga de una reserva) no encuentra coincidencias? El sistema
  debe mostrar un estado vacío indicando que no se encontraron clientes para
  ese criterio de búsqueda, y en el contexto de carga de una reserva, ofrecer
  la opción de crear un cliente nuevo.
- ¿Qué pasa si el teléfono ingresado para crear un cliente nuevo coincide
  exactamente con el de un cliente ya existente? El sistema impone unicidad
  de teléfono entre clientes (FR-008a): no crea un segundo documento con ese
  teléfono. En su lugar ofrece usar el cliente existente tal cual está, o
  renombrarlo al nombre recién ingresado y usar ese mismo cliente.
- ¿Qué pasa si el administrador elige por error un cliente existente que no
  corresponde a la persona real de la reserva? Corregir esa asociación queda
  fuera de alcance de este módulo.
- ¿Qué pasa si el administrador cargó mal el nombre o el teléfono de un
  cliente (ej. un documento en vez de un teléfono)? Puede corregirlo editando
  ese cliente desde su detalle (User Story 5), sin afectar su historial de
  reservas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST mostrar, en la pestaña Clientes, una lista de
  todos los clientes registrados con nombre, teléfono y cantidad de reservas
  en estado "Utilizada".
- **FR-002**: El sistema MUST permitir acceder al detalle de un cliente desde
  la lista.
- **FR-003**: El sistema MUST mostrar, en el detalle de un cliente, todas sus
  reservas pasadas, cada una con fecha, quinta y estado.
- **FR-004**: El sistema MUST permitir buscar clientes filtrando la lista por
  coincidencia parcial de nombre o de teléfono.
- **FR-005**: El sistema MUST ofrecer, dentro del flujo de carga de una
  reserva, un buscador de clientes por nombre o teléfono que muestre
  coincidencias existentes como opciones seleccionables.
- **FR-006**: El sistema MUST, cuando el administrador elige un cliente
  existente de las coincidencias, asociar la reserva a ese cliente reutilizando
  su nombre y teléfono ya guardados, sin permitir editarlos desde ese flujo.
- **FR-006a**: El sistema MUST, cuando no hay coincidencias o el administrador
  decide no usar ninguna, permitir crear un cliente nuevo con el nombre y
  teléfono ingresados y asociarlo a la reserva.
- **FR-007**: El sistema MUST NOT ofrecer una pantalla dedicada para crear o
  eliminar un cliente de forma manual fuera del flujo de carga de una reserva
  (alta manual y eliminación de clientes están fuera de alcance de este
  módulo). El sistema MUST permitir editar el nombre y/o teléfono de un
  cliente ya creado desde su detalle (User Story 5), sin afectar su historial
  de reservas asociado.
- **FR-008**: El sistema MUST NOT decidir ni crear automáticamente una
  asociación entre una reserva y un cliente existente; esa decisión la toma
  siempre el administrador a partir de los resultados de búsqueda o del aviso
  de coincidencia de teléfono (FR-008a).
- **FR-008a**: El sistema MUST tratar el teléfono como único entre clientes:
  si al crear un cliente nuevo el teléfono ingresado coincide exactamente con
  el de un cliente ya existente, el sistema MUST NOT crear un segundo
  documento con ese teléfono. En su lugar, MUST ofrecer dos opciones: (a)
  usar el cliente existente tal cual está, o (b) actualizar el `nombre` de
  ese cliente existente al valor recién ingresado y usar ese mismo cliente.
- **FR-009**: El sistema MUST contar, como "cantidad de reservas" de un
  cliente, únicamente las reservas asociadas que se encuentran en estado
  "Utilizada".
- **FR-010**: El sistema MUST validar, antes de guardar una edición de
  cliente, que el nombre no quede vacío; si lo está, MUST rechazar el
  guardado y mostrar un mensaje de validación.
- **FR-011**: El sistema MUST validar, tanto al crear un cliente (desde
  `BuscadorClientes`) como al editarlo, que el teléfono tenga exactamente 10
  dígitos numéricos (sin espacios, guiones ni código de país, ej.
  `"1122223333"`); si no cumple el formato, MUST rechazar el guardado y
  mostrar un mensaje de validación.

### Key Entities

- **Cliente**: Representa a una persona que alquiló alguna quinta. Atributos:
  nombre, teléfono, historial de reservas asociadas (relación con la entidad
  Reserva del módulo Reservas). Se crea únicamente a partir de la primera
  reserva cargada a su nombre (no a partir de visitas; ver Assumptions).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El administrador puede ver la lista completa de clientes
  registrados en menos de 5 segundos desde que entra a la pestaña Clientes.
- **SC-002**: El administrador puede encontrar un cliente específico mediante
  la búsqueda por nombre o teléfono en menos de 10 segundos.
- **SC-003**: El administrador puede, al cargar una reserva, encontrar un
  cliente ya existente mediante el buscador y asociarlo sin volver a tipear su
  nombre o teléfono, en menos de 15 segundos.
- **SC-004**: El 100% de las reservas asociadas a un cliente existente elegido
  desde el buscador reutilizan el nombre y teléfono ya guardados, sin crear un
  duplicado.

## Assumptions

- La pestaña Clientes ya existe como parte de la navegación inferior general
  de la app; este módulo especifica su contenido, no la estructura de
  navegación.
- El campo "cantidad de reservas" mostrado en la lista cuenta únicamente las
  reservas en estado "Utilizada", según lo confirmado por el usuario (una
  reserva "Pendiente de seña" o "Señada" todavía no representa un alquiler
  concretado).
- La búsqueda por nombre y teléfono (tanto en la lista de Clientes como en el
  buscador del formulario de carga de una reserva) es insensible a
  mayúsculas/minúsculas y por coincidencia parcial (contiene), consistente con
  patrones estándar de búsqueda en listas.
- El módulo Reservas es responsable de embeber el buscador de clientes y de
  invocar la creación de un cliente nuevo cuando el administrador lo decide;
  este módulo expone esa capacidad (buscar, listar coincidencias, crear) pero
  no describe la pantalla completa de carga de una reserva.
- El módulo Visitas NO crea ni asocia registros de Cliente: el nombre y
  teléfono de quien visita se guardan únicamente en la entidad Visita, fuera
  del alcance de este módulo.
