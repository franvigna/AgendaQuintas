# Quickstart: Visitas

**Feature**: 005-visitas | **Date**: 2026-09-25

Guía de validación manual end-to-end del módulo Visitas.

## Prerrequisitos

- Módulo Acceso y Quintas implementados.
- App corriendo localmente en viewport móvil.

## Escenario 1: Registrar una visita desde el FAB (User Story 1)

1. Tocar `BotonFlotanteNuevaReserva` en la pantalla de Calendario.
2. **Verificar**: se presenta un selector de tipo "Reserva" | "Visita".
3. Elegir "Visita".
4. **Verificar**: se abre `FormularioVisita` con selector de quinta, fecha,
   nombre y teléfono opcional.
5. Completar quinta, fecha y nombre (sin teléfono) y confirmar.
6. **Verificar**: la visita se guarda correctamente sin exigir el teléfono.

## Escenario 2: Registrar una visita desde un día del calendario

1. Tocar un día vacío del calendario.
2. Elegir tipo "Visita" en el selector presentado.
3. **Verificar**: `FormularioVisita` se abre con la fecha ya precargada con
   el día tocado.

## Escenario 3: Ver visitas en el calendario con color distinto (User Story 2)

1. Con una visita ya registrada para una fecha determinada, abrir el
   calendario.
2. **Verificar**: ese día muestra un marcador de color distinto al de una
   reserva.

## Escenario 4: Coexistencia libre con Reservas

1. Crear una reserva activa para "Quinta Serrano 1" en una fecha
   determinada.
2. Registrar una visita para la misma quinta y la misma fecha.
3. **Verificar**: la visita se guarda sin ningún bloqueo ni advertencia.
4. **Verificar**: el calendario muestra ambos marcadores (quinta ocupada +
   visita) simultáneamente para ese día.

## Escenario 5: Sin relación con Clientes

1. Registrar una visita con nombre y teléfono de una persona que **no**
   existe todavía como Cliente.
2. **Verificar**: no se crea ningún registro nuevo en la pestaña Clientes
   como consecuencia de esta visita.

## Escenario 6: Múltiples visitas para la misma quinta y fecha

1. Registrar una segunda visita para la misma quinta y fecha del Escenario
   3, con un nombre de visitante distinto.
2. **Verificar**: el sistema permite la carga sin restricción de unicidad.

## Resultado esperado

Todos los escenarios confirman SC-001 a SC-003 del spec de Visitas.
