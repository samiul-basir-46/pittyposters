import { useEffect, useState } from 'react'
import { useCart, useUser } from '../store/store'
import { CartIcon, CloseIcon, HeartLogo, MenuIcon, UserIcon } from './Icons'
import { scrollToSection } from '../utils'

const NAV_LINKS = [
  { id: 'top', label: 'Home' },
  { id: 'shop', label: 'Shop' },
  { id: 'how', label: 'How it works' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
]

export default function Header({ onCart, onAccount, onHome }) {
  const [open, setOpen] = useState(false)
  const count = useCart().reduce((n, l) => n + l.qty, 0)
  const user = useUser()

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="site-header">
      <div className="container header-row">
        <nav className="nav-desktop" aria-label="Main navigation">
          {NAV_LINKS.map((l) => (
            <a key={l.id} href={l.id === 'top' ? '/' : `/${l.id}`} className="nav-link" onClick={(event) => { event.preventDefault(); l.id === 'top' ? onHome() : scrollToSection(l.id) }}>
              {l.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="menu-btn"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>

        <a href="/" className="logo-badge" aria-label="Pitty Posters home" onClick={(event) => { event.preventDefault(); onHome() }} data-magnetic>
          <HeartLogo />
        </a>

        <div className="header-right">
          <button
            type="button"
            className="cart-link acct-link"
            aria-label={user ? `My account, ${user.name}` : 'Log in or sign up'}
            onClick={onAccount}
            data-magnetic
          >
            {user ? <span className="acct-avatar">{user.name.trim()[0].toUpperCase()}</span> : <UserIcon />}
          </button>
          <button type="button" className="cart-link" aria-label={`Cart, ${count} items`} onClick={onCart} data-magnetic>
            <CartIcon />
            {count > 0 && (
              <span key={count} className="cart-badge">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" className="mobile-nav">
          <nav aria-label="Mobile navigation">
            {NAV_LINKS.map((l) => (
              <a key={l.id} href={l.id === 'top' ? '/' : `/${l.id}`} onClick={(event) => { event.preventDefault(); setOpen(false); l.id === 'top' ? onHome() : scrollToSection(l.id) }}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
