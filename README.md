# Pitty Posters

A simple, responsive poster shop built with React + Vite.

```bash
npm install
npm run dev      # start locally
npm run build    # production build
```

## Admin dashboard

Open `/#/admin` (for example `http://localhost:5173/#/admin`).
The default password is `pitty123`. **Change it first** in Admin → Settings.

From the dashboard you can manage:

- **Posters**: add, edit, duplicate, delete; sizes and prices; photo upload or generated design; on sale / sold out / hidden
- **Categories**: these become the filter buttons on the website
- **Customers**: see registered customers, their orders, and delete an account
- **Orders**: see orders from the website, add orders by hand, update status (pending → confirmed → shipped → delivered / cancelled)
- **Site content**: every heading, paragraph, step and contact line on the website
- **Settings**: shop name, currency, delivery charge, WhatsApp number, password, backup and restore

### Customers and orders

The cart and checkout work on the website. When a customer places an order, a ready-made
order message opens in WhatsApp (to the number set in Settings) and the order is saved.

### Customer accounts

Customers log in from the person icon in the website header with Google. Firebase Authentication verifies
the Google account; the shop then keeps the profile (name, phone, email, address) in this browser. Guest
checkout still works. Google sign-in is enabled for the Firebase project through `firebase.json` and
`firebase deploy --only auth`; the Firebase web app configuration is in `src/firebase.js`.

### Where the data lives

All data is saved in the browser's `localStorage` (see `src/store/store.js`), so it lives on
the device and browser where the admin works. That means:

- orders placed on a customer's phone do **not** appear in your admin automatically; they reach you through the WhatsApp message
- use **Settings → Download backup** regularly, and to move the shop to another device
- accounts exist only in the browser that created them: Google login verifies identity, but this demo still stores
the customer record locally and does not sync accounts or orders across devices
- the admin password only keeps casual visitors out. It is not real server security

To make customer accounts work across devices (with real, verified login) and receive orders directly in the dashboard, replace the
functions in `src/store/store.js` with a backend such as Firebase. Nothing else needs to change.
