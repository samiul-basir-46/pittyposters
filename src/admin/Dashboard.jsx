import { useData } from '../store/store'
import { ORDER_STATUSES } from '../store/seed'
import { money } from '../utils'
import { Badge, Empty, PageHead } from './ui'

const dateFmt = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function Dashboard() {
  const { posters, orders, categories, settings } = useData()
  const cur = settings.currency

  const live = orders.filter((o) => o.status !== 'cancelled')
  const revenue = live.reduce((s, o) => s + o.total, 0)
  const delivered = orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.total, 0)
  const pending = orders.filter((o) => o.status === 'pending').length
  const active = posters.filter((p) => p.status === 'active').length
  const attention = posters.filter((p) => p.status !== 'active')

  const counts = Object.fromEntries(ORDER_STATUSES.map((s) => [s, orders.filter((o) => o.status === s).length]))
  const max = Math.max(1, ...Object.values(counts))

  // best sellers from non-cancelled orders
  const sold = {}
  live.forEach((o) =>
    o.items.forEach((i) => {
      sold[i.title] = (sold[i.title] || 0) + i.qty
    }),
  )
  const best = Object.entries(sold)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <>
      <PageHead title="Dashboard" sub="A quick look at how your shop is doing." />

      {!settings.passHash && (
        <div className="a-note warn">
          You are still using the default password. <a href="#/admin/settings">Change it in Settings</a> before sharing this site.
        </div>
      )}

      <div className="a-stats">
        <div className="a-stat">
          <span>Orders</span>
          <b>{orders.length}</b>
          <small>{pending} waiting for confirmation</small>
        </div>
        <div className="a-stat">
          <span>Revenue</span>
          <b>{money(revenue, cur)}</b>
          <small>{money(delivered, cur)} delivered</small>
        </div>
        <div className="a-stat">
          <span>Posters</span>
          <b>{posters.length}</b>
          <small>{active} on sale</small>
        </div>
        <div className="a-stat">
          <span>Categories</span>
          <b>{categories.length}</b>
          <small>
            <a href="#/admin/categories">Manage</a>
          </small>
        </div>
      </div>

      <div className="a-grid2">
        <section className="a-card">
          <div className="a-card-head">
            <h2>Recent orders</h2>
            <a className="a-link" href="#/admin/orders">
              See all
            </a>
          </div>
          {orders.length === 0 ? (
            <Empty title="No orders yet">Orders placed on the website, or added by hand, will show up here.</Empty>
          ) : (
            <ul className="a-list">
              {orders.slice(0, 6).map((o) => (
                <li key={o.id}>
                  <a href="#/admin/orders" className="a-list-row">
                    <span>
                      <b>{o.id}</b> · {o.customer.name}
                      <small>{dateFmt(o.createdAt)}</small>
                    </span>
                    <span className="a-list-end">
                      <b>{money(o.total, cur)}</b>
                      <Badge status={o.status} />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="a-card">
          <div className="a-card-head">
            <h2>Orders by status</h2>
          </div>
          <ul className="a-bars">
            {ORDER_STATUSES.map((s) => (
              <li key={s}>
                <span className="a-bar-label">{s}</span>
                <span className="a-bar-track">
                  <span className={'a-bar-fill b-' + s} style={{ width: `${(counts[s] / max) * 100}%` }} />
                </span>
                <b>{counts[s]}</b>
              </li>
            ))}
          </ul>
        </section>

        <section className="a-card">
          <div className="a-card-head">
            <h2>Best sellers</h2>
          </div>
          {best.length === 0 ? (
            <Empty title="Nothing sold yet" />
          ) : (
            <ul className="a-list">
              {best.map(([title, qty]) => (
                <li key={title} className="a-list-row static">
                  <span>{title}</span>
                  <b>{qty} sold</b>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="a-card">
          <div className="a-card-head">
            <h2>Needs attention</h2>
            <a className="a-link" href="#/admin/posters">
              Posters
            </a>
          </div>
          {attention.length === 0 ? (
            <Empty title="All posters are on sale" />
          ) : (
            <ul className="a-list">
              {attention.map((p) => (
                <li key={p.id} className="a-list-row static">
                  <span>{p.title}</span>
                  <Badge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className="a-footnote">
        Your data is saved in this browser. Download a backup now and then from <a href="#/admin/settings">Settings</a>.
      </p>
    </>
  )
}
