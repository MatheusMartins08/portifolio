/* @ds-bundle: {"format":4,"namespace":"MF","components":[{"name":"Icon"},{"name":"Button"},{"name":"ArrowLink"},{"name":"SectionLabel"},{"name":"StatusDot"},{"name":"Tag"},{"name":"LanguageSwitch"},{"name":"Header"},{"name":"Portrait"},{"name":"MorphText"},{"name":"ScrollCue"},{"name":"Hero"},{"name":"Statement"},{"name":"Reveal"},{"name":"ProfileTerminal"},{"name":"InfoCard"},{"name":"Coordinates"},{"name":"ServiceCard"},{"name":"FilterTabs"},{"name":"Timeline"},{"name":"SkillFolder"},{"name":"ProjectCard"},{"name":"CaseHero"},{"name":"CaseSection"},{"name":"Field"},{"name":"ContactModal"},{"name":"Footer"}]} */
(function () {
  'use strict';
  var R = window.React;
  if (!R) { return; }
  var h = R.createElement, Fragment = R.Fragment;
  var useState = R.useState, useEffect = R.useEffect, useRef = R.useRef, useLayoutEffect = R.useLayoutEffect, useId = R.useId;

  /* ---------- helpers ---------- */
  function cx() { var o = []; for (var i = 0; i < arguments.length; i++) { if (arguments[i]) o.push(arguments[i]); } return o.join(' '); }
  function omit(obj, keys) { var o = {}; for (var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k) && keys.indexOf(k) < 0) o[k] = obj[k]; } return o; }
  function reduced() { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function pad2(n) { n = String(n); return n.length < 2 ? '0' + n : n; }
  function scrollParent(el) {
    var p = el && el.parentElement;
    while (p && p !== document.body && p !== document.documentElement) {
      var oy = getComputedStyle(p).overflowY;
      if (oy === 'auto' || oy === 'scroll') return p;
      p = p.parentElement;
    }
    return null;
  }
  function useInView(ref, opts) {
    var s = useState(false), inView = s[0], set = s[1];
    useEffect(function () {
      var el = ref.current; if (!el) return;
      if (reduced() || typeof IntersectionObserver === 'undefined') { set(true); return; }
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { set(true); io.disconnect(); } });
      }, { root: scrollParent(el), threshold: (opts && opts.threshold) || 0.2, rootMargin: (opts && opts.rootMargin) || '0px 0px -8% 0px' });
      io.observe(el);
      return function () { io.disconnect(); };
    }, []);
    return inView;
  }

  /* ---------- Icon ---------- */
  var ICONS = {
    'arrow-up-right': 'M7 17L17 7M9 7h8v8',
    'arrow-down': 'M12 5v14M6 13l6 6 6-6',
    'arrow-up': 'M12 19V5M6 11l6-6 6 6',
    'arrow-right': 'M5 12h14M13 6l6 6-6 6',
    'arrow-left': 'M19 12H5M11 6l-6 6 6 6',
    'chevron-down': 'M6 9l6 6 6-6',
    'plus': 'M12 5v14M5 12h14',
    'close': 'M6 6l12 12M18 6L6 18',
    'check': 'M5 12.5l4.5 4.5L19 7.5',
    'globe': 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0M3 12h18M12 3c2.4 2.6 3.6 5.6 3.6 9s-1.2 6.4-3.6 9c-2.4-2.6-3.6-5.6-3.6-9S9.6 5.6 12 3',
    'mail': 'M3.5 6h17v12h-17zM4 6.5l8 6.5 8-6.5',
    'chat': 'M4 5h16v11H9.5L5 19.5V16H4z',
    'code': 'M9 7l-5 5 5 5M15 7l5 5-5 5',
    'pin': 'M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5',
    'folder': 'M3.5 6.5h6l2 2h9v10h-17z',
    'terminal': 'M3.5 5h17v14h-17zM7 10l3 2.5L7 15M12.5 15H17',
    'file': 'M6.5 3.5h7l4 4v13h-11zM13.5 3.5v4h4',
    'alert': 'M12 7.5v5.5M12 16.2v.3M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0',
    'menu': 'M4 8h16M4 16h16',
    'link': 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
    'user': 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5c1.2-3.6 4.1-5.5 7.5-5.5s6.3 1.9 7.5 5.5'
  };
  function Icon(p) {
    var size = p.size || 16;
    return h('svg', {
      className: cx('mf-icon', p.className), width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
      stroke: 'currentColor', strokeWidth: p.strokeWidth || 1.5, strokeLinecap: 'round', strokeLinejoin: 'round',
      'aria-hidden': p.label ? undefined : true, role: p.label ? 'img' : undefined, 'aria-label': p.label, focusable: 'false'
    }, h('path', { d: ICONS[p.name] || ICONS['arrow-right'] }));
  }
  Icon.names = Object.keys(ICONS);

  var DIRS = { 'arrow-up-right': [1, -1], 'arrow-down': [0, 1], 'arrow-up': [0, -1], 'arrow-right': [1, 0], 'arrow-left': [-1, 0] };
  function SlideIcon(p) {
    var d = DIRS[p.name];
    if (!d) return h('span', { className: 'mf-slide', 'aria-hidden': true }, h(Icon, { name: p.name, size: p.size }));
    return h('span', { className: 'mf-slide', 'aria-hidden': true, style: { '--dx': d[0], '--dy': d[1] } },
      h(Icon, { name: p.name, size: p.size, className: 'mf-slide__a' }),
      h(Icon, { name: p.name, size: p.size, className: 'mf-slide__b' }));
  }

  /* ---------- Button ---------- */
  function Button(p) {
    var variant = p.variant || 'primary', size = p.size || 'md';
    var tag = p.href ? 'a' : 'button';
    var rest = omit(p, ['variant', 'size', 'icon', 'children', 'className', 'loading']);
    if (tag === 'button' && !rest.type) rest.type = 'button';
    if (p.loading) { rest['aria-busy'] = true; if (tag === 'button') rest.disabled = true; }
    return h(tag, Object.assign(rest, { className: cx('mf-btn', 'mf-hover', 'mf-btn--' + variant, 'mf-btn--' + size, p.loading && 'is-loading', p.className) }),
      p.loading ? h('span', { className: 'mf-spinner', 'aria-hidden': true }) : null,
      h('span', { className: 'mf-btn__label' }, p.children),
      p.icon && !p.loading ? h(SlideIcon, { name: p.icon, size: size === 'sm' ? 14 : 16 }) : null);
  }

  /* ---------- ArrowLink ---------- */
  function ArrowLink(p) {
    var icon = p.icon === undefined ? 'arrow-up-right' : p.icon;
    var ext = p.external !== undefined ? p.external : /^https?:/.test(p.href || '');
    var size = p.size || 'md';
    var rest = omit(p, ['icon', 'external', 'size', 'children', 'className', 'newTabLabel']);
    if (ext) { rest.target = '_blank'; rest.rel = 'noopener noreferrer'; }
    return h('a', Object.assign(rest, { className: cx('mf-alink', 'mf-hover', 'mf-alink--' + size, p.className) }),
      h('span', { className: 'mf-alink__text' }, p.children),
      icon ? h(SlideIcon, { name: icon, size: size === 'lg' ? 20 : size === 'sm' ? 12 : 14 }) : null,
      ext ? h('span', { className: 'mf-sr' }, ' ' + (p.newTabLabel || '(abre em nova aba)')) : null);
  }

  /* ---------- SectionLabel ---------- */
  function SectionLabel(p) {
    return h(p.as || 'p', { className: cx('mf-label', p.rule && 'mf-label--rule', p.className), id: p.id },
      p.index != null ? h('span', { className: 'mf-label__idx' }, p.index) : null,
      p.index != null ? h('span', { className: 'mf-label__sep', 'aria-hidden': true }, '/') : null,
      h('span', { className: 'mf-label__text' }, p.children));
  }

  /* ---------- StatusDot ---------- */
  function StatusDot(p) {
    var tone = p.tone || 'open';
    return h('span', { className: cx('mf-status', 'mf-status--' + tone, p.className) },
      h('span', { className: 'mf-status__dot', 'aria-hidden': true }),
      p.children ? h('span', { className: 'mf-status__text' }, p.children) : null);
  }

  /* ---------- Tag ---------- */
  function Tag(p) {
    return h('span', { className: cx('mf-tag', p.tone && 'mf-tag--' + p.tone, p.className) }, p.children);
  }

  /* ---------- LanguageSwitch ---------- */
  var LANGS = [{ code: 'PT', label: 'Português' }, { code: 'EN', label: 'English' }, { code: 'ES', label: 'Español' }];
  function LanguageSwitch(p) {
    var options = p.options || LANGS;
    var s1 = useState(p.defaultValue || options[0].code), inner = s1[0], setInner = s1[1];
    var value = p.value !== undefined ? p.value : inner;
    var s2 = useState(false), open = s2[0], setOpen = s2[1];
    var s3 = useState(0), act = s3[0], setAct = s3[1];
    var root = useRef(null), btn = useRef(null), list = useRef(null);
    var id = useId();
    var label = p.label || 'Idioma';
    useEffect(function () {
      if (!open) return;
      function onDoc(e) { if (root.current && !root.current.contains(e.target)) setOpen(false); }
      document.addEventListener('pointerdown', onDoc);
      return function () { document.removeEventListener('pointerdown', onDoc); };
    }, [open]);
    useEffect(function () { if (open && list.current) list.current.focus({ preventScroll: true }); }, [open]);
    function choose(code) {
      if (p.value === undefined) setInner(code);
      if (p.onChange) p.onChange(code);
      setOpen(false);
      if (btn.current) btn.current.focus();
    }
    function openMenu() {
      var i = -1; options.forEach(function (o, k) { if (o.code === value) i = k; });
      setAct(i < 0 ? 0 : i); setOpen(true);
    }
    function onKey(e) {
      var n = options.length;
      if (e.key === 'ArrowDown') { e.preventDefault(); setAct((act + 1) % n); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setAct((act - 1 + n) % n); }
      else if (e.key === 'Home') { e.preventDefault(); setAct(0); }
      else if (e.key === 'End') { e.preventDefault(); setAct(n - 1); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(options[act].code); }
      else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); if (btn.current) btn.current.focus(); }
      else if (e.key === 'Tab') { setOpen(false); }
    }
    return h('div', { className: cx('mf-lang', open && 'is-open', p.className), ref: root },
      h('button', {
        ref: btn, type: 'button', className: 'mf-lang__btn', 'aria-haspopup': 'listbox', 'aria-expanded': open,
        'aria-controls': id + 'l', 'aria-label': label + ': ' + value,
        onClick: function () { if (open) setOpen(false); else openMenu(); },
        onKeyDown: function (e) { if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !open) { e.preventDefault(); openMenu(); } }
      },
        h(Icon, { name: 'globe', size: 14 }),
        h('span', { className: 'mf-lang__code' }, value),
        h(Icon, { name: 'chevron-down', size: 12, className: 'mf-lang__chev' })),
      h('ul', {
        ref: list, id: id + 'l', role: 'listbox', tabIndex: -1, className: 'mf-lang__menu', 'aria-label': label,
        'aria-activedescendant': open ? id + 'o' + act : undefined, onKeyDown: onKey
      },
        options.map(function (o, i) {
          var sel = o.code === value;
          return h('li', {
            key: o.code, id: id + 'o' + i, role: 'option', 'aria-selected': sel,
            className: cx('mf-lang__opt', i === act && 'is-active', sel && 'is-selected'),
            onClick: function () { choose(o.code); }, onPointerEnter: function () { setAct(i); }
          },
            h('span', { className: 'mf-lang__optcode' }, o.code),
            h('span', { className: 'mf-lang__optlabel' }, o.label),
            h('span', { className: 'mf-lang__mark', 'aria-hidden': true }));
        })));
  }

  /* ---------- Header ---------- */
  var NAV = [{ id: 'sobre', label: 'Sobre' }, { id: 'servicos', label: 'Serviços' }, { id: 'experiencia', label: 'Experiência' }, { id: 'skills', label: 'Skills' }, { id: 'projetos', label: 'Projetos' }];
  function useScrollSpy(ids, offset) {
    var s = useState(ids[0]), cur = s[0], set = s[1];
    useEffect(function () {
      function on() {
        var y = offset == null ? 140 : offset, c = ids[0];
        ids.forEach(function (id) { var el = document.getElementById(id); if (el && el.getBoundingClientRect().top - y <= 0) c = id; });
        set(c);
      }
      on();
      window.addEventListener('scroll', on, { passive: true });
      return function () { window.removeEventListener('scroll', on); };
    }, [ids.join(','), offset]);
    return cur;
  }
  function Header(p) {
    var items = p.items || NAV;
    var s1 = useState(false), menu = s1[0], setMenu = s1[1];
    var s2 = useState(false), scrolled = s2[0], setScrolled = s2[1];
    var pill = useRef(null), ind = useRef(null), root = useRef(null);
    var sheetId = useId();
    useEffect(function () {
      function on() { setScrolled(window.scrollY > 16); }
      on(); window.addEventListener('scroll', on, { passive: true });
      return function () { window.removeEventListener('scroll', on); };
    }, []);
    useEffect(function () {
      if (!menu) return;
      function key(e) { if (e.key === 'Escape') setMenu(false); }
      function doc(e) { if (root.current && !root.current.contains(e.target)) setMenu(false); }
      document.addEventListener('keydown', key); document.addEventListener('pointerdown', doc);
      return function () { document.removeEventListener('keydown', key); document.removeEventListener('pointerdown', doc); };
    }, [menu]);
    function moveInd(el) {
      var i = ind.current; if (!i) return;
      if (!el) { i.style.opacity = '0'; return; }
      var first = i.style.opacity !== '1';
      if (first) i.style.transition = 'none';
      i.style.width = el.offsetWidth + 'px';
      i.style.transform = 'translateX(' + el.offsetLeft + 'px)';
      if (first) { void i.offsetWidth; i.style.transition = ''; }
      i.style.opacity = '1';
    }
    function go(e, id) {
      setMenu(false);
      if (p.onNavigate) { e.preventDefault(); p.onNavigate(id); }
    }
    return h('header', { ref: root, className: cx('mf-header', p.fixed === false ? 'mf-header--static' : 'mf-header--fixed', scrolled && 'is-scrolled', menu && 'is-menu', p.className) },
      h('div', { className: 'mf-header__in' },
        h('div', { className: 'mf-header__start' }, h(LanguageSwitch, { value: p.lang, defaultValue: p.defaultLang, onChange: p.onLangChange, options: p.languages, label: p.langLabel })),
        h('nav', { className: 'mf-nav', 'aria-label': p.navLabel || 'Principal' },
          h('div', { className: 'mf-nav__pill', ref: pill, onPointerLeave: function () { moveInd(null); } },
            h('span', { className: 'mf-nav__ind', ref: ind, 'aria-hidden': true }),
            h('ul', { className: 'mf-nav__list' }, items.map(function (it) {
              var on = it.id === p.active;
              return h('li', { key: it.id },
                h('a', {
                  className: cx('mf-nav__link', on && 'is-active'), href: '#' + it.id, 'aria-current': on ? 'location' : undefined,
                  onPointerEnter: function (e) { moveInd(e.currentTarget); }, onFocus: function (e) { moveInd(e.currentTarget); }, onBlur: function () { moveInd(null); },
                  onClick: function (e) { go(e, it.id); }
                }, it.label, h('span', { className: 'mf-nav__dot', 'aria-hidden': true })));
            }))),
          h('button', { type: 'button', className: 'mf-nav__menu', 'aria-expanded': menu, 'aria-controls': sheetId, onClick: function () { setMenu(!menu); } },
            h('span', null, menu ? (p.closeLabel || 'Fechar') : (p.menuLabel || 'Menu')),
            h('span', { className: 'mf-nav__burger', 'aria-hidden': true }, h('i'), h('i')))),
        h('div', { className: 'mf-header__end' },
          h(Button, { variant: 'ghost', size: 'sm', icon: 'arrow-down', href: p.cvHref || '#', download: p.cvHref ? '' : undefined },
            h('span', { className: 'mf-hide-sm' }, (p.cvLabel || 'Download CV')), h('span', { className: 'mf-show-sm' }, 'CV'))),
        h('div', { className: 'mf-header__sheet', id: sheetId, hidden: !menu },
          h('ul', null, items.map(function (it, i) {
            return h('li', { key: it.id }, h('a', { href: '#' + it.id, className: cx(it.id === p.active && 'is-active'), onClick: function (e) { go(e, it.id); } },
              h('span', { className: 'mf-header__sheetidx' }, pad2(i + 1)), it.label));
          })))));
  }

  /* ---------- Portrait ---------- */
  function MediaPlaceholder(p) {
    return h('div', { className: cx('mf-ph', p.variant && 'mf-ph--' + p.variant), 'aria-hidden': true },
      p.variant === 'ui' ? h('div', { className: 'mf-ph__ui' }, h('i'), h('i'), h('i'), h('i'), h('i')) : null,
      h('span', { className: 'mf-ph__label' }, p.label));
  }
  function Portrait(p) {
    return h('figure', { className: cx('mf-portrait', p.className) },
      h('div', { className: 'mf-portrait__frame' },
        p.src ? h('img', { src: p.src, alt: p.alt || '', className: 'mf-portrait__img' }) : h(MediaPlaceholder, { label: p.placeholder || 'Foto · 4:5' })),
      h('span', { className: 'mf-portrait__mark mf-portrait__mark--tl', 'aria-hidden': true }),
      h('span', { className: 'mf-portrait__mark mf-portrait__mark--br', 'aria-hidden': true }),
      p.caption === false ? null : h('figcaption', { className: 'mf-portrait__cap' },
        h('span', null, p.caption || 'Fig. 01'), h('span', null, p.meta || 'Belo Horizonte — 2026')));
  }

  /* ---------- MorphText ---------- */
  function MorphText(p) {
    var phrases = p.phrases && p.phrases.length ? p.phrases : ['Fullstack Developer', 'Produtos Digitais', 'Automações & IA'];
    var interval = p.interval || 3400;
    var ref = useRef(null);
    var key = phrases.join('\u0001');
    useEffect(function () {
      var el = ref.current; if (!el) return;
      var alive = true, timer = 0, idx = 0;
      el.textContent = '';
      var line = document.createElement('span'); line.className = 'mf-morph__line';
      var caret = document.createElement('span'); caret.className = 'mf-morph__caret';
      el.appendChild(line); if (p.caret !== false) el.appendChild(caret);
      function build(text) {
        var spans = [];
        Array.from(text).forEach(function (ch) {
          var s = document.createElement('span');
          s.className = ch === ' ' ? 'mf-morph__sp' : 'mf-morph__ch';
          s.textContent = ch === ' ' ? ' ' : ch;
          s.setAttribute('data-ch', ch);
          line.appendChild(s); spans.push(s);
        });
        return spans;
      }
      var cur = build(phrases[0]);
      function swapPlain(text) {
        return new Promise(function (res) {
          var a = line.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' });
          a.onfinish = function () { line.textContent = ''; cur = build(text); a.cancel(); line.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220 }); res(); };
        });
      }
      function morph(text) {
        if (reduced() || !line.animate) return swapPlain(text);
        var fs = parseFloat(getComputedStyle(el).fontSize) || 24;
        var old = cur.map(function (s) { return { s: s, x: s.offsetLeft, y: s.offsetTop, ch: s.getAttribute('data-ch') }; });
        var overlay = document.createElement('span'); overlay.className = 'mf-morph__overlay';
        old.forEach(function (o) { if (o.ch === ' ') { o.s.remove(); return; } o.s.style.left = o.x + 'px'; o.s.style.top = o.y + 'px'; overlay.appendChild(o.s); });
        line.textContent = '';
        el.appendChild(overlay);
        cur = build(text);
        var fresh = cur.map(function (s) { return { s: s, x: s.offsetLeft, y: s.offsetTop, ch: s.getAttribute('data-ch') }; });
        var used = old.map(function () { return false; });
        var pairs = [], enters = [];
        fresh.forEach(function (n) {
          if (n.ch === ' ') return;
          var best = -1, bd = 1e9;
          old.forEach(function (o, k) {
            if (used[k] || o.ch !== n.ch) return;
            var d = Math.abs(o.x - n.x) + Math.abs(o.y - n.y) * 2;
            if (d < bd) { bd = d; best = k; }
          });
          if (best >= 0) { used[best] = true; pairs.push({ o: old[best], n: n }); } else enters.push(n);
        });
        var exits = old.filter(function (o, k) { return !used[k] && o.ch !== ' '; });
        var anims = [];
        exits.forEach(function (o, i) {
          anims.push(o.s.animate([
            { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' },
            { opacity: 0, transform: 'translateY(-0.4em)', filter: 'blur(6px)' }
          ], { duration: 380, delay: i * 16, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' }));
        });
        pairs.forEach(function (pr, i) {
          pr.n.s.style.opacity = '0';
          var dx = pr.n.x - pr.o.x, dy = pr.n.y - pr.o.y;
          var lift = (i % 2 ? -1 : 1) * fs * 0.22;
          anims.push(pr.o.s.animate([
            { transform: 'translate(0px,0px)' },
            { transform: 'translate(' + (dx / 2) + 'px,' + (dy / 2 - lift) + 'px)', offset: 0.5 },
            { transform: 'translate(' + dx + 'px,' + dy + 'px)' }
          ], { duration: 900, delay: 140 + i * 22, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }));
        });
        enters.forEach(function (n, i) {
          anims.push(n.s.animate([
            { opacity: 0, transform: 'translateY(0.4em)', filter: 'blur(6px)' },
            { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' }
          ], { duration: 560, delay: 460 + i * 26, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' }));
        });
        return Promise.all(anims.map(function (a) { return a.finished.catch(function () {}); })).then(function () {
          pairs.forEach(function (pr) { pr.n.s.style.opacity = ''; });
          overlay.remove();
          anims.forEach(function (a) { try { a.cancel(); } catch (e) {} });
        });
      }
      function step() {
        if (!alive) return;
        if (document.hidden) { timer = setTimeout(step, interval); return; }
        idx = (idx + 1) % phrases.length;
        morph(phrases[idx]).then(function () { if (alive) timer = setTimeout(step, interval); });
      }
      var start = function () { if (alive && phrases.length > 1) timer = setTimeout(step, interval); };
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else start();
      return function () { alive = false; clearTimeout(timer); el.textContent = ''; };
    }, [key, interval, p.caret]);
    var Tag = p.as || 'p';
    return h(Tag, { className: cx('mf-morph', p.className) },
      h('span', { className: 'mf-sr' }, phrases.join(', ')),
      h('span', { className: 'mf-morph__stage', ref: ref, 'aria-hidden': true }));
  }

  /* ---------- ScrollCue ---------- */
  function ScrollCue(p) {
    function go() {
      var t = typeof p.target === 'string' ? document.querySelector(p.target) : p.target;
      if (t && t.scrollIntoView) t.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
      if (p.onClick) p.onClick();
    }
    return h('button', { type: 'button', className: cx('mf-cue', p.className), onClick: go, 'aria-label': p.ariaLabel || 'Ir para Sobre mim' },
      h('span', { className: 'mf-cue__label', 'aria-hidden': true }, p.label || 'Scroll'),
      h('span', { className: 'mf-cue__track', 'aria-hidden': true }, h('span', { className: 'mf-cue__drop' })),
      h('span', { className: 'mf-cue__ring', 'aria-hidden': true }, h(Icon, { name: 'arrow-down', size: 14 })));
  }

  /* ---------- Hero ---------- */
  function Hero(p) {
    var links = p.links || [{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/matheus-freitas-martins' }, { label: 'GitHub', href: 'https://github.com/MatheusMartins08' }];
    return h('section', { className: cx('mf-hero', p.fullHeight === false && 'mf-hero--auto', p.className), id: p.id },
      h('div', { className: 'mf-hero__meta', 'aria-hidden': true },
        h('span', null, p.metaLeft || 'Matheus Freitas — 2026'),
        h('span', { className: 'mf-hero__metamid' }, p.metaMid || 'Software · Produto · IA'),
        h('span', null, p.metaRight || 'Belo Horizonte')),
      h('div', { className: 'mf-hero__grid' },
        h(Portrait, { src: p.photo, alt: p.photoAlt || ('Foto de ' + (p.name || 'Matheus Freitas')), caption: p.photoCaption, meta: p.photoMeta, className: 'mf-hero__portrait' }),
        h('div', { className: 'mf-hero__text' },
          h('div', { className: 'mf-hero__top' },
            h('p', { className: 'mf-hero__greet' }, p.greeting || 'Olá, eu sou'),
            h('div', { className: 'mf-hero__links' }, links.map(function (l) { return h(ArrowLink, { key: l.label, href: l.href, size: 'sm' }, l.label); }))),
          h('h1', { className: 'mf-hero__name' }, p.name || 'Matheus Freitas'),
          h('span', { className: 'mf-hero__rule', 'aria-hidden': true }),
          h(MorphText, { phrases: p.phrases, className: 'mf-hero__morph', interval: p.interval }))),
      p.scrollTarget === null ? null : h('div', { className: 'mf-hero__cue' }, h(ScrollCue, { target: p.scrollTarget || '#sobre' })));
  }

  /* ---------- Statement ---------- */
  function Statement(p) {
    var ref = useRef(null);
    var inView = useInView(ref, { threshold: 0.3 });
    var text = typeof p.children === 'string' ? p.children : '';
    var hl = [].concat(p.highlight || []).map(function (w) { return String(w).toLowerCase(); });
    var words = text.split(/\s+/).filter(Boolean);
    var Tag = p.as || 'h2';
    return h('div', { ref: ref, className: cx('mf-stmt', inView && 'is-in', p.placeholder && 'is-placeholder', p.className) },
      p.label ? h(SectionLabel, { index: p.index }, p.label) : null,
      h(Tag, { className: 'mf-stmt__text' }, text ? words.map(function (w, i) {
        var clean = w.toLowerCase().replace(/[.,;:!?]+$/, '');
        return h(Fragment, { key: i }, h('span', { className: cx('mf-stmt__w', hl.indexOf(clean) >= 0 && 'mf-stmt__hl'), style: { '--i': i } }, w), i < words.length - 1 ? ' ' : null);
      }) : p.children),
      p.note ? h('p', { className: 'mf-stmt__note' }, p.note) : null);
  }

  /* ---------- Reveal ---------- */
  function Reveal(p) {
    var ref = useRef(null);
    var inView = useInView(ref, { threshold: p.threshold || 0.15 });
    var Tag = p.as || 'div';
    return h(Tag, { ref: ref, className: cx('mf-reveal', 'mf-reveal--' + (p.variant || 'up'), inView && 'is-in', p.className), style: Object.assign({ '--d': (p.delay || 0) + 'ms' }, p.style) }, p.children);
  }

  /* ---------- ProfileTerminal ---------- */
  var PROFILE = [
    { key: 'name', value: 'Matheus Freitas Martins' },
    { key: 'role', value: 'Fullstack Developer' },
    { key: 'since', value: '2024' },
    { key: 'study', value: 'Desenvolvimento Web & Mobile — COTEMIG' }
  ];
  var ABOUT = [
    'Meu nome é Matheus Freitas Martins, sou desenvolvedor Full Stack e atuo na criação de produtos digitais completos, unindo desenvolvimento, arquitetura, experiência do usuário e entrega em produção.',
    'Minha trajetória na tecnologia começou em 2024 e, desde então, venho transformando estudo em prática constantemente. Atualmente curso Desenvolvimento Web e Mobile no COTEMIG, formação que complementa uma rotina já bastante voltada à construção de soluções reais.',
    'Gosto de participar de todo o ciclo de desenvolvimento de um produto. Isso significa entender o problema, estruturar a solução, definir tecnologias, desenvolver frontend e backend, trabalhar com bancos de dados, integrações e APIs, preparar a infraestrutura e acompanhar o sistema até o deploy e sua utilização em ambiente real.',
    'Antes mesmo de entrar profissionalmente na área, sempre tive curiosidade por tecnologia e pelo funcionamento das coisas por trás de uma interface. Nunca me interessou apenas saber usar um software; sempre quis entender o que acontecia por trás da tela, como cada parte se conectava e como uma ideia poderia se transformar em algo funcional.',
    'Essa curiosidade continua sendo uma das principais forças do meu trabalho. Procuro entender o problema antes de escolher a tecnologia e acredito que uma boa solução não precisa ser desnecessariamente complexa. Ela precisa ser clara, bem construída, escalável quando necessário e confiável quando colocada nas mãos de usuários reais.',
    'Por isso, meu foco não está em acumular linguagens, frameworks ou ferramentas. Tecnologia, para mim, é meio. O objetivo é construir produtos que façam sentido, resolvam problemas concretos e estejam preparados para funcionar além do ambiente de desenvolvimento.',
    'No final, é isso que busco em cada projeto: transformar uma necessidade em um produto sólido, simples de manter, pronto para evoluir e, principalmente, útil no mundo real.'
  ];
  var ABOUT_HL = ['2024', 'COTEMIG', 'todo o ciclo de desenvolvimento','Tecnologia, para mim, é meio.', 'útil no mundo real'];
  function markText(text, hl) {
    if (!hl || !hl.length) return text;
    var out = [], rest = text, k = 0;
    while (rest) {
      var at = -1, word = null;
      hl.forEach(function (w) { var i = rest.indexOf(w); if (w && i >= 0 && (at < 0 || i < at)) { at = i; word = w; } });
      if (at < 0) { out.push(rest); break; }
      if (at > 0) out.push(rest.slice(0, at));
      out.push(h('mark', { key: k++, className: 'mf-term__hl' }, word));
      rest = rest.slice(at + word.length);
    }
    return h.apply(null, [Fragment, null].concat(out));
  }
  function Flow(p) {
    var ref = useRef(null);
    var s = useState(0), at = s[0], set = s[1];
    var inView = useInView(ref, { threshold: 0.4 });
    useEffect(function () {
      if (!inView || reduced()) return;
      var t = setInterval(function () { set(function (v) { return (v + 1) % p.steps.length; }); }, p.speed || 1100);
      return function () { clearInterval(t); };
    }, [inView, p.steps.length]);
    return h('ol', { ref: ref, className: 'mf-flow' }, p.steps.map(function (st, i) {
      return h('li', { key: i, className: cx('mf-flow__step', i === at && 'is-on', i < at && 'is-done') }, h('span', null, st), i < p.steps.length - 1 ? h('span', { className: 'mf-flow__arrow', 'aria-hidden': true }, '→') : null);
    }));
  }
  function ProfileTerminal(p) {
    var stage = useRef(null), card = useRef(null);
    var entries = p.entries || PROFILE;
    var text = p.text === undefined ? ABOUT : p.text;
    var paras = typeof text === 'string' ? text.split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean) : (text || []);
    var hl = p.highlight === undefined ? ABOUT_HL : p.highlight;
    var inView = useInView(stage, { threshold: 0.1 });
    useEffect(function () {
      var st = stage.current, c = card.current; if (!st || !c) return;
      if (reduced() || p.tilt === false) return;
      var max = p.maxTilt || 6, tx = 0, ty = 0, rx = 0, ry = 0, tpx = 0.5, tpy = 0.5, px = 0.5, py = 0.5, raf = 0;
      function frame() {
        ry += (tx - ry) * 0.085; rx += (ty - rx) * 0.085; px += (tpx - px) * 0.085; py += (tpy - py) * 0.085;
        c.style.setProperty('--rx', rx.toFixed(3) + 'deg');
        c.style.setProperty('--ry', ry.toFixed(3) + 'deg');
        c.style.setProperty('--px', (px * 100).toFixed(1) + '%');
        c.style.setProperty('--py', (py * 100).toFixed(1) + '%');
        c.style.setProperty('--sx', (-ry * 2).toFixed(2) + 'px');
        c.style.setProperty('--sy', (28 + rx * 2).toFixed(2) + 'px');
        if (Math.abs(tx - ry) > 0.005 || Math.abs(ty - rx) > 0.005 || Math.abs(tpx - px) > 0.001 || Math.abs(tpy - py) > 0.001) raf = requestAnimationFrame(frame); else raf = 0;
      }
      function kick() { if (!raf) raf = requestAnimationFrame(frame); }
      function move(e) {
        if (e.pointerType === 'touch') return;
        var r = st.getBoundingClientRect();
        tpx = clamp((e.clientX - r.left) / r.width, 0, 1); tpy = clamp((e.clientY - r.top) / r.height, 0, 1);
        tx = (tpx - 0.5) * 2 * max; ty = -(tpy - 0.5) * 2 * max;
        c.classList.add('is-tilting'); kick();
      }
      function leave() { tx = 0; ty = 0; tpx = 0.5; tpy = 0.5; c.classList.remove('is-tilting'); kick(); }
      st.addEventListener('pointermove', move); st.addEventListener('pointerleave', leave);
      return function () { st.removeEventListener('pointermove', move); st.removeEventListener('pointerleave', leave); if (raf) cancelAnimationFrame(raf); };
    }, [p.tilt, p.maxTilt]);
    function val(e) {
      if (e.flow) return h(Flow, { steps: e.value });
      if (Array.isArray(e.value)) return h('span', { className: 'mf-term__list' }, e.value.map(function (v, i) { return h('span', { key: i }, v); }));
      return e.value;
    }
    var doc = paras.length > 0;
    var body = doc
      ? h('div', { className: 'mf-term__body' },
          h('p', { className: 'mf-term__cmd' }, h('span', { className: 'mf-term__gt', 'aria-hidden': true }, '>'), p.command || 'cat sobre.md'),
          entries.length ? h('dl', { className: 'mf-term__front' },
            h('span', { className: 'mf-term__fence', 'aria-hidden': true }, '---'),
            entries.map(function (e) {
              var v = Array.isArray(e.value) ? e.value.join(e.flow ? ' → ' : ' · ') : e.value;
              return h('div', { key: e.key, className: 'mf-term__fm' }, h('dt', null, e.key + ':'), h('dd', null, v));
            }),
            h('span', { className: 'mf-term__fence', 'aria-hidden': true }, '---')) : null,
          h('div', { className: 'mf-term__doc' }, paras.map(function (t, i) {
            return h('div', { key: i, className: cx('mf-term__para', i === paras.length - 1 && 'is-last'), style: { '--i': i } },
              h('span', { className: 'mf-term__ln', 'aria-hidden': true }, pad2(i + 1)),
              h('p', null, markText(t, hl)));
          })))
      : h('div', { className: 'mf-term__body' },
          h('dl', { className: 'mf-term__rows' }, entries.map(function (e, i) {
            return h('div', { className: cx('mf-term__row', e.accent && 'is-accent'), key: e.key, style: { '--i': i } },
              h('span', { className: 'mf-term__ln', 'aria-hidden': true }, pad2(i + 1)),
              h('dt', { className: 'mf-term__key' }, h('span', { className: 'mf-term__gt', 'aria-hidden': true }, '>'), e.key),
              h('dd', { className: 'mf-term__val' }, val(e)));
          })));
    return h('div', { className: cx('mf-term-stage', inView && 'is-in', p.className), ref: stage },
      h('div', { className: cx('mf-term', doc && 'mf-term--doc'), ref: card },
        h('div', { className: 'mf-term__bar' },
          h('span', { className: 'mf-term__tab' }, h(Icon, { name: 'file', size: 13 }), p.title || 'matheus.profile', h('span', { className: 'mf-term__saved', title: 'salvo' })),
          h('span', { className: 'mf-term__path' }, p.path || '~/portfolio/about')),
        body,
        h('div', { className: 'mf-term__foot', 'aria-hidden': true },
          h('span', { className: 'mf-term__prompt' }, h('span', null, p.prompt || '~/matheus'), h('b', null, '$'), h('span', { className: 'mf-term__caret' })),
          h('span', null, (p.status || (doc ? paras.length + ' parágrafos · UTF-8 · pt-BR' : 'ln ' + entries.length + ' · UTF-8 · pt-BR')))),
        h('span', { className: 'mf-term__sheen', 'aria-hidden': true })));
  }

  /* ---------- InfoCard + Coordinates ---------- */
  function InfoCard(p) {
    return h(p.as || 'div', { className: cx('mf-info', 'mf-info--' + (p.tone || 'paper'), p.className), style: p.style },
      h('div', { className: 'mf-info__head' }, h('span', { className: 'mf-info__label' }, p.label), p.aside ? h('span', { className: 'mf-info__aside' }, p.aside) : null),
      h('div', { className: 'mf-info__body' }, p.children),
      p.footer ? h('div', { className: 'mf-info__foot' }, p.footer) : null);
  }
  function fmtCoord(v, pos, neg) { return Math.abs(v).toFixed(2) + '° ' + (v >= 0 ? pos : neg); }
  function Coordinates(p) {
    var lat = p.lat == null ? -19.9167 : p.lat, lon = p.lon == null ? -43.9345 : p.lon;
    var fx = Math.abs(lon) % 1, fy = Math.abs(lat) % 1;
    var W = 132, H = 72, pitch = 12;
    var mx = Math.round((12 + fx * (W - 24)) / pitch) * pitch, my = Math.round((12 + fy * (H - 24)) / pitch) * pitch;
    var dots = [];
    for (var x = pitch; x < W; x += pitch) for (var y = pitch; y < H; y += pitch) dots.push(h('circle', { key: x + '-' + y, cx: x, cy: y, r: 0.9, className: 'mf-coord__dot' }));
    return h('div', { className: cx('mf-coord', p.className) },
      h('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, 'aria-hidden': true, className: 'mf-coord__map' },
        dots,
        h('line', { x1: 0, y1: my, x2: W, y2: my, className: 'mf-coord__axis' }),
        h('line', { x1: mx, y1: 0, x2: mx, y2: H, className: 'mf-coord__axis' }),
        h('circle', { cx: mx, cy: my, r: 9, className: 'mf-coord__halo' }),
        h('circle', { cx: mx, cy: my, r: 3, className: 'mf-coord__pin' })),
      h('span', { className: 'mf-coord__text' }, fmtCoord(lat, 'N', 'S') + ' · ' + fmtCoord(lon, 'E', 'W')));
  }

  /* ---------- ServiceCard ---------- */
  function MotifWeb() {
    return h('svg', { viewBox: '0 0 168 108', className: 'mf-motif mf-motif--web', 'aria-hidden': true },
      h('rect', { x: 0.75, y: 0.75, width: 166.5, height: 106.5, rx: 6, className: 'mf-m-frame' }),
      h('line', { x1: 0.75, y1: 16, x2: 167.25, y2: 16, className: 'mf-m-line' }),
      h('circle', { cx: 10, cy: 8.5, r: 2, className: 'mf-m-dot' }), h('circle', { cx: 18, cy: 8.5, r: 2, className: 'mf-m-dot' }),
      h('rect', { x: 120, y: 5.5, width: 38, height: 6, rx: 3, className: 'mf-m-pill' }),
      h('rect', { x: 12, y: 28, width: 72, height: 7, rx: 1.5, className: 'mf-m-text mf-m-g1' }),
      h('rect', { x: 12, y: 40, width: 56, height: 7, rx: 1.5, className: 'mf-m-text mf-m-g2' }),
      h('rect', { x: 12, y: 55, width: 40, height: 3, rx: 1.5, className: 'mf-m-sub mf-m-g3' }),
      h('rect', { x: 12, y: 62, width: 48, height: 3, rx: 1.5, className: 'mf-m-sub mf-m-g4' }),
      h('rect', { x: 12, y: 76, width: 32, height: 11, rx: 2, className: 'mf-m-cta' }),
      h('rect', { x: 98, y: 28, width: 58, height: 60, rx: 3, className: 'mf-m-block' }),
      h('path', { d: 'M98 74l16-14 12 10 10-8 20 16', className: 'mf-m-line mf-m-img' }),
      h('path', { d: 'M136 46l6 14 3-5 5 0z', className: 'mf-m-cursor' }));
  }
  function MotifAI() {
    var nodes = [[18, 54], [62, 22], [62, 86], [108, 54], [150, 26], [150, 82]];
    var edges = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5]];
    return h('svg', { viewBox: '0 0 168 108', className: 'mf-motif mf-motif--ai', 'aria-hidden': true },
      edges.map(function (e, i) { var a = nodes[e[0]], b = nodes[e[1]]; return h('line', { key: 'b' + i, x1: a[0], y1: a[1], x2: b[0], y2: b[1], className: 'mf-m-edge' }); }),
      edges.map(function (e, i) { var a = nodes[e[0]], b = nodes[e[1]]; return h('line', { key: 'f' + i, x1: a[0], y1: a[1], x2: b[0], y2: b[1], className: 'mf-m-flow', style: { '--i': i } }); }),
      nodes.map(function (n, i) { return h('g', { key: 'n' + i, className: 'mf-m-node', style: { '--i': i } }, h('rect', { x: n[0] - 7, y: n[1] - 7, width: 14, height: 14, rx: i === 3 ? 7 : 2 }), h('circle', { cx: n[0], cy: n[1], r: 1.8 })); }));
  }
  function ServiceCard(p) {
    var ref = useRef(null);
    function mv(e) { var el = ref.current; if (!el) return; var r = el.getBoundingClientRect(); el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px'); }
    var motif = p.motif === 'ai' ? h(MotifAI) : p.motif === 'web' ? h(MotifWeb) : p.motif || null;
    return h('article', { ref: ref, onPointerMove: mv, className: cx('mf-svc', 'mf-svc--' + (p.size || 'lg'), p.className) },
      h('span', { className: 'mf-svc__edge', 'aria-hidden': true }),
      h('div', { className: 'mf-svc__top' },
        h('div', { className: 'mf-svc__ids' }, h('span', { className: 'mf-svc__num' }, p.index || '01'), h(Tag, { tone: 'quiet' }, p.label || 'WEB')),
        motif ? h('div', { className: 'mf-svc__motif' }, motif) : null),
      h('h3', { className: 'mf-svc__title' }, p.title),
      p.description ? h('p', { className: 'mf-svc__desc' }, p.description) : null,
      p.highlights && p.highlights.length ? h('ul', { className: 'mf-svc__list' }, p.highlights.map(function (x, i) {
        return h('li', { key: i, style: { '--i': i } }, h('span', { className: 'mf-svc__tick', 'aria-hidden': true }), x);
      })) : null);
  }

  /* ---------- FilterTabs ---------- */
  function FilterTabs(p) {
    var options = p.options || [];
    var s = useState(p.defaultValue || (options[0] && options[0].id)), inner = s[0], setInner = s[1];
    var value = p.value !== undefined ? p.value : inner;
    var root = useRef(null), ind = useRef(null), refs = useRef({});
    function place() {
      var el = refs.current[value], i = ind.current; if (!el || !i) return;
      i.style.width = el.offsetWidth + 'px'; i.style.transform = 'translateX(' + el.offsetLeft + 'px)';
    }
    useLayoutEffect(place, [value, options.length]);
    useEffect(function () {
      if (typeof ResizeObserver === 'undefined' || !root.current) return;
      var ro = new ResizeObserver(function () { place(); }); ro.observe(root.current);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
      return function () { ro.disconnect(); };
    });
    function select(id) { if (p.value === undefined) setInner(id); if (p.onChange) p.onChange(id); }
    function onKey(e) {
      var ids = options.map(function (o) { return o.id; }), k = ids.indexOf(value), n = ids.length, next = null;
      if (e.key === 'ArrowRight') next = ids[(k + 1) % n];
      else if (e.key === 'ArrowLeft') next = ids[(k - 1 + n) % n];
      else if (e.key === 'Home') next = ids[0];
      else if (e.key === 'End') next = ids[n - 1];
      if (next != null) { e.preventDefault(); select(next); var b = refs.current[next]; if (b) b.focus(); }
    }
    return h('div', { className: cx('mf-tabs', p.className), role: 'tablist', 'aria-label': p.label || 'Filtrar', ref: root, onKeyDown: onKey },
      options.map(function (o) {
        var on = o.id === value;
        return h('button', {
          key: o.id, ref: function (el) { refs.current[o.id] = el; }, type: 'button', role: 'tab', id: (p.idPrefix || 'tab-') + o.id,
          'aria-selected': on, 'aria-controls': p.panelId, tabIndex: on ? 0 : -1,
          className: cx('mf-tabs__tab', on && 'is-on'), onClick: function () { select(o.id); }
        }, h('span', null, o.label), o.count != null ? h('sup', { className: 'mf-tabs__count' }, pad2(o.count)) : null);
      }),
      h('span', { className: 'mf-tabs__ind', ref: ind, 'aria-hidden': true }));
  }

  /* ---------- Timeline ---------- */
  function TimelineItem(p) {
    var it = p.item;
    var s = useState(false), open = s[0], set = s[1];
    var id = useId();
    return h('li', { className: cx('mf-tl__item', p.side === 'left' ? 'is-left' : 'is-right', it.future && 'is-future'), style: { '--i': p.index } },
      h('span', { className: 'mf-tl__node', 'aria-hidden': true }),
      h('span', { className: 'mf-tl__arm', 'aria-hidden': true }),
      h('article', { className: 'mf-tl__card' },
        it.future ? h('p', { className: 'mf-tl__period mf-tl__s1' }, it.kicker || 'Next chapter') :
          h('p', { className: 'mf-tl__period mf-tl__s1' }, h('span', null, it.period), it.current ? h(StatusDot, { tone: 'open' }, it.currentLabel || 'Atual') : null),
        h('h3', { className: 'mf-tl__title mf-tl__s2' }, it.title),
        it.org ? h('p', { className: 'mf-tl__org mf-tl__s2' }, h('strong', null, it.org), it.kind ? h('span', null, ' · ' + it.kind) : null) : null,
        it.place ? h('p', { className: 'mf-tl__place mf-tl__s3' }, h(Icon, { name: 'pin', size: 12 }), it.place) : null,
        it.summary ? h('p', { className: 'mf-tl__sum mf-tl__s3' }, it.summary) : null,
        it.tags && it.tags.length ? h('div', { className: 'mf-tags mf-tl__s4' }, it.tags.map(function (t) { return h(Tag, { key: t }, t); })) : null,
        it.details && it.details.length ? h(Fragment, null,
          h('button', { type: 'button', className: 'mf-tl__more mf-tl__s4', 'aria-expanded': open, 'aria-controls': id + 'd', onClick: function () { set(!open); } },
            h('span', null, open ? (p.lessLabel || 'Menos detalhes') : (p.moreLabel || 'Ver atividades')), h(Icon, { name: 'plus', size: 14 })),
          h('div', { className: cx('mf-tl__details', open && 'is-open'), id: id + 'd' },
            h('div', null, h('ul', null, it.details.map(function (d, i) { return h('li', { key: i }, d); }))))) : null));
  }
  function Timeline(p) {
    var items = p.items || [];
    var root = useRef(null), fill = useRef(null);
    useEffect(function () {
      var el = root.current; if (!el) return;
      var sp = scrollParent(el), raf = 0;
      function measure() {
        raf = 0;
        var r = el.getBoundingClientRect();
        var vt = sp ? sp.getBoundingClientRect().top : 0;
        var vh = sp ? sp.clientHeight : window.innerHeight;
        var trig = vt + vh * (p.trigger || 0.62);
        var prog = r.height ? clamp((trig - r.top) / r.height, 0, 1) : 0;
        if (fill.current) fill.current.style.transform = 'scaleY(' + prog.toFixed(4) + ')';
        el.querySelectorAll('.mf-tl__item').forEach(function (n) {
          var node = n.querySelector('.mf-tl__node'); if (!node) return;
          var nr = node.getBoundingClientRect();
          n.classList.toggle('is-active', nr.top + nr.height / 2 <= trig);
          if (nr.top < vt + vh * 0.9) n.classList.add('is-in');
        });
      }
      function on() { if (!raf) raf = requestAnimationFrame(measure); }
      measure();
      var t = sp || window;
      t.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on);
      return function () { t.removeEventListener('scroll', on); window.removeEventListener('resize', on); if (raf) cancelAnimationFrame(raf); };
    }, [items.length, p.trigger]);
    return h('div', { className: cx('mf-tl-wrap', p.className) },
      h('ol', { className: 'mf-tl', ref: root },
        h('span', { className: 'mf-tl__rail', 'aria-hidden': true }, h('span', { className: 'mf-tl__fill', ref: fill })),
        items.map(function (it, i) {
          return h(TimelineItem, { key: it.id || i, item: it, index: i, side: (p.startSide === 'right' ? i + 1 : i) % 2 === 0 ? 'left' : 'right', moreLabel: p.moreLabel, lessLabel: p.lessLabel });
        })));
  }

  /* ---------- SkillFolder ---------- */
  function SkillFolder(p) {
    var items = p.items || [];
    var s1 = useState(!!p.defaultOpen), open = s1[0], setOpen = s1[1];
    var s2 = useState(p.cols || 3), cols = s2[0], setCols = s2[1];
    var wrap = useRef(null);
    var id = useId();
    useEffect(function () {
      if (p.cols || typeof ResizeObserver === 'undefined' || !wrap.current) return;
      var ro = new ResizeObserver(function (es) { var w = es[0].contentRect.width; setCols(w < 250 ? 1 : w < 520 ? 2 : 3); });
      ro.observe(wrap.current);
      return function () { ro.disconnect(); };
    }, [p.cols]);
    var c = Math.max(1, Math.min(p.cols || cols, items.length || 1));
    var CH = 64, GAP = 10, rows = Math.ceil(items.length / c), tray = rows * CH + (rows - 1) * GAP + 22;
    return h('div', { ref: wrap, className: cx('mf-folder', open && 'is-open', p.className), style: { '--tray': (open ? tray : 0) + 'px', '--cols': c, '--mid': (c - 1) / 2 } },
      h('div', { className: 'mf-folder__body' },
        h('div', { className: 'mf-folder__back', 'aria-hidden': true },
          h('span', { className: 'mf-folder__tab' }, h('span', { className: 'mf-folder__tabdot' }), p.index || '01')),
        h('ul', { className: 'mf-folder__cards', id: id + 'c', 'aria-label': p.title, 'aria-hidden': !open },
          items.map(function (it, i) {
            var col = i % c, row = Math.floor(i / c);
            var oy = -tray + row * (CH + GAP);
            var cy = i < 3 ? 6 + i * 5 : 34;
            var rot = (((i * 37) % 7) - 3) * 0.9;
            return h('li', {
              key: it.name + i, className: 'mf-chip',
              style: { '--col': col, '--oy': oy + 'px', '--cy': cy + 'px', '--rot': rot + 'deg', '--jx': ((i % 3) - 1) * 8 + 'px', '--d': i, '--rd': items.length - 1 - i }
            },
              h('span', { className: 'mf-chip__glyph' }, it.glyph || it.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 2)),
              h('span', { className: 'mf-chip__main' },
                h('span', { className: 'mf-chip__name' }, it.name),
                h('span', { className: 'mf-chip__meta' }, it.ext ? h('b', null, it.ext) : null, it.ext && it.category ? ' · ' : null, it.category || null)));
          })),
        h('button', { type: 'button', className: 'mf-folder__front', 'aria-expanded': open, 'aria-controls': id + 'c', onClick: function () { setOpen(!open); } },
          h('span', { className: 'mf-folder__title' }, p.title),
          h('span', { className: 'mf-folder__count' }, pad2(items.length) + ' ' + (p.unit || (items.length === 1 ? 'item' : 'itens'))),
          h('span', { className: 'mf-folder__toggle', 'aria-hidden': true }, h(Icon, { name: 'plus', size: 16 })),
          h('span', { className: 'mf-sr' }, open ? ' — fechar pasta' : ' — abrir pasta'))));
  }

  /* ---------- ProjectCard ---------- */
  function ProjectCard(p) {
    var media = useRef(null), bubble = useRef(null);
    function mv(e) {
      if (e.pointerType === 'touch' || !media.current || !bubble.current) return;
      var r = media.current.getBoundingClientRect();
      bubble.current.style.setProperty('--bx', (e.clientX - r.left) + 'px');
      bubble.current.style.setProperty('--by', (e.clientY - r.top) + 'px');
    }
    var imgs = (p.images && p.images.length ? p.images : (p.image ? [p.image] : [])).slice(0, 2);
    var href = p.href || p.live || p.github || '#';
    var ext = !p.href && /^https?:/.test(href);
    var links = [];
    if (p.href) links.push(h(ArrowLink, { key: 'c', href: p.href, icon: 'arrow-right', size: 'sm', external: false }, p.caseLabel || 'Case study'));
    if (p.github) links.push(h(ArrowLink, { key: 'g', href: p.github, size: 'sm' }, 'GitHub'));
    if (p.live) links.push(h(ArrowLink, { key: 'l', href: p.live, size: 'sm' }, p.liveLabel || 'Ver site'));
    return h('article', { className: cx('mf-proj', 'mf-proj--' + (p.size || 'half'), p.className) },
      h('a', { className: 'mf-proj__media', href: href, target: ext ? '_blank' : undefined, rel: ext ? 'noopener noreferrer' : undefined, ref: media, onPointerMove: mv, tabIndex: -1, 'aria-hidden': true },
        imgs.length ? h(Fragment, null,
          h('img', { src: imgs[0], alt: '', loading: 'lazy', className: 'mf-proj__img' }),
          imgs[1] ? h('img', { src: imgs[1], alt: '', loading: 'lazy', className: 'mf-proj__img mf-proj__img--alt' }) : null,
          imgs[1] ? h('span', { className: 'mf-proj__count' }, h('b', null, '01'), h('i', null, '02'), ' / 02') : null)
          : h(MediaPlaceholder, { variant: 'ui', label: p.placeholder || 'Screenshot · 16:10' }),
        h('span', { className: 'mf-proj__bubble', ref: bubble }, h('span', null, p.cursorLabel || 'View'), h(Icon, { name: 'arrow-up-right', size: 12 }))),
      h('div', { className: 'mf-proj__meta' },
        h('span', { className: 'mf-proj__idx' }, p.index || '01'),
        p.category ? h('span', null, p.category) : null,
        p.year ? h('span', null, p.year) : null),
      h('h3', { className: 'mf-proj__title' }, h('a', { href: href, target: ext ? '_blank' : undefined, rel: ext ? 'noopener noreferrer' : undefined }, h('span', null, p.title), h(Icon, { name: 'arrow-up-right', size: 20, className: 'mf-proj__arrow' }))),
      p.description ? h('p', { className: 'mf-proj__desc' }, p.description) : null,
      p.tech && p.tech.length ? h('div', { className: 'mf-tags' }, p.tech.map(function (t) { return h(Tag, { key: t }, t); })) : null,
      h('div', { className: 'mf-proj__links' }, links),
      h('span', { className: 'mf-proj__rule', 'aria-hidden': true }));
  }

  /* ---------- Case study ---------- */
  function CaseHero(p) {
    var meta = p.meta || [];
    return h('header', { className: cx('mf-case-hero', p.className) },
      h(ArrowLink, { href: (p.back && p.back.href) || '#projetos', icon: 'arrow-left', size: 'sm', external: false, className: 'mf-case-hero__back' }, (p.back && p.back.label) || 'Projetos'),
      h('div', { className: 'mf-case-hero__head' },
        h(SectionLabel, { index: p.index || '01' }, p.category || 'Projeto'),
        h('h1', { className: 'mf-case-hero__title' }, p.title),
        p.summary ? h('p', { className: 'mf-case-hero__sum' }, p.summary) : null),
      meta.length ? h('dl', { className: 'mf-case-hero__meta' }, meta.map(function (m) {
        return h('div', { key: m.label }, h('dt', null, m.label), h('dd', null, m.value));
      })) : null,
      p.links && p.links.length ? h('div', { className: 'mf-case-hero__links' }, p.links.map(function (l) { return h(Button, { key: l.label, href: l.href, variant: l.primary ? 'primary' : 'ghost', size: 'sm', icon: 'arrow-up-right', target: '_blank', rel: 'noopener noreferrer' }, l.label); })) : null,
      h('div', { className: 'mf-case-hero__media' }, p.image ? h('img', { src: p.image, alt: p.imageAlt || '' }) : h(MediaPlaceholder, { variant: 'ui', label: 'Imagem principal · 16:9' })));
  }
  function CaseSection(p) {
    return h('section', { className: cx('mf-case-sec', p.className), id: p.id },
      h('div', { className: 'mf-case-sec__side' },
        h('span', { className: 'mf-case-sec__idx' }, p.index || '01'),
        h('span', { className: 'mf-case-sec__label' }, p.label)),
      h('div', { className: 'mf-case-sec__main' },
        p.title ? h('h2', { className: 'mf-case-sec__title' }, p.title) : null,
        h('div', { className: 'mf-case-sec__body' }, p.children)));
  }

  /* ---------- Field ---------- */
  function Field(p) {
    var auto = useId(); var id = p.id || auto;
    var tag = p.multiline ? 'textarea' : 'input';
    var errId = id + '-err', hintId = id + '-hint';
    var rest = omit(p, ['label', 'multiline', 'error', 'hint', 'className', 'optional', 'id']);
    if (p.multiline && !rest.rows) rest.rows = 4;
    return h('div', { className: cx('mf-field', p.error && 'is-error', p.disabled && 'is-disabled', p.className) },
      h('label', { className: 'mf-field__label', htmlFor: id }, p.label, p.optional ? h('span', { className: 'mf-field__opt' }, ' — opcional') : null),
      h(tag, Object.assign({ id: id, className: 'mf-field__input', 'aria-invalid': p.error ? true : undefined, 'aria-describedby': p.error ? errId : p.hint ? hintId : undefined }, rest)),
      h('span', { className: 'mf-field__bar', 'aria-hidden': true }),
      p.error ? h('p', { className: 'mf-field__msg', id: errId }, h(Icon, { name: 'alert', size: 14 }), p.error)
        : p.hint ? h('p', { className: 'mf-field__hint', id: hintId }, p.hint) : null);
  }

  /* ---------- ContactModal ---------- */
  var CONTACTS = [
    { label: 'Email', value: 'matheus08.dev@gmail.com', href: 'mailto:matheus08.dev@gmail.com', icon: 'mail' },
    { label: 'WhatsApp', value: '+55 (31) 99119-2484', href: 'https://wa.me/5531991192484', icon: 'chat' },
    { label: 'LinkedIn', value: '/in/matheus-freitas-martins', href: 'https://www.linkedin.com/in/matheus-freitas-martins', icon: 'user' },
    { label: 'GitHub', value: '@MatheusMartins08', href: 'https://github.com/MatheusMartins08', icon: 'code' }
  ];
  function ContactForm(p) {
    var s1 = useState('idle'), st = s1[0], setSt = s1[1];
    var s2 = useState({}), errs = s2[0], setErrs = s2[1];
    var status = p.status || st;
    var t = Object.assign({
      name: 'Nome', email: 'E-mail', message: 'Mensagem', send: 'Enviar', sending: 'Enviando…',
      okTitle: 'Mensagem enviada.', okBody: 'Obrigado pelo contato — retorno pelo e-mail informado.', again: 'Enviar outra',
      errBody: 'Não foi possível enviar agora. Tente de novo ou escreva direto para o e-mail ao lado.',
      reqName: 'Diga como posso te chamar.', reqEmail: 'Informe um e-mail válido.', reqMsg: 'Conte um pouco sobre o projeto.'
    }, p.labels || {});
    function submit(e) {
      e.preventDefault();
      if (status === 'loading') return;
      var f = e.currentTarget, d = { name: f.elements.name.value.trim(), email: f.elements.email.value.trim(), message: f.elements.message.value.trim() };
      var er = {};
      if (!d.name) er.name = t.reqName;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) er.email = t.reqEmail;
      if (d.message.length < 2) er.message = t.reqMsg;
      setErrs(er);
      if (Object.keys(er).length) { var first = f.querySelector('[aria-invalid="true"]') || f.elements[Object.keys(er)[0]]; if (first) first.focus(); return; }
      setSt('loading');
      var run = p.onSubmit ? p.onSubmit(d) : new Promise(function (res) { setTimeout(res, 1400); });
      Promise.resolve(run).then(function () { setSt('success'); }, function () { setSt('error'); });
    }
    if (status === 'success') {
      return h('div', { className: 'mf-form__done', role: 'status' },
        h('span', { className: 'mf-form__check', 'aria-hidden': true }, h(Icon, { name: 'check', size: 20 })),
        h('p', { className: 'mf-form__donet' }, t.okTitle),
        h('p', { className: 'mf-form__doneb' }, t.okBody),
        p.status ? null : h(Button, { variant: 'ghost', size: 'sm', onClick: function () { setSt('idle'); } }, t.again));
    }
    return h('form', { className: 'mf-form', noValidate: true, onSubmit: submit },
      h(Field, { label: t.name, name: 'name', autoComplete: 'name', error: errs.name, defaultValue: p.defaults && p.defaults.name }),
      h(Field, { label: t.email, name: 'email', type: 'email', autoComplete: 'email', error: errs.email, defaultValue: p.defaults && p.defaults.email }),
      h(Field, { label: t.message, name: 'message', multiline: true, rows: 4, error: errs.message, defaultValue: p.defaults && p.defaults.message }),
      status === 'error' ? h('p', { className: 'mf-form__err', role: 'alert' }, h(Icon, { name: 'alert', size: 16 }), t.errBody) : null,
      h('div', { className: 'mf-form__actions' },
        h(Button, { type: 'submit', variant: 'primary', icon: 'arrow-right', loading: status === 'loading' }, status === 'loading' ? t.sending : t.send)));
  }
  function ContactModal(p) {
    var inline = !!p.inline, open = inline || !!p.open;
    var s = useState(open), present = s[0], setPresent = s[1];
    var panel = useRef(null), last = useRef(null);
    var tid = useId();
    useEffect(function () {
      if (open) { setPresent(true); return; }
      var t = setTimeout(function () { setPresent(false); }, reduced() ? 0 : 220);
      return function () { clearTimeout(t); };
    }, [open]);
    useEffect(function () {
      if (inline || !open) return;
      last.current = document.activeElement;
      var prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
      var t = setTimeout(function () { var f = panel.current && panel.current.querySelector('input, textarea'); if (f) f.focus(); }, 60);
      function key(e) {
        if (e.key === 'Escape') { e.preventDefault(); if (p.onClose) p.onClose(); return; }
        if (e.key !== 'Tab' || !panel.current) return;
        var fs = panel.current.querySelectorAll('a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])');
        if (!fs.length) return;
        var a = fs[0], b = fs[fs.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
        else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
      }
      document.addEventListener('keydown', key);
      return function () { clearTimeout(t); document.removeEventListener('keydown', key); document.body.style.overflow = prev; if (last.current && last.current.focus) last.current.focus(); };
    }, [open, inline]);
    if (!present && !inline) return null;
    var contacts = p.contacts || CONTACTS;
    var box = h('div', { ref: panel, className: cx('mf-modal__panel', inline && 'is-inline'), role: inline ? 'region' : 'dialog', 'aria-modal': inline ? undefined : true, 'aria-labelledby': tid },
      inline ? null : h('button', { type: 'button', className: 'mf-modal__close', onClick: p.onClose, 'aria-label': p.closeLabel || 'Fechar' }, h(Icon, { name: 'close', size: 18 })),
      h('aside', { className: 'mf-modal__aside' },
        h(SectionLabel, { index: p.index || '06' }, p.kicker || 'Contato'),
        h('h2', { className: 'mf-modal__title', id: tid }, p.title || 'Qual é o próximo projeto?'),
        h('p', { className: 'mf-modal__intro' }, p.intro || 'Projeto, oportunidade ou uma boa ideia, escolha o canal que preferir.'),
        h('ul', { className: 'mf-modal__contacts' }, contacts.map(function (c) {
          var ext = /^https?:/.test(c.href || '');
          return h('li', { key: c.label }, h('a', { className: 'mf-contact mf-hover', href: c.href, target: ext ? '_blank' : undefined, rel: ext ? 'noopener noreferrer' : undefined },
            h('span', { className: 'mf-contact__icon', 'aria-hidden': true }, h(Icon, { name: c.icon || 'link', size: 16 })),
            h('span', { className: 'mf-contact__txt' }, h('span', { className: 'mf-contact__label' }, c.label), h('span', { className: 'mf-contact__value' }, c.value)),
            h(SlideIcon, { name: 'arrow-up-right', size: 14 })));
        }))),
      h('div', { className: 'mf-modal__main' }, h(ContactForm, { status: p.status, onSubmit: p.onSubmit, labels: p.labels, defaults: p.defaults })));
    if (inline) return h('div', { className: cx('mf-modal', 'mf-modal--inline', p.className) }, box);
    return h('div', { className: cx('mf-modal', open ? 'is-open' : 'is-closing', p.className) },
      h('div', { className: 'mf-modal__scrim', onClick: p.onClose, 'aria-hidden': true }), box);
  }

  /* ---------- Footer ---------- */
  function Footer(p) {
    var links = p.links || [{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/matheus-freitas-martins' }, { label: 'GitHub', href: 'https://github.com/MatheusMartins08' }, { label: 'Email', href: 'mailto:matheus08.dev@gmail.com' }];
    return h('footer', { className: cx('mf-footer', p.className) },
      h('div', { className: 'mf-footer__id' }, h('span', { className: 'mf-footer__name' }, p.name || 'Matheus Freitas'), h('span', { className: 'mf-footer__role' }, p.role || 'Fullstack Developer')),
      h('ul', { className: 'mf-footer__links' }, links.map(function (l) { return h('li', { key: l.label }, h(ArrowLink, { href: l.href, size: 'sm' }, l.label)); })),
      h('span', { className: 'mf-footer__copy' }, '© ' + (p.year || 2026)));
  }

  var MF = {
    Icon: Icon, Button: Button, ArrowLink: ArrowLink, SectionLabel: SectionLabel, StatusDot: StatusDot, Tag: Tag,
    LanguageSwitch: LanguageSwitch, Header: Header, Portrait: Portrait, MorphText: MorphText, ScrollCue: ScrollCue, Hero: Hero,
    Statement: Statement, Reveal: Reveal, ProfileTerminal: ProfileTerminal, InfoCard: InfoCard, Coordinates: Coordinates,
    ServiceCard: ServiceCard, FilterTabs: FilterTabs, Timeline: Timeline, SkillFolder: SkillFolder, ProjectCard: ProjectCard,
    CaseHero: CaseHero, CaseSection: CaseSection, Field: Field, ContactModal: ContactModal, Footer: Footer,
    useScrollSpy: useScrollSpy, defaults: { profile: PROFILE, about: ABOUT, aboutHighlight: ABOUT_HL, nav: NAV, languages: LANGS, contacts: CONTACTS }
  };
  window.MF = Object.assign(window.MF || {}, MF);
})();
