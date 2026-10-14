# leonhart.ch

## Structure

Plain static site, no WordPress/WooCommerce/Elementor, no frameworks.

- `templates/layout.html` – shared head, header, footer and cart drawer
- `templates/home.html` – home page content
- `content/*.md` – `agb`, `impressum`, `datenschutz`; rendered into `index.html` and shown via `#agb` etc.
- `assets/css/site.css`, `assets/js/site.js` (menu, accordion, reveal), `assets/js/cart.js`
- `assets/img`, `assets/video`, `assets/fonts` – self-hosted media and IBM Plex Sans

`index.html` is generated; don't edit them by hand. After
changing templates or content run (Node >= 18):

```sh
npm install
npm run build
```

## Cart / ordering

The cart lives in the browser's `localStorage` (`leonhart-cart`). "Jetzt
bestellen" opens the mail client with a prefilled order to `info@leonhart.ch`
(see `ORDER_EMAIL` in `assets/js/cart.js`). Products are defined by the
`data-add-to-cart` button in `templates/home.html`.
