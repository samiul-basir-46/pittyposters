export const uid = () => Math.random().toString(36).slice(2, 9)

export const money = (n, currency = '৳') => `${currency}${Number(n || 0).toLocaleString('en-US')}`

export async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Resize + compress an uploaded image so it fits comfortably in browser storage.
export function compressImage(file, max = 800, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read the file'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('This file is not a valid image'))
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

// Bangladesh numbers: 01XXXXXXXXX -> 8801XXXXXXXXX
export function waNumber(raw) {
  const d = String(raw || '').replace(/\D/g, '')
  if (!d) return ''
  if (d.startsWith('880')) return d
  if (d.startsWith('0')) return '88' + d
  return d
}

export function downloadFile(name, text, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const fromPrice = (poster) => {
  const prices = (poster.sizes || []).map((s) => Number(s.price) || 0)
  return prices.length ? Math.min(...prices) : 0
}

// 01712-345678, +8801712345678 and 8801712345678 all become 01712345678
export function normPhone(raw) {
  let d = String(raw || '').replace(/\D/g, '')
  if (d.startsWith('880')) d = '0' + d.slice(3)
  return d
}
