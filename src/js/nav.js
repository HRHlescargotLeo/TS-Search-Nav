/* ==========================================================================
   nav.js — navigation behaviour specific to this prototype.

   Renders the service tree, views and sectors from TS_DATA so the menu, the
   A–Z page and search all read one list of services (R01, R04). Adds the
   Services filter (R02), the mobile menu toggle (R11) and focus return on
   Escape.
   ========================================================================== */

(function () {
  'use strict';

  var TS = window.TS;
  var D = window.TS_DATA;
  if (!TS || !D) return;

  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (html !== undefined) n.innerHTML = html;
    return n;
  }
  function svcUrl(s) { return TS.pageUrl('service.html', { id: s.id }); }

  /* --- Service tree (R01) --------------------------------------------- */
  function renderTree(host) {
    var ul = el('ul', { 'class': 'svc-tree' });
    TS.services.filter(function (s) { return !s.parent && s.kind !== 'Sector'; })
      .sort(function (a, b) { return a.name.localeCompare(b.name); })
      .forEach(function (s) {
        var li = el('li', { 'class': 'svc-node', 'data-name': s.name });
        var row = el('div', { 'class': 'svc-row' });
        row.appendChild(el('a', { href: svcUrl(s) }, TS.esc(s.name)));
        li.appendChild(row);
        if (s.children.length) {
          var listId = host.id + '-' + s.id;
          var btn = el('button', {
            type: 'button', 'class': 'svc-toggle', 'aria-expanded': 'false', 'aria-controls': listId,
            'aria-label': 'Show ' + s.children.length + ' sub-services of ' + s.name
          }, '+' + s.children.length);
          row.appendChild(btn);
          var kids = el('ul', { 'class': 'svc-children', id: listId, hidden: '' });
          s.children.forEach(function (cid) {
            var c = TS.serviceById[cid];
            var cli = el('li', { 'data-name': c.name });
            cli.appendChild(el('a', { href: svcUrl(c) }, TS.esc(c.name)));
            kids.appendChild(cli);
          });
          li.appendChild(kids);
          btn.addEventListener('click', function () {
            setOpen(li, btn.getAttribute('aria-expanded') !== 'true');
          });
        }
        ul.appendChild(li);
      });
    host.innerHTML = '';
    host.appendChild(ul);
    host.appendChild(el('p', { 'class': 'svc-empty', 'aria-live': 'polite', 'data-svc-status': '' }));
  }

  function setOpen(li, open) {
    var btn = li.querySelector('.svc-toggle');
    var kids = li.querySelector('.svc-children');
    if (!btn || !kids) return;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.textContent = (open ? '−' : '+') + kids.children.length;
    if (open) kids.removeAttribute('hidden'); else kids.setAttribute('hidden', '');
  }

  /* --- Filter (R02): matches practices and sub-services, opens the
     branches that matched, and understands the synonym map. ------------- */
  function alternatives(nq) {
    var alts = [nq];
    if (nq.length >= 3) {
      D.CONFIG.synonyms.forEach(function (g) {
        if (g.some(function (m) { return m.indexOf(nq) === 0; })) {
          g.forEach(function (m) { if (alts.indexOf(m) < 0 && m.length > 3) alts.push(m); });
        }
      });
    }
    return alts;
  }
  function nameMatches(name, alts) {
    var n = ' ' + TS.norm(name);
    return alts.some(function (a) { return n.indexOf(' ' + a) >= 0; });
  }

  function applyFilter(host, q) {
    var nq = TS.norm(q);
    var alts = alternatives(nq);
    var count = 0;
    host.querySelectorAll('.svc-node').forEach(function (node) {
      var kids = node.querySelectorAll('.svc-children li');
      if (!nq) {
        node.hidden = false;
        kids.forEach(function (k) { k.hidden = false; });
        setOpen(node, false);
        return;
      }
      var self = nameMatches(node.getAttribute('data-name'), alts);
      var anyKid = false;
      kids.forEach(function (k) {
        var m = nameMatches(k.getAttribute('data-name'), alts);
        k.hidden = !(m || self);
        if (m) { anyKid = true; count += 1; }
      });
      if (self) count += 1;
      node.hidden = !(self || anyKid);
      setOpen(node, anyKid);
    });
    var status = host.querySelector('[data-svc-status]');
    if (!status) return;
    if (!nq) { status.innerHTML = ''; return; }
    var searchUrl = TS.pageUrl('search.html', { q: q });
    status.innerHTML = count
      ? count + ' matching service' + (count === 1 ? '' : 's') + '. <a href="' + searchUrl + '">Search the whole site for ‘' + TS.esc(q) + '’</a>'
      : 'No service is called ‘' + TS.esc(q) + '’. <a href="' + searchUrl + '">Search the whole site instead</a>';
  }

  /* --- Views and sectors (R04) ---------------------------------------- */
  function renderViews(host) {
    var grid = el('div', { 'class': 'grid grid-4' });
    Object.keys(D.VIEWS).forEach(function (view) {
      var col = el('div', { 'class': 'mega-col' });
      col.appendChild(el('h5', {}, TS.esc(view)));
      var ul = el('ul');
      D.VIEWS[view].forEach(function (name) {
        var s = TS.serviceByName[name];
        if (!s) return;
        var li = el('li');
        li.appendChild(el('a', { href: svcUrl(s) }, TS.esc(name)));
        ul.appendChild(li);
      });
      col.appendChild(ul);
      grid.appendChild(col);
    });
    host.appendChild(grid);
  }

  function renderSectors(host) {
    var ul = el('ul', { 'class': 'svc-tree' });
    TS.services.filter(function (s) { return s.isSector; })
      .sort(function (a, b) { return a.name.localeCompare(b.name); })
      .forEach(function (s) {
        var li = el('li', { 'class': 'svc-node' });
        li.appendChild(el('a', { href: svcUrl(s) }, TS.esc(s.name)));
        ul.appendChild(li);
      });
    host.appendChild(ul);
  }

  function renderLetters(host) {
    var have = {};
    TS.people.forEach(function (p) {
      var parts = p.name.split(' ');
      have[TS.norm(parts[parts.length - 1]).charAt(0).toUpperCase()] = true;
    });
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(function (L) {
      if (have[L]) host.appendChild(el('a', { href: TS.pageUrl('search.html', { type: 'people', scope: 'people', letter: L, sort: 'az' }) }, L));
      else host.appendChild(el('span', { 'aria-hidden': 'true' }, L));
    });
  }

  function renderTopics(host) {
    D.TOPICS.forEach(function (t) {
      var li = el('li');
      li.appendChild(el('a', { href: TS.pageUrl('search.html', { topic: t }) }, TS.esc(t)));
      host.appendChild(li);
    });
  }

  /* --- Wire up ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-render="service-tree"]').forEach(renderTree);
    document.querySelectorAll('[data-render="service-views"]').forEach(renderViews);
    document.querySelectorAll('[data-render="sector-list"]').forEach(renderSectors);
    document.querySelectorAll('[data-render="letter-grid"]').forEach(renderLetters);
    document.querySelectorAll('[data-render="topic-links"]').forEach(renderTopics);

    var total = TS.services.filter(function (s) { return s.kind !== 'Sector'; }).length;
    document.querySelectorAll('[data-count="services"]').forEach(function (n) { n.textContent = '(' + total + ')'; });

    document.querySelectorAll('[data-svc-filter]').forEach(function (input) {
      var host = document.getElementById(input.getAttribute('data-svc-filter'));
      if (!host) return;
      input.addEventListener('input', function () {
        /* Filtering always shows the A–Z tab, where the matches are. */
        var tab = document.querySelector('[data-tab="mega-panel-az"]');
        if (tab && host.id === 'mega-tree' && !tab.classList.contains('active')) tab.click();
        applyFilter(host, input.value);
      });
    });

    var toggle = document.querySelector('.menu-toggle');
    var menu = document.getElementById('primary-menu');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        var open = !menu.classList.contains('is-open');
        menu.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.textContent = open ? 'Close menu' : 'Menu';
      });
    }

    /* Escape returns focus to the menu item that was open (capture phase,
       so it runs before wireframe.js closes the panel). */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var open = document.querySelector('.nav-item.open');
      if (!open || !open.contains(document.activeElement)) return;
      /* An open typeahead list takes Escape first. */
      if (document.activeElement.getAttribute('aria-expanded') === 'true') return;
      var trigger = open.querySelector('.nav-link');
      window.setTimeout(function () {
        if (!trigger) return;
        open.setAttribute('data-suppress-open', '');
        trigger.focus({ preventScroll: true });
      }, 0);
    }, true);
  });

  window.TSNav = { renderTree: renderTree, applyFilter: applyFilter };
})();
