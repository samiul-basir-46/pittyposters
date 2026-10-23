import { useEffect } from 'react'

// Opening animation: posters rise, logo reveals, curtain lifts (~3s).
export default function Intro() {
  useEffect(() => {
    const root = document.documentElement
    root.style.overflow = 'hidden'
    const t = setTimeout(() => {
      root.style.overflow = ''
    }, 3000)
    return () => {
      clearTimeout(t)
      root.style.overflow = ''
    }
  }, [])

  return (
    <div className="intro" aria-hidden="true">
      <div className="intro-cards">
        <div className="intro-card c1" />
        <div className="intro-card c2">
          <span />
        </div>
        <div className="intro-card c3" />
      </div>
      <div className="intro-logo-wrap">
        <span className="intro-logo">Pitty Posters</span>
      </div>
      <div className="intro-tag">Prints for plain walls</div>
      <div className="intro-bar-track">
        <div className="intro-bar" />
      </div>
    </div>
  )
}
