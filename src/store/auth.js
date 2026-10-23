import { addUser, getData, patchUser, setSession } from './store'
import { normPhone, sha256, uid } from '../utils'

/*
 * Customer accounts (stored in this browser, see the note in README).
 * Passwords are never stored as typed: only a salted SHA-256 hash is kept.
 * Each function resolves to { error } or { user }.
 */

const NEEDS_HTTPS = 'Accounts need a secure (https) connection.'
const hashPw = async (id, password) => {
  try {
    return await sha256(`${id}:${password}`)
  } catch {
    return null
  }
}
const EMAIL = /^\S+@\S+\.\S+$/

function checkProfile({ name, phone, email }, ignoreId) {
  const n = name.trim()
  const p = normPhone(phone)
  const e = (email || '').trim().toLowerCase()
  if (n.length < 2) return { error: 'Please enter your name.' }
  if (p.length < 10) return { error: 'Please enter a valid phone number.' }
  if (e && !EMAIL.test(e)) return { error: 'That email address does not look right.' }
  const { users } = getData()
  if (users.some((u) => u.id !== ignoreId && u.phone === p)) return { error: 'An account with this phone number already exists.' }
  if (e && users.some((u) => u.id !== ignoreId && u.email === e)) return { error: 'An account with this email already exists.' }
  return { name: n, phone: p, email: e }
}

export async function signUp({ name, phone, email, address, password }) {
  const prof = checkProfile({ name, phone, email })
  if (prof.error) return prof
  if (!password || password.length < 6) return { error: 'Password must be at least 6 characters.' }
  const id = 'u-' + uid()
  const passHash = await hashPw(id, password)
  if (!passHash) return { error: NEEDS_HTTPS }
  const user = { id, ...prof, address: (address || '').trim(), passHash, createdAt: new Date().toISOString() }
  if (addUser(user) === false) return { error: 'Could not save: browser storage is full.' }
  setSession(id)
  return { user }
}

export async function logIn(identifier, password) {
  const id = identifier.trim().toLowerCase()
  const phone = normPhone(identifier)
  const user = getData().users.find((u) => (id.includes('@') ? u.email === id : u.phone === phone))
  const bad = { error: 'Wrong phone/email or password.' }
  if (!user || !password) return bad
  const hash = await hashPw(user.id, password)
  if (!hash) return { error: NEEDS_HTTPS }
  if (hash !== user.passHash) return bad
  setSession(user.id)
  return { user }
}

export const logOut = () => setSession(null)

export function updateProfile(userId, { name, phone, email, address }) {
  const prof = checkProfile({ name, phone, email }, userId)
  if (prof.error) return prof
  if (patchUser(userId, { ...prof, address: (address || '').trim() }) === false) return { error: 'Could not save: browser storage is full.' }
  return { ok: true }
}

export async function changePassword(user, current, next) {
  if (next.length < 6) return { error: 'New password must be at least 6 characters.' }
  const cur = await hashPw(user.id, current)
  if (!cur) return { error: NEEDS_HTTPS }
  if (cur !== user.passHash) return { error: 'Your current password is not correct.' }
  patchUser(user.id, { passHash: await hashPw(user.id, next) })
  return { ok: true }
}

// used by the shop owner in admin
export async function resetPassword(userId, next) {
  if (next.length < 6) return { error: 'Use at least 6 characters.' }
  const hash = await hashPw(userId, next)
  if (!hash) return { error: NEEDS_HTTPS }
  patchUser(userId, { passHash: hash })
  return { ok: true }
}
