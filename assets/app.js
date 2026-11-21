/* Azure for AI systems — atlas app. Plain JS, no build step, hash-routed. */
(function () {
  'use strict';
  var A = window.ATLAS;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  var byId = {}, catById = {}, archById = {};
  A.services.forEach(function (s) { byId[s.id] = s; });
  A.categories.forEach(function (c) { catById[c.id] = c; c.items = A.services.filter(function (s) { return s.cat === c.id; }); });
  A.architectures.forEach(function (a) { archById[a.id] = a; });

  /* ---------- text helpers ---------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g, function (m, id, label) {
        var sv = byId[id];
        if (!sv) return label || id;
        return '<a href="#/s/' + id + '">' + (label || sv.name) + '</a>';
      });
  }
  function paras(s) { return String(s).split(/\n\n+/).map(function (p) { return '<p>' + fmt(p) + '</p>'; }).join(''); }
  function ul(items) { return '<ul>' + items.map(function (i) { return '<li>' + fmt(i) + '</li>'; }).join('') + '</ul>'; }
  function hueOf(catId) { return catById[catId] ? catById[catId].hue : 212; }

  /* ---------- stepper ---------- */
  function mountStepper(host, spec) {
    var flow = spec.flow.map(function (f) { return typeof f === 'string' ? { l: f } : f; });
    var steps = spec.steps.map(function (s) { return { n: s[0], t: s[1] }; });
    var cur = 0, timer = null, narrow = null, W = 0, pts = [];

    host.innerHTML =
      '<div class="stage"></div>' +
      '<div class="ctrl"><button data-a="prev">← Prev</button><button data-a="play">▶ Play</button><button data-a="next">Next →</button><span class="count" aria-live="polite"></span></div>' +
      '<ol class="steps">' + steps.map(function (s, i) { return '<li data-i="' + i + '" tabindex="0">' + '<span>' + fmt(s.t) + '</span></li>'; }).join('') + '</ol>';
    var stage = $('.stage', host);

    function wrap(label, max) {
      var words = label.split(' '), lines = [''], k = 0;
      words.forEach(function (w) {
        if ((lines[k] + ' ' + w).trim().length > max && lines[k]) { lines.push(w); k++; } else lines[k] = (lines[k] + ' ' + w).trim();
      });
      return lines;
    }
    function compute() {
      var n = flow.length; pts = [];
      if (!narrow) {
        W = 760; var pad = 84, dy = n > 1 ? Math.min(30, 150 / (n - 1)) : 0;
        for (var i = 0; i < n; i++) pts.push({ x: n === 1 ? W / 2 : pad + i * (W - 2 * pad) / (n - 1), y: 54 + i * dy });
        return W + ' ' + (pts[n - 1].y + 118);
      }
      W = 360;
      for (var j = 0; j < n; j++) pts.push({ x: j % 2 ? 250 : 110, y: 50 + j * 86 });
      return W + ' ' + (pts[n - 1].y + 68);
    }
    function draw() {
      var wh = compute().split(' ');
      var svg = '<svg viewBox="0 0 ' + wh[0] + ' ' + wh[1] + '" role="img" aria-label="Flow diagram">';
      for (var i = 0; i < pts.length - 1; i++) svg += '<path class="edge" d="M' + pts[i].x + ' ' + (pts[i].y + 12) + 'L' + pts[i + 1].x + ' ' + (pts[i + 1].y + 12) + '"/>';
      flow.forEach(function (f, i) {
        var p = pts[i], hue = f.s && byId[f.s] ? hueOf(byId[f.s].cat) : (spec.hue || 212);
        var lines = wrap(f.l, narrow ? 24 : 15), t = '';
        lines.forEach(function (ln, k) {
          if (!narrow) t += '<text x="0" y="' + (54 + k * 14) + '">' + esc(ln) + '</text>';
          else t += '<text x="' + (i % 2 ? -42 : 42) + '" y="' + (12 + k * 14 - (lines.length - 1) * 7) + '" style="text-anchor:' + (i % 2 ? 'end' : 'start') + '">' + esc(ln) + '</text>';
        });
        var body = '<g class="node" data-i="' + i + '" style="--h:' + hue + '"><path class="face f-left" d="M-26 0L0 13V35L-26 22Z"/><path class="face f-right" d="M0 13L26 0V22L0 35Z"/><path class="face f-top" d="M0-13L26 0L0 13L-26 0Z"/>' + t + '</g>';
        svg += '<g transform="translate(' + p.x + ' ' + p.y + ')">' + (f.s && byId[f.s] ? '<a href="#/s/' + f.s + '" aria-label="' + esc(byId[f.s].name) + '">' + body + '</a>' : body) + '</g>';
      });
      svg += '<g class="packet"><circle class="ring" r="7"/><circle r="7"/></g></svg>';
      stage.innerHTML = svg;
      place(false);
    }
    function place() {
      var s = steps[cur], p = pts[s.n] || pts[0], visited = {};
      for (var i = 0; i <= cur; i++) visited[steps[i].n] = 1;
      $$('.node[data-i]', stage).forEach(function (g) {
        var i = +g.getAttribute('data-i');
        g.classList.toggle('on', i === s.n);
        g.classList.toggle('dim', !visited[i]);
      });
      var pk = $('.packet', stage);
      pk.style.transform = 'translate(' + p.x + 'px,' + (p.y + 12) + 'px)';
      $$('ol.steps li', host).forEach(function (li, i) {
        li.classList.toggle('on', i === cur);
        li.classList.toggle('done', i < cur);
        if (i === cur) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      });
      $('.count', host).textContent = 'Step ' + (cur + 1) + ' / ' + steps.length;
      $('[data-a=prev]', host).disabled = cur === 0;
      $('[data-a=next]', host).disabled = cur === steps.length - 1;
    }
    function go(i) { cur = Math.max(0, Math.min(steps.length - 1, i)); place(); }
    function stop() { if (timer) { clearInterval(timer); timer = null; $('[data-a=play]', host).textContent = '▶ Play'; } }
    function play() {
      if (timer) return stop();
      if (cur === steps.length - 1) go(0);
      $('[data-a=play]', host).textContent = '❚❚ Pause';
      timer = setInterval(function () { if (cur >= steps.length - 1) stop(); else go(cur + 1); }, 2600);
    }
    host.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-a]'), li = e.target.closest('ol.steps li');
      if (b) { var a = b.getAttribute('data-a'); if (a === 'play') play(); else { stop(); go(cur + (a === 'next' ? 1 : -1)); } }
      else if (li && !e.target.closest('a')) { stop(); go(+li.getAttribute('data-i')); }
    });
    host.addEventListener('keydown', function (e) {
      if (e.target.closest('a')) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); stop(); go(cur + 1); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); stop(); go(cur - 1); }
      else if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('ol.steps li')) { e.preventDefault(); stop(); go(+e.target.getAttribute('data-i')); }
    });
    function measure() { var nw = stage.clientWidth < 560; if (nw !== narrow) { narrow = nw; draw(); } }
    measure();
    if (window.ResizeObserver) new ResizeObserver(measure).observe(stage); else window.addEventListener('resize', measure);
    host._stop = stop;
    go(0);
  }

  var pendingSteppers = [];
  function stepperHost(spec) { pendingSteppers.push(spec); return '<div class="stepper" data-sp="' + (pendingSteppers.length - 1) + '"></div>'; }

  /* ---------- site sections: one model drives the sidebar, the home page and the section pager ---------- */
  var SECTIONS = [
    { name: 'Start', blurb: 'Orientation, role paths and shared vocabulary.', items: [
      ['#/', 'Home'], ['#/start', 'Start here'], ['#/glossary', 'Glossary'], ['#/freshness', 'What is verified']] },
    { name: 'Design', blurb: 'Choose the services and shape the architecture.', items: [
      ['#/advisor', 'Architecture Advisor'], ['#/a', 'Reference architectures'], ['#/d', 'Decision guides'], ['#/d/shaper', 'Solution shaper'],
      ['#/services-matrix', 'Service comparison'], ['#/foundation', 'Cloud foundation'], ['#/gov', 'Landing zones & tenancy']] },
    { name: 'Build', blurb: 'Patterns, playbooks and labs for RAG, agents and ML.', items: [
      ['#/foundry', 'Microsoft Foundry'], ['#/rag-lab', 'RAG lab'], ['#/agents', 'Agent patterns'], ['#/traditional-ml', 'Traditional ML & MLOps'],
      ['#/advanced-ai', 'Advanced AI'], ['#/p', 'Playbooks'], ['#/labs', 'Labs & roadmaps']] },
    { name: 'Secure & operate', blurb: 'Threats, quality gates, monitoring and incident runbooks.', items: [
      ['#/security-center', 'Security & threats'], ['#/evaluation', 'Evaluation & quality'], ['#/ops', 'Operations'],
      ['#/troubleshooting', 'Troubleshooting'], ['#/d/checklists', 'Readiness checklists']] },
    { name: 'Lead & budget', blurb: 'Intake, staffing, governance, cost and return.', items: [
      ['#/em-workspace', 'Manager workspace'], ['#/toolkit', 'Manager toolkit'], ['#/finops', 'FinOps & ROI'], ['#/d/calculator', 'Cost per task']] }
  ];
  /* The nav entry a route belongs to: exact match first, then the index page of its kind (#/a/x -> #/a). */
  function navHref(kind, id) {
    var exact = '#/' + kind + (id ? '/' + id : ''), parent = '#/' + kind, hit = null;
    SECTIONS.forEach(function (s) { s.items.forEach(function (it) { if (it[0] === exact) hit = it[0]; }); });
    if (hit) return hit;
    if (kind === 'a' || kind === 'p' || kind === 'd') return parent;
    return kind ? null : '#/';
  }

  /* ---------- pages ---------- */
  function pageHome() {
    var G = A.guide;
    var h = '<div class="wide home"><section class="hero">' +
      '<h1>Design, build and run AI systems on Azure</h1>' +
      '<p class="lede">Decision guides, reference architectures, patterns and calculators for teams that ship RAG, agents and machine learning on Microsoft Azure.</p>' +
      '<button type="button" class="hero-search" data-open-search><svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M14 14l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><span>Search services, patterns, runbooks and terms</span><kbd>/</kbd></button>' +
      '<div class="btns"><a class="btn primary" href="#/start">Start here</a><a class="btn" href="#/advisor">Architecture Advisor</a></div>' +
      '<ul class="stats">' +
        '<li><b>' + A.services.length + '</b> services</li><li><b>' + A.architectures.length + '</b> architectures</li>' +
        '<li><b>' + A.decisions.length + '</b> decision guides</li><li><b>' + A.engineeringPlaybooks.length + '</b> playbooks</li><li><b>' + A.glossary.length + '</b> terms</li>' +
      '</ul></section>';

    h += '<h2>Find your way</h2><div class="sections">';
    SECTIONS.slice(1).forEach(function (s) {
      h += '<section class="sec"><h3>' + esc(s.name) + '</h3><p>' + esc(s.blurb) + '</p><ul>' +
        s.items.map(function (it) { return '<li><a href="' + it[0] + '">' + esc(it[1]) + '</a></li>'; }).join('') + '</ul></section>';
    });
    h += '</div>';

    h += '<h2>Common tasks</h2><ul class="tasks">' + G.tasks.map(function (t) {
      return '<li><a href="' + t[1] + '">' + esc(t[0]) + '<span aria-hidden="true">→</span></a></li>';
    }).join('') + '</ul>';

    h += '<h2>Services by category</h2><div class="catlist">' + A.categories.map(function (c) {
      return '<a href="#/c/' + c.id + '" style="--h:' + c.hue + '"><span class="dot"></span><b>' + esc(c.name) + '</b><small>' + c.items.length + '</small></a>';
    }).join('') + '</div>';

    h += '<div class="callout"><b>How far to trust a page</b>' + fmt(G.trust) + ' <a href="#/freshness">See what is verified</a>.</div></div>';
    return h;
  }

  function pageStart() {
    var G = A.guide;
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / Start here</div><h1>Start here</h1><p class="lede">' + esc(G.intro) + '</p>';
    h += '<h2>Paths by role</h2><div class="paths">';
    G.paths.forEach(function (p) {
      h += '<section class="path"><h3>' + esc(p.role) + '</h3><p>' + esc(p.goal) + '</p><ol>' +
        p.steps.map(function (s) { return '<li><a href="' + s[0] + '">' + esc(s[1]) + '</a><span>' + esc(s[2]) + '</span></li>'; }).join('') + '</ol></section>';
    });
    h += '</div><h2>From idea to production</h2><p>Six stages. Each one names the question to answer, what to do, and where the atlas helps.</p><ol class="stages">';
    G.stages.forEach(function (s) {
      h += '<li><h3>' + esc(s.name) + '</h3><p class="q">' + esc(s.question) + '</p>' + ul(s.do) +
        '<p class="see">' + s.links.map(function (l) { return '<a href="' + l[0] + '">' + esc(l[1]) + '</a>'; }).join('') + '</p></li>';
    });
    h += '</ol><h2>How the site is organised</h2><div class="lists two">';
    SECTIONS.slice(1).forEach(function (s) {
      h += '<div class="box"><h3>' + esc(s.name) + '</h3><p class="fine">' + esc(s.blurb) + '</p><ul>' + s.items.map(function (it) { return '<li><a href="' + it[0] + '">' + esc(it[1]) + '</a></li>'; }).join('') + '</ul></div>';
    });
    h += '</div><h2>How far to trust a page</h2><p>' + fmt(G.trust) + '</p>' +
      '<p>Press <kbd>/</kbd> or <kbd>Ctrl</kbd> + <kbd>K</kbd> anywhere to search. Unfamiliar term? Check the <a href="#/glossary">glossary</a>.</p>';
    return h;
  }

  function pageGlossary() {
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / Glossary</div><h1>Glossary</h1>' +
      '<p class="lede">' + A.glossary.length + ' terms used across the atlas, in plain language, each with a link to where it matters.</p>' +
      '<label class="gfilter"><span class="sr-only">Filter terms</span><input id="gq" type="search" placeholder="Filter terms…" autocomplete="off"></label>' +
      '<p id="gnone" class="fine" hidden>No term matches. Try the site search with <kbd>/</kbd>.</p>';
    A.glossaryGroups.forEach(function (g) {
      var terms = A.glossary.filter(function (t) { return t.g === g.id; });
      h += '<section class="gsec"><h2>' + esc(g.name) + '</h2><dl class="gloss">' + terms.map(function (t) {
        return '<div class="gterm" data-hay="' + esc((t.term + ' ' + t.def).toLowerCase()) + '"><dt>' + esc(t.term) + '</dt><dd>' + fmt(t.def) +
          '<span class="see">' + t.see.map(function (l) { return '<a href="' + l[0] + '">' + esc(l[1]) + '</a>'; }).join('') + '</span></dd></div>';
      }).join('') + '</dl></section>';
    });
    afterRender = function () {
      var input = $('#gq');
      input.addEventListener('input', function () {
        var v = input.value.trim().toLowerCase(), any = false;
        $$('.gsec').forEach(function (sec) {
          var shown = 0;
          $$('.gterm', sec).forEach(function (el) { var ok = !v || el.getAttribute('data-hay').indexOf(v) > -1; el.hidden = !ok; if (ok) shown++; });
          sec.hidden = !shown; if (shown) any = true;
        });
        $('#gnone').hidden = any;
      });
    };
    return h;
  }

  function serviceCard(s) {
    return '<a class="card" style="--h:' + hueOf(s.cat) + '" href="#/s/' + s.id + '"><h3>' + esc(s.name) + '</h3><p>' + esc(s.tag) + '</p></a>';
  }

  function pageCategory(id) {
    var c = catById[id]; if (!c) return notFound();
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / Category</div><h1>' + esc(c.name) + '</h1><p class="lede">' + esc(c.short) + '</p>';
    h += paras(c.intro);
    h += '<div class="callout"><b>Design lens</b>' + fmt(c.lens) + '</div>';
    h += '<h2>Services</h2><div class="grid">' + c.items.map(serviceCard).join('') + '</div>';
    return h;
  }

  function pageService(id) {
    var s = byId[id]; if (!s) return notFound();
    var c = catById[s.cat], hue = c.hue, i = c.items.indexOf(s);
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / <a class="chip" style="--h:' + hue + '" href="#/c/' + c.id + '">' + esc(c.name) + '</a>' +
      (s.doc ? '<a href="https://learn.microsoft.com/' + esc(s.doc) + '" target="_blank" rel="noopener">Microsoft Learn ↗</a>' : '') + '</div>';
    h += '<h1>' + esc(s.name) + '</h1><p class="lede">' + esc(s.tag) + '</p>' + verificationBox(id);
    h += '<h2 style="margin-top:28px">What it is</h2>' + paras(s.what);
    h += '<h2>How it works</h2>' + stepperHost({ flow: s.flow, steps: s.steps, hue: hue });
    h += '<div class="lists two" style="margin-top:34px"><div class="box warn"><h3>Gotchas</h3>' + ul(s.gotchas) + '</div><div class="box"><h3>Edge cases</h3>' + ul(s.edges) + '</div></div>';
    h += '<h2>Using it in AI/ML systems</h2><div class="box ml" style="padding-top:2px">' + ul(s.ml) + '</div>';
    if (s.pairs && s.pairs.length) {
      h += '<h2>Pairs well with</h2><div class="pairs">' + s.pairs.filter(function (p) { return byId[p]; }).map(function (p) { return '<a href="#/s/' + p + '">' + esc(byId[p].name) + '</a>'; }).join('') + '</div>';
    }
    if (s.cost) h += '<div class="callout" style="margin-top:28px"><b>Cost model</b>' + fmt(s.cost) + '</div>';
    var prev = c.items[i - 1], next = c.items[i + 1];
    h += '<div class="pn">' + (prev ? '<a href="#/s/' + prev.id + '"><small>← Previous</small>' + esc(prev.name) + '</a>' : '<span></span>') + (next ? '<a href="#/s/' + next.id + '"><small>Next →</small>' + esc(next.name) + '</a>' : '') + '</div>';
    return h;
  }

  function pageArchIndex() {
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / Architectures</div><h1>Reference architectures</h1><p class="lede">Services are only useful in combination. These are the shapes that keep showing up in production AI/ML systems.</p><div class="grid">';
    A.architectures.forEach(function (a) { h += '<a class="card" style="--h:212" href="#/a/' + a.id + '"><div class="mini">Architecture</div><h3>' + esc(a.name) + '</h3><p>' + esc(a.short) + '</p></a>'; });
    return h + '</div>';
  }

  function pageArch(id) {
    var a = archById[id]; if (!a) return notFound();
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / <a href="#/a">Architectures</a></div><h1>' + esc(a.name) + '</h1><p class="lede">' + esc(a.short) + '</p>';
    h += '<div class="callout"><b>Use it when</b>' + fmt(a.when) + '</div>';
    h += '<h2>Walkthrough</h2><p>Click a step, or press Play. Every box is a link to its service page.</p>' + stepperHost({ flow: a.flow, steps: a.steps, hue: 212 });
    h += '<div class="lists two" style="margin-top:34px"><div class="box"><h3>Why this shape</h3>' + ul(a.why) + '</div><div class="box warn"><h3>How it fails</h3>' + ul(a.fails) + '</div></div>';
    var used = {}; a.flow.forEach(function (f) { if (f.s) used[f.s] = 1; });
    var ids = Object.keys(used);
    if (ids.length) h += '<h2>Services involved</h2><div class="pairs">' + ids.map(function (p) { return '<a href="#/s/' + p + '">' + esc(byId[p].name) + '</a>'; }).join('') + '</div>';
    return h;
  }

  /* ---------- decisions & leader tools ---------- */
  var decById = {}; A.decisions.forEach(function (d) { decById[d.id] = d; });
  var themeById = {}; A.decisionThemes.forEach(function (t) { themeById[t.id] = t; });
  var THEME_HUE = { strategy: 212, architecture: 268, risk: 150 };
  var DOOR = { 'two-way': ['Two-way door', 'Easy to reverse'], 'one-way': ['One-way door', 'Hard to reverse'], 'mixed': ['Mixed door', 'Reversible at first'] };
  var afterRender = null;

  function doorBadge(d) { var x = DOOR[d.door]; return '<span class="door ' + d.door + '" title="' + esc(x[1]) + '">' + x[0] + '</span>'; }
  function plain(s) {
    return String(s).replace(/\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g, function (m, id, label) { return label || (byId[id] ? byId[id].name : id); });
  }
  function copyText(text, btn) {
    var label = btn ? (btn.getAttribute('data-l') || btn.textContent) : '';
    if (btn) btn.setAttribute('data-l', label);
    function done(ok) { if (!btn) return; btn.textContent = ok ? 'Copied ✓' : 'Select and copy manually'; setTimeout(function () { btn.textContent = label; }, 1800); }
    function fallback() {
      var t = document.createElement('textarea'); t.value = text; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      document.body.appendChild(t); t.select(); var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(t); done(ok);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback); else fallback();
  }
  function seeLink(ref) {
    var p = ref.split(':'), id = p[1];
    if (p[0] === 'svc' && byId[id]) return '<a href="#/s/' + id + '">' + esc(byId[id].name) + '</a>';
    if (p[0] === 'dec' && decById[id]) return '<a href="#/d/' + id + '">' + esc(decById[id].title) + '</a>';
    return '';
  }
  function money(n) {
    if (!isFinite(n)) return '—';
    if (n >= 100) return '$' + Math.round(n).toLocaleString('en-US');
    if (n >= 1) return '$' + n.toFixed(2);
    if (n >= 0.01) return '$' + n.toFixed(3);
    return '$' + n.toFixed(5);
  }

  /* ----- role tabs: engineering managers and principal engineers ----- */
  var roleById = {}; A.roles.forEach(function (r) { roleById[r.id] = r; });
  var ROLE_KEY = 'atlas-role';
  function getRole() { try { var r = localStorage.getItem(ROLE_KEY); return roleById[r] ? r : null; } catch (e) { return null; } }
  function setRole(r) { try { localStorage.setItem(ROLE_KEY, r); } catch (e) {} }
  var LEAD_TEXT = { em: 'Engineering manager leads', pe: 'Principal engineer leads', both: 'Shared decision' };
  function leadChip(d) { return '<span class="lead ' + d.lead + '">' + LEAD_TEXT[d.lead] + '</span>'; }
  function roleChip(d, role) {
    var t = d.lead === role ? 'You lead' : (d.lead === 'both' ? 'You co-own' : 'You advise');
    return '<span class="lead ' + (d.lead === role ? 'mine' : (d.lead === 'both' ? 'both' : 'other')) + '">' + t + '</span>';
  }
  function tabList(label, tabs, active) {
    return '<div class="tabs" role="tablist" aria-label="' + esc(label) + '">' + tabs.map(function (t) {
      var on = t[0] === active;
      return '<button type="button" role="tab" class="tab" id="tab-' + t[0] + '" aria-controls="panel-' + t[0] + '" aria-selected="' + on + '" tabindex="' + (on ? 0 : -1) + '" data-tab="' + t[0] + '">' + t[1] + '</button>';
    }).join('') + '</div>';
  }
  function tabPanel(id, active, html) {
    return '<div role="tabpanel" class="tabpanel" id="panel-' + id + '" aria-labelledby="tab-' + id + '" tabindex="0"' + (id === active ? '' : ' hidden') + '>' + html + '</div>';
  }
  function mountTabs(root, onChange) {
    var list = $('.tabs', root); if (!list) return;
    function select(id, focus) {
      $$('.tab', list).forEach(function (b) {
        var on = b.getAttribute('data-tab') === id;
        b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1;
        if (on && focus) b.focus();
      });
      $$('.tabpanel', root).forEach(function (p) { p.hidden = p.id !== 'panel-' + id; });
      if (onChange) onChange(id);
    }
    list.addEventListener('click', function (e) { var b = e.target.closest('.tab'); if (b) select(b.getAttribute('data-tab')); });
    list.addEventListener('keydown', function (e) {
      var tabs = $$('.tab', list), i = tabs.indexOf(document.activeElement); if (i < 0) return;
      var j = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (tabs.length + i - 1) % tabs.length : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : -1;
      if (j >= 0) { e.preventDefault(); select(tabs[j].getAttribute('data-tab'), true); }
    });
  }
  function decisionCard(d, line, chip) {
    return '<a class="card" style="--h:' + THEME_HUE[d.theme] + '" href="#/d/' + d.id + '"><div class="mini">' + esc(themeById[d.theme].name) + '</div><h3>' + esc(d.title) + '</h3><p>' + esc(line) + '</p>' +
      '<div class="badges">' + doorBadge(d) + (chip || '') + '</div></a>';
  }
  function roleView(role) {
    var r = roleById[role], other = role === 'em' ? 'pe' : 'em';
    var h = '<p class="rolelede">' + fmt(r.blurb) + '</p>' +
      '<div class="lists two"><div class="box"><h3>What you decide</h3>' + ul(r.owns) + '</div>' +
      '<div class="box ml"><h3>Your rhythm</h3><ul>' + r.rhythm.map(function (x) { return '<li><b>' + esc(x[0]) + ':</b> ' + fmt(x[1]) + '</li>'; }).join('') + '</ul></div></div>';
    h += '<h3 style="margin-top:30px">Quick calls</h3><p style="max-width:62ch">Find the situation you are in, take the default call, and open the guide for the options, rules and red flags behind it.</p>' +
      '<div class="tablewrap"><table class="quick"><thead><tr><th>If this is happening</th><th>Default call</th><th>Guide</th></tr></thead><tbody>' +
      r.quick.map(function (q) { var d = decById[q[2]]; return '<tr><td>' + fmt(q[0]) + '</td><td>' + fmt(q[1]) + '</td><td><a href="#/d/' + d.id + '">' + esc(d.title) + '</a></td></tr>'; }).join('') + '</tbody></table></div>';
    var groups = [
      ['You lead these', A.decisions.filter(function (d) { return d.lead === role; })],
      ['You co-own these', A.decisions.filter(function (d) { return d.lead === 'both'; })],
      [role === 'em' ? 'Principal engineers lead; you back them on' : 'Engineering managers lead; you advise on', A.decisions.filter(function (d) { return d.lead === other; })]
    ];
    groups.forEach(function (g) {
      if (!g[1].length) return;
      h += '<h3 style="margin-top:30px">' + esc(g[0]) + ' <span class="cnt">' + g[1].length + '</span></h3><div class="grid">' +
        g[1].map(function (d) { return decisionCard(d, d[role].call, roleChip(d, role)); }).join('') + '</div>';
    });
    return h;
  }
  function allView() {
    var h = '<p class="rolelede">Every guide, grouped by theme. Each is marked with who usually leads it.</p>';
    A.decisionThemes.forEach(function (t) {
      var list = A.decisions.filter(function (d) { return d.theme === t.id; });
      h += '<h3 style="margin-top:26px">' + esc(t.name) + '</h3><p style="max-width:62ch">' + esc(t.blurb) + '</p><div class="grid">' +
        list.map(function (d) { return decisionCard(d, d.question, leadChip(d)); }).join('') + '</div>';
    });
    return h;
  }

  function pageDecisionHub(tab) {
    var active = (tab === 'em' || tab === 'pe' || tab === 'all') ? tab : (getRole() || 'em');
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / Decisions</div><h1>Decision guides</h1>' +
      '<p class="lede">For engineering managers and principal engineers deciding how to build agentic and ML systems on Azure.</p>' +
      '<p style="max-width:62ch">Each guide gives the options side by side, if/then rules, red flags to watch for, questions to ask in a design review, and a trigger for revisiting the decision. Each one is marked as a <b>two-way door</b> (cheap to reverse) or a <b>one-way door</b> (expensive to reverse), so you can spend your review time where it counts.</p>';
    h += '<h2>Pick your role</h2><p style="max-width:62ch">The tabs below show the same guides through two lenses. Engineering managers get the default call, the evidence to ask for and the budget and people implications. Principal engineers get the default design, the trade-offs and the tests to demand. Your choice is remembered in this browser.</p>';
    h += tabList('Decision guides by role', [['em', 'Engineering managers'], ['pe', 'Principal engineers'], ['all', 'All guides']], active);
    h += tabPanel('em', active, roleView('em')) + tabPanel('pe', active, roleView('pe')) + tabPanel('all', active, allView());
    h += '<h2>Tools</h2><div class="grid">' +
      '<a class="card" style="--h:212" href="#/d/shaper"><div class="mini">Interactive</div><h3>Solution shaper</h3><p>Answer seven questions about your use case and get a starting stack, risks, and the decisions to make next.</p></a>' +
      '<a class="card" style="--h:150" href="#/d/checklists"><div class="mini">Checklist</div><h3>Readiness checklists</h3><p>A prototype-to-scale maturity ladder, a production-readiness checklist, and a decision-record template.</p></a>' +
      '<a class="card" style="--h:185" href="#/d/calculator"><div class="mini">Calculator</div><h3>Cost per task</h3><p>Model unit economics and see which levers (caching, batching, routing) move the bill most.</p></a></div>';
    h += '<h2>Using these in practice</h2><div class="lists two"><div class="box"><h3>In a design review</h3>' +
      ul(['Open the guide for the decision under discussion and read its **red flags** aloud.', 'Ask the **review questions** and note which have no answer yet.', 'For a **one-way door**, require a written decision record before approving.']) + '</div>' +
      '<div class="box ml"><h3>When planning a quarter</h3>' +
      ul(['Run the **solution shaper** to get a first stack and the decisions it flags.', 'Use the **maturity ladder** to set exit criteria for each phase.', 'Put the **cost calculator** numbers next to the roadmap, not after it.']) + '</div></div>';
    afterRender = function () {
      mountTabs($('#main'), function (id) {
        if (id !== 'all') setRole(id);
        try { history.replaceState(null, '', '#/d/' + id); } catch (e) {}
        renderSide('d', id);
      });
    };
    return h;
  }

  function roleLens(d, role) {
    var x = d[role], lbl = role === 'em' ? ['You decide', 'Ask your team for'] : ['You own', 'Evidence to demand'];
    return '<div class="callout lens"><b>Default call</b>' + fmt(x.call) + '</div>' +
      '<div class="lists two"><div class="box"><h3>' + lbl[0] + '</h3>' + ul(x.own) + '</div><div class="box ml"><h3>' + lbl[1] + '</h3>' + ul(x.evidence) + '</div></div>';
  }

  function pageDecision(id) {
    var d = decById[id]; if (!d) return notFound();
    var t = themeById[d.theme], i = A.decisions.indexOf(d);
    var active = getRole() || (d.lead === 'pe' ? 'pe' : 'em');
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / <a href="#/d">Decisions</a> / ' + esc(t.name) + '</div><h1>' + esc(d.title) + '</h1><p class="lede">' + esc(d.question) + '</p>';
    h += '<div class="doorline">' + doorBadge(d) + '<span>' + fmt(d.doorNote) + '</span></div>';
    h += '<h2>Decide by role</h2><p class="lead-note">' + leadChip(d) + '</p>';
    h += tabList('Decision lens by role', [['em', 'Engineering manager' + (d.lead === 'em' ? ' <i>leads</i>' : '')], ['pe', 'Principal engineer' + (d.lead === 'pe' ? ' <i>leads</i>' : '')]], active);
    h += tabPanel('em', active, roleLens(d, 'em')) + tabPanel('pe', active, roleLens(d, 'pe'));
    h += '<h2>Why it matters</h2>' + paras(d.why);
    h += '<h2>The options</h2><div class="tablewrap"><table><thead><tr>' + d.cols.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      d.rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + fmt(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
    h += '<h2>Decide with these rules</h2><div class="rules">' + d.rules.map(function (r) {
      return '<div class="rule"><div class="if"><small>If</small>' + fmt(r[0]) + '</div><div class="then"><small>Then</small>' + fmt(r[1]) + '</div></div>';
    }).join('') + '</div>';
    h += '<div class="lists two" style="margin-top:34px"><div class="box warn"><h3>Red flags</h3>' + ul(d.redflags) + '</div><div class="box"><h3>Ask in the design review</h3>' + ul(d.ask) + '</div></div>';
    h += '<div class="callout" style="margin-top:22px"><b>Revisit when</b>' + fmt(d.revisit) + '</div>';
    var rel = (d.related || []).filter(function (p) { return byId[p]; });
    if (rel.length) h += '<h2>Services involved</h2><div class="pairs">' + rel.map(function (p) { return '<a href="#/s/' + p + '">' + esc(byId[p].name) + '</a>'; }).join('') + '</div>';
    var prev = A.decisions[i - 1], next = A.decisions[i + 1];
    h += '<div class="pn">' + (prev ? '<a href="#/d/' + prev.id + '"><small>← Previous</small>' + esc(prev.title) + '</a>' : '<span></span>') + (next ? '<a href="#/d/' + next.id + '"><small>Next →</small>' + esc(next.title) + '</a>' : '') + '</div>';
    afterRender = function () { mountTabs($('#main'), function (r) { setRole(r); }); };
    return h;
  }

  /* ----- solution shaper ----- */
  function pageShaper() {
    var Q = A.shaper.questions;
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / <a href="#/d">Decisions</a> / Tool</div><h1>Solution shaper</h1>' +
      '<p class="lede">Describe the system. Get a starting shape you can argue with.</p>' +
      '<div class="callout"><b>Read this first</b>This is a rule-based starting point, not an architecture sign-off. It shows the usual shape for your answers and the decisions most worth a conversation. Your evals and constraints override it.</div>' +
      '<div class="shaper"><form id="shForm" class="shform">';
    Q.forEach(function (q) {
      h += '<fieldset data-q="' + q.id + '"><legend>' + esc(q.label) + '</legend>' + q.options.map(function (o) {
        return '<label class="opt"><input type="radio" name="' + q.id + '" value="' + o[0] + '"><span>' + esc(o[1]) + '</span></label>';
      }).join('') + '</fieldset>';
    });
    h += '</form><div id="shOut" class="shout" aria-live="polite"></div></div>';
    afterRender = mountShaper;
    return '<div class="wide">' + h + '</div>';
  }
  function shaperMarkdown(a, r) {
    var Q = A.shaper.questions, L = ['# Solution shape: ' + r.headline, '', '## Inputs'];
    Q.forEach(function (q) {
      if (q.only && a.goal !== q.only) return;
      var o = q.options.filter(function (x) { return x[0] === a[q.id]; })[0];
      L.push('- ' + q.label + ' ' + (o ? o[1] : a[q.id]));
    });
    if (r.arch) L.push('', 'Reference architecture: ' + archById[r.arch].name);
    L.push('', '## Stack');
    r.stack.forEach(function (s) { L.push('- ' + byId[s.id].name + ': ' + s.role + '. ' + s.why); });
    L.push('', '## Risks to design for'); r.risks.forEach(function (x) { L.push('- ' + x); });
    L.push('', '## Decisions to make next'); r.next.forEach(function (n) { L.push('- ' + decById[n.id].title + ': ' + n.why); });
    L.push('', '## Phasing'); r.phases.forEach(function (p, i) { L.push((i + 1) + '. ' + p); });
    L.push('', 'Generated by the Azure for AI systems atlas. A starting point only: validate with your own evals.');
    return L.join('\n');
  }
  function mountShaper() {
    var form = $('#shForm'), out = $('#shOut'), a = {}, k;
    for (k in A.shaper.defaults) a[k] = A.shaper.defaults[k];
    $$('input[type=radio]', form).forEach(function (r) { r.checked = a[r.name] === r.value; });
    function paint() {
      var fs = $('fieldset[data-q=action]', form); if (fs) fs.hidden = a.goal !== 'agent';
      var r = A.shaper.recommend(a), h = '<div class="eyebrow">Suggested starting shape</div><h2 style="margin-top:0">' + esc(r.headline) + '</h2>';
      if (r.arch && archById[r.arch]) h += '<p>Reference architecture: <a href="#/a/' + r.arch + '">' + esc(archById[r.arch].name) + '</a></p>';
      h += '<h3>Stack</h3><ul class="stack">' + r.stack.map(function (s) {
        var sv = byId[s.id];
        return '<li style="--h:' + hueOf(sv.cat) + '"><a class="svc" href="#/s/' + s.id + '">' + esc(sv.name) + '</a><span><b>' + esc(s.role) + '.</b> ' + esc(s.why) + '</span></li>';
      }).join('') + '</ul>';
      h += '<h3>Risks to design for</h3><div class="box warn" style="padding-top:2px">' + ul(r.risks) + '</div>';
      h += '<h3>Decide next</h3><ul class="nextl">' + r.next.map(function (n) {
        var d = decById[n.id]; return '<li><a href="#/d/' + d.id + '">' + esc(d.title) + '</a> ' + doorBadge(d) + '<br><span>' + esc(n.why) + '</span></li>';
      }).join('') + '</ul>';
      h += '<h3>Phasing</h3><ol class="phases">' + r.phases.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ol>';
      h += '<div class="btns" style="margin-top:18px"><button class="btn" type="button" data-copy>Copy as markdown</button><a class="btn" href="#/d/checklists">Readiness checklists</a></div>';
      out.innerHTML = h; out._md = shaperMarkdown(a, r);
    }
    form.addEventListener('change', function (e) { if (e.target.name) { a[e.target.name] = e.target.value; paint(); } });
    out.addEventListener('click', function (e) { var b = e.target.closest('[data-copy]'); if (b) copyText(out._md, b); });
    paint();
  }

  /* ----- checklists, ladder, ADR ----- */
  var READY_KEY = 'atlas-ready-v1';
  function loadReady() { try { return JSON.parse(localStorage.getItem(READY_KEY)) || {}; } catch (e) { return {}; } }
  function saveReady(o) { try { localStorage.setItem(READY_KEY, JSON.stringify(o)); } catch (e) {} }

  function pageChecklists() {
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / <a href="#/d">Decisions</a> / Tool</div><h1>Readiness checklists</h1>' +
      '<p class="lede">What has to be true before you move up a stage, and before you go live.</p>';
    h += '<h2>The maturity ladder</h2><p style="max-width:62ch">Most failed AI projects skipped a stage. Each stage has a different goal, and each has things you should not do yet.</p><div class="ladder">';
    A.ladder.forEach(function (s, i) {
      h += '<div class="rung"><div class="rn">' + (i + 1) + '</div><h3>' + esc(s.stage) + '</h3><div class="mini">' + esc(s.time) + '</div><p>' + esc(s.goal) + '</p>' +
        '<h4>Exit when</h4>' + ul(s.exit) + '<h4 class="no">Not yet</h4><p class="nope">' + s.skip.map(esc).join(' · ') + '</p></div>';
    });
    h += '</div><h2>Production readiness</h2><p style="max-width:62ch">Tick items as they become true. Your progress is saved in this browser only.</p>' +
      '<div class="ready-bar"><div class="seg" role="group" aria-label="Filter checklist" id="rdFilter">' +
      '<button type="button" data-f="all" aria-pressed="true">All</button><button type="button" data-f="agent" aria-pressed="false">Agentic</button><button type="button" data-f="ml" aria-pressed="false">Classic ML</button></div>' +
      '<div class="prog" aria-live="polite"><div class="track"><div class="fill" id="rdFill"></div></div><span id="rdNum"></span></div></div><div id="rdList"></div>' +
      '<div class="btns" style="margin-top:16px"><button class="btn" type="button" id="rdCopy">Copy open items as markdown</button><button class="btn" type="button" id="rdReset">Reset</button></div>';
    h += '<h2>Decision record template</h2><p style="max-width:62ch">A short record for each one-way door. The point is the reversibility line and the revisit trigger.</p>' +
      '<div class="codebar"><button class="btn" type="button" id="adrCopy">Copy template</button></div><pre class="adr" tabindex="0">' + esc(A.adrTemplate) + '</pre>';
    afterRender = mountChecklists;
    return h;
  }
  function mountChecklists() {
    var state = loadReady(), filter = 'all', list = $('#rdList');
    function visible(it) { return filter === 'all' || it.kind === 'both' || it.kind === filter; }
    function paint() {
      var total = 0, done = 0, h = '';
      A.readiness.forEach(function (g) {
        var items = g.items.filter(visible); if (!items.length) return;
        h += '<h3>' + esc(g.name) + '</h3><ul class="chklist">';
        items.forEach(function (it) {
          total++; if (state[it.id]) done++;
          var see = (it.see || []).map(seeLink).filter(Boolean).join(' · ');
          h += '<li><label class="chk"><input type="checkbox" data-id="' + it.id + '"' + (state[it.id] ? ' checked' : '') + '><span><span class="t">' + fmt(it.t) + '</span>' +
            '<span class="w">' + esc(it.why) + '</span>' + (see ? '<span class="s">See: ' + see + '</span>' : '') + '</span></label></li>';
        });
        h += '</ul>';
      });
      list.innerHTML = h;
      $('#rdNum').textContent = done + ' of ' + total;
      $('#rdFill').style.width = (total ? Math.round(done / total * 100) : 0) + '%';
    }
    list.addEventListener('change', function (e) {
      var id = e.target.getAttribute('data-id'); if (!id) return;
      if (e.target.checked) state[id] = 1; else delete state[id];
      saveReady(state);
      var vis = 0, dn = 0; A.readiness.forEach(function (g) { g.items.filter(visible).forEach(function (it) { vis++; if (state[it.id]) dn++; }); });
      $('#rdNum').textContent = dn + ' of ' + vis; $('#rdFill').style.width = (vis ? Math.round(dn / vis * 100) : 0) + '%';
    });
    $('#rdFilter').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-f]'); if (!b) return; filter = b.getAttribute('data-f');
      $$('#rdFilter button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      paint();
    });
    $('#rdReset').addEventListener('click', function () { state = {}; saveReady(state); paint(); });
    $('#rdCopy').addEventListener('click', function () {
      var L = ['# Production readiness: open items', ''];
      A.readiness.forEach(function (g) {
        var open = g.items.filter(function (it) { return visible(it) && !state[it.id]; }); if (!open.length) return;
        L.push('## ' + g.name); open.forEach(function (it) { L.push('- [ ] ' + plain(it.t)); }); L.push('');
      });
      if (L.length === 2) L.push('All items in this view are done.');
      copyText(L.join('\n'), this);
    });
    $('#adrCopy').addEventListener('click', function () { copyText(A.adrTemplate, this); });
    paint();
  }

  /* ----- cost calculator ----- */
  var CALC_DEFAULTS = { req: 20000, inTok: 3000, outTok: 500, pIn: 3, pOut: 15, calls: 1, success: 85, sem: 0, cacheFrac: 0, cacheDisc: 90, batchShare: 0, batchDisc: 50, infra: 0.0005 };
  var CALC_FIELDS = [
    ['Traffic and task shape', [
      ['req', 'Tasks per day', '', 'A task is one user request that your system completes.'],
      ['calls', 'Model calls per task', '', 'Agents often make 3 to 10. A plain chat answer makes 1.'],
      ['inTok', 'Input tokens per call', '', 'System prompt, history, retrieved passages and tool results all count.'],
      ['outTok', 'Output tokens per call', '', 'Reasoning tokens usually bill as output.'],
      ['success', 'Tasks completed successfully', '%', 'Failures still cost money. Measure this with your evals.']]],
    ['Prices (example values: replace with current pricing)', [
      ['pIn', 'Input price per 1M tokens', '$', 'Take this from the pricing page for your model.'],
      ['pOut', 'Output price per 1M tokens', '$', 'Output is typically several times the input price.'],
      ['infra', 'Other cost per task', '$', 'Retrieval, gateway, storage, orchestration, logging.']]],
    ['Levers', [
      ['sem', 'Answered from semantic cache', '%', 'Share of tasks that skip the model entirely. Check answers stay correct.'],
      ['cacheFrac', 'Input tokens served from prompt cache', '%', 'Stable prefixes such as system prompts and shared documents.'],
      ['cacheDisc', 'Prompt-cache discount', '%', 'Cached input is billed at a reduced rate. Confirm for your model.'],
      ['batchShare', 'Share of calls sent to batch', '%', 'Only for work that can wait.'],
      ['batchDisc', 'Batch discount', '%', 'Confirm the current discount for your model.']]]
  ];
  function calcCost(p) {
    var bf = 1 - p.batchShare / 100 * p.batchDisc / 100, keep = 1 - p.sem / 100;
    var inC = p.inTok / 1e6 * p.pIn * (1 - p.cacheFrac / 100 * p.cacheDisc / 100) * bf * p.calls * keep;
    var outC = p.outTok / 1e6 * p.pOut * bf * p.calls * keep;
    var task = inC + outC + p.infra;
    return { inC: inC, outC: outC, infra: p.infra, task: task, ok: p.success > 0 ? task / (p.success / 100) : Infinity, month: task * p.req * 30 };
  }
  function pageCalculator() {
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / <a href="#/d">Decisions</a> / Tool</div><h1>Cost per task</h1>' +
      '<p class="lede">Unit economics for an LLM feature, and which levers move them.</p>' +
      '<div class="callout"><b>About the numbers</b>Prices here are placeholders for the arithmetic. Look up current prices for your model and Region, and measure your own token counts. Nothing is sent anywhere: the calculation runs in your browser.</div>' +
      '<div class="wide"><div class="calc"><form id="calcForm" class="calcform">';
    CALC_FIELDS.forEach(function (g) {
      h += '<fieldset><legend>' + esc(g[0]) + '</legend>';
      g[1].forEach(function (f) {
        h += '<label class="num"><span class="nl2">' + esc(f[1]) + '</span><span class="inp">' + (f[2] === '$' ? '<i>$</i>' : '') +
          '<input type="number" inputmode="decimal" min="0" step="any" name="' + f[0] + '" aria-describedby="h-' + f[0] + '">' + (f[2] === '%' ? '<i>%</i>' : '') + '</span><small id="h-' + f[0] + '">' + esc(f[3]) + '</small></label>';
      });
      h += '</fieldset>';
    });
    h += '<button class="btn" type="button" id="calcReset">Reset to defaults</button></form><div id="calcOut" class="calcout" aria-live="polite"></div></div></div>';
    afterRender = mountCalculator;
    return h;
  }
  function mountCalculator() {
    var form = $('#calcForm'), out = $('#calcOut'), p = {}, k;
    function fill() { for (k in CALC_DEFAULTS) { p[k] = CALC_DEFAULTS[k]; form.elements[k].value = CALC_DEFAULTS[k]; } }
    function read() {
      for (k in CALC_DEFAULTS) {
        var v = parseFloat(form.elements[k].value); if (!isFinite(v) || v < 0) v = 0;
        if (/^(success|sem|cacheFrac|cacheDisc|batchShare|batchDisc)$/.test(k)) v = Math.min(100, v);
        p[k] = v;
      }
      if (p.calls < 1) p.calls = 1;
    }
    function clone() { var o = {}; for (var x in p) o[x] = p[x]; return o; }
    function paint() {
      var c = calcCost(p), tot = c.inC + c.outC + c.infra || 1;
      var h = '<div class="eyebrow">Result</div><div class="kpis">' +
        '<div class="kpi"><small>Per task</small><b>' + money(c.task) + '</b></div>' +
        '<div class="kpi"><small>Per successful task</small><b>' + money(c.ok) + '</b></div>' +
        '<div class="kpi"><small>Per month (30 days)</small><b>' + money(c.month) + '</b></div>' +
        '<div class="kpi"><small>At 10x volume</small><b>' + money(c.month * 10) + '</b></div></div>';
      h += '<h3>Where the money goes</h3><div class="split" role="img" aria-label="Cost split">' +
        '<span style="width:' + (c.inC / tot * 100) + '%" class="s1"></span><span style="width:' + (c.outC / tot * 100) + '%" class="s2"></span><span style="width:' + (c.infra / tot * 100) + '%" class="s3"></span></div>' +
        '<ul class="legend"><li><i class="s1"></i>Input tokens ' + money(c.inC) + '</li><li><i class="s2"></i>Output tokens ' + money(c.outC) + '</li><li><i class="s3"></i>Other ' + money(c.infra) + '</li></ul>';
      var levers = [
        ['Halve output tokens (tighter prompts, shorter answers)', function (q) { q.outTok *= 0.5; }],
        ['Cache 60% of the prompt', function (q) { q.cacheFrac = Math.max(q.cacheFrac, 60); }],
        ['Answer 25% of tasks from a semantic cache', function (q) { q.sem = Math.max(q.sem, 25); }],
        ['Send half the calls to batch (if the work can wait)', function (q) { q.batchShare = Math.max(q.batchShare, 50); }],
        ['One fewer model call per task', function (q) { q.calls = Math.max(1, q.calls - 1); }],
        ['Route to a model one fifth the price', function (q) { q.pIn /= 5; q.pOut /= 5; }],
        ['Raise the success rate to 95%', function (q) { q.success = Math.max(q.success, 95); }]
      ];
      h += '<h3>What each lever would do</h3><div class="tablewrap"><table><thead><tr><th>Lever</th><th>Per month</th><th>Change</th><th>Per successful task</th></tr></thead><tbody>' +
        levers.map(function (L) {
          var q = clone(); L[1](q); var r = calcCost(q), d = c.month ? (r.month - c.month) / c.month * 100 : 0;
          return '<tr><td style="white-space:normal">' + esc(L[0]) + '</td><td>' + money(r.month) + '</td><td class="' + (d < -0.5 ? 'dn' : (d > 0.5 ? 'up' : '')) + '">' + (Math.abs(d) < 0.5 ? 'no change' : (d > 0 ? '+' : '') + d.toFixed(0) + '%') + '</td><td>' + money(r.ok) + '</td></tr>';
        }).join('') + '</tbody></table></div>';
      h += '<p class="fine">Each row changes one thing from your current inputs. Levers are not additive, and each one can cost quality, so re-run your evals after applying it.</p>';
      out.innerHTML = h;
    }
    fill();
    form.addEventListener('input', function () { read(); paint(); });
    $('#calcReset').addEventListener('click', function () { fill(); paint(); });
    read(); paint();
  }

  /* ---------- playbooks ---------- */
  function pagePlaybooksIndex() {
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / Playbooks</div>' +
      '<h1>AI Engineering Playbooks</h1>' +
      '<p class="lede">Comprehensive engineering playbooks for engineering leaders and principal architects designing, hardening, and operating generative AI systems on Azure.</p>' +
      '<div class="grid">';
    A.engineeringPlaybooks.forEach(function (p) {
      h += '<a class="card" style="--h:212" href="#/p/' + p.id + '">' +
        '<div class="mini">' + esc(p.badge) + '</div>' +
        '<h3>' + esc(p.title) + '</h3>' +
        '<p>' + esc(p.tag) + '</p>' +
        '</a>';
    });
    h += '</div>';
    return h;
  }

  function pagePlaybook(id) {
    var pb = A.engineeringPlaybooks.find(function (p) { return p.id === id; });
    if (!pb) return notFound();
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / <a href="#/p">Playbooks</a></div>' +
      '<h1>' + esc(pb.title) + '</h1>' +
      '<div style="margin:8px 0 16px"><span class="chip" style="--h:212">' + esc(pb.badge) + '</span></div>' +
      '<p class="lede">' + esc(pb.tag) + '</p>' +
      '<div class="callout"><b>Playbook Scope & Context</b>' + fmt(pb.intro) + '</div>';

    (pb.sections || []).forEach(function (sec) {
      h += '<h2>' + esc(sec.title) + '</h2>';
      if (sec.body) h += paras(sec.body);
      if (sec.bullets && sec.bullets.length) h += ul(sec.bullets);
      if (sec.tips && sec.tips.length) {
        h += '<div class="box warn" style="margin-top:14px"><h3>Engineering Rules & Best Practices</h3>' + ul(sec.tips) + '</div>';
      }
    });

    if (pb.see && pb.see.length) {
      h += '<h2>Connected Architectures & Decisions</h2><div class="pairs">' +
        pb.see.map(function (r) {
          var p = r.split(':');
          if (p[0] === 'arch' && archById[p[1]]) return '<a href="#/a/' + p[1] + '">📐 ' + esc(archById[p[1]].name) + '</a>';
          if (p[0] === 'dec' && decById[p[1]]) return '<a href="#/d/' + p[1] + '">⚖️ ' + esc(decById[p[1]].title) + '</a>';
          if (p[0] === 'svc' && byId[p[1]]) return '<a href="#/s/' + p[1] + '">📦 ' + esc(byId[p[1]].name) + '</a>';
          return '';
        }).filter(Boolean).join('') + '</div>';
    }

    var pi = A.engineeringPlaybooks.indexOf(pb);
    var prevP = A.engineeringPlaybooks[pi - 1], nextP = A.engineeringPlaybooks[pi + 1];
    h += '<div class="pn">' +
      (prevP ? '<a href="#/p/' + prevP.id + '"><small>← Previous Playbook</small>' + esc(prevP.title) + '</a>' : '<span></span>') +
      (nextP ? '<a href="#/p/' + nextP.id + '"><small>Next Playbook →</small>' + esc(nextP.title) + '</a>' : '') +
      '</div>';

    return h;
  }

  /* ---------- governance ---------- */
  function pageGovernance() {
    var g = A.governance;
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / Security & Governance</div>' +
      '<h1>Enterprise AI Security, Governance & CAF Landing Zones</h1>' +
      '<p class="lede">Operationalizing generative AI within Microsoft Cloud Adoption Framework (CAF) enterprise landing zones, zero-trust network boundaries, and defense-in-depth security controls.</p>';

    // CAF Landing Zone
    h += '<h2>' + esc(g.landingZones.title) + '</h2>' +
      '<p>' + fmt(g.landingZones.intro) + '</p>' +
      '<div class="lists two" style="margin:16px 0">' +
      g.landingZones.principles.map(function (p) {
        return '<div class="box"><h3>' + esc(p.name) + '</h3><p>' + fmt(p.desc) + '</p></div>';
      }).join('') + '</div>';

    h += '<h3>Enterprise Management Group Hierarchy</h3>' +
      '<p style="max-width:62ch">Structure subscriptions to separate shared foundational model capacity and central API gateways from application workload teams.</p>' +
      '<div class="tablewrap"><table class="matrix-table"><thead><tr><th>Management Group Level</th><th>Target Scope</th><th>Architecture Purpose</th></tr></thead><tbody>' +
      g.landingZones.hierarchy.map(function (row) {
        return '<tr><td><b>' + esc(row.level) + '</b></td><td>' + esc(row.scope) + '</td><td>' + fmt(row.purpose) + '</td></tr>';
      }).join('') + '</tbody></table></div>';

    h += '<h3>Zero-Trust Network Topology: ' + esc(g.landingZones.networkTopology.type) + '</h3>' +
      '<div class="grid" style="margin:16px 0">' +
      g.landingZones.networkTopology.components.map(function (c) {
        return '<div class="card" style="--h:212"><div class="mini">Network Component</div><h3>' + esc(c.name) + '</h3><p>' + fmt(c.desc) + '</p></div>';
      }).join('') + '</div>';

    // Security Framework
    h += '<h2>' + esc(g.securityFramework.title) + '</h2>' +
      '<p>' + fmt(g.securityFramework.intro) + '</p>' +
      '<div class="grid" style="margin:16px 0">' +
      g.securityFramework.pillars.map(function (p) {
        return '<div class="box" style="margin-bottom:8px"><h3>' + esc(p.name) + '</h3>' + ul(p.controls) + '</div>';
      }).join('') + '</div>';

    // Tenancy Models
    h += '<h2>' + esc(g.tenancyModels.title) + '</h2>' +
      '<div class="tablewrap"><table class="matrix-table"><thead><tr><th>Isolation Model</th><th>Best Fit</th><th>Mechanism</th><th>Pros</th><th>Cons</th></tr></thead><tbody>' +
      g.tenancyModels.models.map(function (m) {
        return '<tr><td><b>' + esc(m.name) + '</b></td><td>' + fmt(m.fit) + '</td><td>' + fmt(m.mechanism) + '</td><td><span style="color:var(--ok)">' + fmt(m.pros) + '</span></td><td><span style="color:var(--warn)">' + fmt(m.cons) + '</span></td></tr>';
      }).join('') + '</tbody></table></div>';

    // Policy Initiatives
    h += '<h2>' + esc(g.policyInitiatives.title) + '</h2>' +
      '<div class="tablewrap"><table class="matrix-table"><thead><tr><th>Policy Name</th><th>Enforcement Effect</th><th>Compliance & Security Purpose</th></tr></thead><tbody>' +
      g.policyInitiatives.policies.map(function (pol) {
        var effectColor = pol.effect === 'Deny' ? 'var(--warn)' : 'var(--accent)';
        return '<tr><td><b>' + esc(pol.name) + '</b></td><td><code style="color:' + effectColor + '">' + esc(pol.effect) + '</code></td><td>' + fmt(pol.purpose) + '</td></tr>';
      }).join('') + '</tbody></table></div>';

    return h;
  }

  /* ---------- operations ---------- */
  function pageOperations() {
    var op = A.operations;
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / Production Operations</div>' +
      '<h1>' + esc(op.title) + '</h1>' +
      '<p class="lede">' + fmt(op.lede) + '</p>' +
      lifecycleNotice() +
      '<div class="callout"><b>AI SRE & Observability Command Center</b>Real-time telemetry, specialized dashboards, continuous CI/CD evaluation gates, and actionable incident runbooks for production AI and agent workloads.</div>';

    // 1. Specialized Dashboard Blueprints
    if (op.dashboardBlueprints && op.dashboardBlueprints.length) {
      h += '<h2>1. Specialized Production Dashboard Blueprints</h2>' +
        '<p style="max-width:68ch">Four purpose-built monitoring dashboards covering application availability, agent execution loops, RAG retrieval quality, and FinOps unit economics.</p>' +
        '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(340px,100%),1fr));gap:16px;margin:20px 0">';
      op.dashboardBlueprints.forEach(function (db) {
        h += '<div class="dash-card">' +
          '<div class="dash-top">' +
            '<h4>' + esc(db.name) + '</h4>' +
            '<span class="chip" style="--h:212">' + esc(db.audience) + '</span>' +
          '</div>' +
          '<div style="font-size:12px;color:var(--muted);margin:4px 0"><b>Monitored Telemetry:</b></div>' +
          '<ul style="margin:0;padding-left:16px;font-size:12px;line-height:1.5">' +
            db.metrics.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') +
          '</ul>' +
          '<div style="margin-top:auto;padding-top:12px;display:flex;justify-content:space-between;align-items:center">' +
            '<button class="btn-sm" type="button" data-toggle-kql="' + db.id + '">View KQL Query ⤢</button>' +
            '<button class="btn-sm" type="button" data-copy="' + esc(db.kql) + '">Copy KQL</button>' +
          '</div>' +
          '<div class="kql-box" id="kql-' + db.id + '" hidden>' + esc(db.kql) + '</div>' +
        '</div>';
      });
      h += '</div>';
    }

    // 2. GenAIOps CI/CD Lifecycle & Artifacts
    if (op.devopsLifecycle) {
      var dlc = op.devopsLifecycle;
      h += '<h2>2. ' + esc(dlc.title) + '</h2>' +
        '<p style="max-width:68ch">Continuous integration, automated quality evaluation gates, infrastructure as code, and progressive deployment.</p>' +
        '<div class="box" style="margin:16px 0">' +
          '<div style="font-weight:700;font-size:13px;font-family:var(--mono);text-transform:uppercase;color:var(--muted);margin-bottom:8px">Automated Deployment Pipeline Flow:</div>' +
          '<ol style="margin:0;padding-left:20px;font-size:13px;line-height:1.6">' +
            dlc.flow.map(function (st) { return '<li>' + esc(st) + '</li>'; }).join('') +
          '</ol>' +
        '</div>';

      h += '<h3>The 13 Versioned AI Engineering Artifacts</h3>' +
        '<p style="max-width:68ch">Production repeatability requires explicit versioning across all 13 AI artifacts in Git, registries, and configuration stores.</p>' +
        '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr));gap:12px;margin:16px 0">';
      dlc.artifactsToVersion.forEach(function (art) {
        h += '<div style="background:var(--paper);border:1px solid var(--line2);border-radius:8px;padding:10px 12px">' +
          '<div style="font-weight:700;font-size:13px;color:var(--accent)">' + esc(art.artifact) + '</div>' +
          '<div style="font-size:12px;margin:3px 0"><code>' + esc(art.tool) + '</code></div>' +
          '<div style="font-size:11px;color:var(--muted)">' + esc(art.format) + '</div>' +
        '</div>';
      });
      h += '</div>';

      h += '<h3>Multi-Tier Environment & Promotion Strategy</h3>' +
        '<div class="tablewrap"><table class="matrix-table">' +
        '<thead><tr><th>Environment</th><th>Purpose</th><th>Typical Configuration</th></tr></thead><tbody>';
      dlc.environmentStrategy.forEach(function (env) {
        h += '<tr><td><b>' + esc(env.env) + '</b></td>' +
          '<td>' + esc(env.purpose) + '</td>' +
          '<td>' + esc(env.configuration) + '</td></tr>';
      });
      h += '</tbody></table></div>';
    }

    // 3. Live 10-Widget Operations Dashboard
    h += '<h2>3. ' + esc(op.dashboardTemplate.title) + '</h2>' +
      '<p class="fine">' + esc(op.dashboardTemplate.subtitle) + '</p>' +
      '<div class="dash-grid">';

    op.dashboardTemplate.widgets.forEach(function (w) {
      h += '<div class="dash-card">' +
        '<div class="dash-top">' +
          '<h4>' + esc(w.title) + '</h4>' +
          '<span class="status-pill ' + (w.status === 'ok' ? 'ok' : 'warn') + '">● ' + esc(w.status) + '</span>' +
        '</div>' +
        '<div class="dash-metric">' + esc(w.metric) + '</div>' +
        '<div class="dash-sub">' + esc(w.sub) + '</div>' +
        '<div class="dash-target">' + esc(w.target) + '</div>' +
        '<div style="margin-top:auto;padding-top:10px;display:flex;justify-content:space-between;align-items:center">' +
          '<button class="btn-sm" type="button" data-toggle-kql="' + w.id + '">View KQL Query ⤢</button>' +
          '<button class="btn-sm" type="button" data-copy="' + esc(w.kusto) + '">Copy KQL</button>' +
        '</div>' +
        '<div class="kql-box" id="kql-' + w.id + '" hidden>' + esc(w.kusto) + '</div>' +
      '</div>';
    });
    h += '</div>';

    // 4. Runbooks
    h += '<h2>4. Production SRE Incident Runbooks</h2>' +
      '<p style="max-width:68ch">Step-by-step remediation procedures for on-call engineers when stochastic or capacity anomalies trigger high-severity alerts.</p>';

    op.runbooks.forEach(function (rb) {
      var sevColor = rb.severity.indexOf('P1') > -1 ? 'var(--warn)' : 'var(--accent)';
      h += '<div class="box" style="margin:16px 0;border-left:5px solid ' + sevColor + '">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">' +
          '<h3>' + esc(rb.title) + '</h3>' +
          '<span class="door ' + (rb.severity.indexOf('P1') > -1 ? 'one-way' : 'two-way') + '">' + esc(rb.severity) + '</span>' +
        '</div>' +
        '<p style="margin:8px 0;color:var(--muted)"><b>Trigger Condition:</b> ' + fmt(rb.trigger) + '</p>' +
        '<h4>Remediation Steps:</h4>' +
        '<ol style="margin:8px 0;padding-left:22px">' +
        rb.steps.map(function (st) { return '<li style="margin:6px 0">' + fmt(st) + '</li>'; }).join('') +
        '</ol>' +
      '</div>';
    });

    // 5. Postmortem Template
    var pm = op.postmortemTemplate;
    h += '<h2>5. ' + esc(pm.title) + '</h2>' +
      '<p>' + fmt(pm.intro) + '</p>' +
      '<div style="margin:12px 0 8px;display:flex;justify-content:flex-end">' +
        '<button class="btn" type="button" id="copyPostmortem">Copy Postmortem Template</button>' +
      '</div>' +
      '<pre class="adr">' + esc(pm.templateMarkdown) + '</pre>';

    afterRender = function () {
      $$('button[data-toggle-kql]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = this.getAttribute('data-toggle-kql');
          var target = $('#kql-' + id);
          if (target) {
            target.hidden = !target.hidden;
            this.textContent = target.hidden ? 'View KQL Query ⤢' : 'Hide KQL Query ⤹';
          }
        });
      });
      $$('button[data-copy]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          copyText(this.getAttribute('data-copy'), this);
        });
      });
      var copyPmBtn = $('#copyPostmortem');
      if (copyPmBtn) {
        copyPmBtn.addEventListener('click', function () {
          copyText(pm.templateMarkdown, this);
        });
      }
    };

    return '<div class="wide">' + h + '</div>';
  }

  /* ---------- toolkit ---------- */
  function pageToolkit() {
    var tk = A.toolkit;
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / Manager Toolkit</div>' +
      '<h1>' + esc(tk.title) + '</h1>' +
      '<p class="lede">' + fmt(tk.lede) + '</p>';

    // Use Case Assessment
    h += '<h2>' + esc(tk.useCaseAssessment.title) + '</h2>' +
      '<p>' + fmt(tk.useCaseAssessment.intro) + '</p>' +
      '<div class="lists two" style="margin:16px 0">';
    tk.useCaseAssessment.dimensions.forEach(function (dim) {
      h += '<div class="box"><h3>' + esc(dim.category) + '</h3><ul style="margin:6px 0;padding-left:18px">' +
        dim.criteria.map(function (cr) { return '<li style="margin:5px 0"><b>' + esc(cr.name) + ':</b> ' + fmt(cr.desc) + '</li>'; }).join('') +
        '</ul></div>';
    });
    h += '</div>' +
      '<h3>Decision & Prioritization Matrix</h3>' +
      '<div class="tablewrap"><table class="matrix-table"><thead><tr><th>Score Range</th><th>Verdict</th><th>Recommended Leadership Action</th></tr></thead><tbody>' +
      tk.useCaseAssessment.scoringMatrix.map(function (row) {
        return '<tr><td><b>' + esc(row.range) + '</b></td><td><span class="door two-way">' + esc(row.verdict) + '</span></td><td>' + fmt(row.action) + '</td></tr>';
      }).join('') + '</tbody></table></div>';

    // Project Estimation
    h += '<h2>' + esc(tk.projectEstimation.title) + '</h2>' +
      '<p>' + fmt(tk.projectEstimation.intro) + '</p>' +
      '<div class="tablewrap"><table class="matrix-table"><thead><tr><th>Delivery Phase</th><th>Headcount Allocation</th><th>Core Engineering Deliverables</th></tr></thead><tbody>' +
      tk.projectEstimation.phases.map(function (p) {
        return '<tr><td><b>' + esc(p.name) + '</b></td><td><code style="color:var(--accent)">' + esc(p.alloc) + '</code></td><td>' + fmt(p.deliverables) + '</td></tr>';
      }).join('') + '</tbody></table></div>';

    // RACI Matrix
    h += '<h2>' + esc(tk.raciMatrix.title) + '</h2>' +
      '<p>' + fmt(tk.raciMatrix.intro) + '</p>' +
      '<div class="tablewrap"><table class="matrix-table"><thead><tr><th>Key Engineering Activity</th>' +
      tk.raciMatrix.roles.map(function (r) { return '<th>' + esc(r) + '</th>'; }).join('') +
      '</tr></thead><tbody>' +
      tk.raciMatrix.matrix.map(function (row) {
        function badge(r) {
          var cls = r === 'R' ? 'raci-r' : (r === 'A' ? 'raci-a' : (r === 'C' ? 'raci-c' : 'raci-i'));
          return '<span class="raci-badge ' + cls + '">' + r + '</span>';
        }
        return '<tr><td><b>' + esc(row.task) + '</b></td>' +
          row.raci.map(function (rc) { return '<td style="text-align:center">' + badge(rc) + '</td>'; }).join('') +
          '</tr>';
      }).join('') + '</tbody></table></div>' +
      '<p class="fine"><b>R</b>esponsible · <b>A</b>ccountable · <b>C</b>onsulted · <b>I</b>nformed</p>';

    // RAID Tracker
    h += '<h2>' + esc(tk.raidTracker.title) + '</h2>' +
      '<p>' + fmt(tk.raidTracker.intro) + '</p>' +
      '<div class="tablewrap"><table class="matrix-table"><thead><tr><th>Type</th><th>Risk / Assumption / Issue / Dependency</th><th>Mitigation / Validation / Resolution</th></tr></thead><tbody>' +
      tk.raidTracker.items.map(function (it) {
        var cls = it.type === 'Risk' ? 'door one-way' : (it.type === 'Issue' ? 'door mixed' : 'door two-way');
        return '<tr><td><span class="' + cls + '">' + esc(it.type) + '</span></td><td><b>' + esc(it.title) + '</b></td><td>' + fmt(it.mitigation || it.validation || it.resolution || '') + '</td></tr>';
      }).join('') + '</tbody></table></div>';

    // Quality Gates
    h += '<h2>' + esc(tk.qualityGates.title) + '</h2>' +
      '<p>' + fmt(tk.qualityGates.intro) + '</p>' +
      '<div class="grid" style="margin:16px 0">' +
      tk.qualityGates.stages.map(function (st) {
        return '<div class="box"><h3>' + esc(st.stage) + '</h3><ul style="margin:6px 0;padding-left:18px">' +
          st.criteria.map(function (c) { return '<li style="margin:6px 0">' + fmt(c) + '</li>'; }).join('') +
          '</ul></div>';
      }).join('') + '</div>';

    // Vendor Matrix
    h += '<h2>' + esc(tk.vendorMatrix.title) + '</h2>' +
      '<p>' + fmt(tk.vendorMatrix.intro) + '</p>' +
      '<div class="tablewrap"><table class="matrix-table"><thead><tr><th>Model Family</th><th>Key Strengths</th><th>Trade-offs & Latency</th><th>Best Production Fit</th></tr></thead><tbody>' +
      tk.vendorMatrix.models.map(function (m) {
        return '<tr><td><b>' + esc(m.family) + '</b></td><td><span style="color:var(--ok)">' + fmt(m.strengths) + '</span></td><td><span style="color:var(--warn)">' + fmt(m.tradeoffs) + '</span></td><td>' + fmt(m.bestFit) + '</td></tr>';
      }).join('') + '</tbody></table></div>';

    // Skills Matrix
    h += '<h2>' + esc(tk.skillsMatrix.title) + '</h2>' +
      '<p>' + fmt(tk.skillsMatrix.intro) + '</p>' +
      '<div class="tablewrap"><table class="matrix-table"><thead><tr><th>Core Competency Area</th><th>Required Technical Skills</th><th>Team Target Level</th></tr></thead><tbody>' +
      tk.skillsMatrix.competencies.map(function (c) {
        return '<tr><td><b>' + esc(c.area) + '</b></td><td>' + fmt(c.skills) + '</td><td><span class="door two-way">' + esc(c.levelTarget) + '</span></td></tr>';
      }).join('') + '</tbody></table></div>';

    // Copyable Templates
    h += '<h2>Copyable Leadership Templates</h2>' +
      '<div class="box" style="margin:16px 0">' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
          '<h3>' + esc(tk.architectureReview.title) + '</h3>' +
          '<button class="btn" type="button" id="copyArchReview">Copy Review Template</button>' +
        '</div>' +
        '<p style="margin:8px 0;color:var(--muted)">' + fmt(tk.architectureReview.intro) + '</p>' +
        '<pre class="adr" style="margin-top:10px">' + esc(tk.architectureReview.templateMarkdown) + '</pre>' +
      '</div>' +
      '<div class="box" style="margin:16px 0">' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
          '<h3>' + esc(tk.executiveReportTemplate.title) + '</h3>' +
          '<button class="btn" type="button" id="copyExecReport">Copy Executive Report</button>' +
        '</div>' +
        '<p style="margin:8px 0;color:var(--muted)">' + fmt(tk.executiveReportTemplate.intro) + '</p>' +
        '<pre class="adr" style="margin-top:10px">' + esc(tk.executiveReportTemplate.templateMarkdown) + '</pre>' +
      '</div>';

    afterRender = function () {
      var btn1 = $('#copyArchReview');
      if (btn1) btn1.addEventListener('click', function () { copyText(tk.architectureReview.templateMarkdown, this); });
      var btn2 = $('#copyExecReport');
      if (btn2) btn2.addEventListener('click', function () { copyText(tk.executiveReportTemplate.templateMarkdown, this); });
    };

    return h;
  }

  /* ---------- labs & roadmaps ---------- */
  function pageLabs() {
    var l = A.labs;
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / Labs & Roadmaps</div>' +
      '<h1>' + esc(l.title) + '</h1>' +
      '<p class="lede">' + fmt(l.lede) + '</p>';

    // Learning Paths
    h += '<h2>Role-Based Progressive Learning Roadmaps</h2>' +
      '<div class="roadmap-grid">';
    l.learningPaths.forEach(function (path) {
      h += '<div class="roadmap-card">' +
        '<div class="mini">' + esc(path.duration) + '</div>' +
        '<h3>' + esc(path.role) + '</h3>' +
        '<p style="color:var(--muted);font-size:13px">' + fmt(path.objective) + '</p>' +
        '<ul style="margin:12px 0 0;padding-left:18px;font-size:13px">' +
        path.modules.map(function (m) {
          return '<li style="margin:6px 0"><b>' + esc(m.week) + ':</b> ' + fmt(m.topics) + '</li>';
        }).join('') +
        '</ul>' +
      '</div>';
    });
    h += '</div>';

    // Hands-on Labs
    h += '<h2>Hands-on Production Labs (5 Exercises)</h2>' +
      '<p style="max-width:62ch">Step-by-step practical implementation exercises for engineering teams using the Azure Portal, CLI, and SDKs.</p>';

    l.exercises.forEach(function (ex) {
      h += '<div class="lab-card">' +
        '<div class="lab-header">' +
          '<span class="lab-level">' + esc(ex.level) + '</span>' +
          '<span class="lab-time">⏱ ' + esc(ex.time) + '</span>' +
        '</div>' +
        '<h3>' + esc(ex.title) + '</h3>' +
        '<p style="color:var(--muted)"><b>Lab Goal:</b> ' + fmt(ex.goal) + '</p>' +
        '<h4>Step-by-Step Instructions:</h4>' +
        '<ol class="lab-steps">' +
        ex.steps.map(function (st) { return '<li>' + fmt(st) + '</li>'; }).join('') +
        '</ol>' +
      '</div>';
    });

    // Microsoft Learn Hub
    h += '<h2>Official Microsoft Learn Architecture Resources</h2>' +
      '<div class="grid" style="margin:16px 0">';
    l.officialResources.forEach(function (res) {
      h += '<div class="card" style="--h:212">' +
        '<div class="mini">Documentation Hub</div>' +
        '<h3>' + esc(res.title) + '</h3>' +
        '<p>' + fmt(res.desc) + '</p>' +
        '<div style="margin-top:12px"><a href="' + esc(res.url) + '" target="_blank" rel="noopener">Open in Microsoft Learn ↗</a></div>' +
      '</div>';
    });
    h += '</div>';

    return h;
  }

  /* ---------- Architecture Advisor ---------- */
  function pageAdvisor() {
    var adv = A.advisor;
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / Interactive Tool</div>' +
      '<h1>Azure AI Architecture Advisor</h1>' +
      '<p class="lede">' + esc(adv.lede) + '</p>' +
      lifecycleNotice() +
      '<div class="callout"><b>AI Architecture Command Center</b>Answer seven workload dimensions to generate a tailored Azure AI architecture blueprint, service stack with trade-offs, security design, delivery phasing, and an executive Architecture Decision Record (ADR).</div>' +
      '<div class="shaper"><form id="advForm" class="shform">';

    adv.questions.forEach(function (q) {
      h += '<fieldset data-q="' + q.id + '"><legend>' + esc(q.label) + '</legend>' +
        q.options.map(function (o) {
          return '<label class="opt"><input type="radio" name="' + q.id + '" value="' + o[0] + '"><span>' + esc(o[1]) + '</span></label>';
        }).join('') + '</fieldset>';
    });

    h += '</form><div id="advOut" class="shout" aria-live="polite"></div></div>';
    afterRender = mountAdvisor;
    return '<div class="wide">' + h + '</div>';
  }

  function mountAdvisor() {
    var form = $('#advForm'), out = $('#advOut'), a = {};
    for (var k in A.advisor.defaults) a[k] = A.advisor.defaults[k];
    $$('input[type=radio]', form).forEach(function (r) { r.checked = a[r.name] === r.value; });

    function paint() {
      var r = A.advisor.recommend(a);
      var archObj = archById[r.arch];
      var o = '<div class="eyebrow"><span class="chip" style="--h:212">Recommended Blueprint</span></div>' +
        '<h2 style="margin-top:4px">' + esc(r.headline) + '</h2>' +
        '<p style="color:var(--muted);font-size:15px;margin:8px 0 16px">' + esc(r.rationale) + '</p>' +
        '<div style="margin-bottom:20px"><a class="btn primary" href="#/a/' + r.arch + '">View Animated Step-Through Architecture: ' + esc(archObj ? archObj.name : r.arch) + ' →</a></div>' +
        '<h3>Recommended Azure Service Stack</h3>' +
        '<ul class="stack" style="margin-top:10px">';

      r.stack.forEach(function (s) {
        var sv = byId[s.id];
        o += '<li><div><a class="svc" style="--h:' + (sv ? hueOf(sv.cat) : 212) + '" href="#/s/' + s.id + '">' + esc(sv ? sv.name : s.id) + '</a></div>' +
          '<span><b>' + esc(s.role) + ':</b> ' + esc(s.why) + ' <small style="display:block;color:var(--muted);margin-top:2px"><i>Alternative:</i> ' + esc(s.alt) + '</small></span></li>';
      });

      o += '</ul><h3>Key Decisions to Make Next</h3><ul class="nextl">';
      r.next.forEach(function (n) {
        var d = decById[n.id];
        o += '<li><a href="#/d/' + n.id + '"><b>' + esc(d ? d.title : n.id) + '</b></a>' + (d ? '<span class="door ' + d.door + '">' + d.door + '</span>' : '') + ' — <span>' + esc(n.why) + '</span></li>';
      });

      o += '</ul><h3>Critical Enterprise Risks & Mitigations</h3><ul>';
      r.risks.forEach(function (rk) { o += '<li style="margin:6px 0;font-size:14px">' + esc(rk) + '</li>'; });

      o += '</ul><h3>4-Phase Delivery & Launch Plan</h3><ol class="phases">';
      r.phases.forEach(function (p) { o += '<li>' + esc(p) + '</li>'; });

      o += '</ol><h3>Architecture Decision Record (ADR)</h3>' +
        '<p style="font-size:13px;color:var(--muted)">15-Section formal architecture decision record ready to paste into your engineering wiki or GitHub repository.</p>' +
        '<div style="margin:10px 0"><button class="btn" id="copyAdrBtn" type="button">📋 Copy Full ADR Markdown</button></div>' +
        '<pre class="adr" id="adrPre"><code>' + esc(r.adrMarkdown) + '</code></pre>';

      out.innerHTML = o;
      var copyBtn = $('#copyAdrBtn', out);
      if (copyBtn) {
        copyBtn.addEventListener('click', function () {
          navigator.clipboard.writeText(r.adrMarkdown).then(function () {
            copyBtn.textContent = '✓ Copied to Clipboard!';
            setTimeout(function () { copyBtn.textContent = '📋 Copy Full ADR Markdown'; }, 2500);
          });
        });
      }
    }

    form.addEventListener('change', function (e) {
      if (e.target.name && e.target.value) { a[e.target.name] = e.target.value; paint(); }
    });
    paint();
  }

  /* ---------- RAG Engineering Lab ---------- */
  function pageRagLab() {
    var lab = A.ragLab;
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / Engineering Lab</div>' +
      '<h1>' + esc(lab.title) + '</h1>' +
      '<p class="lede">' + esc(lab.lede) + '</p>' +
      lifecycleNotice() +
      '<div class="callout"><b>Production Grounding Playbook</b>RAG systems succeed or fail at the ingestion and retrieval layers. Compare 14 RAG architecture patterns, build robust ingestion pipelines, master chunking trade-offs, evaluate retrieval scoring algorithms, and calculate retrieval quality metrics.</div>';

    // 1. The 14 RAG Architecture Patterns Catalog
    if (lab.patterns && lab.patterns.length) {
      h += '<h2>1. The 14 RAG Architecture Patterns</h2>' +
        '<p style="max-width:68ch">From basic naive RAG to advanced Graph RAG, Agentic RAG, and Speculative RAG: patterns classified by difficulty, flow, and Azure implementation.</p>' +
        '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(360px,100%),1fr));gap:16px;margin:20px 0">';
      lab.patterns.forEach(function (p) {
        var diffHue = p.difficulty === 'Beginner' ? 150 : (p.difficulty === 'Intermediate' ? 212 : (p.difficulty === 'Advanced' ? 280 : 0));
        h += '<div class="pattern-card">' +
          '<div class="pattern-top">' +
            '<span class="pattern-num">' + esc(p.num) + '</span>' +
            '<span class="chip" style="--h:' + diffHue + '">' + esc(p.difficulty) + '</span>' +
          '</div>' +
          '<h3>' + esc(p.name) + '</h3>' +
          '<p style="font-size:13px;color:var(--muted);margin:0 0 8px"><b>Use Case:</b> ' + esc(p.useCase) + '</p>' +
          '<div class="pattern-exec" style="font-size:12px;margin:6px 0"><b>Retrieval Flow:</b> ' + esc(p.retrievalFlow) + '</div>' +
          '<div style="font-size:12px;margin:6px 0"><b>Azure Implementation:</b> <code>' + esc(p.azureImplementation) + '</code></div>' +
          '<div style="background:var(--paper);border:1px solid var(--line2);border-radius:6px;padding:8px 10px;font-size:12px;margin-top:auto">' +
            '<b>Trade-offs:</b> ' + esc(p.tradeoffs) +
          '</div>' +
        '</div>';
      });
      h += '</div>';
    }

    // 2. Enterprise Ingestion Pipeline & Production Engineering
    if (lab.ingestionPipeline) {
      var ing = lab.ingestionPipeline;
      h += '<h2>2. ' + esc(ing.title) + '</h2>' +
        '<p style="max-width:68ch">Production RAG requires robust ingestion capable of handling diverse document formats, schema drift, index rebuilding without downtime, and deduplication.</p>' +
        '<div class="box" style="margin:16px 0">' +
          '<div style="font-weight:700;font-size:12px;font-family:var(--mono);text-transform:uppercase;color:var(--muted);margin-bottom:8px">Ingestion Pipeline Stages:</div>' +
          '<ol style="margin:0;padding-left:20px;font-size:13px;line-height:1.6">' +
            ing.stages.map(function (st) { return '<li><b>' + esc(st.step.replace(/^\d+\.\s*/, '')) + '.</b> ' + esc(st.desc) + '</li>'; }).join('') +
          '</ol>' +
        '</div>';

      h += '<h3>Production Ingestion Engineering Topics</h3>' +
        '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr));gap:14px;margin:16px 0">';
      ing.productionTopics.forEach(function (pt) {
        h += '<div style="background:var(--paper);border:1px solid var(--line2);border-radius:10px;padding:12px 14px">' +
          '<h4 style="margin:0 0 6px;font-size:14px;font-weight:700;color:var(--accent)">' + esc(pt.topic) + '</h4>' +
          '<p style="margin:0;font-size:12px;line-height:1.55;color:var(--ink)">' + esc(pt.desc) + '</p>' +
        '</div>';
      });
      h += '</div>';
    }

    // 3. Search Engineering Reference
    if (lab.searchReference) {
      h += '<h2>3. ' + esc(lab.searchReference.title) + '</h2>' +
        '<p style="max-width:68ch">Azure AI Search index tuning, vector algorithms, scoring profiles, and security trimming architecture.</p>' +
        '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr));gap:14px;margin:16px 0">';
      lab.searchReference.topics.forEach(function (tp) {
        h += '<div class="card" style="--h:212">' +
          '<div class="mini">Search Engine</div>' +
          '<h3>' + esc(tp.name) + '</h3>' +
          '<p style="font-size:13px;color:var(--ink);line-height:1.55">' + esc(tp.desc) + '</p>' +
        '</div>';
      });
      h += '</div>';
    }

    // 4. Chunking Strategies Matrix
    h += '<h2>4. Document Chunking Strategies Comparison</h2>' +
      '<p style="max-width:68ch">Selecting the optimal chunking strategy balances semantic context against vector retrieval precision and storage cost.</p>' +
      '<div class="tablewrap"><table class="matrix-table">' +
      '<thead><tr><th>Strategy</th><th>Complexity</th><th>Token Range</th><th>Strengths</th><th>Weaknesses</th><th>Azure Implementation</th></tr></thead><tbody>';

    lab.chunkingStrategies.forEach(function (cs) {
      h += '<tr><td><b>' + esc(cs.name) + '</b><br><small style="color:var(--muted)">' + esc(cs.sweetSpots) + '</small></td>' +
        '<td><span class="chip" style="--h:212">' + esc(cs.complexity) + '</span></td>' +
        '<td><code>' + esc(cs.tokenRange) + '</code></td>' +
        '<td>' + esc(cs.strengths) + '</td>' +
        '<td style="color:var(--warn)">' + esc(cs.weaknesses) + '</td>' +
        '<td><small>' + esc(cs.azureImplementation) + '</small></td></tr>';
    });
    h += '</tbody></table></div>';

    // 5. Retrieval Strategies
    h += '<h2>5. Retrieval Scoring & Reranking Comparison</h2>' +
      '<p style="max-width:68ch">Production retrieval combines lexical search, dense vector similarity, and cross-encoder semantic reranking.</p>' +
      '<div class="tablewrap"><table class="matrix-table">' +
      '<thead><tr><th>Retrieval Strategy</th><th>Scoring Mechanism</th><th>Recall Impact</th><th>Latency Cost</th><th>Best Fit</th></tr></thead><tbody>';

    lab.retrievalStrategies.forEach(function (rs) {
      h += '<tr><td><b>' + esc(rs.name) + '</b></td>' +
        '<td>' + esc(rs.mechanism) + '</td>' +
        '<td><span class="chip" style="--h:150">' + esc(rs.recallImpact) + '</span></td>' +
        '<td><code>' + esc(rs.latencyCost) + '</code></td>' +
        '<td>' + esc(rs.bestFit) + '<br><small style="color:var(--muted)"><i>Limitation:</i> ' + esc(rs.limitation) + '</small></td></tr>';
    });
    h += '</tbody></table></div>';

    // 6. Evaluation Metrics Reference
    if (lab.evaluationMetrics && lab.evaluationMetrics.length) {
      h += '<h2>6. RAG Evaluation Metrics Reference</h2>' +
        '<p style="max-width:68ch">The 11 core metrics used to evaluate and gate production RAG systems.</p>' +
        '<div class="tablewrap"><table class="matrix-table">' +
        '<thead><tr><th>Metric</th><th>Illustrative Target</th><th>What It Measures</th></tr></thead><tbody>';
      lab.evaluationMetrics.forEach(function (em) {
        h += '<tr><td><b>' + esc(em.name) + '</b></td>' +
          '<td><span class="chip" style="--h:150">' + esc(em.target) + '</span></td>' +
          '<td>' + esc(em.definition) + '</td></tr>';
      });
      h += '</tbody></table></div>';
    }

    // 7. Interactive RAG Evaluation Calculator
    h += '<h2>7. Interactive RAG Quality Calculator</h2>' +
      '<p style="max-width:68ch">Enter test dataset metrics to compute Groundedness, Answer Relevance, Context Recall, and Ranking MRR.</p>' +
      '<div class="wide"><div class="calc">' +
        '<form id="ragCalcForm" class="calcform">' +
          '<fieldset><legend>Evaluation Benchmark Dataset Inputs</legend>' +
            '<label class="num"><span class="nl2">Total Test Queries Evaluated</span><span class="inp"><input type="number" id="ragQueries" value="100" min="10" step="5"></span></label>' +
            '<label class="num"><span class="nl2">Queries with Correct Context in Top-5</span><span class="inp"><input type="number" id="ragRecall5Hits" value="92" min="0" step="1"></span><small>Measures Retrieval Recall@5</small></label>' +
            '<label class="num"><span class="nl2">Verified Grounded Sentences</span><span class="inp"><input type="number" id="ragGroundedSentences" value="380" min="0" step="5"></span></label>' +
            '<label class="num"><span class="nl2">Total Generated Sentences</span><span class="inp"><input type="number" id="ragTotalSentences" value="400" min="1" step="5"></span></label>' +
            '<label class="num"><span class="nl2">Relevant Answers Addressing Question</span><span class="inp"><input type="number" id="ragRelevantAnswers" value="94" min="0" step="1"></span></label>' +
            '<label class="num"><span class="nl2">Average Rank of 1st Relevant Document</span><span class="inp"><input type="number" id="ragAvgRank" value="1.25" min="1" max="10" step="0.05"></span><small>Used to calculate Mean Reciprocal Rank (MRR)</small></label>' +
          '</fieldset>' +
        '</form>' +
        '<div id="ragCalcOut" class="calcout" aria-live="polite"></div>' +
      '</div></div>';

    // 8. Golden Benchmark Experiments
    h += '<h2>8. Reference Golden Benchmark Experiments</h2>' +
      '<p style="max-width:68ch">Comparative results on an enterprise corpus of 5,000 PDF policy documents across five retrieval configurations.</p>' +
      '<div class="tablewrap"><table class="matrix-table">' +
      '<thead><tr><th>Configuration</th><th>Chunking Setup</th><th>Retrieval Pipeline</th><th>Groundedness</th><th>Recall@5</th><th>Latency (P95)</th><th>Cost / 1k</th></tr></thead><tbody>';

    lab.benchmarkExperiments.forEach(function (exp) {
      h += '<tr><td><b>' + esc(exp.name) + '</b><br><small style="color:var(--muted)">' + esc(exp.verdict) + '</small></td>' +
        '<td>' + esc(exp.chunking) + '</td>' +
        '<td>' + esc(exp.retrieval) + '</td>' +
        '<td><span class="status-pill ' + (exp.groundedness >= 95 ? 'ok' : 'warn') + '">' + exp.groundedness + '%</span></td>' +
        '<td>' + exp.recall5 + '%</td>' +
        '<td><code>' + exp.latencyMs + 'ms</code></td>' +
        '<td><b>$' + exp.costPer1k.toFixed(2) + '</b></td></tr>';
    });
    h += '</tbody></table></div>';

    afterRender = mountRagLab;
    return '<div class="wide">' + h + '</div>';
  }

  function mountRagLab() {
    var form = $('#ragCalcForm'), out = $('#ragCalcOut');
    if (!form || !out) return;

    function recalc() {
      var q = parseFloat($('#ragQueries').value) || 100;
      var r5 = parseFloat($('#ragRecall5Hits').value) || 0;
      var gs = parseFloat($('#ragGroundedSentences').value) || 0;
      var ts = parseFloat($('#ragTotalSentences').value) || 1;
      var ra = parseFloat($('#ragRelevantAnswers').value) || 0;
      var rank = parseFloat($('#ragAvgRank').value) || 1.25;

      var groundednessPct = Math.min(100, Math.round((gs / ts) * 100));
      var relevancePct = Math.min(100, Math.round((ra / q) * 100));
      var recall5Pct = Math.min(100, Math.round((r5 / q) * 100));
      var mrr = (1 / Math.max(1, rank)).toFixed(2);
      var ndcg5 = Math.min(0.99, (0.75 + (recall5Pct / 400))).toFixed(2);

      out.innerHTML = '<div class="eyebrow"><span class="chip" style="--h:150">RAG Scorecard</span></div>' +
        '<div class="kpis" style="margin-top:12px">' +
          '<div class="kpi"><small>Groundedness</small><b style="color:' + (groundednessPct >= 95 ? 'var(--ok)' : 'var(--warn)') + '">' + groundednessPct + '%</b><span class="fine">Target: >95%</span></div>' +
          '<div class="kpi"><small>Answer Relevance</small><b style="color:' + (relevancePct >= 90 ? 'var(--ok)' : 'var(--warn)') + '">' + relevancePct + '%</b><span class="fine">Target: >90%</span></div>' +
          '<div class="kpi"><small>Recall@5</small><b style="color:' + (recall5Pct >= 90 ? 'var(--ok)' : 'var(--warn)') + '">' + recall5Pct + '%</b><span class="fine">Target: >92%</span></div>' +
          '<div class="kpi"><small>MRR (Reciprocal Rank)</small><b>' + mrr + '</b><span class="fine">Target: >0.80</span></div>' +
          '<div class="kpi"><small>Estimated NDCG@5</small><b>' + ndcg5 + '</b><span class="fine">Target: >0.85</span></div>' +
        '</div>' +
        '<div class="callout" style="margin-top:16px">' +
          '<b>Production Release Gate Status</b>' +
          (groundednessPct >= 95 && relevancePct >= 90 && recall5Pct >= 90 ?
            '<span style="color:var(--ok);font-weight:700">✓ PASSED: Meets enterprise quality criteria for production launch.</span>' :
            '<span style="color:var(--warn);font-weight:700">⚠ ATTENTION: Quality metrics below enterprise threshold. Improve chunking boundaries or enable Semantic Ranker before launch.</span>') +
        '</div>';
    }

    form.addEventListener('input', recalc);
    recalc();
  }

  /* ---------- Agent Pattern Explorer ---------- */
  function pageAgentPatterns() {
    var ap = A.agentPatterns;
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / Agentic AI</div>' +
      '<h1>' + esc(ap.title) + '</h1>' +
      '<p class="lede">' + esc(ap.lede) + '</p>' +
      lifecycleNotice() +
      '<div class="callout"><b>Agent Design Catalog</b>A comprehensive catalog of 18 architectural patterns for autonomous agents and multi-agent systems, complete with execution flows, Azure implementations, trade-offs, and framework selection matrices.</div>';

    // 1. Agent Fundamentals & Distinctions
    if (ap.fundamentals) {
      h += '<h2>1. ' + esc(ap.fundamentals.title) + '</h2>' +
        '<p style="max-width:68ch">Distinguishing between raw foundation models, conversational chatbots, deterministic workflows, and true autonomous agent systems.</p>' +
        '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr));gap:14px;margin:16px 0">';
      ap.fundamentals.concepts.forEach(function (cp) {
        var lines = String(cp.desc).split('\n').filter(Boolean);
        var bullets = lines.length > 1;
        h += '<div class="card" style="--h:212"><div class="mini">Fundamental</div><h3>' + esc(cp.concept) + '</h3>' +
          (bullets
            ? '<ul style="margin:8px 0;padding-left:18px;font-size:13px;line-height:1.55">' + lines.map(function (l) { return '<li style="margin:5px 0">' + esc(l.replace(/^[•\-]\s*/, '')) + '</li>'; }).join('') + '</ul>'
            : '<p style="font-size:13px;line-height:1.55;color:var(--ink)">' + esc(cp.desc) + '</p>') +
        '</div>';
      });
      h += '</div>';
    }

    // 2. The 18 Agent Patterns Grid
    h += '<h2>2. The 18 Agent Architecture Patterns</h2>' +
      '<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(min(380px,100%),1fr));gap:16px;margin:20px 0">';

    ap.patterns.forEach(function (p) {
      h += '<div class="pattern-card">' +
        '<div class="pattern-top">' +
          '<span class="pattern-num">' + esc(p.num) + '</span>' +
          '<span class="pattern-flow">' + esc(p.flowType) + '</span>' +
        '</div>' +
        '<h3>' + esc(p.name) + '</h3>' +
        '<p style="color:var(--muted);font-size:14px;margin:0">' + esc(p.summary) + '</p>' +
        '<div class="pattern-exec">' + esc(p.execution) + '</div>' +
        '<div class="pattern-meta">' +
          '<div><b>Azure Implementation:</b> ' + esc(p.azureImplementation) + '</div>' +
          '<div><b>Trade-offs:</b> ' + esc(p.tradeoffs) + '</div>' +
          '<div><b style="color:var(--ok)">Best Enterprise Fit:</b> ' + esc(p.bestFit) + '</div>' +
        '</div>' +
      '</div>';
    });
    h += '</div>';

    // 3. Framework Decision Matrix
    h += '<h2>3. Agent Frameworks & Runtimes Comparison</h2>' +
      '<div class="tablewrap"><table class="matrix-table">' +
      '<thead><tr><th>Framework</th><th>Type & Architecture</th><th>Maturity</th><th>Key Strengths</th><th>Weaknesses & Trade-offs</th><th>Best Use Case</th></tr></thead><tbody>';

    ap.frameworks.forEach(function (fw) {
      h += '<tr><td><b>' + esc(fw.name) + '</b></td>' +
        '<td>' + esc(fw.type) + '</td>' +
        '<td><span class="chip" style="--h:212">' + esc(fw.maturity) + '</span></td>' +
        '<td>' + esc(fw.strengths) + '</td>' +
        '<td style="color:var(--warn)">' + esc(fw.weaknesses) + '</td>' +
        '<td><b>' + esc(fw.bestUse) + '</b></td></tr>';
    });
    h += '</tbody></table></div>';

    // 4. Orchestration Primitives
    if (ap.orchestrationPrimitives) {
      h += '<h2>4. ' + esc(ap.orchestrationPrimitives.title) + '</h2>' +
        '<p style="max-width:68ch">The foundational structural building blocks used to orchestrate multi-agent workflows.</p>' +
        '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr));gap:14px;margin:16px 0">';
      ap.orchestrationPrimitives.primitives.forEach(function (op) {
        h += '<div class="card" style="--h:280">' +
          '<div class="mini">Primitive</div>' +
          '<h3>' + esc(op.name) + '</h3>' +
          '<p style="font-size:13px;color:var(--ink);margin:4px 0">' + esc(op.desc) + '</p>' +
        '</div>';
      });
      h += '</div>';
    }

    // 5. Orchestration Comparison Table
    h += '<h2>5. Multi-Agent Orchestration Patterns Trade-offs</h2>' +
      '<div class="tablewrap"><table class="matrix-table">' +
      '<thead><tr><th>Pattern</th><th>Determinism</th><th>Latency</th><th>Token Cost</th><th>Debuggability</th><th>Recommended Workload</th></tr></thead><tbody>';

    ap.orchestrationComparison.forEach(function (oc) {
      h += '<tr><td><b>' + esc(oc.pattern) + '</b></td>' +
        '<td>' + esc(oc.determinism) + '</td>' +
        '<td><code>' + esc(oc.latency) + '</code></td>' +
        '<td>' + esc(oc.cost) + '</td>' +
        '<td>' + esc(oc.debuggability) + '</td>' +
        '<td>' + esc(oc.bestFit) + '</td></tr>';
    });
    h += '</tbody></table></div>';

    return '<div class="wide">' + h + '</div>';
  }

  /* ---------- AI Security & Governance Center ---------- */
  function pageSecurityCenter() {
    var sec = A.securityCenter;
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / Security & Risk</div>' +
      '<h1>' + esc(sec.title) + '</h1>' +
      '<p class="lede">' + esc(sec.lede) + '</p>' +
      '<div class="callout"><b>Enterprise Zero-Trust AI Framework</b>Deploying generative AI into regulated enterprises requires defense-in-depth across identity, network perimeter, data protection, agent blast radius, and automated regulatory governance gates.</div>';

    // 12 Threat Catalog Cards
    h += '<h2>1. AI Threat Catalog (OWASP Top 10 for LLMs)</h2>' +
      '<p style="max-width:68ch">Threat modeling and concrete Azure native mitigations for the 12 most dangerous AI attack vectors.</p>' +
      '<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(min(380px,100%),1fr));gap:16px;margin:20px 0">';

    sec.threatCatalog.forEach(function (th) {
      var sevClass = th.severity === 'Critical' ? 'crit' : (th.severity === 'High' ? 'high' : 'med');
      h += '<div class="card" style="--h:6">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">' +
          '<span class="sev ' + sevClass + '">' + esc(th.severity) + '</span>' +
          '<code style="font-size:11px">' + esc(th.owaspRef) + '</code>' +
        '</div>' +
        '<h3 style="margin:8px 0 6px">' + esc(th.name) + '</h3>' +
        '<p style="font-size:13px;color:var(--ink);margin-bottom:8px"><b>Attack Vector:</b> ' + esc(th.attackVector) + '</p>' +
        '<p style="font-size:13px;color:var(--ok)"><b>Azure Native Mitigation:</b> ' + esc(th.azureMitigations) + '</p>' +
        '<p style="font-size:12px;color:var(--muted)"><b>Verification:</b> ' + esc(th.verification) + '</p>' +
      '</div>';
    });
    h += '</div>';

    // Interactive 10-Gate AI Governance Checklist
    h += '<h2>2. The 10-Gate AI Governance Release Checklist</h2>' +
      '<p style="max-width:68ch">Mandatory architectural and compliance gates required before promoting an AI solution to production.</p>' +
      '<div id="govScoreBox" class="callout" style="margin:16px 0"></div>' +
      '<ul class="chklist" id="govChecklist">';

    sec.governanceGates.forEach(function (g, i) {
      h += '<li><label class="chk"><input type="checkbox" data-gate="' + i + '" class="gov-chk">' +
        '<span><span class="t">' + esc(g.gate) + ': ' + esc(g.name) + ' <small class="chip" style="--h:212">' + esc(g.category) + '</small></span>' +
        '<span class="w">' + esc(g.question) + '</span>' +
        '<span class="s" style="color:var(--muted)"><b>Required Evidence:</b> ' + esc(g.evidence) + '</span></span></label></li>';
    });
    h += '</ul>';

    afterRender = mountSecurityCenter;
    return '<div class="wide">' + h + '</div>';
  }

  function mountSecurityCenter() {
    var list = $('#govChecklist'), box = $('#govScoreBox');
    if (!list || !box) return;
    var chks = $$('.gov-chk', list);

    function updateScore() {
      var passed = chks.filter(function (c) { return c.checked; }).length;
      var total = chks.length;
      var pct = Math.round((passed / total) * 100);

      box.innerHTML = '<b>Governance Readiness Score: ' + passed + ' / ' + total + ' Gates Passed (' + pct + '%)</b>' +
        '<div class="track" style="margin:8px 0 10px"><div class="fill" style="width:' + pct + '%;background:' + (pct >= 80 ? 'var(--ok)' : (pct >= 50 ? 'var(--warn)' : 'hsl(0 75% 50%)')) + '"></div></div>' +
        (pct === 100 ?
          '<span style="color:var(--ok);font-weight:700">✓ Fully Approved for Enterprise Production Release</span>' :
          '<span style="color:var(--muted)">Complete all gates and document required audit evidence before formal launch review.</span>');
    }

    list.addEventListener('change', updateScore);
    updateScore();
  }

  /* ---------- AI Evaluation & Quality Center ---------- */
  function pageEvaluationCenter() {
    var ec = A.evaluationCenter;
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / Quality Engineering</div>' +
      '<h1>' + esc(ec.title) + '</h1>' +
      '<p class="lede">' + esc(ec.lede) + '</p>' +
      '<div class="callout"><b>Scientific AI Quality Engineering</b>Probabilistic AI systems require moving beyond informal spot-checks to automated evaluation pyramids, statistical test sets, and configurable release quality gates.</div>';

    // 7-Level AI Testing Pyramid
    h += '<h2>1. The 7-Level AI Testing Pyramid</h2>' +
      '<div class="pyramid">';
    ec.testingPyramid.forEach(function (pyr) {
      h += '<div class="pyr-level">' +
        '<span class="pyr-tag">' + esc(pyr.level) + '</span>' +
        '<div class="pyr-body">' +
          '<b>' + esc(pyr.name) + ' <small style="font-weight:400;color:var(--muted)">(' + esc(pyr.frequency) + ')</small></b>' +
          '<span>' + esc(pyr.scope) + '</span>' +
          '<span style="margin-top:3px;font-size:12px;font-family:var(--mono)"><b>Tooling:</b> ' + esc(pyr.tooling) + '</span>' +
        '</div>' +
        '<span class="pyr-crit">' + esc(pyr.passCriteria) + '</span>' +
      '</div>';
    });
    h += '</div>';

    // 14 Evaluation Categories
    h += '<h2>2. The 14 Dimensions of AI Quality Evaluation</h2>' +
      '<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(min(260px,100%),1fr));gap:12px;margin:16px 0">';
    ec.evaluationCategories.forEach(function (cat) {
      h += '<div class="card" style="--h:212"><div class="mini">Evaluation Metric</div><h3>' + esc(cat.category) + '</h3><p>' + esc(cat.focus) + '</p></div>';
    });
    h += '</div>';

    // Agent Specific Metrics
    h += '<h2>3. Autonomous Agent Evaluation Metrics</h2>' +
      '<div class="tablewrap"><table class="matrix-table">' +
      '<thead><tr><th>Agent Metric</th><th>Measurement Definition</th><th>Target Benchmark</th></tr></thead><tbody>';
    ec.agentMetrics.forEach(function (am) {
      h += '<tr><td><b>' + esc(am.metric) + '</b></td><td>' + esc(am.desc) + '</td><td><span class="chip" style="--h:150">' + esc(am.benchmark) + '</span></td></tr>';
    });
    h += '</tbody></table></div>';

    // Evaluation Frameworks Comparison
    h += '<h2>4. Evaluation Frameworks & Tooling</h2>' +
      '<div class="tablewrap"><table class="matrix-table">' +
      '<thead><tr><th>Framework</th><th>Category</th><th>Key Strengths</th><th>Best Use Case</th></tr></thead><tbody>';
    ec.frameworks.forEach(function (fw) {
      h += '<tr><td><b>' + esc(fw.name) + '</b></td><td>' + esc(fw.type) + '</td><td>' + esc(fw.strengths) + '</td><td><b>' + esc(fw.bestFit) + '</b></td></tr>';
    });
    h += '</tbody></table></div>';

    // Interactive Quality Release Gate Calculator
    h += '<h2>5. Interactive Release Quality Gate Calculator</h2>' +
      '<p style="max-width:68ch">Select application risk tier and adjust slider metrics to test whether your AI feature passes the release gate.</p>' +
      '<div class="wide"><div class="calc">' +
        '<form id="evalGateForm" class="calcform">' +
          '<fieldset><legend>Select Application Risk Tier</legend>' +
            '<div class="btns" style="margin-bottom:12px">' +
              '<button type="button" class="btn btn-sm subtab active" data-tier="0">Tier 1: Internal Low-Risk</button>' +
              '<button type="button" class="btn btn-sm subtab" data-tier="1">Tier 2: Customer Enterprise</button>' +
              '<button type="button" class="btn btn-sm subtab" data-tier="2">Tier 3: Mission-Critical</button>' +
            '</div>' +
            '<div class="slider-group">' +
              '<div class="slider-row"><label for="slGrounded">Groundedness Score (%)</label><input type="range" id="slGrounded" min="70" max="100" value="96"><span class="slider-val" id="valGrounded">96%</span></div>' +
              '<div class="slider-row"><label for="slRelevance">Answer Relevance (%)</label><input type="range" id="slRelevance" min="70" max="100" value="92"><span class="slider-val" id="valRelevance">92%</span></div>' +
              '<div class="slider-row"><label for="slLatency">P95 Response Latency (ms)</label><input type="range" id="slLatency" min="500" max="5000" step="100" value="1800"><span class="slider-val" id="valLatency">1800ms</span></div>' +
              '<div class="slider-row"><label for="slTool">Tool Call Accuracy (%)</label><input type="range" id="slTool" min="70" max="100" value="97"><span class="slider-val" id="valTool">97%</span></div>' +
              '<div class="slider-row"><label for="slPromptDef">Prompt Shield Defense (%)</label><input type="range" id="slPromptDef" min="70" max="100" value="99"><span class="slider-val" id="valPromptDef">99%</span></div>' +
            '</div>' +
          '</fieldset>' +
        '</form>' +
        '<div id="evalGateOut" class="calcout" aria-live="polite"></div>' +
      '</div></div>';

    afterRender = mountEvaluationCenter;
    return '<div class="wide">' + h + '</div>';
  }

  function mountEvaluationCenter() {
    var form = $('#evalGateForm'), out = $('#evalGateOut');
    if (!form || !out) return;
    var currentTier = 1; // default Tier 2

    var tierBtns = $$('[data-tier]', form);
    tierBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        tierBtns.forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        currentTier = parseInt(b.getAttribute('data-tier'), 10);
        checkGate();
      });
    });

    var sliders = ['slGrounded', 'slRelevance', 'slLatency', 'slTool', 'slPromptDef'];
    sliders.forEach(function (id) {
      var sl = $('#' + id);
      sl.addEventListener('input', function () {
        $('#' + id.replace('sl', 'val')).textContent = sl.value + (id === 'slLatency' ? 'ms' : '%');
        checkGate();
      });
    });

    function checkGate() {
      var tierObj = A.evaluationCenter.qualityGates[currentTier];
      var g = parseFloat($('#slGrounded').value);
      var r = parseFloat($('#slRelevance').value);
      var l = parseFloat($('#slLatency').value);
      var t = parseFloat($('#slTool').value);
      var p = parseFloat($('#slPromptDef').value);

      var passG = g >= tierObj.requirements.groundedness;
      var passR = r >= tierObj.requirements.relevance;
      var passL = l <= tierObj.requirements.p95LatencyMs;
      var passT = t >= tierObj.requirements.toolAccuracy;
      var passP = p >= tierObj.requirements.promptInjectionBlock;

      var allPassed = passG && passR && passL && passT && passP;

      out.innerHTML = '<div class="eyebrow"><span class="chip" style="--h:212">' + esc(tierObj.tier) + '</span></div>' +
        '<h3 style="margin-top:4px">' + (allPassed ? '<span style="color:var(--ok)">✓ Release Gate Passed</span>' : '<span style="color:var(--warn)">✗ Release Gate Blocked</span>') + '</h3>' +
        '<p style="font-size:13px;color:var(--muted)">' + esc(tierObj.description) + '</p>' +
        '<div class="tablewrap"><table class="matrix-table" style="font-size:12px;margin:12px 0">' +
          '<thead><tr><th>Dimension</th><th>Target Threshold</th><th>Actual Score</th><th>Status</th></tr></thead>' +
          '<tbody>' +
            '<tr><td>Groundedness</td><td>&ge; ' + tierObj.requirements.groundedness + '%</td><td>' + g + '%</td><td><span class="status-pill ' + (passG ? 'ok' : 'warn') + '">' + (passG ? 'PASS' : 'FAIL') + '</span></td></tr>' +
            '<tr><td>Relevance</td><td>&ge; ' + tierObj.requirements.relevance + '%</td><td>' + r + '%</td><td><span class="status-pill ' + (passR ? 'ok' : 'warn') + '">' + (passR ? 'PASS' : 'FAIL') + '</span></td></tr>' +
            '<tr><td>P95 Latency</td><td>&le; ' + tierObj.requirements.p95LatencyMs + 'ms</td><td>' + l + 'ms</td><td><span class="status-pill ' + (passL ? 'ok' : 'warn') + '">' + (passL ? 'PASS' : 'FAIL') + '</span></td></tr>' +
            '<tr><td>Tool Accuracy</td><td>&ge; ' + tierObj.requirements.toolAccuracy + '%</td><td>' + t + '%</td><td><span class="status-pill ' + (passT ? 'ok' : 'warn') + '">' + (passT ? 'PASS' : 'FAIL') + '</span></td></tr>' +
            '<tr><td>Prompt Defense</td><td>&ge; ' + tierObj.requirements.promptInjectionBlock + '%</td><td>' + p + '%</td><td><span class="status-pill ' + (passP ? 'ok' : 'warn') + '">' + (passP ? 'PASS' : 'FAIL') + '</span></td></tr>' +
          '</tbody>' +
        '</table></div>' +
        '<div class="callout" style="margin-top:12px">' +
          (allPassed ?
            '<b>Certificate of Release Readiness</b>Model and prompt configuration meet all statistical benchmarks for ' + esc(tierObj.tier) + '. Ready to proceed to canary release.' :
            '<b>Remediation Required</b>Resolve failed dimensions before deployment. Check retrieval chunking or add APIM multi-region pooling to address latency.') +
        '</div>';
    }

    checkGate();
  }

  /* Model lifecycle record from the verification registry (null when the model was not verified). */
  function lifecycleOf(key) {
    var v = A.verification, list = (v && v.modelLifecycle) || [];
    for (var i = 0; i < list.length; i++) if (list[i].key === key) return list[i];
    return null;
  }
  function lifecycleChip(key) {
    var r = lifecycleOf(key);
    if (!r) return '<span class="chip" style="--h:30" title="Not checked against the Microsoft model retirement table">lifecycle unverified</span>';
    var tip = 'Retirement: ' + r.retirement + (r.replacement ? ' · Replacement: ' + r.replacement : '') + ' · Verified ' + A.verification.modelLifecycleVerified;
    return '<span class="chip" style="--h:' + (/deprecated|legacy/i.test(r.lifecycle) ? 20 : 150) + '" title="' + esc(tip) + '">' + esc(r.lifecycle) + '</span>';
  }
  /* Shared notice: how fresh the model facts on a page are, with the source. */
  function lifecycleNotice() {
    var v = A.verification; if (!v) return '';
    return '<div class="callout warn" role="note"><b>Model names and lifecycle change</b>Model availability, retirement dates and replacements below were checked against ' +
      '<a href="' + esc(v.sources[v.modelLifecycleSource].url) + '" rel="noopener">Microsoft’s model retirement table</a> on <strong>' + esc(v.modelLifecycleVerified) +
      '</strong>. Pages in the Atlas describe model <i>tiers</i> (frontier, small, reasoning) rather than specific model names, because names and retirement dates change. Choose current models from the Microsoft catalog and re-check the retirement table before you commit. Check <a href="#/freshness">what has and has not been verified</a>.</div>';
  }

  function numField(f, val) {
    return '<label class="num"><span class="nl2">' + esc(f.label) + '</span><span class="inp"><input type="number" inputmode="decimal" id="' + f.id + '" value="' + val + '" min="' + f.min + '"' +
      (f.max != null ? ' max="' + f.max + '"' : '') + ' step="' + f.step + '" aria-describedby="' + f.id + 'Err"></span>' +
      (f.hint ? '<small>' + esc(f.hint) + '</small>' : '') + '<small class="field-err" id="' + f.id + 'Err" role="alert"></small></label>';
  }
  /* Reads and validates a field set. Empty, non-numeric or out-of-range values are errors; 0 is valid when min <= 0. */
  function readFields(fields) {
    var vals = {}, errs = [];
    fields.forEach(function (f) {
      var el = $('#' + f.id), raw = el.value.trim(), n = raw === '' ? NaN : Number(raw), msg = '';
      if (isNaN(n)) msg = 'Enter a number.';
      else if (n < f.min) msg = 'Must be at least ' + f.min + '.';
      else if (f.max != null && n > f.max) msg = 'Must be at most ' + f.max + '.';
      $('#' + f.id + 'Err').textContent = msg;
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg) errs.push(f.label + ': ' + msg); else vals[f.key] = n;
    });
    return { vals: vals, errs: errs };
  }

  var TCO_FIELDS = [
    { id: 'tcoUsers', key: 'users', label: 'Active daily users', min: 0, step: 50 },
    { id: 'tcoQueries', key: 'queriesPerUserDay', label: 'Queries per user per day', min: 0, step: 1 },
    { id: 'tcoDays', key: 'daysPerMonth', label: 'Active days per month', min: 1, max: 31, step: 0.5 },
    { id: 'tcoInputTokens', key: 'inputTokens', label: 'Input tokens per query', min: 0, step: 100, hint: 'System prompt + question + retrieved chunks' },
    { id: 'tcoOutputTokens', key: 'outputTokens', label: 'Output tokens per query', min: 0, step: 50 },
    { id: 'tcoCacheHit', key: 'cacheHitPct', label: 'Prompt cache hit rate (%)', min: 0, max: 100, step: 5, hint: '0 is valid: no caching' },
    { id: 'tcoInPrice', key: 'inputPer1M', label: 'Input price ($ per 1M tokens)', min: 0, step: 0.01, hint: 'Editable. Check your price sheet.' },
    { id: 'tcoCachedPrice', key: 'cachedPer1M', label: 'Cached input price ($ per 1M)', min: 0, step: 0.01 },
    { id: 'tcoOutPrice', key: 'outputPer1M', label: 'Output price ($ per 1M tokens)', min: 0, step: 0.01 },
    { id: 'tcoSearchCost', key: 'searchMonthly', label: 'Azure AI Search ($ per month)', min: 0, step: 10, hint: 'Your tier × replicas × partitions at your Region’s price' },
    { id: 'tcoHostCost', key: 'hostingMonthly', label: 'App hosting ($ per month)', min: 0, step: 10 },
    { id: 'tcoStateCost', key: 'stateMonthly', label: 'State / database ($ per month)', min: 0, step: 5 },
    { id: 'tcoTelemetry', key: 'telemetryPer1kQueries', label: 'Telemetry ($ per 1,000 queries)', min: 0, step: 0.01 }
  ];
  var ROI_FIELDS = [
    { id: 'roiEmployees', key: 'employees', label: 'Employees affected', min: 0, step: 10 },
    { id: 'roiHours', key: 'hoursSavedWeekly', label: 'Hours saved per employee per week', min: 0, max: 40, step: 0.5, hint: 'Measure this in a pilot; do not assume it' },
    { id: 'roiWage', key: 'hourlyWage', label: 'Fully burdened hourly cost ($)', min: 0, step: 5 },
    { id: 'roiWeeks', key: 'weeksPerYear', label: 'Working weeks per year', min: 1, max: 52, step: 1 },
    { id: 'roiDirect', key: 'directCostSavings', label: 'Direct cost reductions ($ / year)', min: 0, step: 5000 },
    { id: 'roiCloud', key: 'annualCloudCost', label: 'Annual cloud and token spend ($)', min: 0, step: 5000, hint: 'Use the TCO calculator × 12' },
    { id: 'roiMaint', key: 'annualEngineeringMaintenance', label: 'Annual engineering and operations ($)', min: 0, step: 5000 },
    { id: 'roiBuild', key: 'oneTimeBuildCost', label: 'One-time build cost ($)', min: 0, step: 10000, hint: 'Counted in year 1 so payback is not flattered' },
    { id: 'roiDiscount', key: 'realizationDiscountPct', label: 'Benefit realization discount (%)', min: 0, max: 100, step: 5, hint: 'Share of benefit you expect not to materialise' }
  ];

  /* ---------- AI FinOps ---------- */
  function pageFinOps() {
    var fo = A.finops, ps = fo.priceStatus || {};
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / Cost & FinOps</div>' +
      '<h1>' + esc(fo.title) + '</h1>' +
      '<p class="lede">' + esc(fo.lede) + '</p>' +
      '<div class="callout warn" role="note"><b>Estimates, not Azure quotes</b>Prices on this page are <strong>illustrative and not sourced or dated</strong>. ' + esc(ps.note || '') +
      ' Use the <a href="' + esc(ps.officialPricing || 'https://azure.microsoft.com/pricing/') + '" rel="noopener">official Azure pricing page</a> or the Azure Pricing Calculator for numbers you will budget against, and overwrite the price fields below.</div>' +
      lifecycleNotice();

    h += '<h2>1. Model price reference (illustrative)</h2>' +
      '<p style="max-width:70ch">These rows show the <i>shape</i> of token pricing (cached input is cheaper, output costs several times input). They list older models still named in the retirement table, so check the lifecycle column before using one, and use your own deployment’s prices in the calculator.</p>' +
      '<div class="tablewrap"><table class="matrix-table">' +
      '<caption class="sr-only">Illustrative model prices per million tokens with lifecycle status</caption>' +
      '<thead><tr><th scope="col">Model</th><th scope="col">Lifecycle</th><th scope="col">Input / 1M</th><th scope="col">Cached input / 1M</th><th scope="col">Output / 1M</th><th scope="col">Batch</th><th scope="col">Workload fit</th></tr></thead><tbody>';
    fo.modelPricing.forEach(function (m) {
      h += '<tr><th scope="row">' + esc(m.name) + '</th><td>' + lifecycleChip(m.lifecycleKey) + '</td>' +
        '<td>$' + m.input1M.toFixed(2) + '</td><td>$' + m.cached1M.toFixed(2) + '</td><td>$' + m.output1M.toFixed(2) + '</td>' +
        '<td>' + (m.batchDiscount > 0 ? Math.round(m.batchDiscount * 100) + '% off (check eligibility)' : 'n/a') + '</td><td><small>' + esc(m.bestFor) + '</small></td></tr>';
    });
    h += '</tbody></table></div>';

    h += '<h2>2. Azure AI Search tier limits (verified ' + esc(fo.searchTiersSource.verified) + ')</h2>' +
      '<p style="max-width:68ch">Storage per partition from <a href="' + esc(fo.searchTiersSource.url) + '" rel="noopener">' + esc(fo.searchTiersSource.title) + '</a>. Limits differ for services created before the 2024–2025 capacity increases (shown as “legacy”). Search prices are not listed here because they vary by Region; enter yours in the calculator.</p>' +
      '<div class="tablewrap"><table class="matrix-table"><thead><tr><th scope="col">Tier</th><th scope="col">Storage / partition</th><th scope="col">Legacy storage / partition</th><th scope="col">Max partitions</th><th scope="col">Max replicas</th><th scope="col">Best for</th></tr></thead><tbody>';
    fo.searchTiers.forEach(function (t) {
      h += '<tr><th scope="row">' + esc(t.tier) + '</th><td>' + t.storagePerPartitionGB + ' GB</td><td>' + t.legacyStoragePerPartitionGB + ' GB</td><td>' + t.maxPartitions + '</td><td>' + t.maxReplicas + '</td><td><small>' + esc(t.bestFor) + '</small></td></tr>';
    });
    h += '</tbody></table></div>';

    h += '<h2>3. Monthly TCO calculator</h2>' +
      '<p style="max-width:68ch">Every input is editable, 0 is accepted where it makes sense, and the formulas are shown under the results.</p>' +
      '<div class="wide"><div class="calc"><form id="tcoForm" class="calcform" novalidate>' +
        '<fieldset><legend>Workload</legend>' +
          '<label class="num"><span class="nl2">Start from</span><span class="inp"><select id="tcoModel"><option value="custom">Custom: enter your own deployment prices</option>' +
            fo.modelPricing.filter(function (x) { return x.output1M > 0; }).map(function (m) { return '<option value="' + esc(m.id) + '">' + esc(m.name) + '</option>'; }).join('') +
          '</select></span><small>Fills the three price fields; you can then overwrite them.</small></label>' +
          TCO_FIELDS.slice(0, 6).map(function (f) { return numField(f, fo.tcoDefaults[f.key]); }).join('') +
        '</fieldset>' +
        '<fieldset><legend>Prices and fixed costs (overwrite with your own)</legend>' +
          TCO_FIELDS.slice(6).map(function (f) { return numField(f, fo.tcoDefaults[f.key]); }).join('') +
        '</fieldset>' +
        '<p><button type="button" class="btn" id="tcoReset">Reset to defaults</button></p>' +
      '</form><div id="tcoOut" class="calcout" aria-live="polite"></div></div></div>';

    h += '<h2>4. Scale profiles (illustrative)</h2>' +
      '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(250px,100%),1fr));gap:14px;margin:18px 0">';
    fo.scaleProfiles.forEach(function (sp) {
      h += '<div class="card" style="--h:212"><div class="mini">Scale profile</div><h3>' + esc(sp.name) + '</h3>' +
        '<div style="font:700 22px var(--serif);color:var(--accent);margin:4px 0">' + esc(sp.estimatedMonthlyTCO) + '</div>' +
        '<p style="font-size:13px;color:var(--muted)"><b>' + sp.users.toLocaleString() + ' users</b> · ' + esc(String(sp.dailyQueries)) + ' queries/day<br><b>Tokens:</b> ' + esc(sp.monthlyTokens) + '<br><b>Cost/task:</b> ' + esc(sp.costPerTask) + '</p>' +
        '<p style="font-size:12px;margin-top:8px"><i>Assumptions:</i> ' + esc(sp.assumptions) + '</p></div>';
    });
    h += '</div>';

    h += '<h2>5. ROI model</h2>' +
      '<p style="max-width:68ch">A year-1 view that includes the one-time build cost. The defaults are placeholders for a large internal assistant, not a benchmark; replace them with measured pilot data before showing the result to anyone.</p>' +
      '<div class="wide"><div class="calc"><form id="roiForm" class="calcform" novalidate>' +
        '<fieldset><legend>Benefit and cost inputs</legend>' + ROI_FIELDS.map(function (f) { return numField(f, fo.roiDefaults[f.key]); }).join('') +
        '<p><button type="button" class="btn" id="roiReset">Reset to defaults</button></p></fieldset>' +
      '</form><div id="roiOut" class="calcout" aria-live="polite"></div></div></div>';

    afterRender = mountFinOps;
    return '<div class="wide">' + h + '</div>';
  }

  function mountFinOps() {
    var fo = A.finops, tcoForm = $('#tcoForm'), roiForm = $('#roiForm'), tcoOut = $('#tcoOut'), roiOut = $('#roiOut');
    if (!tcoForm || !roiForm) return;
    function usd(n, d) { return (n < 0 ? '−' : '') + '$' + Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: d || 0, maximumFractionDigits: d == null ? 0 : d }); }
    function share(part, total) { return total > 0 ? Math.round(part / total * 100) + '%' : '0%'; }
    function errBox(errs) { return '<div class="callout warn" role="alert"><b>Fix these inputs to see results</b><ul>' + errs.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul></div>'; }

    function loadModelPrices() {
      var m = fo.modelPricing.filter(function (x) { return x.id === $('#tcoModel').value; })[0];
      var d = fo.tcoDefaults;
      $('#tcoInPrice').value = m ? m.input1M : d.inputPer1M; $('#tcoCachedPrice').value = m ? m.cached1M : d.cachedPer1M; $('#tcoOutPrice').value = m ? m.output1M : d.outputPer1M;
    }
    function recalcTCO() {
      var r = readFields(TCO_FIELDS);
      if (r.errs.length) { tcoOut.innerHTML = errBox(r.errs); return; }
      var t = fo.calculateTCO(r.vals), mdl = fo.modelPricing.filter(function (x) { return x.id === $('#tcoModel').value; })[0];
      tcoOut.innerHTML = '<div class="eyebrow"><span class="chip" style="--h:212">Monthly estimate</span> ' + (mdl ? lifecycleChip(mdl.lifecycleKey) : '') + '</div>' +
        '<div class="kpis" style="margin-top:10px">' +
          '<div class="kpi"><small>Total per month</small><b style="color:var(--accent)">' + usd(t.total) + '</b><span class="fine">Estimate, not an Azure quote</span></div>' +
          '<div class="kpi"><small>Model inference</small><b>' + usd(t.inference) + '</b><span class="fine">' + share(t.inference, t.total) + ' of total</span></div>' +
          '<div class="kpi"><small>Search + hosting + state</small><b>' + usd(t.search + t.hosting + t.state) + '</b><span class="fine">Your entered fixed costs</span></div>' +
          '<div class="kpi"><small>Per active user</small><b>' + (t.perUser == null ? 'n/a' : usd(t.perUser, 2) + ' / mo') + '</b><span class="fine">' + (t.perUser == null ? 'Enter at least 1 user' : r.vals.users.toLocaleString() + ' users') + '</span></div>' +
          '<div class="kpi"><small>Per query</small><b>' + (t.perQuery == null ? 'n/a' : usd(t.perQuery, 4)) + '</b><span class="fine">' + (t.perQuery == null ? 'Enter queries above 0' : t.monthlyQueries.toLocaleString(undefined, { maximumFractionDigits: 0 }) + ' queries / mo') + '</span></div>' +
        '</div>' +
        '<div class="tablewrap" style="margin-top:14px"><table class="matrix-table" style="font-size:12px"><thead><tr><th scope="col">Cost driver</th><th scope="col">Monthly</th><th scope="col">Share</th></tr></thead><tbody>' +
          '<tr><th scope="row">Input tokens (' + r.vals.cacheHitPct + '% cached)</th><td>' + usd(t.input) + '</td><td>' + share(t.input, t.total) + '</td></tr>' +
          '<tr><th scope="row">Output tokens</th><td>' + usd(t.output) + '</td><td>' + share(t.output, t.total) + '</td></tr>' +
          '<tr><th scope="row">AI Search</th><td>' + usd(t.search) + '</td><td>' + share(t.search, t.total) + '</td></tr>' +
          '<tr><th scope="row">Hosting</th><td>' + usd(t.hosting) + '</td><td>' + share(t.hosting, t.total) + '</td></tr>' +
          '<tr><th scope="row">State / database</th><td>' + usd(t.state) + '</td><td>' + share(t.state, t.total) + '</td></tr>' +
          '<tr><th scope="row">Telemetry</th><td>' + usd(t.telemetry) + '</td><td>' + share(t.telemetry, t.total) + '</td></tr>' +
        '</tbody></table></div>' +
        '<details class="formulas"><summary>Formulas used</summary><pre>queries = users × queries/user/day × days/month\n' +
          'effective input $/1M = input × (1 − cache%) + cached × cache%\n' +
          'inference = queries × input tokens ÷ 1e6 × effective input + queries × output tokens ÷ 1e6 × output\n' +
          'telemetry = queries ÷ 1000 × $/1k queries\n' +
          'total = inference + search + hosting + state + telemetry</pre></details>';
    }
    function recalcROI() {
      var r = readFields(ROI_FIELDS);
      if (r.errs.length) { roiOut.innerHTML = errBox(r.errs); return; }
      var o = fo.calculateROI(r.vals);
      roiOut.innerHTML = '<div class="eyebrow"><span class="chip" style="--h:150">Year-1 ROI</span></div>' +
        '<div class="kpis" style="margin-top:10px">' +
          '<div class="kpi"><small>Realised benefit</small><b style="color:var(--ok)">' + usd(o.adjustedBenefit) + '</b><span class="fine">After ' + r.vals.realizationDiscountPct + '% discount</span></div>' +
          '<div class="kpi"><small>Year-1 cost</small><b>' + usd(o.totalYear1Cost) + '</b><span class="fine">Run cost + one-time build</span></div>' +
          '<div class="kpi"><small>Net year 1</small><b style="color:var(--accent)">' + usd(o.netYear1) + '</b><span class="fine">Benefit − cost</span></div>' +
          '<div class="kpi"><small>ROI</small><b>' + (o.roiPercentage == null ? 'n/a' : Math.round(o.roiPercentage) + '%') + '</b><span class="fine">' + (o.roiPercentage == null ? 'Needs a cost above 0' : 'Net ÷ cost') + '</span></div>' +
          '<div class="kpi"><small>Payback</small><b>' + (o.paybackMonths == null ? 'No payback' : o.paybackMonths.toFixed(1) + ' months') + '</b><span class="fine">' + (o.paybackMonths == null ? 'No realised benefit' : 'Year-1 cost ÷ monthly benefit') + '</span></div>' +
          '<div class="kpi"><small>Break-even hours saved</small><b>' + (o.breakEvenHoursWeekly == null ? 'n/a' : o.breakEvenHoursWeekly.toFixed(2) + ' h/wk') + '</b><span class="fine">Per employee, to cover year-1 cost</span></div>' +
        '</div>' +
        '<details class="formulas"><summary>Formulas used</summary><pre>labor = employees × hours/week × weeks × hourly cost\n' +
          'realised = (labor + direct savings) × (1 − discount%)\n' +
          'year-1 cost = cloud + engineering + one-time build\n' +
          'net = realised − year-1 cost;  ROI = net ÷ year-1 cost\n' +
          'payback (months) = year-1 cost ÷ (realised benefit ÷ 12)\nbreak-even hours = (year-1 cost ÷ (1 − discount) − direct savings) ÷ (employees × weeks × hourly cost)</pre></details>' +
        '<p class="fine">Labour savings are only real if the time is redeployed or headcount changes. Treat this as a model of your assumptions, not a forecast.</p>';
    }
    tcoForm.addEventListener('input', function (e) { if (e.target.id !== 'tcoModel') recalcTCO(); });
    $('#tcoModel').addEventListener('change', function () { loadModelPrices(); recalcTCO(); });
    roiForm.addEventListener('input', recalcROI);
    $('#tcoReset').addEventListener('click', function () {
      TCO_FIELDS.forEach(function (f) { $('#' + f.id).value = fo.tcoDefaults[f.key]; });
      $('#tcoModel').selectedIndex = 0; loadModelPrices(); recalcTCO();
    });
    $('#roiReset').addEventListener('click', function () {
      ROI_FIELDS.forEach(function (f) { $('#' + f.id).value = fo.roiDefaults[f.key]; }); recalcROI();
    });
    loadModelPrices(); recalcTCO(); recalcROI();
  }

  /* ---------- Content verification (service pages and #/freshness) ---------- */
  function sourceLinks(ids) {
    var v = A.verification;
    return ids.map(function (id) { var s = v.sources[id]; return s ? '<a href="' + esc(s.url) + '" rel="noopener">' + esc(s.title) + '</a>' : ''; }).filter(Boolean).join(' · ');
  }
  function stateChip(state, date) {
    var map = { verified: ['Verified', 150], due: ['Review due', 40], unverified: ['Unverified', 20] };
    var m = map[state] || map.unverified;
    return '<span class="chip" style="--h:' + m[1] + '">' + m[0] + (date ? ' ' + esc(date) : '') + '</span>';
  }
  /* Box on a service page. A service with no record is shown as unverified rather than silently trusted. */
  function verificationBox(id) {
    var v = A.verification; if (!v) return '';
    var rec = v.records.filter(function (r) { return r.id === id; })[0];
    if (!rec) {
      return '<div class="callout" role="note"><b>' + stateChip('unverified') + ' Content not yet checked against current Microsoft documentation</b>' +
        'This page was written from general knowledge. Names, limits, regions and prices may have changed, so confirm in the Microsoft Learn link above before relying on them. <a href="#/freshness">How verification works</a>.</div>';
    }
    var st = v.state(rec.lastVerified, rec.kind);
    return '<div class="callout" role="note"><b>' + stateChip(st, rec.lastVerified) + (rec.status ? ' Status: ' + esc(rec.status) : '') + '</b>' +
      '<ul>' + rec.claims.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>' +
      (rec.caveats ? '<p><strong>Caveat:</strong> ' + esc(rec.caveats) + '</p>' : '') +
      '<p class="fine">Sources: ' + sourceLinks(rec.sources) + '. The rest of this page has not been re-checked.</p></div>';
  }

  function pageFreshness() {
    var v = A.verification, now = new Date();
    var recs = v.records, mods = v.modules, nServices = A.services.length;
    var verifiedMods = mods.filter(function (m) { return m.verified; }).length;
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / Content governance</div>' +
      '<h1>Content freshness and sources</h1>' +
      '<p class="lede">Azure AI changes monthly. This page shows exactly what in the Atlas has been checked against Microsoft documentation, on what date, and what has not. Anything not listed here should be treated as unverified.</p>' +
      '<div class="kpis" style="margin:18px 0">' +
        '<div class="kpi"><small>Registry as of</small><b>' + esc(v.asOf) + '</b><span class="fine">Updated only when a source is re-read</span></div>' +
        '<div class="kpi"><small>Service pages verified</small><b>' + recs.length + ' of ' + nServices + '</b><span class="fine">Others are labelled unverified</span></div>' +
        '<div class="kpi"><small>Modules with any verified scope</small><b>' + verifiedMods + ' of ' + mods.length + '</b><span class="fine">Scope is narrow; see below</span></div>' +
        '<div class="kpi"><small>Models with lifecycle checked</small><b>' + v.modelLifecycle.length + '</b><span class="fine">Verified ' + esc(v.modelLifecycleVerified) + '</span></div>' +
      '</div>' +
      '<div class="callout"><b>How to read this</b><strong>Verified</strong> means a person read the cited Microsoft page on that date and the listed claims match it. <strong>Review due</strong> means the date is older than the review interval (service pages ' + v.reviewIntervalDays.service + ' days, model lifecycle ' + v.reviewIntervalDays.lifecycle + ' days; it is computed from today’s date in your browser). <strong>Unverified</strong> means nothing was checked. Verification covers only the claims listed, never a whole page.</div>';

    h += '<h2>1. Verified service records</h2>' +
      '<div class="tablewrap"><table class="matrix-table"><thead><tr><th scope="col">Service</th><th scope="col">State</th><th scope="col">Status</th><th scope="col">Claims checked</th><th scope="col">Sources</th></tr></thead><tbody>';
    recs.forEach(function (r) {
      var label = byId[r.id] ? '<a href="#/s/' + esc(r.id) + '">' + esc(byId[r.id].name) + '</a>' : esc(r.id);
      h += '<tr><th scope="row">' + label + '</th><td>' + stateChip(v.state(r.lastVerified, r.kind, now), r.lastVerified) + '</td><td>' + esc(r.status || 'not stated') + '</td>' +
        '<td><ul>' + r.claims.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>' + (r.caveats ? '<small><strong>Caveat:</strong> ' + esc(r.caveats) + '</small>' : '') + '</td>' +
        '<td><small>' + sourceLinks(r.sources) + '</small></td></tr>';
    });
    h += '</tbody></table></div>';

    var src = v.sources[v.modelLifecycleSource];
    h += '<h2>2. Azure OpenAI / Foundry model lifecycle</h2>' +
      '<p style="max-width:70ch">Copied from <a href="' + esc(src.url) + '" rel="noopener">' + esc(src.title) + '</a> (page dated ' + esc(src.pageUpdated) + ', checked ' + esc(v.modelLifecycleVerified) + ') ' +
      stateChip(v.state(v.modelLifecycleVerified, 'lifecycle', now)) + '. Dates differ by model version, deployment type and Region, so confirm for your subscription.</p>' +
      '<div class="tablewrap"><table class="matrix-table"><thead><tr><th scope="col">Model</th><th scope="col">Lifecycle</th><th scope="col">Retirement</th><th scope="col">Replacement</th><th scope="col">Note</th></tr></thead><tbody>';
    v.modelLifecycle.forEach(function (m) {
      h += '<tr><th scope="row"><code>' + esc(m.label) + '</code></th><td>' + esc(m.lifecycle) + '</td><td>' + esc(m.retirement) + '</td><td>' + esc(m.replacement || 'none named') + '</td><td><small>' + esc(m.note || '') + '</small></td></tr>';
    });
    h += '</tbody></table></div><p style="max-width:70ch">' + esc(v.modelLifecycleCurrentFamily) + '</p>';

    h += '<h2>3. Module coverage</h2>' +
      '<p style="max-width:70ch">The Atlas pages below were written before this registry existed. A date here means a narrow, named scope was checked; the “still unverified” column is what remains. The review order is tracked in docs/roadmap.md in the repository.</p>' +
      '<div class="tablewrap"><table class="matrix-table"><thead><tr><th scope="col">Module</th><th scope="col">State</th><th scope="col">Verified scope</th><th scope="col">Still unverified</th></tr></thead><tbody>';
    mods.forEach(function (m) {
      h += '<tr><th scope="row"><a href="' + esc(m.route) + '">' + esc(m.name) + '</a></th><td>' + stateChip(v.state(m.verified, 'service', now), m.verified) + '</td><td>' + esc(m.scope || 'none') + '</td><td><small>' + esc(m.remaining) + '</small></td></tr>';
    });
    h += '</tbody></table></div>';

    h += '<h2>4. Sources used</h2><ul>' + Object.keys(v.sources).map(function (k) {
      var s = v.sources[k]; return '<li><a href="' + esc(s.url) + '" rel="noopener">' + esc(s.title) + '</a>' + (s.pageUpdated ? ' <small>(page dated ' + esc(s.pageUpdated) + ')</small>' : '') + '</li>';
    }).join('') + '</ul>';
    return '<div class="wide">' + h + '</div>';
  }

  /* ---------- Production Troubleshooting Catalog ---------- */
  function pageTroubleshooting() {
    var tb = A.troubleshooting;
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / Operations & Reliability</div>' +
      '<h1>' + esc(tb.title) + '</h1>' +
      '<p class="lede">' + esc(tb.lede) + '</p>' +
      '<div class="callout"><b>Production Incident Diagnostics</b>Actionable root-cause procedures, diagnostics, and ready-to-run KQL queries for RAG systems, autonomous agent loops, and Azure platform infrastructure.</div>';

    // Subtabs filter
    h += '<div class="subtabs">' +
      '<button class="subtab active" data-cat="all">All Incidents</button>' +
      '<button class="subtab" data-cat="rag">RAG & Retrieval Failures</button>' +
      '<button class="subtab" data-cat="agent">Agentic AI Failures</button>' +
      '<button class="subtab" data-cat="azure">Azure Platform & 429 Errors</button>' +
    '</div><div id="issueContainer">';

    tb.categories.forEach(function (cat) {
      cat.issues.forEach(function (iss) {
        h += '<div class="issue-card" data-cat="' + cat.id + '">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">' +
            '<span class="chip" style="--h:212">' + esc(cat.name) + '</span>' +
            '<code style="font-size:11px">' + esc(iss.id) + '</code>' +
          '</div>' +
          '<h3>' + esc(iss.title) + '</h3>' +
          '<div class="issue-row"><span class="issue-label" style="color:var(--warn)">Symptom:</span><span>' + esc(iss.symptom) + '</span></div>' +
          '<div class="issue-row"><span class="issue-label">Root Causes:</span><span>' + esc(iss.rootCauses) + '</span></div>' +
          '<div class="issue-row"><span class="issue-label">Diagnostics:</span><span>' + esc(iss.diagnostics) + '</span></div>' +
          '<div class="issue-row"><span class="issue-label" style="color:var(--ok)">Resolution:</span><span>' + esc(iss.resolution) + '</span></div>' +
          '<div class="issue-row"><span class="issue-label">Prevention:</span><span>' + esc(iss.prevention) + '</span></div>' +
          '<div style="margin-top:12px">' +
            '<div style="display:flex;justify-content:space-between;align-items:center">' +
              '<span class="issue-label">Azure Log Analytics (KQL) Query:</span>' +
              '<button class="btn-sm copy-kql-btn" data-kql="' + esc(iss.kql) + '" type="button">📋 Copy KQL</button>' +
            '</div>' +
            '<div class="kql-box"><code>' + esc(iss.kql) + '</code></div>' +
          '</div>' +
        '</div>';
      });
    });

    h += '</div>';
    afterRender = mountTroubleshooting;
    return '<div class="wide">' + h + '</div>';
  }

  function mountTroubleshooting() {
    var tabs = $$('.subtabs .subtab');
    var cards = $$('.issue-card');

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var cat = tab.getAttribute('data-cat');
        cards.forEach(function (c) {
          c.hidden = (cat !== 'all' && c.getAttribute('data-cat') !== cat);
        });
      });
    });

    $$('.copy-kql-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var kql = btn.getAttribute('data-kql');
        navigator.clipboard.writeText(kql).then(function () {
          btn.textContent = '✓ Copied!';
          setTimeout(function () { btn.textContent = '📋 Copy KQL'; }, 2000);
        });
      });
    });
  }

  /* ---------- Traditional ML & Enterprise Integration ---------- */
  function pageTraditionalML() {
    var ml = A.traditionalML;
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / Machine Learning & Data</div>' +
      '<h1>' + esc(ml.title) + '</h1>' +
      '<p class="lede">' + esc(ml.lede) + '</p>' +
      '<div class="callout"><b>Predictive ML & Enterprise Integration</b>Enterprise AI Engineering Managers must balance generative AI with classical predictive machine learning, unified lakehouses, high-availability DR architectures, and ERP/CRM system integrations.</div>';

    // 10-Phase ML Lifecycle
    h += '<h2>1. The ' + ml.mlLifecycle.length + '-Phase Predictive ML Lifecycle</h2>' +
      '<div class="pyramid" style="margin:16px 0">';
    ml.mlLifecycle.forEach(function (st) {
      var m = /^(\d+)\.\s*(.*)$/.exec(st.phase) || [null, '', st.phase];
      h += '<div class="pyr-level">' +
        '<span class="pyr-tag">Phase ' + esc(m[1]) + '</span>' +
        '<div class="pyr-body"><b>' + esc(m[2]) + '</b><span>' + esc(st.focus) + '</span></div>' +
      '</div>';
    });
    h += '</div>';

    // Azure ML Platform Matrix
    h += '<h2>2. Azure Machine Learning Capabilities Matrix</h2>' +
      '<div class="tablewrap"><table class="matrix-table">' +
      '<thead><tr><th>Azure ML Component</th><th>Architectural Role</th></tr></thead><tbody>';
    ml.azureMLMatrix.forEach(function (cm) {
      h += '<tr><td><b>' + esc(cm.capability) + '</b></td><td>' + esc(cm.purpose) + '</td></tr>';
    });
    h += '</tbody></table></div>';

    // Manager Decision Scenarios
    if (ml.managerDecisions) {
      h += '<h2>3. Manager Decision Scenarios</h2>' +
        '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr));gap:14px;margin:16px 0">';
      ml.managerDecisions.forEach(function (ds) {
        h += '<div class="card" style="--h:212">' +
          '<div class="mini">Decision Scenario</div>' +
          '<h3>' + esc(ds.decision) + '</h3>' +
          '<p style="font-size:13px;line-height:1.55;color:var(--ink)"><b>Favors traditional ML:</b> ' + esc(ds.whenTraditional) + '</p>' +
          '<p style="font-size:13px;line-height:1.55;color:var(--ink)"><b>Favors GenAI:</b> ' + esc(ds.whenGenAI) + '</p>' +
          '<p style="font-size:13px;line-height:1.55;color:var(--ink)"><b>Manager verdict:</b> ' + esc(ds.managerVerdict) + '</p>' +
        '</div>';
      });
      h += '</div>';
    }

    // Enterprise Data Storage Archetypes
    if (ml.dataArchitectures) {
      h += '<h2>4. Enterprise AI Data Storage Archetypes</h2>' +
        '<div class="tablewrap"><table class="matrix-table">' +
        '<thead><tr><th>Archetype</th><th>Best For</th><th>Typical Formats</th><th>Access Latency</th></tr></thead><tbody>';
      ml.dataArchitectures.forEach(function (da) {
        h += '<tr><td><b>' + esc(da.type) + '</b></td>' +
          '<td>' + esc(da.bestFor) + '</td>' +
          '<td><code>' + esc(da.format) + '</code></td>' +
          '<td>' + esc(da.latency) + '</td></tr>';
      });
      h += '</tbody></table></div>';
    }

    // Enterprise Line-of-Business Connectors
    if (ml.enterpriseConnectors) {
      h += '<h2>5. Enterprise Line-of-Business Connectors</h2>' +
        '<div class="tablewrap"><table class="matrix-table">' +
        '<thead><tr><th>Target Enterprise System</th><th>Protocol / Integration</th><th>Typical AI / Agent Use Case</th><th>Security Pattern</th></tr></thead><tbody>';
      ml.enterpriseConnectors.forEach(function (ec) {
        h += '<tr><td><b>' + esc(ec.system) + '</b></td>' +
          '<td><code>' + esc(ec.protocol) + '</code></td>' +
          '<td>' + esc(ec.pattern) + '</td>' +
          '<td>' + esc(ec.security) + '</td></tr>';
      });
      h += '</tbody></table></div>';
    }

    return '<div class="wide">' + h + '</div>';
  }

  /* ---------- AI Engineering Manager Workspace ---------- */
  function pageEMWorkspace() {
    var em = A.emWorkspace;
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / Leadership & Delivery</div>' +
      '<h1>' + esc(em.title) + '</h1>' +
      '<p class="lede">' + esc(em.lede) + '</p>' +
      '<div class="callout"><b>Engineering Leadership Command Center</b>Evaluate AI use cases, estimate team headcount and sprint timelines, review solution designs, and assess team competency across the AI engineering lifecycle.</div>';

    // 1. 14-Question Guided Assessment
    h += '<h2>1. Guided AI Project Assessment Questionnaire</h2>' +
      '<p style="max-width:68ch">A review question set for incoming business proposals, covering ' + em.assessmentQuestions.length + ' feasibility and governance criteria. It is a discussion checklist, not a scored form: for an interactive intake that produces a recommendation, use the <a href="#/advisor">Architecture Advisor</a>.</p>' +
      '<div class="wide"><div class="box" style="margin:16px 0">' +
        '<ol style="padding-left:20px;margin:12px 0">' +
          em.assessmentQuestions.map(function (q) {
            return '<li style="margin:10px 0;font-size:14px"><b>' + esc(String(q.text).replace(/^\d+\.\s*/, '')) + '</b></li>';
          }).join('') +
        '</ol>' +
      '</div></div>';

    // 2. 6-Pillar Solution Review Checklist
    if (em.reviewChecklist) {
      h += '<h2>2. Architecture Solution Review Checklist</h2>' +
        '<p style="max-width:68ch">Six engineering pillars to audit during AI design reviews before committing budget or engineering sprints.</p>' +
        '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr));gap:14px;margin:16px 0">';
      em.reviewChecklist.forEach(function (rc) {
        h += '<div class="card" style="--h:150">' +
          '<div class="mini">Review Pillar</div>' +
          '<h3>' + esc(rc.category) + '</h3>' +
          '<ul style="margin:8px 0;padding-left:18px;font-size:13px;line-height:1.5">' +
            rc.items.map(function (it) { return '<li style="margin:6px 0">' + esc(it) + '</li>'; }).join('') +
          '</ul>' +
        '</div>';
      });
      h += '</div>';
    }

    // 3. Interactive Complexity & Effort Estimator
    h += '<h2>3. Interactive AI Project Complexity & Staffing Estimator</h2>' +
      '<p style="max-width:68ch">Score your initiative across 8 engineering dimensions to generate complexity tiers, timeline estimates, and team composition.</p>' +
      '<div class="wide"><div class="calc">' +
        '<form id="compForm" class="calcform">' +
          em.complexityEstimator.factors.map(function (f, i) {
            return '<fieldset><legend>' + esc(f.name) + '</legend>' +
              '<label class="opt"><input type="radio" name="f' + i + '" value="1" checked><span><b>Low:</b> ' + esc(f.low) + '</span></label>' +
              '<label class="opt"><input type="radio" name="f' + i + '" value="2"><span><b>Medium:</b> ' + esc(f.med) + '</span></label>' +
              '<label class="opt"><input type="radio" name="f' + i + '" value="3"><span><b>High:</b> ' + esc(f.high) + '</span></label>' +
            '</fieldset>';
          }).join('') +
        '</form>' +
        '<div id="compOut" class="calcout" aria-live="polite"></div>' +
      '</div></div>';

    // 4. Delivery Lifecycle
    if (em.deliveryLifecycle) {
      h += '<h2>4. End-to-End AI Delivery Lifecycle</h2>' +
        '<p style="max-width:68ch">The 6 chronological phases from discovery to scaled production operations.</p>' +
        '<div class="tablewrap"><table class="matrix-table">' +
        '<thead><tr><th>Phase</th><th>Estimated Duration</th><th>Key Engineering Deliverables</th></tr></thead><tbody>';
      em.deliveryLifecycle.forEach(function (dl) {
        h += '<tr><td><b>' + esc(dl.phase) + '</b></td>' +
          '<td><span class="chip" style="--h:212">' + esc(dl.duration) + '</span></td>' +
          '<td>' + esc(dl.deliverables) + '</td></tr>';
      });
      h += '</tbody></table></div>';
    }

    // 5. Skills Matrix & Heatmap
    h += '<h2>5. AI Engineering Team Skills & Competency Matrix</h2>' +
      '<p style="max-width:68ch">Core competencies required across 8 engineering roles from Level 1 (Awareness) to Level 5 (Subject Matter Expert).</p>' +
      '<div class="tablewrap"><table class="heat-table">' +
      '<thead><tr><th>Role</th><th>Primary Capabilities & Skills</th><th>Target Competency Level</th></tr></thead><tbody>';

    em.skillsMatrix.forEach(function (sm, i) {
      h += '<tr><td><b>' + esc(sm.role) + '</b></td>' +
        '<td><ul style="margin:0;padding-left:16px">' + sm.skills.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul></td>' +
        '<td><span class="heat-cell heat-' + ((i % 5) + 1) + '">' + esc(sm.competencyLevels[Math.min(4, 2 + (i % 3))]) + '</span></td></tr>';
    });
    h += '</tbody></table></div>';

    // 6. AI Use-Case Portfolio Prioritization
    h += '<h2>6. AI Portfolio Prioritization (Value vs Feasibility)</h2>' +
      '<div class="tablewrap"><table class="matrix-table">' +
      '<thead><tr><th>Candidate Initiative</th><th>Business Value</th><th>Feasibility</th><th>Category</th><th>Recommended Action</th></tr></thead><tbody>';

    em.portfolioPrioritization.forEach(function (pp) {
      var catHue = pp.category === 'Quick Win' ? 150 : (pp.category === 'Strategic Initiative' ? 212 : (pp.category === 'Caution / Re-scope' ? 40 : 0));
      h += '<tr><td><b>' + esc(pp.name) + '</b></td>' +
        '<td>' + pp.value + ' / 5</td>' +
        '<td>' + pp.feasibility + ' / 5</td>' +
        '<td><span class="chip" style="--h:' + catHue + '">' + esc(pp.category) + '</span></td>' +
        '<td>' + esc(pp.action) + '</td></tr>';
    });
    h += '</tbody></table></div>';

    afterRender = mountEMWorkspace;
    return '<div class="wide">' + h + '</div>';
  }

  function mountEMWorkspace() {
    var form = $('#compForm'), out = $('#compOut');
    if (!form || !out || !form.elements) return;

    function recalc() {
      var scores = {};
      A.emWorkspace.complexityEstimator.factors.forEach(function (f, i) {
        var r = form.elements && form.elements['f' + i];
        scores['f' + i] = r ? r.value : 1;
      });
      var res = A.emWorkspace.complexityEstimator.calculate(scores);

      out.innerHTML = '<div class="eyebrow"><span class="chip" style="--h:212">Project Complexity Projection</span></div>' +
        '<h3 style="margin-top:4px">' + esc(res.tier) + '</h3>' +
        '<div class="track" style="margin:10px 0 14px"><div class="fill" style="width:' + res.percentage + '%;background:' + (res.percentage > 65 ? 'var(--warn)' : 'var(--ok)') + '"></div></div>' +
        '<div class="kpis">' +
          '<div class="kpi"><small>Complexity Index</small><b>' + res.score + ' / 24</b><span class="fine">' + res.percentage + '% of maximum</span></div>' +
          '<div class="kpi"><small>Estimated Delivery</small><b style="color:var(--accent)">' + esc(res.estimatedWeeks) + '</b><span class="fine">From spike to hardening</span></div>' +
        '</div>' +
        '<div class="callout" style="margin-top:16px">' +
          '<b>Recommended Staffing Composition</b>' +
          '<p style="margin:4px 0 0;font-size:14px">' + esc(res.recommendedTeam) + '</p>' +
        '</div>';
    }

    form.addEventListener('change', recalc);
    recalc();
  }

  /* ---------- Azure Services Comparison Matrix ---------- */
  function pageServiceMatrix() {
    var sm = A.serviceMatrix;
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / Platform Decisions</div>' +
      '<h1>' + esc(sm.title) + '</h1>' +
      '<p class="lede">' + esc(sm.lede) + '</p>' +
      '<div class="callout"><b>Defensible Service Selection</b>Make rigorous, defensible technology decisions during architecture design reviews using our 14-field service breakdown and core Azure platform trade-off guides.</div>';

    // 14-Field Comparison Matrix Cards
    h += '<h2>1. Comprehensive 14-Field Azure AI Services Matrix</h2>' +
      '<p style="max-width:68ch">Every service evaluated across all 14 mandatory architectural criteria to guide defensible selection in design reviews.</p>' +
      '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(380px,100%),1fr));gap:20px;margin:20px 0">';

    sm.comparisonMatrix.forEach(function (sv) {
      h += '<div class="pattern-card">' +
        '<div class="pattern-top">' +
          '<a href="#/s/' + esc(byId[sv.atlasId || sv.id] ? (sv.atlasId || sv.id) : sv.id) + '" style="font-size:18px;font-weight:700;color:var(--ink);text-decoration:none"><b>' + esc(sv.name) + '</b></a>' +
          '<span class="chip" style="--h:212">' + esc(sv.category) + '</span>' +
        '</div>' +
        '<p style="font-size:13px;color:var(--muted);margin:0"><b>What:</b> ' + esc(sv.what) + '</p>' +
        '<p style="font-size:13px;color:var(--ink);margin:0"><b>Why it exists:</b> ' + esc(sv.why) + '</p>' +
        '<div style="background:var(--paper);border:1px solid var(--line2);border-radius:8px;padding:10px;font-size:12px;margin:4px 0">' +
          '<div style="color:var(--ok);font-weight:700;margin-bottom:2px">When to use it:</div>' + esc(sv.whenUse) +
        '</div>' +
        '<div style="background:color-mix(in srgb,var(--warn) 8%,transparent);border:1px solid var(--warn);border-radius:8px;padding:10px;font-size:12px;margin:4px 0">' +
          '<div style="color:var(--warn);font-weight:700;margin-bottom:2px">When NOT to use it:</div>' + esc(sv.whenNot) +
        '</div>' +
        '<div style="font-size:12px;line-height:1.55;display:flex;flex-direction:column;gap:4px;margin-top:4px">' +
          '<div><b>Alternatives:</b> ' + esc(sv.alternatives) + '</div>' +
          '<div><b>Integration Points:</b> ' + esc(sv.integrationPoints) + '</div>' +
          '<div><b>Architecture Patterns:</b> ' + esc(sv.patterns) + '</div>' +
          '<div><b>Security:</b> ' + esc(sv.security) + '</div>' +
          '<div><b>Limitations:</b> ' + esc(sv.limitations) + '</div>' +
          '<div><b>Pricing:</b> ' + esc(sv.pricing) + '</div>' +
          '<div><b>SLA:</b> ' + esc(sv.sla) + ' | <b>Regions:</b> ' + esc(sv.regions) + '</div>' +
          '<div><b>Quotas:</b> ' + esc(sv.quotas) + '</div>' +
          '<div><b>Production Use Cases:</b> ' + esc(sv.useCases) + '</div>' +
        '</div>' +
      '</div>';
    });
    h += '</div>';

    // Platform Decisions
    h += '<h2>2. Critical Azure Platform Architectural Decisions</h2>' +
      '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr));gap:16px;margin:20px 0">';

    sm.platformDecisions.forEach(function (pd) {
      h += '<div class="card" style="--h:212">' +
        '<div class="mini">' + esc(pd.lens) + '</div>' +
        '<h3>' + esc(pd.decision) + '</h3>' +
        '<p style="font-size:14px;color:var(--ink);line-height:1.55;margin-top:6px">' + esc(pd.summary) + '</p>' +
      '</div>';
    });
    h += '</div>';

    return '<div class="wide">' + h + '</div>';
  }

  /* ---------- Azure Cloud Foundation ---------- */
  function pageFoundation() {
    var fd = A.foundation;
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / Cloud Foundation</div>' +
      '<h1>' + esc(fd.title) + '</h1>' +
      '<p class="lede">' + esc(fd.lede) + '</p>' +
      '<div class="callout"><b>Enterprise Infrastructure Grounding</b>' +
      'Enterprise AI workloads inherit the network topologies, identity models, storage layers, and compute constraints of the underlying Azure cloud platform. Engineering managers and principal architects must master these four pillars to design resilient, secure, and cost-effective AI systems.</div>';

    // 1. The 4 Foundation Pillars
    h += '<h2>1. The Four Azure Infrastructure Pillars</h2>' +
      '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr));gap:16px;margin:20px 0">';
    fd.pillars.forEach(function (pil) {
      h += '<div class="card" style="--h:' + (pil.color || 212) + '">' +
        '<div class="mini">Pillar · ' + pil.topics.length + ' Core Topics</div>' +
        '<h3>' + esc(pil.name) + '</h3>' +
        '<p style="font-size:14px;color:var(--muted);margin-bottom:12px">' + esc(pil.summary) + '</p>' +
        '<div style="display:flex;flex-direction:column;gap:10px">';
      pil.topics.forEach(function (tp) {
        h += '<div style="background:var(--paper);border:1px solid var(--line2);border-radius:8px;padding:8px 10px">' +
          '<div style="font-weight:700;font-size:13px"><span>' + esc(tp.name) + '</span></div>' +
          '<p style="font-size:12px;margin:4px 0 0;color:var(--ink);line-height:1.5">' + esc(tp.desc) + '</p>' +
        '</div>';
      });
      h += '</div></div>';
    });
    h += '</div>';

    // 2. The 7 Platform Decision Cards
    h += '<h2>2. The 7 Critical Azure Platform Decisions</h2>' +
      '<p style="max-width:68ch">Fundamental infrastructure trade-offs that dictate operational complexity, scalability, and security posture across every AI workload.</p>' +
      '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(340px,100%),1fr));gap:16px;margin:20px 0">';
    fd.decisions.forEach(function (dec) {
      h += '<div class="pattern-card">' +
        '<div class="pattern-top">' +
          '<span class="chip" style="--h:212">' + esc(dec.category) + '</span>' +
        '</div>' +
        '<h3>' + esc(dec.title) + '</h3>' +
        '<p style="font-size:13px;font-style:italic;color:var(--muted);margin:0">' + esc(dec.question) + '</p>' +
        '<div style="background:var(--paper);border:1px solid var(--line2);border-radius:8px;padding:10px;margin:8px 0;font-size:13px">' +
          '<div style="font-weight:700;color:var(--ok);margin-bottom:4px">Engineering Recommendation:</div>' +
          esc(dec.recommendation) +
        '</div>' +
        '<div class="tablewrap" style="margin:8px 0"><table class="matrix-table" style="font-size:11px;margin:0">' +
          '<thead><tr><th>Dimension</th><th>Option A</th><th>Option B</th></tr></thead><tbody>' +
          dec.comparison.map(function (rw) {
            return '<tr><td><b>' + esc(rw[0]) + '</b></td><td>' + esc(rw[1]) + '</td><td>' + esc(rw[2]) + '</td></tr>';
          }).join('') +
        '</tbody></table></div>' +
        '<div style="background:color-mix(in srgb,var(--warn) 10%,transparent);border-left:3px solid var(--warn);padding:8px 10px;font-size:12px;border-radius:4px">' +
          '<b>Red Flags / Anti-Patterns:</b> ' + esc(dec.redFlags) +
        '</div>' +
      '</div>';
    });
    h += '</div>';

    // 3. Solution Review Checklist (Manager Level Outcome)
    h += '<h2>3. Infrastructure Solution Review Pillars</h2>' +
      '<p style="max-width:68ch">When reviewing AI solution diagrams, engineering leaders should evaluate these four risk pillars to identify architectural defects early.</p>' +
      '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr));gap:16px;margin:20px 0">';
    fd.solutionReviewPillars.forEach(function (srp) {
      h += '<div class="card" style="--h:150">' +
        '<div class="mini">Review Pillar</div>' +
        '<h3>' + esc(srp.pillar) + '</h3>' +
        '<ul style="margin:8px 0;padding-left:18px;font-size:13px">' +
          srp.questions.map(function (q) { return '<li style="margin:6px 0">' + esc(q) + '</li>'; }).join('') +
        '</ul>' +
      '</div>';
    });
    h += '</div>';

    return '<div class="wide">' + h + '</div>';
  }

  /* ---------- Microsoft Foundry Deep Dive ---------- */
  function pageFoundry() {
    var fd = A.foundry;
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / Microsoft Foundry</div>' +
      '<h1>' + esc(fd.title) + '</h1>' +
      '<p class="lede">' + esc(fd.lede) + '</p>' +
      lifecycleNotice() +
      '<div class="callout"><b>Unified AI Platform Engineering</b>' +
      'Microsoft Foundry serves as Azure’s consolidated platform for foundation models, autonomous agents, prompt evaluation, security guardrails, and enterprise observability. This guide details the platform architecture, quota optimization, agent runtime, and evaluation pipelines.</div>';

    // 5 Foundry Sections
    h += '<h2>Foundry Platform Architecture & Capabilities</h2>';
    fd.sections.forEach(function (sec, idx) {
      h += '<div class="box" style="margin:20px 0;border-left:4px solid var(--accent)">' +
        '<h3>' + (idx + 1) + '. ' + esc(sec.name) + '</h3>' +
        '<p style="color:var(--muted);font-size:14px;margin:4px 0 14px">' + esc(sec.desc) + '</p>' +
        '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr));gap:12px">';
      (sec.subsections || []).forEach(function (sub) {
        h += '<div style="background:var(--paper);border:1px solid var(--line2);border-radius:10px;padding:12px 14px">' +
          '<h4 style="margin:0 0 6px;font-size:14px;font-weight:700">' + esc(sub.title) + '</h4>' +
          '<p style="margin:0;font-size:13px;line-height:1.55;color:var(--ink)">' + esc(sub.content) + '</p>' +
        '</div>';
      });
      h += '</div></div>';
    });

    // Code Examples
    if (fd.codeExamples && fd.codeExamples.length) {
      h += '<h2>Production Python SDK Implementation Blueprints</h2>' +
        '<p style="max-width:68ch">Official azure-ai-projects and azure-ai-evaluation SDK examples for code-first deployment and evaluation.</p>';
      fd.codeExamples.forEach(function (ce, idx) {
        h += '<div style="margin:16px 0">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;background:var(--paper);border:1px solid var(--line2);border-bottom:none;border-radius:10px 10px 0 0;padding:10px 14px">' +
            '<span style="font-weight:700;font-size:13px">' + esc(ce.title) + '</span>' +
            '<button class="btn-sm" type="button" data-copy-code="' + idx + '">Copy Python</button>' +
          '</div>' +
          '<pre class="adr" id="fcode-' + idx + '" style="border-radius:0 0 10px 10px;margin-top:0">' + esc(ce.code) + '</pre>' +
        '</div>';
      });
    }

    afterRender = function () {
      $$('button[data-copy-code]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var idx = this.getAttribute('data-copy-code');
          var target = $('#fcode-' + idx);
          if (target) copyText(target.textContent, this);
        });
      });
    };

    return '<div class="wide">' + h + '</div>';
  }

  /* ---------- Advanced AI Engineering ---------- */
  function pageAdvancedAI() {
    var adv = A.advancedAI;
    var h = '<div class="eyebrow"><a href="#/">Atlas</a> / Advanced AI Engineering</div>' +
      '<h1>' + esc(adv.title) + '</h1>' +
      '<p class="lede">' + esc(adv.lede) + '</p>' +
      '<div class="callout"><b>Frontier AI Architectures & Hardening</b>' +
      'Beyond basic RAG and single-prompt agents, production AI systems require advanced engineering: graph grounding, multimodal fusion, parameter-efficient fine-tuning (LoRA), edge SLM inference, dynamic model routing, hierarchical memory, synthetic data pipelines, and automated adversarial red teaming.</div>';

    h += '<h2>Advanced AI Engineering Topics (' + adv.topics.length + ')</h2>' +
      '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(360px,100%),1fr));gap:20px;margin:20px 0">';
    adv.topics.forEach(function (tp) {
      h += '<div class="pattern-card">' +
        '<div class="pattern-top">' +
          '<span class="chip" style="--h:' + (tp.color || 212) + '">' + esc(tp.tag) + '</span>' +
        '</div>' +
        '<h3>' + esc(tp.name) + '</h3>' +
        '<p style="font-size:14px;color:var(--muted);margin:2px 0 8px">' + esc(tp.summary) + '</p>' +
        '<div style="background:var(--paper);border:1px solid var(--line2);border-radius:8px;padding:10px;font-size:13px;margin:6px 0">' +
          '<b>Problem Solved:</b> ' + esc(tp.problemSolved) +
        '</div>' +
        '<div style="font-size:13px;margin:6px 0"><b>Azure Implementation:</b> <code>' + esc(tp.azureImplementation) + '</code></div>' +
        '<div style="margin:10px 0">' +
          '<div style="font-weight:700;font-size:12px;font-family:var(--mono);text-transform:uppercase;color:var(--muted);margin-bottom:4px">Architectural Execution Flow:</div>' +
          '<ol style="margin:0;padding-left:18px;font-size:13px">' +
            tp.architecture.map(function (step) { return '<li style="margin:4px 0">' + esc(step) + '</li>'; }).join('') +
          '</ol>' +
        '</div>' +
        '<div style="background:color-mix(in srgb,var(--accent) 8%,transparent);border-left:3px solid var(--accent);border-radius:4px;padding:8px 10px;font-size:12px;margin-top:auto">' +
          '<b>Key Engineering Metrics:</b> ' + esc(tp.keyMetrics) +
        '</div>' +
      '</div>';
    });
    h += '</div>';

    return '<div class="wide">' + h + '</div>';
  }

  function notFound() { return '<h1>Not found</h1><p class="lede">That page does not exist. <a href="#/">Back to the atlas</a>.</p>'; }

  /* ---------- sidebar ---------- */
  function renderSide(kind, id) {
    var curHref = navHref(kind, id), curCat = kind === 's' && byId[id] ? byId[id].cat : (kind === 'c' ? id : null);
    var h = '';
    SECTIONS.forEach(function (s) {
      h += '<h3>' + esc(s.name) + '</h3>' + s.items.map(function (it) {
        return '<a class="nl" href="' + it[0] + '"' + (it[0] === curHref ? ' aria-current="page"' : '') + '>' + esc(it[1]) + '</a>';
      }).join('');
    });
    h += '<h3>Services</h3>';
    A.categories.forEach(function (c) {
      h += '<details' + (curCat === c.id ? ' open' : '') + '><summary style="--h:' + c.hue + '"><span class="dot"></span><span class="sn">' + esc(c.name) + '</span><span class="n">' + c.items.length + '</span></summary><ul>' +
        '<li><a href="#/c/' + c.id + '"' + (kind === 'c' && id === c.id ? ' aria-current="page"' : '') + '>Overview</a></li>' +
        c.items.map(function (s) { return '<li><a href="#/s/' + s.id + '"' + (kind === 's' && id === s.id ? ' aria-current="page"' : '') + '>' + esc(s.name) + '</a></li>'; }).join('') + '</ul></details>';
    });
    $('#side').innerHTML = h;
  }

  /* ---------- page helpers: "on this page" jump list and the section pager ---------- */
  function addToc(main) {
    var heads = $$(':scope > h2, :scope > .wide > h2, :scope > section > h2', main).filter(function (x) { return x.textContent.trim(); });
    if (heads.length < 4) return;
    var nav = document.createElement('nav');
    nav.className = 'toc'; nav.setAttribute('aria-label', 'On this page');
    nav.innerHTML = '<b>On this page</b>' + heads.map(function (x, i) { return '<button type="button" data-toc="' + i + '">' + esc(x.textContent.trim()) + '</button>'; }).join('');
    nav.addEventListener('click', function (e) {
      var b = e.target.closest('[data-toc]'); if (!b) return;
      var t = heads[+b.getAttribute('data-toc')]; t.setAttribute('tabindex', '-1'); t.scrollIntoView({ block: 'start' }); t.focus({ preventScroll: true });
    });
    var after = $('.lede', main) || $('h1', main);
    after.parentNode.insertBefore(nav, after.nextSibling);
  }
  function addPager(main, kind, id) {
    var href = '#/' + kind + (id ? '/' + id : ''), sec = null, i = -1;
    SECTIONS.forEach(function (s) { s.items.forEach(function (it, j) { if (it[0] === href) { sec = s; i = j; } }); });
    if (!sec || !kind) return;
    var prev = sec.items[i - 1], next = sec.items[i + 1];
    if (!prev && !next) return;
    var el = document.createElement('nav');
    el.className = 'pn secnav'; el.setAttribute('aria-label', sec.name + ' section');
    el.innerHTML = (prev ? '<a href="' + prev[0] + '"><small>← ' + esc(sec.name) + '</small>' + esc(prev[1]) + '</a>' : '<span></span>') +
      (next ? '<a href="' + next[0] + '"><small>' + esc(sec.name) + ' →</small>' + esc(next[1]) + '</a>' : '');
    main.appendChild(el);
  }

  /* ---------- router ---------- */
  function render() {
    $$('.stepper').forEach(function (el) { if (el._stop) el._stop(); });
    var parts = location.hash.replace(/^#\/?/, '').split('/'), kind = parts[0] || '', id = parts[1] || '';
    pendingSteppers = []; afterRender = null;
    var html, title = 'Azure AI Atlas — Design, build and run AI systems on Azure';
    if (kind === 's' && byId[id]) { html = pageService(id); title = byId[id].name + ' — Azure AI Atlas'; }
    else if (kind === 'c' && catById[id]) { html = pageCategory(id); title = catById[id].name + ' — Azure AI Atlas'; }
    else if (kind === 'a') { if (id && archById[id]) { html = pageArch(id); title = archById[id].name + ' — Azure AI Atlas'; } else html = pageArchIndex(); }
    else if (kind === 'advisor') { html = pageAdvisor(); title = 'Architecture Advisor — Azure AI Atlas'; }
    else if (kind === 'rag-lab') { html = pageRagLab(); title = 'RAG Engineering Lab — Azure AI Atlas'; }
    else if (kind === 'agents') { html = pageAgentPatterns(); title = 'Agentic AI Architecture Patterns — Azure AI Atlas'; }
    else if (kind === 'security-center') { html = pageSecurityCenter(); title = 'AI Security & Governance Center — Azure AI Atlas'; }
    else if (kind === 'evaluation') { html = pageEvaluationCenter(); title = 'AI Evaluation & Quality Center — Azure AI Atlas'; }
    else if (kind === 'freshness') { html = pageFreshness(); title = 'Content freshness and sources — Azure AI Atlas'; }
    else if (kind === 'finops') { html = pageFinOps(); title = 'AI FinOps & Cost Engineering — Azure AI Atlas'; }
    else if (kind === 'troubleshooting') { html = pageTroubleshooting(); title = 'Production Troubleshooting & Failure Catalog — Azure AI Atlas'; }
    else if (kind === 'traditional-ml') { html = pageTraditionalML(); title = 'Traditional ML, Data Architecture & Enterprise Integration — Azure AI Atlas'; }
    else if (kind === 'em-workspace') { html = pageEMWorkspace(); title = 'AI Engineering Manager Workspace — Azure AI Atlas'; }
    else if (kind === 'services-matrix') { html = pageServiceMatrix(); title = 'Azure Services Decision Matrix — Azure AI Atlas'; }
    else if (kind === 'foundation') { html = pageFoundation(); title = 'Azure Cloud Foundation — Azure AI Atlas'; }
    else if (kind === 'foundry') { html = pageFoundry(); title = 'Microsoft Foundry Deep Dive — Azure AI Atlas'; }
    else if (kind === 'advanced-ai') { html = pageAdvancedAI(); title = 'Advanced AI Engineering — Azure AI Atlas'; }
    else if (kind === 'd') {
      var TOOLS = { shaper: ['Solution shaper', pageShaper], checklists: ['Readiness checklists', pageChecklists], calculator: ['Cost per task', pageCalculator] };
      if (!id || id === 'em' || id === 'pe' || id === 'all') { html = pageDecisionHub(id); title = (id === 'em' ? 'Decisions for engineering managers' : id === 'pe' ? 'Decisions for principal engineers' : 'Decision guides') + ' — Azure AI Atlas'; }
      else if (TOOLS[id]) { html = TOOLS[id][1](); title = TOOLS[id][0] + ' — Azure AI Atlas'; }
      else if (decById[id]) { html = pageDecision(id); title = decById[id].title + ' — Azure AI Atlas'; }
      else html = notFound();
    }
    else if (kind === 'p') {
      if (id) {
        var pb = A.engineeringPlaybooks.find(function (p) { return p.id === id; });
        if (pb) { html = pagePlaybook(id); title = pb.title + ' — Azure AI Atlas'; }
        else html = notFound();
      } else {
        html = pagePlaybooksIndex();
        title = 'AI Engineering Playbooks — Azure AI Atlas';
      }
    }
    else if (kind === 'gov') {
      html = pageGovernance();
      title = 'Enterprise AI Governance & Landing Zones — Azure AI Atlas';
    }
    else if (kind === 'ops') {
      html = pageOperations();
      title = 'Production AI Operations Centre — Azure AI Atlas';
    }
    else if (kind === 'toolkit') {
      html = pageToolkit();
      title = 'AI Engineering Manager Toolkit — Azure AI Atlas';
    }
    else if (kind === 'labs') {
      html = pageLabs();
      title = 'Hands-on Labs & Learning Roadmaps — Azure AI Atlas';
    }
    else if (kind === 'start') { html = pageStart(); title = 'Start here — Azure AI Atlas'; }
    else if (kind === 'glossary') { html = pageGlossary(); title = 'Glossary — Azure AI Atlas'; }
    else if (!kind) html = pageHome();
    else html = notFound();
    var main = $('#main'); main.innerHTML = html;
    pendingSteppers.forEach(function (spec, i) { mountStepper($('[data-sp="' + i + '"]', main), spec); });
    if (afterRender) afterRender();
    if (html.indexOf('<h1>Not found</h1>') !== 0) { addToc(main); addPager(main, kind, id); }
    renderSide(kind, id);
    document.title = title;
    window.scrollTo(0, 0);
    document.body.classList.remove('nav-open');
    $('#menuBtn').setAttribute('aria-expanded', 'false');
    var cs = $('.side a[aria-current=page]'); if (cs && cs.scrollIntoView) cs.scrollIntoView({ block: 'nearest' });
  }
  window.addEventListener('hashchange', render);

  /* ---------- chrome: nav, theme, search ---------- */
  $('#menuBtn').addEventListener('click', function () {
    var open = document.body.classList.toggle('nav-open'); this.setAttribute('aria-expanded', open);
  });
  $('#scrim').addEventListener('click', function () { document.body.classList.remove('nav-open'); });
  $('#themeBtn').addEventListener('click', function () {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('atlas-theme', next); } catch (e) {}
  });

  /* Forms are live calculators, never navigations (inline onsubmit is blocked by the CSP). */
  document.addEventListener('submit', function (e) { e.preventDefault(); });

  /* ---- Search: index/query logic lives in assets/search.js (unit-tested in Node) ---- */
  var overlay = $('#overlay'), q = $('#q'), resultsEl = $('#results'), filtersEl = $('#searchFilters'), sel = 0, hits = [], kind = 'all';
  var S = window.AtlasSearch, index = S.build(A);
  var kindCounts = {};
  index.forEach(function (it) { kindCounts[it.kind] = (kindCounts[it.kind] || 0) + 1; });
  function paintFilters() {
    filtersEl.innerHTML = [['all', 'All']].concat(S.KINDS.filter(function (k) { return kindCounts[k[0]]; })).map(function (k) {
      return '<button type="button" class="chip' + (k[0] === kind ? ' on' : '') + '" data-kind="' + k[0] + '" aria-pressed="' + (k[0] === kind) + '">' + esc(k[1]) + '</button>';
    }).join('');
  }
  /* Highlights query words. Matching runs on the raw text and each piece is escaped separately, so a query
     such as "amp" can never cut through an HTML entity like &amp;. */
  function mark(text, terms) {
    var words = terms.filter(function (t) { return t.length > 1; }).map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
    if (!words.length) return esc(text);
    var re = new RegExp('(' + words.join('|') + ')', 'ig');
    return String(text).split(re).map(function (part, i) { return i % 2 ? '<mark>' + esc(part) + '</mark>' : esc(part); }).join('');
  }
  function openSearch() { overlay.hidden = false; q.value = ''; kind = 'all'; paintFilters(); runSearch(); q.focus(); }
  function closeSearch() { overlay.hidden = true; }
  function runSearch() {
    hits = S.query(index, q.value, kind, 15); sel = 0; paint();
  }
  function paint() {
    var terms = q.value.toLowerCase().split(/\s+/).filter(Boolean);
    resultsEl.innerHTML = hits.length ? hits.map(function (it, i) {
      return '<li role="option" aria-selected="' + (i === sel) + '"><a href="' + esc(it.href) + '" class="' + (i === sel ? 'sel' : '') + '"><b>' + mark(it.name, terms) +
        ' <small class="muted-s">· ' + esc(it.type) + (it.cat && it.cat !== it.type ? ' · ' + esc(it.cat) : '') + '</small></b><span>' + mark(plain(it.tag).slice(0, 160), terms) + '</span></a></li>';
    }).join('') : '<li class="none">No matches' + (kind !== 'all' ? ' in this filter' : '') + '. Try a service name (“AI Search”), a concept (“throttling”, “vector”), an acronym (“RAG”, “PTU”, “MCP”) or an error code (“429”).' +
      (kind !== 'all' ? ' <button type="button" class="chip" data-kind="all">Search everything</button>' : '') + '</li>';
    var st = $('#searchStatus'); if (st) st.textContent = hits.length + (hits.length === 1 ? ' result' : ' results');
    var cur = resultsEl.querySelector('a.sel'); if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' });
  }
  $('#searchBtn').addEventListener('click', openSearch);
  document.addEventListener('click', function (e) { if (e.target.closest('[data-open-search]')) openSearch(); });
  overlay.addEventListener('click', function (e) {
    var chip = e.target.closest('[data-kind]');
    if (chip) { kind = chip.getAttribute('data-kind'); paintFilters(); runSearch(); q.focus(); return; }
    if (e.target === overlay || e.target.closest('a')) closeSearch();
  });
  q.addEventListener('input', runSearch);
  q.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(hits.length - 1, sel + 1); paint(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); paint(); }
    else if (e.key === 'Enter' && hits[sel]) { location.hash = hits[sel].href; closeSearch(); }
  });
  document.addEventListener('keydown', function (e) {
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || ''));
    if (e.key === 'Escape') closeSearch();
    else if ((e.key === '/' && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) { e.preventDefault(); openSearch(); }
  });

  render();
})();
