# Quickstart: Acceso

**Feature**: 001-acceso | **Date**: 2026-09-25

Guía de validación manual end-to-end del gate de PIN, alineada con la
Estrategia de Pruebas de la constitución.

## Prerrequisitos

- Proyecto de Firebase con Authentication habilitado, método "Anonymous"
  activado en la consola de Firebase.
- Firestore Security Rules desplegadas con `request.auth != null` (ver
  [contracts/acceso-interfaces.md](./contracts/acceso-interfaces.md)).
- Variable de entorno `VITE_APP_PIN` configurada (ej. en `.env.local` para
  desarrollo, y en la configuración del hosting para producción).
- App corriendo localmente: `npm run dev`, abierta en viewport móvil.

## Escenario 1: Primer ingreso con PIN correcto (User Story 1)

1. Abrir la app en un navegador/dispositivo sin datos previos en
   `localStorage` (o en modo incógnito).
2. **Verificar**: se muestra `PantallaLogin` con un único campo de clave.
3. Ingresar el valor configurado en `VITE_APP_PIN` y confirmar.
4. **Verificar**: se navega directamente a la vista de Calendario, en menos
   de 10 segundos (SC-001).
5. Cerrar y volver a abrir la app (misma pestaña/dispositivo).
6. **Verificar**: se accede directamente al Calendario, sin volver a mostrar
   `PantallaLogin` (SC-003).

## Escenario 2: PIN incorrecto y reintento (User Story 2)

1. Con `localStorage` limpio, abrir la app.
2. Ingresar un PIN incorrecto y confirmar.
3. **Verificar**: se muestra un mensaje de error simple; el campo permite
   reintentar de inmediato (SC-002).
4. Repetir el intento incorrecto 5 veces seguidas.
5. **Verificar**: no hay bloqueo ni límite de intentos en ningún momento.
6. Ingresar el PIN correcto en el intento siguiente.
7. **Verificar**: se accede al Calendario normalmente.

## Escenario 3: Cerrar sesión manualmente (User Story 3)

1. Con una sesión activa (flag en `localStorage`), ubicar la opción de salir
   dentro de la app.
2. Confirmar el cierre de sesión.
3. **Verificar**: se vuelve a mostrar `PantallaLogin`.
4. Recargar la app.
5. **Verificar**: sigue mostrando `PantallaLogin` (la sesión no se
   restablece sola).

## Escenario 4: Verificación de acceso a Firestore (infraestructura)

1. Con las DevTools del navegador abiertas (pestaña Network o Console),
   cargar la app desde cero.
2. **Verificar**: se dispara una llamada de `signInAnonymously()` (visible en
   la pestaña de red hacia el endpoint de Firebase Auth, o mediante un log
   temporal) independientemente de si se completó el login por PIN.
3. Iniciar sesión con el PIN correcto y navegar al Calendario (que consulta
   Firestore vía el módulo Agenda/Reservas).
4. **Verificar**: las consultas a Firestore no devuelven error de permisos
   (`PERMISSION_DENIED`), confirmando que `request.auth != null` se cumple.

## Resultado esperado

Todos los escenarios confirman SC-001 a SC-004 del spec, y validan que la
sesión anónima de Firebase Auth no depende del gate de PIN visible para el
usuario.
