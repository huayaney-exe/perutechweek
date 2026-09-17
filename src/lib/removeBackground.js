// Background removal como MEJORA PROGRESIVA. NO es IA generativa: es un modelo de
// segmentación local (@imgly/background-removal) que corre en el dispositivo,
// DENTRO DE UN WEB WORKER para no congelar la UI mientras el usuario escribe.
// SIEMPRE cae al fallback de máscara circular si falla, tarda demasiado, o el
// dispositivo es débil. El badge nunca depende de esto.

// Gate de capacidad: no castigar equipos muy débiles con la descarga del modelo.
export function bgRemovalLikelySupported() {
  if (typeof navigator === 'undefined') return false
  const mem = navigator.deviceMemory // no soportado en todos los browsers
  if (typeof mem === 'number' && mem < 3) return false
  return typeof WebAssembly === 'object' && typeof Worker !== 'undefined'
}

function withTimeout(promise, ms, onTimeout) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      if (onTimeout) onTimeout()
      reject(new Error('timeout'))
    }, ms)
    promise.then(
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
// La inferencia corre en un worker: el hilo principal queda libre para la UI.
// onProgress({ key, current, total }) alimenta el loading state.
export async function removeBackgroundFromFile(file, { timeoutMs = 60000, onProgress } = {}) {
  const worker = new Worker(new URL('./bgWorker.js', import.meta.url), { type: 'module' })
  const run = new Promise((resolve, reject) => {
    worker.onmessage = (e) => {
      const d = e.data || {}
      if (d.type === 'progress') {
        if (onProgress) onProgress(d)
        return
      }
      if (d.ok && d.blob instanceof Blob) resolve(d.blob)
      else reject(new Error(d.error || 'salida inesperada'))
    }
    worker.onerror = (e) => reject(new Error((e && e.message) || 'worker error'))
    worker.postMessage({ file })
  })
  try {
    return await withTimeout(run, timeoutMs, () => worker.terminate())
  } finally {
    worker.terminate()
  }
}
