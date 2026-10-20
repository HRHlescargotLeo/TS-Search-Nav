/* ==========================================================================
   models.js — switches the prototype between navigation models (v1.3).

   Every open decision from Workshop 1 is a "slot" with numbered options.
   A model is a preset of slot options; "Mix and match" sets any slot by hand.

     S  Services menu      1 v1: A–Z + views   2 Client groups
                           3 Issue-led         4 Focus areas + A–Z
     H  Top of each panel  0 Links only        1 Short overview   2 Promo banner
     P  People in the menu 1 People menu       2 No People menu (Find a lawyer only)
     C  People panel       1 Search, position and surname
                           2 Search and position                  3 Search only
     Q  Suggested searches 0 None   1 Curated, site-wide   2 Trending topics in Knowledge only
     F  Results filters    1 Sidebar   2 Top bar

   This file is loaded at the very top of <body>, before the header, so the
   chosen options are on <html> as data attributes before anything paints.
   CSS then shows only the matching variants:
     data-only="S2"     shown only when slot S is option 2
     data-hide="H2 C3"  hidden when any listed option is active

   The choice is kept for the browser session, and the address bar carries
   ?model=B (or ?slots=S2-H1-P1-C2-Q2-F2) so a link opens the same model.
   ========================================================================== */

(function () {
  'use strict';

  var SLOTS = [
    { key: 's', label: 'Services menu', options: { 1: 'All practices A–Z, with views', 2: 'Client groups', 3: 'Issue-led', 4: 'Focus areas, then A–Z' } },
    { key: 'h', label: 'Top of each menu panel', options: { 0: 'Links only', 1: 'Short section overview', 2: 'Promo banner' } },
    { key: 'p', label: 'People in the menu', options: { 1: 'People menu', 2: 'No People menu: Find a lawyer only' } },
    { key: 'c', label: 'People menu contents', options: { 1: 'Search, position and surname', 2: 'Search and position', 3: 'Search only' } },
    { key: 'q', label: 'Suggested searches', options: { 0: 'None', 1: 'Curated, in the search box', 2: 'Trending topics in Knowledge only' } },
    { key: 'f', label: 'Results filters', options: { 1: 'Sidebar', 2: 'Top bar' } }
  ];

  var MODELS = {
    A: { name: 'v1 refined', slots: { s: '1', h: '0', p: '1', c: '2', q: '1', f: '2' },
      summary: 'Every practice and sub-service in the Services menu, with views by type of work and sector. The workshop version, tidied.' },
    B: { name: 'Client groups', slots: { s: '2', h: '1', p: '1', c: '2', q: '2', f: '2' },
      summary: 'Existing services regrouped under Travers Smith’s client groups. Placeholder groupings until the real headings arrive.' },
    C: { name: 'Issue-led', slots: { s: '3', h: '1', p: '2', c: '3', q: '2', f: '1' },
      summary: 'Client group, then client issue, then the services that solve it. Asset managers worked through as the example.' },
    D: { name: 'Lean, search-first', slots: { s: '4', h: '2', p: '2', c: '3', q: '0', f: '1' },
      summary: 'A few focus areas up front and the full A–Z one click away; search does the finding.' }
  };
  var ORDER = ['A', 'B', 'C', 'D'];
  var STORE = 'ts-nav-model';

  function valid(slots) {
    return SLOTS.every(function (s) { return slots[s.key] && s.options[slots[s.key]]; });
  }
  function encode(slots) {
    return SLOTS.map(function (s) { return s.key.toUpperCase() + slots[s.key]; }).join('-');
  }
  function decode(str) {
    var out = {};
    (str || '').split('-').forEach(function (part) {
      var m = /^([a-z])(\d)$/i.exec(part);
      if (m) out[m[1].toLowerCase()] = m[2];
    });
    return valid(out) ? out : null;
  }
  function modelFor(slots) {
    for (var i = 0; i < ORDER.length; i++) {
      var preset = MODELS[ORDER[i]].slots;
      if (SLOTS.every(function (s) { return preset[s.key] === slots[s.key]; })) return ORDER[i];
    }
    return '';
  }
  function copy(o) { var r = {}; Object.keys(o).forEach(function (k) { r[k] = o[k]; }); return r; }

  /* Address bar first, then this session, then Model A. */
  function initial() {
    var p = new URLSearchParams(window.location.search);
    var fromUrl = decode(p.get('slots'));
    if (fromUrl) return fromUrl;
    var m = (p.get('model') || '').toUpperCase();
    if (MODELS[m]) return copy(MODELS[m].slots);
    try {
      var saved = decode(window.sessionStorage.getItem(STORE));
      if (saved) return saved;
    } catch (e) { /* storage blocked: fall through */ }
    return copy(MODELS.A.slots);
  }

  var current = initial();

  function apply() {
    var root = document.documentElement;
    SLOTS.forEach(function (s) { root.setAttribute('data-' + s.key, current[s.key]); });
    root.setAttribute('data-model', modelFor(current) || 'custom');
    try { window.sessionStorage.setItem(STORE, encode(current)); } catch (e) { /* ignore */ }
  }
  apply();

  /* Keep the address bar in step, so a copied link opens this model. */
  function syncUrl() {
    var p = new URLSearchParams(window.location.search);
    var m = modelFor(current);
    p.delete('model'); p.delete('slots');
    if (m) p.set('model', m); else p.set('slots', encode(current));
    window.history.replaceState(window.history.state, '', window.location.pathname + '?' + p.toString() + window.location.hash);
  }

  /* --- The model bar ---------------------------------------------------- */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  function render(bar) {
    var m = modelFor(current);
    var tabs = ORDER.map(function (k) {
      return '<button type="button" class="model-tab" data-model-pick="' + k + '" aria-pressed="' + (m === k) + '">' +
        '<span class="model-key">' + k + '</span> ' + esc(MODELS[k].name) + '</button>';
    }).join('');
    var selects = SLOTS.map(function (s) {
      var opts = Object.keys(s.options).map(function (o) {
        return '<option value="' + o + '"' + (current[s.key] === o ? ' selected' : '') + '>' + esc(s.options[o]) + '</option>';
      }).join('');
      return '<div class="model-field"><label for="slot-' + s.key + '">' + esc(s.label) + '</label>' +
        '<select id="slot-' + s.key + '" data-slot="' + s.key + '">' + opts + '</select></div>';
    }).join('');
    var open = bar.querySelector('.model-mix') && !bar.querySelector('.model-mix').hidden;
    bar.innerHTML =
      '<div class="container model-bar-inner">' +
        '<span class="model-label" id="model-label">Prototype: navigation model</span>' +
        '<div class="model-tabs" role="group" aria-labelledby="model-label">' + tabs + '</div>' +
        '<button type="button" class="model-mix-toggle" aria-expanded="' + !!open + '" aria-controls="model-mix">' +
          (m ? 'Mix and match' : 'Custom mix') + '</button>' +
      '</div>' +
      '<div class="model-mix" id="model-mix"' + (open ? '' : ' hidden') + '>' +
        '<div class="container">' +
          '<p class="model-summary">' + (m ? '<strong>Model ' + m + ': ' + esc(MODELS[m].name) + '.</strong> ' + esc(MODELS[m].summary)
            : '<strong>Custom mix.</strong> Pick a model above to go back to a preset.') + '</p>' +
          '<div class="model-fields">' + selects + '</div>' +
        '</div>' +
      '</div>';
  }

  function set(next) {
    current = next;
    apply();
    syncUrl();
    var bar = document.getElementById('model-bar');
    if (bar) render(bar);
    document.dispatchEvent(new CustomEvent('ts:model-change', { detail: copy(current) }));
  }

  document.addEventListener('DOMContentLoaded', function () {
    var bar = document.getElementById('model-bar');
    if (!bar) return;
    render(bar);
    bar.addEventListener('click', function (e) {
      var pick = e.target.closest('[data-model-pick]');
      if (pick) {
        set(copy(MODELS[pick.getAttribute('data-model-pick')].slots));
        bar.querySelector('[data-model-pick="' + pick.getAttribute('data-model-pick') + '"]').focus();
        return;
      }
      var t = e.target.closest('.model-mix-toggle');
      if (t) {
        var mix = document.getElementById('model-mix');
        mix.hidden = !mix.hidden;
        t.setAttribute('aria-expanded', String(!mix.hidden));
      }
    });
    bar.addEventListener('change', function (e) {
      var sel = e.target.closest('[data-slot]');
      if (!sel) return;
      var next = copy(current);
      next[sel.getAttribute('data-slot')] = sel.value;
      set(next);
      var again = document.getElementById(sel.id);
      if (again) again.focus();
    });
    bar.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var mix = document.getElementById('model-mix');
      if (mix && !mix.hidden) {
        mix.hidden = true;
        var t = bar.querySelector('.model-mix-toggle');
        t.setAttribute('aria-expanded', 'false');
        t.focus();
      }
    });
    if (window.location.search.indexOf('model=') < 0 && window.location.search.indexOf('slots=') < 0) syncUrl();
  });

  window.TSModels = {
    get: function (key) { return current[key]; },
    MODELS: MODELS, SLOTS: SLOTS, encode: encode
  };
})();
