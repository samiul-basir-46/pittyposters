import { useState } from 'react'
import { createOrder, deleteOrder, patchOrder, useData } from '../store/store'
import { ORDER_STATUSES } from '../store/seed'
import { money, normPhone, waNumber } from '../utils'
import PosterFace from '../components/PosterFace'
import { Badge, Empty, Field, Modal, PageHead } from './ui'
import { useNotify, useSaved } from './notify'
import { createSteadfastConsignment } from './steadfastApi'
import { dispatchOrder, hasShipment } from './dispatchFlow'

const dateFmt = (iso) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

function OrderDetail({ id }) {
  const { orders, settings, posters } = useData()
  const notify = useNotify()
  const saved = useSaved()
  const order = orders.find((item) => item.id === id)
  const [note, setNote] = useState(order?.adminNote || '')
  const [trackingLink, setTrackingLink] = useState(null)
  const [dispatchForm, setDispatchForm] = useState(null)
  const [dispatching, setDispatching] = useState(false)
  const [dispatchError, setDispatchError] = useState('')
  if (!order) return <Empty title="Order not found"><a href="/admin/orders">Back to all orders</a></Empty>
  const wa = waNumber(order.customer.phone)
  const quantity = order.items.reduce((total, item) => total + item.qty, 0)
  const shipped = hasShipment(order)
  const savedTrackingLink = trackingLink ?? order.trackingUrl ?? ''
  const trackingUrl = /^https:\/\/(www\.)?steadfast\.com\.bd\//i.test(savedTrackingLink) ? savedTrackingLink : ''
  const saveTrackingLink = () => {
    const value = savedTrackingLink.trim()
    if (value) {
      try {
        const url = new URL(value)
        if (url.protocol !== 'https:' || !['steadfast.com.bd', 'www.steadfast.com.bd'].includes(url.hostname)) throw new Error()
      } catch {
        notify('Use the HTTPS tracking link from Steadfast.', 'error')
        return
      }
    }
    saved(patchOrder(order.id, { trackingUrl: value }), 'Tracking link saved')
  }
  const openDispatch = () => {
    setDispatchError('')
    setDispatchForm({
      recipient_name: order.customer.recipient || order.customer.name || '',
      recipient_phone: normPhone(order.customer.deliveryPhone || order.customer.phone || ''),
      alternative_phone: '',
      recipient_address: order.customer.address || '',
      cod_amount: String(Number(order.total) || 0),
      item_description: order.items.map((item) => `${item.title}${item.size ? ` (${item.size})` : ''}`).join(', ').slice(0, 200),
      note: '',
    })
  }
  const submitDispatch = async (event) => {
    event.preventDefault()
    if (!dispatchForm || dispatching) return
    setDispatching(true)
    setDispatchError('')
    try {
      const result = await dispatchOrder({
        order,
        form: dispatchForm,
        email: order.customer.email || '',
        createConsignment: createSteadfastConsignment,
        recordShipment: async (orderId, fields) => {
          const ok = patchOrder(orderId, fields)
          if (!ok) throw new Error('Could not save the shipment to browser storage.')
        },
      })
      if (result.ok) {
        setTrackingLink(result.fields.trackingUrl || '')
        setDispatchForm(null)
        notify('Steadfast shipment created. Tracking details are now saved to this order.')
      } else {
        setDispatchError(result.message)
        if (result.stage !== 'courier') setDispatchForm(null)
      }
    } catch (error) {
      setDispatchError(error instanceof Error ? error.message : 'Steadfast dispatch failed.')
    } finally {
      setDispatching(false)
    }
  }
  const remove = () => {
    if (!window.confirm(`Delete order ${order.id}? This cannot be undone.`)) return
    saved(deleteOrder(order.id), 'Order deleted')
    window.location.assign('/admin/orders')
  }

  return (
    <div className="a-order-detail">
      <PageHead title={`Order ${order.id}`} sub={`${dateFmt(order.createdAt)} · ${order.source === 'manual' ? 'Added by hand' : 'From website'} · ${order.userId ? 'Registered customer' : 'Guest checkout'}`}>
        <a className="a-btn" href="/admin/orders">← All orders</a>
      </PageHead>
      <div className="a-order-layout">
        <div className="a-order-primary">
        <section className="a-card a-order-items-card">
          <div className="a-card-head"><h2>Items ordered</h2><span>{quantity} {quantity === 1 ? 'item' : 'items'}</span></div>
          <ul className="a-order-items">
            {order.items.map((item, index) => {
              const poster = posters.find((candidate) => candidate.id === item.posterId)
              return (
                <li className="a-order-item" key={`${item.posterId || item.title}-${index}`}>
                  <div className="a-order-item-art">{poster ? <PosterFace p={poster} /> : <div className="a-order-missing">Poster<br />removed</div>}</div>
                  <div className="a-order-item-info">
                    <b>{item.title}</b>
                    <span>{item.size} · Quantity {item.qty}</span>
                    <small>{money(item.price, settings.currency)} each</small>
                    {item.details && <div className="a-song-order"><b>Song:</b> {item.details.songName}<br /><b>Lyrics:</b> {item.details.lyrics}</div>}
                  </div>
                  <strong className="a-order-item-total">{money(item.price * item.qty, settings.currency)}</strong>
                </li>
              )
            })}
          </ul>
        </section>
          <section className="a-card a-order-customer">
            <div className="a-card-head"><h2>Customer</h2><span>{order.userId ? 'Account' : 'Guest'}</span></div>
            <b>{order.customer.name}</b>
            <p>{order.customer.phone}</p>
            <p>{order.customer.address}</p>
            <div className="a-contact">
              <a className="a-btn sm" href={`tel:${order.customer.phone}`}>Call customer</a>
              {wa && <a className="a-btn sm" href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">WhatsApp</a>}
            </div>
            {order.note && <p className="a-note"><b>Customer note:</b> {order.note}</p>}
          </section>
          <section className="a-card">
            <div className="a-card-head"><h2>Payment summary</h2><span>Cash on delivery</span></div>
            <div className="a-sums">
              <span>Subtotal</span><span>{money(order.subtotal, settings.currency)}</span>
              <span>Delivery</span><span>{money(order.delivery, settings.currency)}</span>
              <b>Total due</b><b>{money(order.total, settings.currency)}</b>
            </div>
          </section>
        </div>
        <aside className="a-order-aside">
          {shipped ? (
            <section className="a-card a-shipment-card">
              <div className="a-card-head"><h2>Steadfast shipment</h2><Badge status="shipped" /></div>
              <p className="a-muted">Tracking code</p>
              <b className="a-tracking-code">{order.trackingNumber || order.tracking_code || order.consignmentId}</b>
              {order.consignmentId && <p className="a-muted">Consignment ID: {order.consignmentId}</p>}
              {trackingUrl ? <a className="a-btn sm" href={trackingUrl} target="_blank" rel="noreferrer">Track parcel ↗</a> : <a className="a-btn sm" href="https://steadfast.com.bd/tracking" target="_blank" rel="noreferrer">Open Steadfast tracking ↗</a>}
              <Field label="Steadfast tracking link">
                <input type="url" placeholder="Paste the tracking link from the Steadfast SMS" value={savedTrackingLink} onChange={(event) => setTrackingLink(event.target.value)} />
              </Field>
              <button type="button" className="a-btn sm" onClick={saveTrackingLink}>Save tracking link</button>
            </section>
          ) : ['pending', 'confirmed'].includes(order.status) && (
            <section className="a-card">
              <div className="a-card-head"><h2>Courier dispatch</h2></div>
              <p className="a-muted">Create a Steadfast consignment and save its tracking code to this order.</p>
              <button type="button" className="a-btn primary full" onClick={openDispatch}>Dispatch with Steadfast</button>
            </section>
          )}
          <section className="a-card">
            <div className="a-card-head"><h2>Order status</h2><Badge status={order.status} /></div>
            <select aria-label="Order status" value={order.status} onChange={(event) => saved(patchOrder(order.id, { status: event.target.value }), 'Status updated')}>
              {ORDER_STATUSES.map((status) => <option key={status}>{status}</option>)}
            </select>
          </section>
          <section className="a-card">
            <Field label="Private note">
              <textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} onBlur={() => note !== (order.adminNote || '') && saved(patchOrder(order.id, { adminNote: note }), 'Note saved')} placeholder="Only you can see this" />
            </Field>
          </section>
          <button type="button" className="a-btn danger" onClick={remove}>Delete order</button>
        </aside>
      </div>
      {dispatchForm && <div className="a-overlay" onMouseDown={(event) => event.target === event.currentTarget && !dispatching && setDispatchForm(null)}>
        <form className="a-modal lg a-dispatch-form" onSubmit={submitDispatch}>
          <div className="a-modal-head"><h2>Steadfast dispatch</h2><button type="button" className="a-icon-btn" disabled={dispatching} aria-label="Close dispatch form" onClick={() => setDispatchForm(null)}>×</button></div>
          <div className="a-modal-body">
            <p className="a-muted">Order {order.id} · Review the recipient and parcel details before dispatch.</p>
            <div className="a-dispatch-fields">
              {[['recipient_name', 'Recipient name', 'text'], ['recipient_phone', 'Recipient phone', 'tel'], ['alternative_phone', 'Alternative phone (optional)', 'tel'], ['cod_amount', `Cash on delivery (${settings.currency})`, 'number'], ['item_description', 'Parcel description', 'text']].map(([key, label, type]) => <label className="a-field" key={key}><span className="a-label">{label}</span><input type={type} required={key !== 'alternative_phone'} min={type === 'number' ? '0' : undefined} step={type === 'number' ? '1' : undefined} value={dispatchForm[key]} onChange={(event) => setDispatchForm({ ...dispatchForm, [key]: event.target.value })} /></label>)}
              <label className="a-field dispatch-address"><span className="a-label">Delivery address</span><textarea rows={3} required value={dispatchForm.recipient_address} onChange={(event) => setDispatchForm({ ...dispatchForm, recipient_address: event.target.value })} /></label>
              <label className="a-field dispatch-address"><span className="a-label">Courier rider note (optional)</span><textarea rows={2} value={dispatchForm.note} onChange={(event) => setDispatchForm({ ...dispatchForm, note: event.target.value })} /></label>
            </div>
            <p className="a-note">This creates a real Steadfast shipment. The order will be marked shipped after the courier confirms it.</p>
            {dispatchError && <p className="a-error" role="alert">{dispatchError}</p>}
          </div>
          <div className="a-modal-foot"><button type="button" className="a-btn" disabled={dispatching} onClick={() => setDispatchForm(null)}>Cancel</button><button type="submit" className="a-btn primary" disabled={dispatching}>{dispatching ? 'Dispatching…' : 'Confirm & dispatch'}</button></div>
        </form>
      </div>}
    </div>
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

export default function OrdersAdmin({ orderId }) {
  const { orders, settings, posters } = useData()
  const saved = useSaved()
  const [tab, setTab] = useState('all')
  const [q, setQ] = useState('')
  const [adding, setAdding] = useState(false)
  const cur = settings.currency

  const needle = q.trim().toLowerCase()
  const list = orders.filter(
    (o) =>
      (tab === 'all' || o.status === tab) &&
      (!needle || o.id.toLowerCase().includes(needle) || o.customer.name.toLowerCase().includes(needle) || o.customer.phone.includes(needle)),
  )

  if (orderId) return <OrderDetail id={orderId} />

  const countBy = (status) => orders.filter((o) => o.status === status).length
  const revenue = orders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + (Number(o.total) || 0), 0)
  const stats = [
    { label: 'Total orders', value: orders.length, hint: 'All time' },
    { label: 'Needs action', value: countBy('pending'), hint: 'Pending confirmation', tone: 'warn' },
    { label: 'In transit', value: countBy('confirmed') + countBy('shipped'), hint: 'Confirmed or shipped' },
    { label: 'Revenue', value: money(revenue, cur), hint: 'Excluding cancelled', tone: 'ok' },
  ]

  return (
    <>
      <PageHead title="Orders" sub={`${orders.length} order${orders.length === 1 ? '' : 's'} so far.`}>
        <button type="button" className="a-btn primary" onClick={() => setAdding(true)}>
          + New order
        </button>
      </PageHead>

      <div className="a-ostats">
        {stats.map((s) => (
          <div key={s.label} className={`a-ostat${s.tone ? ` is-${s.tone}` : ''}`}>
            <span>{s.label}</span>
            <b>{s.value}</b>
            <small>{s.hint}</small>
          </div>
        ))}
      </div>

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
        <div className="a-orders-list">
          <div className="a-orders-list-head"><span>Order</span><span>Order total</span><span>Status</span></div>
          <ul className="a-rows">
            {list.map((o) => {
              const quantity = o.items.reduce((n, item) => n + item.qty, 0)
              const href = `/admin/orders/${encodeURIComponent(o.id)}`
              const thumbs = o.items.slice(0, 3).map((item) => posters.find((poster) => poster.id === item.posterId))
              const extraThumbs = o.items.length - thumbs.length
              return (
                <li key={o.id} className={`a-orow is-${o.status}`}>
                  <a className="a-orow-main" href={href}>
                    <span className="a-orow-thumbs" aria-hidden="true">
                      {thumbs.map((poster, index) => (
                        <span className="a-orow-thumb" key={index} style={{ zIndex: thumbs.length - index }}>
                          {poster ? <PosterFace p={poster} /> : <span>Poster</span>}
                        </span>
                      ))}
                      {extraThumbs > 0 && <span className="a-orow-more">+{extraThumbs}</span>}
                    </span>
                    <span className="a-orow-info">
                      <span className="a-orow-title">
                        <b>{o.id}</b>
                        <span className="a-orow-source">{o.source === 'manual' ? 'Manual' : 'Website'}</span>
                      </span>
                      <span className="a-orow-customer">
                        <strong>{o.customer.name}</strong>
                        {o.customer.phone && <span>{o.customer.phone}</span>}
                      </span>
                      <small>{dateFmt(o.createdAt)} · {quantity} {quantity === 1 ? 'item' : 'items'}</small>
                      <span className="a-orow-items">
                        {o.items.slice(0, 2).map((item, index) => <span key={`${item.posterId || item.title}-${index}`}>{item.title} × {item.qty}</span>)}
                        {o.items.length > 2 && <span>+{o.items.length - 2} more</span>}
                      </span>
                    </span>
                  </a>
                  <div className="a-orow-total"><small>Order total</small><b>{money(o.total, cur)}</b><em>Cash on delivery</em></div>
                  <div className="a-orow-side">
                    <select className={`a-order-status-select is-${o.status}`} aria-label={`Order status for ${o.id}`} value={o.status} onChange={(e) => saved(patchOrder(o.id, { status: e.target.value }), 'Status updated')}>
                      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                    <a className="a-btn sm" href={href}>View details</a>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {adding && <NewOrder onClose={() => setAdding(false)} />}
    </>
  )
}
