import { useState } from 'react'
import { deletePoster, newPosterId, patchPoster, savePoster, useData } from '../store/store'
import { compressImage, fromPrice, money } from '../utils'
import PosterFace from '../components/PosterFace'
import { Badge, Empty, Field, Modal, PageHead, Toggle } from './ui'
import { useNotify, useSaved } from './notify'

const KINDS = [
  { v: 'shape', label: 'Shape' },
  { v: 'grid', label: 'Grid' },
  { v: 'waves', label: 'Arches' },
  { v: 'bars', label: 'Bars' },
  { v: 'ring', label: 'Ring' },
]
const SHAPES = [
  { v: '50%', label: 'Circle' },
  { v: '999px 999px 0 0', label: 'Arch' },
  { v: '50% 0 50% 0', label: 'Leaf' },
  { v: '0', label: 'Square' },
]
const STATUS = [
  { v: 'active', label: 'On sale' },
  { v: 'soldout', label: 'Sold out' },
  { v: 'hidden', label: 'Hidden' },
]

const blank = (categories, count) => ({
  id: newPosterId(),
  title: '',
  cat: categories[0] || '',
  tag: `No. ${String(count + 1).padStart(2, '0')}`,
  word: '',
  status: 'active',
  featured: false,
  desc: '',
  image: null,
  sizes: [
    { label: 'A3', price: '' },
    { label: 'A2', price: '' },
  ],
  bg: '#512e30',
  fg: '#fbf6f7',
  kind: 'shape',
  c1: '#e16191',
  c2: '#d3a6ea',
  w: '58%',
  radius: '50%',
  dot: false,
})

