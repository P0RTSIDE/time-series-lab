import { Chapter, Quiz, type QuizQuestion } from "../components/UI";

function q(
  prompt: string,
  choices: [string, string, string, string],
  answer: 0 | 1 | 2 | 3,
  why: string,
  wrongs: [string, string, string, string],
): QuizQuestion {
  return { prompt, choices: [...choices], answer, why, wrongs: [...wrongs] };
}

const product: QuizQuestion[] = [
  q(
    "What does the congressional tracker claim to show?",
    [
      "Proof that a member traded because of a bill.",
      "Timing overlap between a disclosed trade and a vote on a mapped stock.",
      "The exact dollar profit from each trade.",
      "That a vote moved the stock price.",
    ],
    1,
    "A signal means the trade date, the member, and a curated ticker line up with a vote. It is an association, not a motive or a price effect.",
    [
      "The page says timing overlap only. Motive is not in the data.",
      "",
      "Filings report dollar brackets, not a profit figure.",
      "The project does not measure price impact.",
    ],
  ),
  q(
    "Why does the write-up refuse words like influence or insider trading?",
    [
      "Those datasets are private.",
      "Donors may already agree with the member, and a trade may be routine. The join cannot separate those stories.",
      "Congress banned that analysis.",
      "The charts cannot show party.",
    ],
    1,
    "Selection and influence look the same in a donor list. A PTR date next to a vote is not a reason.",
    [
      "The sources are public disclosures and APIs.",
      "",
      "The limit is methodological, not a legal ban on the chart.",
      "Party is shown. The caution is about causation.",
    ],
  ),
  q(
    "Cross-party in this project means:",
    [
      "A member who switched parties.",
      "A member who voted against their own party's majority on that roll call.",
      "A vote where both parties agreed.",
      "A senator who also sits in the House.",
    ],
    1,
    "The flag compares the member's yea or nay with their party's majority on that vote. Ties and unknown majorities are not cross-party. Present or not voting does not count.",
    [
      "Party switching is a different fact and is not this flag.",
      "",
      "Agreement is the opposite of dissent.",
      "Chamber is stored separately. Cross-party is about the vote.",
    ],
  ),
  q(
    "Is the rule applied to only one party?",
    [
      "Only Democrats.",
      "Only Republicans.",
      "The same majority test runs for both parties.",
      "Only independents.",
    ],
    2,
    "Colors differ on the chart. The dissent rule does not.",
    [
      "Democrats are not singled out.",
      "Republicans are not singled out.",
      "",
      "Independents can appear, but the rule is not limited to them.",
    ],
  ),
];

const architecture: QuizQuestion[] = [
  q(
    "What does the browser call when the dashboard loads?",
    [
      "Congress.gov, the FEC, and the lobbying API directly.",
      "A live SQLite database.",
      "One prebuilt JSON file of signals and summaries.",
      "The member's brokerage.",
    ],
    2,
    "Python builds the join offline. The page fetches that snapshot once. API keys never sit in the browser.",
    [
      "Those calls happen in the Python loaders, not in React.",
      "SQLite stays on the machine that runs the pipeline.",
      "",
      "There is no brokerage connection.",
    ],
  ),
  q(
    "Why is there no request API in front of the charts?",
    [
      "Browsers cannot draw charts.",
      "The questions are historical. Precomputing the join keeps keys off the page and keeps the view fast.",
      "SQLite cannot be queried.",
      "Vercel requires a single file.",
    ],
    1,
    "A new vote does not appear until the loaders and export run again and the static file is republished.",
    [
      "The charts are the point of the page.",
      "",
      "SQLite is queried by the Python step, not by the page.",
      "Vercel is just the static host. The design choice is the snapshot.",
    ],
  ),
  q(
    "How is the site hosted?",
    [
      "The Python process stays running and answers each click.",
      "A static Vite build. The host serves the built page and the JSON that was copied into it.",
      "Each chart is a notebook widget.",
      "It only works on localhost.",
    ],
    1,
    "The host builds the web app and publishes the output folder. It does not run the data pipeline.",
    [
      "Python runs when you refresh the data, not when a visitor opens a chart.",
      "",
      "Notebooks are for analysis, not the public page.",
      "Local preview exists, and the same build is what gets published.",
    ],
  ),
  q(
    "What does the visitor see if the data file fails to load?",
    [
      "A stack trace and a file path.",
      "An empty stock chart labeled as proof of no trades.",
      "A short message asking them to refresh.",
      "A login form.",
    ],
    2,
    "The error state stays plain. It does not leak paths or keys.",
    [
      "Paths and traces are kept out of the page.",
      "A failed load is not the same as zero signals.",
      "",
      "There are no accounts.",
    ],
  ),
];

