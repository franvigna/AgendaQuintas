# Research: Agenda (Calendario)

**Feature**: 006-agenda-calendario | **Date**: 2026-09-25

Todo el enfoque técnico vino especificado explícitamente por el usuario
(gestos nativos, composición sin colección propia, estado local del mes),
sin marcadores `NEEDS CLARIFICATION`. Esta investigación confirma decisiones
concretas y documenta una dependencia detectada con el módulo Reservas.

## Decisión: Gestos táctiles nativos en vez de librería de gestos

**Decision**: `useGestoSwipe` implementa detección de swipe horizontal
mediante los eventos nativos `touchstart` y `touchend`, calculando la
distancia recorrida en el eje X y comparándola contra un umbral mínimo
(ej. 50px) para decidir si se interpreta como cambio de mes.

**Rationale**: Explícitamente decidido por el usuario para mantener el
bundle liviano (Principio II: no sumar una dependencia externa para un
gesto simple de una sola dirección). Un swipe horizontal simple no
requiere las capacidades de una librería completa de gestos (pinch, rotate,
multi-touch), que serían over-engineering para este caso de uso.

**Alternatives considered**: Librería de gestos (ej. `react-swipeable`,
`use-gesture`) — descartada explícitamente por el usuario para no sumar
peso al bundle; el trade-off (algo más de código propio para manejar casos
límite como scroll vertical accidental) se acepta dado el bajo volumen de
interacción esperado (3 usuarios).

## Decisión: Estado del mes visible como `useState` local, no sincronizado

**Decision**: El mes actualmente visible en el calendario vive como
`useState` dentro de `Calendario`, sin persistir en Firestore ni
compartirse entre dispositivos.

**Rationale**: Es un dato de navegación efímero (Principio III se cumple
igual: los *datos de negocio* —reservas y visitas— sí sincronizan en tiempo
real; el mes que cada usuario está mirando en su pantalla no es un dato de
negocio, es preferencia de navegación individual). Sincronizarlo entre
dispositivos sería una funcionalidad no pedida y probablemente indeseada
(un usuario navegando meses futuros no debería forzar a los demás a ver lo
mismo).

**Alternatives considered**: Persistir el mes visible en `localStorage` por
dispositivo (para recordar la última posición al reabrir la app) — no fue
pedido por el usuario; se documenta como posible mejora futura de bajo
riesgo, no bloqueante.

## Decisión: Colores como constantes en archivo de configuración

**Decision**: `src/constants/colores.ts` exporta `colorQuintaSerrano1`,
`colorQuintaSerrano2`, `colorVisita` como strings de color (hex o variable
CSS), consumidos por `DiaCalendario` y donde más se necesite pintar estos
elementos.

**Rationale**: La paleta final de colores está pendiente de definición
(Assumptions del spec de Agenda: "decisión de diseño visual que se resuelve
en la fase de planificación"). Centralizarlos en un solo archivo permite
ajustarlos sin tocar cada componente que los usa.

**Alternatives considered**: Ninguna relevante; es la solución más directa
para un valor de configuración compartido entre componentes.

## Nota de dependencia con `004-reservas` (estado "Cancelada")

**Observación**: El spec de Reservas fue clarificado recientemente para
incluir un estado "Cancelada" (FR-016 a FR-019 de `004-reservas/spec.md`),
que debe excluirse de las consultas que determinan ocupación de una quinta
(FR-018 de ese spec: "el día vuelve a mostrarse libre").

**Decision**: `useReservasDelMes(mes, año)` (propiedad del módulo Reservas)
MUST excluir las reservas en estado "Cancelada" de su resultado, o exponer
un campo que permita a `Calendario` filtrarlas antes de pintar. Este módulo
(Agenda) no implementa lógica de filtrado por estado: simplemente asume que
lo que recibe de `useReservasDelMes` ya representa "ocupación real" de la
quinta.

**Rationale**: Mantener una única fuente de verdad (el módulo Reservas) para
qué cuenta como "quinta ocupada", evitando que Agenda duplique la lógica de
exclusión de canceladas. Si el módulo Reservas se implementa después de este
plan, su implementación debe respetar este contrato para que Agenda
funcione correctamente sin cambios.

**Impacto en implementación**: al implementar `004-reservas`, el hook
`useReservasDelMes` debe filtrar reservas en estado "Cancelada" del array
que devuelve (o excluirlas directamente en la query de Firestore si el
campo `estado` lo permite). Se documenta aquí porque se detectó al
planificar Agenda, análogo a la nota de coherencia dejada previamente entre
Reservas y Clientes.

## Resumen

No quedan unknowns pendientes. Se dejó documentada una dependencia de
contrato con `004-reservas` (exclusión de reservas canceladas en
`useReservasDelMes`) para que ambos módulos queden consistentes al
implementarse.
