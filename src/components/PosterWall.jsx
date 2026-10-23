import { useState } from 'react'
import { useData } from '../store/store'
import { fromPrice, money } from '../utils'
import PosterFace from './PosterFace'

function Card({ p, index, animate, currency, onOpen }) {
  const sold = p.status === 'soldout'
  const multi = p.sizes.length > 1
  return (
    <div className={'card-wrap' + (animate ? ' card-in' : '')} style={{ '--i': index }}>
      <article className="card tilt" data-tilt>
        <button
          type="button"
          className="poster-btn"
          data-cursor="View"
          aria-label={`View ${p.title}`}
          onClick={() => onOpen(p)}
        >
          <PosterFace p={p} badge={sold ? 'Sold out' : p.featured ? 'Popular' : ''} />
        </button>
        <h3 className="card-name">{p.title}</h3>
        <p className="card-sub">
          {p.cat} · {p.sizes.map((s) => s.label).join(' / ')} · {multi ? 'from ' : ''}
          {money(fromPrice(p), currency)}
        </p>
        <button type="button" className="btn btn-solid btn-sm add-btn" disabled={sold} onClick={() => onOpen(p)} data-magnetic={sold ? undefined : ''}>
          {sold ? 'Sold out' : 'Add to cart'}
        </button>
      </article>
    </div>
  )
}

export default function PosterWall({ onOpen }) {
  const { posters, categories, content, settings } = useData()
  const [filter, setFilter] = useState('All')
  const [animate, setAnimate] = useState(false)

  const shown = posters.filter((p) => p.status !== 'hidden')
  const usedCats = categories.filter((c) => shown.some((p) => p.cat === c))
  const chips = ['All', ...usedCats]
  const active = chips.includes(filter) ? filter : 'All'
  const visible = shown.filter((p) => active === 'All' || p.cat === active)

  const pick = (c) => {
    setAnimate(true)
    setFilter(c)
  }

  return (
    <section id="shop" className="wall">
      <div className="container">
        <h2 className="script-title reveal">{content.wallTitle}</h2>
        <p className="section-sub reveal" style={{ '--d': '.08s' }}>
          {content.wallSub}
        </p>

        {chips.length > 2 && (
          <div className="chips reveal" style={{ '--d': '.14s' }} role="group" aria-label="Filter posters">
            {chips.map((c) => (
              <button
                key={c}
                type="button"
                className={'chip' + (c === active ? ' on' : '')}
                aria-pressed={c === active}
                onClick={() => pick(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="reveal" style={{ '--d': '.2s' }}>
          {visible.length === 0 ? (
            <p className="wall-empty">New posters are coming soon. Check back shortly.</p>
          ) : (
            <div className="grid" key={active}>
              {visible.map((p, i) => (
                <Card key={p.id} p={p} index={i} animate={animate} currency={settings.currency} onOpen={onOpen} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
