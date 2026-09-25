# Data Model: Acceso

**Feature**: 001-acceso | **Date**: 2026-09-25

Este módulo no persiste datos de negocio en Firestore. El único "dato" es
estado local por dispositivo, más una credencial embebida en tiempo de
build.

## Entidad: Sesión (estado local, no persistido en Firestore)

Corresponde a la entidad conceptual "Sesión" del [spec.md](./spec.md).

| Campo | Tipo | Almacenamiento | Notas |
|---|---|---|---|
| `autenticado` | `boolean` | `localStorage`, clave `"quintaSerrano.autenticado"`, valor `"true"` cuando existe | Ausencia de la clave equivale a `false` (no autenticado) |

### Validaciones

- No aplica validación de esquema: es un flag booleano simple.

### Transiciones

```text
[sin flag] --(PIN correcto)--> [flag = "true"]
[flag = "true"] --(usuario cierra sesión)--> [sin flag]
```

- No hay transición automática por expiración (FR-005 del spec).
- El cambio de PIN (`VITE_APP_PIN`) en un nuevo build no invalida sesiones
  activas existentes en `localStorage` (Edge Case del spec: "no hay
  invalidación remota de sesiones").

## Credencial: PIN de acceso

| Campo | Tipo | Almacenamiento | Notas |
|---|---|---|---|
| `VITE_APP_PIN` | `string` | Variable de entorno embebida en el build de Vite | Configurada manualmente por el desarrollador (Cisco); no editable desde la UI ni almacenada en Firestore |

## Sesión de Firebase Auth (infraestructura, no dato de negocio)

Firebase Auth mantiene su propia sesión anónima (`signInAnonymously`),
gestionada internamente por el SDK. No se modela como entidad de negocio:
es una precondición técnica para que las reglas de Firestore
(`request.auth != null`) acepten operaciones de lectura/escritura del resto
de los módulos. No tiene relación con el flag `autenticado` de
`localStorage`: ambos coexisten de forma independiente.

## Relaciones

Este módulo no tiene relaciones con otras entidades de negocio (Quinta,
Cliente, Reserva, Visita); es un gate transversal que envuelve el acceso a
toda la aplicación.
