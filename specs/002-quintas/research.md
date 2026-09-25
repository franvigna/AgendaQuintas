# Research: Quintas

**Feature**: 002-quintas | **Date**: 2026-09-25

Todos los aspectos del Technical Context vinieron especificados explícitamente
por el usuario (stack, storage, hosting, constraints), por lo que no quedaron
marcadores `NEEDS CLARIFICATION`. Esta investigación se limita a confirmar
decisiones de implementación concretas dentro de ese stack ya definido.

## Decisión: Identificador de documento en Firestore

**Decision**: Los documentos de la colección `quintas` usan id autogenerado
por Firestore (`addDoc`/`doc()` sin id explícito), no un slug legible como
`"quinta-serrano-1"`.

**Rationale**: El campo `nombre` ya identifica la quinta para la UI; usar un
id autogenerado evita acoplar la clave primaria a un texto que podría
editarse (FR-003 permite editar `nombre`). Consistente con el Principio II
(Simplicidad): no hay necesidad de una clave de negocio legible dado que solo
existen 2-3 quintas y siempre se listan por nombre, nunca se referencian por
id en una URL o input manual.

**Alternatives considered**: Slug basado en nombre (ej. `quinta-serrano-1`) —
descartado porque el nombre es editable (FR-003) y mantener el id
sincronizado con un nombre editable agrega complejidad sin beneficio real
para 2 documentos.

## Decisión: Suscripción en tiempo real con `onSnapshot`

**Decision**: `useQuintas()` se suscribe a la colección completa con
`onSnapshot(collection(db, "quintas"), ...)`, sin paginación ni filtros, y
expone el array de quintas mapeado a la interfaz `Quinta` tipada.

**Rationale**: Cumple el Principio III (Sincronización en Tiempo Real): un
cambio de precio hecho por un usuario debe reflejarse de inmediato en los
otros dispositivos, incluyendo en el cálculo de nuevas reservas (SC-003 del
spec). Con solo 2 documentos no hay necesidad de paginación ni de queries
complejas — traer toda la colección es la opción más simple (Principio II).

**Alternatives considered**: Fetch único (`getDocs`) sin suscripción en
tiempo real — descartado porque violaría el Principio III y SC-003 del spec
(los cambios deben estar disponibles "de inmediato... sin pasos adicionales
de sincronización manual").

## Decisión: Validación de formulario

**Decision**: Validación síncrona en el propio componente `FormularioQuinta`
antes de invocar la escritura a Firestore (sin librería de validación de
esquemas adicional), verificando: campos numéricos >= 0, `porcentajeSeña`
entre 0 y 100, y `horarioFin` posterior a `horarioInicio`.

**Rationale**: Reglas de validación simples y locales (FR-004, FR-004a,
FR-005 del spec); no justifica agregar una dependencia de validación de
esquemas (ej. Zod) solo para 5-6 reglas de un formulario chico, consistente
con el Principio II. TypeScript estricto (Principio IV) ya tipa la forma de
los datos; la validación de rango/orden es lógica de negocio puntual, no de
tipos.

**Alternatives considered**: Librería de validación de esquemas (Zod/Yup) —
evaluada y descartada por ahora; se puede reconsiderar si más módulos
necesitan validación de formularios similares y se justifica la dependencia
compartida.

## Resumen

No quedan unknowns pendientes. Todas las decisiones de esta fase son de bajo
riesgo y reversibles sin impacto estructural.
