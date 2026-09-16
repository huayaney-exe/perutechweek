import { useEffect, useRef, useState, useCallback } from 'react'
import { ARCHETYPES, ARCHETYPE_ORDER, FORMATS } from './config/templates.js'
import { toDrawable } from './lib/image.js'
import { removeBackgroundFromFile, bgRemovalLikelySupported } from './lib/removeBackground.js'
import { renderBadge, canvasToBlob } from './lib/composite.js'
import { shareNative, canShareFile, channelUrl, downloadBlob, copyCaption } from './lib/share.js'
import { initAnalytics, capture } from './lib/analytics.js'

export default function App() {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [archetype, setArchetype] = useState('asistente')
  const [format, setFormat] = useState('story')
  const [portrait, setPortrait] = useState(null)
  const [method, setMethod] = useState('none') // none | mask | cutout
  const [processing, setProcessing] = useState(false)
  const [fontsReady, setFontsReady] = useState(false)
  const [toast, setToast] = useState('')

  const canvasRef = useRef(null)
  const generatedOnce = useRef(false)
  const skipRef = useRef(false)

  // Init analytics + esperar fuentes antes de dibujar (si no, el texto sale en fuente fallback).
  useEffect(() => {
    initAnalytics()
    let alive = true
    const weights = ['500 100px Manrope', '600 100px Manrope', '700 100px Manrope', '800 100px Manrope']
    Promise.all(weights.map((w) => document.fonts.load(w)))
      .catch(() => {})
      .finally(() => document.fonts.ready.then(() => alive && setFontsReady(true)))
    return () => {
      alive = false
    }
  }, [])

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }, [])

  // Re-render del badge ante cualquier cambio relevante.
  useEffect(() => {
    if (!canvasRef.current) return
    renderBadge(canvasRef.current, { name, role, archetype, format, portrait })
    if (fontsReady && !generatedOnce.current && (portrait || name.trim())) {
      generatedOnce.current = true
      capture('badge_generated', {
        archetype,
        format,
        has_photo: !!portrait,
        portrait_method: method,
      })
    }
  }, [name, role, archetype, format, portrait, method, fontsReady])

  async function onFile(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    capture('photo_uploaded', { mime: file.type, bytes: file.size })
    skipRef.current = false
    setProcessing(true)
    setMethod('mask')
    try {
      const base = await toDrawable(file, 1024)
      setPortrait(base.canvas) // baseline inmediato (máscara circular)
    } catch {
      setProcessing(false)
      showToast('No pude leer esa imagen. Prueba otra.')
      return
    }

    // Mejora progresiva: remover fondo (no bloqueante, con fallback).
    if (!bgRemovalLikelySupported()) {
      capture('bgremoval_fallback_used', { cause: 'unsupported' })
      setProcessing(false)
      return
    }
    const t0 = performance.now()
    capture('bgremoval_started', { engine: 'imgly' })
    try {
      const blob = await removeBackgroundFromFile(file, { timeoutMs: 30000 })
      if (skipRef.current) return // el usuario decidió usar la foto así
      const cut = await toDrawable(blob, 1024)
      setPortrait(cut.canvas)
      setMethod('cutout')
      capture('bgremoval_succeeded', { ms: Math.round(performance.now() - t0) })
    } catch (err) {
      const cause = err && err.message === 'timeout' ? 'timeout' : 'failed'
      capture('bgremoval_fallback_used', { cause, ms: Math.round(performance.now() - t0) })
    } finally {
      setProcessing(false)
    }
  }

  function skipBgRemoval() {
    skipRef.current = true
    setProcessing(false)
    capture('bgremoval_fallback_used', { cause: 'skipped' })
  }

  async function currentBlob() {
    renderBadge(canvasRef.current, { name, role, archetype, format, portrait })
    return canvasToBlob(canvasRef.current)
  }

  async function onDownload() {
    const blob = await currentBlob()
    if (!blob) return
    downloadBlob(blob, `credencial-ptw-2026-${archetype}-${format}.png`)
    capture('download_clicked', { format, archetype })
    showToast('Credencial descargada ✓')
  }

  async function onShare() {
    const blob = await currentBlob()
    if (!blob) return
    const file = new File([blob], 'credencial.png', { type: 'image/png' })
    if (canShareFile(file)) {
      try {
        await shareNative(blob, archetype)
        capture('badge_shared', { channel: 'native', archetype, format })
      } catch {
        /* usuario canceló */
      }
    } else {
      // Sin Web Share con archivos (desktop): descarga + abre canal.
      downloadBlob(blob, `credencial-ptw-2026-${archetype}.png`)
      showToast('Descargué tu credencial. Adjúntala al publicar 👇')
    }
  }

  function onChannel(channel) {
    capture('share_clicked', { channel, format, archetype })
    window.open(channelUrl(channel, archetype), '_blank', 'noopener')
  }

  async function onCopy() {
    const ok = await copyCaption(archetype)
    showToast(ok ? 'Texto copiado ✓' : 'No pude copiar')
  }

  return (
    <div className="wrap">
      <header className="head">
        <div className="wordmark">
          PERÚ TECH WEEK <span className="yr">2026</span>
        </div>
        <h1>Genera tu credencial</h1>
        <p>Sube tu foto, arma tu badge y comparte que estarás en la semana tech más grande del Perú.</p>
      </header>

      <div className="grid">
        {/* Controles */}
        <div className="panel">
          <div className="field">
            <label>Tu foto</label>
            <label className="uploader">
              <strong>Toca para subir una foto</strong>
              <div>Se procesa en tu dispositivo — no se sube a ningún servidor.</div>
              <input type="file" accept="image/*" onChange={onFile} />
            </label>
            {processing && (
              <div className="status">
                Quitando el fondo… (la primera vez baja el modelo, puede tomar unos segundos){' '}
                <button
                  onClick={skipBgRemoval}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--red-coral)',
                    cursor: 'pointer',
                    font: 'inherit',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  usar mi foto así
                </button>
              </div>
            )}
            {!processing && method === 'cutout' && <div className="status ok">Fondo removido ✓</div>}
            {!processing && method === 'mask' && <div className="status">Foto en marco circular</div>}
          </div>

          <div className="field">
            <label>Nombre</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" maxLength={40} />
          </div>

          <div className="field">
            <label>Rol / Empresa</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Founder @ tu startup"
              maxLength={48}
            />
          </div>

          <div className="field">
            <label>Tipo de credencial</label>
            <div className="seg">
              {ARCHETYPE_ORDER.map((k) => (
                <button key={k} className={archetype === k ? 'active' : ''} onClick={() => setArchetype(k)}>
                  {ARCHETYPES[k].label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Formato</label>
            <div className="seg">
              {Object.values(FORMATS).map((f) => (
                <button key={f.key} className={format === f.key ? 'active' : ''} onClick={() => setFormat(f.key)}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview + acciones */}
        <div className="preview-col">
          <div className="canvas-frame">
            <canvas ref={canvasRef} className="badge" />
          </div>

          <div className="actions">
            <div className="row">
              <button className="btn btn-primary" onClick={onShare}>
                Compartir
              </button>
              <button className="btn btn-ghost" onClick={onDownload}>
                Descargar PNG
              </button>
            </div>
            <div className="channels">
              <button className="btn btn-ghost" onClick={() => onChannel('whatsapp')}>
                WhatsApp
              </button>
              <button className="btn btn-ghost" onClick={() => onChannel('linkedin')}>
                LinkedIn
              </button>
              <button className="btn btn-ghost" onClick={() => onChannel('x')}>
                X
              </button>
              <button className="btn btn-ghost" onClick={onCopy}>
                Copiar texto
              </button>
            </div>
            <div className="hint">
              En LinkedIn e Instagram: primero <strong>descarga el PNG</strong>, luego adjúntalo al publicar. El link con tu invitación va en el texto.
            </div>
          </div>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
