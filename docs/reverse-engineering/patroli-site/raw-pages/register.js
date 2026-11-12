// register.js — Mendaftarkan Service Worker secara otomatis

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch((err) => {
      console.error("SW registration failed:", err);
    });
  });
}
