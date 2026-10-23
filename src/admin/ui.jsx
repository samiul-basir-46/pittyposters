import { useEffect, useRef } from 'react'
import { CloseIcon } from '../components/Icons'

export function Modal({ title, onClose, children, footer, size = 'md' }) {
  const ref = useRef(null)
  useEffect(() => {
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    ref.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div className="a-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={'a-modal ' + size} role="dialog" aria-modal="true" aria-label={title}>
        <div className="a-modal-head">
          <h2>{title}</h2>
          <button ref={ref} type="button" className="a-icon-btn" aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className="a-modal-body">{children}</div>
        {footer && <div className="a-modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={'a-field ' + className}>
      <span className="a-label">{label}</span>
      {children}
      {hint && <span className="a-hint">{hint}</span>}
    </label>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="a-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="a-switch" aria-hidden="true" />
      <span>{label}</span>
    </label>
  )
}

export function Badge({ status }) {
  return <span className={'a-badge b-' + status}>{status}</span>
}

export function PageHead({ title, sub, children }) {
  return (
    <div className="a-pagehead">
      <div>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {children && <div className="a-pagehead-actions">{children}</div>}
    </div>
  )
}

export function Empty({ title, children }) {
  return (
    <div className="a-empty">
      <p className="a-empty-title">{title}</p>
      {children && <p>{children}</p>}
    </div>
  )
}
