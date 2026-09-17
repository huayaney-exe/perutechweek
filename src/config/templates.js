// Tokens del badge v2 "patrón andino" (fondo rojo). El chrome de la app sigue dark.
export const COLORS = {
  white: '#FFFFFF',
  panel: '#E4E4E4', // marco de foto (claro)
  panelIcon: '#B7B7B7', // icono/placeholder "FOTO"
  ink: '#000000', // barra negra Cargo · Empresa
  maroon: '#6E1315', // tab "Soy X" + acentos oscuros del patrón
  redField: '#E4162A', // rojo de fondo (fallback si no carga el patrón)
}

export const FONT = 'Manrope, system-ui, -apple-system, "Segoe UI", Arial, sans-serif'

export const EVENT = {
  defaultName: 'Perú Tech Week 2026',
  defaultDate: '12–18 OCT · Lima',
}

// Tipos parametrizables por URL: /attendee, /host, /speaker, /sponsor, /ambassador
// (alias: /aliado → sponsor, /asistente → attendee, /embajador → ambassador).
// Route-only: /organizador (alias /comite) → committee. No aparece en el selector.
export const TYPES = {
  attendee: { key: 'attendee', tab: 'Soy Asistente', showEvent: false, showAlly: false },
  host: { key: 'host', tab: 'Soy Host', showEvent: true, showAlly: true },
  speaker: { key: 'speaker', tab: 'Soy Speaker', showEvent: true, showAlly: false },
  sponsor: { key: 'sponsor', tab: 'Soy Aliado', showEvent: false, showAlly: false },
  ambassador: { key: 'ambassador', tab: 'Soy Embajador', showEvent: false, showAlly: false },
  committee: { key: 'committee', tab: 'Comité Organizador', showEvent: false, showAlly: false },
}
export const TYPE_ORDER = ['attendee', 'host', 'speaker', 'sponsor', 'ambassador']

export const TYPE_ALIASES = {
  asistente: 'attendee',
  aliado: 'sponsor',
  embajador: 'ambassador',
  organizador: 'committee',
  comite: 'committee',
}

// Lee el tipo desde el path (/host) o ?type=host. Default: attendee.
export function typeFromUrl() {
  if (typeof window === 'undefined') return 'attendee'
  const q = new URLSearchParams(window.location.search).get('type')
  const seg = window.location.pathname.split('/').filter(Boolean)[0]
  const raw = (q || seg || '').toLowerCase()
  const norm = TYPE_ALIASES[raw] || raw
  return TYPES[norm] ? norm : 'attendee'
}

// Formatos de salida (px reales de exportación).
export const FORMATS = {
  post: { key: 'post', label: 'Post 4:5', w: 1080, h: 1350 },
  story: { key: 'story', label: 'Story 9:16', w: 1080, h: 1920 },
}
