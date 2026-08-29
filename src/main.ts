import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

/**
 * Scroll behaviour that the whole app shares.
 *
 *  1. Reveal — anything with `.reveal` or `.stagger` animates in once it enters
 *     the viewport. A single observer watches the document and re-scans when
 *     Angular swaps a routed view in, so pages only have to add the class.
 *  2. Scroll-linked custom properties — `--scroll-progress` (0..1) and
 *     `--scroll-y` (px) drive the progress bar and the hero parallax from CSS,
 *     which keeps the work off the main thread's layout path.
 */
if (typeof window !== 'undefined') {
  const root = document.documentElement;

  // ── 1. Reveal ─────────────────────────────────────────────────────────────
  if ('IntersectionObserver' in window) {
    const seen = new WeakSet<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
    );

    const scan = () => {
      document
        .querySelectorAll('.reveal:not(.is-visible), .stagger:not(.is-visible), .sheen:not(.is-visible)')
        .forEach((el) => {
          if (seen.has(el)) return;
          seen.add(el);
          observer.observe(el);
        });
    };

    const start = () => {
      scan();
      new MutationObserver(() => scan()).observe(document.body, { childList: true, subtree: true });
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
      start();
    }
  } else {
    // No observer support: show everything rather than leaving it at opacity 0.
    root.classList.add('no-reveal');
  }

  // ── 2. Scroll-linked custom properties ────────────────────────────────────
  let ticking = false;

  const publishScroll = () => {
    ticking = false;
    const y = window.scrollY || 0;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    root.style.setProperty('--scroll-y', `${y}px`);
    root.style.setProperty('--scroll-progress', String(Math.min(1, y / max)));
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(publishScroll);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  publishScroll();
}