const frontend: QuizQuestion[] = [
  q(
    "What is the page built with?",
    [
      "React, TypeScript, Vite, and Recharts.",
      "A Python web framework that renders HTML on each request.",
      "Unity.",
      "A spreadsheet embedded in the page.",
    ],
    0,
    "State lives in the main page component. There is no separate router library and no global store.",
    [
      "",
      "Python prepares data. It does not render the dashboard.",
      "Unity is a different track on this course site.",
      "Charts are Recharts components, not a sheet.",
    ],
  ),
  q(
    "When do the chart aggregates recompute?",
    [
      "On every mouse move, from scratch, including unrelated state.",
      "When the selected bill's signal list changes.",
      "Only after a full browser restart.",
      "On a timer every second.",
    ],
    1,
    "Memos depend on the filtered signals. Hovering a point does not rebuild the bars.",
    [
      "Hover updates the detail panel, not the bucket math.",
      "",
      "Nothing waits on a restart.",
      "There is no polling timer.",
    ],
  ),
  q(
    "Why are dates shown from a noon timestamp?",
    [
      "Congress votes at noon.",
      "A date-only string can shift a calendar day if it is read as UTC midnight.",
      "Recharts requires noon.",
      "To hide the real trade date.",
    ],
    1,
    "Pinning noon keeps the label on the filing's calendar date.",
    [
      "Noon here is a display trick, not the vote clock.",
      "",
      "The chart library does not require that hour.",
      "The date is the disclosed trade date. Nothing is hidden.",
    ],
  ),
  q(
    "What counts as a large trade on the page?",
    [
      "Any trade over one dollar.",
      "The top of the disclosure bracket at $50,001 or more.",
      "An exact fill price from a broker.",
      "Only sales.",
    ],
    1,
    "Periodic transaction reports use ranges. The page treats the upper end of the bracket, not a precise amount.",
    [
      "One dollar is below every real bracket used here.",
      "",
      "The pipeline never receives an exact fill.",
      "Purchases can be large too.",
    ],
  ),
];

const interactions: QuizQuestion[] = [
  q(
    "What can a visitor do on the dashboard?",
    [
      "Edit a member's vote.",
      "Switch bills, hover a point, pin a trade, and open methodology.",
      "File a new stock disclosure.",
      "Change the fuzzy-match threshold.",
    ],
    1,
    "Bill choice filters every chart and the member summaries. Pin keeps a trade open when the pointer moves.",
    [
      "Votes are read-only public records.",
      "",
      "Disclosures are ingested offline.",
      "The match threshold is a pipeline setting, not a slider on the page.",
    ],
  ),
  q(
    "If a trade is pinned and the pointer moves to another point, which trade stays open?",
    [
      "The hovered one.",
      "Neither. The panel closes.",
      "The pinned one.",
      "Whichever has the larger dollar bracket.",
    ],
    2,
    "Pinned wins over hover so a selection is not cleared by accident.",
    [
      "Hover only fills in when nothing is pinned.",
      "The panel stays on the pin.",
      "",
      "Size does not choose the open card.",
    ],
  ),
  q(
    "What is the scatter plot?",
    [
      "Stock price on the vertical axis.",
      "Days before the vote across, ticker up the side.",
      "Donor dollars across, party up the side.",
      "A map of districts.",
    ],
    1,
    "A larger mark means the disclosure bracket is in the large range.",
    [
      "Price is not on this chart.",
      "",
      "Donors are a separate analysis from this scatter.",
      "There is no district map.",
    ],
  ),
  q(
    "What is the bar chart?",
    [
      "One bar per member.",
      "Day-offset buckets, with purchases and sales counted apart.",
      "The member's approval rating.",
      "Lobbying dollars by industry.",
    ],
    1,
    "Each bucket is how many flagged buys or sells fell that many days before the vote.",
    [
      "Members are listed separately from this chart.",
      "",
      "Approval is not in the dataset.",
      "Lobbying dollars are not this bar chart.",
    ],
  ),
];

