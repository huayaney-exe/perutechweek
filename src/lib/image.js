// Decodifica un File/Blob, corrige orientación EXIF y lo reduce a maxSize px (lado mayor).
// Devuelve un <canvas> dibujable + dimensiones. La foto NUNCA sale del dispositivo.
export async function toDrawable(source, maxSize = 1024) {
  let bitmap
  try {
    bitmap = await createImageBitmap(source, { imageOrientation: 'from-image' })
  } catch {
    // Fallback para navegadores sin la opción imageOrientation
    bitmap = await createImageBitmap(source)
  }

  const { width: iw, height: ih } = bitmap
  const scale = Math.min(1, maxSize / Math.max(iw, ih))
  const w = Math.round(iw * scale)
  const h = Math.round(ih * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, w, h)
  if (bitmap.close) bitmap.close()

  return { canvas, width: w, height: h }
}
