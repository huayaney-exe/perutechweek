import { buildCaption } from '../config/copy.js'

const DEFAULT_LUMA = 'https://luma.com/Perutechweek2026'

export function lumaUrl() {
  return import.meta.env.VITE_LUMA_URL || DEFAULT_LUMA
}

export function caption(archetype) {
  return buildCaption(archetype, lumaUrl())
}

// Web Share API nivel 2: comparte el PNG + texto directo a la hoja nativa (móvil).
export function canShareFile(file) {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.canShare &&
    !!navigator.share &&
    file &&
    navigator.canShare({ files: [file] })
  )
}

// ¿El dispositivo puede compartir archivos por la hoja nativa? (móvil, sobre todo)
export function canShareFiles() {
  try {
    const f = new File([new Blob(['x'])], 'x.png', { type: 'image/png' })
    return !!navigator.canShare && !!navigator.share && navigator.canShare({ files: [f] })
  } catch {
    return false
  }
}

export async function shareNative(blob, archetype, text) {
  const file = new File([blob], `credencial-ptw-2026-${archetype}.png`, { type: 'image/png' })
  if (!canShareFile(file)) return false
  await navigator.share({
    files: [file],
    title: 'Perú Tech Week 2026',
    text: text || caption(archetype),
  })
  return true
}

// Fallbacks por canal (desktop / cuando no hay Web Share con archivos).
// Ojo honesto: WhatsApp/LinkedIn/X NO pueden pre-adjuntar imagen vía URL —
// el flujo real es Descargar PNG → abrir la app → adjuntar. El texto+link sí van.
export function channelUrl(channel, archetype, customText) {
  const url = lumaUrl()
  const text = customText || caption(archetype)
  switch (channel) {
    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent(text)}`
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    case 'x':
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    default:
      return url
  }
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
