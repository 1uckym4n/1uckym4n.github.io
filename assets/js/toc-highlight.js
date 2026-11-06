(() => {
  'use strict';

  const setup = () => {
    const desktop = document.getElementById('TableOfContents');
    if (!desktop) return;
    const desktopLinks = [...desktop.querySelectorAll('a[href^="#"]')];
    const mobileLinks = [...document.querySelectorAll('#TableOfContentsMobile a[href^="#"]')];
    const sidebar = document.getElementById('TOCView');
    let current = null;

    const sync = () => {
      const active = desktop.querySelector('a.active');
      if (!active || active === current) return;
      current = active;
      const href = active.getAttribute('href');

      desktopLinks.forEach(link => {
        if (link === active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      mobileLinks.forEach(link => {
        const selected = link.getAttribute('href') === href;
        link.classList.toggle('active', selected);
        if (selected) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });

      // Scroll only the sidebar. Never move the article or animate each frame.
      if (!sidebar || sidebar.clientHeight === 0) return;
      const frame = sidebar.getBoundingClientRect();
      const item = active.getBoundingClientRect();
      if (item.top < frame.top + 8) sidebar.scrollTop += item.top - frame.top - 8;
      else if (item.bottom > frame.bottom - 8) sidebar.scrollTop += item.bottom - frame.bottom + 8;
    };

    // The theme owns scroll tracking; react only when its active link changes.
    new MutationObserver(sync).observe(desktop, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
    sync();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup, { once: true });
  } else setup();
})();
