import { COLORS, FONT, EVENT, TYPES, FORMATS } from '../config/templates.js'

// Geometría por formato (px reales de exportación).
const LAYOUT = {
  post: {
    P: 64,
    peru: { size: 26, y: 88 },
    tw: { size: 44, y: 132 },
    tab: { y: 54, h: 62, size: 30, r: 16 },
    presenta: { y: 198, size: 30 },
    panel: { w: 560, h: 700, y: 238, r: 12 },
    name: { y: 1008, size: 58, min: 34 },
    bar: { w: 660, h: 66, y: 1042, size: 32, r: 6 },
    footer: { y: 1298, size: 30 },
  },
  story: {
    P: 72,
    peru: { size: 30, y: 128 },
    tw: { size: 52, y: 180 },
    tab: { y: 92, h: 74, size: 36, r: 18 },
    presenta: { y: 268, size: 34 },
    panel: { w: 620, h: 780, y: 360, r: 14 },
    name: { y: 1250, size: 72, min: 40 },
    bar: { w: 740, h: 84, y: 1290, size: 40, r: 8 },
    footer: { y: 1826, size: 34 },
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

function fitCentered(ctx, text, cx, y, maxW, base, weight, color, opts = {}) {
  const { min = Math.floor(base * 0.5), ls = '0px', upper = false } = opts
  const t = upper ? text.toUpperCase() : text
  ctx.letterSpacing = ls
  let size = base
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
}

// Fondo: escala el patrón a lo ancho y lo repite verticalmente. Fallback: rojo sólido.
function drawBackground(ctx, W, H, img) {
  ctx.fillStyle = COLORS.redField
  ctx.fillRect(0, 0, W, H)
  if (img && img.width) {
    const s = W / img.width
    const dh = img.height * s
    for (let y = 0; y < H; y += dh) ctx.drawImage(img, 0, y, W, dh)
  }
}

function drawWordmark(ctx, P, L) {
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = COLORS.white
  ctx.letterSpacing = '6px'
  ctx.font = `700 ${L.peru.size}px ${FONT}`
  ctx.fillText('PERÚ', P, L.peru.y)
  ctx.letterSpacing = '0px'
  ctx.font = `800 ${L.tw.size}px ${FONT}`
  const a = 'TECH WEEK'
  ctx.fillText(a, P, L.tw.y)
  const wa = ctx.measureText(a + ' ').width
  ctx.font = `500 ${L.tw.size}px ${FONT}`
  ctx.fillText('2026', P + wa, L.tw.y)
}

function drawTab(ctx, W, P, L, label) {
  ctx.font = `800 ${L.tab.size}px ${FONT}`
  const tw = ctx.measureText(label).width
  const padX = L.tab.size * 0.85
  const w = tw + padX * 2
  const h = L.tab.h
  const x = W - P - w
  roundRect(ctx, x, L.tab.y, w, h, L.tab.r)
  ctx.fillStyle = COLORS.maroon
  ctx.fill()
  ctx.fillStyle = COLORS.white
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, x + w / 2, L.tab.y + h / 2 + 1)
}

function drawPresenta(ctx, P, y, size, ally) {
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = COLORS.white
  const lead = 'Presenta: '
  ctx.font = `500 ${size}px ${FONT}`
  ctx.fillText(lead, P, y)
  const w = ctx.measureText(lead).width
  ctx.font = `800 ${size}px ${FONT}`
  ctx.fillText(ally, P + w, y)
}

function drawPersonIcon(ctx, cx, cy, s) {
  ctx.strokeStyle = COLORS.panelIcon
  ctx.lineWidth = s * 0.09
  ctx.beginPath()
  ctx.arc(cx, cy - s * 0.55, s * 0.42, 0, Math.PI * 2) // cabeza
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx, cy + s * 0.75, s * 0.85, Math.PI * 1.12, Math.PI * 1.88) // hombros
  ctx.stroke()
}

function drawPhotoPanel(ctx, geo, portrait) {
  const { x, y, w, h, r } = geo
  ctx.save()
  roundRect(ctx, x, y, w, h, r)
  ctx.fillStyle = COLORS.panel
  ctx.fill()
  ctx.clip()
  if (portrait && portrait.width) {
    const scale = Math.max(w / portrait.width, h / portrait.height)
    const dw = portrait.width * scale
    const dh = portrait.height * scale
    ctx.drawImage(portrait, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
  } else {
    const s = w * 0.18
    drawPersonIcon(ctx, x + w / 2, y + h / 2 - s * 0.3, s)
    ctx.fillStyle = COLORS.panelIcon
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.letterSpacing = '6px'
    ctx.font = `600 ${w * 0.05}px ${FONT}`
    ctx.fillText('FOTO', x + w / 2, y + h / 2 + s * 1.4)
    ctx.letterSpacing = '0px'
  }
  ctx.restore()
}

function draw(ctx, fmt, data) {
  const L = LAYOUT[fmt.key]
  const W = fmt.w
  const H = fmt.h
  const cx = W / 2
  const P = L.P
  const type = TYPES[data.type] || TYPES.attendee

  drawBackground(ctx, W, H, data.patternImg)
  drawWordmark(ctx, P, L)
  drawTab(ctx, W, P, L, type.tab)

  if (type.showAlly && (data.ally || '').trim()) {
    drawPresenta(ctx, P, L.presenta.y, L.presenta.size, data.ally.trim())
  }

  const panel = { x: (W - L.panel.w) / 2, y: L.panel.y, w: L.panel.w, h: L.panel.h, r: L.panel.r }
  drawPhotoPanel(ctx, panel, data.portrait)

  const name = (data.name || '').trim() || 'Nombre Completo'
  fitCentered(ctx, name, cx, L.name.y, W - P * 2, L.name.size, 800, COLORS.white, { min: L.name.min })

  const role = (data.role || '').trim()
  if (role) {
    const bx = (W - L.bar.w) / 2
    roundRect(ctx, bx, L.bar.y, L.bar.w, L.bar.h, L.bar.r)
    ctx.fillStyle = COLORS.ink
    ctx.fill()
    fitCentered(ctx, role, cx, L.bar.y + L.bar.h * 0.66, L.bar.w - 48, L.bar.size, 600, COLORS.white, {
      min: Math.floor(L.bar.size * 0.7),
    })
  }

  // Pie: nombre del evento (izq) · fecha (der)
  const evName = (data.eventName || '').trim() || EVENT.defaultName
  const evDate = (data.eventDate || '').trim() || EVENT.defaultDate
  ctx.fillStyle = COLORS.white
  ctx.font = `600 ${L.footer.size}px ${FONT}`
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.fillText(evName, P, L.footer.y)
  ctx.textAlign = 'right'
  ctx.fillText(evDate, W - P, L.footer.y)
}

export function renderBadge(canvas, data) {
  const fmt = FORMATS[data.format] || FORMATS.post
  canvas.width = fmt.w
  canvas.height = fmt.h
  const ctx = canvas.getContext('2d')
  draw(ctx, fmt, data)
}

export function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png', 0.95))
}
