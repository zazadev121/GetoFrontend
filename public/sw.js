// GETO Project — Web Push Service Worker
// Receives background push events from the backend and displays native OS/mobile notifications

self.addEventListener('push', function (event) {
  let data = { title: 'GETO Project', body: 'ახალი შეტყობინება', url: '/dashboard', icon: '/recommendations/Geto Logo.jpg' };

  try {
    if (event.data) {
      data = Object.assign(data, event.data.json());
    }
  } catch (e) {
    console.warn('[SW] Could not parse push payload', e);
  }

  const title = data.title || 'GETO Project';
  const iconUrl = self.location.origin + (data.icon || '/recommendations/Geto Logo.jpg');

  const options = {
    body: data.body || 'თქვენ გაქვთ ახალი შეტყობინება',
    icon: iconUrl,
    badge: iconUrl,
    data: { url: data.url || '/dashboard' },
    tag: `geto-push-${Date.now()}`,
    renotify: true,
    requireInteraction: true,
    vibrate: [300, 100, 300, 100, 300]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// When user taps/clicks the notification — open/focus the app and navigate
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // If app is already open in a tab, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open a new browser window/tab
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
