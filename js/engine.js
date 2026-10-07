/* ==========================================================================
   engine.js — the prototype search engine (R20–R32, R36, R42).

   One index over every content type. Every search box on the site calls the
   same search(): a section search is this function with a scope applied
   before the visitor types (R28). Ranking, synonyms, correction and facets
   are read from TS_DATA.CONFIG, not hard-coded here (R42).

   This is a wireframe-grade engine running in the browser over a small
   fictional dataset. It demonstrates behaviour, not production performance.
   ========================================================================== */

(function () {
  'use strict';

  var D = window.TS_DATA;
  var C = D.CONFIG;
  var STOP = ['and', 'the', 'of', 'for', 'in', 'a', 'an', 'to', 'on', 'with', 'by', 'at', 'is', 'our', 'who', 'can', 'help'];

  function slug(s) {
    return s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  function norm(s) {
    return (s || '').toLowerCase()
      .replace(/[’']/g, '')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9&\-\s]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* --- Root path, so links work from the hub and from /pages/ ---------- */
  function root() {
    var link = document.getElementById('wf-root');
    if (!link) return '';
    return link.getAttribute('href').replace(/index\.html$/, '');
  }
  function pageUrl(page, params) {
    var qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return root() + 'pages/' + page + qs;
  }

  /* --- Services and sectors -------------------------------------------- */
  var services = [];
  var serviceById = {};
  var serviceByName = {};

  function addService(rec) {
    services.push(rec);
    serviceById[rec.id] = rec;
    serviceByName[rec.name] = rec;
  }

  D.SERVICE_TREE.forEach(function (row) {
    var parent = { id: slug(row[0]), name: row[0], parent: null, children: [], kind: 'Service' };
    addService(parent);
    row[1].forEach(function (childName) {
      var child = { id: slug(childName), name: childName, parent: parent.id, children: [], kind: 'Sub-service' };
      parent.children.push(child.id);
      addService(child);
    });
  });
  D.SECTORS.forEach(function (name) {
    if (serviceByName[name]) {
      serviceByName[name].isSector = true;
      return;
    }
    addService({ id: 'sector-' + slug(name), name: name, parent: null, children: [], kind: 'Sector', isSector: true });
  });

  /* --- People ----------------------------------------------------------- */
  var people = D.PEOPLE.map(function (p) {
    return { id: p[0], name: p[1], position: p[2], office: p[3], services: p[4], sectors: p[5], summary: p[6] };
  });
  var personById = {};
  people.forEach(function (p) { personById[p.id] = p; });

  /* --- Build the one index (R20) ---------------------------------------- */
  var docs = [];

  function addDoc(d) {
    d.n = {
      title: norm(d.title),
      tags: norm(d.tagText || ''),
      summary: norm(d.summary || ''),
      body: norm(d.bodyText || '')
    };
    d.tier = C.tiers[d.tierKey] || 1;
    docs.push(d);
  }

  people.forEach(function (p) {
    addDoc({
      id: p.id, cat: 'people', tierKey: 'Person', typeLabel: 'Person',
      title: p.name, url: pageUrl('profile.html', { id: p.id }),
      summary: p.summary,
      meta: [p.position, p.services[0], p.office],
      tagText: p.services.concat(p.sectors, [p.position, p.office]).join(' '),
      facets: { service: p.services, sector: p.sectors, position: [p.position], office: [p.office] }
    });
  });

  services.forEach(function (s) {
    var parent = s.parent ? serviceById[s.parent] : null;
    var summary = s.kind === 'Sector'
      ? 'Our ' + s.name + ' sector team: the clients we act for, the issues they face, and the lawyers across the firm who advise them.'
      : parent
        ? 'Part of our ' + parent.name + ' practice. The advice we give, the people who give it, and our recent work and thinking.'
        : 'Our ' + s.name + ' practice. The advice we give, the people who give it, and our recent work and thinking.';
    addDoc({
      id: s.id, cat: 'services', tierKey: s.kind === 'Sector' ? 'Sector' : 'Service',
      typeLabel: s.kind, parentId: s.parent,
      title: s.name, url: pageUrl('service.html', { id: s.id }),
      summary: summary,
      meta: parent ? ['Sub-service of ' + parent.name] : s.children.length ? [s.children.length + ' sub-services'] : [],
      tagText: parent ? parent.name : '',
      facets: { service: s.kind === 'Sector' ? [] : [s.name], sector: s.isSector ? [s.name] : [] }
    });
  });

  var CAT_FOR_TYPE = { 'News': 'news', 'Event': 'events' };
  D.KNOWLEDGE.forEach(function (k) {
    var authors = k[5].map(function (id) { return personById[id] ? personById[id].name : id; });
    var cat = CAT_FOR_TYPE[k[1]] || 'knowledge';
    addDoc({
      id: k[0], cat: cat, tierKey: cat === 'news' ? 'News' : cat === 'events' ? 'Event' : 'Knowledge',
      typeLabel: k[1],
      title: k[2], date: k[3], url: '#',
      summary: k[7],
      meta: [k[1], formatDate(k[3])].concat(authors.length ? [authors.join(', ')] : []),
      tagText: k[4].concat(k[6], authors).join(' '),
      facets: { service: k[4], author: authors, topic: k[6], ktype: [k[1]], year: [k[3].slice(0, 4)] }
    });
  });

  D.DOCUMENTS.forEach(function (d) {
    addDoc({
      id: d[0], cat: 'documents', tierKey: 'Document', typeLabel: 'PDF',
      title: d[1], date: d[2], url: '#',
      summary: d[6],
      pages: d[5], pageCount: d[4],
      meta: ['PDF', d[4] + ' pages', formatDate(d[2])],
      tagText: d[3].join(' '),
      bodyText: d[5].map(function (p) { return p[1]; }).join(' '),
      facets: { service: d[3], ktype: ['PDF document'], year: [d[2].slice(0, 4)] }
    });
  });

  D.PAGES.forEach(function (p) {
    addDoc({
      id: p[0], cat: 'pages', tierKey: 'Page', typeLabel: 'Page',
      title: p[1], url: p[3], summary: p[4],
      meta: [p[2]],
      tagText: p[2],
      facets: {}
    });
  });

  function formatDate(iso) {
    if (!iso) return '';
    var m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var p = iso.split('-');
    return parseInt(p[2], 10) + ' ' + m[parseInt(p[1], 10) - 1] + ' ' + p[0];
  }

  /* How much content is tagged to each service: breaks typeahead ties so
     the practice people mean comes first. */
  var popularity = {};
  docs.forEach(function (d) {
    ((d.facets && d.facets.service) || []).forEach(function (v) { popularity[v] = (popularity[v] || 0) + 1; });
  });

  /* --- Vocabulary for spelling correction (R30) ------------------------- */
  var vocab = {};
  docs.forEach(function (d) {
    [d.n.title, d.n.tags, d.n.summary, d.n.body].join(' ').split(' ').forEach(function (w) {
      if (w.length >= 3) vocab[w] = (vocab[w] || 0) + 1;
    });
  });
  C.synonyms.forEach(function (g) { g.forEach(function (m) { m.split(' ').forEach(function (w) { vocab[w] = (vocab[w] || 0) + 1; }); }); });
  var vocabWords = Object.keys(vocab);

  function lev(a, b) {
    var dp = [];
    for (var i = 0; i <= a.length; i++) { dp[i] = [i]; }
    for (var j = 0; j <= b.length; j++) { dp[0][j] = j; }
    for (i = 1; i <= a.length; i++) {
      for (j = 1; j <= b.length; j++) {
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
    }
    return dp[a.length][b.length];
  }

  function correct(nq) {
    var changed = false;
    var out = nq.split(' ').map(function (t) {
      if (t.length < 4 || STOP.indexOf(t) >= 0) return t;
      var known = vocabWords.some(function (w) { return w.indexOf(t) === 0; });
      if (known) return t;
      var best = null;
      var bestD = t.length >= 7 ? 3 : 2;
      vocabWords.forEach(function (w) {
        if (Math.abs(w.length - t.length) > 2) return;
        var dist = lev(t, w);
        if (dist < bestD || (dist === bestD && best && vocab[w] > vocab[best])) { bestD = dist; best = w; }
      });
      if (best) { changed = true; return best; }
      return t;
    }).join(' ');
    return changed ? out : null;
  }

  /* --- Query parsing: synonyms become alternatives (R31) ---------------- */
  function parse(nq) {
    var concepts = [];
    var rest = ' ' + nq + ' ';
    var members = [];
    C.synonyms.forEach(function (g, gi) { g.forEach(function (m) { members.push({ m: m, gi: gi }); }); });
    members.sort(function (a, b) { return b.m.length - a.m.length; });
    var usedGroups = {};
    members.forEach(function (x) {
      var needle = ' ' + x.m + ' ';
      if (usedGroups[x.gi] || rest.indexOf(needle) < 0) return;
      usedGroups[x.gi] = true;
      rest = rest.replace(needle, ' ');
      concepts.push({ orig: x.m, alts: C.synonyms[x.gi].slice(), syn: true });
    });
    rest.trim().split(' ').forEach(function (t) {
      if (t && STOP.indexOf(t) < 0) concepts.push({ orig: t, alts: [t], syn: false });
    });
    return concepts;
  }

  function has(text, phrase) {
    if (!text) return false;
    if (phrase.length <= 3) return (' ' + text + ' ').indexOf(' ' + phrase + ' ') >= 0;
    return (' ' + text).indexOf(' ' + phrase) >= 0;
  }

  function scoreDoc(doc, concepts, nq, synHits) {
    var total = 0;
    for (var i = 0; i < concepts.length; i++) {
      var c = concepts[i];
      var best = 0;
      var bestAlt = null;
      c.alts.forEach(function (alt) {
        var s = 0;
        if (has(doc.n.title, alt)) s += 10;
        if (has(doc.n.tags, alt)) s += 4;
        if (has(doc.n.summary, alt)) s += 2;
        if (has(doc.n.body, alt)) s += 1;
        if (s > best) { best = s; bestAlt = alt; }
      });
      if (!best) return 0;
      if (c.syn && bestAlt !== c.orig) synHits[c.orig] = c.alts.filter(function (a) { return a !== c.orig; });
      total += best;
    }
    if (doc.n.title === nq) total += 60;
    else if (doc.n.title.indexOf(nq) === 0) total += 12;
    /* Tier is a multiplier, so a person or service page outranks a passing
       mention elsewhere (R21). Top-level practices edge out their own
       sub-services on a tie. */
    return total * doc.tier + (doc.cat === 'services' && !doc.parentId ? 1 : 0);
  }

  /* --- State <-> URL (R27) ---------------------------------------------- */
  var FACET_KEYS = C.facets.map(function (f) { return f.key; });

  function readState(search) {
    var p = new URLSearchParams(search || window.location.search);
    var state = {
      q: p.get('q') || '',
      type: p.get('type') || '',
      scope: p.get('scope') || '',
      sort: p.get('sort') || 'relevance',
      page: parseInt(p.get('page'), 10) || 1,
      layout: p.get('layout') || 'sidebar',
      letter: (p.get('letter') || '').toUpperCase().slice(0, 1),
      raw: p.get('raw') === '1',
      filters: {}
    };
    FACET_KEYS.forEach(function (k) {
      var v = p.get(k);
      state.filters[k] = v ? v.split('|') : [];
    });
    return state;
  }

  function toParams(state) {
    var p = {};
    if (state.q) p.q = state.q;
    if (state.type) p.type = state.type;
    if (state.scope) p.scope = state.scope;
    FACET_KEYS.forEach(function (k) {
      if (state.filters[k] && state.filters[k].length) p[k] = state.filters[k].join('|');
    });
    if (state.sort && state.sort !== 'relevance') p.sort = state.sort;
    if (state.page > 1) p.page = String(state.page);
    if (state.letter) p.letter = state.letter;
    if (state.layout && state.layout !== 'sidebar') p.layout = state.layout;
    if (state.raw) p.raw = '1';
    return p;
  }

  /* --- Search ----------------------------------------------------------- */
  function run(nq) {
    var concepts = parse(nq);
    var synHits = {};
    var hits = [];
    if (!concepts.length) return { hits: [], synHits: synHits, concepts: concepts };
    docs.forEach(function (d) {
      var s = scoreDoc(d, concepts, nq, synHits);
      if (s > 0) hits.push({ doc: d, score: s });
    });
    return { hits: hits, synHits: synHits, concepts: concepts };
  }

  function passes(doc, filters, exceptKey) {
    for (var i = 0; i < FACET_KEYS.length; i++) {
      var k = FACET_KEYS[i];
      if (k === exceptKey) continue;
      var want = filters[k];
      if (!want || !want.length) continue;
      var vals = doc.facets[k] || [];
      if (!want.some(function (w) { return vals.indexOf(w) >= 0; })) return false;
    }
    return true;
  }

  function search(state) {
    var nq = norm(state.q);
    var out = { query: state.q, correctedFrom: null, correctedTo: null, synonyms: {}, bestBet: null, concepts: [] };
    var base;

    if (nq) {
      var r = run(nq);
      if (!r.hits.length && !state.raw) {
        var fixed = correct(nq);
        if (fixed) {
          var r2 = run(fixed);
          if (r2.hits.length) { out.correctedFrom = state.q; out.correctedTo = fixed; r = r2; }
        }
      }
      base = r.hits;
      out.synonyms = r.synHits;
      out.concepts = r.concepts;
      var bb = C.bestBets[nq];
      if (bb) out.bestBet = docs.filter(function (d) { return d.id === bb; })[0] || null;
    } else {
      base = docs.map(function (d) { return { doc: d, score: d.tier }; });
    }

    /* Surname browse (R41) narrows to people whose surname starts with the letter. */
    if (state.letter) {
      base = base.filter(function (h) {
        if (h.doc.cat !== 'people') return false;
        var parts = h.doc.title.split(' ');
        return norm(parts[parts.length - 1]).charAt(0).toUpperCase() === state.letter;
      });
    }

    out.tabCounts = {};
    out.total = 0;
    C.categories.forEach(function (c) { out.tabCounts[c.key] = 0; });
    base.forEach(function (h) {
      if (passes(h.doc, state.filters)) {
        out.tabCounts[h.doc.cat] += 1;
        out.total += 1;
      }
    });

    out.facets = {};
    FACET_KEYS.forEach(function (k) {
      var tally = {};
      base.forEach(function (h) {
        if (state.type && h.doc.cat !== state.type) return;
        if (!passes(h.doc, state.filters, k)) return;
        (h.doc.facets[k] || []).forEach(function (v) { tally[v] = (tally[v] || 0) + 1; });
      });
      (state.filters[k] || []).forEach(function (v) { if (!tally[v]) tally[v] = 0; });
      out.facets[k] = Object.keys(tally).map(function (v) { return { value: v, count: tally[v] }; })
        .sort(function (a, b) {
          if (k === 'year') return b.value.localeCompare(a.value);
          return b.count - a.count || a.value.localeCompare(b.value);
        });
    });

    var results = base.filter(function (h) {
      return (!state.type || h.doc.cat === state.type) && passes(h.doc, state.filters);
    });

    var byDateDesc = function (a, b) { return (b.doc.date || '').localeCompare(a.doc.date || ''); };
    var byTitle = function (a, b) { return a.doc.title.localeCompare(b.doc.title); };
    var sorters = {
      relevance: function (a, b) { return b.score - a.score || byDateDesc(a, b) || byTitle(a, b); },
      newest: function (a, b) {
        if (!a.doc.date !== !b.doc.date) return a.doc.date ? -1 : 1;
        return byDateDesc(a, b) || b.score - a.score;
      },
      oldest: function (a, b) {
        if (!a.doc.date !== !b.doc.date) return a.doc.date ? -1 : 1;
        return -byDateDesc(a, b) || b.score - a.score;
      },
      year: function (a, b) {
        var ya = (a.doc.date || '0000').slice(0, 4);
        var yb = (b.doc.date || '0000').slice(0, 4);
        return yb.localeCompare(ya) || b.score - a.score;
      },
      az: byTitle
    };
    results.sort(sorters[state.sort] || sorters.relevance);
    out.results = results;
    return out;
  }

  /* --- Highlighting (R22) ----------------------------------------------- */
  function highlight(text, concepts) {
    if (!concepts || !concepts.length) return esc(text);
    var ranges = [];
    concepts.forEach(function (c) {
      c.alts.forEach(function (alt) {
        var words = alt.split(' ').map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
        var tail = alt.length <= 3 ? '(?![A-Za-z0-9])' : '[A-Za-z0-9]*';
        var re = new RegExp('(^|[^A-Za-z0-9])(' + words.join('[^A-Za-z0-9]+') + tail + ')', 'gi');
        var m;
        while ((m = re.exec(text)) !== null) {
          var start = m.index + m[1].length;
          ranges.push([start, start + m[2].length]);
          if (re.lastIndex === m.index) re.lastIndex++;
        }
      });
    });
    if (!ranges.length) return esc(text);
    ranges.sort(function (a, b) { return a[0] - b[0]; });
    var merged = [ranges[0]];
    ranges.slice(1).forEach(function (r) {
      var last = merged[merged.length - 1];
      if (r[0] <= last[1]) last[1] = Math.max(last[1], r[1]); else merged.push(r);
    });
    var out = '';
    var pos = 0;
    merged.forEach(function (r) {
      out += esc(text.slice(pos, r[0])) + '<mark>' + esc(text.slice(r[0], r[1])) + '</mark>';
      pos = r[1];
    });
    return out + esc(text.slice(pos));
  }

  /* For PDFs, the snippet is the page that matched (R32). */
  function snippet(doc, concepts) {
    if (doc.pages && concepts && concepts.length) {
      for (var i = 0; i < doc.pages.length; i++) {
        var pn = norm(doc.pages[i][1]);
        var hit = concepts.some(function (c) { return c.alts.some(function (a) { return has(pn, a); }); });
        if (hit) return { page: doc.pages[i][0], html: highlight(doc.pages[i][1], concepts) };
      }
    }
    return { page: null, html: highlight(doc.summary || '', concepts) };
  }

  /* --- Typeahead suggestions (R29) -------------------------------------- */
  function suggest(q, scope) {
    var nq = norm(q);
    if (nq.length < 2) return [];
    var groups = [];

    function wordStart(name) { return (' ' + norm(name)).indexOf(' ' + nq) >= 0; }
    var synMembers = [];
    C.synonyms.forEach(function (g) {
      var hit = g.filter(function (m) { return m.indexOf(nq) === 0 || (nq.length >= 3 && m.indexOf(nq) >= 0); })[0];
      if (hit) synMembers.push({ hit: hit, group: g });
    });

    var tax = [];
    services.forEach(function (s) {
      var ns = norm(s.name);
      var via = null;
      var direct = wordStart(s.name);
      if (!direct) {
        synMembers.forEach(function (x) {
          if (via) return;
          if (x.group.some(function (m) { return m !== x.hit && m.length > 3 && ns.indexOf(m) === 0; })) via = x.hit;
        });
      }
      if (!direct && !via) return;
      var rank = (ns.indexOf(nq) === 0 ? 0 : 1) + (s.kind === 'Sub-service' ? 0.5 : 0) + (via ? 2 : 0);
      tax.push({ kind: 'taxonomy', label: s.name, pop: popularity[s.name] || 0, detail: s.kind === 'Sub-service' ? s.kind + ' of ' + serviceById[s.parent].name : s.kind, via: via, rank: rank, service: s });
    });
    D.TOPICS.forEach(function (t) {
      if (wordStart(t)) tax.push({ kind: 'topic', label: t, detail: 'Topic', rank: 1.8, topic: t });
    });
    tax.sort(function (a, b) { return a.rank - b.rank || (b.pop || 0) - (a.pop || 0) || a.label.length - b.label.length; });
    if (tax.length) groups.push({ label: scope === 'people' ? 'Find people in…' : 'Services, sectors and topics', items: tax.slice(0, 5) });

    var ppl = people.filter(function (p) { return wordStart(p.name); }).slice(0, 4).map(function (p) {
      return { kind: 'person', label: p.name, detail: p.position + ' · ' + p.office, person: p };
    });
    if (ppl.length && scope !== 'knowledge') groups.push({ label: 'People', items: ppl });

    if (scope !== 'people') {
      var pages = docs.filter(function (d) {
        return (d.cat === 'knowledge' || d.cat === 'pages' || d.cat === 'events' || d.cat === 'news') && wordStart(d.title);
      }).slice(0, 3).map(function (d) { return { kind: 'page', label: d.title, detail: d.typeLabel, doc: d }; });
      if (pages.length) groups.push({ label: scope === 'knowledge' ? 'Knowledge' : 'Pages and insights', items: pages });
    }
    return groups;
  }

  window.TS = {
    slug: slug, norm: norm, esc: esc, root: root, pageUrl: pageUrl, formatDate: formatDate,
    services: services, serviceById: serviceById, serviceByName: serviceByName,
    people: people, personById: personById, docs: docs,
    readState: readState, toParams: toParams, search: search,
    highlight: highlight, snippet: snippet, suggest: suggest, passes: passes,
    FACET_KEYS: FACET_KEYS
  };
})();
