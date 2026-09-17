// Copy de compartir en español, por tipo. {url} se reemplaza con el link a Luma.
export const SHARE_COPY = {
  attendee: `🚀 Estaré en Perú Tech Week 2026 (12–18 oct) — la semana de innovación, tecnología y startups más grande del Perú. Nos vemos ahí 👉 {url}`,
  host: `🎤 Voy a hostear un evento en Perú Tech Week 2026 (12–18 oct, Lima). Súmate 👉 {url}`,
  speaker: `🎤 Seré speaker en Perú Tech Week 2026 (12–18 oct, Lima). Súmate a la semana tech más grande del Perú 👉 {url}`,
  sponsor: `🤝 Somos aliados de Perú Tech Week 2026 (12–18 oct, Lima). Nos vemos ahí 👉 {url}`,
  ambassador: `🎟️ Soy Embajador oficial de Perú Tech Week 2026. Del 12 al 18 de octubre en Lima. Regístrate gratis 👉 {url}`,
}

export function buildCaption(type, url) {
  const tpl = SHARE_COPY[type] || SHARE_COPY.attendee
  return tpl.replace('{url}', url)
}
