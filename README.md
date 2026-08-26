# MIMI AI

PWA de portafolio: asistente de IA con **coach de prompts**, plantillas, historial y analítica de 👍👎.

Stack: React 19 · Vite · Tailwind v4 · Supabase Auth (opcional) · Anthropic (streaming) · Service Worker.

No hace falta configurar nada para ver la UI: sin claves corre en **modo demo** (auth y chats en el navegador; respuestas simuladas).

## Arrancar

```bash
npm install
copy .env.example .env
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

- Cliente: Vite en `:5173`
- API: Express en `:3001` (`/api/chat` con SSE, `/api/improve-prompt`)

## Variables de entorno

Copia `.env.example` a `.env`:

| Variable | Para qué |
|---|---|
| `ANTHROPIC_API_KEY` | Streaming real y coach con Claude. Vacía = demo. |
| `VITE_SUPABASE_URL` | Auth + Postgres. Vacía = demo local. |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima de Supabase. |
| `PORT` | Puerto del API (default `3001`). |

Nunca pongas la clave de Anthropic con prefijo `VITE_`: iría al cliente.

## Supabase (auth real + historial en la nube)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Authentication → Providers: **Email** y **Google**.
3. En Google Cloud, crea credenciales OAuth y pega Client ID / Secret en Supabase.
4. Authentication → URL configuration: Redirect URLs = `http://localhost:5173/app` (y tu dominio luego).
5. SQL Editor: pega y ejecuta `supabase/schema.sql`.
6. Settings → API: copia URL y `anon` key a `.env`.

El esquema es `conversations` → `messages` (con `original_prompt` y `rating`), más `profiles` para modelo, tono, idioma y tema.

## Qué incluye

- **Login** — email/contraseña + Google (Supabase) o “entrar en demo”.
- **Chat** — burbujas, input abajo, streaming SSE.
- **Historial** — sidebar, persistencia local o Supabase.
- **Ajustes** — modelo, tono, idioma, tema claro/oscuro, coach on/off.
- **Prompt coach** — reescribe un prompt vago antes de ejecutarlo.
- **Plantillas** — Debug, resumen, brainstorm, etc.
- **Ratings + analítica** — 👍👎 por respuesta y dashboard de las últimas 50.
- **PWA** — instalable, `manifest` + service worker.

## Scripts

```bash
npm run dev          # cliente + API
npm run build        # producción (solo frontend)
npm run preview
npm run icons        # regenera pwa-192 / pwa-512
```

## Desplegar

El frontend es estático (`npm run build` → `dist`). El API de `server/index.ts` hay que subirlo a un host Node (Railway, Render, Fly) o adaptarlo a una serverless function. Apunta el proxy `/api` a esa URL.

Para autenticación en producción, añade tu dominio en Supabase Redirect URLs.
