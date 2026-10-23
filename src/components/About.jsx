export default function About() {
  return (
    <section id="about" className="about" data-glow>
      <div className="about-inner">
        <div className="about-text reveal">
          <h2 className="script-title">Small shop, big prints</h2>
          <p className="about-quote">
            “Pitty Posters is a simple place to find posters that make a room feel like yours. [Write your own story
            here in two or three lines.]”
          </p>
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
