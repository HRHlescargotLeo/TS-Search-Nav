# Travers Smith — search and navigation prototype

A lo-fi, interactive wireframe of the navigation and search ClerksWell proposes for
traverssmith.com. Structure and behaviour only: greyscale by design, no visual design.

Service and sub-service names are Travers Smith's own (live A–Z, October 2026). Every
person, article, deal, event and document is **fictional**.

**Version 1.1 · 7 October 2026 · for Workshop 1 · navigation and search only**

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
- Visual design layer, when the project reaches it: `src/css/theme.css` only

Every block in the pages carries a comment naming its requirement, e.g. `(R28)`, so
`grep -r "R28" src/` shows where a requirement is met.
