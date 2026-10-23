import { useEffect, useRef, useState } from 'react'
import { addToCart } from '../store/store'
import { money } from '../utils'
import PosterFace from './PosterFace'
import { CloseIcon } from './Icons'

export default function ProductModal({ poster, currency, onClose, onAdded }) {
  const [size, setSize] = useState(poster.sizes[0]?.label)
  const [qty, setQty] = useState(1)
  const closeRef = useRef(null)
  const sold = poster.status === 'soldout'
  const price = Number(poster.sizes.find((s) => s.label === size)?.price) || 0

  useEffect(() => {
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const add = () => {
    addToCart(poster.id, size, qty)
    onAdded(`${poster.title} (${size}) added to cart`)
    onClose()
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal product-modal" role="dialog" aria-modal="true" aria-label={poster.title}>
        <button ref={closeRef} type="button" className="modal-x" aria-label="Close" onClick={onClose}>
          <CloseIcon />
        </button>
        <div className="pm-art">
          <PosterFace p={poster} badge={sold ? 'Sold out' : ''} />
        </div>
        <div className="pm-info">
          <p className="pm-cat">{poster.cat}</p>
          <h3 className="pm-title">{poster.title}</h3>
          <p className="pm-price">{money(price, currency)}</p>
          {poster.desc && <p className="pm-desc">{poster.desc}</p>}

          <p className="pm-label">Size</p>
          <div className="pm-sizes" role="group" aria-label="Choose size">
            {poster.sizes.map((s) => (
              <button
                key={s.label}
                type="button"
                className={'chip' + (s.label === size ? ' on' : '')}
                aria-pressed={s.label === size}
                onClick={() => setSize(s.label)}
              >
                {s.label} · {money(s.price, currency)}
              </button>
            ))}
          </div>

          <p className="pm-label">Quantity</p>
          <div className="stepper" role="group" aria-label="Quantity">
            <button type="button" aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))}>
              −
            </button>
            <span aria-live="polite">{qty}</span>
            <button type="button" aria-label="Increase" onClick={() => setQty((q) => Math.min(20, q + 1))}>
              +
            </button>
          </div>

          <button type="button" className="btn btn-solid pm-add" disabled={sold} onClick={add} data-magnetic={sold ? undefined : ''}>
            {sold ? 'Sold out' : `Add to cart · ${money(price * qty, currency)}`}
          </button>
        </div>
      </div>
    </div>
  )
}
