import { FONT, TYPES, FORMATS } from '../config/templates.js'

// Diseño v3 "frame andino": el fondo (patrón + wordmark + fecha) viene quemado en
// una imagen-frame por formato (src/assets/frame-*.jpg). Aquí sólo componemos, dentro
// de la tarjeta blanca: foto + tab "Soy X" + nombre (rojo) + cargo·empresa.

// Card del frame, en fracciones del lienzo (medidas de los assets finales).
const CARD = {
  post: { l: 0.1172, t: 0.1813, r: 0.8809, b: 0.8844 }, // frame-post 1024×1280
  story: { l: 0.1222, t: 0.2391, r: 0.8847, b: 0.7961 }, // frame-story 720×1280
}

// Bloque foto+texto, en fracciones de la card.
const SLOT = {
  px: 0.109, py: 0.094, pw: 0.782, ph: 0.561, // foto
  tagY: 0.689, tagFs: 0.038,                   // tab "Soy X"
  nameY: 0.77, nameFs: 0.09,                    // nombre (rojo)
  subY: 0.9, subFs: 0.03,                       // cargo · empresa
}

const RED = '#E4162A'
const INK = '#111111'
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
  return size
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

  drawPhoto(ctx, left, cy + SLOT.py * ch, blockW, SLOT.ph * ch, data.portrait)

  // Borra el placeholder negro quemado en el frame (bajo la foto) antes de escribir,
  // recortando a la forma de la card para no pisar sus esquinas redondeadas.
  ctx.save()
  roundRect(ctx, cx + cw * 0.012, cy + ch * 0.012, cw * 0.976, ch * 0.976, cw * 0.05)
  ctx.clip()
  ctx.fillStyle = '#FFFFFF'
  const clearY = cy + (SLOT.py + SLOT.ph) * ch + ch * 0.008
  ctx.fillRect(cx, clearY, cw, cy + ch - clearY)
  ctx.restore()

  drawTag(ctx, left, cy + SLOT.tagY * ch, type.tab, SLOT.tagFs * ch)

  const name = (data.name || '').trim() || 'Nombre Completo'
  fitLeft(ctx, name, left, cy + SLOT.nameY * ch, blockW, SLOT.nameFs * ch, 800, RED)

  const role = (data.role || '').trim()
  if (role) fitLeft(ctx, role, left, cy + SLOT.subY * ch, blockW, SLOT.subFs * ch, 500, INK)
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
