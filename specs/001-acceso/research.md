# Research: Acceso

**Feature**: 001-acceso | **Date**: 2026-09-25

Todo el enfoque técnico vino especificado explícitamente por el usuario (PIN
en cliente, Firebase Anonymous Auth, localStorage), sin marcadores `NEEDS
CLARIFICATION`. Esta investigación confirma decisiones concretas de
implementación dentro de ese enfoque ya definido.

## Decisión: Orden de ejecución — Anonymous Auth vs. verificación de PIN

**Decision**: `signInAnonymously()` se dispara siempre al cargar la app, en
paralelo/antes de verificar el flag de `localStorage`, independientemente de
si el usuario ya pasó el gate de PIN o no.

**Rationale**: Firestore exige `request.auth != null` para cualquier
lectura/escritura (incluida la futura lectura de `quintas`, `reservas`,
etc.). Si el sign-in anónimo dependiera de haber pasado el gate de PIN
primero, se introduciría un orden de dependencia innecesario; en cambio,
autenticar anónimamente de entrada es transparente para el usuario (no hay
UI asociada) y desacopla completamente "tener una sesión de Firebase" de
"haber pasado el gate de PIN visible para el usuario" (que son conceptos
distintos, Principio II: no mezclar responsabilidades).

**Alternatives considered**: Disparar `signInAnonymously()` solo después de
un PIN correcto — descartado porque no hay razón de negocio para atarlos
(FR-002 valida el PIN localmente, no contra Firebase Auth), y complica el
código sin beneficio.

## Decisión: Persistencia del flag de sesión

**Decision**: El flag de sesión se guarda en `localStorage` bajo una clave
simple (ej. `"quintaSerrano.autenticado"`) con valor `"true"`, leído por
`useSesion()` al montar la app.

**Rationale**: `localStorage` persiste entre cierres de la app/navegador
(consistente con FR-005: "no hay expiración automática por inactividad"), a
diferencia de `sessionStorage` que se perdería al cerrar la pestaña. Es la
opción más simple para un flag booleano por dispositivo (Principio II), sin
necesidad de cookies ni de un token con expiración.

**Alternatives considered**: `sessionStorage` — descartado porque expiraría
la sesión al cerrar la pestaña/app, violando FR-005 y SC-003 del spec ("no
vuelve a ver la pantalla de login... salvo que haya cerrado sesión
manualmente").

## Decisión: Comparación del PIN

**Decision**: El PIN ingresado se compara en el cliente con
`import.meta.env.VITE_APP_PIN` mediante comparación de strings simple
(`===`), sin hashing ni llamada a un backend.

**Rationale**: El propio spec (Principio de la Aclaración de seguridad del
usuario) establece explícitamente que esto NO es un sistema de autenticación
robusto, sino una barrera simple para 3 usuarios de confianza y datos de bajo
riesgo. Agregar hashing o validación server-side sería una complejidad no
justificada para este caso de uso (Principio II), y el propio usuario
delimitó ese límite de forma explícita.

**Alternatives considered**: Validar el PIN contra un valor guardado en
Firestore — descartado explícitamente por el usuario ("se compara en el
cliente, no contra Firestore"); habría requerido además una regla de
Firestore de lectura pública para el documento del PIN, contradiciendo la
regla `request.auth != null` para todas las colecciones.

## Decisión: Reglas de seguridad de Firestore

**Decision**: Las Firestore Security Rules exigen `request.auth != null`
para `read` y `write` en todas las colecciones, sin diferenciar por rol ni
por UID específico.

**Rationale**: Consistente con el Principio VIII (sin roles ni permisos
diferenciados) y con el hecho de que cualquier usuario autenticado
anónimamente ya pasó el gate de PIN de la aplicación (el PIN es la barrera de
negocio; `request.auth != null` es solo la barrera técnica mínima que exige
el SDK de Firestore para no operar en modo completamente público).

**Alternatives considered**: Reglas basadas en un custom claim o UID
específico — descartado por complejidad innecesaria (Principio II): no hay
necesidad de distinguir usuarios entre sí, ya que los 3 comparten el mismo
nivel de acceso (FR-006 del spec).

## Resumen

No quedan unknowns pendientes. El riesgo principal identificado (el PIN es
visible en el bundle de JS ya que `VITE_APP_PIN` se embebe en el build
client-side) es aceptado explícitamente por el usuario como parte del
alcance y las limitaciones de seguridad declaradas en el spec y en este
input.
