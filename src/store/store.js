import { useSyncExternalStore } from 'react'
import { defaultData } from './seed'
import { uid } from '../utils'

/*
 * Tiny external store, saved to localStorage.
 * Every function that changes data goes through `commit`, which saves and notifies React.
 * To move to a real backend later (e.g. Firebase), only this file needs to change.
 */

const KEY = 'pp:data:v1'
const CART_KEY = 'pp:cart:v1'

const read = (key) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function merge(saved) {
  const base = defaultData()
  const d = saved && typeof saved === 'object' ? saved : {}
  return {
    ...base,
    ...d,
    settings: { ...base.settings, ...(d.settings || {}) },
    content: { ...base.content, ...(d.content || {}) },
    categories: Array.isArray(d.categories) ? d.categories : base.categories,
    posters: Array.isArray(d.posters) ? d.posters : base.posters,
    orders: Array.isArray(d.orders) ? d.orders : [],
  }
}

let state = merge(read(KEY))
let cart = Array.isArray(read(CART_KEY)) ? read(CART_KEY) : []
const listeners = new Set()
const emit = () => listeners.forEach((l) => l())

const subscribe = (l) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

if (typeof window !== 'undefined') {
  // keep other open tabs in sync
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      state = merge(read(KEY))
      emit()
    } else if (e.key === CART_KEY) {
      cart = Array.isArray(read(CART_KEY)) ? read(CART_KEY) : []
      emit()
    }
  })
}

// returns false when the browser refused to save (storage full)
function commit(next) {
  state = next
  const ok = write(KEY, state)
  emit()
  return ok
}
function commitCart(next) {
  cart = next
  write(CART_KEY, cart)
  emit()
}

export const useData = () => useSyncExternalStore(subscribe, () => state)
export const useCart = () => useSyncExternalStore(subscribe, () => cart)

/* ---------- posters ---------- */
export function savePoster(poster) {
  const exists = state.posters.some((p) => p.id === poster.id)
  const posters = exists
    ? state.posters.map((p) => (p.id === poster.id ? poster : p))
    : [...state.posters, poster]
  return commit({ ...state, posters })
}
export function deletePoster(id) {
  commitCart(cart.filter((c) => c.posterId !== id))
  return commit({ ...state, posters: state.posters.filter((p) => p.id !== id) })
}
export function patchPoster(id, patch) {
  return commit({ ...state, posters: state.posters.map((p) => (p.id === id ? { ...p, ...patch } : p)) })
}
export const newPosterId = () => 'p-' + uid()

/* ---------- categories ---------- */
export function addCategory(name) {
  const n = name.trim()
  if (!n || state.categories.some((c) => c.toLowerCase() === n.toLowerCase())) return false
  return commit({ ...state, categories: [...state.categories, n] })
}
export function renameCategory(oldName, newName) {
  const n = newName.trim()
  if (!n) return false
  if (n.toLowerCase() !== oldName.toLowerCase() && state.categories.some((c) => c.toLowerCase() === n.toLowerCase())) return false
  return commit({
    ...state,
    categories: state.categories.map((c) => (c === oldName ? n : c)),
    posters: state.posters.map((p) => (p.cat === oldName ? { ...p, cat: n } : p)),
  })
}
export function deleteCategory(name) {
  if (state.posters.some((p) => p.cat === name)) return false
  return commit({ ...state, categories: state.categories.filter((c) => c !== name) })
}

/* ---------- orders ---------- */
export function createOrder({ customer, note = '', items, delivery, source = 'web', status = 'pending' }) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const order = {
    id: 'PP-' + state.nextOrder,
    createdAt: new Date().toISOString(),
    status,
    source,
    customer,
    note,
    items,
    subtotal,
    delivery: Number(delivery) || 0,
    total: subtotal + (Number(delivery) || 0),
  }
  commit({ ...state, nextOrder: state.nextOrder + 1, orders: [order, ...state.orders] })
  return order
}
export function patchOrder(id, patch) {
  return commit({ ...state, orders: state.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)) })
}
export function deleteOrder(id) {
  return commit({ ...state, orders: state.orders.filter((o) => o.id !== id) })
}

/* ---------- content + settings ---------- */
export const saveContent = (patch) => commit({ ...state, content: { ...state.content, ...patch } })
export const saveSettings = (patch) => commit({ ...state, settings: { ...state.settings, ...patch } })

/* ---------- backup ---------- */
export const exportData = () => JSON.stringify(state, null, 2)
export function importData(text) {
  const parsed = JSON.parse(text)
  if (!parsed || !Array.isArray(parsed.posters) || !parsed.content) throw new Error('This is not a Pitty Posters backup file')
  return commit(merge(parsed))
}
export function resetData() {
  commitCart([])
  return commit(defaultData())
}

/* ---------- cart ---------- */
const lineKey = (posterId, size) => `${posterId}|${size}`
export function addToCart(posterId, size, qty = 1) {
  const key = lineKey(posterId, size)
  const found = cart.find((c) => c.key === key)
  commitCart(
    found
      ? cart.map((c) => (c.key === key ? { ...c, qty: Math.min(20, c.qty + qty) } : c))
      : [...cart, { key, posterId, size, qty }],
  )
}
export const setCartQty = (key, qty) =>
  commitCart(qty <= 0 ? cart.filter((c) => c.key !== key) : cart.map((c) => (c.key === key ? { ...c, qty: Math.min(20, qty) } : c)))
export const removeFromCart = (key) => commitCart(cart.filter((c) => c.key !== key))
export const clearCart = () => commitCart([])

// cart lines joined with live poster data (drops posters that were deleted/hidden/sold out)
export function resolveCart(lines, posters) {
  return lines
    .map((l) => {
      const poster = posters.find((p) => p.id === l.posterId)
      const size = poster && poster.sizes.find((s) => s.label === l.size)
      if (!poster || !size || poster.status !== 'active') return null
      return { ...l, poster, price: Number(size.price) || 0 }
    })
    .filter(Boolean)
}
