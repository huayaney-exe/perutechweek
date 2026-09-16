# Perú Tech Week 2026 · Generador de credenciales

App web (client-only) donde un asistente sube su foto, arma su badge on-brand y comparte que estará en Perú Tech Week 2026 (loop viral de reach, sin budget de ads).

- **Sin IA generativa.** Compositing determinista en Canvas 2D + background removal local (`@imgly/background-removal`, corre en el dispositivo) con fallback de máscara circular que **siempre** funciona.
- **La foto nunca sale del dispositivo.**
- **Sin backend.** Estático, desplegable en Vercel.

## Correr local
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
npm run preview  # sirve el build
```

## Deploy en Vercel
1. Conecta este repo en Vercel (framework: **Vite**, detectado automáticamente).
2. Build command `npm run build`, output `dist` (ya en `vercel.json`).
3. Variables opcionales (Settings → Environment Variables):
   - `VITE_LUMA_URL` — destino del CTA (default: la agenda de PTW en Luma).
   - `VITE_POSTHOG_KEY` / `VITE_POSTHOG_HOST` — para medir el loop viral (`badge_generated`, `badge_shared`). Sin key, el tracking es no-op.

Ver `.env.example`.

## Cómo funciona
- Inputs: nombre, rol, arquetipo (Asistente / Embajador / Speaker), formato (Story 9:16 / Post 1:1).
- Jerarquía del badge: el verbo ("ESTARÉ EN") va arriba pegado a **PERÚ TECH WEEK 2026**; el nombre de la persona va solo, bajo la foto.
- Compartir: Web Share API con el PNG en móvil; Descargar + WhatsApp/LinkedIn/X + copiar texto en desktop. Todo lleva UTM a la agenda.

## Estructura
```
src/
  App.jsx              # máquina de estados de la UI
  config/              # tokens de marca, arquetipos, copy de share
  lib/
    image.js           # decode + downscale de la foto
    removeBackground.js # bg-removal local (progresivo, con fallback)
    composite.js       # dibujo del badge en canvas
    share.js           # UTM + Web Share + canales
    analytics.js       # PostHog opcional
```

Contexto de producto y arquitectura: ver `../SPEC.md`, `../ARCHITECTURE.md`, `../DESIGN-SYSTEM.md`.
