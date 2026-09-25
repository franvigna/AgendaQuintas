# Contract: Interfaces del módulo Acceso

**Feature**: 001-acceso | **Date**: 2026-09-25

Sin API HTTP propia. El contrato expuesto hacia el resto de la app es la
interfaz del hook `useSesion` y el componente `Gate`, que envuelven cualquier
otra pantalla (Calendario, Clientes, Configuración, etc.).

## Hook `useSesion()`

```ts
function useSesion(): {
  autenticado: boolean;
  ingresar: (pin: string) => boolean; // true si el PIN es correcto
  cerrarSesion: () => void;
};
```

- **`autenticado`**: refleja el estado actual leído de `localStorage` al
  montar (más los cambios aplicados por `ingresar`/`cerrarSesion` durante la
  sesión de la app).
- **`ingresar(pin)`**: compara `pin` contra `import.meta.env.VITE_APP_PIN`.
  Si coincide, escribe el flag en `localStorage` y devuelve `true`. Si no
  coincide, no escribe nada y devuelve `false` (permite reintento sin límite,
  FR-004).
- **`cerrarSesion()`**: elimina el flag de `localStorage`. No interactúa con
  Firebase Auth (la sesión anónima de Firebase permanece activa; ver
  research.md).

## Componente `Gate` (envoltorio / "ProtectedRoute")

```ts
interface GateProps {
  children: React.ReactNode;
}

function Gate(props: GateProps): JSX.Element;
```

- **Comportamiento**: usa `useSesion()` internamente. Si `autenticado` es
  `false`, renderiza `PantallaLogin` en lugar de `children`. Si es `true`,
  renderiza `children` (el resto de la app, incluyendo la vista de Calendario
  como pantalla inicial, FR-003).
- **Precondición externa**: `signInAnonymously()` ya fue invocado al cargar
  la app (independientemente del estado de `autenticado`), de forma que
  cualquier operación de Firestore que dispare `children` ya tiene
  `request.auth != null` satisfecho.

## Componente `PantallaLogin`

```ts
interface PantallaLoginProps {
  onIngresar: (pin: string) => boolean;
}

function PantallaLogin(props: PantallaLoginProps): JSX.Element;
```

- **Comportamiento**: renderiza un único campo de texto (tipo password o
  numérico según el formato del PIN) y un botón de confirmar. Al confirmar,
  invoca `onIngresar(pin)`; si devuelve `false`, muestra un mensaje de error
  simple y permite reintentar sin límite (FR-004). Si devuelve `true`, el
  componente padre (`Gate`) se encarga de dejar de renderizar `PantallaLogin`.

## Firestore Security Rules (fragmento relevante)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

- Aplica a todas las colecciones del proyecto (`quintas`, `clientes`,
  `reservas`, `visitas`), sin diferenciación por rol o UID (Principio VIII:
  sin roles ni permisos diferenciados).
