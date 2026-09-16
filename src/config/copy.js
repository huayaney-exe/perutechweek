// Copy de compartir en español, por arquetipo. {url} se reemplaza con el link UTM a Luma.
export const SHARE_COPY = {
  asistente: `🚀 Estaré en Perú Tech Week 2026 (12–18 oct) — la semana de innovación, tecnología y startups más grande del Perú. Nos vemos ahí 👉 {url}`,
  embajador: `🎟️ Soy Embajador oficial de Perú Tech Week 2026. Del 12 al 18 de octubre en Lima. Regístrate gratis 👉 {url}`,
  speaker: `🎤 Seré speaker en Perú Tech Week 2026 (12–18 oct, Lima). Súmate a la semana tech más grande del Perú 👉 {url}`,
}

export function buildCaption(archetype, url) {
  const tpl = SHARE_COPY[archetype] || SHARE_COPY.asistente
  return tpl.replace('{url}', url)
}
