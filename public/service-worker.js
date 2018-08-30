self.addEventListener('install', (event) => {
  self.skipWaiting();
  // event.waitUntil(Promise.reject(Error('install')));
});
self.addEventListener('activate', () => {
  self.clients.claim(); // 无需页面刷新，接管页面控制权
});
self.addEventListener('fetch', event => {
  console.log('来自根作用域', event.request.url);
});
