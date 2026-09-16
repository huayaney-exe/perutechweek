// Web Worker: corre el background removal FUERA del hilo principal, para que la
// UI (escribir nombre/rol, cambiar opciones) NO se congele durante la inferencia.
import { removeBackground } from '@imgly/background-removal'

self.onmessage = async (e) => {
  const { file } = e.data || {}
  try {
    const blob = await removeBackground(file, {
      model: 'isnet_quint8',
      output: { format: 'image/png', quality: 0.8 },
    })
    self.postMessage({ ok: true, blob })
  } catch (err) {
    self.postMessage({ ok: false, error: String((err && err.message) || err) })
  }
}
