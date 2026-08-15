import { useState, useEffect, useCallback } from 'react'
import './RateLimitToast.css'

export default function RateLimitToast() {
  const [toast, setToast] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  const dismiss = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => setToast(null), 300)
  }, [])

  useEffect(() => {
    let timer
    const handler = (e) => {
      setToast(e.detail.message)
      setIsVisible(true)
      clearTimeout(timer)
      timer = setTimeout(() => dismiss(), 5000)
    }
    window.addEventListener('rate-limit', handler)
    return () => {
      window.removeEventListener('rate-limit', handler)
      clearTimeout(timer)
    }
  }, [dismiss])

  if (!toast) return null

  return (
    <div className={`rate-limit-overlay ${isVisible ? 'visible' : ''}`}>
      <div className="rate-limit-toast" role="alert" aria-live="polite" aria-atomic="true">
        <span className="rate-limit-icon">⚠️</span>
        <div className="rate-limit-content">
          <p className="rate-limit-message">{toast}</p>
          <p className="rate-limit-hint">Veuillez patienter avant de réessayer</p>
        </div>
        <button
          className="rate-limit-close"
          onClick={dismiss}
          aria-label="Fermer l'alerte"
          title="Fermer"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
