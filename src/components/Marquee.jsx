import { useData } from '../store/store'

export default function Marquee() {
  const { content } = useData()
  const base = content.marquee.filter(Boolean)
  if (!base.length) return null
  const items = [...base, ...base, ...base, ...base]
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {items.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>
    </div>
  )
}
