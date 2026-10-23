import { useState } from 'react'
import { exportData, importData, resetData, saveSettings, useData } from '../store/store'
import { downloadFile, sha256 } from '../utils'
import { Field, PageHead } from './ui'
import { useNotify, useSaved } from './notify'

export default function SettingsAdmin() {
  const { settings, posters, orders } = useData()
  const notify = useNotify()
  const saved = useSaved()
  const [s, setS] = useState({ ...settings, deliveryCharge: String(settings.deliveryCharge) })
  const [pw, setPw] = useState({ a: '', b: '' })

  const set = (k) => (e) => setS((x) => ({ ...x, [k]: e.target.value }))

  const saveShop = (e) => {
    e.preventDefault()
    const delivery = Number(s.deliveryCharge)
    if (!s.storeName.trim()) return notify('Shop name cannot be empty.', 'error')
    if (!Number.isFinite(delivery) || delivery < 0) return notify('Delivery charge must be a number, 0 or more.', 'error')
    saved(
      saveSettings({ storeName: s.storeName.trim(), currency: s.currency.trim() || '৳', deliveryCharge: delivery, whatsapp: s.whatsapp.trim() }),
      'Settings saved',
    )
  }

  const changePw = async (e) => {
    e.preventDefault()
    if (pw.a.length < 6) return notify('Use at least 6 characters.', 'error')
    if (pw.a !== pw.b) return notify('The two passwords do not match.', 'error')
    try {
      saved(saveSettings({ passHash: await sha256(pw.a) }), 'Password changed')
      setPw({ a: '', b: '' })
    } catch {
      notify('Changing the password needs a secure (https) connection.', 'error')
    }
  }

  const backup = () => {
    downloadFile(`pitty-posters-backup-${new Date().toISOString().slice(0, 10)}.json`, exportData())
    notify('Backup downloaded')
  }

  const restore = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!window.confirm('Restoring replaces everything currently in the shop with the backup. Continue?')) return
    try {
      saved(importData(await file.text()), 'Backup restored')
    } catch (err) {
      notify(err instanceof SyntaxError ? 'That file is not a valid backup.' : err.message, 'error')
    }
  }

  const reset = () => {
    if (window.confirm('Reset the whole shop to the sample data? All your posters, orders and text will be removed.')) {
      resetData()
      notify('Shop reset to sample data')
    }
  }

  return (
    <>
      <PageHead title="Settings" sub="Shop details, password and backups." />

      <form className="a-card" onSubmit={saveShop}>
        <div className="a-card-head">
          <h2>Shop</h2>
        </div>
        <div className="a-form-cols">
          <Field label="Shop name">
            <input value={s.storeName} onChange={set('storeName')} />
          </Field>
          <div className="a-row2">
            <Field label="Currency symbol">
              <input value={s.currency} onChange={set('currency')} maxLength={4} />
            </Field>
            <Field label="Delivery charge">
              <input value={s.deliveryCharge} onChange={set('deliveryCharge')} inputMode="numeric" />
            </Field>
          </div>
          <Field label="WhatsApp number for orders" hint="e.g. 01XXXXXXXXX. Customers' orders open a ready-made WhatsApp message to this number.">
            <input value={s.whatsapp} onChange={set('whatsapp')} inputMode="tel" />
          </Field>
          <div>
            <button type="submit" className="a-btn primary">
              Save settings
            </button>
          </div>
        </div>
      </form>

      <form className="a-card" onSubmit={changePw}>
        <div className="a-card-head">
          <h2>Admin password</h2>
        </div>
        <p className="a-muted">
          {settings.passHash ? 'You have set your own password.' : 'You are using the default password. Please change it.'}
        </p>
        <div className="a-form-cols">
          <div className="a-row2">
            <Field label="New password">
              <input type="password" autoComplete="new-password" value={pw.a} onChange={(e) => setPw({ ...pw, a: e.target.value })} />
            </Field>
            <Field label="Repeat new password">
              <input type="password" autoComplete="new-password" value={pw.b} onChange={(e) => setPw({ ...pw, b: e.target.value })} />
            </Field>
          </div>
          <div>
            <button type="submit" className="a-btn primary">
              Change password
            </button>
          </div>
        </div>
        <p className="a-hint">
          This password only keeps casual visitors out of the admin screen. Your shop data lives in this browser, so it is not a substitute for a
          real server login.
        </p>
      </form>

      <section className="a-card">
        <div className="a-card-head">
          <h2>Backup and restore</h2>
        </div>
        <p className="a-muted">
          Everything ({posters.length} posters, {orders.length} orders, site text, settings) is saved in this browser only. Download a backup
          regularly, and use it to move the shop to another computer or phone.
        </p>
        <div className="a-actions">
          <button type="button" className="a-btn primary" onClick={backup}>
            Download backup
          </button>
          <label className="a-btn">
            Restore from backup
            <input type="file" accept="application/json,.json" hidden onChange={restore} />
          </label>
        </div>
      </section>

      <section className="a-card danger-zone">
        <div className="a-card-head">
          <h2>Start over</h2>
        </div>
        <p className="a-muted">Remove everything and go back to the sample posters and text.</p>
        <div className="a-actions">
          <button type="button" className="a-btn danger" onClick={reset}>
            Reset shop
          </button>
        </div>
      </section>
    </>
  )
}
