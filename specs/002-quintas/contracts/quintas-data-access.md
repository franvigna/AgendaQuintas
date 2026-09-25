# Contract: Acceso a datos de Quintas

**Feature**: 002-quintas | **Date**: 2026-09-25

No hay una API HTTP propia: el frontend habla directo con Firestore vía el
SDK cliente de Firebase. El "contrato" expuesto hacia el resto de la app
(otros módulos como Reservas) es la interfaz TypeScript del hook `useQuintas`
y el tipo `Quinta`.

## Tipo `Quinta`

```ts
interface Quinta {
  id: string;
  nombre: string;
  capacidadBase: number;
  precioSemana: number;
  precioFinde: number;
  costoPersonaExtra: number;
  horarioInicio: string; // "HH:mm"
  horarioFin: string;    // "HH:mm"
  costoHoraExtra: number;
  porcentajeSeña: number; // 0-100
}
```

## Hook `useQuintas()`

```ts
function useQuintas(): {
  quintas: Quinta[];
  cargando: boolean;
  error: Error | null;
};
```

- **Comportamiento**: se suscribe a la colección `quintas` de Firestore vía
  `onSnapshot` al montar; se desuscribe al desmontar. Expone el array
  actualizado en tiempo real ante cualquier cambio remoto (creación, edición).
- **Consumido por**: `ConfiguracionQuintas` (para listar), y por el módulo
  Reservas (para leer la configuración vigente al calcular precio y seña
  sugerida).
- **No expone**: paginación, filtros, ni ordenamiento — se asume una lista
  completa de a lo sumo unas pocas quintas (Principio II).

## Función `guardarQuinta(id: string, datos: Partial<Omit<Quinta, "id">>): Promise<void>`

- **Comportamiento**: actualiza el documento `quintas/{id}` en Firestore con
  los campos provistos, luego de pasar la validación local descrita en
  [data-model.md](./../data-model.md).
- **Precondición**: los datos ya pasaron la validación de
  `FormularioQuinta` (números >= 0, `porcentajeSeña` en `[0,100]`,
  `horarioFin` > `horarioInicio`).
- **Postcondición**: el cambio se refleja en tiempo real en todos los
  clientes suscritos vía `useQuintas`, sin pasos adicionales (SC-003 del
  spec).
- **No implementa**: ninguna validación cruzada contra reservas existentes —
  el guardado es incondicional una vez pasada la validación local (FR-007 del
  spec: cambios de precio no están restringidos por reservas ya cargadas).

## Datos semilla

La carga inicial de los 2 documentos semilla (ver
[data-model.md](./../data-model.md#datos-semilla)) es responsabilidad de un
script o paso de setup fuera del alcance de este contrato (no hay UI de alta
de quintas, FR-008 del spec); se ejecuta una única vez al inicializar el
proyecto en Firestore.
