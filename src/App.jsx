import { useCallback, useRef, useState } from 'react'
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

export default function App() {
  const [cart, setCart] = useState(0)
  const [toast, setToast] = useState('')
  const timer = useRef(0)

  const addToCart = useCallback((title) => {
    setCart((n) => n + 1)
    setToast(`${title} added to cart`)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(''), 2200)
  }, [])

  return (
    <>
      <Intro />
      <FX />
      <Header count={cart} />
      <main>
        <Hero />
        <Marquee />
        <PosterWall onAdd={addToCart} />
        <HowItWorks />
        <About />
      </main>
      <Footer />
      <div className={'toast' + (toast ? ' show' : '')} role="status" aria-live="polite">
        {toast}
      </div>
    </>
  )
}
