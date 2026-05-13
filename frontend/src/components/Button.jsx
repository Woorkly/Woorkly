/*
  Composant Button réutilisable
  - Variantes: primary (défaut), secondary, outline
  - Supporte les états disabled et loading
*/
import './Button.css'

export default function Button({
  children,
  variant = 'primary',
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  ...props
}) {
  const classes = `btn btn-${variant} ${disabled ? 'btn-disabled' : ''} ${loading ? 'btn-loading' : ''} ${className}`

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...props}>
      {loading ? '...' : children}
    </button>
  )
}
