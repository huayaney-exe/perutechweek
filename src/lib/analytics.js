// PostHog opcional para medir el loop viral. Sin VITE_POSTHOG_KEY es un no-op total.
// posthog-js se carga desde CDN en runtime (no es dep de npm).
let ph = null
let ready = false

export async function initAnalytics() {
  const key = import.meta.env.VITE_POSTHOG_KEY
  if (!key || ready) return
  ready = true
  try {
    const mod = await import(/* @vite-ignore */ 'https://esm.sh/posthog-js@1.194.4')
    ph = mod.default || mod
    ph.init(key, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: true,
      autocapture: true,
    })
  } catch {
    ph = null // silencioso: nunca romper la app por analytics
  }
}

export function capture(event, props) {
  try {
    if (ph) ph.capture(event, props || {})
  } catch {
    /* no-op */
  }
}
