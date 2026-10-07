/* ==========================================================================
   pages.js — templates rendered from the shared data: service and
   sub-service pages (R08–R10), profiles (R35), the A–Z (R03), section
   landing counts, and the configuration view (R42).

   Service and profile pages are one template each, driven by ?id=, so every
   one of the services and every fictional person has a working page.
   ========================================================================== */

(function () {
  'use strict';

  var TS = window.TS;
  var D = window.TS_DATA;
  if (!TS || !D) return;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return TS.esc(s); }
  function param(k) { return new URLSearchParams(window.location.search).get(k); }
  function svcUrl(s) { return TS.pageUrl('service.html', { id: s.id }); }
  function personUrl(p) { return TS.pageUrl('profile.html', { id: p.id }); }
  function li(href, text) { return '<li><a href="' + href + '">' + esc(text) + '</a></li>'; }

  function personMini(p) {
    return '<div class="person-mini"><div class="wf-placeholder avatar">Photo</div><div><a href="' + personUrl(p) + '"><strong>' +
      esc(p.name) + '</strong></a><p>' + esc(p.position) + ' · ' + esc(p.office) + '</p></div></div>';
  }

  function knowledgeFor(names) {
    return TS.docs.filter(function (d) {
      return (d.cat === 'knowledge' || d.cat === 'news' || d.cat === 'events') &&
        (d.facets.service || []).some(function (s) { return names.indexOf(s) >= 0; });
    }).sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
  }

  function itemList(docs, empty) {
    if (!docs.length) return '<p class="wf-meta">' + empty + '</p>';
    return docs.map(function (d) {
      return '<div class="result"><div><p class="result-type">' + esc(d.typeLabel) + '</p><h3><a href="' + d.url + '">' +
        esc(d.title) + '</a></h3><p class="result-meta">' + esc(TS.formatDate(d.date)) + '</p></div></div>';
    }).join('');
  }

  /* --- Service and sub-service page ------------------------------------ */
  function renderService(host) {
    var s = TS.serviceById[param('id') || 'pensions'] || TS.serviceById.pensions;
    var parent = s.parent ? TS.serviceById[s.parent] : null;
    document.title = s.name + ' — Travers Smith prototype';

    var family = [s.name].concat(s.children.map(function (c) { return TS.serviceById[c].name; }));
    if (parent) family.push(parent.name);
    var contacts = TS.people.filter(function (p) {
      return p.services.indexOf(s.name) >= 0 || p.sectors.indexOf(s.name) >= 0;
    });
    if (!contacts.length && parent) contacts = TS.people.filter(function (p) { return p.services.indexOf(parent.name) >= 0; });

    var crumbs = '<li class="breadcrumb-item"><a href="' + TS.pageUrl('home.html') + '">Home</a></li>' +
      '<li class="breadcrumb-item"><a href="' + TS.pageUrl('services.html') + '">Services</a></li>' +
      (s.kind === 'Sector' ? '<li class="breadcrumb-item"><a href="' + TS.pageUrl('services.html') + '#by-sector">Sectors</a></li>' : '') +
      (parent ? '<li class="breadcrumb-item"><a href="' + svcUrl(parent) + '">' + esc(parent.name) + '</a></li>' : '') +
      '<li class="breadcrumb-item" aria-current="page">' + esc(s.name) + '</li>';

    var html = '<!-- Breadcrumb from canonical position (R09) --><nav class="breadcrumb" aria-label="Breadcrumb"><ul class="breadcrumb-list">' + crumbs + '</ul></nav>' +
      '<p class="result-type">' + esc(s.kind) + (parent ? ' of ' + esc(parent.name) : '') + '</p>' +
      '<!-- H1 matches the menu label (R12) --><h1>' + esc(s.name) + '</h1>' +
      '<p class="page-intro">' + (parent
        ? 'Part of our ' + esc(parent.name) + ' practice. A short introduction of two or three sentences sets out who this advice is for, the problems it solves, and what makes the team different.'
        : 'A short introduction of two or three sentences sets out who this practice acts for, the problems it solves, and what makes the team different. It is written for a client, not for the firm.') + '</p>';

    if (s.children.length) {
      html += '<!-- Sub-services directly under the introduction (R08) --><section aria-labelledby="in-practice"><h2 id="in-practice" class="section-title">In this practice</h2>' +
        '<ul class="subservice-list">' + s.children.map(function (cid) { var c = TS.serviceById[cid]; return li(svcUrl(c), c.name); }).join('') + '</ul>' +
        '<p class="wf-note" data-note="1"><span class="wf-note-label">Why it is here</span>Today, the most specific pages on the site depend on search, the A–Z page or links low down the service page to be found (F02). Here every sub-service is listed directly beneath the introduction, and is also one click away in the Services menu.</p></section>';
    }
    if (parent) {
      html += '<!-- Parent and siblings (R10) --><section aria-labelledby="also-in"><h2 id="also-in" class="section-title">Also in ' + esc(parent.name) + '</h2>' +
        '<ul class="subservice-list">' + parent.children.map(function (cid) {
          var c = TS.serviceById[cid];
          return '<li><a href="' + svcUrl(c) + '"' + (c.id === s.id ? ' aria-current="page"' : '') + '>' + esc(c.name) + '</a></li>';
        }).join('') + '</ul>' +
        '<p class="wf-note" data-note="1"><span class="wf-note-label">Behaviour</span>A sub-service page shows its parent in the breadcrumb and its siblings here, so a visitor who lands from search can see the rest of the practice without going back.</p></section>';
    }

    html += '<div class="layout-main-aside"><div>' +
      '<section><h2 class="section-title">How we help</h2><p>Two or three paragraphs describe the kinds of matter the team handles, in the client’s language. Each paragraph is around sixty words, long enough to test the layout against real copy rather than a single line.</p>' +
      '<p>A second paragraph covers the types of client, the jurisdictions involved, and how the team works with neighbouring practices across the firm.</p></section>' +
      '<section><h2 class="section-title">Recent work and thinking</h2>' + itemList(knowledgeFor(family).slice(0, 5), 'No tagged items in the prototype data for this service.') +
      '<p><a href="' + TS.pageUrl('search.html', { type: 'knowledge', scope: 'knowledge', service: s.name }) + '">All knowledge on ' + esc(s.name) + '</a></p></section>' +
      '</div><aside>' +
      '<!-- Section search on a service page (R28) --><div class="aside-box"><h2>Search within ' + esc(s.name) + '</h2>' +
      '<form action="' + TS.pageUrl('search.html') + '" method="get" role="search">' +
      '<input type="hidden" name="scope" value="service"><input type="hidden" name="service" value="' + esc(s.kind === 'Sector' ? '' : s.name) + '">' +
      '<div class="search-row"><div class="ta-wrap"><label class="visually-hidden" for="svc-q">Search within ' + esc(s.name) + '</label>' +
      '<input type="search" id="svc-q" name="q" data-typeahead data-scope="service" placeholder="e.g. guidance, trustees" autocomplete="off"></div><button class="btn btn-small" type="submit">Go</button></div></form>' +
      '<p class="wf-meta">Same engine as site search, scoped to this service. The scope shows as a chip you can remove.</p></div>' +
      '<div class="aside-box"><h2>Key contacts</h2>' + (contacts.length ? contacts.slice(0, 4).map(personMini).join('') : '<p class="wf-meta">No contacts tagged in the prototype data.</p>') +
      (contacts.length ? '<p><a href="' + TS.pageUrl('search.html', { type: 'people', scope: 'people', service: contacts[0].services.indexOf(s.name) >= 0 ? s.name : (parent ? parent.name : s.name) }) + '">Everyone in this team</a></p>' : '') + '</div>' +
      '<div class="aside-box"><h2>Related</h2><ul>' + li(TS.pageUrl('services.html'), 'A–Z of all services') + li('#', 'Case studies') + '</ul></div>' +
      '</aside></div>';

    host.innerHTML = html;
    if (window.TSTypeahead) window.TSTypeahead.attach($('svc-q'));
    if (s.kind === 'Sector') {
      var hidden = host.querySelector('input[name="service"]');
      hidden.name = 'sector';
      hidden.value = s.name;
    }
  }

  /* --- Profile (R35) ---------------------------------------------------- */
  function renderProfile(host) {
    var p = TS.personById[param('id')] || TS.people[0];
    document.title = p.name + ' — Travers Smith prototype';

    var related = TS.people.filter(function (o) { return o.id !== p.id; }).map(function (o) {
      var score = 0;
      o.services.forEach(function (s) { if (p.services.indexOf(s) >= 0) score += 2; });
      o.sectors.forEach(function (s) { if (p.sectors.indexOf(s) >= 0) score += 1; });
      if (score && o.office === p.office) score += 0.5;
      return { o: o, score: score };
    }).filter(function (x) { return x.score > 0; })
      .sort(function (a, b) { return b.score - a.score || a.o.name.localeCompare(b.o.name); }).slice(0, 4);

    var authored = TS.docs.filter(function (d) { return (d.facets.author || []).indexOf(p.name) >= 0; })
      .sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });

    function chip(label, params) {
      return '<li><a href="' + TS.pageUrl('search.html', Object.assign({ type: 'people', scope: 'people' }, params)) + '">' + esc(label) + '</a></li>';
    }

    host.innerHTML = '<nav class="breadcrumb" aria-label="Breadcrumb"><ul class="breadcrumb-list">' +
      '<li class="breadcrumb-item"><a href="' + TS.pageUrl('home.html') + '">Home</a></li>' +
      '<li class="breadcrumb-item"><a href="' + TS.pageUrl('people.html') + '">People</a></li>' +
      '<li class="breadcrumb-item" aria-current="page">' + esc(p.name) + '</li></ul></nav>' +
      '<div class="profile-head"><div class="wf-placeholder avatar ratio-1-1">Portrait</div><div>' +
      '<h1>' + esc(p.name) + '</h1><p class="page-intro">' + esc(p.position) + ', ' + esc(p.services[0]) + ' · ' + esc(p.office) + '</p>' +
      '<dl class="dl-grid"><dt>Email</dt><dd><a href="#">Email ' + esc(p.name.split(' ')[0]) + '</a></dd><dt>Telephone</dt><dd>Office number</dd><dt>vCard</dt><dd><a href="#">Download</a></dd></dl>' +
      '</div></div>' +
      '<!-- Profile metadata as routes into the directory (R35) --><section aria-labelledby="expertise"><h2 id="expertise" class="section-title">Expertise</h2>' +
      '<p class="wf-meta">Each of these opens the people directory, filtered to everyone who shares it.</p>' +
      '<ul class="tag-links">' + p.services.map(function (s) { return chip(s, { service: s }); }).join('') +
      p.sectors.map(function (s) { return chip(s + ' (sector)', { sector: s }); }).join('') +
      chip('Everyone in ' + p.office, { office: p.office }) + chip('All ' + p.position.toLowerCase() + 's', { position: p.position }) + '</ul>' +
      '<p class="wf-note" data-note="1"><span class="wf-note-label">Why it is here</span>Today a profile holds this metadata but does not use it (F26). Here the service, sector, office and position become links into the directory, filtered, using the same engine as search.</p></section>' +
      '<div class="layout-main-aside"><div><section><h2 class="section-title">About</h2><p>' + esc(p.summary) + '</p>' +
      '<p>A biography of two or three paragraphs: representative matters, the clients ' + esc(p.name.split(' ')[0]) + ' acts for, and recognition in the legal directories.</p></section>' +
      '<section><h2 class="section-title">Insights by ' + esc(p.name.split(' ')[0]) + '</h2>' + itemList(authored.slice(0, 4), 'No authored items in the prototype data.') +
      (authored.length ? '<p><a href="' + TS.pageUrl('search.html', { author: p.name }) + '">Everything by ' + esc(p.name) + '</a></p>' : '') + '</section></div>' +
      '<aside><!-- Related people, generated from shared metadata (R35) --><div class="aside-box"><h2>Related people</h2>' +
      (related.length ? related.map(function (x) { return personMini(x.o); }).join('') : '<p class="wf-meta">None in the prototype data.</p>') +
      '<p class="wf-meta">Generated from shared services, sectors and office. No manual curation.</p></div></aside></div>';
  }

  /* --- A–Z page (R03) --------------------------------------------------- */
  function expandAll(host) {
    host.querySelectorAll('.svc-toggle').forEach(function (b) { if (b.getAttribute('aria-expanded') !== 'true') b.click(); });
  }

  /* --- Section landing counts ------------------------------------------- */
  function renderCounts() {
    document.querySelectorAll('[data-count-people]').forEach(function (n) {
      var parts = n.getAttribute('data-count-people').split('=');
      var c = TS.people.filter(function (p) { return p[parts[0]] === parts[1]; }).length;
      n.textContent = '(' + c + ')';
    });
    document.querySelectorAll('[data-count-ktype]').forEach(function (n) {
      var types = n.getAttribute('data-count-ktype').split('|');
      var c = TS.docs.filter(function (d) { return (d.facets.ktype || []).some(function (t) { return types.indexOf(t) >= 0; }); }).length;
      n.textContent = '(' + c + ')';
    });
    document.querySelectorAll('[data-count-cat]').forEach(function (n) {
      var cat = n.getAttribute('data-count-cat');
      n.textContent = '(' + TS.docs.filter(function (d) { return d.cat === cat; }).length + ')';
    });
  }

  function renderLatest(host) {
    var n = parseInt(host.getAttribute('data-latest'), 10) || 5;
    var docs = TS.docs.filter(function (d) { return d.cat === 'knowledge' || d.cat === 'news'; })
      .sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); }).slice(0, n);
    host.innerHTML = itemList(docs, '');
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
    if ($('config-app')) renderConfig($('config-app'));
    document.querySelectorAll('[data-expand-all]').forEach(expandAll);
    document.querySelectorAll('[data-latest]').forEach(renderLatest);
    renderCounts();
  });
})();
