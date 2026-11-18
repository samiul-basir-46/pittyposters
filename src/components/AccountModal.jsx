import { useEffect, useRef, useState } from 'react'
import { useData, useUser } from '../store/store'
import { logOut, renderGoogleSignIn, updateProfile } from '../store/auth'
import { money } from '../utils'
import { CloseIcon } from './Icons'
import PosterFace from './PosterFace'

const dateFmt = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

function Err({ text }) {
  return text ? (
    <p className="form-error" role="alert">
      {text}
    </p>
  ) : null
}

function GoogleLogin({ onDone }) {
  const buttonRef = useRef(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let cleanup = () => {}
    renderGoogleSignIn(buttonRef.current, (user) => onDone(`Welcome, ${user.name.split(' ')[0]}!`), setError).then((cancel) => {
      cleanup = cancel
    })
    return () => cleanup()
  }, [onDone])
  return (
    <div>
      <div ref={buttonRef} className="google-login-button" />
      <Err text={error} />
      <p className="acct-hint">Use your Google account to log in or create your account.</p>
    </div>
  )
}

function Profile({ user, onNotify }) {
  const [v, setV] = useState({ name: user.name, phone: user.phone, email: user.email, address: user.address })
  const [error, setError] = useState('')
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }))

  const save = (e) => {
    e.preventDefault()
    const r = updateProfile(user.id, v)
    if (r.error) return setError(r.error)
    setError('')
    onNotify('Profile saved')
  }
  return (
    <>
      <form onSubmit={save} noValidate>
        <label className="f">
          <span>Full name</span>
          <input value={v.name} onChange={set('name')} autoComplete="name" />
        </label>
        <label className="f">
          <span>Phone number</span>
          <input value={v.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" />
        </label>
        <label className="f">
          <span>Email</span>
          <input type="email" value={v.email} onChange={set('email')} autoComplete="email" />
        </label>
        <label className="f">
          <span>Delivery address</span>
          <textarea rows={3} value={v.address} onChange={set('address')} autoComplete="street-address" />
        </label>
        <Err text={error} />
        <button type="submit" className="btn btn-solid full acc-submit">
          Save profile
        </button>
      </form>
    </>
  )
}

