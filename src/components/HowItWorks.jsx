import { STEPS } from '../data'

export default function HowItWorks() {
  return (
    <section id="how" className="how">
      <div className="container">
        <h2 className="script-title reveal">Three simple steps</h2>
        <div className="steps">
          {STEPS.map((s, i) => (
            <div key={s.n} className="reveal" style={{ '--d': `${0.1 + i * 0.12}s` }}>
              <div className="step tilt" data-tilt>
                <div className="step-num" aria-hidden="true">
                  {s.n}
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
