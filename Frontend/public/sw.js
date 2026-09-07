// GETO Project — Web Push Service Worker
// Stays registered so the browser can wake this app and show an OS notification
// even when the tab is closed and the phone is locked.

const SW_VERSION = 'geto-sw-3';
const FALLBACK_ICON = '/icons/icon-192.png';

self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

// ─── Push ───────────────────────────────────────────────────────────────────

function parsePayload(event) {
  const data = {
    title: 'GETO Project',
    body: '',
    url: '/dashboard',
    icon: FALLBACK_ICON,
    tag: null
  };

  if (!event.data) return data;

  try {
    return Object.assign(data, event.data.json());
  } catch (e) {
    try {
      data.body = event.data.text();
    } catch (e2) {
      // Unreadable payload — still show something rather than nothing, because
      // a userVisibleOnly subscription must display a notification per push.
    }
    return data;
  }
}

self.addEventListener('push', function (event) {
  const data = parsePayload(event);
  const title = data.title || 'GETO Project';
  const icon = data.icon && data.icon.startsWith('http')
    ? data.icon
    : self.location.origin + (data.icon || FALLBACK_ICON);

  // A stable tag per topic: a newer update about the same thing replaces the
  // older one, while unrelated topics still show side by side.
  const tag = data.tag || ('geto-' + (data.url || 'update'));

  const options = {
    body: data.body || 'You have a new update.',
    icon: icon,
    badge: icon,
    data: { url: data.url || '/dashboard' },
    tag: tag,
    renotify: true,
    requireInteraction: false,
    silent: false,
    vibrate: [200, 80, 200],
    timestamp: Date.now(),
    actions: [{ action: 'open', title: 'Open' }]
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      // Mirror into any open tab so the in-app bell updates without a reload.
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
        list.forEach(function (client) {
          client.postMessage({
            type: 'geto-push',
            title: title,
            body: options.body,
            url: options.data.url
          });
        });
      })
    ])
  );
});

// ─── Click ──────────────────────────────────────────────────────────────────

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const targetUrl = (event.notification.data && event.notification.data.url) || '/dashboard';
  const absoluteUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (new URL(client.url).origin !== self.location.origin) continue;

        // Focus first, then navigate: some browsers reject navigate() on an
        // unfocused client, which is why the old order sometimes did nothing.
        return client.focus().then(function (focused) {
          if (focused && 'navigate' in focused) {
            return focused.navigate(absoluteUrl).catch(function () { return focused; });
          }
          return focused;
        });
      }

      if (self.clients.openWindow) return self.clients.openWindow(absoluteUrl);
    })
  );
});

// ─── Subscription renewal ───────────────────────────────────────────────────

self.addEventListener('pushsubscriptionchange', function (event) {
  event.waitUntil((async function () {
    try {
      const oldSub = event.oldSubscription;
      const options = oldSub && oldSub.options
        ? oldSub.options
        : { userVisibleOnly: true };

      const newSub = await self.registration.pushManager.subscribe(options);

      // Tell any open tab to re-sync with the backend; if none is open the app
      // re-syncs on the next load via WebPushService.init().
      const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      list.forEach(function (client) {
        client.postMessage({ type: 'geto-subscription-changed', endpoint: newSub.endpoint });
      });
    } catch (err) {
      console.warn('[SW] Could not renew push subscription', err);
    }
  })());
});

self.addEventListener('message', function (event) {
  if (event.data === 'geto-sw-version') {
    event.source && event.source.postMessage({ type: 'geto-sw-version', version: SW_VERSION });
  }
});
