# ADR 0001 · Arquitectura por features con fronteras verificadas

- **Estado:** aceptada
- **Fecha:** 2026-11-15

## Contexto

La aplicación tiene dos dominios claros (usuarios y publicaciones) y una vista que los compone (el
master-detail). Organizar el código por tipo técnico (`components/`, `hooks/`, `services/`, `types/`
globales) dispersa cada dominio por todo el árbol: tocar "publicaciones" obliga a editar cinco
carpetas y nada impide que un componente de usuarios dependa de los internos de publicaciones.

## Decisión

- Cada dominio vive en `src/features/<feature>/` y contiene sus propias capas: `types.ts`,
  `schemas.ts`, `services/`, `hooks/` y `components/`.
- Cada feature expone una **API pública** en `index.ts`. Fuera del feature solo se importa desde
  `@/features/<feature>`.
- `src/features/studio/` es la **raíz de composición**: es el único lugar que conoce a la vez
  `users` y `posts`. Las features no se importan entre sí.
- El código transversal vive en capas compartidas (`components/ui`, `components/feedback`, `hooks/`,
  `lib/`, `services/`), que **nunca** dependen de una feature.
- Ambas reglas se **hacen cumplir con ESLint** (`no-restricted-imports`), no por convención.

## Consecuencias

- ✅ Borrar o reescribir una feature es local; el radio de impacto de un cambio es predecible.
- ✅ Las violaciones de arquitectura fallan en el editor y en CI, no en una code review.
- ⚠️ Los `index.ts` (barrels) pueden degradar el tree-shaking en apps grandes; aquí cada barrel
  reexporta pocas piezas y todas se usan. Si creciera, se pasaría a entry points más finos.
- ⚠️ El enunciado sugería `src/types`, `src/services`, `src/hooks` y `src/lib/schemas.ts` globales:
  esas capas siguen existiendo, pero **dentro de cada feature** (y en `src/services` y `src/hooks`
  para la infraestructura compartida).
