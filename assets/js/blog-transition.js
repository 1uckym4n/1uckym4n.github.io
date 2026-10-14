(() => {
  'use strict';

  const KEY = 'blog-card-transition';
  const DURATION = 700;
  const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const nativeSupported = 'onpageswap' in window && 'onpagereveal' in window;
  let outgoing = null;
  let surface = null;
  let incomingHero = null;
  let backdrop = null;
  let nativeActive = false;
  let safetyTimer;
  const animations = [];
  const namedElements = [];

  const clearStorage = () => {
    try { sessionStorage.removeItem(KEY); sessionStorage.removeItem('morph-src'); } catch (_) {}
  };
  const readIncoming = () => {
    try {
      const data = JSON.parse(sessionStorage.getItem(KEY));
      const nav = performance.getEntriesByType('navigation')[0];
      if (data && data.to === location.href && Date.now() - data.time < 15000
          && data.rect.width > 0 && data.rect.height > 0
          && (!nav || nav.type === 'navigate') && !reducedMotion.matches) return data;
    } catch (_) {}
    clearStorage();
    return null;
  };
  let incoming = readIncoming();

  // Only the fallback hides content. Native transitions need the final page snapshot.
  if (incoming && !nativeSupported) root.classList.add('blog-transition-pending');
  if (incoming && nativeSupported) {
    // Delay the first render until the article has been parsed, even with streamed HTML.
    const expectation = document.createElement('link');
    expectation.rel = 'expect';
    expectation.setAttribute('blocking', 'render');
    expectation.href = '#site-footer';
    document.head.appendChild(expectation);
  }

  const name = (element, value) => {
    if (!element) return;
    namedElements.push([element, element.style.viewTransitionName]);
    element.style.viewTransitionName = value;
  };
  const navElement = () => document.querySelector('body > header');
  const cleanup = () => {
    clearTimeout(safetyTimer);
    root.classList.remove('blog-transition-pending');
    if (surface) surface.remove();
    if (backdrop) backdrop.remove();
    backdrop = null;
    surface = null;
    animations.splice(0).forEach(animation => animation.cancel());
    namedElements.splice(0).forEach(([element, previous]) => {
      element.style.viewTransitionName = previous;
    });
    incoming = null;
    incomingHero = null;
    nativeActive = false;
    outgoing = null;
  };
  // A cancelled animation or failed script must never leave the article invisible.
  if (incoming) safetyTimer = setTimeout(cleanup, 1800);

  const articleLink = target => {
    const link = target instanceof Element ? target.closest('a[href]') : null;
    const card = link && link.closest('.article-link--card, .article-link--related');
    // Taxonomy badges have their own links; only the article's title/cover opens it.
    if (!card || !link.querySelector('h2') || link.hasAttribute('download')
        || (link.target && link.target !== '_self')) return null;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.hash || url.href === location.href) return null;
    const thumbnail = card.querySelector('.thumbnail_card, .thumbnail_card_related');
    const image = thumbnail && thumbnail.querySelector('img');
    if (!image || !image.complete || !image.naturalWidth) return null;
    return { link, card, thumbnail, image };
  };
  const rectData = element => {
    const { left, top, width, height } = element.getBoundingClientRect();
    return { left, top, width, height };
  };
  const videoFrame = () => {
    const video = document.getElementById('bg-video');
    if (!video) return null;
    if (nativeSupported || video.readyState < 2 || !video.videoWidth) return video.poster || null;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(video.videoWidth, 1280);
      canvas.height = Math.round(canvas.width * video.videoHeight / video.videoWidth);
      canvas.getContext('2d', { alpha: false }).drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.72);
    } catch (_) { return video.poster || null; }
  };

  // Warm the destination HTML and cover while the user approaches a card.
  const prefetched = new Set();
  const warm = event => {
    const article = articleLink(event.target);
    if (!article || reducedMotion.matches || prefetched.has(article.link.href)
        || prefetched.size >= 4 || navigator.connection?.saveData) return;
    prefetched.add(article.link.href);
    fetch(article.link.href, { credentials: 'same-origin', priority: 'low' })
      .then(response => response.ok ? response.text() : '')
      .then(html => {
        const page = new DOMParser().parseFromString(html, 'text/html');
        const hero = page.getElementById('background-image');
        if (hero) {
          const image = new Image();
          image.src = new URL(hero.getAttribute('src'), article.link.href).href;
          image.decode?.().catch(() => {});
        }
      }).catch(() => {});
  };
  document.addEventListener('pointerover', warm, { passive: true });
  document.addEventListener('focusin', warm);
  document.addEventListener('click', event => {
    outgoing = null;
    clearStorage();
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey
        || event.shiftKey || event.altKey || reducedMotion.matches) return;
    const article = articleLink(event.target);
    if (!article) return;
    const rect = rectData(article.card);
    if (!rect.width || !rect.height) return;
    outgoing = article;
    const data = {
      to: article.link.href, time: Date.now(), rect,
      imageRect: rectData(article.thumbnail), src: article.image.currentSrc || article.image.src,
      imageRatio: article.image.naturalWidth / article.image.naturalHeight,
      imagePosition: getComputedStyle(article.image).objectPosition,
      radius: getComputedStyle(article.card).borderRadius,
      html: article.card.outerHTML,
      backdrop: videoFrame()
    };
    try { sessionStorage.setItem(KEY, JSON.stringify(data)); } catch (_) {}
    // Leave link navigation to the browser: history, new tabs and theme scripts keep working.
  });

  const removeArticleVideo = () => {
    const image = document.getElementById('background-image');
    if (!image || /\/img\/background(?:[._/]|$)/.test(new URL(image.src).pathname)) return;
    document.getElementById('bg-video')?.remove();
    document.getElementById('bg-fade')?.remove();
  };
  const sizeVideoFade = () => {
    const fade = document.getElementById('bg-fade');
    if (!fade) return;
    if (fade.parentElement !== root) root.appendChild(fade);
    root.style.position = 'relative';
    fade.style.height = Math.max(root.scrollHeight, innerHeight) + 'px';
  };

  const prepareSurface = () => {
    if (surface) return true;
    const hero = document.getElementById('hero-background');
    if (!incoming || !hero) return false;
    surface = document.createElement('div');
    surface.className = 'blog-transition-surface';
    surface.setAttribute('aria-hidden', 'true');
    surface.inert = true;
    incomingHero = hero.cloneNode(true);
    // No duplicate IDs, scripts, or live controls inside a visual-only layer.
    incomingHero.removeAttribute('id');
    incomingHero.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    incomingHero.querySelectorAll('script').forEach(element => element.remove());
    incomingHero.classList.add('blog-transition-hero');
    incomingHero.style.opacity = '1';
    incomingHero.style.visibility = 'visible';
    const image = incomingHero.querySelector('img');
    const originalImage = hero.querySelector('img');
    // Use the already displayed thumbnail if the large cover is still decoding.
    if (!originalImage.complete || !originalImage.naturalWidth) image.src = incoming.src;
    surface.appendChild(incomingHero);
    document.body.appendChild(surface);
    return true;
  };

  const animate = (element, frames, options = {}) => {
    const animation = element.animate(frames, {
      duration: DURATION, easing: EASING, fill: 'both', ...options
    });
    animations.push(animation);
    return animation;
  };
  const coverBox = (box, ratio, position) => {
    const parts = position.split(' ');
    const align = value => value?.endsWith('%') ? parseFloat(value) / 100 : 0.5;
    const width = Math.max(box.width, box.height * ratio);
    const height = width / ratio;
    return {
      width, height,
      left: box.left + (box.width - width) * align(parts[0]),
      top: box.top + (box.height - height) * align(parts[1])
    };
  };
  const fallback = () => {
    if (!surface && !prepareSurface()) { cleanup(); return; }
    clearStorage();
    if (incoming.backdrop && !backdrop) {
      // Hold the exact video frame while the new document's video starts decoding.
      backdrop = document.createElement('img');
      backdrop.className = 'blog-transition-backdrop';
      backdrop.src = incoming.backdrop;
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.appendChild(backdrop);
    }
    const { rect, imageRect, radius } = incoming;
    const width = innerWidth;
    const height = innerHeight;
    const inset = `inset(${rect.top}px ${width - rect.left - rect.width}px ${height - rect.top - rect.height}px ${rect.left}px round ${radius})`;
    const heroHeight = incomingHero.getBoundingClientRect().height;
    const image = incomingHero.querySelector('img');
    const startPhoto = coverBox(imageRect, incoming.imageRatio, incoming.imagePosition);
    const endPhoto = coverBox({ left: 0, top: 0, width, height: heroHeight },
      incoming.imageRatio, getComputedStyle(image).objectPosition);
    Object.assign(image.style, {
      inset: 'auto', left: endPhoto.left + 'px', top: endPhoto.top + 'px',
      width: endPhoto.width + 'px', height: endPhoto.height + 'px', maxWidth: 'none',
      transformOrigin: '0 0'
    });
    const start = `translate(${startPhoto.left - endPhoto.left}px, ${startPhoto.top - endPhoto.top}px) scale(${startPhoto.width / endPhoto.width})`;
    const imageInset = `inset(${imageRect.top}px ${width - imageRect.left - imageRect.width}px ${heroHeight - imageRect.top - imageRect.height}px ${imageRect.left}px)`;

    // The card shell opens independently; its text disappears without stretching.
    const template = document.createElement('template');
    template.innerHTML = incoming.html;
    const card = template.content.firstElementChild;
    card.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    card.querySelectorAll('script').forEach(element => element.remove());
    card.classList.add('blog-transition-card');
    Object.assign(card.style, {
      left: rect.left + 'px', top: rect.top + 'px',
      width: rect.width + 'px', height: rect.height + 'px'
    });
    surface.appendChild(card);
    animate(surface, [{ clipPath: inset }, { clipPath: 'inset(0px round 0px)' }]);
    animate(incomingHero, [{ clipPath: imageInset }, { clipPath: 'inset(0px)' }]);
    animate(image, [{ transform: start }, { transform: 'none' }]);
    animate(card, [{ opacity: 1 }, { opacity: 0 }], { duration: 160 });
    root.classList.remove('blog-transition-pending');
    const main = document.getElementById('main-content');
    animate(main, [{ opacity: 0 }, { opacity: 1 }],
      { duration: 300, delay: 330 });
    const content = document.getElementById('single_header');
    if (content) animate(content, [{ transform: 'translateY(12px)' }, { transform: 'none' }],
      { duration: 300, delay: 330 });
    // Keep the list's video behind the expanding card until it covers the viewport.
    setTimeout(removeArticleVideo, 350);
    const finish = animate(surface, [{ opacity: 1 }, { opacity: 0 }],
      { duration: 220, delay: 480, easing: 'ease-out' });
    finish.finished.then(cleanup, cleanup);
    clearTimeout(safetyTimer);
    safetyTimer = setTimeout(cleanup, DURATION + 500);
  };

  window.addEventListener('pageswap', event => {
    if (!event.viewTransition) return;
    if (!outgoing || reducedMotion.matches || event.activation?.entry.url !== outgoing.link.href) {
      event.viewTransition.skipTransition();
      return;
    }
    name(outgoing.card, 'blog-card');
    name(outgoing.thumbnail, 'blog-cover');
    name(navElement(), 'blog-nav');
    event.viewTransition.finished.then(cleanup, cleanup);
  });
  window.addEventListener('pagereveal', event => {
    if (!event.viewTransition) {
      if (incoming) {
        if (prepareSurface()) fallback();
        else root.classList.add('blog-transition-pending');
      }
      return;
    }
    if (!incoming || reducedMotion.matches) {
      event.viewTransition.skipTransition();
      cleanup();
      return;
    }
    if (!prepareSurface()) {
      // Streamed HTML may not have reached the hero yet. DCL will run the fallback.
      event.viewTransition.skipTransition();
      root.classList.add('blog-transition-pending');
      return;
    }
    clearStorage();
    nativeActive = true;
    removeArticleVideo();
    name(surface, 'blog-card');
    name(incomingHero, 'blog-cover');
    name(navElement(), 'blog-nav');
    event.viewTransition.ready.catch(cleanup);
    event.viewTransition.finished.then(cleanup, cleanup);
    clearTimeout(safetyTimer);
    safetyTimer = setTimeout(cleanup, DURATION + 500);
  });

  document.addEventListener('DOMContentLoaded', () => {
    if (!incoming || nativeActive) removeArticleVideo();
    sizeVideoFade();
    if (!incoming) return;
    if (!prepareSurface()) { cleanup(); clearStorage(); return; }
    if (!nativeSupported || root.classList.contains('blog-transition-pending')) fallback();
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) { cleanup(); clearStorage(); }
  });
  window.addEventListener('resize', () => { cleanup(); sizeVideoFade(); });
  window.addEventListener('load', sizeVideoFade);
  reducedMotion.addEventListener('change', cleanup);
})();
