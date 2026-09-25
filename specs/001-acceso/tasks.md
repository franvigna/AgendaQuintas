---

description: "Task list template for feature implementation"
---

# Tasks: Acceso

**Input**: Design documents from `/specs/001-acceso/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No se solicitaron tests automatizados explícitamente (Estrategia de Pruebas de la constitución: checklists manuales para el MVP). No se generan tareas de test; la validación se hace contra `quickstart.md`.

**Organization**: Tareas agrupadas por user story (spec.md).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- **[Story]**: A qué user story pertenece (US1, US2, US3)

## Path Conventions

Single project (frontend-only), rutas bajo `src/` en la raíz del repositorio, según `plan.md`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Estructura de archivos propia de este módulo y configuración de Firebase Auth.

- [ ] T001 Crear la carpeta `src/components/acceso/` y archivos vacíos `PantallaLogin.tsx`, `PantallaLogin.css`, `Gate.tsx`
- [ ] T002 [P] Verificar que `src/services/firebase.ts` inicialice el SDK de Firebase Auth (además de Firestore, ya existente desde el módulo Quintas); si Auth no está inicializado, agregarlo en ese mismo archivo compartido
- [ ] T003 [P] Configurar la variable de entorno `VITE_APP_PIN` en `.env.local` (desarrollo) y documentar que debe configurarse también en el entorno de hosting (Vercel/Netlify) para producción
- [ ] T004 Habilitar el método de autenticación "Anonymous" en la consola de Firebase Authentication del proyecto (paso de configuración externa, no de código)

**Checkpoint**: estructura de archivos y configuración de Firebase Auth listas.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Hook de sesión, componente de gate, y reglas de seguridad de Firestore que todas las user stories necesitan.

**⚠️ CRITICAL**: no iniciar trabajo de ninguna user story hasta completar esta fase.

- [ ] T005 Implementar `useSesion()` en `src/hooks/useSesion.ts`: al montar, lee `localStorage` bajo la clave `"quintaSerrano.autenticado"` (valor `"true"` = sesión activa, ausencia = no autenticado, según `data-model.md`); expone `{ autenticado: boolean, ingresar: (pin: string) => boolean, cerrarSesion: () => void }`
- [ ] T006 Implementar en `useSesion()` la función `ingresar(pin)`: compara `pin` contra `import.meta.env.VITE_APP_PIN` con `===`; si coincide, escribe `"true"` en la clave `"quintaSerrano.autenticado"` de `localStorage` y devuelve `true`; si no coincide, no escribe nada y devuelve `false` (FR-002, FR-004)
- [ ] T007 Implementar en `useSesion()` la función `cerrarSesion()`: elimina la clave `"quintaSerrano.autenticado"` de `localStorage`; no debe interactuar con Firebase Auth (la sesión anónima de Firebase permanece activa, según `research.md`) (FR-007)
- [ ] T008 Implementar, en el punto de entrada de la app (ej. `src/main.tsx` o `App.tsx`), la llamada a `signInAnonymously()` de Firebase Auth al cargar la app, en segundo plano y de forma transparente, independientemente del estado de `autenticado` en `localStorage`
- [ ] T009 Escribir las Firestore Security Rules del proyecto (`firestore.rules`): `allow read, write: if request.auth != null;` aplicado a todas las colecciones (`quintas`, `clientes`, `reservas`, `visitas`), sin diferenciación por rol o UID, según el fragmento de `contracts/acceso-interfaces.md`; desplegar las reglas al proyecto de Firebase

**Checkpoint**: sesión local, autenticación anónima y reglas de seguridad de Firestore listas — las user stories pueden empezar.

---

## Phase 3: User Story 1 - Ingresar con clave compartida (Priority: P1) 🎯 MVP

**Goal**: Permitir que un usuario de la familia ingrese a la app con la clave compartida y acceda directamente a la vista de Calendario, sin volver a pasar por el login en aperturas posteriores del mismo dispositivo.

**Independent Test**: Abrir la app sin sesión activa, ingresar la clave correcta, y verificar que se llega a la vista de Calendario (quickstart.md, Escenario 1).

### Implementation for User Story 1

- [ ] T010 [US1] Implementar `PantallaLogin` en `src/components/acceso/PantallaLogin.tsx` (+ `.css`): renderiza un único campo de clave y un botón de confirmar; recibe `onIngresar: (pin: string) => boolean` como prop (FR-001)
- [ ] T011 [US1] Implementar `Gate` en `src/components/acceso/Gate.tsx`: usa `useSesion()` (T005-T007) internamente; si `autenticado` es `false`, renderiza `PantallaLogin`; si es `true`, renderiza `children` (el resto de la app) (FR-003)
- [ ] T012 [US1] Envolver el punto de entrada de la app con `Gate`, de forma que cualquier pantalla (incluida la vista de Calendario del módulo Agenda) quede protegida detrás del gate de PIN
- [ ] T013 [US1] Verificar que, al confirmar `PantallaLogin` con la clave correcta, `Gate` deje de renderizar `PantallaLogin` y muestre directamente la vista de Calendario, sin pasos intermedios (FR-003, SC-001)
- [ ] T014 [US1] Verificar que, con una sesión ya activa en `localStorage`, al recargar o reabrir la app, `Gate` renderice directamente `children` sin mostrar `PantallaLogin` (SC-003)

**Checkpoint**: User Story 1 completamente funcional — ingreso con clave correcta y persistencia de sesión entre aperturas, de forma independiente.

---

## Phase 4: User Story 2 - Reintentar tras clave incorrecta (Priority: P2)

**Goal**: Mostrar un mensaje de error claro ante una clave incorrecta o vacía, permitiendo reintentar sin límite de intentos.

**Independent Test**: Ingresar una clave incorrecta y verificar el mensaje de error y la posibilidad de reintentar (quickstart.md, Escenario 2).

### Implementation for User Story 2

- [ ] T015 [US2] Agregar en `PantallaLogin` (T010) la validación de que el campo de clave no esté vacío antes de invocar `onIngresar`; si está vacío, tratarlo como intento inválido mostrando el mismo mensaje de error que una clave incorrecta, sin invocar `onIngresar` con un valor vacío (FR-004, Edge Case del spec)
- [ ] T016 [US2] Agregar en `PantallaLogin` el mensaje de error simple que se muestra cuando `onIngresar(pin)` devuelve `false`, permitiendo modificar el campo y reintentar de inmediato sin ningún límite de intentos ni bloqueo temporal (FR-004, SC-002)

**Checkpoint**: User Stories 1 y 2 funcionan juntas — login exitoso y manejo de error, de forma independiente.

---

## Phase 5: User Story 3 - Cerrar sesión manualmente (Priority: P3)

**Goal**: Permitir que el usuario cierre su sesión manualmente desde dentro de la app, volviendo a requerir la clave en el siguiente acceso desde ese dispositivo.

**Independent Test**: Con una sesión activa, cerrar sesión, y verificar que la siguiente apertura de la app vuelve a pedir la clave (quickstart.md, Escenario 3).

### Implementation for User Story 3

- [ ] T017 [US3] Agregar una opción de "Cerrar sesión" en algún punto de la navegación general de la app (fuera del alcance visual de este módulo definir dónde exactamente, pero debe estar accesible desde dentro de `children`, ya autenticado), conectada a `cerrarSesion()` (T007)
- [ ] T018 [US3] Verificar que, tras invocar `cerrarSesion()`, `Gate` vuelva a renderizar `PantallaLogin` inmediatamente (sin necesidad de recargar la página) y que una recarga posterior siga mostrando `PantallaLogin` (FR-007, SC-003 en su caso inverso)

**Checkpoint**: Las 3 user stories funcionan de forma independiente y en conjunto — módulo Acceso completo.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validación final y ejecución de la guía de quickstart.

- [ ] T019 Ejecutar manualmente los 4 escenarios de `quickstart.md` de punta a punta (incluyendo el Escenario 4 de verificación de `signInAnonymously()` y ausencia de errores `PERMISSION_DENIED` en Firestore) y registrar el resultado en un checklist de verificación del módulo
- [ ] T020 [P] Revisar que ningún componente de este módulo use estilos inline (`style={{...}}`), consistente con el Principio VI de la constitución
- [ ] T021 [P] Revisar que no haya ningún uso de `any` en los archivos de este módulo (Principio IV: TypeScript estricto)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias, puede iniciar de inmediato
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA todas las user stories
- **User Stories (Phase 3-5)**: dependen de completar Foundational
  - US1 es prerequisito estructural de US2 y US3: `PantallaLogin` (T010) y `Gate` (T011) deben existir antes de agregarles el manejo de error (US2) o la opción de cerrar sesión (US3)
  - US2 y US3 no dependen entre sí
- **Polish (Phase 6)**: depende de que las user stories deseadas estén completas

### User Story Dependencies

- **US1 (P1)**: puede iniciar apenas termine Foundational; sin dependencia de otras historias
- **US2 (P2)**: depende de que `PantallaLogin` ya exista (T010, de US1) para agregarle el manejo de error
- **US3 (P3)**: depende de que `cerrarSesion()` ya exista (T007, Foundational) y de que `Gate` ya esté envolviendo la app (T012, de US1)

### Within Each User Story

- Componente base (`PantallaLogin`, `Gate`) antes de agregarle comportamiento adicional (validación de error, opción de cerrar sesión)

### Parallel Opportunities

- T002 y T003 (Setup) en paralelo
- T020 y T021 (Polish) en paralelo
- Foundational (T005-T009) tiene dependencias secuenciales dentro de `useSesion` (T005 antes que T006/T007 al ser el mismo archivo), pero T009 (Firestore Security Rules) es independiente y puede hacerse en paralelo con T005-T008

---

## Parallel Example: Setup Phase

```bash
# Lanzar en paralelo:
Task: "Verificar/agregar inicialización de Firebase Auth en src/services/firebase.ts"
Task: "Configurar VITE_APP_PIN en .env.local"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (bloqueante)
3. Completar Phase 3: User Story 1 (login con clave correcta + persistencia de sesión)
4. **DETENER y VALIDAR**: ejecutar Escenario 1 de quickstart.md
5. Este es el MVP funcional: cualquier usuario con la clave correcta puede entrar y quedar logueado

### Incremental Delivery

1. Setup + Foundational → sesión anónima de Firebase y reglas de seguridad listas
2. US1 → probar independientemente (login exitoso) → demo (MVP)
3. US2 → probar independientemente (manejo de error) → demo
4. US3 → probar independientemente (cerrar sesión) → demo
5. Cada historia agrega valor sin romper las anteriores

---

## Notes

- [P] = archivos distintos, sin dependencias entre sí
- Cada flujo funcional (login exitoso, manejo de error, cierre de sesión)
  quedó en tareas separadas y verificables dentro de su propia user story
- Sin tareas de test automatizado: se valida contra `quickstart.md`
  (Estrategia de Pruebas de la constitución)
- **MVP sugerido**: User Story 1 (P1) — login con clave compartida y
  persistencia de sesión. User Story 2 (P2, manejo de error) y User Story 3
  (P3, cerrar sesión) quedan como incrementos posteriores, cada uno
  independientemente entregable.
