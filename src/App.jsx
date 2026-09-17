import { useEffect, useRef, useState, useCallback } from 'react'
import { TYPES, TYPE_ORDER, FORMATS, typeFromUrl } from './config/templates.js'
import { toDrawable } from './lib/image.js'
import { removeBackgroundFromFile, bgRemovalLikelySupported } from './lib/removeBackground.js'
import { renderBadge, canvasToBlob } from './lib/composite.js'
import { shareNative, canShareFile, canShareFiles, channelUrl, downloadBlob, copyText, caption } from './lib/share.js'
import { initAnalytics, capture } from './lib/analytics.js'
import patternUrl from './assets/pattern.jpg'

// Traduce el progreso de imgly a un mensaje en español.
function labelFor(d) {
  const key = String((d && d.key) || '')
  const pct = d && d.total ? Math.round((d.current / d.total) * 100) : null
  if (key.startsWith('fetch')) return `Descargando modelo${pct != null ? ` ${pct}%` : '…'}`
  if (key.startsWith('compute') || key.startsWith('inference')) return 'Removiendo fondo…'
  return 'Removiendo fondo…'
}

export default function App() {
  const initialType = typeFromUrl()
  const [type, setType] = useState(initialType)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [ally, setAlly] = useState('')
  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [format, setFormat] = useState('post')

  const [baseImg, setBaseImg] = useState(null)
  const [cutoutImg, setCutoutImg] = useState(null)
  const [removeBg, setRemoveBg] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState('')

  const [patternImg, setPatternImg] = useState(null)
  const [fontsReady, setFontsReady] = useState(false)
  const [toast, setToast] = useState('')
  const [msg, setMsg] = useState(() => caption(initialType))
  const [msgEdited, setMsgEdited] = useState(false)

  const canvasRef = useRef(null)
  const generatedOnce = useRef(false)
  const baseFile = useRef(null)
  const canNativeShare = useRef(canShareFiles()).current

  const t = TYPES[type] || TYPES.attendee
  const portrait = removeBg ? cutoutImg || baseImg : baseImg

  // Cargar patrón de fondo + fuentes + analytics.
  useEffect(() => {
    initAnalytics()
    const img = new Image()
    img.onload = () => setPatternImg(img)
    img.src = patternUrl
    const weights = ['500 100px Manrope', '600 100px Manrope', '700 100px Manrope', '800 100px Manrope']
    Promise.all(weights.map((w) => document.fonts.load(w)))
      .catch(() => {})
      .finally(() => document.fonts.ready.then(() => setFontsReady(true)))
  }, [])

  // El mensaje sigue al tipo salvo edición manual.
  useEffect(() => {
    if (!msgEdited) setMsg(caption(type))
  }, [type, msgEdited])

  const showToast = useCallback((m) => {
    setToast(m)
    setTimeout(() => setToast(''), 2200)
  }, [])

  // Re-render del badge ante cualquier cambio.
  useEffect(() => {
    if (!canvasRef.current) return
    renderBadge(canvasRef.current, {
      type,
      format,
      name,
      role,
      ally,
      eventName,
      eventDate,
      portrait,
      patternImg,
    })
    if (fontsReady && patternImg && !generatedOnce.current && (portrait || name.trim())) {
      generatedOnce.current = true
      capture('badge_generated', { type, format, has_photo: !!portrait })
    }
  }, [type, format, name, role, ally, eventName, eventDate, portrait, patternImg, fontsReady])

  // Ejecutar bg-removal cuando se activa el toggle (worker, no bloquea la UI).
  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!removeBg || !baseFile.current || cutoutImg || processing) return
      if (!bgRemovalLikelySupported()) {
        showToast('Tu equipo no soporta quitar el fondo aquí')
        setRemoveBg(false)
        return
      }
      setProcessing(true)
      setProgress('Cargando modelo…')
      const t0 = performance.now()
      capture('bgremoval_started', { engine: 'imgly' })
      try {
        const blob = await removeBackgroundFromFile(baseFile.current, {
          timeoutMs: 60000,
          onProgress: (d) => {
            if (!cancelled) setProgress(labelFor(d))
          },
        })
        if (cancelled) return
        setProgress('Afinando bordes…')
        const cut = await toDrawable(blob, 1200)
        setCutoutImg(cut.canvas)
        capture('bgremoval_succeeded', { ms: Math.round(performance.now() - t0) })
      } catch (err) {
        if (cancelled) return
        capture('bgremoval_fallback_used', { cause: err && err.message === 'timeout' ? 'timeout' : 'failed' })
        setRemoveBg(false)
        showToast('No pude quitar el fondo — uso la foto original')
      } finally {
        if (!cancelled) {
          setProcessing(false)
          setProgress('')
        }
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [removeBg]) // eslint-disable-line react-hooks/exhaustive-deps

  async function onFile(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    capture('photo_uploaded', { mime: file.type, bytes: file.size })
    baseFile.current = file
    setCutoutImg(null)
    try {
      const base = await toDrawable(file, 1200)
      setBaseImg(base.canvas)
    } catch {
      showToast('No pude leer esa imagen. Prueba otra.')
    }
  }

  async function currentBlob() {
    renderBadge(canvasRef.current, { type, format, name, role, ally, eventName, eventDate, portrait, patternImg })
    return canvasToBlob(canvasRef.current)
  }

  async function onDownload() {
    const blob = await currentBlob()
    if (!blob) return
    downloadBlob(blob, `credencial-ptw-2026-${type}-${format}.png`)
    capture('download_clicked', { format, type })
    showToast('Credencial descargada ✓')
  }

  async function onShare() {
    const blob = await currentBlob()
    if (!blob) return
    const file = new File([blob], 'credencial.png', { type: 'image/png' })
    if (canShareFile(file)) {
      try {
        await shareNative(blob, type, msg)
        capture('badge_shared', { channel: 'native', type, format })
      } catch {
        /* cancelado */
      }
    } else {
      downloadBlob(blob, `credencial-ptw-2026-${type}.png`)
      await copyText(msg)
      showToast('Descargué el PNG y copié el mensaje. Adjunta la imagen al publicar 👇')
    }
  }

  function onChannel(channel) {
    capture('share_clicked', { channel, format, type })
    window.open(channelUrl(channel, type, msg), '_blank', 'noopener')
  }

  async function onCopy() {
    const ok = await copyText(msg)
    showToast(ok ? 'Mensaje copiado ✓' : 'No pude copiar')
  }

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <div className="wordmark nav-mark">
            PERÚ TECH WEEK <span className="yr">2026</span>
          </div>
          <a
            className="nav-cta"
            href="https://luma.com/Perutechweek2026?utm_source=credencial&utm_medium=nav&utm_campaign=ptw2026"
            target="_blank"
            rel="noopener noreferrer"
          >
            Agenda <span className="sm-hide">completa</span>
            <span className="arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </nav>

      <div className="wrap">
        <header className="head">
          <h1>Genera tu credencial</h1>
          <p>Sube tu foto, arma tu credencial y comparte que estarás en la semana tech más grande del Perú.</p>
        </header>

      <div className="grid">
        <div className="panel">
          <div className="field">
            <label>Tipo de credencial</label>
            <div className="seg">
              {TYPE_ORDER.map((k) => (
                <button key={k} className={type === k ? 'active' : ''} onClick={() => setType(k)}>
                  {TYPES[k].tab}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Tu foto</label>
            <label className="uploader">
              <strong>Toca para subir una foto</strong>
              <div>Se procesa en tu dispositivo — no se sube a ningún servidor.</div>
              <input type="file" accept="image/*" onChange={onFile} />
            </label>
            {baseImg && (
              <label className="check">
                <input type="checkbox" checked={removeBg} onChange={(e) => setRemoveBg(e.target.checked)} disabled={processing} />
                Quitar el fondo de la foto {processing && '· procesando…'}
              </label>
            )}
          </div>

          <div className="field">
            <label>Nombre completo</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre Completo" maxLength={40} />
          </div>

          <div className="field">
            <label>Cargo · Empresa</label>
            <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Founder · Prisma" maxLength={48} />
          </div>

          {t.showAlly && (
            <div className="field">
              <label>Presenta (aliado)</label>
              <input type="text" value={ally} onChange={(e) => setAlly(e.target.value)} placeholder="Nombre del aliado" maxLength={30} />
            </div>
          )}

          {t.showEvent && (
            <>
              <div className="field">
                <label>Nombre del evento</label>
                <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Nombre del evento" maxLength={40} />
              </div>
              <div className="field">
                <label>Fecha del evento</label>
                <input type="text" value={eventDate} onChange={(e) => setEventDate(e.target.value)} placeholder="Lunes 13, Octubre" maxLength={28} />
              </div>
            </>
          )}

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

        <div className="preview-col">
          <div className="canvas-frame">
            <canvas ref={canvasRef} className="badge" />
            {processing && (
              <div className="loading">
                <div className="spinner" />
                <div className="lt">{progress || 'Removiendo fondo…'}</div>
                <div className="ls">Espera un momento — no cierres esto</div>
              </div>
            )}
          </div>

          <div className="actions">
            <div className="msg">
              <div className="msg-head">
                <label htmlFor="msg">Mensaje para compartir</label>
                <button className="link" onClick={onCopy}>Copiar</button>
              </div>
              <textarea
                id="msg"
                value={msg}
                onChange={(e) => {
                  setMsg(e.target.value)
                  setMsgEdited(true)
                }}
                rows={4}
              />
            </div>

            <div className="row">
              {canNativeShare && (
                <button className="btn btn-primary" onClick={onShare}>Compartir</button>
              )}
              <button className={canNativeShare ? 'btn btn-ghost' : 'btn btn-primary'} onClick={onDownload}>
                Descargar PNG
              </button>
            </div>

            <div className="channels">
              <button className="btn btn-ghost" onClick={() => onChannel('whatsapp')}>WhatsApp</button>
              <button className="btn btn-ghost" onClick={() => onChannel('linkedin')}>LinkedIn</button>
              <button className="btn btn-ghost" onClick={() => onChannel('x')}>X</button>
            </div>

            <div className="hint">
              {canNativeShare
                ? 'Toca Compartir para publicar la imagen con el mensaje. En LinkedIn e Instagram: descarga el PNG y adjúntalo — el mensaje ya va copiado.'
                : 'Flujo en 2 pasos: 1) Descarga el PNG. 2) Abre el canal (el mensaje ya va listo), pega y adjunta la imagen.'}
            </div>
          </div>
        </div>
      </div>

        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  )
}
