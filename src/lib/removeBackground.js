// Background removal como MEJORA PROGRESIVA. NO es IA generativa: es un modelo de
// segmentación local (@imgly/background-removal) que corre en el dispositivo.
// Se empaqueta con Vite (dynamic import → chunk aparte, cargado on-demand) para
// que la resolución de assets sea confiable. El modelo (~pocos MB, quint8) se baja
// del CDN de imgly en runtime. SIEMPRE cae al fallback de máscara circular si falla,
// tarda demasiado, o el dispositivo es débil. El badge nunca depende de esto.

let modPromise = null
function loadLib() {
  if (!modPromise) modPromise = import('@imgly/background-removal')
  return modPromise
}

// Gate de capacidad: no castigar equipos muy débiles con la descarga del modelo.
export function bgRemovalLikelySupported() {
  if (typeof navigator === 'undefined') return false
  const mem = navigator.deviceMemory // no soportado en todos los browsers
  if (typeof mem === 'number' && mem < 3) return false
  return typeof WebAssembly === 'object'
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms)
    Promise.resolve(promise).then(
      (v) => {
        clearTimeout(t)
        resolve(v)
      },
      (e) => {
        clearTimeout(t)
        reject(e)
      },
    )
  })
}

// Devuelve un Blob PNG con fondo removido, o lanza. El caller decide el fallback.
export async function removeBackgroundFromFile(file, { timeoutMs = 30000, onProgress } = {}) {
  const mod = await loadLib()
  const removeBackground = mod.removeBackground || (mod.default && mod.default.removeBackground)
  if (typeof removeBackground !== 'function') throw new Error('imgly no disponible')

  const config = {
    model: 'isnet_quint8', // el más liviano/rápido; suficiente para retratos
    output: { format: 'image/png', quality: 0.8 },
  }
  if (typeof onProgress === 'function') config.progress = onProgress

  const blob = await withTimeout(removeBackground(file, config), timeoutMs)
  if (!(blob instanceof Blob)) throw new Error('imgly: salida inesperada')
  return blob
}
