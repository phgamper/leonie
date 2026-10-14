// Minimal cart persisted in localStorage; checkout opens a prefilled mail.
(function () {
  var KEY = 'leonhart-cart';
  var CUSTOMER_KEY = 'leonhart-customer';
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
  function loadCustomer() {
    try { return JSON.parse(localStorage.getItem(CUSTOMER_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveCustomer() {
    var data = {};
    FIELDS.forEach(function (f) { data[f.key] = form.elements[f.key].value; });
    try { localStorage.setItem(CUSTOMER_KEY, JSON.stringify(data)); } catch (e) { /* storage unavailable */ }
  }
  function chf(value) { return 'CHF ' + value.toFixed(2); }

  var items = load();
  var root, list, empty, sum, order, foot, form;

  function totals() {
    return items.reduce(function (t, i) {
      t.count += i.qty;
      t.sum += i.qty * i.price;
      return t;
    }, { count: 0, sum: 0 });
  }

  function sqlTimestamp(d) {
    var p = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' +
      p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  }

  function mailto(c) {
    var t = totals();
    var lines = ['Guten Tag', '', 'ich bestelle hiermit folgende Artikel:', ''];
    items.forEach(function (i) {
      lines.push(i.qty + ' x ' + i.name + ' (' + chf(i.price) + ')');
      if (i.details) lines.push('   ' + i.details);
    });
    lines.push('', 'Total: ' + chf(t.sum), '', 'Lieferadresse:', '',
      'Name: ' + c.name,
      'Strasse: ' + c.street,
      'PLZ / Ort: ' + c.zip + ' ' + c.city,
      'E-Mail: ' + c.email,
      'Telefon: ' + c.phone, '', 'Freundliche Grüsse', c.name);
    return 'mailto:' + ORDER_EMAIL + '?subject=' + encodeURIComponent('Bestellung leonhart.ch, ' + sqlTimestamp(new Date())) + '&body=' + encodeURIComponent(lines.join('\n'));
  }

  var FIELDS = [
    { key: 'name', label: 'Vor- und Nachname', type: 'text', autocomplete: 'name',
      test: function (v) { return /^\S+(\s+\S+)+$/.test(v); }, error: 'Bitte Vor- und Nachname angeben.' },
    { key: 'street', label: 'Strasse und Nr.', type: 'text', autocomplete: 'street-address',
      test: function (v) { return /^[^\d]*[A-Za-zÀ-ÿ][^\d]*\s\d+\s?[A-Za-z]?([\/-]\d+)?$/.test(v); }, error: 'Bitte Strasse mit Hausnummer angeben, z. B. Bahnhofstrasse 12.' },
    { key: 'zip', label: 'PLZ', type: 'text', autocomplete: 'postal-code', inputmode: 'numeric', maxlength: 4, half: true,
      test: function (v) { return /^[1-9]\d{3}$/.test(v); }, error: 'Bitte eine vierstellige Schweizer PLZ angeben.' },
    { key: 'city', label: 'Ort', type: 'text', autocomplete: 'address-level2', half: true,
      test: function (v) { return /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ .'\/-]+$/.test(v); }, error: 'Bitte den Ort angeben.' },
    { key: 'email', label: 'E-Mail', type: 'email', autocomplete: 'email',
      test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }, error: 'Bitte eine gültige E-Mail-Adresse angeben.' },
    { key: 'phone', label: 'Telefon', type: 'tel', autocomplete: 'tel', placeholder: '+41 79 123 45 67',
      test: function (v) { return /^(\+41|0041|0)[1-9]\d{8}$/.test(v.replace(/[\s().\/-]/g, '')); }, error: 'Bitte eine Schweizer Telefonnummer angeben, z. B. +41 79 123 45 67.' }
  ];

  function buildForm() {
    form.textContent = '';
    var saved = loadCustomer();
    var h = document.createElement('h3');
    h.textContent = 'Lieferadresse (Schweiz)';
    form.appendChild(h);
    var grid = document.createElement('div');
    grid.className = 'cart__fields';
    FIELDS.forEach(function (f) {
      var label = document.createElement('label');
      label.className = 'cart__field' + (f.half ? ' cart__field--half' : '');
      label.appendChild(document.createTextNode(f.label));
      var input = document.createElement('input');
      input.type = f.type;
      input.name = f.key;
      input.required = true;
      input.autocomplete = f.autocomplete;
      if (f.inputmode) input.inputMode = f.inputmode;
      if (f.maxlength) input.maxLength = f.maxlength;
      if (f.placeholder) input.placeholder = f.placeholder;
      var err = document.createElement('small');
      err.className = 'cart__error';
      err.hidden = true;
      if (typeof saved[f.key] === 'string') input.value = saved[f.key];
      input.addEventListener('input', function () { saveCustomer(); err.hidden = true; input.removeAttribute('aria-invalid'); });
      label.append(input, err);
      grid.appendChild(label);
    });
    form.appendChild(grid);
    var actions = document.createElement('div');
    actions.className = 'cart__actions';
    var back = document.createElement('button');
    back.type = 'button';
    back.className = 'button button--outline';
    back.dataset.cartBack = '';
    back.textContent = 'Zurück';
    var submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'button';
    submit.textContent = 'Jetzt bestellen';
    actions.append(back, submit);
    form.appendChild(actions);
  }

  function validate() {
    var customer = {};
    var firstInvalid = null;
    FIELDS.forEach(function (f) {
      var input = form.elements[f.key];
      var value = input.value.trim().replace(/\s+/g, ' ');
      customer[f.key] = value;
      var err = input.parentNode.querySelector('.cart__error');
      var ok = f.test(value);
      err.hidden = ok;
      err.textContent = ok ? '' : f.error;
      if (ok) input.removeAttribute('aria-invalid'); else {
        input.setAttribute('aria-invalid', 'true');
        firstInvalid = firstInvalid || input;
      }
    });
    if (firstInvalid) { firstInvalid.focus(); return null; }
    return customer;
  }

  function showStep(checkout) {
    if (checkout && !form.children.length) buildForm();
    form.hidden = !checkout;
    list.hidden = checkout;
    foot.hidden = checkout;
    if (checkout) { empty.hidden = true; form.elements[FIELDS[0].key].focus(); } else render();
    document.getElementById('cart-title').textContent = checkout ? 'Bestellung' : 'Warenkorb';
  }

  function render() {
    var t = totals();
    document.querySelectorAll('[data-cart-total]').forEach(function (el) { el.textContent = chf(t.sum); });
    document.querySelectorAll('[data-cart-count]').forEach(function (el) { el.textContent = t.count; });
    if (!root) return;
    sum.textContent = chf(t.sum);
    empty.hidden = items.length > 0;
    order.disabled = !items.length;
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
  function close() { if (form && !form.hidden) showStep(false); root.hidden = true; document.body.style.overflow = ''; }

  document.addEventListener('DOMContentLoaded', function () {
    root = document.querySelector('[data-cart]');
    if (root) {
      list = root.querySelector('[data-cart-items]');
      empty = root.querySelector('[data-cart-empty]');
      sum = root.querySelector('[data-cart-sum]');
      order = root.querySelector('[data-cart-checkout]');
      foot = root.querySelector('[data-cart-foot]');
      form = root.querySelector('[data-cart-form]');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var customer = validate();
        if (customer) window.location.href = mailto(customer);
      });
    }
    render();

    document.addEventListener('click', function (e) {
      var target = e.target.closest('[data-add-to-cart], [data-cart-open], [data-cart-close], [data-qty], [data-remove], [data-cart-checkout], [data-cart-back]');
      if (!target) return;
      if (target.matches('[data-add-to-cart]')) {
        add({
          id: target.dataset.id,
          name: target.dataset.name,
          price: parseFloat(target.dataset.price),
          details: target.dataset.details
        });
        open();
      } else if (target.matches('[data-cart-checkout]')) {
        if (items.length) showStep(true);
      } else if (target.matches('[data-cart-back]')) {
        showStep(false);
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
