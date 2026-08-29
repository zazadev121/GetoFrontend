import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

/**
 * Scroll reveal.
 * Any element carrying `.reveal` fades up once it enters the viewport. A single
 * observer watches the whole document and re-scans on route changes, so pages
 * only have to add the class — no directive, no per-component wiring.
 */
if (typeof window !== 'undefined' && !('IntersectionObserver' in window)) {
  // No observer support: reveal everything immediately rather than leaving
  // sections stuck at opacity 0.
  document.documentElement.classList.add('no-reveal');
}

if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
  const seen = new WeakSet<Element>();

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
  );

  const scan = () => {
    document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      observer.observe(el);
    });
  };

  // Re-scan whenever Angular swaps a routed view in.
  const start = () => {
    scan();
    new MutationObserver(() => scan()).observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}
