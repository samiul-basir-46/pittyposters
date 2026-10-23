import { useEffect, useRef } from 'react'

const SPARK_COLORS = ['#e16191', '#d3a6ea', '#f0e4e7']

/*
 * Global motion layer:
 *  - scroll reveal for every .reveal element
 *  - custom cursor (dot + trailing ring, grows on links/buttons, shows a label on [data-cursor])
 *  - click sparkle burst
 *  - [data-magnetic]  buttons pull toward the cursor
 *  - [data-tilt]      cards tilt in 3D with a moving glare
 *  - [data-glow]      sections get a soft spotlight that follows the cursor
 *  - [data-depth]     parallax drift
 * Cursor effects run only on mouse devices; everything is off for reduced motion.
 */
export default function FX() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const labelRef = useRef(null)
  const burstRef = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const cleanups = []

    // ---------- scroll reveal ----------
    const revealEls = document.querySelectorAll('.reveal')
    if (reduce || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('in'))
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              en.target.classList.add('in')
              io.unobserve(en.target)
            }
          })
        },
        { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
      )
      revealEls.forEach((el) => io.observe(el))
      cleanups.push(() => io.disconnect())
    }

    if (reduce || !fine) return () => cleanups.forEach((fn) => fn())

    // ---------- cursor + hover effects ----------
    const root = document.documentElement
    const dot = dotRef.current
    const ring = ringRef.current
    const label = labelRef.current
    const burst = burstRef.current
    const parallax = [...document.querySelectorAll('[data-depth]')]

    let mx = -100
    let my = -100
    let rx = -100
    let ry = -100
    let nx = 0
    let ny = 0
    let px = 0
    let py = 0
    let shown = false
    let raf = 0
    let tiltEl = null
    let magEl = null
    let hover = false
    let hoverLabel = ''

    const setHover = (h, l) => {
      if (h === hover && l === hoverLabel) return
      hover = h
      hoverLabel = l
      ring.classList.toggle('is-hover', h)
      ring.classList.toggle('has-label', Boolean(l))
      label.textContent = l
    }

    const resetTilt = (el) => {
      el.style.removeProperty('--rx')
      el.style.removeProperty('--ry')
      el.classList.remove('tilting')
    }

    const onMove = (e) => {
      mx = e.clientX
      my = e.clientY
      if (!shown) {
        shown = true
        rx = mx
        ry = my
        root.classList.add('cursor-on')
      }
      nx = mx / window.innerWidth - 0.5
      ny = my / window.innerHeight - 0.5

      const t = e.target instanceof Element ? e.target : null

      // ring state
      const labelEl = t && t.closest('[data-cursor]')
      const interactive = t && t.closest('a, button, [data-cursor]')
      setHover(Boolean(interactive), labelEl ? labelEl.dataset.cursor : '')

      // 3D tilt
      const tilt = t && t.closest('[data-tilt]')
      if (tiltEl && tiltEl !== tilt) resetTilt(tiltEl)
      tiltEl = tilt
      if (tilt) {
        const r = tilt.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width
        const y = (e.clientY - r.top) / r.height
        tilt.style.setProperty('--ry', ((x - 0.5) * 12).toFixed(2) + 'deg')
        tilt.style.setProperty('--rx', ((0.5 - y) * 12).toFixed(2) + 'deg')
        tilt.style.setProperty('--mx', (x * 100).toFixed(1) + '%')
        tilt.style.setProperty('--my', (y * 100).toFixed(1) + '%')
        tilt.classList.add('tilting')
      }

      // magnetic pull
      const mag = t && t.closest('[data-magnetic]')
      if (magEl && magEl !== mag) magEl.style.transform = ''
      magEl = mag
      if (mag) {
        const r = mag.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        mag.style.transform = `translate(${(dx * 0.22).toFixed(1)}px, ${(dy * 0.3).toFixed(1)}px)`
      }

      // spotlight
      const glow = t && t.closest('[data-glow]')
      if (glow) {
        const r = glow.getBoundingClientRect()
        glow.style.setProperty('--gx', e.clientX - r.left + 'px')
        glow.style.setProperty('--gy', e.clientY - r.top + 'px')
      }
    }

    const onDown = () => ring.classList.add('is-down')
    const onUp = () => ring.classList.remove('is-down')

    const onClick = (e) => {
      const n = 9
      for (let i = 0; i < n; i++) {
        const s = document.createElement('span')
        s.className = 'spark'
        const a = (Math.PI * 2 * i) / n + Math.random() * 0.5
        const d = 28 + Math.random() * 36
        s.style.setProperty('--dx', Math.cos(a) * d + 'px')
        s.style.setProperty('--dy', Math.sin(a) * d + 'px')
        s.style.left = e.clientX + 'px'
        s.style.top = e.clientY + 'px'
        s.style.background = SPARK_COLORS[i % SPARK_COLORS.length]
        s.addEventListener('animationend', () => s.remove())
        burst.appendChild(s)
      }
    }

    const onLeaveWindow = (e) => {
      if (!e.relatedTarget) root.classList.remove('cursor-on')
    }
    const onEnterWindow = () => {
      if (shown) root.classList.add('cursor-on')
    }

    const tick = () => {
      rx += (mx - rx) * 0.18
      ry += (my - ry) * 0.18
      px += (nx - px) * 0.06
      py += (ny - py) * 0.06
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`
      for (const el of parallax) {
        const d = Number(el.dataset.depth) || 0
        el.style.transform = `translate3d(${(-px * d).toFixed(2)}px, ${(-py * d).toFixed(2)}px, 0)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    document.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mousedown', onDown)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('click', onClick)
    document.addEventListener('mouseout', onLeaveWindow)
    document.addEventListener('mouseover', onEnterWindow)

    cleanups.push(() => {
      cancelAnimationFrame(raf)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('click', onClick)
      document.removeEventListener('mouseout', onLeaveWindow)
      document.removeEventListener('mouseover', onEnterWindow)
      root.classList.remove('cursor-on')
      if (tiltEl) resetTilt(tiltEl)
      if (magEl) magEl.style.transform = ''
    })

    return () => cleanups.forEach((fn) => fn())
  }, [])

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true">
        <div className="cursor-ring-in">
          <span ref={labelRef} />
        </div>
      </div>
      <div ref={burstRef} aria-hidden="true" />
    </>
  )
}