function PosterForm({ initial, isNew, onClose }) {
  const { categories, settings } = useData()
  const notify = useNotify()
  const saved = useSaved()
  const [p, setP] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setP((x) => ({ ...x, [k]: v }))

  const setSize = (i, k, v) => setP((x) => ({ ...x, sizes: x.sizes.map((s, j) => (j === i ? { ...s, [k]: v } : s)) }))
  const addSize = () => setP((x) => ({ ...x, sizes: [...x.sizes, { label: '', price: '' }] }))
  const removeSize = (i) => setP((x) => ({ ...x, sizes: x.sizes.filter((_, j) => j !== i) }))

  const onImage = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      set('image', await compressImage(file))
    } catch (err) {
      notify(err.message, 'error')
    }
    setBusy(false)
  }

  const submit = (e) => {
    e.preventDefault()
    const title = p.title.trim()
    if (!title) return setError('Please give the poster a name.')
    if (!p.cat) return setError('Please choose a category (add one in Categories first).')
    const sizes = p.sizes.map((s) => ({ label: s.label.trim(), price: Number(s.price) }))
    if (!sizes.length) return setError('Add at least one size with a price.')
    if (sizes.some((s) => !s.label || !Number.isFinite(s.price) || s.price <= 0)) return setError('Every size needs a name and a price above 0.')
    if (new Set(sizes.map((s) => s.label.toLowerCase())).size !== sizes.length) return setError('Two sizes have the same name.')
    setError('')
    const ok = savePoster({ ...p, title, sizes, word: p.word.trim() || title })
    saved(ok, isNew ? 'Poster added' : 'Poster updated')
    if (ok !== false) onClose()
  }

  const preview = { ...p, title: p.title || 'Poster name', word: p.word || p.title || 'Title' }

  return (
    <Modal
      title={isNew ? 'Add poster' : 'Edit poster'}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button type="button" className="a-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="poster-form" className="a-btn primary" disabled={busy}>
            {isNew ? 'Add poster' : 'Save changes'}
          </button>
        </>
      }
    >
      <form id="poster-form" className="a-poster-form" onSubmit={submit} noValidate>
        <div className="a-preview">
          <p className="a-label">Preview</p>
          <div className="a-preview-card">
            <PosterFace p={preview} badge={p.status === 'soldout' ? 'Sold out' : p.featured ? 'Popular' : ''} />
          </div>
        </div>

        <div className="a-form-cols">
          <Field label="Poster name">
            <input value={p.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Midnight Bloom" />
          </Field>
          <div className="a-row2">
            <Field label="Category">
              <select value={p.cat} onChange={(e) => set('cat', e.target.value)}>
                {categories.length === 0 && <option value="">No categories yet</option>}
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select value={p.status} onChange={(e) => set('status', e.target.value)}>
                {STATUS.map((s) => (
                  <option key={s.v} value={s.v}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Description (optional)">
            <textarea rows={2} value={p.desc} onChange={(e) => set('desc', e.target.value)} />
          </Field>

          <div className="a-field">
            <span className="a-label">Sizes and prices ({settings.currency})</span>
            {p.sizes.map((s, i) => (
              <div className="a-size-row" key={i}>
                <input aria-label="Size name" value={s.label} onChange={(e) => setSize(i, 'label', e.target.value)} placeholder="A3" />
                <input
                  aria-label="Price"
                  value={s.price}
                  onChange={(e) => setSize(i, 'price', e.target.value)}
                  inputMode="numeric"
                  placeholder="Price"
                />
                <button type="button" className="a-icon-btn" aria-label="Remove size" onClick={() => removeSize(i)} disabled={p.sizes.length === 1}>
                  ×
                </button>
              </div>
            ))}
            <button type="button" className="a-btn sm" onClick={addSize}>
              + Add size
            </button>
          </div>

          <Toggle checked={p.featured} onChange={(v) => set('featured', v)} label="Mark as popular" />

          <div className="a-field">
            <span className="a-label">Poster look</span>
            <div className="a-upload">
              <label className="a-btn sm">
                {busy ? 'Working…' : p.image ? 'Replace photo' : 'Upload photo'}
                <input type="file" accept="image/*" hidden onChange={onImage} />
              </label>
              {p.image && (
                <button type="button" className="a-btn sm danger" onClick={() => set('image', null)}>
                  Remove photo
                </button>
              )}
            </div>
            <span className="a-hint">
              {p.image ? 'Using your photo. Remove it to use the generated design below.' : 'No photo? Use the generated design below.'}
            </span>
          </div>

          {!p.image && (
            <div className="a-gen">
              <div className="a-row2">
                <Field label="Design">
                  <select value={p.kind} onChange={(e) => set('kind', e.target.value)}>
                    {KINDS.map((k) => (
                      <option key={k.v} value={k.v}>
                        {k.label}
                      </option>
                    ))}
                  </select>
                </Field>
                {p.kind === 'shape' ? (
                  <Field label="Shape">
                    <select value={p.radius} onChange={(e) => set('radius', e.target.value)}>
                      {SHAPES.map((s) => (
                        <option key={s.v} value={s.v}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                ) : (
                  <span />
                )}
              </div>
              <div className="a-colors">
                {[
                  ['bg', 'Background'],
                  ['fg', 'Text'],
                  ['c1', 'Main colour'],
                  ['c2', 'Accent'],
                ].map(([k, label]) => (
                  <label key={k} className="a-color">
                    <input type="color" value={p[k]} onChange={(e) => set(k, e.target.value)} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <div className="a-row2">
                <Field label="Tag">
                  <input value={p.tag} onChange={(e) => set('tag', e.target.value)} />
                </Field>
                <Field label="Big word (on poster)">
                  <textarea rows={2} value={p.word} onChange={(e) => set('word', e.target.value)} placeholder={p.title} />
                </Field>
              </div>
              {p.kind === 'shape' && <Toggle checked={p.dot} onChange={(v) => set('dot', v)} label="Little accent dot" />}
            </div>
          )}

          {error && (
            <p className="a-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </form>
    </Modal>
  )
}

export default function PostersAdmin() {
  const { posters, categories, settings } = useData()
  const notify = useNotify()
  const saved = useSaved()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')
  const [editing, setEditing] = useState(null) // {poster, isNew}

  const list = posters.filter(
    (p) => (cat === 'all' || p.cat === cat) && p.title.toLowerCase().includes(q.trim().toLowerCase()),
  )

  const remove = (p) => {
    if (window.confirm(`Delete "${p.title}"? This cannot be undone.`)) {
      deletePoster(p.id)
      notify('Poster deleted')
    }
  }
  const duplicate = (p) => {
    const copy = { ...p, id: newPosterId(), title: p.title + ' (copy)', sizes: p.sizes.map((s) => ({ ...s })) }
    saved(savePoster(copy), 'Poster duplicated')
  }

  return (
    <>
      <PageHead title="Posters" sub={`${posters.length} posters in your shop.`}>
        <button type="button" className="a-btn primary" onClick={() => setEditing({ poster: blank(categories, posters.length), isNew: true })}>
          + Add poster
        </button>
      </PageHead>

      <div className="a-toolbar">
        <input className="a-search" type="search" placeholder="Search posters…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search posters" />
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filter by category">
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {list.length === 0 ? (
        <Empty title={posters.length ? 'No posters match' : 'No posters yet'}>
          {posters.length ? 'Try a different search.' : 'Add your first poster to show it on the website.'}
        </Empty>
      ) : (
        <ul className="a-rows">
          {list.map((p) => (
            <li key={p.id} className="a-prow">
              <div className="a-prow-thumb">
                <PosterFace p={p} />
              </div>
              <div className="a-prow-main">
                <b>{p.title}</b>
                <span>
                  {p.cat} · {p.sizes.map((s) => `${s.label} ${money(s.price, settings.currency)}`).join(' · ')}
                </span>
                <span className="a-muted">from {money(fromPrice(p), settings.currency)}</span>
              </div>
              <div className="a-prow-status">
                <Badge status={p.status} />
                <select
                  aria-label={`Status of ${p.title}`}
                  value={p.status}
                  onChange={(e) => saved(patchPoster(p.id, { status: e.target.value }), 'Status updated')}
                >
                  {STATUS.map((s) => (
                    <option key={s.v} value={s.v}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="a-prow-actions">
                <button type="button" className="a-btn sm" onClick={() => setEditing({ poster: p, isNew: false })}>
                  Edit
                </button>
                <button type="button" className="a-btn sm" onClick={() => duplicate(p)}>
                  Duplicate
                </button>
                <button type="button" className="a-btn sm danger" onClick={() => remove(p)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && <PosterForm key={editing.poster.id} initial={editing.poster} isNew={editing.isNew} onClose={() => setEditing(null)} />}
    </>
  )
}
