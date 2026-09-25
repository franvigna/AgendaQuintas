# Quinta Serrano — Especificación de Requisitos

Sep 25, 2026 · @Cisco

## Contexto y problema actual

Hoy mis suegros anotan las reservas a mano en un almanaque pegado en la heladera, marcando con color si un dia esta alquilado o no.

A partir de este año van a manejar **dos quintas**, no una. Con el sistema actual (papel) necesitarian dos almanaques distintos, uno por quinta, cada uno con su propio color, y no tienen un metodo claro para organizarse. El resultado es confusion: no queda claro de un vistazo que quinta esta ocupada que dia, ni hay registro de quien alquilo, cuando visito antes de alquilar, ni de sus datos de contacto.

El objetivo de esta etapa es llevarles una solucion digital que les permita ver, de un vistazo, el estado de ambas quintas mes a mes, cargar reservas de forma simple, y tener un registro ordenado de clientes.

## Alcance: dos quintas

El sistema gestiona **dos propiedades**, cada una con su propia identidad, capacidad y precios:

- **Quinta Serrano 1:** hasta 50 personas
- **Quinta Serrano 2:** hasta 40 personas

Sigue siendo un sistema de uso interno y gratuito para la familia (suegro, suegra y novia como administradores), no un producto para vender a terceros por ahora. Cada quinta se configura de forma independiente (precios, capacidad), pero conviven en el mismo calendario y la misma app.

## Tipos de eventos

La consulta inicial de una persona interesada en una quinta queda **fuera del sistema** (se maneja hoy por fuera, ej. WhatsApp o telefono). A partir de que hay una fecha concreta para registrar, el sistema maneja dos tipos de eventos en el calendario:

- **Visita:** una persona quiere conocer la quinta antes de decidir si la alquila. Se registra el dia y quien va a visitar.
- **Reserva / alquiler:** una quinta queda confirmada para un dia (o rango de dias) especifico, con datos del cliente, cantidad de personas y precio.

Ambos tipos de evento se ven en el mismo calendario, diferenciados por color.

## Vista principal: Calendario

Es la pantalla con la que arranca la app (mobile-first, uso exclusivo en celular).

- Al abrir la app se ve el **almanaque del mes actual**, con todos los dias del mes.
- Navegacion entre meses por **gesto de deslizar** (swipe) el dedo a la izquierda o derecha, en vez de botones de flecha.
- Cada dia se marca con un color segun lo que tenga cargado ese dia:
  - Un color para **Quinta Serrano 1** ocupada (ej. celeste)
  - Un color distinto para **Quinta Serrano 2** ocupada (ej. verde)
  - Un tercer color para **dia de visita** (ej. amarillo)
  - (paleta definitiva a confirmar, pero la logica de "un color por tipo de marca" es la base)
- Si un mismo dia tiene **ambas quintas alquiladas a la vez**, se distingue visualmente con un doble circulo (uno del color de cada quinta) en vez de un solo color, para que quede claro que no es una sola marca.

## Alta de una reserva

**Dos formas de iniciar la carga:**

1. Boton flotante con un **"+"**, ubicado abajo a la derecha de la pantalla, disponible en todo momento.
2. Tocar directamente un **dia del calendario**, que abre el mismo formulario con esa fecha ya precargada.

**Datos que se cargan en el formulario:**

- Quinta a alquilar (Serrano 1 o Serrano 2)
- Nombre de la persona
- Numero de telefono
- Fecha (o dia de la semana, dato que se usa para el calculo del precio)
- Cantidad de personas

**Calculo automatico:** en base a la quinta elegida, el dia de la semana y la cantidad de personas, el sistema calcula solo el **precio total** y el **monto sugerido de seña**, usando los valores configurados para esa quinta (ver seccion de Configuracion de precios). La idea es que quien carga la reserva no tenga que calcular nada a mano.

Ese precio queda **fijado (snapshot)** en el momento de crear la reserva: si despues cambia la configuracion de precios de la quinta, las reservas ya cargadas no se recalculan, conservan el precio con el que fueron creadas.

## Configuracion de precios por quinta

Cada quinta tiene su propia configuracion de precios, editable desde la app (pantalla de Configuracion). La logica de calculo es:

