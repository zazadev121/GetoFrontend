// GETO Project — Web Push Service Worker
// Stays registered so Chrome can wake this page and show OS notifications
// even when the tab is closed and the phone is locked.

self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
  let data = {
    title: 'GETO Project',
    body: 'ახალი შეტყობინება',
    url: '/dashboard',
    icon: '/recommendations/Geto Logo.jpg'
  };

  try {
    if (event.data) {
      data = Object.assign(data, event.data.json());
    }
  } catch (e) {
    try {
      if (event.data) {
        data.body = event.data.text();
      }
    } catch (e2) {
      console.warn('[SW] Could not parse push payload', e);
    }
  }

  const title = data.title || 'GETO Project';
  const iconUrl = self.location.origin + (data.icon || '/recommendations/Geto Logo.jpg');

  const options = {
    body: data.body || 'თქვენ გაქვთ ახალი შეტყობინება',
    icon: iconUrl,
    badge: iconUrl,
    data: { url: data.url || '/dashboard' },
    tag: data.tag || ('geto-push-' + Date.now()),
    renotify: true,
    requireInteraction: true,
    silent: false,
    vibrate: [300, 100, 300, 100, 300],
    timestamp: Date.now()
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('pushsubscriptionchange', function (event) {
  event.waitUntil((async function () {
    try {
      const oldSub = event.oldSubscription;
      const options = oldSub ? oldSub.options : { userVisibleOnly: true };
      await self.registration.pushManager.subscribe(options);
    } catch (err) {
      console.warn('[SW] Could not renew push subscription', err);
    }
  })());
});
