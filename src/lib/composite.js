import { COLORS, FONT, EVENT, ARCHETYPES, FORMATS } from '../config/templates.js'

// Geometría por formato. Todo en px reales de exportación.
// Jerarquía: el KICKER (verbo) va ARRIBA pegado al wordmark del EVENTO —
// "ESTARÉ EN / PERÚ TECH WEEK 2026" — para que no se lea sobre el nombre de la
// persona. El nombre queda solo como identidad, debajo de la foto.
const LAYOUT = {
  story: {
    margin: 110,
    kicker: { y: 172, size: 32 },
    wordmark: { cy: 248, size: 54 },
    photo: { cx: 540, cy: 748, r: 312, ring: 10 },
    name: { y: 1188, size: 104, min: 54 },
    role: { y: 1268, size: 42, min: 26 },
    pill: { y: 1372, size: 32, padX: 40, padY: 20 },
    date: { y: 1616, size: 46 },
    footer: { y: 1712, size: 30 },
    glow: { cx: 540, cy: 748, r: 760 },
  },
  square: {
    margin: 90,
    kicker: { y: 92, size: 23 },
    wordmark: { cy: 150, size: 42 },
    photo: { cx: 540, cy: 470, r: 196, ring: 8 },
    name: { y: 772, size: 74, min: 40 },
    role: { y: 826, size: 32, min: 22 },
    pill: { y: 894, size: 26, padX: 32, padY: 16 },
    date: { y: 990, size: 34 },
    footer: { y: 1038, size: 24 },
    glow: { cx: 540, cy: 470, r: 560 },
  },
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

// Ajusta el tamaño de fuente hasta que quepa en maxW; si aún no cabe, recorta con "…".
function fitAndDrawCentered(ctx, text, cx, y, maxW, baseSize, weight, color, opts = {}) {
  const { min = Math.floor(baseSize * 0.5), letterSpacing = '0px', upper = false } = opts
  const t = upper ? text.toUpperCase() : text
  ctx.letterSpacing = letterSpacing
  let size = baseSize
  for (; size > min; size--) {
    ctx.font = `${weight} ${size}px ${FONT}`
    if (ctx.measureText(t).width <= maxW) break
  }
  ctx.font = `${weight} ${size}px ${FONT}`
  let out = t
  if (ctx.measureText(out).width > maxW) {
    while (out.length > 1 && ctx.measureText(out + '…').width > maxW) out = out.slice(0, -1)
    out += '…'
  }
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(out, cx, y)
  ctx.letterSpacing = '0px'
  return size
}

function drawWordmark(ctx, cx, cy, size) {
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.letterSpacing = '0.5px'
  ctx.font = `800 ${size}px ${FONT}`
  const a = 'PERÚ TECH WEEK'
  const b = ' 2026'
  const wa = ctx.measureText(a).width
  const wb = ctx.measureText(b).width
  const x = cx - (wa + wb) / 2
  ctx.fillStyle = COLORS.textStrong
  ctx.fillText(a, x, cy)
  ctx.fillStyle = COLORS.redBright
  ctx.fillText(b, x + wa, cy)
  ctx.letterSpacing = '0px'
}

function initials(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'PTW'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function drawPhoto(ctx, geo, portrait, name) {
  const { cx, cy, r, ring } = geo
  // disco base
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.closePath()
  ctx.fillStyle = COLORS.surface2
  ctx.fill()
  ctx.clip()

  if (portrait && portrait.width) {
    const iw = portrait.width
    const ih = portrait.height
    const scale = Math.max((2 * r) / iw, (2 * r) / ih)
    const dw = iw * scale
    const dh = ih * scale
    ctx.drawImage(portrait, cx - dw / 2, cy - dh / 2, dw, dh)
  } else {
    // placeholder con iniciales
    ctx.fillStyle = COLORS.redTint
    ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r)
    ctx.fillStyle = COLORS.textStrong
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `800 ${Math.round(r * 0.9)}px ${FONT}`
    ctx.fillText(initials(name), cx, cy + r * 0.04)
  }
  ctx.restore()

  // anillo rojo
  ctx.beginPath()
  ctx.arc(cx, cy, r + ring / 2, 0, Math.PI * 2)
  ctx.lineWidth = ring
  ctx.strokeStyle = COLORS.redBright
  ctx.stroke()
}

function drawPill(ctx, label, cx, cy, geo) {
  ctx.letterSpacing = '1.5px'
  ctx.font = `700 ${geo.size}px ${FONT}`
  const tw = ctx.measureText(label).width
  const w = tw + geo.padX * 2
  const h = geo.size + geo.padY * 2
  roundRect(ctx, cx - w / 2, cy - h / 2, w, h, h / 2)
  ctx.fillStyle = COLORS.redBright
  ctx.fill()
  ctx.fillStyle = COLORS.textStrong
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, cx, cy + 1)
  ctx.letterSpacing = '0px'
}

