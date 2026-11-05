// Copy de compartir en español, por tipo. {url} se reemplaza con el link a Luma.
export const SHARE_COPY = {
  attendee: `🚀 Este lunes comienza Perú Tech Week 2026 (12–18 oct) y voy a estar ahí — la semana de innovación, tecnología y startups más grande del Perú. Nos vemos 👉 {url}`,
  host: `🎤 Este lunes comienza Perú Tech Week 2026 (12–18 oct, Lima) y voy a hostear un evento. Súmate 👉 {url}`,
  speaker: `🎤 Este lunes comienza Perú Tech Week 2026 (12–18 oct, Lima) y seré speaker. Súmate a la semana tech más grande del Perú 👉 {url}`,
  sponsor: `🤝 Este lunes comienza Perú Tech Week 2026 (12–18 oct, Lima) y somos aliados. Nos vemos ahí 👉 {url}`,
  ambassador: `🎟️ Este lunes comienza Perú Tech Week 2026 (12–18 oct, Lima) y soy Embajador oficial. Regístrate gratis 👉 {url}`,
  committee: `🛠️ Este lunes comienza Perú Tech Week 2026 (12–18 oct, Lima) y soy parte de la organización. Nos vemos ahí 👉 {url}`,
}

export function buildCaption(type, url) {
  const tpl = SHARE_COPY[type] || SHARE_COPY.attendee
  return tpl.replace('{url}', url)
}
