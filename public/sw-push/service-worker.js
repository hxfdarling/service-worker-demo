self.addEventListener('install', () => {
  self.skipWaiting();
});
// Register event listener for the 'push' event.
self.addEventListener('push', event => {
  console.log('收到消息推送', event.data);
  // 等待通知创建成功，需要用户授权
  event.waitUntil(
    self.registration.showNotification('后台推送', {
      body: 'test',
    })
  );
});
self.addEventListener('notificationclick', event => {
  const clickedNotification = event.notification;
  clickedNotification.close();

  const homePage = '/sw-push/index.html';
  const urlToOpen = new URL(homePage, self.location.origin).href;
  // 检测页面是否已经打开了
  const promiseChain = clients
    .matchAll({
      type: 'window',
      includeUncontrolled: true,
    })
    .then(windowClients => {
      let matchingClient = null;

      for (let i = 0, max = windowClients.length; i < max; i++) {
        const windowClient = windowClients[i];
        if (windowClient.url === urlToOpen) {
          matchingClient = windowClient;
          break;
        }
      }
      return matchingClient ? matchingClient.focus() : clients.openWindow(urlToOpen);
    });

  event.waitUntil(promiseChain);
});
