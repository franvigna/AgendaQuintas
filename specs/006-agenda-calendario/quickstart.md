# Quickstart: Agenda (Calendario)

**Feature**: 006-agenda-calendario | **Date**: 2026-09-25

Guía de validación manual end-to-end del módulo Agenda, alineada con la
Estrategia de Pruebas de la constitución.

## Prerrequisitos

- Módulo Acceso implementado (sesión activa).
- Módulo Quintas implementado, con las 2 quintas semilla.
- Módulo Reservas implementado, con `useReservasDelMes` excluyendo reservas
  "Canceladas" (ver research.md).
- Módulo Visitas implementado, con `useVisitasDelMes` disponible.
- App corriendo localmente en viewport móvil (o DevTools en modo
  responsive, para poder simular gestos táctiles).

## Escenario 1: Vista inicial tras el login (User Story 1)

1. Ingresar con el PIN correcto desde la pantalla de login.
2. **Verificar**: se muestra directamente el calendario del mes actual, sin
   pantallas intermedias.

## Escenario 2: Marcadores de color por tipo de ocupación (User Story 1)

1. Con una reserva cargada para "Quinta Serrano 1" en una fecha del mes
   visible, abrir el calendario.
2. **Verificar**: ese día muestra el marcador de color asignado a Quinta
   Serrano 1.
3. Repetir con una reserva de "Quinta Serrano 2" en otra fecha.
4. **Verificar**: marcador de color distinto para esa quinta.
5. Repetir con una visita registrada en una tercera fecha.
6. **Verificar**: marcador de color distinto al de ambas quintas.
7. Cargar una reserva de Quinta Serrano 1 y otra de Quinta Serrano 2 en la
   misma fecha.
8. **Verificar**: esa fecha muestra ambos marcadores simultáneamente,
   distinguibles entre sí (marca doble).

## Escenario 3: Reserva cancelada libera el día visualmente

1. Con una reserva activa marcando un día como ocupado, cancelarla desde el
   módulo Reservas.
2. Volver al calendario sin recargar manualmente.
3. **Verificar**: ese día deja de mostrar el marcador de la quinta
   correspondiente (vuelve a verse libre), confirmando que
   `useReservasDelMes` excluye reservas canceladas.

## Escenario 4: Navegación entre meses por swipe (User Story 2)

1. Desde el calendario del mes actual, realizar un gesto de swipe hacia la
   izquierda (deslizar el dedo de derecha a izquierda).
2. **Verificar**: el calendario avanza al mes siguiente.
3. Realizar un gesto de swipe hacia la derecha.
4. **Verificar**: el calendario retrocede al mes anterior.
5. Repetir el gesto varias veces seguidas rápidamente.
6. **Verificar**: el mes mostrado avanza/retrocede de forma sincronizada con
   cada gesto reconocido, sin saltos ni desincronización.

## Escenario 5: Tocar un día vacío abre el formulario de alta (User Story 3)

1. Tocar un día del calendario sin ninguna reserva ni visita cargada.
2. **Verificar**: se abre el formulario de alta (Reserva o selector
   Reserva/Visita) con esa fecha precargada.

## Escenario 6: Tocar un día con datos abre el detalle (User Story 3)

1. Tocar un día que ya tiene una reserva y/o una visita cargada.
2. **Verificar**: se muestra el detalle combinado de lo que hay ese día.
3. Desde el detalle de una reserva, marcar la seña como pagada.
4. **Verificar**: el cambio se aplica sin salir del flujo de detalle del
   día.

## Resultado esperado

Todos los escenarios confirman SC-001 a SC-004 del spec de Agenda, y
validan puntualmente que el estado "Cancelada" de una reserva (definido en
`004-reservas`) se refleja correctamente como "día libre" en esta vista.
