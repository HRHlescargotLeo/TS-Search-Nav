# Travers Smith — search and navigation prototype: requirements

Version 1 · October 2026 · for Workshop 1

Every block in the prototype carries an HTML comment naming the requirement it serves,
for example `<!-- Services mega-menu panel (R01, R02) -->`. `grep -r "R28" src/` shows
everywhere a requirement is met.

**Traces to** uses the review's identifiers: options A1–A3 (reaching the service estate),
B1–B3 (navigation model), C4 (one index behind every search box), findings F02, F24, F25
and F26, and SP1–SP11 for the eleven sections of *Smarter site search for
traverssmith.com*.

## Global — navigation

| ID | Requirement | Traces to |
|---|---|---|
| R01 | Every service and sub-service can be reached by browsing the menu, without search or the A–Z page. | A2, F02 |
| R02 | The Services panel can be filtered by typing; the filter matches practices and sub-services and opens the matching branches. | A2, F02 |
| R03 | The full A–Z of services is one click from every page. | A1 |
| R04 | The five groupings are offered as labelled views over one service tree, not as the tree itself. | A2 |
| R05 | Every primary item opens the same panel pattern: an overview link, its children and one featured item. | B1 |
| R06 | Primary navigation is rebalanced: Careers becomes primary, the Newsroom moves into Knowledge as News, Difference and International move under About us. | B2 |
| R07 | Task-led entry points (find a lawyer, find a service, latest thinking, get in touch) sit in the header search and on the home page. | B3 |
| R08 | A service page lists its sub-services directly beneath the introduction, not low down the page. | F02 |
| R09 | Every page below the top level carries a breadcrumb reflecting its single canonical position. | A2 |
| R10 | A sub-service page shows its parent and its sibling sub-services. | F02 |
| R11 | Navigation is keyboard operable, dismissible with Escape, never hover-only, and keeps the same IA at 320px. | B1 |
| R12 | The label a user clicks matches the H1 of the page it opens. | B1 |
| R13 | Topic propositions promoted from Knowledge are addressable pages, not query-string filters. | B1 |

## Search

| ID | Requirement | Traces to |
|---|---|---|
| R20 | One search covers people, services and sectors, knowledge, news, events, documents and firm pages. | SP1, C4 |
| R21 | Ranking is tiered by page type: people and services above knowledge and news, documents below pages. A lawyer's name returns their profile first. | SP1 |
| R22 | Matching terms are highlighted in the title and in a snippet taken from the matching text. | SP1 |
| R23 | Facets with live counts: Service, Sector, Position, Office, Content type, Author, Year, Topic. Values that would return nothing are hidden. | SP2 |
| R24 | Every applied filter shows as a removable chip, with Clear all. | SP2 |
| R25 | Facets can be laid out as a sidebar or as a top bar. | SP2 |
| R26 | While filtered to one content type, the counts for every other type stay visible and accurate. | SP2 |
| R27 | The whole search state (query, filters, sort, page, layout) lives in the URL and can be copied as a link. | SP2 |
| R28 | Section searches (People, Knowledge, each service page) run on the same engine as a pre-applied scope, shown as a removable chip, widened to the whole site in one click. | SP3, F25 |
| R29 | Typeahead suggests services, sectors and topics first, then people, then pages, and understands synonyms. | SP4 |
| R30 | A query with no results is retried against a spelling correction, and the user is told, with a link to search for the original. | SP5 |
| R31 | A synonym map connects client language to firm language, and the results say when a synonym was used. | SP5 |
| R32 | PDF documents are indexed on their full text; a result shows the page that matched and ranks below the firm's own pages. | SP6, F24 |
| R33 | An advanced query builder combines conditions without syntax, with a live match count and a plain-English readout. | SP7 |
| R34 | With no query, search offers a browsable, categorised view of everything, with counts. | SP8 |
| R35 | A profile page turns its service, sector and office into links to the filtered directory, and shows related people generated from the same metadata. | SP9, F26 |
| R36 | Sort by relevance (default), newest, oldest, publication year or A–Z. | SP10 |
| R37 | A result says what it is before it is clicked; people results show role, practice and office. | SP1 |
| R38 | The zero-results state offers a correction, a broader search and a route to contact. | SP5 |
| R39 | Long facets are progressively disclosed and can be filtered within. | SP2 |
| R40 | Search announces result counts to assistive technology and is fully keyboard operable. | — |
| R41 | The People directory can be browsed A–Z and filtered by office. | SP2 |
| R42 | Ranking tiers, synonym groups and facet fields are declared as configuration, not code. | SP11, C4 |

## Later phase — for discussion, not for a first build

| ID | Requirement | Traces to |
|---|---|---|
| R50 | Promoted results ("best bets") pin an editorially chosen page to the top for named queries. Demonstrated on the query *careers*. | SP11 |
| R51 | Listed on the hub, not built: search analytics, saved searches and alerts, further document formats, editor-maintained synonyms, a semantic layer, location-aware search, reference-format matching, non-CMS sources. | SP11 |
