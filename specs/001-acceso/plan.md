# Implementation Plan: Acceso

**Branch**: `001-acceso` | **Date**: 2026-09-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-acceso/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Gate de acceso a nivel de aplicación mediante un PIN compartido, sin
autenticación tradicional de usuario/contraseña. Técnicamente se combina con
Firebase Anonymous Auth (`signInAnonymously()`) para satisfacer las reglas de
seguridad de Firestore (`request.auth != null`), pero esto es un detalle de
infraestructura invisible para el usuario: desde la perspectiva de negocio
sigue siendo "una clave compartida, sin registro ni identidad individual"
(Principio VIII). El PIN correcto se compara en el cliente contra un valor
embebido en el build (`VITE_APP_PIN`), no contra Firestore. El estado de
sesión se persiste en `localStorage` mediante un flag simple, sin expiración
automática (FR-005 del spec).

## Technical Context

**Language/Version**: TypeScript (modo estricto) sobre React 18

**Primary Dependencies**: React 18, Vite, Firebase SDK (Auth — método
anónimo; Firestore para el resto de la app)

**Storage**: `localStorage` del navegador para el flag de sesión
("autenticado"); no se persiste el PIN en ningún lado más que la variable de
entorno de build (`VITE_APP_PIN`)

**Testing**: Checklist de pruebas manuales guiadas (Estrategia de Pruebas de
la constitución)

**Target Platform**: Navegador móvil (mobile-first); mismo build que el resto
de la app, desplegado en Vercel o Netlify

**Project Type**: Web application (frontend-only; Firebase Auth como
servicio administrado)

**Performance Goals**: Ingreso a la vista de Calendario en menos de 10
segundos desde que se abre la app con la clave correcta (SC-001 del spec)

**Constraints**: Sin autenticación tradicional ni pantalla de registro
(Principio VIII); mobile-first (Principio I); simplicidad — sin roles ni
permisos diferenciados (Principio II); TypeScript estricto (Principio IV)

**Scale/Scope**: 3 usuarios, 1 PIN compartido, 1 flag de sesión por
dispositivo; sin límite de dispositivos ni sesiones simultáneas (spec,
Assumptions)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Mobile-First Siempre | PASS — `PantallaLogin` es un formulario de un solo campo, dimensionado para touch, sin layout de desktop. |
| II. Simplicidad Ante Todo | PASS — sin roles, sin gestión de identidades individuales; el gate es un flag booleano en `localStorage`. |
| III. Sincronización en Tiempo Real | N/A para este módulo — el estado de sesión es local por dispositivo por diseño (spec, Edge Cases: "no hay invalidación remota de sesiones"); no hay dato de negocio que sincronizar aquí. |
| IV. TypeScript Estricto | PASS — tipos explícitos para el estado de sesión y las props de `PantallaLogin`/`Gate`. |
| V. Estructura de Carpetas Minimalista | PASS — se agrega una subcarpeta `acceso/` en `components/`, sin nuevas carpetas de nivel superior. |
| VI. Estilos Separados por Componente | PASS — `PantallaLogin.css` propio, sin estilos inline. |
| VII. Especificación Atómica por Módulo | PASS — corresponde 1:1 al spec `001-acceso`. |
| VIII. Acceso por Clave Compartida | **PASS con nota** — el uso de Firebase Anonymous Auth internamente NO introduce autenticación tradicional (no hay registro, no hay usuario/contraseña individual, no hay pantalla de "olvidé mi clave"); es una pieza de infraestructura necesaria para que Firestore acepte lecturas/escrituras, completamente transparente para los 3 usuarios. Se documenta explícitamente para trazabilidad, ya que agrega una dependencia (Firebase Auth) no mencionada en el spec original. |

Sin violaciones sustantivas. La nota sobre Firebase Anonymous Auth se
documenta por transparencia, no por tratarse de una violación: el principio
prohíbe autenticación tradicional de cara al usuario, y este enfoque no la
introduce.

## Project Structure

### Documentation (this feature)

```text
specs/001-acceso/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── acceso/
│       ├── PantallaLogin.tsx
│       ├── PantallaLogin.css
│       └── Gate.tsx            # también actúa como ProtectedRoute
├── hooks/
│   └── useSesion.ts            # lee/escribe el flag de sesión en localStorage
└── services/
    └── firebase.ts             # inicialización compartida del SDK (Auth + Firestore); ya existente desde el módulo Quintas
```

**Structure Decision**: Se reutiliza `src/services/firebase.ts` ya
introducido por el módulo Quintas para inicializar el SDK de Firebase,
agregando ahí la inicialización de Auth (mismo archivo, sin duplicar
configuración). Se agrega una subcarpeta `acceso/` en `components/` y un
hook `useSesion` en `hooks/`, consistente con la convención ya establecida y
con el Principio V (sin carpetas nuevas de nivel superior).

## Complexity Tracking

*No aplica: sin violaciones de la Constitution Check.*
