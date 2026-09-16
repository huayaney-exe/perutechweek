import { buildCaption } from '../config/copy.js'

const DEFAULT_LUMA = 'https://luma.com/Perutechweek2026'

export function lumaUrl(archetype) {
  const base = import.meta.env.VITE_LUMA_URL || DEFAULT_LUMA
  const u = new URL(base)
  u.searchParams.set('utm_source', 'credencial')
  u.searchParams.set('utm_medium', 'share')
  u.searchParams.set('utm_campaign', 'ptw2026')
  u.searchParams.set('utm_content', archetype || 'asistente')
  return u.toString()
}

export function caption(archetype) {
  return buildCaption(archetype, lumaUrl(archetype))
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

export async function shareNative(blob, archetype) {
  const file = new File([blob], `credencial-ptw-2026-${archetype}.png`, { type: 'image/png' })
  if (!canShareFile(file)) return false
  await navigator.share({
    files: [file],
    title: 'Perú Tech Week 2026',
    text: caption(archetype),
  })
  return true
}

// Fallbacks por canal (desktop / cuando no hay Web Share con archivos).
// Ojo honesto: WhatsApp/LinkedIn/X NO pueden pre-adjuntar imagen vía URL —
// el flujo real es Descargar PNG → abrir la app → adjuntar. El texto+link sí van.
export function channelUrl(channel, archetype) {
  const url = lumaUrl(archetype)
  const text = caption(archetype)
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

export async function copyCaption(archetype) {
  try {
    await navigator.clipboard.writeText(caption(archetype))
    return true
  } catch {
    return false
  }
}
