# Quickstart: Clientes

**Feature**: 003-clientes | **Date**: 2026-09-25

Guía de validación manual end-to-end del módulo Clientes, alineada con la
Estrategia de Pruebas de la constitución.

## Prerrequisitos

- Módulo Acceso (`001-acceso`) implementado y sesión activa (Firestore exige
  `request.auth != null`).
- Colección `clientes` existente en Firestore (puede estar vacía).
- Al menos un flujo de carga de reservas disponible que use
  `BuscadorClientes` (aunque sea un stub mínimo, para probar la creación de
  clientes de punta a punta); si el módulo Reservas todavía no está
  implementado, los escenarios 2 y 3 pueden probarse simulando la invocación
  del componente `BuscadorClientes` de forma aislada.
- App corriendo localmente en viewport móvil.

## Escenario 1: Ver la lista vacía y con datos (User Story 1)

1. Con la colección `clientes` vacía, entrar a la pestaña Clientes.
2. **Verificar**: se muestra un estado vacío indicando que no hay clientes
   cargados.
3. Crear un cliente (ver Escenario 2) y volver a la pestaña Clientes.
4. **Verificar**: aparece en la lista con nombre, teléfono, y "0" en cantidad
   de reservas (todavía no tiene ninguna en estado "Utilizada").

## Escenario 2: Crear un cliente nuevo desde el buscador (User Story 4)

1. Desde el flujo de carga de una reserva, abrir `BuscadorClientes`.
2. Escribir un nombre o teléfono que no coincida con ningún cliente
   existente.
3. **Verificar**: se ofrece la opción de crear un cliente nuevo con esos
   datos.
4. Confirmar la creación.
5. **Verificar**: el nuevo cliente aparece en la lista de Clientes con la
   fecha de alta correspondiente.

## Escenario 3: Elegir un cliente existente desde el buscador (User Story 4)

1. Con al menos un cliente ya creado, abrir `BuscadorClientes` desde el flujo
   de carga de una reserva.
2. Escribir parte del nombre o teléfono de ese cliente.
3. **Verificar**: aparece como coincidencia seleccionable.
4. Elegirlo.
5. **Verificar**: la reserva se asocia a ese cliente sin crear un duplicado
   (no aparece un segundo documento con el mismo nombre/teléfono en la lista
   de Clientes).

## Escenario 4: Buscar en la lista de Clientes (User Story 3)

1. Con varios clientes cargados, entrar a la pestaña Clientes.
2. Escribir parte de un nombre en el buscador de la lista.
3. **Verificar**: la lista se filtra mostrando solo coincidencias parciales.
4. Repetir con parte de un teléfono.
5. **Verificar**: mismo comportamiento de filtrado.

## Escenario 5: Ver el historial de un cliente (User Story 2)

1. Con un cliente que tiene al menos una reserva asociada, tocarlo desde la
   lista.
2. **Verificar**: se muestra el detalle con la lista de sus reservas (fecha,
   quinta, estado).

## Escenario 6: Conteo de reservas solo cuenta "Utilizada"

1. Con un cliente que tiene reservas en distintos estados (Pendiente de
   seña, Señada, Utilizada), consultar la lista de Clientes.
2. **Verificar**: el número mostrado como "cantidad de reservas" coincide
   únicamente con la cantidad de reservas en estado "Utilizada" (FR-009).
3. Cambiar el estado de una reserva de ese cliente a "Utilizada" (o esperar
   la transición automática al vuelo del módulo Reservas) y volver a
   consultar la lista sin recargar.
4. **Verificar**: el conteo se actualiza en tiempo real, reflejando el nuevo
   total.

## Resultado esperado

Todos los escenarios confirman SC-001 a SC-004 del spec, incluyendo que no se
generan duplicados al reutilizar un cliente existente desde el buscador.
