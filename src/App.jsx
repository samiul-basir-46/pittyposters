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
import AdminApp from './admin/AdminApp'
import { useData } from './store/store'

function Site() {
  const { settings } = useData()
  const [product, setProduct] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState('')
  const timer = useRef(0)

  const notify = useCallback((msg) => {
    setToast(msg)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(''), 2400)
  }, [])

  // the product being viewed may be edited/deleted in another tab
  const { posters } = useData()
  const live = product && posters.find((p) => p.id === product.id)

  return (
    <>
      <Intro />
      <FX />
      <Header onCart={() => setCartOpen(true)} />
      <main>
        <Hero />
        <Marquee />
        <PosterWall onOpen={setProduct} />
        <HowItWorks />
        <About />
      </main>
      <Footer />
      {live && <ProductModal poster={live} currency={settings.currency} onClose={() => setProduct(null)} onAdded={notify} />}
      {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} />}
      <div className={'toast' + (toast ? ' show' : '')} role="status" aria-live="polite">
        {toast}
      </div>
    </>
  )
}

export default function App() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const on = () => setHash(window.location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  if (hash.startsWith('#/admin')) return <AdminApp hash={hash} />
  return <Site />
}
