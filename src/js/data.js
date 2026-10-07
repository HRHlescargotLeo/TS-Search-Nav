/* ==========================================================================
   data.js — the prototype's content and configuration.

   SERVICE_TREE uses Travers Smith's real service and sub-service names, taken
   from the live A–Z in October 2026. Everything else — people, articles,
   documents, events — is FICTIONAL and shaped like the real site so the search
   can be judged against realistic content. No person named here is real.

   CONFIG at the bottom is the point of R42: ranking tiers, synonym groups and
   facet fields are declared as data, not code.
   ========================================================================== */

(function () {
  'use strict';

  /* --- Services: [name, [sub-services]] -------------------------------- */
  var SERVICE_TREE = [
    ['Alternative Asset Management', []],
    ['Arbitration', []],
    ['Artificial Intelligence', []],
    ['Asset Management', []],
    ['Civil Fraud', []],
    ['Commercial Law', ['Brexit', 'Direct Marketing & Advertising', 'Trading Law']],
    ['Competition', ['Competition Disputes']],
    ['Corporate Advisory', ['Listed Company Advisory']],
    ['Corporate Advisory and Governance', ['Anti-bribery & Corruption', 'Business Ethics & Human Rights', 'Export Control & Sanctions']],
    ['Corporate & Commercial Disputes', ['Contentious Insolvency', 'Crypto Disputes', 'Employment Disputes', 'IP Disputes', 'Pensions Disputes', 'Professional Negligence', 'Commercial Property Disputes', 'Product Liability', 'Tax Enquiries and Investigations', 'Mass Claims']],
    ['Corporate M&A', ['Equity Capital Markets', 'Infrastructure', 'Private Equity & Financial Sponsors', 'Transactional Tax']],
    ['Data Protection', ['Cyber Security & Data Breaches']],
    ['Derivatives & Structured Products', []],
    ['Employment', ['Global Mobility', 'Immigration', 'Projects, Integration and Restructuring', 'Whistleblowing']],
    ['Environment & Regulatory', ['Environment, Climate & Biodiversity', 'Health & Safety', 'Planning', 'Products & Chemicals', 'Regulated Industries']],
    ['ESG and Impact', ['ESG litigation and crisis management', 'ESG and the built environment', 'People & Diversity', 'Sustainable Finance and Investment']],
    ['Finance', ['Fund Finance', 'Leveraged & Acquisition Finance', 'Real Estate Finance', 'Refinancings & Corporate Facilities', 'Specialty & Structured Finance']],
    ['Financial Markets Disputes', []],
    ['Financial Services & Markets', ['Financial Services Regulation', 'Fintech, Market Infrastructure & Payments']],
    ['Funds', ['Investment Companies', 'Private Funds', 'Retail Funds']],
    ['Incentives & Remuneration', ['Executive Remuneration', 'Share Plans']],
    ['Investigations', ['Crisis Response', 'Employment Investigations']],
    ['IP & Technology', ['Fintech', 'Intellectual Property', 'Internet & e-commerce']],
    ['Pensions', ['Corporate Activity & Pensions', 'Pensions De-risking & Insured Solutions', 'Pensions Governance & Administration', 'Pensions Funding, Security & Restructuring', 'Pensions & HR', 'Pensions Liability Management', 'Pensions Investment', 'Pensions Outsourcing, Data Protection & Commercial Contracts']],
    ['Pro Bono', []],
    ['Public M&A', []],
    ['Real Estate', ['Construction & Engineering', 'Corporate Occupiers', 'Healthcare', 'Real Estate Development', 'Real Estate Investment', 'Real Estate M&A', 'Real Estate Tax', 'Senior Living', 'Data Centres']],
    ['Restructuring & Insolvency', []],
    ['Secondaries', []],
    ['Tax', ['Pensions Tax', 'Tax for Asset Managers', 'Tax and ESG', 'Tax Structuring & Advisory']],
    ['Technology & Commercial Transactions', ['Agency & distribution', 'Franchising', 'Infrastructure contracts', 'IT contracts', 'Joint Ventures', 'Outsourcing', 'Software', 'Supply of goods and/or services']]
  ];

  /* Sectors: the client-facing view (today's Spotlight column, plus Hotels,
     which is live but unlinked from every menu and from the A–Z). */
  var SECTORS = [
    'Alternative Asset Management', 'Defence, Security & Resilience', 'Financial Institutions',
    'Hotels', 'Infrastructure & Energy', 'Real Estate & Living', 'Sports', 'Technology & Digital'
  ];

  /* Editorial views over the one tree (R04). Today these are five menu
     columns; here they are labelled as views. */
  var VIEWS = {
    'Advisory': ['Asset Management', 'Commercial Law', 'Employment', 'Global Mobility', 'Immigration', 'Incentives & Remuneration', 'IP & Technology', 'Listed Company Advisory', 'Pensions', 'Tax'],
    'Disputes & investigations': ['Arbitration', 'Civil Fraud', 'Competition Disputes', 'Contentious Insolvency', 'Corporate & Commercial Disputes', 'Crypto Disputes', 'Mass Claims', 'Employment Disputes', 'Financial Markets Disputes', 'Investigations', 'Pensions Disputes', 'Professional Negligence', 'Commercial Property Disputes', 'Tax Enquiries and Investigations'],
    'Regulatory': ['Competition', 'Data Protection', 'Environment & Regulatory', 'Financial Services & Markets', 'Corporate Advisory and Governance'],
    'Transactions': ['Corporate M&A', 'Derivatives & Structured Products', 'Equity Capital Markets', 'Finance', 'Funds', 'Infrastructure', 'Private Equity & Financial Sponsors', 'Public M&A', 'Real Estate', 'Restructuring & Insolvency', 'Secondaries', 'Technology & Commercial Transactions']
  };

  var TOPICS = ['Artificial intelligence', 'Sanctions', 'Employment law reform', 'Pensions risk transfer',
    'Commonhold & leasehold reform', 'Global mobility', 'Sustainability reporting', 'Private capital', 'Digital assets'];

  /* --- People (fictional) --------------------------------------------- */
  /* [id, name, position, office, [services], [sectors], summary] */
  var PEOPLE = [
    ['eleanor-hartwell', 'Eleanor Hartwell', 'Partner', 'London', ['Private Equity & Financial Sponsors', 'Corporate M&A'], ['Alternative Asset Management'], 'Advises private equity sponsors on buyouts, bolt-ons and exits across the mid-market.'],
    ['marcus-adeyemi', 'Marcus Adeyemi', 'Partner', 'London', ['Private Equity & Financial Sponsors', 'Secondaries'], ['Alternative Asset Management'], 'Acts on GP-led secondaries, continuation funds and sponsor-to-sponsor deals.'],
    ['clara-montague', 'Clara Montague', 'Senior Associate', 'London', ['Private Equity & Financial Sponsors'], ['Technology & Digital'], 'Works on growth equity and buy-and-build strategies for technology businesses.'],
    ['tobias-renwick', 'Tobias Renwick', 'Associate', 'London', ['Private Equity & Financial Sponsors', 'Leveraged & Acquisition Finance'], [], 'Supports sponsor clients on acquisition structuring and financing.'],
    ['priya-lindqvist', 'Priya Lindqvist', 'Partner', 'London', ['Pensions', 'Pensions De-risking & Insured Solutions'], ['Financial Institutions'], 'Leads buy-ins, buy-outs and longevity swaps for trustees and sponsoring employers.'],
    ['hugh-castellane', 'Hugh Castellane', 'Senior Counsel', 'London', ['Pensions', 'Pensions Governance & Administration'], [], 'Advises trustee boards on governance, scheme administration and the Pensions Regulator’s expectations.'],
    ['amara-whitlock', 'Amara Whitlock', 'Associate', 'London', ['Pensions', 'Pensions Liability Management'], [], 'Works on liability management exercises and scheme restructurings.'],
    ['jonah-feldmann', 'Jonah Feldmann', 'Partner', 'London', ['Employment', 'Employment Investigations', 'Whistleblowing'], [], 'Handles senior executive exits, workplace investigations and whistleblowing claims.'],
    ['sofia-marchetti', 'Sofia Marchetti', 'Senior Associate', 'London', ['Employment', 'Global Mobility', 'Immigration'], ['Sports'], 'Advises on sponsor licences, cross-border secondments and athlete immigration.'],
    ['rhys-ogunleye', 'Rhys Ogunleye', 'Partner', 'London', ['Data Protection', 'Cyber Security & Data Breaches'], ['Technology & Digital'], 'Advises on GDPR compliance, data breach response and regulator engagement.'],
    ['isabel-quaintance', 'Isabel Quaintance', 'Senior Associate', 'London', ['Data Protection', 'Artificial Intelligence'], ['Technology & Digital'], 'Works on AI governance, data sharing and privacy-by-design programmes.'],
    ['oliver-strand', 'Oliver Strand', 'Partner', 'London', ['Technology & Commercial Transactions', 'Outsourcing', 'IT contracts', 'Artificial Intelligence'], ['Technology & Digital'], 'Negotiates technology, outsourcing and AI procurement contracts.'],
    ['beatrix-vandersloot', 'Beatrix Vandersloot', 'Partner', 'Brussels', ['Competition', 'Competition Disputes'], ['Technology & Digital'], 'Advises on EU merger control, foreign subsidies and abuse of dominance.'],
    ['luc-devereaux', 'Luc Devereaux', 'Senior Associate', 'Brussels', ['Competition', 'Export Control & Sanctions'], ['Defence, Security & Resilience'], 'Works on EU sanctions, export controls and foreign investment screening.'],
    ['annelies-moreau', 'Annelies Moreau', 'Associate', 'Brussels', ['Financial Services Regulation'], ['Financial Institutions'], 'Advises on EU financial services regulation, including MiCA and DORA.'],
    ['gideon-ashcombe', 'Gideon Ashcombe', 'Partner', 'London', ['Corporate & Commercial Disputes', 'Civil Fraud', 'Arbitration'], [], 'Leads high-value commercial litigation, fraud claims and international arbitration.'],
    ['harriet-blackwood', 'Harriet Blackwood', 'Senior Counsel', 'London', ['Corporate & Commercial Disputes', 'Crypto Disputes', 'Mass Claims'], ['Financial Institutions'], 'Acts on cryptoasset tracing, group actions and financial markets disputes.'],
    ['nathaniel-coyle', 'Nathaniel Coyle', 'Partner', 'London', ['Real Estate', 'Real Estate Investment', 'Senior Living'], ['Real Estate & Living', 'Hotels'], 'Advises investors on hotel, living and mixed-use real estate.'],
    ['freya-tennant', 'Freya Tennant', 'Senior Associate', 'London', ['Real Estate', 'Real Estate Development', 'Construction & Engineering'], ['Real Estate & Living'], 'Works on development agreements, forward funding and construction contracts.'],
    ['samuel-achebe', 'Samuel Achebe', 'Partner', 'London', ['Tax', 'Tax for Asset Managers', 'Transactional Tax'], ['Alternative Asset Management'], 'Advises fund managers on carried interest, structuring and transaction tax.'],
    ['lydia-farrow', 'Lydia Farrow', 'Partner', 'London', ['Funds', 'Private Funds'], ['Alternative Asset Management'], 'Structures private equity, credit and infrastructure funds.'],
    ['edmund-hale', 'Edmund Hale', 'Partner', 'London', ['Incentives & Remuneration', 'Share Plans', 'Executive Remuneration'], [], 'Designs management incentive plans and employee share schemes.'],
    ['ines-carvalho', 'Inês Carvalho', 'Knowledge Lawyer', 'London', ['Financial Services & Markets', 'Fintech, Market Infrastructure & Payments'], ['Financial Institutions'], 'Leads the firm’s know-how on payments and digital asset regulation.'],
    ['theo-wainwright', 'Theo Wainwright', 'Associate', 'London', ['Restructuring & Insolvency', 'Contentious Insolvency'], [], 'Works on restructuring plans and contentious insolvency proceedings.']
  ];

  /* --- Knowledge, news and events (fictional) ------------------------- */
  /* [id, type, title, date, [services], [authorIds], [topics], summary] */
  var KNOWLEDGE = [
    ['k1', 'Briefing', 'Continuation funds: what LPs are asking for in 2026', '2026-09-18', ['Secondaries', 'Private Equity & Financial Sponsors'], ['marcus-adeyemi'], ['Private capital'], 'GP-led secondaries have matured, and investors now expect tighter governance and clearer conflicts processes.'],
    ['k2', 'Article', 'Private equity exits in a higher-rate market', '2026-08-04', ['Private Equity & Financial Sponsors', 'Corporate M&A'], ['eleanor-hartwell', 'clara-montague'], ['Private capital'], 'Why dual-track processes and minority sales are becoming the default route to liquidity.'],
    ['k3', 'Deal', 'Travers Smith advises sponsor on acquisition of healthcare software group', '2026-07-22', ['Private Equity & Financial Sponsors'], ['eleanor-hartwell', 'tobias-renwick'], [], 'A cross-border buyout with a management rollover and a unitranche financing package.'],
    ['k4', 'Briefing', 'Buy-ins and buy-outs: the 2026 pricing picture', '2026-09-02', ['Pensions De-risking & Insured Solutions', 'Pensions'], ['priya-lindqvist'], ['Pensions risk transfer'], 'Insurer capacity remains strong, and trustees are moving earlier to secure pricing.'],
    ['k5', 'Podcast', 'Pensions in Practice: running off versus buying out', '2026-06-12', ['Pensions'], ['hugh-castellane', 'priya-lindqvist'], ['Pensions risk transfer'], 'Two partners discuss the run-on option for well-funded schemes and what the Pensions Regulator expects.'],
    ['k6', 'Article', 'The Employment Rights Bill: what changes for employers first', '2026-09-25', ['Employment'], ['jonah-feldmann'], ['Employment law reform'], 'Day-one unfair dismissal rights and the new rules on fire and rehire, in the order they take effect.'],
    ['k7', 'Briefing', 'Sponsor licence compliance after the latest Home Office guidance', '2026-05-30', ['Immigration', 'Global Mobility'], ['sofia-marchetti'], ['Global mobility'], 'Common audit failings and how to fix them before a compliance visit.'],
    ['k8', 'Article', 'GDPR fines and the new UK data regime: where enforcement is heading', '2026-08-19', ['Data Protection'], ['rhys-ogunleye'], [], 'The Data (Use and Access) Act changes the balance, but the regulator’s priorities are clear.'],
    ['k9', 'Briefing', 'Responding to a ransomware attack: the first 72 hours', '2026-04-15', ['Cyber Security & Data Breaches', 'Data Protection'], ['rhys-ogunleye', 'isabel-quaintance'], [], 'Notification duties, privilege and the decisions that cannot wait.'],
    ['k10', 'Article', 'Governing AI procurement: contract terms that matter', '2026-09-09', ['Artificial Intelligence', 'Technology & Commercial Transactions', 'IT contracts'], ['oliver-strand', 'isabel-quaintance'], ['Artificial intelligence'], 'Warranties, audit rights and model change clauses for organisations buying AI systems.'],
    ['k11', 'Video', 'In five minutes: the EU AI Act timeline', '2026-03-03', ['Artificial Intelligence', 'Data Protection'], ['isabel-quaintance'], ['Artificial intelligence'], 'Which obligations apply when, and to whom.'],
    ['k12', 'Briefing', 'EU sanctions: the twentieth package and anti-circumvention', '2026-07-10', ['Export Control & Sanctions', 'Competition'], ['luc-devereaux'], ['Sanctions'], 'New best-efforts obligations for EU parents and what they mean for non-EU subsidiaries.'],
    ['k13', 'Article', 'Foreign Subsidies Regulation: two years of notifications', '2026-06-26', ['Competition'], ['beatrix-vandersloot'], [], 'What the Commission has called in, and how it is changing deal timetables.'],
    ['k14', 'Briefing', 'MiCA and stablecoins: authorisation in practice', '2026-05-14', ['Financial Services Regulation', 'Fintech, Market Infrastructure & Payments'], ['annelies-moreau', 'ines-carvalho'], ['Digital assets'], 'Lessons from the first authorisations under the Markets in Crypto-Assets Regulation.'],
    ['k15', 'Article', 'Tracing cryptoassets through the English courts', '2026-02-20', ['Crypto Disputes', 'Civil Fraud'], ['harriet-blackwood'], ['Digital assets'], 'Proprietary injunctions, persons unknown and the practical limits of recovery.'],
    ['k16', 'Briefing', 'Commercial litigation outlook: the cases to watch', '2026-01-28', ['Corporate & Commercial Disputes'], ['gideon-ashcombe'], [], 'The appellate decisions likely to change commercial litigation strategy this year.'],
    ['k17', 'Article', 'Leasehold reform: where the new regime leaves landlords', '2026-08-28', ['Real Estate'], ['freya-tennant'], ['Commonhold & leasehold reform'], 'Ground rents, enfranchisement and the move towards commonhold.'],
    ['k18', 'Deal', 'Travers Smith advises on hotel portfolio acquisition', '2026-06-05', ['Real Estate Investment', 'Real Estate'], ['nathaniel-coyle'], [], 'A portfolio of nine regional hotels acquired by a European investor.'],
    ['k19', 'Article', 'Carried interest after the 2025 reforms', '2026-04-08', ['Tax for Asset Managers', 'Tax'], ['samuel-achebe'], ['Private capital'], 'How the new income-based regime works for UK fund managers.'],
    ['k20', 'Briefing', 'Fund finance: NAV facilities come of age', '2026-03-19', ['Fund Finance', 'Funds'], ['lydia-farrow'], ['Private capital'], 'Lender appetite, LP scrutiny and the documentation points that keep coming up.'],
    ['k21', 'Article', 'Share schemes for private companies: getting EMI right', '2026-07-01', ['Share Plans', 'Incentives & Remuneration'], ['edmund-hale'], [], 'Valuation agreements, qualifying conditions and the mistakes that cost tax relief.'],
    ['k22', 'Briefing', 'Sustainability reporting: ISSB adoption in the UK', '2026-05-06', ['ESG and Impact', 'Sustainable Finance and Investment'], [], ['Sustainability reporting'], 'Where UK sustainability disclosure standards are heading, and who will be in scope.'],
    ['k23', 'Article', 'Restructuring plans: cross-class cram down after recent judgments', '2026-02-11', ['Restructuring & Insolvency'], ['theo-wainwright'], [], 'The courts are setting firmer limits on what a plan can impose on dissenting creditors.'],
    ['n1', 'News', 'Travers Smith strengthens Brussels competition team', '2026-09-15', ['Competition'], [], [], 'A new senior associate joins the Brussels office to support growing EU regulatory work.'],
    ['n2', 'News', 'Travers Smith ranked in top tier for private equity', '2026-06-20', ['Private Equity & Financial Sponsors'], [], [], 'Recognition in the latest legal directory rankings for buyouts and high-end deals.'],
    ['n3', 'News', 'Pro bono: ten years of the community legal clinic', '2026-05-22', ['Pro Bono'], [], [], 'Lawyers from across the firm have advised more than two thousand clinic clients since it opened.'],
    ['n4', 'News', 'Travers Smith launches litigation funding guide', '2026-03-12', ['Corporate & Commercial Disputes'], ['gideon-ashcombe'], [], 'A practical guide for claimants considering third-party funding.'],
    ['e1', 'Event', 'Private Capital Forum 2026', '2026-11-12', ['Private Equity & Financial Sponsors', 'Funds'], ['eleanor-hartwell', 'lydia-farrow'], ['Private capital'], 'Our annual half-day forum for sponsors, investors and portfolio company leaders. London.'],
    ['e2', 'Event', 'Pensions trustee training: risk transfer', '2026-10-21', ['Pensions'], ['priya-lindqvist'], ['Pensions risk transfer'], 'A CPD-accredited session for trustees preparing for a buy-in. In person and online.'],
    ['e3', 'Event', 'Employment law update: autumn 2026', '2026-10-30', ['Employment'], ['jonah-feldmann'], ['Employment law reform'], 'Our quarterly round-up for HR and in-house employment teams. Online.']
  ];

  /* --- Documents: PDFs indexed on their full text (R32) --------------- */
  /* [id, title, date, [services], pages, [[pageNo, text]], summary] */
  var DOCUMENTS = [
    ['d1', 'Guide - Hybrid working policies.pdf', '2025-11-03', ['Employment'], 14,
      [[2, 'Employers should set out eligibility criteria for hybrid working and apply them consistently.'],
       [6, 'Monitoring of remote workers engages data protection obligations; a data protection impact assessment is usually required before monitoring software is introduced.'],
       [9, 'Flexible working requests must now be handled within two months, including any appeal.']],
      'A practical guide to drafting and operating hybrid working policies.'],
    ['d2', 'Pensions risk transfer - trustee checklist.pdf', '2026-02-14', ['Pensions De-risking & Insured Solutions'], 22,
      [[3, 'Trustees should cleanse scheme data well before approaching insurers.'],
       [11, 'Residual risk cover protects trustees against unknown liabilities after buy-out.']],
      'A step-by-step checklist for trustees preparing for a buy-in or buy-out.'],
    ['d3', 'Private equity deal terms survey 2026.pdf', '2026-05-01', ['Private Equity & Financial Sponsors'], 36,
      [[4, 'Locked box pricing mechanisms were used on most deals surveyed.'],
       [17, 'Warranty and indemnity insurance featured in the majority of secondary buyouts.']],
      'Our annual survey of terms on UK mid-market private equity transactions.'],
    ['d4', 'Sanctions compliance - board briefing pack.pdf', '2026-03-27', ['Export Control & Sanctions'], 18,
      [[5, 'Boards should document their sanctions risk assessment and review it at least annually.'],
       [12, 'Ownership and control tests differ between the UK and the EU regimes.']],
      'Slides and notes for a board-level briefing on sanctions risk.'],
    ['d5', 'AI governance framework - template.pdf', '2026-06-18', ['Artificial Intelligence', 'Data Protection'], 12,
      [[3, 'An AI register should record every system in use, its purpose and its risk classification.'],
       [8, 'Human oversight requirements apply to high-risk systems under the EU AI Act.']],
      'A template framework for governing the use of artificial intelligence.'],
    ['d6', 'Leasehold reform - landlord guide.pdf', '2026-08-01', ['Real Estate'], 16,
      [[7, 'Ground rents on new residential leases are restricted to a peppercorn.']],
      'What the leasehold reforms mean for institutional landlords.']
  ];

  /* --- Firm pages ------------------------------------------------------ */
  /* [id, title, section, url, summary] */
  var PAGES = [
    ['p-careers', 'Careers at Travers Smith', 'Careers', '#', 'Trainee solicitors, associates and business services roles.'],
    ['p-trainees', 'Trainee solicitors', 'Careers', '#', 'Our training contract, vacation schemes and how to apply.'],
    ['p-difference', 'Our difference', 'About us', '#', 'How we work, what we stand for and our responsible business commitments.'],
    ['p-international', 'International', 'About us', '#', 'How we work with leading independent firms around the world.'],
    ['p-probono', 'Pro bono and community engagement', 'About us', '#', 'Our pro bono programme and community legal clinic.'],
    ['p-alumni', 'Alumni', 'About us', '#', 'Staying in touch with the Travers Smith alumni network.'],
    ['p-contact', 'Contact us', 'About us', '#', 'Our London and Brussels offices, and how to reach us.'],
    ['p-media', 'Media contacts', 'Knowledge', '#', 'Press office contacts for journalists.'],
    ['p-subscribe', 'Subscribe to our updates', 'Knowledge', '#', 'Choose the briefings and events you want to hear about.']
  ];

  /* --- Configuration (R42) -------------------------------------------- */
  var CONFIG = {
    /* Higher tier ranks first when relevance is comparable (R21). */
    tiers: {
      'Person': 6.0, 'Service': 6.0, 'Sector': 6.0,
      'Page': 3.0, 'Event': 1.2, 'Knowledge': 1.2, 'News': 1.0, 'Document': 0.8
    },
    /* Synonym groups (R31): any member finds the others. */
    synonyms: [
      ['data protection', 'gdpr', 'privacy'],
      ['lawyer', 'solicitor', 'counsel'],
      ['ai', 'artificial intelligence', 'machine learning'],
      ['share schemes', 'share plans', 'emi', 'employee share'],
      ['fund restructuring', 'secondaries', 'continuation funds', 'gp-led'],
      ['litigation', 'disputes', 'court'],
      ['pe', 'private equity'],
      ['m&a', 'mergers', 'acquisitions'],
      ['sanctions', 'export control'],
      ['crypto', 'cryptoassets', 'digital assets', 'stablecoins'],
      ['buyout', 'buy-out', 'risk transfer', 'de-risking'],
      ['hr', 'employment', 'workplace'],
      ['visa', 'immigration', 'sponsor licence']
    ],
    /* Facets, in display order (R23). */
    facets: [
      { key: 'service', label: 'Service' },
      { key: 'sector', label: 'Sector' },
      { key: 'position', label: 'Position' },
      { key: 'office', label: 'Office' },
      { key: 'ktype', label: 'Content type' },
      { key: 'author', label: 'Author' },
      { key: 'topic', label: 'Topic' },
      { key: 'year', label: 'Year' }
    ],
    /* Result categories, in tab order (R26). */
    categories: [
      { key: 'people', label: 'People' },
      { key: 'services', label: 'Services & sectors' },
      { key: 'knowledge', label: 'Knowledge' },
      { key: 'news', label: 'News' },
      { key: 'events', label: 'Events' },
      { key: 'documents', label: 'Documents' },
      { key: 'pages', label: 'Pages' }
    ],
    /* Later phase (R50): promoted results. */
    bestBets: {
      'careers': 'p-careers',
      'jobs': 'p-careers',
      'graduate': 'p-trainees'
    }
  };

  window.TS_DATA = {
    SERVICE_TREE: SERVICE_TREE, SECTORS: SECTORS, VIEWS: VIEWS, TOPICS: TOPICS,
    PEOPLE: PEOPLE, KNOWLEDGE: KNOWLEDGE, DOCUMENTS: DOCUMENTS, PAGES: PAGES, CONFIG: CONFIG
  };
})();
