self.addEventListener("push", (e) => {
  const data = e.data?.json() ?? {};
  e.waitUntil(
    self.registration.showNotification(data.title || "CarBuddy", {
      body: data.body,
      icon: "/favicon.ico",
      data,
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  // otwieramy /dashboard po kliknięciu
  e.waitUntil(clients.openWindow("/dashboard"));
});
