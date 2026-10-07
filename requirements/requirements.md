# Travers Smith — search and navigation prototype: requirements

Version 1 · October 2026 · for Workshop 1

Every block in the prototype carries an HTML comment naming the requirement it serves,
for example `<!-- Services mega-menu panel (R01, R02) -->`. `grep -r "R28" src/` shows
everywhere a requirement is met.

**Traces to** uses the review's identifiers: options A1–A3 (reaching the service estate),
B1–B3 (navigation model), C4 (one index behind every search box), the findings F01–F26, and
SP1–SP11 for the eleven sections of *Smarter site search for traverssmith.com*.
**Report requirement** maps each line to the draft requirements in Appendix B of the
observations report (N01–N21, S01–S36).

## Scope

Navigation and search only: the header and its menus, the footer, the search box and
overlay, the results page, and the two section searches that exist today. Page templates
and the components on them are not changed; service, profile and other pages appear only as
placeholders for the menus and search to land on. Four earlier lines were removed for that
reason and are recorded in the report's backlog: sub-services listed on the service page
(was R08), parent and siblings on a sub-service page (was R10), topic propositions as pages
(was R13), and profile links and related people (was R35, report S28 and S29). A scoped
search box on service pages was also removed from R28.

## Report requirements the prototype does not show

N16 (the role of the HTML sitemap) and N21 (governance for adding a service) are decisions,
not behaviour. S31 (turning a search into a subscription), S34 and S35 (measurement) have
nothing to show in a prototype. S25 (meaningful facet labels) and N06 (client vocabulary in
labels) are shown only in part, because the labels need Travers Smith's input.

## Global — navigation

| ID | Requirement | Traces to | Report requirement |
|---|---|---|---|
| R01 | Every service and sub-service can be reached by browsing the menu, without search or the A–Z page. | A2, F02 | N02, N04 |
| R02 | The Services panel can be filtered by typing; the filter matches practices and sub-services and opens the matching branches. | A2, F02 | N02 |
| R03 | The full A–Z of services is one click from every page. | A1 | N03, N15 |
| R04 | The five groupings are offered as labelled views over one service tree, not as the tree itself. | A2 | N01, N09 |
| R05 | Every primary item opens the same panel pattern: an overview link, its children and one featured item. | B1 | N07, N10 |
| R06 | Primary navigation is rebalanced: Careers becomes primary, the Newsroom moves into Knowledge as News, Difference and International move under About us. | B2 | N08, N11, N12 |
| R07 | Task-led entry points (find a lawyer, find a service, latest thinking, get in touch) sit in the header and the search overlay. | B3 | N13, N14 |
| R09 | The existing breadcrumb reflects the page's single position in the navigation. | A2 | N20 |
| R11 | Navigation is keyboard operable, dismissible with Escape, never hover-only, and keeps the same IA at 320px. | B1 | N17, N18, N19 |
| R12 | The label a user clicks matches the H1 of the page it opens. | B1 | N05, N06 |

## Search

| ID | Requirement | Traces to | Report requirement |
|---|---|---|---|
| R20 | One search covers people, services and sectors, knowledge, news, events, documents and firm pages. | SP1, C4 | S01, S17 |
| R21 | Ranking is tiered by page type: people and services above knowledge and news, documents below pages. A lawyer's name returns their profile first. | SP1 | S02, S03, S06 |
| R22 | Matching terms are highlighted in the title and in a snippet taken from the matching text. | SP1 | S11 |
| R23 | Facets with live counts: Service, Sector, Position, Office, Content type, Author, Year, Topic. Values that would return nothing are hidden. | SP2 | S23, S25 |
| R24 | Every applied filter shows as a removable chip, with Clear all. | SP2 | S24 |
| R25 | Facets can be laid out as a sidebar or as a top bar. | SP2 | — |
| R26 | While filtered to one content type, the counts for every other type stay visible and accurate. | SP2 | S09, S15 |
| R27 | The whole search state (query, filters, sort, page, layout) lives in the URL and can be copied as a link. | SP2 | S30, S32 |
| R28 | The existing section searches (People directory, Knowledge index) run on the same engine as a pre-applied scope, shown as a removable chip, widened to the whole site in one click. | SP3, F25 | S13, S14 |
| R29 | Typeahead suggests services, sectors and topics first, then people, then pages, and understands synonyms. | SP4 | S18 |
| R30 | A query with no results is retried against a spelling correction, and the user is told, with a link to search for the original. | SP5 | S20 |
| R31 | A synonym map connects client language to firm language, and the results say when a synonym was used. | SP5 | S19 |
| R32 | PDF documents are indexed on their full text; a result shows the page that matched and ranks below the firm's own pages. | SP6, F24 | S04 |
| R33 | An advanced query builder combines conditions without syntax, with a live match count and a plain-English readout. | SP7 | S27 |
| R34 | With no query, search offers a browsable, categorised view of everything, with counts. | SP8 | S16 |
| R36 | Sort by relevance (default), newest, oldest, publication year or A–Z. | SP10 | S05, S08 |
| R37 | A result says what it is before it is clicked; people results show role, practice and office. | SP1 | S10, S12 |
| R38 | The zero-results state offers a correction, a broader search and a route to contact. | SP5 | S21 |
| R39 | Long facets are progressively disclosed and can be filtered within. | SP2 | S22 |
| R40 | Search announces result counts to assistive technology and is fully keyboard operable. | — | S36 |
| R41 | The People directory can be browsed A–Z and filtered by office. | SP2 | S26 |
| R42 | Ranking tiers, synonym groups and facet fields are declared as configuration, not code. | SP11, C4 | S33 |

## Later phase — for discussion, not for a first build

| ID | Requirement | Traces to | Report requirement |
|---|---|---|---|
| R50 | Promoted results ("best bets") pin an editorially chosen page to the top for named queries. Demonstrated on the query *careers*. | SP11 | S07 |
| R51 | Listed on the hub, not built: search analytics, saved searches and alerts, further document formats, editor-maintained synonyms, a semantic layer, location-aware search, reference-format matching, non-CMS sources. | SP11 | S31, S34 |