function draw(ctx, fmt, data) {
  const L = LAYOUT[fmt.key]
  const W = fmt.w
  const cx = W / 2
  const arch = ARCHETYPES[data.archetype] || ARCHETYPES.asistente

  // fondo
  ctx.fillStyle = COLORS.bg
  ctx.fillRect(0, 0, W, fmt.h)

  // glow rojo sutil detrás de la foto
  const g = ctx.createRadialGradient(L.glow.cx, L.glow.cy, 0, L.glow.cx, L.glow.cy, L.glow.r)
  g.addColorStop(0, 'rgba(221,28,41,0.16)')
  g.addColorStop(1, 'rgba(221,28,41,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, fmt.h)

  // marco hairline interior
  ctx.strokeStyle = COLORS.border
  ctx.lineWidth = 2
  roundRect(ctx, 24, 24, W - 48, fmt.h - 48, 28)
  ctx.stroke()

  // ENCABEZADO DEL EVENTO: kicker (verbo) + wordmark, juntos arriba.
  // Se lee "ESTARÉ EN / PERÚ TECH WEEK 2026" — el verbo pertenece al evento.
  fitAndDrawCentered(ctx, arch.kicker, cx, L.kicker.y, W - L.margin * 2, L.kicker.size, 700, COLORS.redCoral, {
    letterSpacing: '5px',
    upper: true,
    min: L.kicker.size,
  })
  drawWordmark(ctx, cx, L.wordmark.cy, L.wordmark.size)

  // foto (identidad de la persona)
  drawPhoto(ctx, L.photo, data.portrait, data.name)

  // nombre — identidad, solo, debajo de la foto
  const nameText = (data.name || '').trim() || 'Tu Nombre'
  fitAndDrawCentered(ctx, nameText, cx, L.name.y, W - L.margin * 2, L.name.size, 800, COLORS.textStrong, {
    min: L.name.min,
  })

  // rol / empresa
  const roleText = (data.role || '').trim()
  if (roleText) {
    fitAndDrawCentered(ctx, roleText, cx, L.role.y, W - L.margin * 2, L.role.size, 500, COLORS.textMuted, {
      min: L.role.min,
    })
  }

  // pill de arquetipo
  drawPill(ctx, arch.label, cx, L.pill.y, L.pill)

  // línea de fecha
  fitAndDrawCentered(ctx, EVENT.dateLine, cx, L.date.y, W - L.margin * 2, L.date.size, 800, COLORS.textStrong, {
    letterSpacing: '2px',
    min: Math.floor(L.date.size * 0.7),
  })

  // footer
  fitAndDrawCentered(ctx, EVENT.url, cx, L.footer.y, W - L.margin * 2, L.footer.size, 600, COLORS.textDim, {
    letterSpacing: '3px',
    upper: true,
    min: L.footer.size,
  })
}

// Renderiza el badge en un <canvas> a resolución de exportación completa.
export function renderBadge(canvas, data) {
  const fmt = FORMATS[data.format] || FORMATS.story
  canvas.width = fmt.w
  canvas.height = fmt.h
  const ctx = canvas.getContext('2d')
  draw(ctx, fmt, data)
}

// Exporta el canvas actual como Blob PNG.
export function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png', 0.95))
}
