// A small, isolated page companion. Page text and image URLs are never inserted as HTML.
if (!document.getElementById('pimxdash-companion-root')) {
  const host = document.createElement('div');
  host.id = 'pimxdash-companion-root';
  document.documentElement.appendChild(host);
  const root = host.attachShadow({ mode: 'closed' });
  const style = document.createElement('style');
  style.textContent = `
    :host{all:initial;color-scheme:dark;font-family:Inter,system-ui,sans-serif}
    *{box-sizing:border-box}button{font:inherit;cursor:pointer}button:focus-visible{outline:2px solid #7fffc0;outline-offset:2px}
    .launcher{position:fixed;z-index:2147483646;right:18px;bottom:18px;display:flex;align-items:center;gap:9px;padding:10px 14px;border:1px solid #70e9ab;border-radius:999px;background:#09251b;color:#dfffee;box-shadow:0 8px 40px #00160fad;font-size:12px;font-weight:800;letter-spacing:.04em}
    .launcher b{display:grid;place-items:center;width:22px;height:22px;border-radius:7px;background:#45e89b;color:#072116}
    .panel{position:fixed;z-index:2147483647;right:18px;bottom:70px;width:min(390px,calc(100vw - 24px));max-height:min(650px,calc(100vh - 90px));display:none;flex-direction:column;overflow:hidden;border:1px solid #367a57;border-radius:20px;background:#0b1a15;color:#edfff4;box-shadow:0 28px 90px #000b;font-size:13px;line-height:1.5}
    .panel.open{display:flex}.head{padding:16px 17px 12px;background:linear-gradient(120deg,#154831,#0b1a15);border-bottom:1px solid #2b563e}.top{display:flex;align-items:center;justify-content:space-between;gap:12px}.brand{color:#82ffc0;font-size:11px;font-weight:900;letter-spacing:.16em}.close{border:0;background:transparent;color:#b5cfc0;font-size:22px;line-height:1}.title{display:block;margin-top:10px;font-size:17px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.domain{display:block;color:#9bc3aa;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .tabs{display:flex;gap:4px;overflow-x:auto;padding:9px;background:#0e2119;border-bottom:1px solid #264333}.tabs button{flex:none;border:0;border-radius:9px;padding:7px 10px;background:transparent;color:#a8c7b4;font-size:11px;font-weight:700}.tabs button.active{background:#48e69b;color:#062518}
    .body{padding:15px;overflow:auto}.view{display:none}.view.active{display:block}.stat{padding:12px;border:1px solid #294d38;border-radius:12px;background:#102b1e;color:#c5e6d2;margin-bottom:10px}.stat b{color:#80ffbc}.actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.actions button,.search-links button,.image-card button{border:1px solid #37684c;border-radius:10px;background:#173626;color:#dfffeb;padding:10px;text-align:left;font-size:11px;font-weight:700}.actions button:hover,.search-links button:hover,.image-card button:hover{background:#23583b}.hint{color:#85ae94;font-size:11px;margin-top:12px}.reader{white-space:pre-wrap;line-height:1.75;color:#d0e9d8;max-height:420px;overflow:auto}.search-links{display:grid;grid-template-columns:1fr 1fr;gap:8px}.images{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.image-card{min-width:0;border:1px solid #31523d;border-radius:11px;overflow:hidden;background:#12291d}.image-card img{display:block;width:100%;height:100px;object-fit:cover;background:#183727}.image-card button{width:100%;border:0;border-radius:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.empty{color:#a6bfae}
    @media(max-width:500px){.launcher{right:10px;bottom:10px}.panel{right:10px;bottom:58px}}
  `;
  root.appendChild(style);

  const launcher = document.createElement('button');
  launcher.className = 'launcher';
  launcher.type = 'button';
  launcher.setAttribute('aria-label', 'Open PIMXDASH page tools');
  launcher.innerHTML = '<b>P</b><span>PIMX TOOLS</span>';
  root.appendChild(launcher);

  const panel = document.createElement('section');
  panel.className = 'panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'PIMXDASH page tools');
  panel.innerHTML = `<div class="head"><div class="top"><span class="brand">PIMXDASH / PAGE TOOLS</span><button class="close" type="button" aria-label="Close">×</button></div><strong class="title"></strong><span class="domain"></span></div><div class="tabs"><button type="button" data-tab="overview" class="active">Overview</button><button type="button" data-tab="reader">Reader</button><button type="button" data-tab="images">Images</button><button type="button" data-tab="search">Search</button></div><div class="body"><div class="view active" data-view="overview"><div class="stat"></div><div class="actions"><button type="button" data-action="bookmark">☆ Save page</button><button type="button" data-action="copy">↗ Copy link</button><button type="button" data-action="citation">❞ Copy citation</button><button type="button" data-action="newtab">＋ PIMXDASH tab</button></div><p class="hint">Alt + Shift + P opens these tools on any website.</p></div><div class="view" data-view="reader"><div class="reader"></div></div><div class="view" data-view="images"><div class="images"></div></div><div class="view" data-view="search"><div class="search-links"></div></div></div>`;
  root.appendChild(panel);

  const select = <T extends Element>(selector: string) => panel.querySelector(selector) as T;
  const title = document.title || location.hostname;
  select<HTMLElement>('.title').textContent = title;
  select<HTMLElement>('.domain').textContent = location.hostname;
  const getReadableText = () => {
    const source = document.querySelector('article') || document.querySelector('main') || document.body;
    const visibleText = source?.innerText || '';
    return visibleText.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n\n').trim().slice(0, 35000);
  };
  const words = getReadableText().split(/\s+/).filter(Boolean).length;
  select<HTMLElement>('.stat').textContent = `${words.toLocaleString()} words · about ${Math.max(1, Math.ceil(words / 220))} min read · ${location.hostname}`;
  const googleQuery = /(^|\.)google\.[a-z.]+$/i.test(location.hostname) ? new URLSearchParams(location.search).get('q') : null;
  const search = select<HTMLElement>('.search-links');
  const searchTerms = googleQuery || title;
  for (const [label, tbm] of [['All results', ''], ['Images', 'isch'], ['Videos', 'vid'], ['News', 'nws']]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `${label} ↗`;
    button.addEventListener('click', () => { location.href = `https://www.google.com/search?q=${encodeURIComponent(searchTerms)}${tbm ? `&tbm=${tbm}` : ''}`; });
    search.appendChild(button);
  }
  if (googleQuery) select<HTMLElement>('.stat').textContent = `Google results for “${googleQuery}” · ${words.toLocaleString()} words on this page`;

  let imagesLoaded = false;
  const showTab = (name: string) => {
    panel.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((button) => button.classList.toggle('active', button.dataset.tab === name));
    panel.querySelectorAll<HTMLElement>('[data-view]').forEach((view) => view.classList.toggle('active', view.dataset.view === name));
    if (name === 'reader') select<HTMLElement>('.reader').textContent = getReadableText() || 'No readable text found on this page.';
    if (name === 'images' && !imagesLoaded) {
      imagesLoaded = true;
      const gallery = select<HTMLElement>('.images');
      const found = [...document.images].filter((img) => (img.naturalWidth || img.width) >= 160 && (img.naturalHeight || img.height) >= 100).slice(0, 60);
      if (!found.length) gallery.textContent = 'No large images found on this page.';
      for (const img of found) {
        const url = img.currentSrc || img.src;
        if (!/^https?:\/\//i.test(url)) continue;
        const card = document.createElement('div'); card.className = 'image-card';
        const preview = document.createElement('img'); preview.src = url; preview.alt = img.alt || 'Page image'; preview.loading = 'lazy';
        const open = document.createElement('button'); open.type = 'button'; open.textContent = img.alt || `${img.naturalWidth} × ${img.naturalHeight}`;
        open.title = 'Open image in a new tab'; open.addEventListener('click', () => window.open(url, '_blank', 'noopener,noreferrer'));
        card.append(preview, open); gallery.appendChild(card);
      }
    }
  };
  const toggle = () => { panel.classList.toggle('open'); launcher.setAttribute('aria-expanded', String(panel.classList.contains('open'))); };
  launcher.addEventListener('click', toggle);
  select<HTMLButtonElement>('.close').addEventListener('click', toggle);
  panel.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((button) => button.addEventListener('click', () => showTab(button.dataset.tab || 'overview')));
  panel.addEventListener('click', async (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'newtab') { window.open(chrome.runtime.getURL('newtab.html'), '_blank', 'noopener,noreferrer'); return; }
    if (action === 'bookmark') {
      try { const result = await chrome.runtime.sendMessage({ type: 'pimxdash:save-page', title }); button.textContent = result?.ok ? (result.existing ? '✓ Already saved' : '✓ Saved') : 'Could not save'; }
      catch { button.textContent = 'Could not save'; }
      return;
    }
    const citation = `${title}. ${location.hostname}. ${location.href}`;
    try { await navigator.clipboard.writeText(action === 'citation' ? citation : location.href); button.textContent = '✓ Copied'; }
    catch { button.textContent = 'Copy unavailable'; }
  });
  document.addEventListener('keydown', (event) => {
    if (event.altKey && event.shiftKey && event.key.toLowerCase() === 'p') { event.preventDefault(); toggle(); }
    if (event.key === 'Escape' && panel.classList.contains('open')) toggle();
  });
}