const data: QuizQuestion[] = [
  q(
    "Where do the joins live?",
    [
      "In the browser, on every visit.",
      "In SQLite, loaded by Python, then exported.",
      "Only in a spreadsheet.",
      "Inside Congress.gov.",
    ],
    1,
    "The database file is local to the pipeline. Foreign keys are turned on. The page never opens that file.",
    [
      "The browser only reads the export.",
      "",
      "Spreadsheets are not the system of record.",
      "Congress.gov is a source, not the warehouse.",
    ],
  ),
  q(
    "What is the canonical member id?",
    [
      "A display name.",
      "The FEC candidate id alone.",
      "The bioguide id.",
      "The stock ticker.",
    ],
    2,
    "Senate, FEC, and OpenSecrets ids can sit beside it. The join key is bioguide.",
    [
      "Names collide. They are not the key.",
      "FEC id is an extra column, not the primary key.",
      "",
      "A ticker identifies a security, not a member.",
    ],
  ),
  q(
    "What is an entity alias?",
    [
      "A second password for the API.",
      "A raw organization name from one source, pointed at one canonical organization, with a match method and score.",
      "A duplicate of the member table.",
      "The bill's short title.",
    ],
    1,
    "The same PAC can show up with different suffixes in donations and lobbying filings. Aliases are how those strings meet.",
    [
      "Aliases are data, not credentials.",
      "",
      "Members have their own name index. This table is for organizations.",
      "Bill titles are not alias rows.",
    ],
  ),
  q(
    "Which SQL views matter for the voting story?",
    [
      "Party majority by vote, cross-party flags, crossing rates, and donor overlap.",
      "Only a view of stock prices.",
      "A view that deletes old members.",
      "There are no views. Everything is computed in the browser.",
    ],
    0,
    "Python can also write the cross-party flag back onto each member vote row.",
    [
      "",
      "Price history is not a view in this schema.",
      "Nothing in the pipeline deletes members as a view.",
      "The views are in SQLite. The browser reads the export.",
    ],
  ),
];

const apis: QuizQuestion[] = [
  q(
    "Where do House roll calls come from?",
    [
      "The Congress.gov API, with a key header and paging by offset.",
      "A scraped social media feed.",
      "The member's office spreadsheet.",
      "ProPublica's Congress API.",
    ],
    0,
    "The client waits about a second between calls and, on a rate-limit response, waits a minute and tries again. ProPublica's Congress API is retired and is not used.",
    [
      "",
      "Votes are official records, not posts.",
      "Offices are not the loader.",
      "That API was retired in 2024.",
    ],
  ),
  q(
    "Where do Senate roll calls come from?",
    [
      "The same House endpoint.",
      "Senate.gov vote menus and XML files.",
      "OpenFEC.",
      "The stock-trade API.",
    ],
    1,
    "House and Senate are different clients. Senate XML is parsed into the same vote shape, including a bill id like 118-hr-1.",
    [
      "House votes use Congress.gov. Senate votes do not reuse that list endpoint.",
      "",
      "OpenFEC is campaign money, not roll calls.",
      "The stock API is periodic transaction reports.",
    ],
  ),
  q(
    "Where do donor records come from in the automated loader?",
    [
      "The lobbying disclosures API.",
      "OpenFEC, using the candidate's principal campaign committee when it can be found.",
      "A manual CSV only, with no API.",
      "The broker that cleared the stock trade.",
    ],
    1,
    "The client sends the key as a query parameter and will not start without it. OpenSecrets bulk files are a separate, account-gated source, not this request path.",
    [
      "Lobbying filings are a different client.",
      "",
      "There is a live request path, not only a hand-built sheet.",
      "Brokers are not a source.",
    ],
  ),
  q(
    "Where do the stock rows come from?",
    [
      "A public aggregation of House and Senate periodic transaction reports. No key.",
      "A paid tick data vendor.",
      "The member typing trades into the dashboard.",
      "LDA filings.",
    ],
    0,
    "The client pages with limit and offset until the payload says there is nothing more, and it waits about a second between calls. Official filings still live with the House clerk and the Senate. This API is the aggregated copy.",
    [
      "",
      "There is no market-data vendor in this pipeline.",
      "Visitors cannot enter trades.",
      "LDA is lobbying, not stock disclosures.",
    ],
  ),
];

