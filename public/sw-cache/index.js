// Register a Service Worker.
window.addEventListener('DOMContentLoaded', () => {
  if (navigator.serviceWorker) {
    navigator.serviceWorker
      .register('/sw-cache/service-worker.js')
      .then(() => {
        console.log('register success');
      })
      .catch(e => {
        console.error(e);
      });
  }
  document.querySelector('#unregister').addEventListener('click', () => {
    // 获取指定作用域的service worker，参数可以是被控制页面的路径，也可是作用域路径
    navigator.serviceWorker.getRegistration('/sw-cache/').then(registration => {
      if (registration) {
        registration.unregister().then(() => {
          console.log('unregister success');
        });
      }
    });
  });
});
