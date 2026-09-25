# Quickstart: Reservas

**Feature**: 004-reservas | **Date**: 2026-09-25 (revisado tras edición/cancelación)

Guía de validación manual end-to-end del módulo Reservas.

## Prerrequisitos

- Módulo Acceso, Quintas y Clientes implementados.
- App corriendo localmente en viewport móvil.

## Escenario 1: Cálculo de precio al crear (sin cambios respecto a la versión anterior)

1. Crear una reserva para "Quinta Serrano 1" en día de semana, 50 personas,
   sin horas extra.
2. **Verificar**: `precioTotal = 300000`, `señaMonto = 90000`.

## Escenario 2: Snapshot fijo si la reserva NO se edita

1. Con la reserva del Escenario 1 ya guardada, cambiar `precioSemana` de
   "Quinta Serrano 1" desde Configuración.
2. Volver al detalle de esa reserva sin editarla.
3. **Verificar**: `precioTotal` sigue siendo el original (300000), no
   cambió solo porque cambió la quinta.

## Escenario 3: Editar una reserva recalcula el precio

1. Editar la reserva del Escenario 1 (ya con el nuevo `precioSemana` de la
   quinta vigente), sin cambiar ningún otro dato, y guardar.
2. **Verificar**: `precioTotal` y `señaMonto` ahora reflejan el nuevo precio
   de la quinta (se recalcularon al guardar la edición).
3. Editar la cantidad de personas a un valor mayor a la capacidad base.
4. **Verificar**: el resumen en vivo dentro del formulario de edición
   muestra el precio actualizado con el costo por persona extra antes de
   guardar.

## Escenario 4: Reprogramar la fecha de una reserva

1. Editar una reserva y cambiar su `fecha` a otro día disponible para la
   misma quinta.
2. **Verificar**: la edición se guarda correctamente; el día original queda
   libre en el calendario y el nuevo día aparece ocupado.
3. Intentar reprogramar una reserva a una fecha donde esa misma quinta ya
   tiene otra reserva activa.
4. **Verificar**: el sistema rechaza la edición con un mensaje de conflicto.

## Escenario 5: Marcar seña como pagada (sin cambios)

1. Marcar la seña de una reserva "Pendiente de seña" como pagada.
2. **Verificar**: pasa a estado "Señada".

## Escenario 6: Cancelar una reserva

1. Abrir el detalle de una reserva en estado "Pendiente de seña" o "Señada".
2. Tocar "Cancelar reserva" y confirmar.
3. **Verificar**: el estado pasa a "Cancelada"; el documento sigue
   existiendo (no desaparece de Firestore).
4. Consultar el calendario para la quinta y fecha de esa reserva.
5. **Verificar**: el día vuelve a mostrarse libre (SC-006).
6. Consultar el historial del cliente asociado a esa reserva.
7. **Verificar**: la reserva sigue apareciendo en el historial, marcada como
   "Cancelada" (SC-007).
8. Intentar crear una nueva reserva para la misma quinta y fecha que la
   cancelada.
9. **Verificar**: se permite (una cancelada no cuenta para la validación de
   unicidad, FR-018).

## Escenario 7: Restricciones sobre "Utilizada" y sobre una ya "Cancelada"

1. Con una reserva cuya fecha ya pasó (estado visual "Utilizada"), intentar
   editarla.
2. **Verificar**: el sistema impide la edición.
3. Intentar cancelarla.
4. **Verificar**: el sistema impide la cancelación.
5. Con una reserva ya "Cancelada", intentar cancelarla de nuevo.
6. **Verificar**: el sistema no ofrece la acción o la rechaza si se invoca
   directamente.
7. Intentar editar una reserva ya "Cancelada".
8. **Verificar**: el sistema impide la edición.

## Escenario 8: Transición visual a "Utilizada" (sin cambios de lógica)

1. Con una reserva cuya fecha pasó y estado "pendiente_seña" o "señada"
   (no cancelada), consultarla.
2. **Verificar**: se muestra como "Utilizada" en ambos casos.

## Resultado esperado

Todos los escenarios confirman SC-001 a SC-007 del spec, incluyendo los dos
nuevos criterios de cancelación (liberación del calendario y persistencia en
historial).
