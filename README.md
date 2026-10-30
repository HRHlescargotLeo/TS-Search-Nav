## Travers Smith — search and navigation prototype

A lo-fi, interactive wireframe of the navigation and search ClerksWell proposes for
traverssmith.com. Structure and behaviour only: greyscale by design, no visual design.

Service and sub-service names are Travers Smith's own (live A–Z, October 2026). Every
person, article, deal, event and document is **fictional**.

**Version 1.3 · 20 October 2026 · four navigation models · navigation and search only**

Version 1.3 adds four switchable navigation models (A–D) via a bar at the top of every
page; see `src/js/models.js` for the slots and presets.

Version 1.2 makes the uncontroversial changes from Workshop 1; the change log is on the
contents page. Version 1.1, as presented, is tagged `v1-workshop`.

## Viewing it

Published with GitHub Pages: **Settings → Pages → Branch: `main`, folder: `/ (root)`**.
The contents page is `index.html` at the repository root. No server-side code; it also
opens straight from disk.

## Repository layout

```
index.html, pages/, modules/,     ← GENERATED. What GitHub Pages serves. Do not edit.
css/, js/, assets/, .nojekyll
src/                              ← edit here
  index.html                      the contents hub
  includes/header.html, footer.html
  pages/  modules/  css/  js/  assets/
requirements/requirements.md      R01–R51, traced to the review and the search proposal
build-includes.js                 builds src/ into the root, resolving includes
validate.js                       tag balance, handlers, internal links
```

## Making a change

```
node build-includes.js && node validate.js
```

Then commit **both** `src/` and the regenerated root files, and push to `main`. Node is
the only requirement; there are no dependencies.

- Content and configuration (services, fictional people and content, ranking tiers,
  synonyms, facets, promoted results): `src/js/data.js`
- Search engine: `src/js/engine.js`; results page: `src/js/search-page.js`
- Menus: `src/includes/header.html` and `src/js/nav.js`
- Navigation models and their slots: `src/js/models.js`; model groupings in `src/js/data.js`;
  variants are marked `data-only="S2"` / `data-hide="H2"` in the header
- Visual design layer, when the project reaches it: `src/css/theme.css` only

Every block in the pages carries a comment naming its requirement, e.g. `(R28)`, so
`grep -r "R28" src/` shows where a requirement is met.
