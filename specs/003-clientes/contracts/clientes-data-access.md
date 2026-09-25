# Contract: Acceso a datos de Clientes

**Feature**: 003-clientes | **Date**: 2026-09-25

Sin API HTTP propia; el frontend habla directo con Firestore. El contrato
hacia el resto de la app (en particular, el módulo Reservas) es la interfaz
de `useClientes`, `useReservasPorCliente`, el tipo `Cliente`, y el
componente compartido `BuscadorClientes`.

## Tipo `Cliente`

```ts
interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  fechaAlta: Timestamp; // Firestore Timestamp
}
```

## Hook `useClientes()`

```ts
function useClientes(): {
  clientes: Cliente[];
  cargando: boolean;
  error: Error | null;
};
```

- **Comportamiento**: se suscribe a toda la colección `clientes` vía
  `onSnapshot`. Expone el array actualizado en tiempo real.
- **Consumido por**: `ListaClientes`, `BuscadorClientes`.

## Hook `useReservasPorCliente(clienteId)`

```ts
function useReservasPorCliente(clienteId: string): {
  reservas: Reserva[];          // tipo definido por el módulo Reservas
  cantidadUtilizadas: number;   // derivado: reservas.filter(r => getEstadoVisual(r) === "utilizada").length
  cargando: boolean;
  error: Error | null;
};
```

- **Comportamiento**: se suscribe vía `onSnapshot` a
  `query(collection(db, "reservas"), where("clienteId", "==", clienteId))`.
  No escribe en `reservas`; es de solo lectura desde este módulo.
- **Importante**: el campo `estado` persistido en Firestore (módulo
  Reservas) solo toma los valores `"pendiente_seña"` o `"señada"`; el valor
  `"utilizada"` **nunca** se persiste, se deriva en el cliente mediante
  `getEstadoVisual(reserva)` (definida en `004-reservas`, ver su
  `research.md`). Por lo tanto, `cantidadUtilizadas` se calcula aplicando
  `getEstadoVisual()` sobre cada reserva ya sincronizada, **no** mediante un
  filtro `where("estado", "==", "utilizada")` en la query — esa query nunca
  devolvería resultados.
- **Consumido por**: `DetalleCliente` (historial completo) y `ListaClientes`
  (para el conteo `cantidadUtilizadas` de cada cliente listado).

## Función `crearCliente(datos: { nombre: string; telefono: string }): Promise<string>`

- **Comportamiento**: crea un nuevo documento en `clientes` con `fechaAlta`
  asignada por el servidor (`serverTimestamp()`), y devuelve el `id` generado.
- **Precondición**: ninguna validación de unicidad de teléfono (FR-008,
  confirmado); se puede invocar aunque ya exista otro cliente con el mismo
  teléfono.
- **Invocado por**: el módulo Reservas, a través de `BuscadorClientes`,
  cuando el administrador decide crear un cliente nuevo en vez de elegir una
  coincidencia existente.

## Componente `BuscadorClientes` (compartido con el módulo Reservas)

```ts
interface BuscadorClientesProps {
  onSeleccionar: (cliente: Cliente) => void;
  onCrearNuevo: (datos: { nombre: string; telefono: string }) => void;
}

function BuscadorClientes(props: BuscadorClientesProps): JSX.Element;
```

- **Comportamiento**: renderiza un input de búsqueda; filtra en memoria la
  lista de `useClientes()` por coincidencia parcial (insensible a
  mayúsculas) de `nombre` o `telefono`; muestra los resultados como opciones
  seleccionables. Si el administrador no selecciona ninguna coincidencia y
  en cambio completa nombre/teléfono nuevos, expone una acción para invocar
  `onCrearNuevo`.
- **No implementa**: ninguna llamada a Firestore para crear el cliente
  directamente — delega la creación real al llamador (vía `onCrearNuevo`),
  manteniendo el componente desacoplado de si se usa desde `ListaClientes`
  (donde no aplica creación) o desde el formulario de Reservas (donde sí).
