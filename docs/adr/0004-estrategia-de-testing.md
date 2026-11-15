# ADR 0004 · Estrategia de testing por capas

- **Estado:** aceptada
- **Fecha:** 2026-11-15

## Contexto

Mockear módulos (`vi.mock('@/services/...')`) produce tests que pasan aunque el cliente HTTP, los
timeouts o la validación de respuestas estén rotos. Al mismo tiempo, los tests contra una API real
son lentos y no deterministas.

## Decisión

| Capa          | Herramienta                           | Qué protege                                                                                   |
| ------------- | ------------------------------------- | --------------------------------------------------------------------------------------------- |
| Unitaria      | Vitest                                | Schemas (límites exactos), avatar, búsqueda, cliente HTTP, carrera en `useAsyncResource`      |
| Integración   | Vitest + Testing Library + **MSW**    | Recorridos completos de la UI en jsdom, con la red mockeada **a nivel de red**                |
| E2E           | **Playwright** (escritorio + Pixel 7) | Recorridos críticos sobre el **build de producción**, con la API interceptada en el navegador |
| Accesibilidad | Playwright + **axe-core**             | WCAG 2.2 AA en cada estado clave, en tema claro y oscuro                                      |
| Visual        | Playwright `toHaveScreenshot`         | Regresiones de diseño (líneas base locales, fuera de git)                                     |
| Contrato      | Playwright `@live`                    | Que JSONPlaceholder siga respondiendo lo que la app espera                                    |

- Las consultas usan roles y nombres accesibles (lo que ve el usuario), nunca clases ni `data-testid`.
- Las líneas base visuales dependen del renderizado de fuentes del sistema operativo, por eso se
  generan en local (`npm run e2e:visual:update`) y no se versionan.

## Consecuencias

- ✅ Los tests ejercitan el código real de punta a punta; un cambio en el contrato de la API o en el
  manejo de errores rompe un test.
- ✅ CI corre unit + integración + E2E + accesibilidad en cada push.
- ⚠️ La regresión visual no corre en CI. Para hacerlo, las líneas base se generarían dentro de la
  imagen Docker oficial de Playwright para que coincidan con el runner de Linux.
