document.addEventListener('DOMContentLoaded', () => {
  const frame = document.getElementById('config-frame');
  if (!frame) return;

  const HEIGHT_EPS = 20;
  const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
  const getIframeOrigin = () => {
    try {
      return new URL(frame.src).origin;
    } catch {
      return null;
    }
  };
  const getViewportHeight = () => window.visualViewport?.height || window.innerHeight;

  // Height of whichever header is currently pinned to the top of the viewport
  const getHeaderOffset = () => {
    const els = [
      document.querySelector('#wpadminbar'),
      document.querySelector('.elementor-location-header'),
      document.querySelector('header.site-header'),
      document.querySelector('header'),
    ].filter(Boolean);
    let h = 0;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const pinned =
        cs.position === 'fixed' ||
        cs.position === 'sticky' ||
        el.classList.contains('elementor-sticky--active');
      if (pinned && r.top <= 1 && r.bottom > 0) {
        h = Math.max(h, r.height);
      }
    }
    return h;
  };

  const clampHeight = (reported) => {
    const header = getHeaderOffset();
    const viewport = Math.round(getViewportHeight());
    const mobileTopGap = isMobile() ? 64 : 0;
    const target = Math.max(200, viewport - header - mobileTopGap);
    return Math.max(target, Math.min(reported, target));
  };

  window.addEventListener('message', (event) => {
    const iframeOrigin = getIframeOrigin();
    if (!iframeOrigin || event.origin !== iframeOrigin) return;
    if (event.data?.type !== 'iframeHeight') return;

    const reported = Number(event.data.height) || 0;
    if (!reported) return;
    const next = clampHeight(reported);
    if (Math.abs(frame.offsetHeight - next) < HEIGHT_EPS) return;
    frame.style.height = next + 'px';
  });

  const reflow = () => {
    const current = frame.offsetHeight;
    if (!current) return;
    frame.style.height = clampHeight(current) + 'px';
  };
  window.addEventListener('resize', reflow);
  window.visualViewport?.addEventListener('resize', reflow);
});
