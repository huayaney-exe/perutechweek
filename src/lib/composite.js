import { FONT, TYPES, FORMATS } from '../config/templates.js'

// Diseño v3 "frame andino": el fondo (patrón + wordmark + fecha) viene quemado en
// una imagen-frame por formato (src/assets/frame-*.jpg). Aquí sólo componemos, dentro
// de la tarjeta blanca: foto + tab "Soy X" + nombre (rojo) + datos.
//
// Layout de FLUJO: los elementos se apilan de arriba a abajo con alturas medidas, así
// el tamaño de la foto se adapta al tipo:
//  - tipos SIN evento (Asistente/Embajador/Aliado): foto grande + cargo·empresa.
//  - tipos CON evento (Host/Speaker): foto algo menor + nombre del evento + fecha/hora.

// Card del frame, en fracciones del lienzo (medidas de los assets finales).
const CARD = {
  post: { l: 0.1172, t: 0.1813, r: 0.8809, b: 0.8844 }, // frame-post 1024×1280
  story: { l: 0.1222, t: 0.2391, r: 0.8847, b: 0.7961 }, // frame-story 720×1280
}

// Bloque, en fracciones de la card.
const SLOT = {
  px: 0.072, pw: 0.856,        // foto/columna de texto: menos margen lateral → más ancho
  photoTop: 0.058,             // foto más arriba (menos margen superior)
  photoH: 0.60,                // alto de foto SIN evento
  photoHEvent: 0.45,           // alto de foto CON evento (cargo + evento + fecha)
}

const RED = '#E4162A'
const INK = '#111111'
const MUT = '#4A4A4A'
const SUB = '#616161' // apoyo (cargo, fecha): un escalón por debajo de la tinta
const BG = '#0A0A0A'
const PHOTO_BG = '#ECECEC'
const PHOTO_ICON = '#B7B7B7'

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

// Texto alineado a la izquierda con auto-reducción + ellipsis si no entra.
function fitLeft(ctx, text, x, yTop, maxW, base, weight, color) {
  const min = Math.floor(base * 0.55)
  let size = base
  for (; size > min; size--) {
    ctx.font = `${weight} ${size}px ${FONT}`
    if (ctx.measureText(text).width <= maxW) break
  }
  ctx.font = `${weight} ${size}px ${FONT}`
  let out = text
  if (ctx.measureText(out).width > maxW) {
    while (out.length > 1 && ctx.measureText(out + '…').width > maxW) out = out.slice(0, -1)
    out += '…'
  }
  ctx.fillStyle = color
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(out, x, yTop)
}

function drawTag(ctx, x, yTop, label, fs) {
  ctx.font = `800 ${fs}px ${FONT}`
  const tw = ctx.measureText(label).width
  const padX = fs * 0.62
  const padY = fs * 0.42
  const h = fs + padY * 2
  const w = tw + padX * 2
  roundRect(ctx, x, yTop, w, h, h * 0.28)
  ctx.fillStyle = '#000000'
  ctx.fill()
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, x + padX, yTop + h / 2 + fs * 0.04)
  return yTop + h
}

function drawPersonIcon(ctx, cx, cy, s) {
  ctx.strokeStyle = PHOTO_ICON
  ctx.lineWidth = s * 0.09
  ctx.beginPath()
  ctx.arc(cx, cy - s * 0.55, s * 0.42, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx, cy + s * 0.75, s * 0.85, Math.PI * 1.12, Math.PI * 1.88)
  ctx.stroke()
}

function drawPhoto(ctx, x, y, w, h, portrait) {
  ctx.save()
  roundRect(ctx, x, y, w, h, Math.min(w, h) * 0.05)
  ctx.fillStyle = PHOTO_BG
  ctx.fill()
  ctx.clip()
  if (portrait && portrait.width) {
    const s = Math.max(w / portrait.width, h / portrait.height)
    const dw = portrait.width * s
    const dh = portrait.height * s
    ctx.drawImage(portrait, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
  } else {
    const s = w * 0.16
    drawPersonIcon(ctx, x + w / 2, y + h / 2 - s * 0.3, s)
    ctx.fillStyle = PHOTO_ICON
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.letterSpacing = '6px'
    ctx.font = `600 ${w * 0.05}px ${FONT}`
    ctx.fillText('FOTO', x + w / 2, y + h / 2 + s * 1.5)
    ctx.letterSpacing = '0px'
  }
  ctx.restore()
}

function draw(ctx, fmt, data) {
  const W = fmt.w
  const H = fmt.h
  const type = TYPES[data.type] || TYPES.attendee
  const isEvent = !!type.showEvent

  // Fondo: frame nuevo escalado al lienzo; respaldo negro si aún no cargó.
  const frame = data.frames && data.frames[fmt.key]
  if (frame && frame.width) {
    ctx.drawImage(frame, 0, 0, W, H)
  } else {
    ctx.fillStyle = BG
    ctx.fillRect(0, 0, W, H)
  }

  const c = CARD[fmt.key] || CARD.post
  const cx = c.l * W
  const cy = c.t * H
  const cw = (c.r - c.l) * W
  const ch = (c.b - c.t) * H
  const left = cx + SLOT.px * cw
  const blockW = SLOT.pw * cw

  // Foto (más grande sin evento; más chica con evento para dar lugar a 2 líneas).
  const photoTop = cy + SLOT.photoTop * ch
  const photoH = (isEvent ? SLOT.photoHEvent : SLOT.photoH) * ch
  drawPhoto(ctx, left, photoTop, blockW, photoH, data.portrait)
  const afterPhoto = photoTop + photoH

  // Borra el placeholder negro quemado en el frame (bajo la foto), recortando a la card.
  ctx.save()
  roundRect(ctx, cx + cw * 0.012, cy + ch * 0.012, cw * 0.976, ch * 0.976, cw * 0.05)
  ctx.clip()
  ctx.fillStyle = '#FFFFFF'
  const clearY = afterPhoto
  ctx.fillRect(cx, clearY, cw, cy + ch - clearY)
  ctx.restore()

  // Bloque de texto en flujo.
  let y = afterPhoto + ch * 0.03
  y = drawTag(ctx, left, y, type.tab, 0.04 * ch) + ch * 0.024

  // Grupo IDENTIDAD — nombre (hero) + cargo·empresa (apoyo, pegado al nombre).
  const nameFs = 0.09 * ch
  const name = (data.name || '').trim() || 'Nombre Completo'
  fitLeft(ctx, name, left, y, blockW, nameFs, 800, RED)
  y += nameFs + ch * 0.01

  const role = (data.role || '').trim()
  if (role) {
    fitLeft(ctx, role, left, y, blockW, 0.029 * ch, 500, SUB)
    y += 0.029 * ch
  }

  // Grupo EVENTO — separado por aire; el nombre del evento pesa más que el cargo.
  if (isEvent) {
    const evName = (data.eventName || '').trim()
    const evDate = (data.eventDate || '').trim()
    if (evName || evDate) y += ch * 0.036 // aire entre grupos
    if (evName) {
      fitLeft(ctx, evName, left, y, blockW, 0.037 * ch, 700, INK)
      y += 0.037 * ch + ch * 0.006
    }
    if (evDate) fitLeft(ctx, evDate, left, y, blockW, 0.026 * ch, 500, SUB)
  }
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
