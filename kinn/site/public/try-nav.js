// Persistent RECO site bar for the /try web app (Expo export).
// Lives outside the React root, so it stays put on every app screen, tabs and modals alike.
(function () {
  if (document.getElementById('reco-sitebar')) return;
  var H = 52;
  var css =
    '#reco-sitebar{position:fixed;top:0;left:0;right:0;height:' + H + 'px;z-index:2147483000;display:flex;align-items:center;justify-content:space-between;' +
    'padding:0 16px;background:rgba(242,241,236,.92);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-bottom:1px solid #E0DCD1;' +
    'font:500 14px/1 Geist,ui-sans-serif,system-ui,-apple-system,sans-serif;color:#1C1E1A;box-sizing:border-box}' +
    '#reco-sitebar a{color:inherit;text-decoration:none;display:inline-flex;align-items:center;gap:8px}' +
    '#reco-sitebar .back{padding:8px 12px 8px 8px;border-radius:999px}#reco-sitebar .back:hover{background:#E8E5DC}' +
    '#reco-sitebar .mark{position:absolute;left:50%;transform:translateX(-50%);font-weight:600;letter-spacing:.14em;font-size:13px}' +
    '#reco-sitebar .cta{background:#2F3A2C;color:#FBFAF7;padding:9px 14px;border-radius:999px;font-size:13px}' +
    '#reco-sitebar .tag{font:500 10px/1 "Geist Mono",ui-monospace,monospace;letter-spacing:.08em;color:#686B62;margin-left:8px}' +
    '@media (max-width:480px){#reco-sitebar .tag{display:none}#reco-sitebar .cta{padding:8px 12px}}' +
    'html,body{height:100%}body{padding-top:' + H + 'px!important;box-sizing:border-box}#root{height:calc(100% - 0px)!important}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var bar = document.createElement('div'); bar.id = 'reco-sitebar';
  bar.innerHTML =
    '<a class="back" href="/" aria-label="Back to RECO home">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>' +
      '<span>Home</span></a>' +
    '<a class="mark" href="/">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="#1C1E1A" stroke-opacity=".18" stroke-width="3"/>' +
      '<path d="M12 3.5A8.5 8.5 0 1 1 3.5 12" stroke="#1F8A72" stroke-width="3" stroke-linecap="round"/></svg>RECO' +
      '<span class="tag">DEMO</span></a>' +
    '<a class="cta" href="/#join">Join waitlist</a>';
  function mount() { if (!document.getElementById('reco-sitebar')) document.body.insertBefore(bar, document.body.firstChild); }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
