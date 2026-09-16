// Tokens de marca extraídos de techweek.pe (ver ../../DESIGN-SYSTEM.md).
export const COLORS = {
  bg: '#0A0A0A',
  surface: '#0F0D0D',
  surface2: '#161414',
  border: '#2A2A2A',
  text: '#E4E4E4',
  textStrong: '#FFFFFF',
  textMuted: '#B9B9B9',
  textDim: '#7A7A7A',
  red: '#DD1C29', // canónico (wordmark, marcas estáticas)
  redBright: '#FF3344', // CTA / interactivo / energía
  redCoral: '#FF6C76',
  redTint: 'rgba(221,28,41,0.14)',
}

export const FONT = 'Manrope, system-ui, -apple-system, "Segoe UI", Arial, sans-serif'

export const EVENT = {
  dateLine: '12–18 OCTUBRE · LIMA',
  tagline: 'Innovación, Tecnología y Startups',
  url: 'techweek.pe',
}

// Arquetipos de credencial. Cada uno cambia el kicker y el acento.
export const ARCHETYPES = {
  asistente: { key: 'asistente', label: 'ASISTENTE', kicker: 'ESTARÉ EN' },
  embajador: { key: 'embajador', label: 'EMBAJADOR OFICIAL', kicker: 'SOY EMBAJADOR DE' },
  speaker: { key: 'speaker', label: 'SPEAKER', kicker: 'SERÉ SPEAKER EN' },
}

export const ARCHETYPE_ORDER = ['asistente', 'embajador', 'speaker']

// Formatos de salida (px reales de exportación).
export const FORMATS = {
  story: { key: 'story', label: 'Story 9:16', w: 1080, h: 1920 },
  square: { key: 'square', label: 'Post 1:1', w: 1080, h: 1080 },
}
