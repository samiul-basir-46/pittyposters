import { useState } from 'react'
import { createOrder, deleteOrder, patchOrder, useData } from '../store/store'
import { ORDER_STATUSES } from '../store/seed'
import { money, waNumber } from '../utils'
import { Badge, Empty, Field, Modal, PageHead } from './ui'
import { useNotify, useSaved } from './notify'

const dateFmt = (iso) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

function OrderDetail({ id, onClose }) {
  const { orders, settings } = useData()
  const notify = useNotify()
  const saved = useSaved()
  const o = orders.find((x) => x.id === id)
  const [note, setNote] = useState(o?.adminNote || '')
  if (!o) return null
  const cur = settings.currency
  const wa = waNumber(o.customer.phone)

  const remove = () => {
    if (window.confirm(`Delete order ${o.id}? This cannot be undone.`)) {
      deleteOrder(o.id)
      notify('Order deleted')
      onClose()
    }
  }

  return (
    <Modal
      title={`Order ${o.id}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="a-btn danger" onClick={remove}>
            Delete
          </button>
          <button type="button" className="a-btn primary" onClick={onClose}>
            Done
          </button>
        </>
      }
    >
      <div className="a-detail">
        <div className="a-detail-top">
          <span className="a-muted">
            {dateFmt(o.createdAt)} · {o.source === 'manual' ? 'Added by hand' : 'From website'}
          </span>
          <select
            aria-label="Order status"
            value={o.status}
            onChange={(e) => saved(patchOrder(o.id, { status: e.target.value }), 'Status updated')}
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <section>
          <h3>Customer</h3>
          <p>
            <b>{o.customer.name}</b>
          </p>
          <p>{o.customer.address}</p>
          <p className="a-contact">
            <a className="a-btn sm" href={`tel:${o.customer.phone}`}>
              Call {o.customer.phone}
            </a>
            {wa && (
              <a className="a-btn sm" href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            )}
          </p>
          {o.note && (
            <p className="a-note">
              <b>Customer note:</b> {o.note}
            </p>
          )}
        </section>

        <section>
          <h3>Items</h3>
          <ul className="a-items">
            {o.items.map((i, n) => (
              <li key={n}>
                <span>
                  {i.title} <span className="a-muted">({i.size}) × {i.qty}</span>
                </span>
                <b>{money(i.price * i.qty, cur)}</b>
              </li>
            ))}
          </ul>
          <div className="a-sums">
            <span>Subtotal</span>
            <span>{money(o.subtotal, cur)}</span>
            <span>Delivery</span>
            <span>{money(o.delivery, cur)}</span>
            <b>Total (cash on delivery)</b>
            <b>{money(o.total, cur)}</b>
          </div>
        </section>

        <Field label="Your private note">
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => note !== (o.adminNote || '') && saved(patchOrder(o.id, { adminNote: note }), 'Note saved')}
            placeholder="Only you can see this"
          />
        </Field>
      </div>
    </Modal>
  )
}

function NewOrder({ onClose }) {
  const { posters, settings } = useData()
  const saved = useSaved()
  const options = posters.filter((p) => p.status !== 'hidden')
  const [c, setC] = useState({ name: '', phone: '', address: '' })
  const [note, setNote] = useState('')
  const [status, setStatus] = useState('confirmed')
  const [delivery, setDelivery] = useState(String(settings.deliveryCharge))
  const [lines, setLines] = useState([{ posterId: options[0]?.id || '', size: options[0]?.sizes[0]?.label || '', qty: 1 }])
  const [error, setError] = useState('')
  const cur = settings.currency

  const setLine = (i, patch) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)))
  const priceOf = (l) => Number(posters.find((p) => p.id === l.posterId)?.sizes.find((s) => s.label === l.size)?.price) || 0
  const subtotal = lines.reduce((s, l) => s + priceOf(l) * l.qty, 0)

  const submit = (e) => {
    e.preventDefault()
    if (!c.name.trim() || !c.phone.trim() || !c.address.trim()) return setError('Customer name, phone and address are needed.')
    const items = lines
      .filter((l) => l.posterId)
      .map((l) => {
        const p = posters.find((x) => x.id === l.posterId)
        return { posterId: l.posterId, title: p.title, size: l.size, price: priceOf(l), qty: Number(l.qty) || 1 }
      })
    if (!items.length) return setError('Add at least one poster.')
    createOrder({ customer: { name: c.name.trim(), phone: c.phone.trim(), address: c.address.trim() }, note, items, delivery, source: 'manual', status })
    saved(true, 'Order added')
    onClose()
  }

  return (
    <Modal
      title="New order"
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button type="button" className="a-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="order-form" className="a-btn primary">
            Add order
          </button>
        </>
      }
    >
      <form id="order-form" onSubmit={submit} noValidate className="a-form-cols">
        <div className="a-row2">
          <Field label="Customer name">
            <input value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} />
          </Field>
          <Field label="Phone">
            <input value={c.phone} onChange={(e) => setC({ ...c, phone: e.target.value })} inputMode="tel" />
          </Field>
        </div>
        <Field label="Address">
          <textarea rows={2} value={c.address} onChange={(e) => setC({ ...c, address: e.target.value })} />
        </Field>

        <div className="a-field">
          <span className="a-label">Items</span>
          {lines.map((l, i) => {
            const p = posters.find((x) => x.id === l.posterId)
            return (
              <div className="a-line-row" key={i}>
                <select
                  aria-label="Poster"
                  value={l.posterId}
                  onChange={(e) => {
                    const np = posters.find((x) => x.id === e.target.value)
                    setLine(i, { posterId: e.target.value, size: np?.sizes[0]?.label || '' })
                  }}
                >
                  {options.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.title}
                    </option>
                  ))}
                </select>
                <select aria-label="Size" value={l.size} onChange={(e) => setLine(i, { size: e.target.value })}>
                  {(p?.sizes || []).map((s) => (
                    <option key={s.label} value={s.label}>
                      {s.label} · {money(s.price, cur)}
                    </option>
                  ))}
                </select>
                <input
                  aria-label="Quantity"
                  type="number"
                  min="1"
                  max="20"
                  value={l.qty}
                  onChange={(e) => setLine(i, { qty: Math.max(1, Math.min(20, Number(e.target.value) || 1)) })}
                />
                <button
                  type="button"
                  className="a-icon-btn"
                  aria-label="Remove item"
                  disabled={lines.length === 1}
                  onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))}
                >
                  ×
                </button>
              </div>
            )
          })}
          <button
            type="button"
            className="a-btn sm"
            onClick={() => setLines((ls) => [...ls, { posterId: options[0]?.id || '', size: options[0]?.sizes[0]?.label || '', qty: 1 }])}
          >
            + Add item
          </button>
        </div>

        <div className="a-row2">
          <Field label={`Delivery charge (${cur})`}>
            <input value={delivery} onChange={(e) => setDelivery(e.target.value)} inputMode="numeric" />
          </Field>
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {ORDER_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Note (optional)">
          <input value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>

        <p className="a-total">
          Total: <b>{money(subtotal + (Number(delivery) || 0), cur)}</b>
        </p>
        {error && (
          <p className="a-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </Modal>
  )
}

export default function OrdersAdmin() {
  const { orders, settings } = useData()
  const saved = useSaved()
  const [tab, setTab] = useState('all')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)
  const [adding, setAdding] = useState(false)
  const cur = settings.currency

  const needle = q.trim().toLowerCase()
  const list = orders.filter(
    (o) =>
      (tab === 'all' || o.status === tab) &&
      (!needle || o.id.toLowerCase().includes(needle) || o.customer.name.toLowerCase().includes(needle) || o.customer.phone.includes(needle)),
  )

  return (
    <>
      <PageHead title="Orders" sub={`${orders.length} order${orders.length === 1 ? '' : 's'} so far.`}>
        <button type="button" className="a-btn primary" onClick={() => setAdding(true)}>
          + New order
        </button>
      </PageHead>

      <div className="a-tabs" role="tablist">
        {['all', ...ORDER_STATUSES].map((s) => (
          <button key={s} type="button" role="tab" aria-selected={tab === s} className={tab === s ? 'on' : ''} onClick={() => setTab(s)}>
            {s}
            <span>{s === 'all' ? orders.length : orders.filter((o) => o.status === s).length}</span>
          </button>
        ))}
      </div>

      <div className="a-toolbar">
        <input className="a-search" type="search" placeholder="Search by order number, name or phone…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search orders" />
      </div>

      {list.length === 0 ? (
        <Empty title={orders.length ? 'No orders match' : 'No orders yet'}>
          {orders.length ? 'Try another tab or search.' : 'Orders from the website and orders you add by hand will appear here.'}
        </Empty>
      ) : (
        <ul className="a-rows">
          {list.map((o) => (
            <li key={o.id} className="a-orow">
              <button type="button" className="a-orow-main" onClick={() => setOpen(o.id)}>
                <span>
                  <b>{o.id}</b> · {o.customer.name}
                  <small>
                    {dateFmt(o.createdAt)} · {o.items.reduce((n, i) => n + i.qty, 0)} item(s)
                  </small>
                </span>
                <b>{money(o.total, cur)}</b>
              </button>
              <div className="a-orow-side">
                <Badge status={o.status} />
                <select
                  aria-label={`Status of ${o.id}`}
                  value={o.status}
                  onChange={(e) => saved(patchOrder(o.id, { status: e.target.value }), 'Status updated')}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && <OrderDetail id={open} onClose={() => setOpen(null)} />}
      {adding && <NewOrder onClose={() => setAdding(false)} />}
    </>
  )
}
