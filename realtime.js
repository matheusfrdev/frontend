/* ==================================================
   REALTIME — WebSocket + Push
   Arquivo separado do script.js original, de propósito.
================================================== */

const SERVER_URL = "https://backend-notificacao.onrender.com";
const WS_URL = SERVER_URL.replace(/^http/, "ws");

/* ==================================================
   WEBSOCKET — tempo real enquanto o site está aberto
================================================== */

function conectarWebSocket() {
  const socket = new WebSocket(WS_URL);

  socket.addEventListener("open", () => {
    console.log("[WS] Conectado ao servidor.");
  });

  socket.addEventListener("message", (event) => {
    const evento = JSON.parse(event.data);

    if (evento.type === "routine_update") {
      console.log(`[WS] Atividade atual: ${evento.activity}`);
      /* O script.js já recalcula sozinho a cada segundo,
         então aqui só logamos — não precisa duplicar a lógica de tela. */
    }
  });

  socket.addEventListener("close", () => {
    console.log("[WS] Desconectado. Tentando reconectar em 5s...");
    setTimeout(conectarWebSocket, 5000);
  });

  socket.addEventListener("error", () => {
    socket.close();
  });
}

conectarWebSocket();

/* ==================================================
   BOTÃO "ATIVAR NOTIFICAÇÕES"
   Criado por JS pra não mexer no index.html/style.css
================================================== */

function criarBotaoNotificacoes() {
  const estiloBotao = `
    margin-top: 12px;
    margin-right: 8px;
    padding: 8px 16px;
    background: var(--card, #111113);
    color: var(--text, #f4f4f5);
    border: 1px solid var(--border, #242428);
    border-radius: 8px;
    font-family: inherit;
    font-size: 14px;
    cursor: pointer;
  `;

  const botaoAtivar = document.createElement("button");
  botaoAtivar.textContent = "Ativar notificações";
  botaoAtivar.style.cssText = estiloBotao;
  botaoAtivar.addEventListener("click", ativarNotificacoes);

  const botaoTeste = document.createElement("button");
  botaoTeste.textContent = "Testar notificação";
  botaoTeste.style.cssText = estiloBotao;
  botaoTeste.addEventListener("click", testarNotificacao);

  const header = document.querySelector(".header");
  if (header) header.after(botaoAtivar, botaoTeste);
}

/* Dispara uma notificação de teste na hora, sem esperar o horário real.
   Só funciona depois de ter clicado em "Ativar notificações" antes. */
async function testarNotificacao() {
  try {
    const resposta = await fetch(`${SERVER_URL}/test-notification`, { method: "POST" });
    const dados = await resposta.json();

    if (dados.inscricoesNotificadas === 0) {
      alert("Nenhuma inscrição ativa. Clique em 'Ativar notificações' primeiro.");
    } else {
      console.log("[TESTE] Notificação de teste disparada.");
    }
  } catch (erro) {
    alert("Erro ao chamar o backend. Confira se SERVER_URL está correto.");
    console.error(erro);
  }
}

/* ==================================================
   ATIVAÇÃO: permissão + service worker + push
================================================== */

async function ativarNotificacoes() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    alert("Seu navegador não suporta notificações push.");
    return;
  }

  const permissao = await Notification.requestPermission();
  if (permissao !== "granted") {
    alert("Você precisa permitir as notificações para receber os lembretes.");
    return;
  }

  const registro = await navigator.serviceWorker.register("sw.js");
  console.log("[SW] Service worker registrado.");

  const { publicKey } = await fetch(`${SERVER_URL}/vapid-public-key`).then((r) => r.json());

  const subscription = await registro.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey)
  });

  await fetch(`${SERVER_URL}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription)
  });

  alert("Notificações ativadas!");
}

/* Converte a chave pública VAPID (base64) pro formato que o navegador espera */
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/* ==================================================
   INICIALIZAÇÃO
================================================== */

document.addEventListener("DOMContentLoaded", criarBotaoNotificacoes);
