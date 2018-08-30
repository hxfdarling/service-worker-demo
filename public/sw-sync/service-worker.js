self.addEventListener('install', () => {
  self.skipWaiting();
});
// Register event listener for the 'push' event.
self.addEventListener('sync', event => {
  console.log('收到同步消息', event);
});
self.addEventListener('message', (event) => {
  console.log('收到客户端message', event);
});
