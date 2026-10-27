// Vercel serverless entry. vercel.json rewrites /api/*, /admin/* and /healthz here;
// the function receives the original path, so the Express routes in app.js match unchanged.
const { app } = require('../app');

module.exports = app;
