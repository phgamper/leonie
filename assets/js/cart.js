// Minimal cart persisted in localStorage; checkout opens a prefilled mail.
(function () {
  var KEY = 'leonhart-cart';
  var ORDER_EMAIL = 'info@leonhart.ch';

  function load() {
    try {
      var items = JSON.parse(localStorage.getItem(KEY));
      return Array.isArray(items) ? items : [];
    } catch (e) {
      return [];
    }
  }
  function save(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* storage unavailable */ }
  }
  function chf(value) { return 'CHF ' + value.toFixed(2); }

  var items = load();
  var root, list, empty, sum, order;

  function totals() {
    return items.reduce(function (t, i) {
      t.count += i.qty;
      t.sum += i.qty * i.price;
      return t;
    }, { count: 0, sum: 0 });
  }

  function mailto() {
    var t = totals();
    var lines = ['Guten Tag', '', 'ich bestelle hiermit folgende Artikel:', ''];
    items.forEach(function (i) {
      lines.push(i.qty + ' x ' + i.name + ' (' + chf(i.price) + ')');
      if (i.details) lines.push('   ' + i.details);
    });
    lines.push('', 'Total: ' + chf(t.sum), '', 'Lieferadresse:', '', 'Name:', 'Strasse:', 'PLZ / Ort:', 'Telefon:', '', 'Freundliche Grüsse');
    return 'mailto:' + ORDER_EMAIL + '?subject=' + encodeURIComponent('Bestellung leonhart.ch') + '&body=' + encodeURIComponent(lines.join('\n'));
  }

  function render() {
    var t = totals();
    document.querySelectorAll('[data-cart-total]').forEach(function (el) { el.textContent = chf(t.sum); });
    document.querySelectorAll('[data-cart-count]').forEach(function (el) { el.textContent = t.count; });
    if (!root) return;
    sum.textContent = chf(t.sum);
    empty.hidden = items.length > 0;
    order.setAttribute('aria-disabled', items.length ? 'false' : 'true');
    order.href = items.length ? mailto() : '#';
    list.textContent = '';
    items.forEach(function (item) {
      var li = document.createElement('li');
      li.className = 'cart__item';
      li.dataset.id = item.id;

      var title = document.createElement('strong');
      title.textContent = item.name;
      var details = document.createElement('small');
      details.textContent = item.details || '';

      var row = document.createElement('div');
      row.className = 'cart__row';
      var qty = document.createElement('span');
      qty.className = 'cart__qty';
      qty.innerHTML = '<button type="button" data-qty="-1" aria-label="Menge verringern">−</button><span></span><button type="button" data-qty="1" aria-label="Menge erhöhen">+</button>';
      qty.children[1].textContent = item.qty;
      var price = document.createElement('span');
      price.textContent = chf(item.qty * item.price);
      var remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'cart__remove';
      remove.dataset.remove = '';
      remove.textContent = 'Entfernen';

      row.append(qty, price, remove);
      li.append(title, details, row);
      list.appendChild(li);
    });
  }

  function add(product) {
    var existing = items.filter(function (i) { return i.id === product.id; })[0];
    if (existing) existing.qty += 1;
    else items.push({ id: product.id, name: product.name, price: product.price, details: product.details, qty: 1 });
    save(items);
    render();
  }

  function open() { root.hidden = false; document.body.style.overflow = 'hidden'; }
  function close() { root.hidden = true; document.body.style.overflow = ''; }

  document.addEventListener('DOMContentLoaded', function () {
    root = document.querySelector('[data-cart]');
    if (root) {
      list = root.querySelector('[data-cart-items]');
      empty = root.querySelector('[data-cart-empty]');
      sum = root.querySelector('[data-cart-sum]');
      order = root.querySelector('[data-cart-order]');
    }
    render();

    document.addEventListener('click', function (e) {
      var target = e.target.closest('[data-add-to-cart], [data-cart-open], [data-cart-close], [data-qty], [data-remove]');
      if (!target) return;
      if (target.matches('[data-add-to-cart]')) {
        add({
          id: target.dataset.id,
          name: target.dataset.name,
          price: parseFloat(target.dataset.price),
          details: target.dataset.details
        });
        open();
      } else if (target.matches('[data-cart-open]')) {
        open();
      } else if (target.matches('[data-cart-close]')) {
        close();
      } else {
        var li = target.closest('.cart__item');
        var item = items.filter(function (i) { return i.id === li.dataset.id; })[0];
        if (target.matches('[data-remove]')) item.qty = 0;
        else item.qty += parseInt(target.dataset.qty, 10);
        items = items.filter(function (i) { return i.qty > 0; });
        save(items);
        render();
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root && !root.hidden) close();
    });
    // keep several open tabs in sync
    window.addEventListener('storage', function (e) {
      if (e.key === KEY) { items = load(); render(); }
    });
  });
})();
