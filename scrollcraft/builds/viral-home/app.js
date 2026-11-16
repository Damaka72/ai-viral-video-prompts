/* viral-home: the prompt writes the film, the film-strip index, click-to-play films and the
   free-sample popup. Everything here is enhancement: without it the page is a readable catalogue. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- the signature move: each word of the exact prompt lights as the hero advances ---- */
  var hero = document.getElementById('obj-film-1');
  var prompt = document.getElementById('hero-prompt');
  var words = prompt ? [].slice.call(prompt.querySelectorAll('.w')) : [];
  function lightWords() {
    if (!hero || !words.length) return;
    var raw = getComputedStyle(hero).getPropertyValue('--sc-p');
    if (reduce || raw === '' || isNaN(parseFloat(raw))) { words.forEach(function (w) { w.classList.add('on'); }); return; }
    var p = parseFloat(raw);
    var t = Math.min(1, Math.max(0, (p - 0.1) / 0.72));
    var lit = Math.round(t * words.length);
    words.forEach(function (w, i) { w.classList.toggle('on', i < lit); });
  }
  if (prompt && !reduce) prompt.classList.add('lit-ready');

  /* ---- the index of objects ---- */
  var ticks = [].slice.call(document.querySelectorAll('.tick'));
  var nowEl = document.getElementById('strip-now');
  var targets = ticks.map(function (t) { return document.getElementById(t.getAttribute('data-target')); });
  var lastGroup = null;
  ticks.forEach(function (t) { var g = t.getAttribute('data-group'); if (g !== lastGroup) { t.setAttribute('data-first', ''); lastGroup = g; } });
  ticks[0] && ticks[0].removeAttribute('data-first');

  function currentIndex() {
    var vw = window.innerWidth, vh = window.innerHeight, best = -1, bestD = Infinity;
    targets.forEach(function (el, i) {
      if (!el) return;
      var r = el.getBoundingClientRect();
      if (r.right < 0 || r.left > vw || r.bottom < 0 || r.top > vh) return;
      var cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
      var d = Math.abs(cx - vw * 0.4) + Math.abs(cy - vh / 2) * 0.35;   /* rails read from just left of centre, so the first item can win */
      if (el.classList.contains('hero') || el.classList.contains('close')) d = Math.abs(cy - vh / 2) * 0.35;
      if (d < bestD) { bestD = d; best = i; }
    });
    return best;
  }
  var lastIdx = -2;
  function paintStrip() {
    var i = currentIndex();
    if (i === lastIdx || i < 0) return;
    lastIdx = i;
    ticks.forEach(function (t, k) { t.classList.toggle('is-now', k === i); });
    var el = targets[i];
    if (el && nowEl) nowEl.textContent = el.getAttribute('data-name') || '';
  }

  function jump(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var act = el.closest('[data-sc-act="pan"]');
    if (act && !reduce) {
      var rail = act.querySelector('.rail');
      var overflow = rail.scrollWidth - window.innerWidth;
      var ov = parseFloat(rail.getAttribute('data-sc-pan')) || 0;
      var travel = overflow * (1 + ov);
      var want = el.offsetLeft - (window.innerWidth - el.offsetWidth) / 2;
      var p = travel > 0 ? Math.min(1, Math.max(0, want / travel)) : 0;
      var top = act.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top + p * (act.offsetHeight - window.innerHeight));
    } else if (act) {
      el.scrollIntoView({ inline: 'center', block: 'nearest' });
    } else {
      var t = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, el.classList.contains('hero') ? t : t - 16);
    }
  }
  document.querySelectorAll('.tick, .strip__tabs a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = (a.getAttribute('data-target') || a.getAttribute('href').replace('#', ''));
      e.preventDefault(); jump(id);
    });
  });

  var ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; lightWords(); paintStrip(); }); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  lightWords(); paintStrip();

  /* ---- films: the player loads only after a click ---- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.film__play');
    if (!b) return;
    var film = b.closest('.film'); var id = film && film.getAttribute('data-yt');
    if (!id) return;
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
    f.title = b.getAttribute('aria-label') || 'Video';
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    f.allowFullscreen = true;
    film.innerHTML = ''; film.appendChild(f);
  });

  /* ---- expand a prompt ---- */
  document.addEventListener('click', function (e) {
    var m = e.target.closest('.more');
    if (!m) return;
    var obj = m.closest('.obj'); var open = obj.classList.toggle('is-open');
    m.setAttribute('aria-expanded', open ? 'true' : 'false');
    m.textContent = open ? 'Show less' : 'Read the whole prompt';
  });

  /* ---- the free-sample popup (opens only when asked for) ---- */
  var pop = document.getElementById('leadMagnetPopup'), box = document.getElementById('lead-box'), lastFocus = null;
  function openPop() {
    lastFocus = document.activeElement; pop.hidden = false; pop.setAttribute('aria-hidden', 'false');
    var f = document.getElementById('leadFirstName'); if (f) f.focus();
  }
  function closePop() {
    pop.hidden = true; pop.setAttribute('aria-hidden', 'true'); if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.querySelectorAll('[data-open-popup]').forEach(function (b) { b.addEventListener('click', openPop); });
  pop.addEventListener('click', function (e) { if (e.target.closest('[data-close-popup]')) closePop(); });
  document.addEventListener('keydown', function (e) {
    if (pop.hidden) return;
    if (e.key === 'Escape') { closePop(); return; }
    if (e.key === 'Tab') {
      var f = [].slice.call(box.querySelectorAll('button, input, a[href]')).filter(function (x) { return !x.disabled && x.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  var form = document.getElementById('leadMagnetForm'), err = document.getElementById('lead-err');
  form.addEventListener('submit', function (e) {
    e.preventDefault(); err.hidden = true;
    var email = document.getElementById('leadEmail').value.trim();
    var first = document.getElementById('leadFirstName').value.trim();
    var last = document.getElementById('leadLastName').value.trim();
    if (!email || !first || !last) { err.textContent = 'Please fill in all fields.'; err.hidden = false; return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { err.textContent = 'Please enter a valid email address.'; err.hidden = false; return; }
    var btn = form.querySelector('button[type="submit"]'); var label = btn.textContent;
    btn.disabled = true; btn.textContent = 'Submitting...';
    fetch('https://mvttihozhozigtrwqsyy.supabase.co/functions/v1/beehiiv-subscribe', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, first_name: first, last_name: last })
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (d.data && d.data.id) {
        box.innerHTML = '<button class="lead__close" type="button" data-close-popup aria-label="Close">&times;</button>' +
          '<div class="lead__ok"><h2>Success</h2><p>Check your email for your 50 FREE AI Video Prompts.</p>' +
          '<p class="small">Don’t forget to check your spam folder.</p></div>';
        setTimeout(closePop, 6000);
      } else { throw new Error('failed'); }
    }).catch(function () {
      btn.disabled = false; btn.textContent = label;
      err.textContent = 'Something went wrong. Please try again.'; err.hidden = false;
    });
  });
})();
