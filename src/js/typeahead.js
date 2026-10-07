/* ==========================================================================
   typeahead.js — suggestions as the visitor types (R29).

   Attaches to any input[data-typeahead]. data-scope narrows it:
     (none)        whole site
     people        People section: a service suggestion filters people by it
     knowledge     Knowledge section
     service:<id>  a service page: suggestions stay within that service

   Taxonomy (services, sectors, topics) comes first, then people, then pages,
   so "priv" offers Private Equity as a practice before any page title.
   Keyboard: Up/Down to move, Enter to choose, Escape to close.
   ========================================================================== */

(function () {
  'use strict';

  var TS = window.TS;
  if (!TS) return;
  var uid = 0;

  function hrefFor(item, scope, form) {
    var hidden = {};
    if (form) form.querySelectorAll('input[type="hidden"]').forEach(function (h) { hidden[h.name] = h.value; });

    if (item.kind === 'taxonomy') {
      var s = item.service;
      if (scope === 'people' || scope === 'knowledge') {
        var p = { type: scope, scope: scope };
        p[s.kind === 'Sector' ? 'sector' : 'service'] = s.name;
        return TS.pageUrl('search.html', p);
      }
      return TS.pageUrl('service.html', { id: s.id });
    }
    if (item.kind === 'topic') {
      var tp = { topic: item.topic };
      if (scope === 'knowledge') { tp.type = 'knowledge'; tp.scope = 'knowledge'; }
      return TS.pageUrl('search.html', tp);
    }
    if (item.kind === 'person') return TS.pageUrl('profile.html', { id: item.person.id });
    if (item.kind === 'page') return TS.pageUrl('search.html', { q: item.label });
    if (item.kind === 'all') {
      var a = Object.assign({}, hidden, { q: item.q });
      return TS.pageUrl('search.html', a);
    }
    return '#';
  }

  function markPrefix(label, q) {
    var nq = TS.norm(q);
    var idx = (' ' + TS.norm(label)).indexOf(' ' + nq);
    /* norm() keeps length for ordinary ASCII labels, so the index maps back. */
    if (idx < 0 || TS.norm(label).length !== label.length) return TS.esc(label);
    return TS.esc(label.slice(0, idx)) + '<mark>' + TS.esc(label.slice(idx, idx + nq.length)) + '</mark>' + TS.esc(label.slice(idx + nq.length));
  }

  function attach(input) {
    /* Read on every keystroke: the results page changes its scope in place. */
    var scope = '';
    function readScope() { scope = input.getAttribute('data-scope') || ''; }
    var form = input.closest('form');
    var wrap = input.closest('.ta-wrap') || input.parentElement;
    var listId = 'ta-list-' + (++uid);
    var list = document.createElement('ul');
    list.className = 'ta-list';
    list.id = listId;
    list.setAttribute('role', 'listbox');
    list.hidden = true;
    wrap.appendChild(list);

    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-controls', listId);

    var options = [];
    var active = -1;

    function close() {
      list.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      active = -1;
    }

    function setActive(i) {
      options.forEach(function (o, n) { o.el.setAttribute('aria-selected', n === i ? 'true' : 'false'); });
      active = i;
      if (i >= 0) {
        input.setAttribute('aria-activedescendant', options[i].el.id);
        options[i].el.scrollIntoView({ block: 'nearest' });
      } else {
        input.removeAttribute('aria-activedescendant');
      }
    }

    function render() {
      readScope();
      var q = input.value.trim();
      var groups = TS.suggest(q, scope);
      list.innerHTML = '';
      options = [];
      active = -1;
      if (TS.norm(q).length < 2) { close(); return; }

      groups.forEach(function (g) {
        var head = document.createElement('li');
        head.className = 'ta-group';
        head.setAttribute('role', 'presentation');
        head.textContent = g.label;
        list.appendChild(head);
        g.items.forEach(function (item) { addOption(item, q); });
      });
      addOption({
        kind: 'all', q: q,
        label: (scope === 'people' ? 'Search people for ‘' : scope === 'knowledge' ? 'Search knowledge for ‘' : 'Search everything for ‘') + q + '’',
        detail: 'Enter'
      }, null, true);

      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }

    function addOption(item, q, isAll) {
      var li = document.createElement('li');
      li.className = 'ta-option' + (isAll ? ' ta-all' : '');
      li.id = listId + '-' + options.length;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      var label = isAll ? TS.esc(item.label) : markPrefix(item.label, q);
      var via = item.via ? '<span class="ta-via">matches ‘' + TS.esc(item.via) + '’</span>' : '';
      li.innerHTML = '<span>' + label + via + '</span><span class="ta-detail">' + TS.esc(item.detail || '') + '</span>';
      var href = hrefFor(item, scope, form);
      li.addEventListener('mousedown', function (e) { e.preventDefault(); window.location.href = href; });
      list.appendChild(li);
      options.push({ el: li, href: href });
    }

    input.addEventListener('input', render);
    input.addEventListener('focus', function () { if (input.value.trim()) render(); });
    input.addEventListener('blur', function () { window.setTimeout(close, 120); });
    input.addEventListener('keydown', function (e) {
      if (list.hidden) {
        if (e.key === 'ArrowDown' && input.value.trim()) { render(); e.preventDefault(); }
        return;
      }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive((active + 1) % options.length); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active <= 0 ? options.length - 1 : active - 1); }
      else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); window.location.href = options[active].href; }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
    });
  }

  window.TSTypeahead = { attach: attach };

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('input[data-typeahead]').forEach(attach);

    /* Opening the search overlay puts the cursor in the box. */
    document.querySelectorAll('[data-modal-open="search-overlay"]').forEach(function (t) {
      t.addEventListener('click', function () {
        window.setTimeout(function () {
          var i = document.getElementById('overlay-q');
          if (i) i.focus();
        }, 30);
      });
    });
  });
})();
