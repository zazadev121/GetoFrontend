// GETO Project — Web Push Service Worker
// Receives push events from the backend and shows native browser notifications

self.addEventListener('push', function (event) {
  let data = { title: 'GETO Project', body: 'განახლება', url: '/', icon: '/recommendations/Geto Logo.jpg' };

  try {
    if (event.data) {
      data = Object.assign(data, event.data.json());
    }
  } catch (e) {
    console.warn('[SW] Could not parse push data', e);
  }

  const options = {
    body: data.body,
    icon: data.icon || '/recommendations/Geto Logo.jpg',
    badge: data.icon || '/recommendations/Geto Logo.jpg',
    data: { url: data.url || '/' },
    requireInteraction: false,
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// When user clicks the notification — open/focus the app and navigate
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // If app is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
