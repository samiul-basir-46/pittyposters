import { ArrowIcon } from './Icons'

export default function Hero() {
  return (
    <section id="top" className="hero">
      <div className="hero-stage" data-glow>
        <div className="hero-ghost" aria-hidden="true">
          POSTERS
        </div>

        <div className="hero-inner">
          <div className="hero-art pp-up" style={{ animationDelay: '2.7s' }} aria-hidden="true">
            <div className="hero-stack">
              <div className="hs-wrap hs-a" data-depth="26">
                <div className="hs hs-a-in">
                  <span>
                    Keep
                    <br />
                    going.
                  </span>
                </div>
              </div>
              <div className="hs-wrap hs-b" data-depth="42">
                <div className="hs hs-b-in">
                  <i />
                </div>
              </div>
              <div className="hs-wrap hs-c" data-depth="16">
                <div className="hs hs-c-in">
                  <b style={{ width: '70%' }} />
                  <b style={{ width: '45%' }} />
                  <b style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="hero-text">
            <p className="hero-script pp-up" style={{ animationDelay: '2.4s' }}>
              Prints for plain walls
            </p>
            <h1 className="pp-up" style={{ animationDelay: '2.55s' }}>
              Walls deserve better.
            </h1>
            <p className="hero-quote pp-up" style={{ animationDelay: '2.7s' }}>
              Simple, bold posters you can pick in a minute and hang by the weekend. No clutter, just good prints.
            </p>
            <div className="hero-actions pp-up" style={{ animationDelay: '2.85s' }}>
              <a href="#shop" className="btn btn-light" data-magnetic>
                Browse posters <ArrowIcon />
              </a>
              <a href="#how" className="btn btn-ghost" data-magnetic>
                How it works
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