const signals: QuizQuestion[] = [
  q(
    "A stock signal requires all of these except:",
    [
      "Same member on the trade and the vote.",
      "Ticker on that bill's exposure list.",
      "Trade date on or before the vote, inside the window.",
      "A proven price jump on the vote day.",
    ],
    3,
    "The query joins member, bill exposure, and transaction, then keeps trades on or before the vote and inside the day window. Price is not in the predicate.",
    [
      "Member id is part of the join.",
      "Unmapped tickers do not become signals.",
      "Future trades relative to the vote are excluded.",
      "",
    ],
  ),
  q(
    "What is the exposure list?",
    [
      "Every ticker the member has ever held.",
      "A hand-picked set of companies or sectors that might be affected if the bill passes or fails, with a confidence note.",
      "The official list of winners published by Congress.",
      "The stocks that actually rose after the vote.",
    ],
    1,
    "Examples include platforms on a social-media bill, chips on an infrastructure bill, or contractors on a defense bill. The note says the link is editorial.",
    [
      "Holdings alone do not define exposure.",
      "",
      "Congress does not publish that winner list for this project.",
      "Later returns are not how the list is built.",
    ],
  ),
  q(
    "How can one trade produce two signal labels?",
    [
      "It cannot. The type column allows one value.",
      "A purchase or sale label, plus a large label when the bracket is at least $50,001.",
      "Once for each party.",
      "Once for the House and once for the Senate.",
    ],
    1,
    "The chart dedupes a trade before drawing so those two labels do not look like two filings.",
    [
      "Classification can attach a second label.",
      "",
      "Party does not duplicate the row.",
      "Chamber does not duplicate the label.",
    ],
  ),
  q(
    "What should you say if asked whether the window is 90 days or 365?",
    [
      "Always 365, because the methodology sentence says so.",
      "Always 90, and the methodology page cannot differ.",
      "The query window is a parameter. The code default is 90 days. The methodology text says 365. Check which export is published before quoting a number.",
      "There is no window. Every trade in history is a signal.",
    ],
    2,
    "Those two numbers both exist in the project. Quoting the wrong one is an easy miss.",
    [
      "The public sentence and the query default are not the same.",
      "The page text can disagree with the default until they are aligned.",
      "",
      "Trades outside the window are dropped.",
    ],
  ),
];

const overlap: QuizQuestion[] = [
  q(
    "What is the donor overlap score?",
    [
      "Dollars given divided by dollars lobbied.",
      "The share of the member's donor list that resolves to the same organizations lobbying on the bill.",
      "The number of bills the member sponsored.",
      "The correlation of stock returns.",
    ],
    1,
    "Names are matched to organization ids. The score is the size of the intersection divided by how many donors were in the profile. An empty profile scores zero.",
    [
      "Amounts are not the numerator.",
      "",
      "Sponsorship is a different column.",
      "Returns are not in this score.",
    ],
  ),
  q(
    "What does the default name match require?",
    [
      "An exact character-for-character copy only.",
      "A fuzzy score around 85 after stripping suffixes like PAC, Inc, and LLC, unless a known political organization list hits first.",
      "The same street address.",
      "A manual review of every row before any score exists.",
    ],
    1,
    "Cleaning lowercases the name, drops punctuation, and removes common suffixes. A known advocacy alias can short-circuit the fuzzy step.",
    [
      "Exact match would miss ordinary suffix differences.",
      "",
      "Addresses are not the match key.",
      "Manual aliases exist, but the run can score without reviewing every name first.",
    ],
  ),
  q(
    "How are PTR names tied to members?",
    [
      "By ticker.",
      "By a legislator crosswalk of bioguide records, plus a fuzzy match when the filing name is not exact.",
      "By assuming the first result from a web search.",
      "They are never matched. Every name is a new member.",
    ],
    1,
    "The crosswalk includes current and historical legislators. Names are indexed as first-last and last-comma-first.",
    [
      "Ticker does not identify the filer.",
      "",
      "Search ranking is not the match.",
      "Unmatched names are a known failure mode, not the design.",
    ],
  ),
  q(
    "Lobbying side versus the vote is treated as:",
    [
      "Yea lines up with support. Other positions in that helper line up with oppose.",
      "Every vote is support.",
      "Lobbyists do not report a side.",
      "The side is the member's party.",
    ],
    0,
    "That mapping is used when comparing the member's vote to the side reported on the lobbying filing. It is still an association.",
    [
      "",
      "Nay is not labeled support.",
      "The filings used here can carry a position.",
      "Party is not the lobbying side.",
    ],
  ),
];

