document.addEventListener('DOMContentLoaded', () => {
  const FADE_MS = 300;
  const EASING = 'ease';
  const accordion = document.querySelector('#detail-accordion');
  const container = document.querySelector('#detail-image');
  if (!accordion || !container) return;

  container.style.transition = `opacity ${FADE_MS}ms ${EASING}`;
  container.style.opacity = '1';
  const innerImg = container.querySelector('img');

  const imageMap = {
    'accordion-option-1': 'https://leonhart.ch/wp-content/uploads/2025/10/zaehler-removebg-preview-11-e1759589038302.webp',
    'accordion-option-2': 'https://leonhart.ch/wp-content/uploads/2025/10/Gallerie-Spieler.jpg',
    'accordion-option-3': 'https://leonhart.ch/wp-content/uploads/2025/10/tor_hoch.jpg',
    'accordion-option-4': 'https://leonhart.ch/wp-content/uploads/2025/10/Gallerie-Seitenasicht.jpg',
    'accordion-option-5': 'https://leonhart.ch/wp-content/uploads/2025/10/Gallerie-Einwurf.jpg',
    'accordion-option-6': 'https://leonhart.ch/wp-content/uploads/2025/10/slider1-1.png',
  };

  function preload(src, onLoad, onError) {
    const img = new Image();
    img.decoding = 'async';
    img.loading = 'eager';
    img.src = src;
    if (img.complete) {
      requestAnimationFrame(onLoad);
    } else {
      img.addEventListener('load', onLoad, { once: true });
      img.addEventListener('error', onError || (() => {}), { once: true });
    }
  }

  function setImage(src) {
    if (innerImg) {
      innerImg.removeAttribute('srcset');
      innerImg.removeAttribute('sizes');
      innerImg.loading = 'eager';
      innerImg.decoding = 'sync';
      innerImg.src = src;
    } else {
      container.style.backgroundImage = `url("${src}")`;
    }
  }

  function swapTo(newSrc) {
    if (!newSrc) return;
    const current = innerImg
      ? innerImg.currentSrc || innerImg.src || ''
      : container.style.backgroundImage || '';
    if (innerImg && current.endsWith(newSrc)) return;

    container.style.opacity = '0';
    preload(
      newSrc,
      () => {
        setImage(newSrc);
        container.offsetHeight; // force reflow so the fade-in transition runs
        container.style.opacity = '1';
      },
      () => {
        container.style.opacity = '1';
      }
    );
  }

  const items = accordion.querySelectorAll('.e-n-accordion-item');
  items.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      items.forEach((other) => {
        if (other !== item) other.removeAttribute('open');
      });
      swapTo(imageMap[item.id]);
    });
  });

  const openItem = accordion.querySelector('.e-n-accordion-item[open]');
  if (openItem && imageMap[openItem.id]) {
    setImage(imageMap[openItem.id]);
    container.style.opacity = '1';
  }
});
