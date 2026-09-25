# Feature Specification: Acceso

**Feature Branch**: `001-acceso`

**Created**: 2026-09-25

**Status**: Draft

**Input**: User description: "Módulo: Acceso. Como suegro, suegra o novia (los 3 administradores de Quinta Serrano), quiero ingresar a la app con una clave compartida, para que solo mi familia pueda ver y editar la información de las reservas."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ingresar con clave compartida (Priority: P1)

Como usuario de la familia (suegro, suegra o novia), abro la app y quiero ingresar
con una clave compartida para acceder a la información de reservas de las quintas.

**Why this priority**: Es la puerta de entrada a toda la aplicación; sin este flujo
ningún otro módulo es accesible.

**Independent Test**: Se puede probar de forma aislada abriendo la app sin sesión
activa, ingresando la clave correcta, y verificando que se llega a la vista de
Calendario.

**Acceptance Scenarios**:

1. **Given** no hay sesión activa en el dispositivo, **When** el usuario abre la
   app, **Then** ve una pantalla de login con un único campo para ingresar la
   clave.
2. **Given** el usuario está en la pantalla de login, **When** ingresa la clave
   correcta y confirma, **Then** accede directamente a la vista de Calendario
   (módulo Agenda).
3. **Given** el usuario ya tiene una sesión activa en el dispositivo, **When**
   vuelve a abrir la app, **Then** accede directamente a la vista de Calendario
   sin pasar por el login.

---

### User Story 2 - Reintentar tras clave incorrecta (Priority: P2)

Como usuario, si me equivoco al ingresar la clave, quiero ver un mensaje de error
claro y poder reintentar sin límite de intentos.

**Why this priority**: Es un flujo de manejo de error necesario para que el
sistema sea usable, pero depende de que exista primero el flujo de login (User
Story 1).

**Independent Test**: Se puede probar de forma aislada ingresando una clave
incorrecta y verificando el mensaje de error y la posibilidad de reintentar.

**Acceptance Scenarios**:

1. **Given** el usuario está en la pantalla de login, **When** ingresa una clave
   incorrecta y confirma, **Then** ve un mensaje de error simple indicando que la
   clave es incorrecta.
2. **Given** el usuario vio el mensaje de error, **When** vuelve a intentar con
   cualquier clave, **Then** el sistema permite el reintento sin límite de
   intentos ni bloqueo temporal.

---

### User Story 3 - Cerrar sesión manualmente (Priority: P3)

Como usuario, quiero poder salir de la app manualmente para cerrar mi sesión en
ese dispositivo.

**Why this priority**: Es un flujo complementario; el sistema funciona sin él
para el uso diario, pero es necesario para poder volver a la pantalla de login
(por ejemplo, si cambia la clave compartida).

**Independent Test**: Se puede probar de forma aislada con una sesión activa,
cerrando sesión, y verificando que la siguiente apertura de la app vuelve a
pedir la clave.

**Acceptance Scenarios**:

1. **Given** el usuario tiene una sesión activa, **When** elige la opción de
   salir, **Then** la sesión se cierra en ese dispositivo.
2. **Given** el usuario cerró sesión, **When** vuelve a abrir la app, **Then** ve
   nuevamente la pantalla de login.

---

### Edge Cases

- ¿Qué pasa si el usuario deja el campo de clave vacío y confirma? El sistema debe
  mostrar el mismo mensaje de error que para una clave incorrecta, sin permitir
  el envío de un valor vacío como intento válido.
- ¿Qué pasa si la clave compartida se cambia mientras un usuario tiene una sesión
  activa en su dispositivo? La sesión activa existente se mantiene válida hasta
  que el usuario cierre sesión manualmente (no hay invalidación remota de
  sesiones en este módulo).
- ¿Qué pasa si dos usuarios distintos ingresan la misma clave compartida desde
  dispositivos distintos al mismo tiempo? Ambos acceden sin conflicto; no hay
  límite de sesiones simultáneas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST mostrar una pantalla de login con un único campo
  de clave cuando no exista una sesión activa en el dispositivo.
- **FR-002**: El sistema MUST validar la clave ingresada contra una clave
  compartida única, configurada manualmente por el desarrollador.
- **FR-003**: El sistema MUST, ante una clave correcta, iniciar sesión en el
  dispositivo y redirigir directamente a la vista de Calendario (módulo Agenda).
- **FR-004**: El sistema MUST, ante una clave incorrecta o vacía, mostrar un
  mensaje de error simple y permitir reintentar sin límite de intentos.
- **FR-005**: El sistema MUST mantener la sesión activa en el dispositivo hasta
  que el usuario cierre sesión manualmente; no hay expiración automática por
  inactividad.
- **FR-006**: El sistema MUST otorgar el mismo nivel de acceso completo a todos
  los módulos para cualquier sesión válida; no existen roles ni permisos
  diferenciados entre los 3 usuarios.
- **FR-007**: El sistema MUST permitir cerrar sesión manualmente desde dentro de
  la app, volviendo a requerir la clave en el siguiente acceso desde ese
  dispositivo.
- **FR-008**: El sistema MUST NOT incluir pantallas de registro de usuario ni de
  recuperación de clave dentro de la app.

### Key Entities

- **Sesión**: Representa el estado de acceso autorizado en un dispositivo.
  Atributos conceptuales: dispositivo asociado, estado (activa/cerrada). No
  distingue identidad individual del usuario ni rol.
- **Clave de acceso**: Valor único compartido por los 3 usuarios, configurado
  manualmente fuera de la app. No se modela como entidad editable desde la
  interfaz de usuario en este módulo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario con la clave correcta accede a la vista de Calendario
  en menos de 10 segundos desde que abre la app.
- **SC-002**: El 100% de los intentos con clave incorrecta muestran un mensaje
  de error y permiten un nuevo intento inmediato, sin bloqueos.
- **SC-003**: Un usuario que ya inició sesión en su dispositivo no vuelve a ver
  la pantalla de login en aperturas posteriores de la app, salvo que haya
  cerrado sesión manualmente.
- **SC-004**: El 100% de las sesiones válidas tienen acceso a la totalidad de
  los módulos de la app, sin diferencias entre los 3 usuarios.

## Assumptions

- La clave compartida se configura y almacena de forma manual por el
  desarrollador (Cisco) al desplegar o actualizar la app; este módulo no
  incluye una interfaz para crearla o cambiarla.
- "Sesión activa en el dispositivo" se interpreta como una sesión persistida
  localmente en el dispositivo/navegador del usuario, no vinculada a una
  identidad individual, consistente con el Principio VIII (Acceso por Clave
  Compartida) de la constitución del proyecto.
- No hay requisito de HTTPS explícito en el input, pero se asume como estándar
  mínimo de transporte al validar la clave contra el backend, dado que viaja
  información de acceso.
- No hay límite de dispositivos ni de sesiones simultáneas por usuario.
