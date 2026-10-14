# leonhart.ch

Plain static site: HTML, CSS and JavaScript only. No build step, no Node/npm, no frameworks.
Serve the folder with any web server (e.g. `python3 -m http.server`); `products.json` and
`content/*.md` are loaded with `fetch`, so opening the files via `file://` won't work.

- `index.html` – home page; also holds the AGB/Impressum/Datenschutz articles (shown via `#agb` etc.)
- `zubehoer.html` – accessories page
- `content/*.md` – legal texts, rendered in the browser by `assets/js/legal.js` (using the vendored `marked`)
- `products.json` – accessories, one entry per product (variable products carry `options` and `variants`);
  the grid, category filter and variant selection are rendered by `assets/js/products.js`
- `assets/css/site.css`, `assets/js/site.js` (menu, accordion, reveal), `assets/js/cart.js`
- `assets/img` (incl. `img/products`), `assets/video`, `assets/fonts` – self-hosted media and IBM Plex Sans

The header, footer and cart drawer are duplicated in both HTML files; change them in both.

## Cart / ordering

The cart lives in the browser's `localStorage` (`leonhart-cart`). "Jetzt bestellen" opens the mail
client with a prefilled order to `info@leonhart.ch` (see `ORDER_EMAIL` in `assets/js/cart.js`).
The table is added by the `data-add-to-cart` button in `index.html`; accessories by `products.js`.
