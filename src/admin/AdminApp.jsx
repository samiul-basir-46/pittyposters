import { useCallback, useEffect, useRef, useState } from 'react'
import './admin.css'
import { useData } from '../store/store'
import { DEFAULT_PASSWORD } from '../store/seed'
import { sha256 } from '../utils'
import { HeartLogo } from '../components/Icons'
import { NotifyContext } from './notify'
import Dashboard from './Dashboard'
import PostersAdmin from './PostersAdmin'
import CategoriesAdmin from './CategoriesAdmin'
import OrdersAdmin from './OrdersAdmin'
import CustomersAdmin from './CustomersAdmin'
import ContentAdmin from './ContentAdmin'
import SettingsAdmin from './SettingsAdmin'

const SESSION_KEY = 'pp:admin-session'

const NAV = [
  { to: '#/admin', label: 'Dashboard', page: Dashboard },
  { to: '#/admin/posters', label: 'Posters', page: PostersAdmin },
  { to: '#/admin/categories', label: 'Categories', page: CategoriesAdmin },
  { to: '#/admin/orders', label: 'Orders', page: OrdersAdmin },
  { to: '#/admin/customers', label: 'Customers', page: CustomersAdmin },
  { to: '#/admin/content', label: 'Site content', page: ContentAdmin },
  { to: '#/admin/settings', label: 'Settings', page: SettingsAdmin },
]

function Login({ onDone }) {
  const { settings } = useData()
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const [entered, expected] = await Promise.all([
        sha256(pw),
        settings.passHash ? Promise.resolve(settings.passHash) : sha256(DEFAULT_PASSWORD),
      ])
      if (entered === expected) {
        try {
          sessionStorage.setItem(SESSION_KEY, '1')
        } catch {
          /* private mode: session just won't survive a reload */
        }
        onDone()
      } else {
        setError('Wrong password. Please try again.')
      }
    } catch {
      setError('Login needs a secure (https) connection.')
    }
    setBusy(false)
  }

  return (
    <div className="a-login">
      <form className="a-login-card" onSubmit={submit}>
        <div className="a-login-logo">
          <HeartLogo size={34} />
        </div>
        <h1>{settings.storeName} admin</h1>
        <p>Enter your password to manage the shop.</p>
        <label className="a-field">
          <span className="a-label">Password</span>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoComplete="current-password"
            autoFocus
            required
          />
        </label>
        {error && (
          <p className="a-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="a-btn primary full" disabled={busy}>
          {busy ? 'Checking…' : 'Log in'}
        </button>
        <a className="a-link center" href="#/">
          ← Back to website
        </a>
      </form>
    </div>
  )
}

export default function AdminApp({ hash }) {
  const { settings } = useData()
  const [authed, setAuthed] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === '1'
    } catch {
      return false
    }
  })
  const [toast, setToast] = useState(null)
  const timer = useRef(0)

  const notify = useCallback((message, kind = 'ok') => {
    setToast({ message, kind })
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(null), kind === 'error' ? 5000 : 2200)
  }, [])

  useEffect(() => {
    const prev = document.title
    document.title = `Admin · ${settings.storeName}`
    window.scrollTo(0, 0)
    return () => {
      document.title = prev
    }
  }, [settings.storeName])

  const logout = () => {
    try {
      sessionStorage.removeItem(SESSION_KEY)
    } catch {
      /* ignore */
    }
    setAuthed(false)
  }

  if (!authed) return <Login onDone={() => setAuthed(true)} />

  const path = hash.split('?')[0].replace(/\/$/, '')
  const current = NAV.find((n) => n.to === path) || NAV[0]
  const Page = current.page

  return (
    <NotifyContext.Provider value={notify}>
      <div className="adm">
        <aside className="adm-side">
          <a href="#/admin" className="adm-brand">
            <span className="adm-brand-logo">
              <HeartLogo size={24} />
            </span>
            <span>
              <b>{settings.storeName}</b>
              <small>Admin</small>
            </span>
          </a>
          <nav className="adm-nav" aria-label="Admin navigation">
            {NAV.map((n) => (
              <a key={n.to} href={n.to} className={n.to === current.to ? 'on' : ''} aria-current={n.to === current.to ? 'page' : undefined}>
                {n.label}
              </a>
            ))}
          </nav>
          <div className="adm-side-foot">
            <a href="#/" className="a-link">
              View website ↗
            </a>
            <button type="button" className="a-link" onClick={logout}>
              Log out
            </button>
          </div>
        </aside>
        <main className="adm-main">
          <Page />
        </main>
        <div className={'a-toast' + (toast ? ' show ' + toast.kind : '')} role="status" aria-live="polite">
          {toast?.message}
        </div>
      </div>
    </NotifyContext.Provider>
  )
}
