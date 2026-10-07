/* ==========================================================================
   pages.js — destination pages and the configuration view.

   The service, profile and other content pages exist today and are NOT
   changed by this work. In the prototype they are placeholders, so that the
   navigation and search have somewhere real-looking to land. The only part
   of them that changes is what the navigation feeds them: the breadcrumb
   reflects the page's place in the menu (R09).
   ========================================================================== */

(function () {
  'use strict';

  var TS = window.TS;
  var D = window.TS_DATA;
  if (!TS || !D) return;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return TS.esc(s); }
  function param(k) { return new URLSearchParams(window.location.search).get(k); }
  function crumb(href, text) { return '<li class="breadcrumb-item"><a href="' + href + '">' + esc(text) + '</a></li>'; }

  function unchanged(label) {
    return '<div class="wf-placeholder unchanged">Existing ' + esc(label) + ' &mdash; layout and content unchanged by this work</div>';
  }

  /* --- Service, sub-service or sector page (destination only) ---------- */
  function renderService(host) {
    var s = TS.serviceById[param('id') || 'pensions'] || TS.serviceById.pensions;
    var parent = s.parent ? TS.serviceById[s.parent] : null;
    document.title = s.name + ' — Travers Smith prototype';
    host.innerHTML =
      '<!-- Existing breadcrumb, fed from the page’s one place in the navigation (R09) -->' +
      '<nav class="breadcrumb" aria-label="Breadcrumb"><ul class="breadcrumb-list">' +
      crumb(TS.pageUrl('home.html'), 'Home') +
      crumb(TS.pageUrl('existing.html', { page: 'services' }), 'Services') +
      (parent ? crumb(TS.pageUrl('service.html', { id: parent.id }), parent.name) : '') +
      '<li class="breadcrumb-item" aria-current="page">' + esc(s.name) + '</li></ul></nav>' +
      '<!-- H1 matches the menu label that led here (R12) --><h1>' + esc(s.name) + '</h1>' +
      unchanged(s.kind === 'Sector' ? 'sector page' : 'service page');
  }

  /* --- Profile page (destination only) --------------------------------- */
  function renderProfile(host) {
    var p = TS.personById[param('id')] || TS.people[0];
    document.title = p.name + ' — Travers Smith prototype';
    host.innerHTML =
      '<nav class="breadcrumb" aria-label="Breadcrumb"><ul class="breadcrumb-list">' +
      crumb(TS.pageUrl('home.html'), 'Home') +
      crumb(TS.pageUrl('search.html', { type: 'people', scope: 'people' }), 'People') +
      '<li class="breadcrumb-item" aria-current="page">' + esc(p.name) + '</li></ul></nav>' +
      '<h1>' + esc(p.name) + '</h1>' +
      '<p class="wf-meta">' + esc(p.position) + ' · ' + esc(p.services[0]) + ' · ' + esc(p.office) + ' (fictional person)</p>' +
      unchanged('profile page');
  }

  /* --- Any other existing page ------------------------------------------ */
  var EXISTING = {
    services: ['Services', 'Services A–Z page. Today’s A–Z, now linked from the Services menu and the footer'],
    home: ['Home', 'home page']
  };
  function renderExisting(host) {
    var key = param('page') || 'services';
    var e = EXISTING[key] || [key, key + ' page'];
    document.title = e[0] + ' — Travers Smith prototype';
    host.innerHTML =
      '<nav class="breadcrumb" aria-label="Breadcrumb"><ul class="breadcrumb-list">' +
      crumb(TS.pageUrl('home.html'), 'Home') +
      '<li class="breadcrumb-item" aria-current="page">' + esc(e[0]) + '</li></ul></nav>' +
      '<h1>' + esc(e[0]) + '</h1>' + unchanged(e[1]);
  }

  /* --- Configuration view (R42) ----------------------------------------- */
  function renderConfig(host) {
    var C = D.CONFIG;
    var tiers = Object.keys(C.tiers).sort(function (a, b) { return C.tiers[b] - C.tiers[a]; });
    host.innerHTML =
      '<h2 class="section-title">Ranking tiers</h2><table class="config-table"><thead><tr><th>Page type</th><th>Weight</th></tr></thead><tbody>' +
      tiers.map(function (t) { return '<tr><td>' + esc(t) + '</td><td>× ' + C.tiers[t] + '</td></tr>'; }).join('') + '</tbody></table>' +
      '<h2 class="section-title">Synonym groups</h2><table class="config-table"><thead><tr><th>Any of these finds the others</th></tr></thead><tbody>' +
      C.synonyms.map(function (g) { return '<tr><td>' + g.map(esc).join(' · ') + '</td></tr>'; }).join('') + '</tbody></table>' +
      '<h2 class="section-title">Facet fields</h2><table class="config-table"><thead><tr><th>Key</th><th>Label shown</th></tr></thead><tbody>' +
      C.facets.map(function (f) { return '<tr><td><code>' + esc(f.key) + '</code></td><td>' + esc(f.label) + '</td></tr>'; }).join('') + '</tbody></table>' +
      '<h2 class="section-title">Result categories, in tab order</h2><table class="config-table"><tbody>' +
      C.categories.map(function (c) { return '<tr><td>' + esc(c.label) + '</td></tr>'; }).join('') + '</tbody></table>' +
      '<h2 class="section-title">Promoted results (later phase)</h2><table class="config-table"><thead><tr><th>Query</th><th>Pinned page</th></tr></thead><tbody>' +
      Object.keys(C.bestBets).map(function (k) {
        var d = TS.docs.filter(function (x) { return x.id === C.bestBets[k]; })[0];
        return '<tr><td><a href="' + TS.pageUrl('search.html', { q: k }) + '">' + esc(k) + '</a></td><td>' + esc(d ? d.title : C.bestBets[k]) + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    if ($('service-app')) renderService($('service-app'));
    if ($('profile-app')) renderProfile($('profile-app'));
    if ($('existing-app')) renderExisting($('existing-app'));
    if ($('config-app')) renderConfig($('config-app'));
  });
})();
