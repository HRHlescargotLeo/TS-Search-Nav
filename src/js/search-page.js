/* ==========================================================================
   search-page.js — the unified results page (R20–R28, R30–R32, R34,
   R36–R41, R50). Runs only where #search-app exists.

   All state lives in the URL (R27): every control below changes the state,
   pushes it to the address bar and re-renders from it, so Back, Forward,
   bookmarks and pasted links all land on exactly the same view.
   ========================================================================== */

(function () {
  'use strict';

  var TS = window.TS;
  var D = window.TS_DATA;
  if (!TS || !D) return;

  var C = D.CONFIG;
  var PER_PAGE = 10;
  var CAT_LABEL = {};
  C.categories.forEach(function (c) { CAT_LABEL[c.key] = c.label; });
  var FACET_LABEL = {};
  C.facets.forEach(function (f) { FACET_LABEL[f.key] = f.label; });

  /* Which facets make sense for which result type. */
  var FACETS_FOR = {
    '': ['service', 'sector', 'ktype', 'topic', 'year', 'position', 'office', 'author'],
    people: ['service', 'sector', 'position', 'office'],
    services: ['sector'],
    knowledge: ['service', 'ktype', 'topic', 'author', 'year'],
    news: ['service', 'year'],
    events: ['service', 'topic', 'year'],
    documents: ['service', 'year'],
    pages: []
  };
  var SCOPE_LABEL = { people: 'People', knowledge: 'Knowledge' };

  var state;
  var app;
  var ui = { expanded: {}, openDrop: null, panelOpen: null };

  function $(id) { return document.getElementById(id); }
  function esc(s) { return TS.esc(s); }
  function q(s) { return '‘' + esc(s) + '’'; }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
  function hasFilters(s) {
    return TS.FACET_KEYS.some(function (k) { return s.filters[k] && s.filters[k].length; }) || !!s.letter;
  }
  function isBrowse(s) { return !s.q && !s.type && !hasFilters(s); }

  /* --- State changes ------------------------------------------------------ */
  function commit(push) {
    var params = TS.toParams(state);
    var qs = new URLSearchParams(params).toString();
    var url = window.location.pathname + (qs ? '?' + qs : '');
    if (push) window.history.pushState(null, '', url);
    else window.history.replaceState(null, '', url);
    render();
  }
  function update(fn) {
    fn(state);
    commit(true);
  }

  /* --- Render ------------------------------------------------------------- */
  function render() {
    var focusId = document.activeElement && document.activeElement.id;
    var r = TS.search(state);

    var input = $('sr-q');
    if (input && document.activeElement !== input) input.value = state.q;

    renderBanners(r);
    renderTabs(r);
    renderChips();
    renderToolbar(r);

    var browse = isBrowse(state);
    $('sr-body').hidden = browse;
    $('sr-browse').hidden = !browse;
    if (browse) {
      renderBrowse(r);
    } else {
      renderFacets(r);
      renderResults(r);
    }

    if (focusId && $(focusId)) $(focusId).focus({ preventScroll: true });
  }

  function renderBanners(r) {
    var out = [];
    if (r.correctedTo) {
      out.push('<div class="banner"><!-- Spelling correction (R30) -->No results for ' + q(r.correctedFrom) +
        '. Showing results for <strong>' + q(r.correctedTo) + '</strong> instead. ' +
        '<button type="button" class="btn-link" data-action="raw">Search for ' + q(r.correctedFrom) + ' exactly</button></div>');
    }
    Object.keys(r.synonyms).forEach(function (orig) {
      out.push('<div class="banner banner-muted"><!-- Synonyms (R31) -->Also showing results for ' +
        r.synonyms[orig].map(q).join(', ') + ', which mean the same as ' + q(orig) + '.</div>');
    });
    if (state.scope && !r.correctedTo) {
      var inScope = state.type ? r.tabCounts[state.type] : r.total;
      var outside = r.total - inScope;
      var label = state.scope === 'service' ? (state.filters.service[0] || 'this service') : SCOPE_LABEL[state.scope] || state.scope;
      var where = state.scope === 'service' ? 'within ' + esc(label) : esc(label) + ' only';
      var widen;
      if (state.scope === 'service') {
        var all = TS.search(Object.assign({}, state, { filters: Object.assign({}, state.filters, { service: [] }) }));
        outside = all.total - r.total;
      }
      if (state.q) {
        widen = outside > 0
          ? plural(outside, 'more result') + ' outside this section. '
          : 'Nothing else on the site matches. ';
        out.push('<div class="banner"><!-- Section search, widenable (R28) -->You are searching ' + where + '. ' + widen +
          '<button type="button" class="btn-link" data-action="widen">Search the whole site</button></div>');
      }
    }
    $('sr-banners').innerHTML = out.join('');
  }

  function renderTabs(r) {
    var html = '<button type="button" class="cat-tab" id="tab-all" aria-pressed="' + (!state.type) + '" data-type="">All <span class="n">' + r.total + '</span></button>';
    C.categories.forEach(function (c) {
      var n = r.tabCounts[c.key];
      var on = state.type === c.key;
      html += '<button type="button" class="cat-tab" id="tab-' + c.key + '" aria-pressed="' + on + '" data-type="' + c.key + '"' +
        (!n && !on ? ' disabled' : '') + '>' + esc(c.label) + ' <span class="n">' + n + '</span></button>';
    });
    $('sr-tabs').innerHTML = html;
  }

  function renderChips() {
    var chips = [];
    if (state.scope === 'people' || state.scope === 'knowledge') {
      chips.push({ cls: 'scope', k: 'Searching', v: SCOPE_LABEL[state.scope] + ' only', act: 'widen' });
    }
    if (state.letter) chips.push({ k: 'Surname', v: state.letter, act: 'letter' });
    TS.FACET_KEYS.forEach(function (key) {
      (state.filters[key] || []).forEach(function (v, i) {
        if (state.scope === 'service' && key === 'service' && i === 0) {
          chips.push({ cls: 'scope', k: 'Within', v: v, act: 'widen' });
          return;
        }
        chips.push({ k: FACET_LABEL[key], v: v, act: 'facet', key: key });
      });
    });
    var html = chips.map(function (c, i) {
      return '<button type="button" class="chip ' + (c.cls || '') + '" id="chip-' + i + '" data-action="' + c.act + '"' +
        (c.key ? ' data-key="' + c.key + '" data-value="' + esc(c.v) + '"' : '') +
        ' aria-label="Remove ' + esc(c.k + ': ' + c.v) + '"><span><span class="chip-k">' + esc(c.k) + ':</span> ' + esc(c.v) +
        '</span><span class="x" aria-hidden="true">&times;</span></button>';
    }).join('');
    if (chips.length > 1) html += '<button type="button" class="btn-link" id="chip-clear" data-action="clear">Clear all</button>';
    $('sr-chips').innerHTML = html;
    $('sr-chips').hidden = !chips.length;
  }

  function renderToolbar(r) {
    var shown = state.type ? r.tabCounts[state.type] : r.total;
    var what = state.type ? CAT_LABEL[state.type].toLowerCase() : 'results';
    var text;
    if (isBrowse(state)) text = 'Everything on the site, by type: ' + plural(r.total, 'item') + '.';
    else if (state.q) text = shown + ' ' + (shown === 1 && !state.type ? 'result' : what) + ' for ' + q(r.correctedTo || state.q);
    else text = 'Showing ' + shown + ' ' + what;
    $('sr-count').innerHTML = text;
    $('sr-sort').value = state.sort;
    document.querySelectorAll('#sr-layout button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-layout') === state.layout));
    });
    $('sr-body').className = 'sr-body layout-' + state.layout;
  }

  /* --- Facets (R23, R25, R39) -------------------------------------------- */
  function facetGroup(key, values, inDrop) {
    var selected = state.filters[key] || [];
    var visible = values.filter(function (v) { return v.count > 0 || selected.indexOf(v.value) >= 0; });
    if (!visible.length) return '';
    var limit = 5;
    var expanded = ui.expanded[key];
    var showFilter = visible.length > 8;
    var html = '<fieldset class="facet" data-facet="' + key + '"><legend>' + esc(FACET_LABEL[key]) + '</legend>';
    if (showFilter) {
      html += '<label class="visually-hidden" for="ff-' + key + '">Filter ' + esc(FACET_LABEL[key].toLowerCase()) + ' options</label>' +
        '<input type="search" class="facet-filter" id="ff-' + key + '" data-facet-filter="' + key + '" placeholder="Filter ' + esc(FACET_LABEL[key].toLowerCase()) + '…" autocomplete="off">';
    }
    visible.forEach(function (v, i) {
      var on = selected.indexOf(v.value) >= 0;
      var hide = !expanded && i >= limit && !on;
      var id = 'f-' + key + '-' + TS.slug(v.value);
      html += '<label class="facet-opt"' + (hide ? ' data-extra hidden' : '') + ' data-v="' + esc(TS.norm(v.value)) + '">' +
        '<input type="checkbox" id="' + id + '" data-key="' + key + '" value="' + esc(v.value) + '"' + (on ? ' checked' : '') + '>' +
        '<span>' + esc(v.value) + '</span><span class="n">' + v.count + '</span></label>';
    });
    if (visible.length > limit) {
      html += '<button type="button" class="btn-link" id="more-' + key + (inDrop ? '-d' : '') + '" data-more="' + key + '">' +
        (expanded ? 'Show fewer' : 'Show all ' + visible.length) + '</button>';
    }
    return html + '</fieldset>';
  }

  function renderFacets(r) {
    var keys = FACETS_FOR[state.type || ''] || [];
    var aside = $('sr-facets');
    var bar = $('sr-facetbar');
    if (state.layout === 'topbar') {
      aside.hidden = true;
      aside.innerHTML = '';
      bar.hidden = false;
      bar.innerHTML = keys.map(function (k) {
        var g = facetGroup(k, r.facets[k], true);
        if (!g) return '';
        var n = (state.filters[k] || []).length;
        return '<details class="facet-drop" data-drop="' + k + '"' + (ui.openDrop === k ? ' open' : '') + '><summary>' +
          esc(FACET_LABEL[k]) + (n ? ' (' + n + ')' : '') + '</summary><div class="facet-pop">' + g + '</div></details>';
      }).join('') || '<p class="wf-meta">No filters apply to these results.</p>';
    } else {
      bar.hidden = true;
      bar.innerHTML = '';
      aside.hidden = false;
      var groups = keys.map(function (k) { return facetGroup(k, r.facets[k], false); }).join('');
      var mobile = window.matchMedia('(max-width: 768px)').matches;
      var open = ui.panelOpen !== null ? ui.panelOpen : (!mobile || hasFilters(state));
      aside.innerHTML = '<details class="facet-panel" id="facet-panel"' + (open ? ' open' : '') + '><summary>Filter results</summary>' +
        (groups || '<p class="wf-meta">No filters apply to these results.</p>') + '</details>';
    }
  }

  /* --- Results (R21, R22, R32, R36, R37, R50) ----------------------------- */
  function resultHtml(doc, concepts, promoted) {
    var snip = TS.snippet(doc, concepts);
    var person = doc.cat === 'people';
    var meta = (doc.meta || []).filter(Boolean).map(esc).join(' · ');
    return '<article class="result' + (person ? ' has-avatar' : '') + (promoted ? ' promoted' : '') + '">' +
      (person ? '<div class="wf-placeholder avatar">Photo</div>' : '') +
      '<div>' +
      '<p class="result-type">' + (promoted ? 'Promoted · ' : '') + esc(doc.typeLabel) + '</p>' +
      '<h3><a href="' + doc.url + '">' + TS.highlight(doc.title, concepts) + '</a></h3>' +
      (meta ? '<p class="result-meta">' + meta + '</p>' : '') +
      '<p class="result-snippet">' + (snip.page ? '<span class="pg">Matched on page ' + snip.page + ':</span> “' + snip.html + '”' : snip.html) + '</p>' +
      '</div></article>';
  }

  function renderResults(r) {
    var list = r.results;
    var host = $('sr-results');
    var pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    if (state.page > pages) state.page = pages;
    var slice = list.slice((state.page - 1) * PER_PAGE, state.page * PER_PAGE);
    var html = '';

    if (r.bestBet && state.page === 1 && !state.type) {
      html += '<!-- Promoted result, later phase (R50) -->' + resultHtml(r.bestBet, r.concepts, true) +
        '<p class="wf-note query" data-note="P"><span class="wf-note-label">Later phase</span>Promoted results are an editorial pin for named queries. Shown so the room can say whether it belongs in phase one.</p>';
    }

    if (!list.length) {
      html += zeroHtml(r);
    } else {
      var lastYear = null;
      slice.forEach(function (h) {
        if (state.sort === 'year') {
          var y = h.doc.date ? h.doc.date.slice(0, 4) : 'Undated';
          if (y !== lastYear) { html += '<h2 class="year-head">' + y + '</h2>'; lastYear = y; }
        }
        html += resultHtml(h.doc, r.concepts, false);
      });
    }
    host.innerHTML = html;

    var nav = $('sr-pages');
    if (pages <= 1) { nav.innerHTML = ''; return; }
    var p = '<ul class="pagination">';
    p += '<li><button type="button" data-page="' + (state.page - 1) + '"' + (state.page === 1 ? ' disabled' : '') + '>Previous</button></li>';
    for (var i = 1; i <= pages; i++) {
      p += '<li><button type="button" data-page="' + i + '"' + (i === state.page ? ' aria-current="page"' : '') + '>' + i + '</button></li>';
    }
    p += '<li><button type="button" data-page="' + (state.page + 1) + '"' + (state.page === pages ? ' disabled' : '') + '>Next</button></li></ul>';
    nav.innerHTML = p;
  }

  function zeroHtml(r) {
    var tips = [];
    if (state.type && r.total) {
      return '<div class="zero"><p><strong>No ' + esc(CAT_LABEL[state.type].toLowerCase()) + ' match.</strong> ' +
        plural(r.total, 'result') + ' in other types; use the tabs above, or ' +
        '<button type="button" class="btn-link" data-action="all-types">show all types</button>.</p></div>';
    }
    if (hasFilters(state)) {
      var loose = TS.search(Object.assign({}, state, { filters: {}, letter: '' }));
      if (loose.total) tips.push('<button type="button" class="btn-link" data-action="clear">Remove your filters</button> (' + plural(loose.total, 'result') + ' without them)');
    }
    if (state.raw) {
      var fixed = TS.search(Object.assign({}, state, { raw: false }));
      if (fixed.correctedTo) tips.push('Did you mean <a href="?' + new URLSearchParams({ q: fixed.correctedTo }).toString() + '">' + q(fixed.correctedTo) + '</a>?');
    }
    tips.push('Try a broader or different word: we match common alternatives, such as <em>GDPR</em> for <em>data protection</em>');
    tips.push('<a href="' + TS.pageUrl('services.html') + '">Browse the A–Z of services</a> or <a href="' + TS.pageUrl('people.html') + '">find a lawyer</a>');
    tips.push('<a href="#">Contact us</a>: tell us what you need and we will put you in touch with the right person');
    return '<!-- Zero results (R38) --><div class="zero"><h2>No results for ' + q(state.q) + '</h2><ul>' +
      tips.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul></div>';
  }

  /* --- Browse view (R34) --------------------------------------------------- */
  function renderBrowse(r) {
    var html = '<h2 class="section-title">Browse everything</h2><div class="browse-grid">';
    C.categories.forEach(function (c) {
      var items = r.results.filter(function (h) { return h.doc.cat === c.key; });
      if (c.key === 'knowledge' || c.key === 'news' || c.key === 'events' || c.key === 'documents') {
        items.sort(function (a, b) { return (b.doc.date || '').localeCompare(a.doc.date || ''); });
      } else if (c.key === 'services') {
        items = items.filter(function (h) { return !h.doc.parentId; });
      }
      html += '<section class="browse-card"><h3><span>' + esc(c.label) + '</span><span class="n">' + r.tabCounts[c.key] + '</span></h3><ul>' +
        items.slice(0, 4).map(function (h) { return '<li><a href="' + h.doc.url + '">' + esc(h.doc.title) + '</a></li>'; }).join('') +
        '</ul><button type="button" class="btn btn-secondary btn-small" data-type="' + c.key + '">Browse all ' + esc(c.label.toLowerCase()) + '</button></section>';
    });
    $('sr-browse').innerHTML = html + '</div>';
  }

  /* --- Events -------------------------------------------------------------- */
  function bind() {
    $('sr-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var v = $('sr-q').value.trim();
      update(function (s) {
        s.q = v; s.page = 1; s.raw = false;
        if (!s.scope) { s.type = ''; }
      });
    });

    app.addEventListener('click', function (e) {
      var t = e.target.closest('button');
      if (!t || !app.contains(t)) return;
      var act = t.getAttribute('data-action');

      if (t.hasAttribute('data-type')) {
        var type = t.getAttribute('data-type');
        update(function (s) {
          s.type = type; s.page = 1;
          if (s.scope === 'people' || s.scope === 'knowledge') s.scope = '';
        });
      } else if (t.hasAttribute('data-page')) {
        update(function (s) { s.page = parseInt(t.getAttribute('data-page'), 10); });
        $('sr-count').focus();
        $('sr-count').scrollIntoView({ block: 'start' });
      } else if (t.hasAttribute('data-more')) {
        var key = t.getAttribute('data-more');
        ui.expanded[key] = !ui.expanded[key];
        render();
      } else if (act === 'raw') {
        update(function (s) { s.raw = true; });
      } else if (act === 'widen') {
        update(function (s) {
          if (s.scope === 'service') s.filters.service = s.filters.service.slice(1);
          else s.type = '';
          s.scope = ''; s.page = 1;
        });
        $('sr-count').focus();
      } else if (act === 'letter') {
        update(function (s) { s.letter = ''; s.page = 1; });
        $('sr-count').focus();
      } else if (act === 'facet') {
        var k = t.getAttribute('data-key');
        var v = t.getAttribute('data-value');
        update(function (s) { s.filters[k] = s.filters[k].filter(function (x) { return x !== v; }); s.page = 1; });
        $('sr-count').focus();
      } else if (act === 'clear') {
        update(function (s) {
          TS.FACET_KEYS.forEach(function (fk) { s.filters[fk] = []; });
          s.letter = ''; s.page = 1;
          if (s.scope === 'service') s.scope = '';
        });
        $('sr-count').focus();
      } else if (act === 'all-types') {
        update(function (s) { s.type = ''; s.scope = ''; s.page = 1; });
      } else if (t.id === 'sr-copy') {
        copyLink();
      } else if (t.hasAttribute('data-layout')) {
        var layout = t.getAttribute('data-layout');
        update(function (s) { s.layout = layout; });
      }
    });

    app.addEventListener('change', function (e) {
      var t = e.target;
      if (t.matches('input[type="checkbox"][data-key]')) {
        var k = t.getAttribute('data-key');
        var drop = t.closest('[data-drop]');
        ui.openDrop = drop ? drop.getAttribute('data-drop') : null;
        update(function (s) {
          var cur = s.filters[k] || [];
          s.filters[k] = t.checked ? cur.concat([t.value]) : cur.filter(function (x) { return x !== t.value; });
          s.page = 1;
        });
      } else if (t.id === 'sr-sort') {
        update(function (s) { s.sort = t.value; s.page = 1; });
      }
    });

    /* Filter within a long facet (R39): hides options client-side, no re-render. */
    app.addEventListener('input', function (e) {
      var t = e.target;
      if (!t.hasAttribute('data-facet-filter')) return;
      var group = t.closest('.facet');
      var nq = TS.norm(t.value);
      group.querySelectorAll('.facet-opt').forEach(function (opt) {
        var match = !nq || (' ' + opt.getAttribute('data-v')).indexOf(' ' + nq) >= 0;
        opt.hidden = nq ? !match : opt.hasAttribute('data-extra') && !ui.expanded[group.getAttribute('data-facet')];
      });
    });

    app.addEventListener('toggle', function (e) {
      var d = e.target;
      if (d.matches && d.matches('.facet-drop')) {
        if (d.open) {
          ui.openDrop = d.getAttribute('data-drop');
          app.querySelectorAll('.facet-drop[open]').forEach(function (o) { if (o !== d) o.open = false; });
        } else if (ui.openDrop === d.getAttribute('data-drop')) ui.openDrop = null;
      } else if (d.id === 'facet-panel') {
        ui.panelOpen = d.open;
      }
    }, true);

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var open = app.querySelector('.facet-drop[open]');
      if (open) { open.open = false; ui.openDrop = null; open.querySelector('summary').focus(); }
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.facet-drop')) {
        app.querySelectorAll('.facet-drop[open]').forEach(function (o) { o.open = false; });
        ui.openDrop = null;
      }
    });

    window.addEventListener('popstate', function () {
      state = TS.readState();
      render();
    });
  }

  function copyLink() {
    var done = function () {
      $('sr-copied').textContent = 'Link copied. Anyone who opens it sees this exact search, kept up to date.';
      window.setTimeout(function () { $('sr-copied').textContent = ''; }, 4000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(window.location.href).then(done, function () {
        $('sr-copied').textContent = window.location.href;
      });
    } else {
      $('sr-copied').textContent = window.location.href;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    app = $('search-app');
    if (!app) return;
    state = TS.readState();
    bind();
    commit(false);
  });
})();
