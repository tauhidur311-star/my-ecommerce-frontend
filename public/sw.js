// Minimal service worker for development - no caching
console.log('Development service worker loaded - no caching enabled');

// Skip waiting and claim clients immediately
self.addEventListener('install', (event) => {
  console.log('Service worker installing - skipping wait');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activating - claiming clients');
  event.waitUntil(self.clients.claim());
});

// Don't cache anything during development
self.addEventListener('fetch', (event) => {
  // Let all requests pass through to the network
  return;
});