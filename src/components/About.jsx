import { useData } from '../store/store'

export default function About() {
  const { content } = useData()
  return (
    <section id="about" className="about" data-glow>
      <div className="about-inner">
        <div className="about-text reveal">
          <h2 className="script-title">{content.aboutTitle}</h2>
          <p className="about-quote">“{content.aboutText}”</p>
        </div>
        <div className="about-art reveal" style={{ '--d': '.15s' }} aria-hidden="true">
          <div data-depth="14" className="aa-wrap">
            <div className="aa a1" />
          </div>
          <div data-depth="30" className="aa-wrap">
            <div className="aa a2" />
          </div>
          <div data-depth="20" className="aa-wrap">
            <div className="aa a3" />
          </div>
        </div>
      </div>
    </section>
  )
}
