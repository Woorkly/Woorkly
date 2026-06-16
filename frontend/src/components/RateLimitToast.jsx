import { useState, useEffect, useCallback } from 'react'

export default function RateLimitToast() {
  const [toast, setToast] = useState(null)

  const dismiss = useCallback(() => setToast(null), [])

  useEffect(() => {
    let timer
    const handler = (e) => {
      setToast(e.detail.message)
      clearTimeout(timer)
      timer = setTimeout(() => setToast(null), 8000)
    }
    window.addEventListener('rate-limit', handler)
    return () => {
      window.removeEventListener('rate-limit', handler)
      clearTimeout(timer)
    }
  }, [])

  if (!toast) return null

  return (
    <div style={styles.overlay}>
      <div style={styles.toast} role="alert" aria-live="assertive">
        <span style={styles.icon}>⚠️</span>
        <span style={styles.message}>{toast}</span>
        <button style={styles.close} onClick={dismiss} aria-label="Fermer">✕</button>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    bottom: '1.5rem',
    right: '1.5rem',
    zIndex: 9999,
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: '#7f1d1d',
    color: '#fef2f2',
    padding: '0.875rem 1.25rem',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
    maxWidth: '380px',
    fontSize: '0.9rem',
    lineHeight: '1.4',
    animation: 'slideIn 0.25s ease',
  },
  icon: {
    flexShrink: 0,
    fontSize: '1.1rem',
  },
  message: {
    flex: 1,
  },
  close: {
    background: 'none',
    border: 'none',
    color: '#fca5a5',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0',
    flexShrink: 0,
  },
}
