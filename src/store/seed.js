// Starting data. Prices below are SAMPLE values: edit them in the admin dashboard.
const sizes = (a, b) => [
  { label: 'A3', price: a },
  { label: 'A2', price: b },
]

export function defaultData() {
  return {
    v: 1,
    nextOrder: 1001,
    categories: ['Typography', 'Abstract', 'Nature', 'Minimal'],
    posters: [
      { id: 'bloom', title: 'Midnight Bloom', cat: 'Abstract', tag: 'No. 01', word: 'Bloom', status: 'active', featured: true, desc: '', image: null, sizes: sizes(350, 600), bg: '#512e30', fg: '#fbf6f7', kind: 'shape', c1: '#e16191', c2: '#d3a6ea', w: '58%', radius: '50%', dot: true },
      { id: 'soft', title: 'Soft Hours', cat: 'Minimal', tag: 'No. 02', word: 'Soft\nhours', status: 'active', featured: false, desc: '', image: null, sizes: sizes(350, 600), bg: '#f0e4e7', fg: '#2a1a1c', kind: 'shape', c1: '#d3a6ea', c2: '#d3a6ea', w: '50%', radius: '999px 999px 0 0', dot: false },
      { id: 'keep', title: 'Keep Going', cat: 'Typography', tag: 'No. 03', word: 'Keep\ngoing', status: 'active', featured: true, desc: '', image: null, sizes: sizes(300, 550), bg: '#d3a6ea', fg: '#3a2022', kind: 'bars', c1: '#3a2022', c2: '#3a2022', w: '58%', radius: '0', dot: false },
      { id: 'tide', title: 'Tide Lines', cat: 'Nature', tag: 'No. 04', word: 'Tide', status: 'active', featured: false, desc: '', image: null, sizes: sizes(350, 600), bg: '#6b3f45', fg: '#fbf6f7', kind: 'waves', c1: '#fbf6f7', c2: '#d3a6ea', w: '58%', radius: '0', dot: false },
      { id: 'sun', title: 'Paper Sun', cat: 'Abstract', tag: 'No. 05', word: 'Sun', status: 'active', featured: false, desc: '', image: null, sizes: sizes(350, 600), bg: '#fbf6f7', fg: '#2a1a1c', kind: 'shape', c1: '#b3202a', c2: '#b3202a', w: '66%', radius: '50%', dot: false },
      { id: 'grid', title: 'Quiet Grid', cat: 'Minimal', tag: 'No. 06', word: 'Quiet', status: 'active', featured: false, desc: '', image: null, sizes: sizes(300, 550), bg: '#d9cdd3', fg: '#2a1a1c', kind: 'grid', c1: '#512e30', c2: '#fbf6f7', w: '46%', radius: '0', dot: false },
      { id: 'loud', title: 'Loud & Clear', cat: 'Typography', tag: 'No. 07', word: 'Loud\n& clear', status: 'active', featured: false, desc: '', image: null, sizes: sizes(300, 550), bg: '#e16191', fg: '#2a1a1c', kind: 'ring', c1: '#2a1a1c', c2: '#2a1a1c', w: '52%', radius: '0', dot: false },
      { id: 'petal', title: 'Petal Room', cat: 'Nature', tag: 'No. 08', word: 'Petal', status: 'active', featured: false, desc: '', image: null, sizes: sizes(350, 600), bg: '#3a2022', fg: '#f0e4e7', kind: 'shape', c1: '#d3a6ea', c2: '#d3a6ea', w: '56%', radius: '50% 0 50% 0', dot: false },
    ],
    orders: [],
    users: [],
    content: {
      heroScript: 'Prints for plain walls',
      heroTitle: 'Walls deserve better.',
      heroQuote: 'Simple, bold posters you can pick in a minute and hang by the weekend. No clutter, just good prints.',
      heroCta1: 'Browse posters',
      heroCta2: 'How it works',
      heroGhost: 'POSTERS',
      marquee: ['Fresh prints', 'Bold colours', 'Made for your wall', 'Pick it. Hang it. Love it.'],
      wallTitle: 'The poster wall',
      wallSub: 'Pick a style, find your favourite.',
      stepsTitle: 'Three simple steps',
      steps: [
        { title: 'Pick a poster', text: 'Scroll the wall, filter by style, choose the one you like.' },
        { title: 'Choose a size', text: 'Every poster comes in A3 and A2. Pick the one that fits your wall.' },
        { title: 'We deliver', text: 'Place your order and we confirm it on WhatsApp, then deliver to your door.' },
      ],
      aboutTitle: 'Small shop, big prints',
      aboutText: 'Pitty Posters is a simple place to find posters that make a room feel like yours.',
      footerBlurb: 'Simple, bold posters for plain walls. Questions or custom orders? Say hello.',
      email: '',
      phone: '',
      social: '',
    },
    settings: {
      storeName: 'Pitty Posters',
      currency: '৳',
      deliveryCharge: 60,
      whatsapp: '',
      passHash: null, // null = default password in use
    },
  }
}

export const DEFAULT_PASSWORD = 'pitty123'
export const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
