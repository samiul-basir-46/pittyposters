import { useEffect, useRef, useState } from 'react'
import { addToCart } from '../store/store'
import { money } from '../utils'
import PosterFace from './PosterFace'
import { CloseIcon } from './Icons'

export default function ProductModal({ poster, currency, onClose, onAdded }) {
  const [size, setSize] = useState(poster.sizes[0]?.label)
  const [qty, setQty] = useState(1)
  const [songName, setSongName] = useState('')
  const [lyrics, setLyrics] = useState('')
  const songBook = poster.productType === 'songbook'
  const closeRef = useRef(null)
  const sold = poster.status === 'soldout'
  const price = Number(poster.sizes.find((s) => s.label === size)?.price) || 0

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const add = () => {
    if (songBook && (!songName.trim() || !lyrics.trim())) return
    addToCart(poster.id, size, qty, songBook ? { songName: songName.trim(), lyrics: lyrics.trim() } : null)
    onAdded(`${poster.title} (${size}) added to cart`)
  }

  return (
    <section className="product-page" aria-label={`${poster.title} details`}>
      <button type="button" className="btn btn-outline product-back" onClick={onClose}>Back to posters</button>
      <div className="product-modal product-page-card">
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

          {songBook && (
            <div className="pm-song-fields">
              <label className="f">
                <span>Song name</span>
                <input value={songName} onChange={(e) => setSongName(e.target.value)} placeholder="Enter the song name" required />
              </label>
              <label className="f">
                <span>Song lyrics</span>
                <textarea value={lyrics} onChange={(e) => setLyrics(e.target.value)} rows={7} placeholder="Paste or write the lyrics here" required />
              </label>
              <p className="pm-hint">Recommended: 60–80 words. No word limit.</p>
            </div>
          )}

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

          <button type="button" className="btn btn-solid pm-add" disabled={sold || (songBook && (!songName.trim() || !lyrics.trim()))} onClick={add} data-magnetic={sold ? undefined : ''}>
            {sold ? 'Sold out' : `Add to cart · ${money(price * qty, currency)}`}
          </button>
        </div>
      </div>
    </section>
  )
}