function Orders({ user, currency }) {
  const { orders, posters } = useData()
  const mine = orders.filter((o) => o.userId === user.id)
  if (!mine.length)
    return (
      <div className="acc-empty">
        <p className="done-title">No orders yet</p>
        <p>Orders you place while logged in will show up here.</p>
      </div>
    )

  const statusLabels = { pending: 'Order received', confirmed: 'Confirmed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' }
  const steps = ['pending', 'confirmed', 'shipped', 'delivered']

  return (
    <div className="acc-orders">
      <div className="acc-orders-heading"><h3>Order history</h3><span>{mine.length} {mine.length === 1 ? 'order' : 'orders'}</span></div>
      {mine.map((order) => {
        const status = String(order.status || 'pending').toLowerCase()
        const trackingNumber = order.trackingNumber || order.tracking_code || order.steadfastTrackingCode
        const trackingLink = order.trackingUrl || order.tracking_link || ''
        const safeTrackingLink = /^https:\/\/(www\.)?steadfast\.com\.bd\//i.test(trackingLink) ? trackingLink : 'https://steadfast.com.bd/tracking'
        const activeStep = steps.indexOf(status)
        return (
          <article key={order.id} className="acc-order">
            <header className="acc-order-header">
              <div><span className="acc-order-eyebrow">Order number</span><h4>{order.id}</h4></div>
              <span className={`acc-order-status is-${status}`}>{statusLabels[status] || status}</span>
            </header>
            <div className="acc-order-meta"><span>Placed on {dateFmt(order.createdAt)}</span><span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span></div>
            {status === 'cancelled' ? (
              <p className="acc-order-cancelled">This order was cancelled.</p>
            ) : (
              <ol className="acc-order-progress" aria-label={`Order status: ${statusLabels[status] || status}`}>
                {steps.map((step, index) => <li key={step} className={index <= activeStep ? 'is-complete' : ''}><span className="acc-progress-dot" /><span>{statusLabels[step]}</span></li>)}
              </ol>
            )}
            <ul className="acc-order-items">
              {order.items.map((item, index) => {
                const poster = posters.find((candidate) => candidate.id === item.posterId)
                return (
                  <li className="acc-order-item" key={`${item.posterId || item.title}-${index}`}>
                    <div className="acc-order-art">{poster ? <PosterFace p={poster} /> : <span aria-hidden="true">Poster</span>}</div>
                    <div className="acc-order-item-info"><b>{item.title}</b><span>{item.size} · Qty {item.qty}</span>{item.details?.songName && <small>Song: {item.details.songName}</small>}</div>
                    <strong>{money((Number(item.price) || 0) * (Number(item.qty) || 0), currency)}</strong>
                  </li>
                )
              })}
            </ul>
            {trackingNumber && (
              <div className="acc-order-tracking"><div><span className="acc-order-eyebrow">Steadfast tracking</span><b>{trackingNumber}</b></div><a href={safeTrackingLink} target="_blank" rel="noreferrer">Track parcel <span aria-hidden="true">&#8599;</span></a></div>
            )}
            <footer className="acc-order-total"><span>Order total</span><b>{money(order.total, currency)}</b></footer>
          </article>
        )
      })}
    </div>
  )
}
export default function AccountModal({ initialTab, onNavigate, onClose, onNotify }) {
  const user = useUser()
  const { settings } = useData()
  const [tab, setTab] = useState(initialTab === 'orders' ? 'orders' : 'login')
  const closeRef = useRef(null)

  useEffect(() => {
    if (initialTab === 'profile' || initialTab === 'orders') setTab(initialTab)
  }, [initialTab])

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

  const view = user ? (tab === 'orders' ? 'orders' : 'profile') : tab === 'signup' ? 'signup' : 'login'
  const done = (msg) => {
    onNotify(msg)
    setTab('profile')
    onNavigate('/account/profile', { replace: true })
  }
  const tabs = user
    ? [
        ['profile', 'Profile'],
        ['orders', 'My orders'],
      ]
    : [['login', 'Log in']]

  return (
    <div className={(view === 'profile' || view === 'orders') ? 'overlay acc-screen' : 'overlay'} onMouseDown={(e) => e.target === e.currentTarget && view !== 'profile' && view !== 'orders' && onClose()}>
      <div className={(view === 'profile' || view === 'orders') ? 'modal acc-modal acc-profile-screen' : 'modal acc-modal'} role="dialog" aria-modal="true" aria-label="Account">
        <button ref={closeRef} type="button" className="modal-x" aria-label="Close" onClick={onClose}>
          <CloseIcon />
        </button>

        <div className="acc-head">
          {user ? (
            <>
              <span className="acct-avatar lg">{user.name.trim()[0].toUpperCase()}</span>
              <div>
                <h2>{user.name}</h2>
                <p>{user.email || user.phone}</p>
              </div>
            </>
          ) : (
            <div>
              <h2>Welcome</h2>
              <p>Log in with Google to see your orders and check out faster.</p>
            </div>
          )}
          <a className="acc-home-link" href="/" aria-label="Go to home page" onClick={(event) => { event.preventDefault(); onNavigate('/') }}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3.5 10 8.5-7 8.5 7M5.5 9v11h13V9M9.5 20v-7h5v7" /></svg>
            <span>Home</span>
          </a>
        </div>

        <div className="acc-tabs" role="tablist">
          {tabs.map(([k, label]) => (
            <button key={k} type="button" role="tab" aria-selected={view === k} className={view === k ? 'on' : ''} onClick={() => { setTab(k); onNavigate(`/account/${k}`, { replace: true }) }}>
              {label}
            </button>
          ))}
        </div>

        <div className="acc-body">
          {view === 'login' && <GoogleLogin onDone={done} />}
          {view === 'profile' && user && <Profile key={user.id + user.name} user={user} onNotify={onNotify} />}
          {view === 'orders' && user && <Orders user={user} currency={settings.currency} />}
        </div>

        {user && (
          <div className="acc-foot">
            <button
              type="button"
              className="btn btn-outline full"
              onClick={() => {
                logOut()
                onNotify('You have been logged out')
                onClose()
              }}
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
