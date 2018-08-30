// Register a Service Worker.
navigator.serviceWorker.register('/sw-sync/service-worker.js');
const tag = 'test';
navigator.serviceWorker.ready.then((registration) => {
  document.getElementById('do-it').onclick = function() {
    registration.sync
      .register(tag)
      .then(() => {
        console.log('后台同步已触发', tag);
        // 使用postMessage进行数据通信
        const msg = JSON.stringify({ type: 'sync', msg: 'test' });
        navigator.serviceWorker.controller.postMessage(msg);
      })
      .catch(err => {
        console.log('后台同步触发失败', err);
      });
  };
});
