document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', function () {
  // Footer year
  document.querySelectorAll('.currentyear').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Mobile navigation
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Scroll reveal
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Single-open accordion that swaps the detail image
  var accordion = document.getElementById('detail-accordion');
  var figure = document.getElementById('detail-image');
  if (accordion && figure) {
    var img = figure.querySelector('img');
    var items = accordion.querySelectorAll('details');
    items.forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (!item.open) return;
        items.forEach(function (other) { if (other !== item) other.removeAttribute('open'); });
        var src = item.dataset.image;
        if (!src || img.getAttribute('src') === src) return;
        var next = new Image();
        next.onload = function () { img.src = src; img.style.opacity = 1; };
        img.style.transition = 'opacity 0.3s ease';
        img.style.opacity = 0;
        next.src = src;
      });
    });
  }
});
