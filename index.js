const Koa = require('koa');
const koaStatic = require('koa-static');
const glob = require('glob');
const path = require('path');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
app.use(bodyParser());
app.use(async (ctx, next) => {
  // http://enable-cors.org/server_expressjs.html
  const { res } = ctx;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
  await next();
});

app.use(async (ctx, next) => {
  // https://github.com/mozilla/serviceworker-cookbook/issues/201
  const { res, req } = ctx;
  const file = req.url.split('/').pop();
  if (file === 'service-worker.js') {
    res.setHeader('Cache-control', 'public, max-age=0');
  }
  await next();
});
app.use(koaStatic(path.join(__dirname, './public')), { maxAge: 36000 });

glob.sync('./public/*/server.js').map(file => {
  const route = `/${path.basename(path.dirname(file))}/`;
  // eslint-disable-next-line import/no-dynamic-require,global-require
  require(file)(app, route);
});
app.listen(3000);
