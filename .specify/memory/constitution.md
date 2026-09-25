<!--
Sync Impact Report
Version change: (initial template) → 1.0.0
Modified principles: N/A (initial ratification)
Added sections:
  - Core Principles: I. Mobile-First Siempre, II. Simplicidad Ante Todo,
    III. Sincronización en Tiempo Real, IV. TypeScript Estricto,
    V. Estructura de Carpetas Minimalista, VI. Estilos Separados por Componente,
    VII. Especificación Atómica por Módulo, VIII. Acceso por Clave Compartida
  - Estándares de Calidad
  - Estrategia de Pruebas
  - Governance
Removed sections: N/A
Follow-up TODOs:
  - TODO(RATIFICATION_DATE): fecha de ratificación original no provista por el usuario;
    se usa la fecha de creación de este documento como valor por defecto.
-->

# Quinta Serrano Constitution

## Core Principles

### I. Mobile-First Siempre
Toda pantalla y flujo se diseña, construye y prueba primero para celular. El uso en
desktop no es un objetivo de este proyecto; layouts, tamaños de touch target y
navegación deben optimizarse para viewport móvil antes que para pantallas grandes.
**Rationale**: los 3 usuarios (suegro, suegra, novia) van a consultar y cargar
reservas mayormente desde el celular, en el día a día y fuera de una computadora.

### II. Simplicidad Ante Todo
Es una app familiar de uso interno para 3 usuarios conocidos, no un producto
comercial. Se debe preferir siempre la solución más simple que resuelva el
problema concreto. Queda prohibido introducir roles de usuario, multi-tenancy,
o cualquier arquitectura pensada para escalar a miles de usuarios.
**Rationale**: over-engineering para una audiencia de 3 personas agrega costo de
mantenimiento sin ningún beneficio real; la simplicidad es lo que hace sostenible
el proyecto para un desarrollador part-time.

### III. Sincronización en Tiempo Real
Los 3 usuarios deben ver los mismos datos actualizados al instante entre
dispositivos. Queda descartada cualquier solución de almacenamiento puramente
local (ej. JSON local, localStorage como fuente de verdad) como store principal
de datos.
**Rationale**: el propósito central de la app es reemplazar un almanaque en
papel compartido; si los datos no sincronizan en tiempo real entre dispositivos,
se reintroduce el mismo problema de coordinación que la app busca resolver.

### IV. TypeScript Estricto
Todo el frontend (React + Vite) se escribe en TypeScript con modo estricto
habilitado. El uso de `any` está prohibido salvo excepción explícitamente
justificada con comentario en el código.
**Rationale**: tipado estricto previene errores de datos (fechas, IDs, montos)
en una app donde los datos representan compromisos reales de reservas y dinero.

### V. Estructura de Carpetas Minimalista
No se crean carpetas nuevas salvo que sean estrictamente necesarias para
organizar el código existente. Se evita anticipar estructura para funcionalidad
que todavía no existe.
**Rationale**: mantiene el proyecto navegable para un equipo de un solo
desarrollador, evitando indirección innecesaria.

### VI. Estilos Separados por Componente
Los estilos se escriben en archivos CSS separados por componente. Queda
prohibido el uso de estilos inline (`style={{...}}`) salvo casos dinámicos que
no puedan expresarse en CSS estático.
**Rationale**: mantiene consistencia visual y facilita ajustes de diseño
mobile-first sin mezclar lógica de presentación con lógica de componente.

### VII. Especificación Atómica por Módulo
Cada módulo del sistema (Quintas, Clientes, Reservas, Visitas, Agenda, Acceso)
se especifica, planifica e implementa de forma atómica y trazable, con su
propio `spec.md` generado vía el flujo de Spec Kit (`/speckit-specify`).
**Rationale**: permite avanzar el proyecto en incrementos verificables y
mantener trazabilidad entre requisito, plan e implementación por módulo.

### VIII. Acceso por Clave Compartida
No se implementa autenticación tradicional con registro de usuario y
contraseña individual. El acceso a la app se controla mediante una clave/PIN
compartida, configurada manualmente por el administrador del sistema.
**Rationale**: consistente con el Principio II (Simplicidad); no hay necesidad
de gestión de identidades individuales para 3 usuarios de confianza dentro de
una misma familia.

## Estándares de Calidad

- Componentes de React deben ser funcionales y usar hooks; no se permiten
  componentes de clase.
- Nombres de variables, funciones y tipos que representen conceptos de dominio
  (quinta, reserva, seña, visita, cliente) se escriben en español. Términos
  técnicos genéricos (handler, request, response, state, props) se escriben en
  inglés.
- Cada función y cada componente debe tener una responsabilidad clara y
  acotada; si un componente crece para cubrir múltiples responsabilidades, debe
  dividirse.

## Estrategia de Pruebas

Para esta primera versión (MVP), la estrategia de pruebas prioriza checklists
de pruebas manuales guiadas sobre cobertura automatizada exhaustiva, dado que
es una app pequeña para 3 usuarios conocidos. No es objetivo del MVP alcanzar
cobertura de tests automatizados exhaustiva. Cada módulo debe incluir, como
mínimo, un checklist de verificación manual de sus flujos principales antes de
darse por completado.

## Governance

Esta constitución prevalece sobre cualquier otra práctica o convención
implícita del proyecto. Toda decisión de diseño o implementación que entre en
conflicto con un principio aquí definido debe justificarse explícitamente o
debe primero enmendarse este documento.

**Procedimiento de enmienda**: cualquier cambio a esta constitución se propone
como una actualización de este archivo vía `/speckit-constitution`, indicando
qué principio o sección cambia y por qué. El cambio se ratifica al guardarse
el archivo actualizado.

**Política de versionado**: esta constitución usa versionado semántico
(MAJOR.MINOR.PATCH):
- MAJOR: eliminación o redefinición incompatible de un principio existente.
- MINOR: adición de un nuevo principio o sección, o expansión material de
  guía existente.
- PATCH: aclaraciones, correcciones de redacción, cambios no semánticos.

**Revisión de cumplimiento**: cada módulo especificado vía `/speckit-specify`
y planificado vía `/speckit-plan` debe verificar alineación con estos
principios antes de pasar a `/speckit-implement`. Cualquier complejidad
introducida que aparente violar el Principio II (Simplicidad) debe
justificarse explícitamente en el plan correspondiente.

**Version**: 1.0.0 | **Ratified**: 2026-09-25 | **Last Amended**: 2026-09-25
