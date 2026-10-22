import { useState } from 'react'
import './App.css'

const CATEGORIES = ['All', 'Typography', 'Abstract', 'Nature', 'Minimal']

const POSTERS = [
  { title: 'Midnight Bloom', cat: 'Abstract', tag: 'No. 01', word: 'Bloom', bg: '#2b1620', fg: '#fcefee', shapeBg: '#e16191', radius: '50%', shapeW: '58%' },
  { title: 'Soft Hours', cat: 'Minimal', tag: 'No. 02', word: 'Soft\nhours', bg: '#efb5c8', fg: '#2b1620', shapeBg: '#fcefee', radius: '999px 999px 0 0', shapeW: '50%' },
  { title: 'Keep Going', cat: 'Typography', tag: 'No. 03', word: 'Keep\ngoing', bg: '#f4a7c0', fg: '#2b1620', shapeBg: '#2b1620', radius: '0', shapeW: '16%' },
  { title: 'Tide Lines', cat: 'Nature', tag: 'No. 04', word: 'Tide', bg: '#8e2f55', fg: '#fcefee', shapeBg: '#f7c9d4', radius: '50% 50% 0 0', shapeW: '64%' },
  { title: 'Paper Sun', cat: 'Abstract', tag: 'No. 05', word: 'Sun', bg: '#fcefee', fg: '#2b1620', shapeBg: '#e16191', radius: '50%', shapeW: '70%' },
  { title: 'Quiet Grid', cat: 'Minimal', tag: 'No. 06', word: 'Quiet', bg: '#f7c9d4', fg: '#2b1620', shapeBg: '#2b1620', radius: '0', shapeW: '40%' },
  { title: 'Loud & Clear', cat: 'Typography', tag: 'No. 07', word: 'Loud\n& clear', bg: '#e16191', fg: '#2b1620', shapeBg: '#ffffff', radius: '50%', shapeW: '24%' },
  { title: 'Green Room', cat: 'Nature', tag: 'No. 08', word: 'Green', bg: '#5a1f3c', fg: '#fcefee', shapeBg: '#f4a7c0', radius: '50% 0 50% 0', shapeW: '56%' },
]

function Intro() {
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

function Poster({ p, onAdd }) {
  return (
    <article className="card">
      <div className="poster" style={{ background: p.bg, color: p.fg }}>
        <div className="poster-tag">{p.tag}</div>
        <div className="poster-art">
          <div
            style={{
              width: p.shapeW,
              aspectRatio: '1',
              borderRadius: p.radius,
              background: p.shapeBg,
            }}
          />
        </div>
        <div className="poster-word">{p.word}</div>
      </div>
      <div className="card-info">
        <div>
          <div className="card-title">{p.title}</div>
          <div className="card-meta">{p.cat} · A3 / A2</div>
        </div>
        <div className="card-price">৳[PRICE]</div>
      </div>
      <button type="button" className="add-btn" onClick={onAdd}>
        Add to cart
      </button>
    </article>
  )
}

function App() {
  const [filter, setFilter] = useState('All')
  const [cart, setCart] = useState(0)

  const visible = POSTERS.filter((p) => filter === 'All' || p.cat === filter)

  return (
    <>
      <Intro />

      <header className="header">
        <a href="#top" className="brand">
          <span className="brand-dot" />
          Pitty Posters
        </a>
        <nav className="nav">
          <a href="#shop">Shop</a>
          <a href="#how">How it works</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <button type="button" className="cart-btn" aria-label="Cart">
            Cart · {cart}
          </button>
        </nav>
      </header>

      <section id="top" className="hero">
        <div className="hero-text">
          <div className="eyebrow pp-up" style={{ animationDelay: '2.4s' }}>
            Prints for plain walls
          </div>
          <h1 className="pp-up" style={{ animationDelay: '2.55s' }}>
            Walls deserve better.
          </h1>
          <p className="pp-up" style={{ animationDelay: '2.7s' }}>
            Simple, bold posters you can pick in a minute and hang by the
            weekend. No clutter, just good prints.
          </p>
          <div className="hero-actions pp-up" style={{ animationDelay: '2.85s' }}>
            <a href="#shop" className="btn btn-primary">
              Browse posters
            </a>
            <a href="#how" className="btn btn-outline">
              How it works
            </a>
          </div>
        </div>
        <div className="hero-art pp-up" style={{ animationDelay: '2.7s' }}>
          <div className="hero-stack">
            <div className="hs1">
              <span>
                Keep
                <br />
                going.
              </span>
            </div>
            <div className="hs2">
              <span />
            </div>
            <div className="hs3">
              <i style={{ width: '70%' }} />
              <i style={{ width: '45%' }} />
              <i style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      </section>

      <section id="shop" className="shop">
        <div className="shop-inner">
          <div className="shop-head">
            <h2 className="section-title">The poster wall</h2>
            <div className="chips">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={'chip' + (c === filter ? ' on' : '')}
                  aria-pressed={c === filter}
                  onClick={() => setFilter(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="grid">
            {visible.map((p) => (
              <Poster key={p.title} p={p} onAdd={() => setCart((n) => n + 1)} />
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="how">
        <h2 className="section-title">Three steps. That&apos;s it.</h2>
        <div className="steps">
          <div className="step s1">
            <div className="step-num">01</div>
            <div className="step-title">Pick a poster</div>
            <div className="step-text">
              Scroll the wall, filter by style, choose one you like.
            </div>
          </div>
          <div className="step s2">
            <div className="step-num">02</div>
            <div className="step-title">Choose a size</div>
            <div className="step-text">
              [Add your available sizes and frame options here.]
            </div>
          </div>
          <div className="step s3">
            <div className="step-num">03</div>
            <div className="step-title">We deliver</div>
            <div className="step-text">
              [Add your delivery areas and timing here.]
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="about">
        <div className="about-inner">
          <div className="about-text">
            <h2>Small shop. Big prints.</h2>
            <p>
              Pitty Posters is a simple place to find posters that make a room
              feel like yours. [Write your own story here in two or three
              lines.]
            </p>
          </div>
          <div className="about-art">
            <div style={{ background: '#e16191' }} />
            <div style={{ background: '#f4a7c0', marginTop: 28 }} />
            <div style={{ background: '#f7c9d4' }} />
          </div>
        </div>
      </section>

      <footer id="contact" className="footer">
        <div className="footer-brand">
          <b>Pitty Posters</b>
          <span>Questions or custom orders? Say hello.</span>
        </div>
        <div className="footer-contact">
          <b>Contact</b>
          <div>[Your email]</div>
          <div>[Your phone / WhatsApp]</div>
          <div>[Your Facebook / Instagram]</div>
        </div>
        <div className="footer-copy">© Pitty Posters</div>
      </footer>
    </>
  )
}

export default App
