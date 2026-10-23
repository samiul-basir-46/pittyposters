import { useState } from 'react'
import { CATEGORIES, POSTERS } from '../data'

function PosterArt({ p }) {
  switch (p.kind) {
    case 'grid':
      return (
        <div className="art-grid" style={{ width: p.w }}>
          <i style={{ background: p.c1 }} />
          <i style={{ background: p.c2 }} />
          <i style={{ background: p.c2 }} />
          <i style={{ background: p.c1 }} />
        </div>
      )
    case 'waves':
      return (
        <div className="art-waves" style={{ background: p.c1 }}>
          <div style={{ background: p.c2 }}>
            <div style={{ background: p.bg }} />
          </div>
        </div>
      )
    case 'bars':
      return (
        <div className="art-bars">
          {['100%', '64%', '82%', '48%'].map((w) => (
            <i key={w} style={{ width: w, background: p.c1 }} />
          ))}
        </div>
      )
    case 'ring':
      return <div className="art-ring" style={{ width: p.w, borderColor: p.c1 }} />
    default:
      return (
        <div className="art-shape-wrap" style={{ width: p.w }}>
          <div className="art-shape" style={{ borderRadius: p.radius, background: p.c1 }} />
          {p.dot && <span className="art-dot" style={{ background: p.c2 }} />}
        </div>
      )
  }
}

function Card({ p, index, animate, onAdd }) {
  return (
    <div className={'card-wrap' + (animate ? ' card-in' : '')} style={{ '--i': index }}>
      <article className="card tilt" data-tilt>
        <div className="poster" style={{ background: p.bg, color: p.fg }} data-cursor="View">
          <div className="poster-tag">{p.tag}</div>
          <div className="poster-art">
            <PosterArt p={p} />
          </div>
          <div className="poster-word">{p.word}</div>
        </div>
        <h3 className="card-name">{p.title}</h3>
        <p className="card-sub">
          {p.cat} · A3 / A2 · ৳[PRICE]
        </p>
        <button type="button" className="btn btn-solid btn-sm add-btn" onClick={onAdd} data-magnetic>
          Add to cart
        </button>
      </article>
    </div>
  )
}

export default function PosterWall({ onAdd }) {
  const [filter, setFilter] = useState('All')
  const [animate, setAnimate] = useState(false)
  const visible = POSTERS.filter((p) => filter === 'All' || p.cat === filter)

  const pick = (c) => {
    setAnimate(true)
    setFilter(c)
  }

  return (
    <section id="shop" className="wall">
      <div className="container">
        <h2 className="script-title reveal">The poster wall</h2>
        <p className="section-sub reveal" style={{ '--d': '.08s' }}>
          Pick a style, find your favourite.
        </p>

        <div className="chips reveal" style={{ '--d': '.14s' }} role="group" aria-label="Filter posters">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={'chip' + (c === filter ? ' on' : '')}
              aria-pressed={c === filter}
              onClick={() => pick(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="reveal" style={{ '--d': '.2s' }}>
          <div className="grid" key={filter}>
            {visible.map((p, i) => (
              <Card key={p.id} p={p} index={i} animate={animate} onAdd={() => onAdd(p.title)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
