# leonhart.ch

## Legal pages

`agb`, `impressum` and `datenschutz` are written as Markdown in `content/*.md`
(with a `title` front matter) and rendered into `<slug>/index.html` using
`templates/page.html`. After editing run (Node >= 18):

```sh
npm install
npm run build
```

The generated `*/index.html` files are committed; don't edit them by hand.
