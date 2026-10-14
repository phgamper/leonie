// Renders the accessories grid from products.json on every page load,
// with category filter and variant selection.
document.addEventListener('DOMContentLoaded', function () {
  var grid = document.querySelector('.products');
  var filterBar = document.querySelector('.filter');

  function chf(n) { return 'CHF ' + n.toFixed(2); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function card(p) {
    var variants = p.variants;
    var article = el('article', 'product');
    article.dataset.category = p.category;

    var img = el('img', 'product__image');
    img.src = p.image;
    img.alt = p.name;
    img.loading = 'lazy';
    img.width = 300;
    img.height = 300;
    var price = el('p', 'product__price', (variants ? 'ab ' : '') + chf(p.price));
    var button = el('button', 'button product__button', 'In den Warenkorb');
    button.type = 'button';
    button.dataset.addToCart = '';
    button.dataset.id = p.id;
    button.dataset.name = p.name;
    button.dataset.price = p.price;

    article.append(img, el('p', 'product__category', p.category), el('h2', 'product__name', p.name));

    var selects = [];
    (p.options || []).forEach(function (o) {
      var label = el('label', 'product__option', o.name);
      var select = el('select');
      select.dataset.option = o.key;
      select.dataset.label = o.name;
      o.values.forEach(function (v) {
        var opt = el('option', '', v.label);
        opt.value = v.value;
        select.appendChild(opt);
      });
      label.appendChild(select);
      article.appendChild(label);
      selects.push(select);
    });
    article.append(price, button);

    function update() {
      var labels = [];
      var match = variants.filter(function (v) {
        return selects.every(function (s) { return v.attributes[s.dataset.option] === s.value; });
      })[0];
      selects.forEach(function (s) { labels.push(s.dataset.label + ': ' + s.options[s.selectedIndex].text); });
      button.disabled = !match;
      if (!match) { price.textContent = 'Nicht verfügbar'; return; }
      price.textContent = chf(match.price);
      img.src = match.image;
      button.dataset.id = p.id + '-' + match.sku;
      button.dataset.price = match.price;
      button.dataset.details = labels.join(', ');
    }
    if (variants) {
      selects.forEach(function (s) { s.addEventListener('change', update); });
      update();
    }
    return article;
  }

  function render(products) {
    grid.textContent = '';
    filterBar.textContent = '';
    var categories = [];
    products.forEach(function (p) { if (categories.indexOf(p.category) < 0) categories.push(p.category); });

    ['Alle'].concat(categories).forEach(function (c, i) {
      var b = el('button', 'filter__button' + (i ? '' : ' is-active'), c);
      b.type = 'button';
      b.dataset.filter = i ? c : '';
      b.addEventListener('click', function () {
        filterBar.querySelectorAll('.filter__button').forEach(function (x) { x.classList.toggle('is-active', x === b); });
        grid.querySelectorAll('.product').forEach(function (a) { a.hidden = !!b.dataset.filter && a.dataset.category !== b.dataset.filter; });
      });
      filterBar.appendChild(b);
    });
    products.forEach(function (p) { grid.appendChild(card(p)); });
  }

  fetch('products.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(render)
    .catch(function () {
      grid.textContent = 'Die Produkte konnten nicht geladen werden. Bitte die Seite über einen Webserver öffnen und neu laden.';
    });
});
