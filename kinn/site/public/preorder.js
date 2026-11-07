/* Preorder links and buttons. If preorders are off, or the server can't be reached, the site offers only the waitlist */
(function preorder() {
  const money = cents => `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`;
  const SOURCE = new URLSearchParams(location.search).get('src') || 'site';
  const FALLBACK = {enabled: false, depositCents: 4900, expectedPrice: '$150', expectedShip: '6 to 12 months', refundAfterMonths: 12};

  function fill(config) {
    const expected = parseInt(config.expectedPrice.replace(/\D/g, ''), 10);
    const values = {deposit: money(config.depositCents), expectedPrice: config.expectedPrice, expectedShip: config.expectedShip, refundAfter: `${config.refundAfterMonths} months`, balance: money(expected * 100 - config.depositCents)};
    document.querySelectorAll('[data-preorder]').forEach(el => { el.textContent = values[el.dataset.preorder]; });
  }

  async function checkout(button, message) {
    button.disabled = true; message.className = 'msg'; message.textContent = 'Opening secure checkout…';
    try {
      const res = await fetch('/api/preorder/checkout', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({source: SOURCE})});
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.url) throw new Error(j.error || "We couldn't open checkout, and you haven't been charged. Try again in a minute.");
      location.assign(j.url);
    } catch (err) {
      message.className = 'msg err'; message.textContent = err.message === 'Failed to fetch' ? "Couldn't reach the server, and you haven't been charged. Check your connection and try again." : err.message;
      button.disabled = false;
    }
  }

  function wire(config) {
    fill(config);
    document.querySelectorAll('[data-preorder-link]').forEach(el => { el.hidden = !config.enabled; });
    document.querySelectorAll('[data-hold]').forEach(button => {
      const message = button.parentElement.querySelector('.msg');
      if (config.enabled) { button.addEventListener('click', () => checkout(button, message)); return; }
      /* not open yet: the same spot sends people to the waitlist */
      button.querySelector('[data-hold-label]').textContent = 'Join the waitlist';
      button.addEventListener('click', () => location.assign('/#join'));
      if (message) message.textContent = 'Preorders open soon.';
    });
    document.querySelectorAll('[data-if-open]').forEach(el => { el.hidden = !config.enabled; });
    /* before preorders open, the same button leads to the waitlist */
    if (!config.enabled) document.querySelectorAll('[data-preorder-cta]').forEach(a => { a.textContent = 'Join the waitlist'; a.href = '/#join'; });
  }

  fetch('/api/preorder/config').then(r => (r.ok ? r.json() : FALLBACK)).catch(() => FALLBACK).then(wire);
})();
