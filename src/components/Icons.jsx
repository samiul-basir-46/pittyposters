const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export const CartIcon = () => (
  <svg {...base}>
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="18" cy="20" r="1.4" />
    <path d="M2.5 3.5h2.7l2.2 11.2a1.6 1.6 0 0 0 1.6 1.3h8.1a1.6 1.6 0 0 0 1.6-1.2l1.4-6.8H6.1" />
  </svg>
)

export const UserIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20.5c.8-3.7 3.8-5.5 7.5-5.5s6.7 1.8 7.5 5.5" />
  </svg>
)

export const MenuIcon = () => (
  <svg {...base}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

export const CloseIcon = () => (
  <svg {...base}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const ArrowIcon = () => (
  <svg {...base} width="18" height="18">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export const HeartLogo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
    <defs>
      <radialGradient id="logo-heart" cx="50%" cy="45%" r="60%">
        <stop offset="0" stopColor="#e16191" />
        <stop offset="1" stopColor="#f7c9d4" />
      </radialGradient>
    </defs>
    <path
      d="M24 41.5 5.7 23.3a10.5 10.5 0 0 1 14.9-14.8L24 12l3.4-3.5a10.5 10.5 0 0 1 14.9 14.8z"
      fill="url(#logo-heart)"
    />
  </svg>
)
