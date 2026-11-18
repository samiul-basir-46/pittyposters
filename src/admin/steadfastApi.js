const MEDIA_API = (import.meta.env.VITE_MEDIA_API_URL || 'https://pittybloom-order-media.pittybloomofficials.workers.dev').replace(/\/$/, '')

export async function createSteadfastConsignment(details) {
  const response = await fetch(`${MEDIA_API}/steadfast/dispatch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(details),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || 'Steadfast dispatch failed. Please try again.')
  return result
}
