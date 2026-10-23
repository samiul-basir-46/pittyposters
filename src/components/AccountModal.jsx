import { useEffect, useRef, useState } from 'react'
import { useData, useUser } from '../store/store'
import { changePassword, logIn, logOut, signUp, updateProfile } from '../store/auth'
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

function LoginForm({ onDone }) {
  const [v, setV] = useState({ id: '', pw: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    const r = await logIn(v.id, v.pw)
    setBusy(false)
    if (r.error) setError(r.error)
    else onDone(`Welcome back, ${r.user.name.split(' ')[0]}!`)
  }
  return (
    <form onSubmit={submit} noValidate>
      <label className="f">
        <span>Phone number or email</span>
        <input value={v.id} onChange={(e) => setV({ ...v, id: e.target.value })} autoComplete="username" autoFocus />
      </label>
      <label className="f">
        <span>Password</span>
        <input type="password" value={v.pw} onChange={(e) => setV({ ...v, pw: e.target.value })} autoComplete="current-password" />
      </label>
      <Err text={error} />
      <button type="submit" className="btn btn-solid full acc-submit" disabled={busy}>
        {busy ? 'Checking…' : 'Log in'}
      </button>
    </form>
  )
}

function SignupForm({ onDone }) {
  const [v, setV] = useState({ name: '', phone: '', email: '', address: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }))
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    const r = await signUp(v)
    setBusy(false)
    if (r.error) setError(r.error)
    else onDone(`Welcome, ${r.user.name.split(' ')[0]}! Your account is ready.`)
  }
  return (
    <form onSubmit={submit} noValidate>
      <label className="f">
        <span>Full name</span>
        <input value={v.name} onChange={set('name')} autoComplete="name" autoFocus />
      </label>
      <label className="f">
        <span>Phone number</span>
        <input value={v.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" />
      </label>
      <label className="f">
        <span>Email (optional)</span>
        <input type="email" value={v.email} onChange={set('email')} autoComplete="email" />
      </label>
      <label className="f">
        <span>Delivery address (optional)</span>
        <textarea rows={2} value={v.address} onChange={set('address')} autoComplete="street-address" />
      </label>
      <label className="f">
        <span>Password (6+ characters)</span>
        <input type="password" value={v.password} onChange={set('password')} autoComplete="new-password" />
      </label>
      <Err text={error} />
      <button type="submit" className="btn btn-solid full acc-submit" disabled={busy}>
        {busy ? 'Creating…' : 'Create account'}
      </button>
    </form>
  )
}

function Profile({ user, onNotify }) {
  const [v, setV] = useState({ name: user.name, phone: user.phone, email: user.email, address: user.address })
  const [pw, setPw] = useState({ cur: '', next: '' })
  const [error, setError] = useState('')
  const [pwError, setPwError] = useState('')
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }))

  const save = (e) => {
    e.preventDefault()
    const r = updateProfile(user.id, v)
    if (r.error) return setError(r.error)
    setError('')
    onNotify('Profile saved')
  }
  const savePw = async (e) => {
    e.preventDefault()
    const r = await changePassword(user, pw.cur, pw.next)
    if (r.error) return setPwError(r.error)
    setPwError('')
    setPw({ cur: '', next: '' })
    onNotify('Password changed')
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

      <form onSubmit={savePw} noValidate className="acc-pw">
        <h3>Change password</h3>
        <label className="f">
          <span>Current password</span>
          <input type="password" value={pw.cur} onChange={(e) => setPw({ ...pw, cur: e.target.value })} autoComplete="current-password" />
        </label>
        <label className="f">
          <span>New password</span>
          <input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" />
        </label>
        <Err text={pwError} />
        <button type="submit" className="btn btn-outline full">
          Change password
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
  const [tab, setTab] = useState(initialTab === 'signup' ? 'signup' : 'login')
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
    : [
        ['login', 'Log in'],
        ['signup', 'Sign up'],
      ]

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
              <h2>{view === 'signup' ? 'Create your account' : 'Welcome back'}</h2>
              <p>{view === 'signup' ? 'Save your details and track your orders.' : 'Log in to see your orders and check out faster.'}</p>
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
          {view === 'login' && <LoginForm onDone={done} />}
          {view === 'signup' && <SignupForm onDone={done} />}
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
