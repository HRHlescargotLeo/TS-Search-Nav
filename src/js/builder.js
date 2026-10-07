/* ==========================================================================
   builder.js — the advanced query builder (R33). Runs only where
   #builder-app exists.

   Conditions on different fields combine with AND; two conditions on the
   same field combine with OR. The builder produces an ordinary search state,
   so "Run this search" opens the normal results page at a shareable URL.
   ========================================================================== */

(function () {
  'use strict';

  var TS = window.TS;
  var D = window.TS_DATA;
  if (!TS || !D) return;

  var FIELDS = [
    { key: 'keyword', label: 'Keyword' },
    { key: 'position', label: 'Position' },
    { key: 'service', label: 'Service' },
    { key: 'sector', label: 'Sector' },
    { key: 'office', label: 'Office' },
    { key: 'ktype', label: 'Content type' },
    { key: 'author', label: 'Author' },
    { key: 'topic', label: 'Topic' },
    { key: 'year', label: 'Year' }
  ];
  var TYPES = [{ key: '', label: 'Everything' }].concat(D.CONFIG.categories);
  var PHRASE = {
    keyword: function (v) { return 'mentioning “' + v + '”'; },
    position: function (v) { return 'whose position is ' + v; },
    service: function (v, t) { return (t === 'people' ? 'who work in ' : 'tagged to ') + v; },
    sector: function (v, t) { return (t === 'people' ? 'who work in the ' : 'in the ') + v + ' sector'; },
    office: function (v) { return 'based in ' + v; },
    ktype: function (v) { return 'of type ' + v; },
    author: function (v) { return 'written by ' + v; },
    topic: function (v) { return 'on ' + v; },
    year: function (v) { return 'from ' + v; }
  };
  var EXAMPLES = {
    'pe-partners': { type: 'people', rows: [['position', 'Partner'], ['service', 'Private Equity & Financial Sponsors'], ['office', 'London']] },
    'brussels': { type: 'people', rows: [['office', 'Brussels'], ['service', 'Competition'], ['service', 'Export Control & Sanctions']] },
    'pensions-2026': { type: 'knowledge', rows: [['service', 'Pensions'], ['year', '2026'], ['keyword', 'trustees']] }
  };

  var values = {};
  FIELDS.forEach(function (f) {
    if (f.key === 'keyword') return;
    var set = {};
    TS.docs.forEach(function (d) { (d.facets[f.key] || []).forEach(function (v) { set[v] = true; }); });
    values[f.key] = Object.keys(set).sort(function (a, b) { return f.key === 'year' ? b.localeCompare(a) : a.localeCompare(b); });
  });

  var model = { type: 'people', rows: [] };
  var host;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return TS.esc(s); }

  function toState() {
    var state = TS.readState('');
    state.type = model.type;
    var words = [];
    model.rows.forEach(function (r) {
      if (!r.value) return;
      if (r.field === 'keyword') words.push(r.value);
      else state.filters[r.field] = (state.filters[r.field] || []).concat([r.value]);
    });
    state.q = words.join(' ');
    return state;
  }

  function readout() {
    var groups = {};
    var order = [];
    model.rows.forEach(function (r) {
      if (!r.value) return;
      if (!groups[r.field]) { groups[r.field] = []; order.push(r.field); }
      groups[r.field].push(r.value);
    });
    var typeLabel = (TYPES.filter(function (t) { return t.key === model.type; })[0] || TYPES[0]).label.toLowerCase();
    if (!order.length) return 'Find <strong>' + esc(typeLabel) + '</strong>. Add a condition to narrow it.';
    var parts = order.map(function (f) {
      return '<strong>' + groups[f].map(function (v) { return esc(PHRASE[f](v, model.type)); }).join(' <em>or</em> ') + '</strong>';
    });
    return 'Find <strong>' + esc(typeLabel) + '</strong> ' + parts.join(' AND ') + '.';
  }

  function rowHtml(r, i) {
    var fieldOpts = FIELDS.map(function (f) {
      return '<option value="' + f.key + '"' + (f.key === r.field ? ' selected' : '') + '>' + esc(f.label) + '</option>';
    }).join('');
    var valueCtl = r.field === 'keyword'
      ? '<input type="text" id="qb-v-' + i + '" data-row="' + i + '" data-part="value" value="' + esc(r.value || '') + '" placeholder="Any words" aria-label="Keyword for condition ' + (i + 1) + '">'
      : '<select id="qb-v-' + i + '" data-row="' + i + '" data-part="value" aria-label="Value for condition ' + (i + 1) + '"><option value="">Choose…</option>' +
        values[r.field].map(function (v) { return '<option' + (v === r.value ? ' selected' : '') + '>' + esc(v) + '</option>'; }).join('') + '</select>';
    var join = i === 0 ? 'WHERE' : (model.rows.slice(0, i).some(function (o) { return o.field === r.field; }) ? 'OR' : 'AND');
    return '<div class="qb-row"><span class="qb-join">' + join + '</span>' +
      '<select id="qb-f-' + i + '" data-row="' + i + '" data-part="field" aria-label="Field for condition ' + (i + 1) + '">' + fieldOpts + '</select>' +
      '<span class="wf-meta">' + (r.field === 'keyword' ? 'contains' : 'is') + '</span>' + valueCtl +
      '<button type="button" class="qb-remove" data-remove="' + i + '" aria-label="Remove condition ' + (i + 1) + '">&times;</button></div>';
  }

  function render() {
    var focusId = document.activeElement && document.activeElement.id;
    $('qb-type').innerHTML = TYPES.map(function (t) {
      return '<option value="' + t.key + '"' + (t.key === model.type ? ' selected' : '') + '>' + esc(t.label) + '</option>';
    }).join('');
    $('qb-rows').innerHTML = model.rows.map(rowHtml).join('');
    renderOutput();
    if (focusId && $(focusId)) $(focusId).focus();
  }

  /* Count, readout and preview only: typing a keyword must not rebuild the
     row the cursor is in. */
  function renderOutput() {
    var state = toState();
    var r = TS.search(state);
    var n = state.type ? r.tabCounts[state.type] : r.total;
    $('qb-readout').innerHTML = readout();
    $('qb-count').textContent = n;
    $('qb-count-label').textContent = n === 1 ? 'match' : 'matches';
    $('qb-preview').innerHTML = r.results.slice(0, 6).map(function (h) {
      return '<li><span class="result-type">' + esc(h.doc.typeLabel) + '</span> <a href="' + h.doc.url + '">' + esc(h.doc.title) + '</a>' +
        (h.doc.meta ? ' <span class="wf-meta">' + h.doc.meta.filter(Boolean).map(esc).join(' · ') + '</span>' : '') + '</li>';
    }).join('') || '<li class="wf-meta">Nothing matches all of these conditions. Remove one, or change an AND to an OR by using the same field twice.</li>';
    $('qb-run').setAttribute('href', TS.pageUrl('search.html', TS.toParams(state)));
  }

  function load(key) {
    var ex = EXAMPLES[key];
    model.type = ex.type;
    model.rows = ex.rows.map(function (r) { return { field: r[0], value: r[1] }; });
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    host = $('builder-app');
    if (!host) return;
    load('pe-partners');

    host.addEventListener('change', function (e) {
      var t = e.target;
      if (t.id === 'qb-type') { model.type = t.value; render(); return; }
      var i = t.getAttribute('data-row');
      if (i === null) return;
      var row = model.rows[parseInt(i, 10)];
      if (t.getAttribute('data-part') === 'field') { row.field = t.value; row.value = ''; }
      else row.value = t.value;
      render();
    });
    host.addEventListener('input', function (e) {
      var t = e.target;
      if (t.getAttribute('data-part') !== 'value' || t.tagName !== 'INPUT') return;
      model.rows[parseInt(t.getAttribute('data-row'), 10)].value = t.value;
      renderOutput();
    });
    host.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      if (b.hasAttribute('data-remove')) {
        model.rows.splice(parseInt(b.getAttribute('data-remove'), 10), 1);
        render();
        $('qb-add').focus();
      } else if (b.id === 'qb-add') {
        model.rows.push({ field: 'service', value: '' });
        render();
        var last = $('qb-f-' + (model.rows.length - 1));
        if (last) last.focus();
      } else if (b.hasAttribute('data-example')) {
        load(b.getAttribute('data-example'));
      }
    });
  });
})();
