(() => {
  'use strict';

  const setup = () => {
    const video = document.getElementById('bg-video');
    // A hero already supplies the article background. Never request another video.
    if (!video || document.getElementById('hero-background')) return;

    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const connection = navigator.connection;
    const sources = [...video.querySelectorAll('source[data-src]')];
    let loaded = false;
    let playing = false;
    let playAttempt = 0;
    let active = true;
    let pageReady = document.readyState === 'complete';
    let pending = null;
    let usesIdleCallback = false;

    video.muted = true;
    video.dataset.videoState = 'poster';

    const staticMode = () => motion.matches || connection?.saveData
      || ['slow-2g', '2g'].includes(connection?.effectiveType);

    const cancelPending = () => {
      if (pending === null) return;
      if (usesIdleCallback) cancelIdleCallback(pending);
      else clearTimeout(pending);
      pending = null;
    };

    const pause = (unload = false) => {
      cancelPending();
      playAttempt += 1;
      playing = false;
      video.pause();
      video.dataset.videoState = loaded ? 'paused' : 'poster';
      if (unload && loaded) {
        sources.forEach(source => source.removeAttribute('src'));
        video.removeAttribute('src');
        loaded = false;
        video.load();
        video.dataset.videoState = 'poster';
      }
    };

    const play = () => {
      if (!video.isConnected || !active || document.hidden || staticMode()) return;
      if (!loaded) {
        sources.forEach(source => { source.src = source.dataset.src; });
        loaded = true;
        video.load();
      }
      if (playing || !video.paused) return;
      playing = true;
      const attempt = ++playAttempt;
      let request;
      try { request = video.play(); }
      catch (_) { playing = false; video.dataset.videoState = 'poster'; return; }
      Promise.resolve(request).then(() => {
        if (attempt !== playAttempt) return;
        if (!active || document.hidden || staticMode()) pause(staticMode());
        else if (!video.paused) video.dataset.videoState = 'playing';
      }).catch(() => {
        // Autoplay may be blocked, or a pause/load can cancel a pending play.
        if (attempt === playAttempt) video.dataset.videoState = 'poster';
      }).finally(() => { if (attempt === playAttempt) playing = false; });
    };

    const sync = () => {
      if (!video.isConnected || staticMode()) { pause(true); return; }
      if (!active || document.hidden) { pause(); return; }
      if (!pageReady || pending !== null) return;
      if (loaded) { play(); return; }
      // The poster paints first; video downloading waits for primary page assets.
      const start = () => { pending = null; play(); };
      usesIdleCallback = typeof requestIdleCallback === 'function';
      pending = usesIdleCallback
        ? requestIdleCallback(start, { timeout: 1200 })
        : setTimeout(start, 150);
    };

    document.addEventListener('visibilitychange', sync);
    window.addEventListener('pagehide', () => { active = false; pause(); });
    window.addEventListener('pageshow', () => { active = true; sync(); });
    window.addEventListener('load', () => { pageReady = true; sync(); }, { once: true });
    motion.addEventListener('change', sync);
    connection?.addEventListener('change', sync);
    sync();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup, { once: true });
  } else setup();
})();
