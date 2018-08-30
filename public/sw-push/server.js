// Use the web-push library to hide the implementation details of the communication
// between the application server and the push service.
// For details, see https://tools.ietf.org/html/draft-ietf-webpush-protocol and
// https://tools.ietf.org/html/draft-ietf-webpush-encryption.
const webPush = require('web-push');
const fs = require('fs');
const router = require('koa-router')();

let key;
if (!fs.existsSync('./key.json')) {
  key = webPush.generateVAPIDKeys();
  fs.writeFileSync('./key.json', JSON.stringify(key, null, 2));
} else {
  key = JSON.parse(fs.readFileSync('./key.json'));
}
// Set the keys used for encrypting the push messages.
webPush.setVapidDetails('http://127.0.0.1:3000/', key.publicKey, key.privateKey);

async function sendNotification(ctx) {
  const { request } = ctx;
  const { subscription } = request.body;
  const payload = { info: '测试数据', time: Date.now() };
  const options = {
    TTL: request.body.ttl,
  };
  return new Promise(resolve => {
    setTimeout(() => {
      webPush
        .sendNotification(subscription, JSON.stringify(payload), options)
        .then((res) => {
          console.log(res);
          ctx.status = 201;
          resolve();
        })
        .catch(error => {
          ctx.status = 500;
          console.error(error);
          resolve();
        });
    }, request.body.delay * 1000);
  });
}
module.exports = function(app, route) {
  console.log(`register route:${route}`);
  const routers = router
    .get(`${route}vapidPublicKey`, ctx => {
      ctx.body = key.publicKey;
    })
    .post(`${route}register`, ctx => {
      ctx.status = 201;
    })
    .post(`${route}sendNotification`, sendNotification);
  app.use(routers.routes()).use(routers.allowedMethods());
};
