/* Lola Beauty — site.js (vanilla, sin dependencias)
   Textos por idioma: <script id="i18n" type="application/json"> en cada página. */
(function () {
  'use strict';
  var html = document.documentElement;
  var T = {};
  try { T = JSON.parse(document.getElementById('i18n').textContent); } catch (e) {}
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = function () { return RM.matches; };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Medición (seo.md §7): dataLayer siempre; gtag/plausible si existen ---------- */
  window.dataLayer = window.dataLayer || [];
  function track(name, params) {
    params = Object.assign({ page_lang: html.lang }, params || {});
    window.dataLayer.push(Object.assign({ event: name }, params));
    if (typeof window.gtag === 'function') window.gtag('event', name, params);
    if (typeof window.plausible === 'function') window.plausible(name, { props: params });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    var loc = a.getAttribute('data-track-location') || 'body';
    if (/wa\.me|api\.whatsapp\.com/.test(a.href)) track('whatsapp_click', { link_location: loc });
    else if (/instagram\.com/.test(a.href)) track('instagram_click', { link_location: loc });
    else if (a.protocol === 'mailto:' && !a.closest('form')) track('email_click', { link_location: loc });
    else if (a.hasAttribute('hreflang') && a.closest('[data-lang-switch]'))
      track('language_switch', { from_lang: html.lang, to_lang: a.getAttribute('hreflang') });
  }, { passive: true });

  /* ---------- 1. Hero: entrada ---------- */
  requestAnimationFrame(function () { html.classList.add('hero-in'); });
  setTimeout(function () { html.classList.add('hero-in'); }, 1500);

  /* ---------- 2. Revelados al hacer scroll ---------- */
  var hasIO = 'IntersectionObserver' in window;
  if (hasIO) {
    html.classList.add('io');
    $$('[data-reveal-group]').forEach(function (g) {
      $$('[data-reveal]', g).forEach(function (el, i) { el.style.setProperty('--i', Math.min(i, 5)); });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });
    var vh = window.innerHeight;
    $$('[data-reveal]').forEach(function (el) {
      if (el.getBoundingClientRect().bottom < 0) { // ya pasado (volver atrás / ancla)
        el.classList.add('no-anim', 'is-in');
        requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.remove('no-anim'); }); });
      } else io.observe(el);
    });
  }

  /* ---------- 3. Cabecera compacta (un solo rAF) ---------- */
  var ticking = false, scrolled = null;
  function frame() {
    ticking = false;
    var s = window.scrollY > 48;
    if (s !== scrolled) { html.classList.toggle('is-scrolled', s); scrolled = s; }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  frame();

  /* ---------- 4. Menú móvil ---------- */
  var menuBtn = $('.menu-btn'), nav = $('#site-nav');
  function setMenu(open) {
    html.classList.toggle('menu-open', open);
    ['main', '.footer', '.mbar', '.site-header .lang', '.header__cta', '.header__ig', '.logo'].forEach(function (sel) {
      var el = $(sel); if (el) { if (open) el.setAttribute('inert', ''); else el.removeAttribute('inert'); }
    });
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? T.menuClose : T.menuOpen);
    }
  }
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () { setMenu(!html.classList.contains('menu-open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && html.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1280) setMenu(false); }, { passive: true });
  }

  /* ---------- 5. Selector de idioma: conserva la sección ---------- */
  var sections = $$('main section[id]');
  var currentSection = '';
  if (hasIO && sections.length) {
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) currentSection = e.target.id; });
      $$('.nav a[href^="#"]').forEach(function (a) {
        a.toggleAttribute('aria-current', a.getAttribute('href') === '#' + currentSection);
        if (a.getAttribute('href') === '#' + currentSection) a.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { sio.observe(s); });
  }
  $$('[data-lang-switch] a[hreflang]').forEach(function (a) {
    a.addEventListener('click', function () {
      try { localStorage.setItem('lang', a.getAttribute('hreflang')); } catch (e) {}
      var hash = html.hasAttribute('data-page') ? '' : ((currentSection && currentSection !== 'hero') ? '#' + currentSection : location.hash);
      if (hash) a.href = a.href.split('#')[0] + hash;
    });
  });

  /* ---------- 6. CTAs a #book: preseleccionan servicio y enfocan el h2 ---------- */
  var form = $('#check-date');
  $$('a[href="#book"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var svc = a.getAttribute('data-service');
      if (svc && form && form.service) { form.service.value = svc; form.service.dispatchEvent(new Event('change')); }
      var target = $('#book-title');
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
      target.focus({ preventScroll: true });
      if (history.replaceState) history.replaceState(null, '', '#book');
    });
  });

  /* ---------- 7. Barra fija móvil / WhatsApp flotante escritorio ---------- */
  var heroCta = $('.hero__ctas'), book = $('#book');
  if (hasIO && heroCta && book && !form) { /* paginas de servicio: #book es la CTA final, sin formulario */
    var gone = false, onCta = false;
    var upd2 = function () { html.classList.toggle('show-bar', gone && !onCta); };
    new IntersectionObserver(function (es) { gone = !es[0].isIntersecting && es[0].boundingClientRect.top < 0; upd2(); }).observe(heroCta);
    new IntersectionObserver(function (es) { onCta = es[0].isIntersecting; upd2(); }, { rootMargin: '0px 0px -20% 0px' }).observe(book);
  } else if (hasIO && heroCta && book) {
    var heroGone = false, bookOn = false, typing = false;
    var upd = function () { html.classList.toggle('show-bar', heroGone && !bookOn && !typing); };
    new IntersectionObserver(function (es) { heroGone = !es[0].isIntersecting && es[0].boundingClientRect.top < 0; upd(); }).observe(heroCta);
    new IntersectionObserver(function (es) { bookOn = es[0].isIntersecting; upd(); }, { rootMargin: '0px 0px -20% 0px' }).observe(book);
    document.addEventListener('focusin', function (e) { if (e.target.matches('input,select,textarea')) { typing = true; upd(); } });
    document.addEventListener('focusout', function () { typing = false; upd(); });
  }

  /* ---------- 8. Portfolio: filtros + visor ---------- */
  var grid = $('.grid');
  var filterBtns = $$('[data-filter]');
  var live = $('.portfolio__status');
  var empty = $('.empty');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      track('portfolio_filter', { filter: f });
      grid.classList.toggle('is-filtered', f !== 'all');
      var items = Array.prototype.slice.call(grid.children);
      var show = function (it) { return f === 'all' || (it.getAttribute('data-cat') || '').split(' ').indexOf(f) > -1; };
      var out = items.filter(function (it) { return !it.hidden && !show(it); });
      var done = function () {
        items.forEach(function (it) { it.hidden = !show(it); it.classList.remove('is-out'); });
        var shown = items.filter(function (it) { return !it.hidden && it.classList.contains('pf'); });
        shown.forEach(function (it, i) {
          it.style.setProperty('--i', Math.min(i, 6));
          if (!reduced()) {
            it.classList.add('is-entering');
            requestAnimationFrame(function () { requestAnimationFrame(function () { it.classList.remove('is-entering'); }); });
          }
        });
        if (empty) empty.hidden = shown.length > 0;
        if (live) live.textContent = btn.textContent.trim() + ': ' + shown.length + ' / ' + items.filter(function (it) { return it.classList.contains('pf'); }).length;
      };
      if (reduced() || !out.length) return done();
      out.forEach(function (it) { it.classList.add('is-out'); });
      setTimeout(done, 260);
    });
  });

  var dlg = $('.lightbox');
  if (dlg && typeof dlg.showModal === 'function' && grid) {
    var img = $('img', dlg) || $('.lightbox__in', dlg).appendChild(document.createElement('img')), count = $('.lightbox__count', dlg);
    var list = [], idx = 0, opener = null;
    var showImg = function (i) {
      idx = (i + list.length) % list.length;
      var a = list[idx], t = $('img', a);
      dlg.classList.add('is-swapping');
      setTimeout(function () {
        img.src = a.getAttribute('href'); img.alt = t.alt;
        var fin = function () { dlg.classList.remove('is-swapping'); };
        if (img.decode) img.decode().then(fin, fin); else fin();
        count.textContent = (idx + 1) + ' / ' + list.length;
      }, reduced() ? 0 : 200);
    };
    grid.addEventListener('click', function (e) {
      var a = e.target.closest('.pf a'); if (!a) return;
      e.preventDefault(); opener = a;
      list = $$('.pf:not([hidden]) a', grid);
      showImg(list.indexOf(a));
      dlg.showModal(); html.classList.add('lb-open');
    });
    $('.lightbox__prev', dlg).addEventListener('click', function () { showImg(idx - 1); });
    $('.lightbox__next', dlg).addEventListener('click', function () { showImg(idx + 1); });
    $('.lightbox__close', dlg).addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.classList.contains('lightbox__in')) dlg.close(); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') showImg(idx - 1);
      if (e.key === 'ArrowRight') showImg(idx + 1);
    });
    dlg.addEventListener('close', function () { html.classList.remove('lb-open'); if (opener) opener.focus(); });
    swipe(dlg, function (d) { showImg(idx + d); });
  }

  /* ---------- 8b. Menu Services (details): Esc, clic fuera, salida del panel ---------- */
  var sm = $('.svcmenu');
  if (sm) {
    var closeSm = function (focus) { if (sm.open) { sm.open = false; if (focus) $('summary', sm).focus(); } };
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSm(true); });
    document.addEventListener('click', function (e) { if (!sm.contains(e.target)) closeSm(false); });
    document.addEventListener('focusin', function (e) { if (!sm.contains(e.target)) closeSm(false); });
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      var tm;
      sm.addEventListener('mouseenter', function () { clearTimeout(tm); tm = setTimeout(function () { sm.open = true; }, 120); });
      sm.addEventListener('mouseleave', function () { clearTimeout(tm); tm = setTimeout(function () { sm.open = false; }, 200); });
    }
  }

  /* ---------- 8c. Galeria de servicio: flechas y estado ---------- */
  $$('.sgal').forEach(function (g) {
    var strip = $('.sgal__strip', g), prev = $('.sgal__prev', g), next = $('.sgal__next', g);
    if (!strip || !prev || !next) return;
    var step = function () { var it = $('.sgal__item', strip); return it ? it.getBoundingClientRect().width + 16 : 300; };
    var upd = function () {
      var over = strip.scrollWidth > strip.clientWidth + 4;
      prev.hidden = next.hidden = !over;
      prev.disabled = strip.scrollLeft <= 4;
      next.disabled = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 4;
    };
    prev.addEventListener('click', function () { strip.scrollBy({ left: -step(), behavior: reduced() ? 'auto' : 'smooth' }); });
    next.addEventListener('click', function () { strip.scrollBy({ left: step(), behavior: reduced() ? 'auto' : 'smooth' }); });
    strip.addEventListener('scroll', function () { window.requestAnimationFrame(upd); }, { passive: true });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
    });
    window.addEventListener('resize', upd, { passive: true });
    window.addEventListener('load', upd);
    upd();
  });

  /* ---------- 8d. Reels: se reproducen solo en pantalla (sin autoplay con movimiento reducido) ---------- */
  $$('.reel').forEach(function (r) {
    var v = $('video', r), btn = $('.reel__btn', r);
    if (!v || !btn) return;
    var manual = false;
    var label = function () {
      var l = btn.getAttribute('aria-label').split(': ').slice(1).join(': ');
      btn.setAttribute('aria-label', (v.paused ? btn.getAttribute('data-play') : btn.getAttribute('data-pause')) + (l ? ': ' + l : ''));
    };
    var play = function () { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); };
    v.addEventListener('play', function () { r.classList.add('is-playing'); label(); });
    v.addEventListener('pause', function () { r.classList.remove('is-playing'); label(); });
    btn.addEventListener('click', function () {
      if (v.paused) { manual = false; play(); } else { manual = true; v.pause(); }
    });
    if (hasIO) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { if (!reduced() && !manual) play(); }
          else if (!v.paused) v.pause();
        });
      }, { threshold: 0.5 }).observe(r);
    }
  });

  /* ---------- 9. Carrusel de reseñas ---------- */
  $$('.reviews').forEach(function (root) {
    var slides = $$('.review', root);
    if (slides.length < 2) return;
    var dots = $$('.dot', root), bar = $('.reviews__bar', root), status = $('.reviews__status', root), counter = $('.reviews__count', root);
    var cur = 0;
    root.classList.add('is-carousel');
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var go = function (n, announce) {
      n = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        s.classList.toggle('is-active', i === n);
        s.classList.toggle('is-leaving', i === cur && i !== n);
        if (i !== n) s.setAttribute('inert', ''); else s.removeAttribute('inert');
        s.setAttribute('aria-hidden', String(i !== n));
      });
      dots.forEach(function (d, i) { if (i === n) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
      if (bar) bar.style.transform = 'scaleX(' + ((n + 1) / slides.length) + ')';
      if (counter) counter.textContent = pad(n + 1) + ' / ' + pad(slides.length);
      if (announce !== false && status) status.textContent = slides[n].getAttribute('aria-label');
      cur = n;
    };
    $('.rbtn--prev', root).addEventListener('click', function () { go(cur - 1); });
    $('.rbtn--next', root).addEventListener('click', function () { go(cur + 1); });
    dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); }); });
    root.addEventListener('keydown', function (e) {
      if (e.target.closest('a,input,textarea')) return;
      if (e.key === 'ArrowLeft') go(cur - 1);
      if (e.key === 'ArrowRight') go(cur + 1);
    });
    swipe($('.reviews__track', root), function (d) { go(cur + d); });
    go(0, false);
  });

  /* ---------- 11. FAQ: medición ---------- */
  $$('.qa').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) track('faq_open', { question: $('summary', d).textContent.trim().slice(0, 80) });
    });
  });

  /* ---------- 12. Formulario "Check your date" ---------- */
  if (form) initForm(form);

  function initForm(f) {
    f.setAttribute('novalidate', '');
    var dateIn = f.event_date, svc = f.service, btn = $('.form__submit', f), summary = $('.form__summary', f);
    var msg = $('.form__msg', f);
    if (btn) btn.disabled = false; // sin JS el botón queda desactivado y se usa el enlace a WhatsApp
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var iso = function (d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };
    if (dateIn) dateIn.min = iso(today);
    var touched = {};
    var dateOptional = function () { return svc && (svc.value === 'brows' || svc.value === 'other' || svc.value === 'class'); };
    if (svc) svc.addEventListener('change', function () {
      var opt = dateOptional();
      dateIn.required = !opt;
      var star = $('#event_date-label .star', f);
      if (star) star.hidden = opt;
      if (opt) clearErr(dateIn);
    });
    var fields = ['name', 'event_date', 'service', 'people'];
    function check(el) {
      var v = (el.value || '').trim();
      switch (el.name) {
        case 'name': return v ? '' : T.err.name;
        case 'event_date':
          if (!v) return dateOptional() ? '' : T.err.date;
          return new Date(v + 'T00:00:00') < today ? T.err.datePast : '';
        case 'service': return v ? '' : T.err.service;
        case 'people': return !v || (/^\d+$/.test(v) && +v >= 1 && +v <= 30) ? '' : T.err.people;
      }
      return '';
    }
    function setErr(el, text) {
      var box = el.closest('.field'), out = $('#' + el.id + '-err', f);
      box.classList.add('has-error'); el.setAttribute('aria-invalid', 'true');
      if (out) $('span', out).textContent = text;
    }
    function clearErr(el) { el.closest('.field').classList.remove('has-error'); el.removeAttribute('aria-invalid'); }
    fields.forEach(function (n) {
      var el = f[n]; if (!el) return;
      el.addEventListener('blur', function () {
        if (!touched[n] && !el.value) return;
        touched[n] = true;
        var m = check(el); if (m) setErr(el, m); else clearErr(el);
      });
      ['input', 'change'].forEach(function (ev) { el.addEventListener(ev, function () { if (el.getAttribute('aria-invalid') && !check(el)) clearErr(el); }); });
    });
    function fmtDate(v) {
      if (!v) return '—';
      try { return new Date(v + 'T00:00:00').toLocaleDateString(html.lang, { year: 'numeric', month: 'long', day: 'numeric' }); } catch (e) { return v; }
    }
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var errs = [];
      fields.forEach(function (n) {
        var el = f[n]; if (!el) return;
        touched[n] = true;
        var m = check(el);
        if (m) { setErr(el, m); errs.push({ el: el, m: m }); } else clearErr(el);
      });
      if (errs.length) {
        var ul = $('ul', summary); ul.innerHTML = '';
        errs.forEach(function (x) {
          var li = document.createElement('li'), a = document.createElement('a');
          a.href = '#' + x.el.id; a.textContent = x.m;
          a.addEventListener('click', function (ev) { ev.preventDefault(); x.el.focus(); });
          li.appendChild(a); ul.appendChild(li);
        });
        summary.classList.add('is-on'); summary.focus();
        return;
      }
      summary.classList.remove('is-on');
      var L = T.lbl, sv = svc.options[svc.selectedIndex].text;
      var lines = [T.waIntro, '',
        L.name + ': ' + f.name.value.trim(),
        L.date + ': ' + fmtDate(dateIn.value),
        L.service + ': ' + sv,
        L.people + ': ' + (f.people.value || '—'),
        L.venue + ': ' + (f.venue.value.trim() || '—')];
      var m = f.message.value.trim();
      if (m) lines.push(L.message + ': ' + m);
      var url = T.waBase + '?text=' + encodeURIComponent(lines.join('\n'));
      track('generate_lead', { form_id: 'check-date', service_type: svc.value, party_size: Number(f.people.value) || null, method: 'whatsapp' });
      if (msg) { msg.className = 'form__msg is-on'; msg.setAttribute('role', 'status'); msg.textContent = T.waNote; }
      var w = window.open(url, '_blank', 'noopener');
      if (!w) window.location.href = url;
    });
  }

  /* util: swipe horizontal que no bloquea el scroll vertical */
  function swipe(el, cb) {
    if (!el) return;
    var x0 = null, y0 = null;
    el.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    el.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) cb(dx < 0 ? 1 : -1);
      x0 = null;
    }, { passive: true });
  }
})();
