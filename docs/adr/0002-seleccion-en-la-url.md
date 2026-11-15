# ADR 0002 · La URL es la fuente de verdad de la selección

- **Estado:** aceptada
- **Fecha:** 2026-11-15

## Contexto

En móvil, el master-detail se convierte en dos pantallas. Si la selección viviera solo en un
`useState`, el gesto "atrás" del sistema operativo sacaría al usuario de la aplicación en lugar de
volver a la lista, un perfil no se podría compartir y recargar la página perdería el contexto.

## Decisión

- El usuario seleccionado se guarda en el query param `?user=<id>`.
- Se lee con `useSyncExternalStore` sobre `window.location` (snapshot de servidor `null`, sin
  desajustes de hidratación) y se escribe con la **History API nativa** (`pushState`), que Next.js 16
  integra con su router.
- Se descartó `useSearchParams` + `router.push`: con `cacheComponents` obliga a un límite de
  `Suspense` adicional y acopla los componentes al router (más mocks en los tests) sin aportar nada
  aquí.

## Consecuencias

- ✅ Enlaces directos (`/?user=3`), recarga sin pérdida de contexto y botón/gesto atrás que recorre
  las selecciones, idéntico en escritorio y móvil.
- ✅ El hook es testeable en jsdom sin mocks de `next/navigation`.
- ⚠️ Cada selección crea una entrada de historial (comportamiento de "navegación", como en un
  cliente de correo). Si se quisiera lo contrario en escritorio, bastaría con `replaceState`.