**precio total = precio base (segun dia de semana o fin de semana) + (personas extra x costo por persona adicional) + (horas extra x costo por hora adicional)**

**seña sugerida = precio total x % de seña de la quinta**

El horario de alquiler estandar es de 10 a 19hs. Si el uso se extiende mas alla de esa hora, se suma un costo por cada hora extra. Tanto ese horario estandar, el costo por hora extra y el porcentaje de seña tambien son configurables por quinta, no fijos para todas.

Valores de referencia dados como ejemplo (a cargar como configuracion inicial, editable despues):

|  | Quinta Serrano 1 | Quinta Serrano 2 |
| --- | --- | --- |
| Capacidad base | hasta 50 personas | hasta 40 personas |
| Precio dias de semana (lun-vie) | $300.000 | $250.000 |
| Precio fin de semana (sab-dom) | $350.000 | $300.000 |
| Costo por persona extra | (definir, ej. $5.000) | (definir, ej. $5.000) |
| Horario estandar incluido | 10 a 19hs | 10 a 19hs |
| Costo por hora extra | (definir, ej. $10.000 a $20.000) | (definir, ej. $10.000 a $20.000) |
| % de seña sugerida | 30% (propuesto, a confirmar) | 30% (propuesto, a confirmar) |

La capacidad base es la cantidad de personas incluida en el precio base; si se supera, se suma el costo por persona adicional por cada persona de mas. De la misma forma, si el uso se extiende mas alla del horario estandar, se suma el costo por hora extra por cada hora (o fraccion de hora, a definir) que se exceda. La seña sugerida es un porcentaje del precio total, calculado automaticamente pero editable a mano al cargar la reserva.

## Estados de una reserva

Una reserva puede estar en uno de estos estados:

1. **Pendiente de seña** — la reserva esta cargada pero todavia no se pago la seña
2. **Señada** — se marca manualmente en la app que la seña fue pagada; queda pendiente la fecha del evento
3. **Utilizada** — la quinta ya fue usada. Este paso es **automatico**: la reserva pasa sola de "Señada" a "Utilizada" en cuanto la fecha reservada ya paso, sin que nadie tenga que marcarlo a mano.
4. **Cancelada** — la reserva se cancelo. Se puede cancelar una reserva que este "Pendiente de seña" o "Señada" (no una que ya este "Utilizada"). Una reserva cancelada no se muestra en la vista del calendario (el dia vuelve a verse libre), pero se conserva en el detalle/historial (ej. dentro del historial de reservas de un cliente) para no perder el registro.

Decision tecnica: el estado "Utilizada" se calcula de forma **derivada** en el momento de leer los datos (si una reserva "Señada" tiene fecha pasada, se muestra como "Utilizada"), sin necesidad de un proceso en segundo plano ni de escribir el cambio en la base de datos.

Edicion: mientras una reserva esta en estado "Pendiente de seña" o "Señada", se pueden editar libremente todos sus datos (fecha, cantidad de personas, quinta, etc.). Una vez "Utilizada" o "Cancelada", no se edita mas.

## Administracion de clientes

El sistema mantiene un **registro historico de clientes**, con:

- Nombre
- Telefono
- Historial de reservas (que quinta, que fechas, cuantas veces alquilo)

Esto permite saber rapido si una persona que llama ya alquilo antes, cuantas veces, y en que quinta — util para identificar clientes frecuentes.

## Navegacion de la app

Barra de navegacion inferior, fija, con 4 secciones:

1. **Calendario** — la vista principal descrita arriba
2. **Proximos alquileres** — listado de las proximas reservas, ordenadas por fecha, mostrando fecha, quinta y cantidad de personas por cada una
3. **Clientes** — administracion de clientes (nombre, telefono, historial)
4. **Configuracion** — precios y datos de cada quinta

El boton flotante de "+" para cargar una reserva convive con esta barra (se ve sobre todo en la pantalla de Calendario).

## Fuera de alcance de esta etapa

