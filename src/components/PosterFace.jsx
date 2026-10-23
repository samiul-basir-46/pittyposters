function PosterArt({ p }) {
  switch (p.kind) {
    case 'grid':
      return (
        <div className="art-grid" style={{ width: p.w }}>
          <i style={{ background: p.c1 }} />
          <i style={{ background: p.c2 }} />
          <i style={{ background: p.c2 }} />
          <i style={{ background: p.c1 }} />
        </div>
      )
    case 'waves':
      return (
        <div className="art-waves" style={{ background: p.c1 }}>
          <div style={{ background: p.c2 }}>
            <div style={{ background: p.bg }} />
          </div>
        </div>
      )
    case 'bars':
      return (
        <div className="art-bars">
          {['100%', '64%', '82%', '48%'].map((w) => (
            <i key={w} style={{ width: w, background: p.c1 }} />
          ))}
        </div>
      )
    case 'ring':
      return <div className="art-ring" style={{ width: p.w, borderColor: p.c1 }} />
    default:
      return (
        <div className="art-shape-wrap" style={{ width: p.w }}>
          <div className="art-shape" style={{ borderRadius: p.radius, background: p.c1 }} />
          {p.dot && <span className="art-dot" style={{ background: p.c2 }} />}
        </div>
      )
  }
}

// One poster, drawn either from an uploaded image or from the generated art settings.
export default function PosterFace({ p, badge }) {
  if (p.image) {
    return (
      <div className="poster poster-photo">
        <img src={p.image} alt={p.title} loading="lazy" />
        {badge && <span className="poster-badge">{badge}</span>}
      </div>
    )
  }
  return (
    <div className="poster" style={{ background: p.bg, color: p.fg }}>
      <div className="poster-tag">{p.tag}</div>
      <div className="poster-art">
        <PosterArt p={p} />
      </div>
      <div className="poster-word">{p.word}</div>
      {badge && <span className="poster-badge">{badge}</span>}
    </div>
  )
}
