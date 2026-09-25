# Quickstart: Quintas

**Feature**: 002-quintas | **Date**: 2026-09-25

Guía de validación manual end-to-end del módulo Quintas, alineada con la
Estrategia de Pruebas de la constitución (checklist manual, sin suite
automatizada exhaustiva en el MVP).

## Prerrequisitos

- Proyecto de Firebase configurado con Firestore habilitado.
- Variables de entorno / config del SDK de Firebase cargadas en el proyecto
  Vite (ver `src/services/firebase.ts`).
- Colección `quintas` inicializada con los 2 documentos semilla (ver
  [data-model.md](./data-model.md#datos-semilla)).
- App corriendo localmente: `npm run dev` (o el script equivalente definido
  en `package.json`), abierta en un viewport móvil (DevTools en modo
  responsive o dispositivo real).

## Escenario 1: Ver la lista de quintas (User Story 1)

1. Abrir la app y navegar a la pantalla de Configuración.
2. **Verificar**: se listan "Quinta Serrano 1" y "Quinta Serrano 2" por
   nombre.

## Escenario 2: Editar y persistir un cambio (User Story 2)

1. Desde la lista de Configuración, entrar al detalle de "Quinta Serrano 1".
2. **Verificar**: se muestran todos los campos editables (nombre, capacidad
   base, precio semana, precio finde, costo por persona extra, horario
   inicio/fin, costo por hora extra, porcentaje de seña).
3. Cambiar `precioFinde` a un valor distinto y guardar.
4. **Verificar**: el cambio persiste al salir y volver a entrar al detalle de
   esa quinta.
5. Abrir la app en un segundo dispositivo/pestaña con sesión activa.
6. **Verificar**: el nuevo valor de `precioFinde` aparece sin recargar
   manualmente (sincronización en tiempo real vía `onSnapshot`).

## Escenario 3: Validaciones (Edge Cases del spec)

1. Intentar guardar un valor negativo en `capacidadBase`.
   **Verificar**: el guardado se rechaza con un mensaje de validación; el
   valor anterior persiste en Firestore.
2. Intentar guardar `horarioFin` igual o anterior a `horarioInicio`.
   **Verificar**: el guardado se rechaza con un mensaje de validación.
3. Intentar guardar `porcentajeSeña` fuera del rango 0-100 (ej. 150).
   **Verificar**: el guardado se rechaza con un mensaje de validación.
4. Dejar `costoPersonaExtra` y `costoHoraExtra` en 0 y guardar.
   **Verificar**: el guardado se acepta sin error (son válidos en 0, FR-009).

## Escenario 4: Precio histórico no afectado (regla de negocio clave)

Este escenario requiere que el módulo Reservas ya esté implementado; se
incluye aquí porque valida una regla central de este módulo (FR-007).

1. Con una reserva ya creada para "Quinta Serrano 1" (ver quickstart de
   `004-reservas`), cambiar el `precioSemana` de esa quinta a un valor
   distinto y guardar.
2. **Verificar**: la reserva ya creada conserva su precio original (snapshot);
   solo las reservas nuevas usan el precio actualizado.

## Resultado esperado

Todos los escenarios anteriores pasan sin intervención manual adicional más
allá de las acciones descritas, confirmando SC-001 a SC-004 del spec.
