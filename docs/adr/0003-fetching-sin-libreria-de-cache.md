# ADR 0003 · Data fetching con un primitivo propio en lugar de TanStack Query

- **Estado:** aceptada (revisable si el alcance crece)
- **Fecha:** 2026-11-15

## Contexto

La app consume dos endpoints de lectura y uno de escritura. Los requisitos reales son: estados de
carga/error/éxito, reintento, cancelación al cambiar de usuario y **cero condiciones de carrera**
(una respuesta tardía del usuario A nunca debe pintarse sobre el usuario B).

## Decisión

- `useAsyncResource(key, load)`: un primitivo de ~60 líneas en el que el estado de carga es
  **derivado** (no hay resultado asentado para el `requestId` actual) en vez de asignado dentro del
  efecto. Cada respuesta se etiqueta con su `requestId`, así que una respuesta obsoleta es
  estructuralmente imposible de mostrar, y las peticiones en vuelo se abortan con `AbortController`.
- El cliente HTTP (`request`) normaliza todo fallo a un único `ApiError` tipado
  (`http | network | timeout | invalid-response`), aplica timeout y **valida la respuesta con Zod**.
- La creación de publicaciones es optimista con rollback (`useCreatedPosts`), con claves de cliente
  porque JSONPlaceholder responde `id: 101` a todo `POST`.

## Consecuencias

- ✅ Sin dependencias extra, comportamiento explícito y cubierto por tests (incluido un test de
  condición de carrera).
- ⚠️ No hay caché entre navegaciones, deduplicación ni revalidación en segundo plano: al volver a un
  perfil se vuelve a pedir su feed. En producción migraría a **TanStack Query**, donde
  `useAsyncResource` se sustituye casi uno a uno por `useQuery` y `useCreatedPosts` por
  `useMutation` con `onMutate`/`onError` para el optimismo.
