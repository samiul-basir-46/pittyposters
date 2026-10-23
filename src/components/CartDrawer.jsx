import { useEffect, useRef, useState } from 'react'
import { clearCart, createOrder, removeFromCart, resolveCart, setCartQty, useCart, useData } from '../store/store'
import { money, waNumber } from '../utils'
import PosterFace from './PosterFace'
import { CloseIcon } from './Icons'

function whatsappText(order, currency, storeName) {
  const lines = order.items.map((i) => `• ${i.title} (${i.size}) × ${i.qty} = ${money(i.price * i.qty, currency)}`)
  return [
    `New order ${order.id} · ${storeName}`,
    '',
    ...lines,
    '',
    `Subtotal: ${money(order.subtotal, currency)}`,
    `Delivery: ${money(order.delivery, currency)}`,
    `Total: ${money(order.total, currency)} (cash on delivery)`,
    '',
    `Name: ${order.customer.name}`,
    `Phone: ${order.customer.phone}`,
    `Address: ${order.customer.address}`,
    order.note ? `Note: ${order.note}` : '',
  ]
    .filter((l, i, a) => l !== '' || a[i - 1] !== '')
    .join('\n')
}

export default function CartDrawer({ onClose }) {
  const { posters, settings } = useData()
  const lines = resolveCart(useCart(), posters)
  const { currency, deliveryCharge, whatsapp, storeName } = settings
  const [step, setStep] = useState('cart') // cart | checkout | done
  const [form, setForm] = useState({ name: '', phone: '', address: '', note: '' })
  const [error, setError] = useState('')
  const [placed, setPlaced] = useState(null)
  const closeRef = useRef(null)

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0)
  const delivery = lines.length ? Number(deliveryCharge) || 0 : 0
  const wa = waNumber(whatsapp)

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

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const phoneDigits = form.phone.replace(/\D/g, '')
    if (!form.name.trim() || !form.address.trim()) return setError('Please fill in your name and address.')
    if (phoneDigits.length < 10) return setError('Please enter a valid phone number.')
    setError('')
    const order = createOrder({
      customer: { name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim() },
      note: form.note.trim(),
      delivery,
      items: lines.map((l) => ({ posterId: l.posterId, title: l.poster.title, size: l.size, price: l.price, qty: l.qty })),
    })
    clearCart()
    setPlaced(order)
    setStep('done')
    if (wa) window.open(`https://wa.me/${wa}?text=${encodeURIComponent(whatsappText(order, currency, storeName))}`, '_blank', 'noopener')
  }

  return (
    <div className="overlay overlay-right" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Shopping cart">
        <div className="drawer-head">
          <h2>{step === 'done' ? 'Order placed' : step === 'checkout' ? 'Checkout' : 'Your cart'}</h2>
          <button ref={closeRef} type="button" className="modal-x static" aria-label="Close cart" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {step === 'done' && placed && (
          <div className="drawer-body done">
            <div className="done-mark" aria-hidden="true">
              ♥
            </div>
            <p className="done-title">Thank you, {placed.customer.name.split(' ')[0]}!</p>
            <p>
              Your order <b>{placed.id}</b> is received. Total <b>{money(placed.total, currency)}</b>, pay on delivery.
            </p>
            {wa ? (
              <>
                <p>We opened WhatsApp with your order details. Please press send there so we can confirm it.</p>
                <a
                  className="btn btn-solid"
                  href={`https://wa.me/${wa}?text=${encodeURIComponent(whatsappText(placed, currency, storeName))}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open WhatsApp again
                </a>
              </>
            ) : (
              <p>We will contact you on {placed.customer.phone} to confirm.</p>
            )}
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Continue shopping
            </button>
          </div>
        )}

        {step !== 'done' && lines.length === 0 && (
          <div className="drawer-body done">
            <p className="done-title">Your cart is empty</p>
            <p>Pick a poster you like and it will show up here.</p>
            <button type="button" className="btn btn-solid" onClick={onClose}>
              Browse posters
            </button>
          </div>
        )}

        {step === 'cart' && lines.length > 0 && (
          <>
            <ul className="drawer-body lines">
              {lines.map((l) => (
                <li key={l.key} className="line">
                  <div className="line-thumb">
                    <PosterFace p={l.poster} />
                  </div>
                  <div className="line-info">
                    <p className="line-title">{l.poster.title}</p>
                    <p className="line-meta">
                      {l.size} · {money(l.price, currency)}
                    </p>
                    <div className="stepper sm">
                      <button type="button" aria-label="Decrease" onClick={() => setCartQty(l.key, l.qty - 1)}>
                        −
                      </button>
                      <span>{l.qty}</span>
                      <button type="button" aria-label="Increase" onClick={() => setCartQty(l.key, l.qty + 1)}>
                        +
                      </button>
                    </div>
                  </div>
                  <div className="line-end">
                    <b>{money(l.price * l.qty, currency)}</b>
                    <button type="button" className="link-btn" onClick={() => removeFromCart(l.key)}>
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="drawer-foot">
              <div className="sum">
                <span>Subtotal</span>
                <span>{money(subtotal, currency)}</span>
              </div>
              <div className="sum">
                <span>Delivery</span>
                <span>{money(delivery, currency)}</span>
              </div>
              <div className="sum total">
                <span>Total</span>
                <span>{money(subtotal + delivery, currency)}</span>
              </div>
              <button type="button" className="btn btn-solid full" onClick={() => setStep('checkout')}>
                Checkout
              </button>
            </div>
          </>
        )}

        {step === 'checkout' && lines.length > 0 && (
          <form className="drawer-form" onSubmit={submit} noValidate>
            <div className="drawer-body">
              <label className="f">
                <span>Full name</span>
                <input value={form.name} onChange={set('name')} autoComplete="name" required />
              </label>
              <label className="f">
                <span>Phone number</span>
                <input value={form.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" required />
              </label>
              <label className="f">
                <span>Delivery address</span>
                <textarea value={form.address} onChange={set('address')} rows={3} autoComplete="street-address" required />
              </label>
              <label className="f">
                <span>Note (optional)</span>
                <input value={form.note} onChange={set('note')} />
              </label>
              <p className="pay-note">Payment: cash on delivery.</p>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
            </div>
            <div className="drawer-foot">
              <div className="sum total">
                <span>Total</span>
                <span>{money(subtotal + delivery, currency)}</span>
              </div>
              <button type="submit" className="btn btn-solid full">
                {wa ? 'Place order on WhatsApp' : 'Place order'}
              </button>
              <button type="button" className="link-btn center" onClick={() => setStep('cart')}>
                Back to cart
              </button>
            </div>
          </form>
        )}
      </aside>
    </div>
  )
}
