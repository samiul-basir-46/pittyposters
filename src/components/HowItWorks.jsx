import { useData } from '../store/store'

export default function HowItWorks() {
  const { content } = useData()
  return (
    <section id="how" className="how">
      <div className="container">
        <h2 className="script-title reveal">{content.stepsTitle}</h2>
        <div className="steps">
          {content.steps.map((s, i) => (
            <div key={i} className="reveal" style={{ '--d': `${0.1 + i * 0.12}s` }}>
              <div className="step tilt" data-tilt>
                <div className="step-num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
