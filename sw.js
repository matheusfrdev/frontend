/* ==================================================
   SERVICE WORKER — Minha Rotina
   Roda em segundo plano, mesmo com o site fechado.
================================================== */

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/* Recebe a notificação enviada pelo servidor via Web Push */
self.addEventListener("push", (event) => {
  let dados = { title: "Minha rotina", body: "Hora de uma nova atividade." };

  if (event.data) {
    try {
      dados = event.data.json();
    } catch (erro) {
      dados.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(dados.title, {
      body: dados.body,
      icon: "icon-192.png",
      badge: "icon-192.png",
      tag: "rotina-notificacao"
    })
  );
});

/* Ao clicar na notificação, abre (ou foca) o site */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((janelas) => {
      for (const janela of janelas) {
        if (janela.url.includes(self.location.origin) && "focus" in janela) {
          return janela.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow("/");
      }
    })
  );
});
