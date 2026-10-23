import { useEffect, useRef, useState } from 'react'
import { useData, useUser } from '../store/store'
import { logOut, renderGoogleSignIn, updateProfile } from '../store/auth'
import { money } from '../utils'
import { CloseIcon } from './Icons'

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
  const { orders } = useData()
  const mine = orders.filter((o) => o.userId === user.id)
  if (!mine.length)
    return (
      <div className="acc-empty">
        <p className="done-title">No orders yet</p>
        <p>Orders you place while logged in will show up here.</p>
      </div>
    )
  return (
    <ul className="acc-orders">
      {mine.map((o) => (
        <li key={o.id} className="acc-order">
          <div className="acc-order-top">
            <b>{o.id}</b>
            <span className={'a-badge b-' + o.status}>{o.status}</span>
          </div>
          <p className="acc-order-date">{dateFmt(o.createdAt)}</p>
          <ul>
            {o.items.map((i, n) => (
              <li key={n}>
                {i.title} ({i.size}) × {i.qty}
              </li>
            ))}
          </ul>
          <p className="acc-order-total">
            Total <b>{money(o.total, currency)}</b>
          </p>
        </li>
      ))}
    </ul>
  )
}

export default function AccountModal({ initialTab, onClose, onNotify }) {
  const user = useUser()
  const { settings } = useData()
  const [tab, setTab] = useState(initialTab === 'orders' ? 'orders' : 'login')
  const closeRef = useRef(null)

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
  }
  const tabs = user
    ? [
        ['profile', 'Profile'],
        ['orders', 'My orders'],
      ]
    : [['login', 'Log in']]

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal acc-modal" role="dialog" aria-modal="true" aria-label="Account">
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
        </div>

        <div className="acc-tabs" role="tablist">
          {tabs.map(([k, label]) => (
            <button key={k} type="button" role="tab" aria-selected={view === k} className={view === k ? 'on' : ''} onClick={() => setTab(k)}>
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
