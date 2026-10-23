import { addUser, getData, patchUser, setSession } from './store'
import { normPhone, sha256, uid } from '../utils'
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { firebaseAuth } from '../firebase'

/*
 * Customer accounts are stored in this browser, see the note in README.
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

function checkProfile({ name, phone, email }, ignoreId, phoneRequired = true) {
  const n = name.trim()
  const p = normPhone(phone)
  const e = (email || '').trim().toLowerCase()
  if (n.length < 2) return { error: 'Please enter your name.' }
  if (phoneRequired && p.length < 10) return { error: 'Please enter a valid phone number.' }
  if (e && !EMAIL.test(e)) return { error: 'That email address does not look right.' }
  const { users } = getData()
  if (p && users.some((u) => u.id !== ignoreId && u.phone === p)) return { error: 'An account with this phone number already exists.' }
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

export function logOut() {
  setSession(null)
  signOut(firebaseAuth).catch(() => {})
}

export function updateProfile(userId, { name, phone, email, address }) {
  const prof = checkProfile({ name, phone, email }, userId, false)
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

function googleSignInError(error) {
  if (error?.code === 'auth/unauthorized-domain') {
    return `This site is not authorized for sign-in (${window.location.hostname}). Add it under Firebase Authentication → Settings → Authorized domains.`
  }
  if (error?.code === 'auth/popup-closed-by-user') return 'Google sign-in was cancelled.'
  if (error?.code === 'auth/popup-blocked') return 'Your browser blocked the sign-in popup. Allow popups for this site and try again.'
  return error?.message || 'Google sign-in failed. Please try again.'
}

export async function renderGoogleSignIn(element, onSuccess, onError) {
  if (!element) return () => {}
  element.replaceChildren()
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'google-auth-button'
  button.innerHTML = '<svg aria-hidden="true" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.25 5.48-4.73 7.18l7.63 5.92c4.46-4.12 7.14-10.2 7.14-17.57Z"/><path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.93 23.93 0 0 0 0 21.56l7.98-6.19Z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.88l-7.63-5.92c-2.12 1.42-4.83 2.27-8.27 2.27-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/></svg><span>Continue with Google</span>'
  button.addEventListener('click', async () => {
    button.disabled = true
    onError('')
    try {
      const result = await signInWithPopup(firebaseAuth, new GoogleAuthProvider())
      const profile = result.user
      const email = (profile.email || '').trim().toLowerCase()
      if (!profile.uid || !email || !profile.emailVerified) throw new Error('Google could not verify this account.')
      const existing = getData().users.find((user) => user.googleId === profile.uid || user.email === email)
      const user = existing
        ? { ...existing, googleId: profile.uid, name: profile.displayName || existing.name, email }
        : {
            id: `g-${profile.uid}`,
            googleId: profile.uid,
            name: profile.displayName || email.split('@')[0],
            phone: '',
            email,
            address: '',
            createdAt: new Date().toISOString(),
          }
      const saved = existing ? patchUser(user.id, user) : addUser(user)
      if (saved === false) throw new Error('Could not save your account: browser storage is full.')
      setSession(user.id)
      onSuccess(user)
    } catch (error) {
      onError(googleSignInError(error))
    } finally {
      button.disabled = false
    }
  })
  element.append(button)
  return () => button.remove()
}
