import { useData } from '../store/store'
import { waNumber } from '../utils'

const YEAR = new Date().getFullYear()

export default function Footer() {
  const { content: c, settings } = useData()
  const wa = waNumber(settings.whatsapp)
  const year = YEAR
  return (
    <footer id="contact" className="footer">
      <div className="container footer-grid">
        <div className="reveal">
          <p className="footer-brand">{settings.storeName}</p>
          <p className="footer-blurb">{c.footerBlurb}</p>
        </div>
        <div className="reveal" style={{ '--d': '.1s' }}>
          <p className="footer-head">Explore</p>
          <ul>
            <li>
              <a href="#shop">Shop</a>
            </li>
            <li>
              <a href="#how">How it works</a>
            </li>
            <li>
              <a href="#about">About</a>
            </li>
          </ul>
        </div>
        <div className="reveal" style={{ '--d': '.2s' }}>
          <p className="footer-head">Contact</p>
          <ul>
            {c.email && (
              <li>
                <a href={`mailto:${c.email}`}>{c.email}</a>
              </li>
            )}
            {c.phone && (
              <li>
                <a href={`tel:${c.phone.replace(/\s/g, '')}`}>{c.phone}</a>
              </li>
            )}
            {wa && (
              <li>
                <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              </li>
            )}
            {c.social && <li>{c.social}</li>}
            {!c.email && !c.phone && !wa && !c.social && <li>Contact details coming soon.</li>}
          </ul>
        </div>
      </div>
      <div className="container">
        <p className="footer-copy">
          © {year} {settings.storeName}. All rights reserved. Made with love.
        </p>
      </div>
    </footer>
  )
}
