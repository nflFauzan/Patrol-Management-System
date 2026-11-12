// sw.js — Versi minimal, untuk aktivasi PWA saja.
// Tidak ada cache besar karena aplikasi bekerja online.

self.addEventListener("install", (event) => {
  // Service Worker siap digunakan
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Agar segera aktif pada semua tab
  clients.claim();
});

// Tidak meng-cache resource apa pun
// Semua request akan tetap menggunakan jaringan (online first)
self.addEventListener("fetch", (event) => {
  // Tidak mengubah request apa pun
});
