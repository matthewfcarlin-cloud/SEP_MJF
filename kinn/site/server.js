// Runs the Kinn site as a normal Node process (local dev, or any host that runs `npm start`).
// On Vercel this file is not used: api/index.js exports the same app as a serverless function.
//   PORT  set by the host; defaults to 3000

const { app, store, ready } = require('./app');

const port = process.env.PORT || 3000;
ready.then(() => app.listen(port, () => console.log(`Kinn site on :${port} (storage: ${store.kind})`)))
  .catch(e => { console.error('storage init failed', e); process.exit(1); });
