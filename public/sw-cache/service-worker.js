const CACHE = 'cache';
const cacheFiles = ['./test.html', './koa.png'];
const needCacheFileList = ['js', 'css', 'png', 'gif', 'html', 'jpg', 'woff', 'ttf', 'eot'];
const needCacheFileReg = new RegExp(`\\.(${needCacheFileList.join('|')})$`, 'g');

function preCache() {
  caches.open(CACHE).then(cache => {
    return cache.addAll(cacheFiles);
  });
}
self.addEventListener('install', evt => {
  console.log('The service worker is being installed.');
  self.skipWaiting(); // 直接进入激活状态,不等待其他sw关闭
  evt.waitUntil(preCache()); // 等待缓存完后进入installed状态
});

function usedCacheRequest(request) {
  // 判断该缓存是否还需要
  return true;
}
function cleanUnusedCacheRequest() {
  return caches.open(CACHE).then(cache => {
    return cache.keys().then(existingRequests => {
      return Promise.all(
        existingRequests.map(req => {
          if (!usedCacheRequest(req)) {
            return cache.delete(req);
          }
        })
      );
    });
  });
}
self.addEventListener('activate', (event) => {
  // 清理缓存等其他操作
  event.waitUntil(
    cleanUnusedCacheRequest().then(() => {
      return self.clients.claim();
    })
  );
});

function addToCache(request, response) {
  const responseToCache = response.clone();
  return caches.open(CACHE).then(cache => {
    cache.put(request, responseToCache);
  });
}
function fromCache(request) {
  return caches.match(request).then(matching => {
    return matching || Promise.reject(Error('no-match'));
  });
}
function fromNetwork(request) {
  return fetch(request).catch(e => {
    Promise.reject(e);
  });
}

self.addEventListener('fetch', evt => {
  const { url, method } = evt.request;
  if (
    method !== 'GET'
    || !/^https:/.test(url)
    // 指定扩展名资源才能缓存
    || !url.match(needCacheFileReg)
  ) {
    return;
  }
  evt.respondWith(
    // 缓存优先
    fromCache(url).catch(() => {
      // 没有找到缓存，走线上
      return fromNetwork(url).then(response => {
        if (response && response.status === 200) {
          // 请求结果正常，加入缓存列表
          addToCache(url, response);
        }
        return response; // 必须返回response
      });
    })
  );
});

self.addEventListener('unhandledrejection', event => {
  console.error(event);
});