const limits: QuizQuestion[] = [
  q(
    "Which libraries are listed but not what the loaders actually call?",
    [
      "React and Recharts.",
      "An ORM and an alternate HTTP client. The loaders use the database standard library and the requests library.",
      "SQLite and the Congress.gov client.",
      "Nothing is unused.",
    ],
    1,
    "Say that plainly. The working path is direct SQL and the requests client.",
    [
      "Those are the dashboard, and they are used.",
      "",
      "Those are on the working path.",
      "The requirements list is wider than the import list.",
    ],
  ),
  q(
    "What fails first on real filings?",
    [
      "The chart colors.",
      "Names: a filing may say last-name first, and a PAC name may not match the donor string.",
      "The browser refusing JSON.",
      "Foreign keys being off.",
    ],
    1,
    "Bill ids that miss the exposure map, and missing API keys, are the other early failures.",
    [
      "Colors are cosmetic.",
      "",
      "JSON failure is a missing export, not the usual data bug.",
      "Foreign keys are turned on.",
    ],
  ),
  q(
    "What is a fair criticism of the ticker list?",
    [
      "It is the complete set of securities affected, measured from returns.",
      "Someone chose the list, so a missed company or an extra company is an editorial choice.",
      "Congress assigns the list in statute.",
      "The list is empty.",
    ],
    1,
    "Confidence labels exist because the link can be direct, indirect, or only thematic.",
    [
      "Returns are not how tickers are chosen.",
      "",
      "The catalog is project-curated.",
      "Bills in the catalog have tickers.",
    ],
  ),
  q(
    "What would a sensible next step be?",
    [
      "Put API keys in the browser so the page can call Congress.gov itself.",
      "Make the published window match the query that built the file, and show donor overlap with the same caution language.",
      "Drop the causation disclaimer.",
      "Replace bioguide ids with display names.",
    ],
    1,
    "Keys stay on the loader machine. Names stay off the primary key. The disclaimer stays.",
    [
      "Keys in the page would be a step backward.",
      "",
      "The disclaimer is the point of the framing.",
      "Display names collide.",
    ],
  ),
];

export function TrackerQuiz() {
  return (
    <Chapter
      kicker="Project quiz"
      title="Congressional tracker"
      lede="Questions about the voting, donor, and stock timing site. Same check as the lessons: pick one, then reveal. Green is the answer you want in an interview. The note under a wrong choice says why it fails."
    >
      <h2>What the project claims</h2>
      <Quiz id="tracker-product" questions={product} />

      <h2>How the pieces fit</h2>
      <Quiz id="tracker-architecture" questions={architecture} />

      <h2>The page</h2>
      <Quiz id="tracker-frontend" questions={frontend} />

      <h2>What a visitor can do</h2>
      <Quiz id="tracker-interactions" questions={interactions} />

      <h2>The database</h2>
      <Quiz id="tracker-data" questions={data} />

      <h2>Sources</h2>
      <Quiz id="tracker-apis" questions={apis} />

      <h2>Stock signals</h2>
      <Quiz id="tracker-signals" questions={signals} />

      <h2>Donor overlap</h2>
      <Quiz id="tracker-overlap" questions={overlap} />

      <h2>Limits</h2>
      <Quiz id="tracker-limits" questions={limits} />
    </Chapter>
  );
}
