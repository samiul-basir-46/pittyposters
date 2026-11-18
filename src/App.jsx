import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import Intro from './components/Intro'
import FX from './components/FX'
import Header from './components/Header'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import PosterWall from './components/PosterWall'
import HowItWorks from './components/HowItWorks'
import About from './components/About'
import Footer from './components/Footer'
import ProductModal from './components/ProductModal'
import CartDrawer from './components/CartDrawer'
import AccountModal from './components/AccountModal'
import AdminApp from './admin/AdminApp'
import { useData } from './store/store'

function Site({ accountRoute, posterRoute, cartRoute, shopRoute, navigate }) {
  const { settings } = useData()
  const [toast, setToast] = useState('')
  const timer = useRef(0)

  const notify = useCallback((msg) => {
    setToast(msg)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(''), 2400)
  }, [])

  // the product being viewed may be edited/deleted in another tab
  const { posters } = useData()
  const live = posterRoute && posters.find((p) => p.id === posterRoute)

  return (
    <>
      <Intro />
      <FX />
      <Header onCart={() => navigate('/cart')} onAccount={() => navigate('/account')} onHome={() => navigate('/')} />
      <main>
        {cartRoute ? (
          <CartDrawer
            page
            onClose={() => navigate('')}
            onLogin={() => navigate('/account')}
          />
        ) : posterRoute ? (
          live ? <ProductModal poster={live} currency={settings.currency} onClose={() => navigate('/shop')} onAdded={(message) => { notify(message); navigate('/cart') }} /> : <p className="wall-empty">This poster could not be found.</p>
        ) : shopRoute ? (
          <PosterWall onOpen={(poster) => navigate(`/poster/${encodeURIComponent(poster.id)}`)} />
        ) : (
          <>
            <Hero />
            <Marquee />
            <PosterWall onOpen={(poster) => navigate(`/poster/${encodeURIComponent(poster.id)}`)} />
            <HowItWorks />
            <About />
          </>
        )}
      </main>
      <Footer />
      {accountRoute && <AccountModal initialTab={accountRoute} onNavigate={navigate} onClose={() => navigate('')} onNotify={notify} />}
      <div className={'toast' + (toast ? ' show' : '')} role="status" aria-live="polite">
        {toast}
      </div>
    </>
  )
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname)
  const isAccountPath = /^\/account(?:\/|$)/.test(window.location.pathname)

  useEffect(() => {
    if (!isAccountPath || window.history.state?.accountPageEntry) return
    const accountPath = window.location.pathname
    window.history.replaceState({}, '', '/')
    window.history.pushState({ accountPageEntry: true }, '', accountPath)
  }, [])

  useEffect(() => {
    const on = () => setPath(window.location.pathname)
    window.addEventListener('popstate', on)
    return () => {
      window.removeEventListener('popstate', on)
    }
  }, [])

  useEffect(() => {
    const section = path.match(/^\/(shop|how|about|contact)\/?$/)?.[1]
    if (section) requestAnimationFrame(() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    else if (path === '/') window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [path])

  if (path === '/admin' || path.startsWith('/admin/')) return <AdminApp path={path} />
  const accountRoute = path.match(/^\/account(?:\/(profile|orders))?\/?$/)
  const cartRoute = /^\/cart\/?$/.test(path)
  const shopRoute = /^\/shop\/?$/.test(path)
  const posterMatch = path.match(/^\/poster\/([^/]+)\/?$/)
  let posterRoute = null
  if (posterMatch) {
    try {
      posterRoute = decodeURIComponent(posterMatch[1])
    } catch {
      posterRoute = '__invalid__'
    }
  }
  const navigate = (next, { replace = false } = {}) => {
    const target = next || '/'
    if (window.location.pathname !== target) {
      const state = target.startsWith('/account') ? { accountPageEntry: true } : {}
      if (replace || !next) {
        window.history.replaceState(state, '', target)
      } else {
        if (target.startsWith('/account') && window.location.pathname !== '/') window.history.replaceState({}, '', '/')
        window.history.pushState(state, '', target)
      }
      setPath(target)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  return <Site accountRoute={accountRoute ? accountRoute[1] || 'profile' : null} posterRoute={posterRoute} cartRoute={cartRoute} shopRoute={shopRoute} navigate={navigate} />
}
