import { useState } from 'react'
import { removeUser, useData } from '../store/store'
import { resetPassword } from '../store/auth'
import { money } from '../utils'
import { Badge, Empty, Modal, PageHead } from './ui'
import { useNotify } from './notify'

const dateFmt = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

function CustomerDetail({ id, onClose }) {
  const { users, orders, settings } = useData()
  const notify = useNotify()
  const u = users.find((x) => x.id === id)
  if (!u) return null
  const mine = orders.filter((o) => o.userId === u.id)
  const spent = mine.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0)

  const reset = async () => {
    const next = window.prompt(`Set a new password for ${u.name} (at least 6 characters). Tell them the new password, they can change it in their profile.`)
    if (next === null) return
    const r = await resetPassword(u.id, next)
    if (r.error) notify(r.error, 'error')
    else notify('Password reset')
  }
  const remove = () => {
    if (window.confirm(`Delete ${u.name}'s account? Their past orders stay in your Orders list.`)) {
      removeUser(u.id)
      notify('Customer deleted')
      onClose()
    }
  }

  return (
    <Modal
      title={u.name}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="a-btn danger" onClick={remove}>
            Delete account
          </button>
          <button type="button" className="a-btn" onClick={reset}>
            Reset password
          </button>
        </>
      }
    >
      <div className="a-detail">
        <section>
          <h3>Contact</h3>
          <p>{u.phone}</p>
          {u.email && <p>{u.email}</p>}
          {u.address && <p>{u.address}</p>}
          <p className="a-muted">Joined {dateFmt(u.createdAt)}</p>
          <p className="a-contact">
            <a className="a-btn sm" href={`tel:${u.phone}`}>
              Call
            </a>
            <a className="a-btn sm" href={`https://wa.me/88${u.phone}`} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </p>
        </section>
        <section>
          <h3>
            Orders ({mine.length}) · spent {money(spent, settings.currency)}
          </h3>
          {mine.length === 0 ? (
            <p className="a-muted">No orders placed from this account yet.</p>
          ) : (
            <ul className="a-items">
              {mine.map((o) => (
                <li key={o.id}>
                  <span>
                    <b>{o.id}</b> <span className="a-muted">{dateFmt(o.createdAt)}</span>
                  </span>
                  <span className="a-list-end">
                    <b>{money(o.total, settings.currency)}</b>
                    <Badge status={o.status} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Modal>
  )
}

export default function CustomersAdmin() {
  const { users, orders, settings } = useData()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)

  const needle = q.trim().toLowerCase()
  const list = users.filter(
    (u) => !needle || u.name.toLowerCase().includes(needle) || u.phone.includes(needle) || u.email.includes(needle),
  )

  return (
    <>
      <PageHead title="Customers" sub={`${users.length} registered customer${users.length === 1 ? '' : 's'}.`} />

      <div className="a-toolbar">
        <input className="a-search" type="search" placeholder="Search by name, phone or email…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search customers" />
      </div>

      {list.length === 0 ? (
        <Empty title={users.length ? 'No customers match' : 'No customers yet'}>
          {users.length ? 'Try a different search.' : 'When someone creates an account on your website, they will appear here.'}
        </Empty>
      ) : (
        <ul className="a-rows">
          {list.map((u) => {
            const mine = orders.filter((o) => o.userId === u.id)
            const spent = mine.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0)
            return (
              <li key={u.id} className="a-orow">
                <button type="button" className="a-orow-main" onClick={() => setOpen(u.id)}>
                  <span>
                    <b>{u.name}</b>
                    <small>
                      {u.phone}
                      {u.email ? ` · ${u.email}` : ''} · joined {dateFmt(u.createdAt)}
                    </small>
                  </span>
                  <span className="a-list-end">
                    <b>{money(spent, settings.currency)}</b>
                    <small>
                      {mine.length} order{mine.length === 1 ? '' : 's'}
                    </small>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {open && <CustomerDetail id={open} onClose={() => setOpen(null)} />}
    </>
  )
}
