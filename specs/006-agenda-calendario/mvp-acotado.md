# Nota de alcance: MVP acotado para demo inicial (agregado 2026-10-05)

**Decisión del usuario**: antes de construir el módulo Agenda completo
(descrito en `spec.md`, que combina Reservas + Visitas con seña, swipe,
detalle completo, etc.), el usuario pidió una primera demo mucho más
reducida para mostrarle a sus suegros, que todavía no están acostumbrados a
usar aplicaciones. El objetivo es validar lo mínimo posible antes de seguir
sumando funcionalidad.

**Por qué no se descarta el trabajo ya hecho**: los módulos Acceso, Quintas,
Clientes y Reservas ya implementados (con sus 6+ user stories, seña real,
edición, cancelación, etc.) NO se eliminan ni se reescriben. Quedan
funcionando tal cual en el código, simplemente no se exponen en la
navegación principal de esta demo. `spec.md`, `data-model.md`,
`contracts/` y `tasks.md` de este módulo (`006-agenda-calendario`) siguen
describiendo la versión completa a implementar más adelante — este archivo
es una capa de alcance temporal, no un reemplazo.

## Alcance de esta versión

- Vista mensual del calendario, con navegación por botones "mes anterior" /
  "mes siguiente" Y por gesto de swipe horizontal (`useGestoSwipe`,
  agregado 2026-10-05, reutilizando el contrato ya previsto en
  `contracts/calendario-interfaces.md` para la versión completa).
- Cada día se puede tocar. Al tocarlo, se abre un popup con dos opciones:
  - "Marcar Quinta 1" (o "Desmarcar Quinta 1" si ya está marcada)
  - "Marcar Quinta 2" (o "Desmarcar Quinta 2" si ya está marcada)
- Tocar la opción alterna (toggle) la ocupación de esa quinta para ese día.
- Cada quinta ocupada se pinta con su color asignado; si ambas están
  marcadas el mismo día, se ven ambas marcas (reutiliza la regla de "marca
  doble" ya prevista en `spec.md` FR-003).

## Explícitamente fuera de esta versión (no implementado todavía)

- Cliente, precio, seña, estado de reserva: no existen en este flujo.
- Visitas: no se muestran ni se cargan desde esta vista.
- El FAB "+" / `BotonFlotanteNuevaReserva`, `FormularioReserva`,
  `FormularioVisita`: NO se exponen en la navegación de esta demo (el
  código sigue existiendo, intacto, para una versión futura).
- Las pantallas "Clientes", "Próximos alquileres" y "Configurar quintas":
  NO se exponen en la navegación de esta demo (todas siguen funcionando si
  se las vuelve a montar en `App.tsx`).
- Swipe entre meses.

## Modelo de datos de esta versión

**Colección Firestore nueva**: `quintaAgendada` (independiente de
`reservas`, sin relación entre ambas).

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `string` | Autogenerado |
| `quintaId` | `string` | Referencia a `quintas` |
| `fecha` | `string` | ISO `"YYYY-MM-DD"` |

- Un documento existe = esa quinta está marcada como ocupada ese día.
- Marcar = crear el documento. Desmarcar = borrar el documento (a
  diferencia de Reserva, que nunca se borra — acá no hay necesidad de
  historial, es un simple flag de ocupación).
- Sin unicidad más allá de (quintaId, fecha) de forma natural: si ya existe
  un documento para esa combinación, el toggle lo borra en vez de crear uno
  nuevo.

## Camino a futuro

Cuando el usuario valide esta demo y quiera avanzar, los siguientes pasos
naturales (ya con todo el trabajo de Reservas/Clientes disponible) son:
1. Reemplazar el toggle simple por el flujo completo de `FormularioReserva`
   (cliente, precio, seña) al tocar un día vacío.
2. Reactivar el FAB y las pantallas de Clientes/Próximos alquileres en la
   navegación.
3. Migrar (si se desea) los datos de `quintaAgendada` a `reservas` reales,
   o mantenerlos como un calendario "rápido" en paralelo.
4. Agregar Visitas a la vista y el swipe entre meses (US2 del spec
   completo).