- Gestion de la consulta inicial de un cliente potencial (queda por fuera del sistema, se sigue manejando como hoy)
- Cobros o pagos online dentro de la app (la seña se marca como pagada manualmente, no se procesa el pago)
- Notificaciones push o recordatorios automaticos
- Expansion a mas quintas fuera de la familia, o venta del sistema a otros dueños
- Login/registro tradicional con contraseñas (acceso simple para los 3 usuarios conocidos)
- **Alquileres de mas de un dia consecutivo** (ej. familias de confianza que se quedan 2 o 3 dias con tarifa promocional). Por ahora toda reserva es de un unico dia; este es otro modelo de negocio a evaluar mas adelante.

Estos puntos quedan anotados para evaluar mas adelante, pero no forman parte de esta primera version.

## Preguntas abiertas

Puntos que conviene cerrar antes o durante la escritura de las especificaciones tecnicas de cada modulo (via /speckit-clarify):

- **Paleta de colores definitiva** para Quinta 1, Quinta 2 y visitas (los colores mencionados son solo ejemplos)
- **Costo exacto por persona extra** en cada quinta (se menciono $5.000 como ejemplo, a confirmar)
- **Costo exacto por hora extra** en cada quinta (se menciono entre $10.000 y $20.000, a confirmar), y si se cobra por hora completa o por fraccion de hora
- **% de seña sugerida** por quinta (se propuso 30% como default, a confirmar si es ese valor u otro)
- **Definicion de "fin de semana":** ¿el viernes cuenta como dia de semana o de fin de semana?
- **Tope de personas:** ¿existe un maximo absoluto de gente permitida por quinta, mas alla del costo extra por persona?

## Proximos pasos

Este documento funciona como **fuente de verdad del relevamiento de requisitos** del proyecto. La idea es trabajar con una metodologia tipo *spec kit*: partir de este relevamiento para llegar a un sistema escalable, sostenible y mantenible, iterando lo menos posible.

El siguiente paso es traducir este documento a:

1. **Especificaciones tecnicas puntuales** (modelo de datos, pantallas, reglas de negocio en detalle)
2. **Historias de usuario** concretas, una por funcionalidad, que sirvan de base para construir el sistema

Antes de ese paso conviene cerrar las preguntas abiertas de la seccion anterior, para que las especificaciones no arranquen con ambiguedades.

## Modulos del sistema

1. **Quintas** — configuracion de cada propiedad: capacidad, precio dia de semana/fin de semana, costo por persona extra, costo por hora extra y % de seña sugerida.
2. **Clientes** — registro historico: nombre, telefono, reservas pasadas por cliente. El telefono es el criterio para buscar coincidencias en el buscador de clientes. **[Actualizado 2026-09-25, ver `specs/003-clientes/spec.md` FR-008a]**: a diferencia de lo planteado originalmente en este parrafo, el sistema SI fuerza unicidad de telefono entre clientes — no se puede crear un cliente nuevo con un telefono ya usado por otro; en su lugar se ofrece usar el cliente existente o renombrarlo. El contador de "cantidad de reservas" que se muestra por cliente cuenta solo las reservas en estado "Utilizada" (alquileres efectivamente concretados).
3. **Reservas** — alta de una reserva, con un buscador de clientes (por nombre o telefono) que muestra coincidencias existentes antes de cargar uno nuevo, para evitar duplicados o inconsistencias de nombre; calculo automatico de precio y seña; estados del ciclo de vida (pendiente de seña, señada, utilizada — este ultimo calculado de forma derivada, no persistido).
4. **Visitas** — dias en que alguien va a conocer una quinta antes de decidir si la alquila. Es independiente del modulo Clientes: una visita no crea ni actualiza un registro de Cliente, porque visitar no implica que la persona vaya a alquilar.
5. **Agenda / Calendario** — no es un modulo de datos propio, sino la **vista** mensual que combina Reservas y Visitas con sus colores. La logica de negocio (precio, estados) vive en el modulo Reservas; Agenda solo la muestra. Una visita y una reserva pueden coexistir el mismo dia para la misma quinta.
6. **Acceso** — pantalla de login inicial que pide una clave/PIN compartida antes de mostrar el calendario. No hay registro de usuarios ni recuperacion de contraseña: es una unica clave, que Cisco configura a mano para el uso de la familia.