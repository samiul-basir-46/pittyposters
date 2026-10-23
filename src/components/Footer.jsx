export default function Footer() {
  return (
    <footer id="contact" className="footer">
      <div className="container footer-grid">
        <div className="reveal">
          <p className="footer-brand">Pitty Posters</p>
          <p className="footer-blurb">Simple, bold posters for plain walls. Questions or custom orders? Say hello.</p>
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
            <li>[Your email]</li>
            <li>[Your phone / WhatsApp]</li>
            <li>[Your Facebook / Instagram]</li>
          </ul>
        </div>
      </div>
      <div className="container">
        <p className="footer-copy">© 2026 Pitty Posters. All rights reserved. Made with love.</p>
      </div>
    </footer>
  )
}
