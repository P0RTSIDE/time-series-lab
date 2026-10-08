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
    "What does Blindspot Tracker claim to show?",
    [
      "Which outlet is the most trustworthy.",
      "When one side of the spectrum covers a topic heavily and the other side mostly does not.",
      "That a story is false.",
      "The exact audience that never saw a story.",
    ],
    1,
    "The site tracks coverage asymmetry. A blindspot is a gap in attention, not a verdict on truth or on an outlet's reputation.",
    [
      "Outlet ratings are an input. The charts describe coverage, not a trust ranking.",
      "",
      "The analyzer estimates framing. It does not check facts.",
      "There is no reader panel. Volume is article counts at selected domains.",
    ],
  ),
  q(
    "A right-side blindspot means:",
    [
      "Right-leaning outlets wrote most of the stories.",
      "Left-leaning outlets covered the topic heavily, and right-leaning outlets largely did not.",
      "The topic is absent from the news.",
      "Center outlets refused to run it.",
    ],
    1,
    "The name is the side that is quiet. Left carrying at least 65 percent of left-plus-right volume is a right-side blindspot.",
    [
      "That pattern is a left-side blindspot: the left is the quiet side.",
      "",
      "Absent is a separate label for a week that was not a major story.",
      "Center volume is counted in totals, not used to name the blindspot.",
    ],
  ),
  q(
    "Why avoid calling a blindspot proof that one side hid a story?",
    [
      "The charts have no numbers.",
      "Counts are keyword hits at rated domains. They are not a curated list of the same event, and they are not motive.",
      "The site only has sample data.",
      "Left and right are the same outlets.",
    ],
    1,
    "The about page says the figures are a proxy: keyword topics, no story-level deduping, and third-party outlet leans.",
    [
      "The heatmap and gap study are built from counts.",
      "",
      "Live snapshots can be loaded. Sample data is labeled when that is what you are seeing.",
      "Left and right are separate groups.",
    ],
  ),
  q(
    "How does the site treat the two sides?",
    [
      "Only left-side gaps are flagged.",
      "Only right-side gaps are flagged.",
      "The same 65 percent rule runs in both directions.",
      "Center outlets decide which side is wrong.",
    ],
    2,
    "The presentation is symmetric. The goal is to make a gap visible, not to rank a narrative.",
    [
      "A left-side blindspot is the mirror case, and it is included.",
      "A right-side blindspot is included the same way.",
      "",
      "Center outlets stay out of the left versus right split.",
    ],
  ),
];

const architecture: QuizQuestion[] = [
  q(
    "What is the app built with?",
    [
      "A Python API and a separate chart server.",
      "Next.js with the App Router, React, TypeScript, Tailwind, and Recharts.",
      "A Unity client talking to a database.",
      "A static HTML file with no server route.",
    ],
    1,
    "Pages and charts are a Next.js app. The article analyzer is the one route that runs on the server at request time.",
    [
      "Coverage is collected with Node scripts, not a Python service.",
      "",
      "There is no game client.",
      "The analyzer route is dynamic. The coverage pages read committed JSON.",
    ],
  ),
  q(
    "Where do the heatmap and gap charts get their numbers?",
    [
      "The browser calls NewsData on every page load.",
      "Precomputed JSON written by an offline fetch, then shipped with the site.",
      "A SQL database queried from the page.",
      "The language model, on each visit.",
    ],
    1,
    "Weekly refreshes update those files. The page does not hold an API key or query the news API itself.",
    [
      "The key stays with the fetch job. The page reads the saved snapshot.",
      "",
      "There is no database. Provenance is a small JSON record.",
      "The model is only for the article analyzer, and only when a key is set.",
    ],
  ),
  q(
    "Which request is dynamic?",
    [
      "Opening the heatmap.",
      "Posting a URL or pasted text to the analyze route.",
      "Switching the week range.",
      "Reading the about page.",
    ],
    1,
    "That route runs on Node, is marked dynamic, extracts the article, then scores it. The coverage views are static files.",
    [
      "The heatmap is precomputed.",
      "",
      "The range control filters weeks already on the page.",
      "The about page is methodology copy.",
    ],
  ),
  q(
    "What does the live versus sample badge describe?",
    [
      "Whether the language model is on.",
      "Whether the coverage files are a real snapshot or demonstration numbers, plus how many weeks were actually collected.",
      "The visitor's own lean.",
      "Which Git branch is deployed.",
    ],
    1,
    "Modes are sample, live GDELT, or live NewsData. NewsData history grows forward, so collected weeks can be fewer than the window length.",
    [
      "The analyzer has its own label: model or keyword fallback.",
      "",
      "The site does not score the reader.",
      "The badge is about the data, not the deploy.",
    ],
  ),
];

const frontend: QuizQuestion[] = [
  q(
    "What are the three main views?",
    [
      "Trades, donors, and votes.",
      "Blindspot history, coverage gaps, and a per-article analyzer.",
      "A map, a feed, and a login.",
      "Training, inference, and a leaderboard.",
    ],
    1,
    "History is topics across weeks. Gaps rank categories. The analyzer scores one article.",
    [
      "Those belong to a different project.",
      "",
      "There is no account system.",
      "This site does not train a model.",
    ],
  ),
  q(
    "How is a blindspot cell colored?",
    [
      "Randomly, so the grid looks dense.",
      "Red for a right-side blindspot, blue for a left-side blindspot, gray for balanced, and empty when the topic was not in top stories.",
      "Green when the story is true.",
      "One color for every week of a topic.",
    ],
    1,
    "Those colors match the four states. Absent cells are clear so a quiet week is not drawn as a blindspot.",
    [
      "Color is the state, not decoration.",
      "",
      "Truth is not a state on the grid.",
      "Each topic-week has its own state.",
    ],
  ),
  q(
    "What do the coverage gap charts compare?",
    [
      "Page views by hour.",
      "Left versus right share by category, plus volume against how polarized that share is.",
      "Model loss during training.",
      "Stock price against a vote.",
    ],
    1,
    "A category can be small and lopsided, or widely covered and still split. Volume and divergence are shown together.",
    [
      "The site does not have audience analytics.",
      "",
      "Nothing is trained in the browser.",
      "There is no market data.",
    ],
  ),
  q(
    "Why can the grid show fewer weeks than the full window?",
    [
      "Recharts drops columns at random.",
      "Only weeks with a collected snapshot are drawn, so unmeasured weeks are not empty columns.",
      "Topics with long names are hidden.",
      "The browser cannot render more than four weeks.",
    ],
    1,
    "NewsData fills history forward. A 20 week window with 11 collected snapshots shows those 11.",
    [
      "The filter is the tracked-week list, not the chart library.",
      "",
      "All twelve topics stay. Weeks are what get filtered.",
      "The limit is missing snapshots, not the browser.",
    ],
  ),
];

const interactions: QuizQuestion[] = [
  q(
    "What can a visitor do on the article page?",
    [
      "Upload a model and fine-tune it.",
      "Paste a URL or paste the text, then read a lean score, four dimension bars, and highlighted phrases.",
      "Edit the outlet ratings.",
      "Download the news API key.",
    ],
    1,
    "The page posts that input to the analyze route. A highlight explains why a phrase was flagged.",
    [
      "No training runs in the app.",
      "",
      "Ratings are compiled offline.",
      "The key is not sent to the browser.",
    ],
  ),
  q(
    "What does the analyzer label as its engine?",
    [
      "Always the same hidden model.",
      "The model name when a language model ran, or keyword fallback when the lexicon ran.",
      "The outlet's AllSides badge only.",
      "Nothing. The score has no source.",
    ],
    1,
    "If the model call fails, the route still returns a result and marks it as the keyword fallback.",
    [
      "The engine depends on whether a key is configured and whether the call succeeds.",
      "",
      "Outlet reputation is intentionally not the article score.",
      "The result includes the engine.",
    ],
  ),
  q(
    "What should you treat the side-panel headlines as?",
    [
      "The full set of articles counted that week.",
      "Sample lines shaped like headlines, unless they are tied to retrieved article text.",
      "Quotes from the language model.",
      "A required citation for the cell.",
    ],
    1,
    "The cell's state comes from counts. The example titles are not the evidence.",
    [
      "The count is totalResults from the news API, not those three titles.",
      "",
      "The model is not used to draw the heatmap.",
      "The state stands without those titles.",
    ],
  ),
  q(
    "What happens if extraction cannot get enough article text?",
    [
      "The page invents a center score.",
      "The route returns an error and suggests pasting the text.",
      "The heatmap cell turns gray.",
      "The request is retried against GDELT.",
    ],
    1,
    "A URL must be http or https, and the extracted text has to be long enough. Short or blocked pages fail that step.",
    [
      "Failure is an error, not a fake score.",
      "",
      "The analyzer does not write coverage cells.",
      "GDELT is the other coverage pipeline, not the article extractor.",
    ],
  ),
];

const coverage: QuizQuestion[] = [
  q(
    "How is an outlet's lean chosen?",
    [
      "The site asks the language model to rate the domain.",
      "A consensus of AllSides, Ad Fontes, and Media Bias Fact Check, on a five-point scale.",
      "Whatever the visitor last clicked.",
      "A single party's press list.",
    ],
    1,
    "Left and lean-left are grouped as left. Right and lean-right are grouped as right. Center stays its own bucket.",
    [
      "The model scores article text, not the outlet list.",
      "",
      "The ratings are compiled ahead of time.",
      "Both sides are in the list.",
    ],
  ),
  q(
    "Why might the live outlet count be 10 when the ratings list is larger?",
    [
      "The extra outlets were deleted as biased.",
      "The default fetch counts the top five domains on the left and the top five on the right.",
      "NewsData only indexes ten sites in the world.",
      "Center outlets replace the list.",
    ],
    1,
    "A full run can count every rated domain on a side. Center is included only when that option is turned on.",
    [
      "The ratings list stays. The snapshot counts a subset unless you ask for all of them.",
      "",
      "The cap is the chosen subset and the free-tier query size, not a global index of ten.",
      "Center is off unless requested, and it is not the reason the default is ten.",
    ],
  ),
  q(
    "What does a divergence score of 0 mean?",
    [
      "The category had no articles.",
      "Left and right shares match.",
      "The topic was absent every week.",
      "The model refused to answer.",
    ],
    1,
    "Divergence is the absolute gap between the left share and the right share. 100 would mean one side had all of the left-plus-right volume.",
    [
      "Zero articles is not a perfect split.",
      "",
      "Absent weeks are a different label.",
      "Divergence is computed from counts, not from the model.",
    ],
  ),
  q(
    "Chronic blindspot percent ignores which weeks?",
    [
      "Weeks where the topic was balanced.",
      "Weeks marked not in top stories, so a quiet topic is not punished for simply not being news.",
      "The most recent week only.",
      "Any week with center coverage.",
    ],
    1,
    "The percent is among weeks the topic was actually covered. Dominant side is whichever blindspot appears more often than the other and at least as often as balanced weeks.",
    [
      "Balanced weeks are in the covered set. They lower the blindspot percent.",
      "",
      "Every covered week in the tracked range counts.",
      "Center volume can sit inside a week that is still covered.",
    ],
  ),
];

const sources: QuizQuestion[] = [
  q(
    "What does one NewsData run actually measure?",
    [
      "A twenty week archive in a single call.",
      "Article counts for the last 48 hours, saved under the current week so history grows on later runs.",
      "Full article bodies for every outlet.",
      "Television airtime.",
    ],
    1,
    "The free latest feed does not backfill. Weeks you never collected stay missing.",
    [
      "The window can list 20 weeks, but this API does not fill them in one run.",
      "",
      "The call uses a result count, not the article text.",
      "The input is written news domains.",
    ],
  ),
  q(
    "Where does the NewsData key live?",
    [
      "In the page, so charts can refresh themselves.",
      "In the environment for the fetch script and in the Actions secret for the weekly job.",
      "Inside the heatmap color table.",
      "It is not required.",
    ],
    1,
    "The weekly job refuses to run if that secret is missing, and it expects the key alone, not a whole assignment line.",
    [
      "The browser never receives it.",
      "",
      "Colors are unrelated.",
      "A live snapshot needs the key. Sample data does not.",
    ],
  ),
  q(
    "How is the weekly job paced?",
    [
      "It fires every request at once.",
      "It respects a free-tier cap of about 30 credits per 15 minutes, chunks domains in groups of five, and waits between calls.",
      "It only runs when someone opens the site.",
      "It uses the paid archive endpoint by default.",
    ],
    1,
    "The scheduled run is Mondays at 14:00 UTC, and it can also be started by hand. The default delay on that job is two seconds.",
    [
      "A burst would trip the cap.",
      "",
      "The job is GitHub Actions, not a page view.",
      "The archive endpoint is the paid one. This job uses the latest feed.",
    ],
  ),
  q(
    "What is the other coverage source for?",
    [
      "Scoring a pasted article.",
      "A GDELT backfill when you want older weeks in one pass.",
      "Replacing AllSides ratings.",
      "Hosting the site.",
    ],
    1,
    "NewsData accumulates forward. GDELT is the alternate pipeline for a longer look back, when that endpoint is reachable.",
    [
      "Articles go through Readability and then the model or the lexicon.",
      "",
      "Outlet lean still comes from the three-organization list.",
      "Hosting is separate from the news fetch.",
    ],
  ),
];

const blindspots: QuizQuestion[] = [
  q(
    "Center articles affect the blindspot label how?",
    [
      "They count as left.",
      "They count as right.",
      "They can add to total volume, but the 65 percent test uses only left plus right.",
      "They force the week to balanced.",
    ],
    2,
    "If left and right are both zero, the week is absent even if center volume exists. Center does not cast the partisan split.",
    [
      "Left is its own group.",
      "Right is its own group.",
      "",
      "Balanced means neither side reached 65 percent of the left-plus-right total.",
    ],
  ),
  q(
    "When is a topic-week marked not in top stories?",
    [
      "Whenever the left share is under 65 percent.",
      "When total volume is zero, or below one quarter of that topic's typical weekly volume.",
      "When the model confidence is low.",
      "When the week id is in the future.",
    ],
    1,
    "Typical volume is the median of weeks that had a positive count. The cutoff is one quarter of that median.",
    [
      "Under 65 percent and still enough volume is balanced, or a blindspot the other way.",
      "",
      "The label comes from counts.",
      "Future weeks are simply not collected yet.",
    ],
  ),
  q(
    "Left share is 70 percent of left plus right, and volume is above the quiet cutoff. The cell is:",
    [
      "Left-side blindspot.",
      "Right-side blindspot.",
      "Balanced.",
      "Absent.",
    ],
    1,
    "Left is carrying the story, so the right side is the blindspot. The mirror, 70 percent on the right, would be a left-side blindspot.",
    [
      "Left-side would mean the right outlets carried it.",
      "",
      "Balanced is when neither side reaches 65 percent.",
      "Volume cleared the quiet cutoff, so it is not absent.",
    ],
  ),
  q(
    "A coverage ratio of 3.2 on the left means:",
    [
      "3.2 articles existed in total.",
      "Left volume was about 3.2 times the right volume.",
      "The lean score was 3.2.",
      "3.2 weeks were missing.",
    ],
    1,
    "The ratio is the larger side divided by the smaller side. A zero on the smaller side is treated as one so the math does not divide by zero.",
    [
      "The ratio is a multiple, not a raw count.",
      "",
      "Article lean is on a scale from -6 to 6.",
      "Missing weeks are a separate count.",
    ],
  ),
];

const analyzer: QuizQuestion[] = [
  q(
    "What scale is the article lean score?",
    [
      "0 to 100, like a test grade.",
      "From -6 (far left) to +6 (far right), then a label from Left through Center to Right.",
      "A single true or false.",
      "The outlet's subscriber count.",
    ],
    1,
    "Around zero is Center. About -3 or below is Left, and about +3 or above is Right, with lean-left and lean-right in between.",
    [
      "Dimension strength is 0 to 10. The lean score is the -6 to 6 meter.",
      "",
      "The result is a number plus a label.",
      "Subscribers are not an input.",
    ],
  ),
  q(
    "What are the four dimension scores?",
    [
      "Headline, byline, date, and URL.",
      "Word choice, source selection, framing and emphasis, and omission. Each is strength from 0 to 10.",
      "Left, right, center, and absent.",
      "Precision, recall, F1, and accuracy.",
    ],
    1,
    "Those scores say how strong the bias looks on that axis. They are not the left versus right direction.",
    [
      "Those are source fields, not dimensions.",
      "",
      "Those are heatmap states.",
      "This is not a classifier benchmark.",
    ],
  ),
  q(
    "When does the language model run?",
    [
      "On every coverage chart.",
      "When an API key is set. Otherwise, and if the call throws, a keyword lexicon scores the text.",
      "Only if the visitor is logged in.",
      "Never. The lexicon is the only engine.",
    ],
    1,
    "The client speaks to any OpenAI-compatible chat endpoint. The default model is a small general model, with low temperature.",
    [
      "Charts do not call the model.",
      "",
      "There is no login.",
      "The lexicon is the fallback, not the only path.",
    ],
  ),
  q(
    "What does the keyword fallback refuse to pretend it measured?",
    [
      "Loaded words and a few editorial verbs.",
      "Source selection and omission. Those dimensions stay at zero, and confidence stays low.",
      "The character count.",
      "Whether the URL used https.",
    ],
    1,
    "Net hits lean the score: more right-coded terms than left-coded terms pushes positive. It saturates quickly and is labeled as a fallback.",
    [
      "Those hits are what it does measure.",
      "",
      "Character count is kept either way.",
      "The URL check happens before scoring.",
    ],
  ),
];

const limits: QuizQuestion[] = [
  q(
    "What is a fair limit of the topic match?",
    [
      "Every article is clustered by hand into one event.",
      "Keywords miss stories that use other wording, and they can count unrelated hits. The same event can be counted once per article.",
      "The match uses full semantic search on a private index.",
      "Topics are assigned by Congress.",
    ],
    1,
    "Twelve topics use short query phrases. There is no story-level deduping.",
    [
      "Clustering would remove that limit. This pipeline does not do it.",
      "",
      "The query is a keyword phrase, capped short for the news API.",
      "Topics are a fixed project list.",
    ],
  ),
  q(
    "What does the article score not claim?",
    [
      "An estimate of framing in the submitted text.",
      "That the article is factually true or false.",
      "Which engine produced it.",
      "A highlight that must be a verbatim phrase.",
    ],
    1,
    "The prompt also says not to score the outlet's reputation. Only the text in front of the model counts, and a highlight that is not actually in the text is dropped.",
    [
      "Framing is what it does estimate.",
      "",
      "The result names the engine.",
      "Verbatim highlights are required so they can be drawn on the text.",
    ],
  ),
  q(
    "Why can two visits a month apart disagree on older columns?",
    [
      "The colors are random.",
      "They should not. Older columns change only when a stored snapshot is rebuilt, and weeks that were never fetched cannot be reconstructed from the free news feed.",
      "The page re-queries the last ten years on each visit.",
      "The model rewrites history.",
    ],
    1,
    "A new run fills the current week. It does not invent the weeks you skipped.",
    [
      "Colors are fixed by state.",
      "",
      "The page reads saved weeks.",
      "The model is not on the coverage path.",
    ],
  ),
  q(
    "What is the project not?",
    [
      "An independent coverage tool inspired by Ground News.",
      "An official Ground News product, or a congressional stock and donor site.",
      "A site with a written methodology page.",
      "A demo that can fall back to sample coverage data.",
    ],
    1,
    "The about page says it is not affiliated with Ground News. Voting, donors, and stock trades are a different project.",
    [
      "The inspiration is stated, with that independence.",
      "",
      "The methodology page is part of the site.",
      "Sample data is a labeled fallback.",
    ],
  ),
];

const home: QuizQuestion[] = [
  q(
    "The home headline picks a topic by:",
    [
      "The highest chronic percent, even if both sides share it.",
      "The topic with the most weeks of one single blindspot side.",
      "Whichever category has the most stories.",
      "A random topic each refresh.",
    ],
    1,
    "It counts right-side weeks and left-side weeks separately and keeps the bigger of those two counts.",
    [
      "Chronic percent is a different ranking. The headline uses the single-side week count.",
      "",
      "Story volume is the gap study, not the headline.",
      "The pick is computed from the saved weeks.",
    ],
  ),
  q(
    "Stories analyzed on the home page is:",
    [
      "Only left-leaning articles.",
      "The sum of category volume, and that volume includes center outlets.",
      "The number of heatmap cells.",
      "How many times the analyzer has been used.",
    ],
    1,
    "Each category total is left plus right plus center. The home stat adds those totals.",
    [
      "Left is only one part of the volume.",
      "",
      "Cells are topic-weeks, not story counts.",
      "The analyzer does not feed that number.",
    ],
  ),
  q(
    "Topics tracked and categories studied match because:",
    [
      "They are two different lists that happen to look alike.",
      "The same topic list feeds the heatmap and the gap categories.",
      "Visitors add topics from the browser.",
      "The model invents a new list each week.",
    ],
    1,
    "There are twelve fixed topics, from Immigration through Religion. Both views use that list.",
    [
      "They are the same list, not a coincidence.",
      "",
      "The list is compiled with the data, not typed in by a visitor.",
      "The model is not involved in the coverage files.",
    ],
  ),
  q(
    "Weeks tracked on the home page means:",
    [
      "Always 52.",
      "Weeks that actually have a collected snapshot, not empty columns in the window.",
      "Only the current week.",
      "Weeks the visitor has opened.",
    ],
    1,
    "A 20 week window can still show fewer weeks if only some snapshots exist.",
    [
      "The window length and the collected count are different numbers.",
      "",
      "Older collected weeks stay in the count.",
      "It does not depend on who visited.",
    ],
  ),
];

const heatmap: QuizQuestion[] = [
  q(
    "The time range control offers 8 weeks, 16 weeks, and the full set when:",
    [
      "There is only one tracked week.",
      "More than 16 weeks have been collected.",
      "The model confidence is high.",
      "Center outlets are included.",
    ],
    1,
    "With 9 to 16 tracked weeks the choices are 8 and the full count. With 8 or fewer, there is only the full count, so the control stays hidden.",
    [
      "One week leaves a single option.",
      "",
      "The range is about weeks on the grid, not the analyzer.",
      "Center coverage does not decide the buttons.",
    ],
  ),
  q(
    "Clicking a heatmap cell opens:",
    [
      "The live article that caused the count.",
      "Sample headlines shaped for that topic, week, and state.",
      "The language model prompt.",
      "A new outlet rating.",
    ],
    1,
    "Those titles are examples. The cell color still comes from the left and right counts.",
    [
      "The fetch stores counts, not those three titles.",
      "",
      "The model is not on this page.",
      "Ratings are not edited from a cell.",
    ],
  ),
  q(
    "A clear cell means:",
    [
      "Balanced coverage.",
      "The topic was not in that week's top stories.",
      "The page failed to load.",
      "Center outlets refused the story.",
    ],
    1,
    "Balanced is gray. A right-side blindspot is red. A left-side blindspot is blue.",
    [
      "Balanced has its own gray.",
      "",
      "A missing file would not single out one cell.",
      "Center volume does not paint the cell by itself.",
    ],
  ),
  q(
    "Changing the time range does what to older snapshots?",
    [
      "Deletes them from the saved data.",
      "Hides them from this view. The underlying weeks stay.",
      "Recomputes them with the model.",
      "Turns live data into sample data.",
    ],
    1,
    "The control slices the tracked weeks already on the page.",
    [
      "Nothing is deleted.",
      "",
      "No model runs for the grid.",
      "The badge does not flip because you changed the range.",
    ],
  ),
];

const gaps: QuizQuestion[] = [
  q(
    "Top findings on the gap page are:",
    [
      "Every category, sorted by name.",
      "The four categories with the highest divergence, each shown as a coverage multiple.",
      "The four newest articles.",
      "Only categories the visitor clicked.",
    ],
    1,
    "A finding reads like a multiple: one side covered that category more than the other, with the left and right shares beside the story count.",
    [
      "Name order is not the ranking.",
      "",
      "Findings come from the category totals, not from article text.",
      "They are computed for the page, not picked by clicks.",
    ],
  ),
  q(
    "On the divergence bars, color means:",
    [
      "Which side carried the category.",
      "Whether the story is true.",
      "How many weeks were missing.",
      "The model's confidence.",
    ],
    0,
    "Blue is left-led. Red is right-led. A longer bar is a more one-sided split.",
    [
      "",
      "Truth is not what the bar measures.",
      "Missing weeks are not the bar color.",
      "The model does not color these bars.",
    ],
  ),
  q(
    "The scatter plot puts a category in the upper right when it is:",
    [
      "Low volume and balanced.",
      "Both widely covered and highly polarized.",
      "Absent for the whole window.",
      "Only covered by center outlets.",
    ],
    1,
    "Bubble size also scales with volume. The page calls that corner the place that reaches the most readers with the widest gap.",
    [
      "Low and balanced sits away from that corner.",
      "",
      "Absent weeks are not a point on that chart.",
      "Center-only volume is not the polarization axis.",
    ],
  ),
  q(
    "Most polarized and highest volume can be different categories because:",
    [
      "The page randomly picks two names.",
      "Divergence and story count are separate sorts.",
      "One uses the model and one uses the heatmap.",
      "Volume ignores left and right.",
    ],
    1,
    "Volume is left plus right plus center. Divergence is only the left versus right share gap.",
    [
      "Both names come from the same category list.",
      "",
      "Neither card calls the model.",
      "Volume includes all three groups. Divergence does not use center in the split.",
    ],
  ),
];

const meter: QuizQuestion[] = [
  q(
    "A lean score of 0 sits where on the meter?",
    [
      "At the far left end.",
      "In the center. The track runs from -6 to +6.",
      "Off the meter until a model is configured.",
      "At +6.",
    ],
    1,
    "The marker percent is the score plus 6, divided by 12. Zero is the middle.",
    [
      "Far left is -6.",
      "",
      "The meter draws for either engine.",
      "Far right is +6.",
    ],
  ),
  q(
    "The meter color switches at:",
    [
      "The same cut as the Left and Right labels, around 3.",
      "About 1: blue at -1 or below, red at +1 or above, gray in between.",
      "Only when confidence is under 15 percent.",
      "When the outlet is center.",
    ],
    1,
    "A score of 2 can already be red on the meter and still be labeled Lean Right. Color and label are not the same rule.",
    [
      "The labels use about 3. The ink uses about 1.",
      "",
      "Confidence is a separate number.",
      "The meter is about the article score, not the outlet list.",
    ],
  ),
  q(
    "A dimension bar turns red when its strength is:",
    [
      "Any nonzero score.",
      "6 or higher out of 10. From 3 up to that is amber. Under 3 stays gray.",
      "Only if the lean is to the right.",
      "Only on the keyword fallback.",
    ],
    1,
    "Dimension color is how strong that axis is, not which political side it leans.",
    [
      "A small score stays gray.",
      "",
      "Left and right do not pick this color.",
      "Both engines use the same bars.",
    ],
  ),
  q(
    "The number next to the label is shown as:",
    [
      "An integer from 0 to 100.",
      "One decimal, with a plus sign when the score is positive.",
      "A letter grade.",
      "The outlet's subscriber count.",
    ],
    1,
    "Dimension rows use the same one decimal, written over 10.",
    [
      "0 to 100 is not this meter.",
      "",
      "The label is a word. The number stays numeric.",
      "Subscribers are not on the meter.",
    ],
  ),
];

const labels: QuizQuestion[] = [
  q(
    "A score of -3 is labeled:",
    [
      "Lean Left.",
      "Left.",
      "Center.",
      "Right.",
    ],
    1,
    "Left starts at -3 and below. Just above that, until about -1, is Lean Left.",
    [
      "Lean Left is the band between about -1 and -3, not including -3.",
      "",
      "Center is roughly -1 through +1.",
      "Right is the positive end.",
    ],
  ),
  q(
    "A score of 0.5 is labeled:",
    [
      "Lean Right.",
      "Center.",
      "Right.",
      "Lean Left.",
    ],
    1,
    "Center runs from about -1 through about +1. Lean Right starts above that and stops before 3.",
    [
      "Lean Right needs a score above about 1.",
      "",
      "Right starts at 3.",
      "Lean Left is the negative side.",
    ],
  ),
  q(
    "A score of 3 is labeled:",
    [
      "Lean Right.",
      "Right.",
      "Center.",
      "Left.",
    ],
    1,
    "Lean Right is below 3. At 3 the label becomes Right.",
    [
      "2.9 would still be Lean Right.",
      "",
      "Center has already ended near 1.",
      "Left is the negative end.",
    ],
  ),
  q(
    "Why can the meter and the word disagree in feel?",
    [
      "The page has a bug that ignores the score.",
      "Ink changes near 1, while the words Left and Right wait until about 3.",
      "The word comes from the outlet and the ink comes from the text.",
      "Confidence replaces the score on the meter.",
    ],
    1,
    "Both use the same score. They just bucket it differently.",
    [
      "Both are computed from that score.",
      "",
      "The article score does not look up the outlet.",
      "Confidence is shown beside the meter, not instead of the score.",
    ],
  ),
];

const heuristic: QuizQuestion[] = [
  q(
    "The keyword score moves right when:",
    [
      "The URL is long.",
      "Right-coded hits outnumber left-coded hits. The gap is multiplied by 1.5 and clamped to -6 through 6.",
      "Any framing verb appears.",
      "The title contains a proper noun.",
    ],
    1,
    "The title is not used. Framing verbs are counted separately and do not pick a side.",
    [
      "Length is stored, not scored.",
      "",
      "Those verbs add a framing dimension. Their lean is neutral.",
      "The title is ignored by this fallback.",
    ],
  ),
  q(
    "Loaded verbs like slammed or blasted are marked as:",
    [
      "Right-leaning word choice.",
      "Neutral framing, not a left or right term.",
      "Omission.",
      "A source quote.",
    ],
    1,
    "They raise the framing dimension. They do not change the left versus right net.",
    [
      "Right-coded terms are a different list.",
      "",
      "Omission stays at zero in this fallback.",
      "The fallback does not detect quotes.",
    ],
  ),
  q(
    "Keyword confidence is:",
    [
      "Always 90 percent.",
      "15 percent when nothing matches, and 35 percent when any term or verb matches.",
      "The same 0 to 10 as a dimension.",
      "Copied from the outlet rating.",
    ],
    1,
    "That low ceiling is the point. The fallback is a lexicon, not a careful read.",
    [
      "It never claims high confidence.",
      "",
      "Confidence is a 0 to 1 number. Dimensions are 0 to 10.",
      "Outlet ratings are not an input here.",
    ],
  ),
  q(
    "Word choice strength in the fallback is:",
    [
      "Always 10 if any word matches.",
      "About 1.2 times the total left and right hits, capped at 10.",
      "The lean score itself.",
      "Zero, because only the model scores words.",
    ],
    1,
    "Framing strength is about 1.5 times the verb hits, also capped at 10. Source selection and omission stay at 0.",
    [
      "A single hit does not max the bar.",
      "",
      "The lean score is the -6 to 6 meter, not this bar.",
      "The fallback does score word choice.",
    ],
  ),
];

const model: QuizQuestion[] = [
  q(
    "The model call is aimed at:",
    [
      "One private vendor and no other.",
      "Any chat endpoint that speaks the same request shape. The default host is OpenAI and the default model is a small general one.",
      "The NewsData latest feed.",
      "The browser, with the key inside the page.",
    ],
    1,
    "You point the base URL, the model name, and the key at the provider you want. Temperature stays low, at 0.2.",
    [
      "The client is provider-agnostic.",
      "",
      "NewsData is the coverage fetch, not this call.",
      "The key stays on the server.",
    ],
  ),
  q(
    "The instruction to the model says to judge:",
    [
      "The outlet's reputation.",
      "Only the article text, at article level, in a U.S. politics context.",
      "Whether the facts are true.",
      "How many subscribers the site has.",
    ],
    1,
    "It also says most straight news should land at Center or only a slight lean.",
    [
      "Reputation is explicitly out of bounds.",
      "",
      "Factual accuracy is not the task.",
      "Audience size is not an input.",
    ],
  ),
  q(
    "If the model wraps its answer in a code fence, the route:",
    [
      "Throws the whole analysis away.",
      "Strips the fence and reads the JSON object inside.",
      "Treats the fence as a blindspot.",
      "Sends the fence back to the browser as the score.",
    ],
    1,
    "It looks for a JSON object. A span is kept only when that exact phrase is in the article.",
    [
      "A fence is unwrapped first.",
      "",
      "Fences are not a coverage state.",
      "The browser gets the parsed score, not the raw fence.",
    ],
  ),
  q(
    "A missing dimension in the model's JSON becomes:",
    [
      "A crash.",
      "That named row at score 0. The four names are always returned.",
      "A score of 10.",
      "A reason to skip the heuristic forever.",
    ],
    1,
    "Scores are clamped from 0 to 10. The lean score is clamped from -6 to 6. A missing confidence falls back near one half.",
    [
      "The route fills the row.",
      "",
      "Empty is 0, not 10.",
      "This is still the model path. The heuristic is the other engine.",
    ],
  ),
];

const extract: QuizQuestion[] = [
  q(
    "A URL is read with:",
    [
      "A screenshot of the page.",
      "Mozilla Readability, the same idea as a browser reader view, after the HTML is loaded on the server.",
      "The NewsData article body field.",
      "The visitor's clipboard only.",
    ],
    1,
    "The request follows redirects and only allows http or https.",
    [
      "There is no screenshot step.",
      "",
      "NewsData supplies counts, not this page's body.",
      "Paste is the other mode. A URL is fetched.",
    ],
  ),
  q(
    "Extraction fails when the readable text is:",
    [
      "Longer than a tweet.",
      "Under 200 characters, or the page cannot be fetched.",
      "Missing a byline.",
      "From a center outlet.",
    ],
    1,
    "The error tells the visitor to paste the text instead. A byline can be empty and the run can still continue.",
    [
      "Short text is the failure, not long text.",
      "",
      "A missing byline is allowed.",
      "Outlet lean is not checked here.",
    ],
  ),
  q(
    "The character count on the result is:",
    [
      "Only the first 100 characters.",
      "The full extracted length, even if the scored text was cut to 12,000 characters.",
      "The number of highlights.",
      "Always 12,000.",
    ],
    1,
    "The model or the lexicon sees the cut text. The count still reports how long the article was.",
    [
      "The cap is 12,000, not 100.",
      "",
      "Highlights are a separate list.",
      "12,000 is the cap, not the measured length.",
    ],
  ),
  q(
    "Pasted text skips which step?",
    [
      "Scoring.",
      "The URL fetch. The words you pasted are the article.",
      "The lean label.",
      "The dimension list.",
    ],
    1,
    "The result is marked as pasted text instead of from a URL. Scoring still runs.",
    [
      "Scoring still happens.",
      "",
      "The label is still computed.",
      "The four dimensions are still returned.",
    ],
  ),
];

const errors: QuizQuestion[] = [
  q(
    "A body that is not JSON, or that has neither a URL nor text, returns:",
    [
      "A Center score.",
      "400.",
      "A right-side blindspot.",
      "200 with an empty heatmap.",
    ],
    1,
    "That check happens before any fetch or score.",
    [
      "There is no fake score for a bad body.",
      "",
      "Blindspots are not this route.",
      "200 is a successful analysis.",
    ],
  ),
  q(
    "When the page cannot be read, the status is:",
    [
      "200 with a keyword score of zero.",
      "422.",
      "404 for every failure.",
      "301.",
    ],
    1,
    "422 is the extract failure. A model failure is different: the route catches it and still returns a keyword result.",
    [
      "A failed fetch does not invent a score.",
      "",
      "404 is not the status used here.",
      "Redirects are followed. They are not the error you return.",
    ],
  ),
  q(
    "If the model request fails, the visitor sees:",
    [
      "A blank page and a 500.",
      "A keyword result, labeled as the fallback.",
      "The heatmap with every cell absent.",
      "The raw provider error as the lean score.",
    ],
    1,
    "The failure is logged on the server. The response is still an analysis.",
    [
      "The route degrades instead of failing the whole request.",
      "",
      "Coverage data is untouched.",
      "The provider error is not the score.",
    ],
  ),
  q(
    "The analyze route is marked dynamic because:",
    [
      "The heatmap must recompute on every visit.",
      "Each article request does live work: fetch, extract, and score. It cannot be a frozen page.",
      "Tailwind needs it.",
      "Recharts refuses static pages.",
    ],
    1,
    "It also runs on Node, which is what the HTML reader needs.",
    [
      "The heatmap is static JSON.",
      "",
      "Styling does not decide this.",
      "Charts are on the coverage pages.",
    ],
  ),
];

const newsdata: QuizQuestion[] = [
  q(
    "One NewsData credit in this pipeline buys:",
    [
      "A full article for one topic.",
      "A result count for one query, which is one topic phrase and up to five domains.",
      "An outlet rating from AllSides.",
      "A week of GDELT history.",
    ],
    1,
    "Domains are sent in groups of five because that is the free plan cap. The count used is totalResults.",
    [
      "Bodies are not what this call stores.",
      "",
      "AllSides is in the ratings list, not this request.",
      "GDELT is the other pipeline.",
    ],
  ),
  q(
    "The free latest feed rejects a custom time window, so the script:",
    [
      "Sends timeframe anyway.",
      "Omits that parameter and treats the response as about the last 48 hours.",
      "Switches to the paid archive automatically.",
      "Asks the model for older articles.",
    ],
    1,
    "A paid-only time filter would come back as an error. The script does not send it.",
    [
      "Sending it is what the free tier rejects.",
      "",
      "The archive is not the default path.",
      "The model is not in this script.",
    ],
  ),
  q(
    "The daily and short-window caps the script plans around are:",
    [
      "Unlimited calls.",
      "About 200 credits a day and 30 credits each 15 minutes.",
      "One call a week.",
      "Five calls total.",
    ],
    1,
    "The script waits when the 15 minute window is full. The default pause between calls is 1.5 seconds. The weekly job uses 2 seconds.",
    [
      "The free tier is capped.",
      "",
      "The job is weekly, but one run makes many calls.",
      "Five is the domain group size, not the whole budget.",
    ],
  ),
  q(
    "An unknown domain in a NewsData response is:",
    [
      "Counted as a left outlet.",
      "Remapped when the API suggests a replacement, or dropped when it does not.",
      "A reason to delete the topic.",
      "Ignored for one call and then retried forever unchanged.",
    ],
    1,
    "Those fixes are remembered so the next query uses the corrected domain.",
    [
      "A bad domain is not given a lean.",
      "",
      "The topic stays. Only that domain changes.",
      "The correction is saved, not repeated blindly.",
    ],
  ),
];

const edges: QuizQuestion[] = [
  q(
    "Left and right are both zero, but center articles exist. The week is:",
    [
      "Balanced.",
      "Absent. Center volume cannot create a left versus right split.",
      "A right-side blindspot.",
      "A left-side blindspot.",
    ],
    1,
    "The split needs a left-plus-right total. Center can still sit inside the story count.",
    [
      "Balanced needs both sides present and neither at 65 percent.",
      "",
      "The right side did not carry the left-plus-right total.",
      "The left side did not either.",
    ],
  ),
  q(
    "The quiet cutoff compares this week with:",
    [
      "A fixed 10 articles.",
      "One quarter of that topic's median positive weekly volume.",
      "The busiest category on the site.",
      "Last year's average from GDELT only.",
    ],
    1,
    "The median ignores weeks that totaled zero. Below that quarter, or at zero, the week is not in top stories.",
    [
      "There is no global article minimum.",
      "",
      "Each topic has its own median.",
      "The rule is the same for either live source.",
    ],
  ),
  q(
    "Left has 64 percent of left plus right, and the week is loud enough. The cell is:",
    [
      "A right-side blindspot.",
      "Balanced. The cutoff is 65 percent.",
      "Absent.",
      "A left-side blindspot.",
    ],
    1,
    "64 is just short. 65 or more on the left would be a right-side blindspot.",
    [
      "65 is the line, and this week is under it.",
      "",
      "Volume cleared the quiet test.",
      "The left is ahead, but not enough to name a blindspot.",
    ],
  ),
  q(
    "Equal left and right shares make the coverage multiple:",
    [
      "Undefined, so the page crashes.",
      "1.0 on the left, because a tie uses the left side of that comparison.",
      "100.",
      "The lean score.",
    ],
    1,
    "Divergence would be 0. The multiple divides the larger share by the smaller one, and a zero share is treated as 1 so it never divides by zero.",
    [
      "The tie is defined.",
      "",
      "100 would mean one side had everything.",
      "The multiple is not the article meter.",
    ],
  ),
];

const job: QuizQuestion[] = [
  q(
    "The weekly coverage job runs:",
    [
      "Every time someone opens the heatmap.",
      "Mondays at 14:00 UTC, and also when someone starts it by hand.",
      "Only on the first of the month.",
      "Inside the visitor's browser.",
    ],
    1,
    "It checks out the repo, runs the NewsData snapshot, and pushes updated data when something changed.",
    [
      "Page views do not spend NewsData credits.",
      "",
      "The schedule is weekly.",
      "The key never reaches the browser.",
    ],
  ),
  q(
    "The job refuses the secret when:",
    [
      "The key is shorter than 20 characters.",
      "It is missing, contains an equals sign, or has a space at either end.",
      "It does not start with a news brand name.",
      "More than 11 weeks already exist.",
    ],
    1,
    "The value should be the key alone, not a full assignment line.",
    [
      "Length is not the check.",
      "",
      "The check is shape, not a brand prefix.",
      "Existing weeks are not a reason to abort.",
    ],
  ),
  q(
    "If a run dies halfway through the topics:",
    [
      "The whole history file is wiped.",
      "Topics already counted are saved, so a rerun can continue.",
      "The site switches to the congressional tracker.",
      "Every week becomes balanced.",
    ],
    1,
    "Progress is written after each topic. Network blips retry a few times. A quota error does not pretend to be a blip.",
    [
      "Partial data is kept.",
      "",
      "That is a different project.",
      "Finished topics keep the counts they had.",
    ],
  ),
  q(
    "If the new snapshot matches what is already committed, the job:",
    [
      "Opens a pull request anyway.",
      "Stops without a commit.",
      "Deletes the heatmap.",
      "Rotates the API key.",
    ],
    1,
    "It only commits when the data files actually differ.",
    [
      "There is no pull request step.",
      "",
      "Unchanged data leaves the site as it was.",
      "The key is not rotated by the job.",
    ],
  ),
];

const weeks: QuizQuestion[] = [
  q(
    "A week id like 2026-W40 means:",
    [
      "The 40th day of 2026.",
      "An ISO week: Monday through Sunday, in UTC.",
      "40 days ending today.",
      "A fiscal quarter.",
    ],
    1,
    "The label on the site can show that Monday-to-Sunday range in plain dates.",
    [
      "W40 is a week number, not a day of the year.",
      "",
      "It is a calendar week, not a rolling 40 day span.",
      "Quarters are not the unit.",
    ],
  ),
  q(
    "The snapshot from today's run is stored on:",
    [
      "Whichever week has the fewest articles.",
      "The ISO week that contains the current Monday.",
      "Week 1 of the window.",
      "A new file per outlet.",
    ],
    1,
    "Older weeks stay only if a previous run saved them. Weeks outside the visible window are dropped from the store.",
    [
      "The target week is the calendar week, not the quietest one.",
      "",
      "Week 1 is just the oldest slot in the window.",
      "Outlets are columns inside the week, not separate files per site.",
    ],
  ),
  q(
    "The provenance record's week count versus weeks collected means:",
    [
      "They are always equal.",
      "The window length versus how many of those weeks have a real snapshot.",
      "Sample rows versus model rows.",
      "Left weeks versus right weeks.",
    ],
    1,
    "A live NewsData file can say the window is 20 while only 11 of those weeks were actually fetched.",
    [
      "They differ on purpose while history is still growing.",
      "",
      "Both numbers are about coverage weeks.",
      "They are not the two political sides.",
    ],
  ),
  q(
    "GDELT is in the project so you can:",
    [
      "Score a pasted paragraph.",
      "Backfill older weeks in one pass when that public archive answers.",
      "Replace the three outlet monitors.",
      "Host the Next.js app.",
    ],
    1,
    "NewsData grows forward, one recent window at a time. GDELT is the longer look back.",
    [
      "Pasted text uses the analyzer.",
      "",
      "Outlet lean still comes from the three monitors.",
      "Hosting is separate.",
    ],
  ),
];

const ratings: QuizQuestion[] = [
  q(
    "Three monitors are averaged by turning leans into numbers:",
    [
      "Left is 0 and right is 100.",
      "Left is -2, lean-left is -1, center is 0, lean-right is 1, and right is 2. The average is rounded.",
      "Each outlet is whatever the model says that day.",
      "The visitor's last click.",
    ],
    1,
    "If a monitor has no rating, it is skipped. If none of the three rated it, the outlet's own stored lean is used.",
    [
      "The scale is a small integer, not 0 to 100.",
      "",
      "The model does not rate domains.",
      "Visitors cannot edit the list.",
    ],
  ),
  q(
    "Lean-left outlets are counted with:",
    [
      "Center.",
      "The left group. Lean-right joins the right group.",
      "Neither side, like center.",
      "Whichever side has fewer stories that week.",
    ],
    1,
    "Center stays out of the 65 percent test.",
    [
      "Center is its own bucket.",
      "",
      "Lean-left is partisan for this split.",
      "The group is fixed. It does not flip to balance the week.",
    ],
  ),
  q(
    "The default live outlet count can be 10 while the ratings list is larger because:",
    [
      "Ten is every outlet on the internet.",
      "The cheap run takes five domains from the left and five from the right, and leaves center out.",
      "The heatmap only has ten columns.",
      "AllSides publishes only ten scores.",
    ],
    1,
    "A full run can count every domain on a side. Center is added only when that option is on. The ratings list itself is the larger compiled set, about fifty outlets.",
    [
      "The list is a chosen subset.",
      "",
      "Columns are weeks, not outlets.",
      "The consensus uses three monitors, not a ten-outlet cap.",
    ],
  ),
  q(
    "Topic queries are not always the topic name. Crime is fetched as:",
    [
      "The single word crime.",
      "The phrase violent crime. Climate is climate change. Local Politics is city council.",
      "Whatever is trending that hour.",
      "The article analyzer's last paste.",
    ],
    1,
    "International is foreign affairs. Science is scientific research. Phrases stay short because the query cap is about 100 characters.",
    [
      "The name on the chart can differ from the query.",
      "",
      "Queries are a fixed list.",
      "The analyzer does not write the coverage queries.",
    ],
  ),
];

const spans: QuizQuestion[] = [
  q(
    "A highlight is drawn only when:",
    [
      "The model paraphrased the idea.",
      "The phrase appears verbatim in the analyzed text.",
      "The outlet is left-leaning.",
      "The word is longer than 20 letters.",
    ],
    1,
    "A made-up quote is dropped so the page never highlights words that are not there.",
    [
      "A paraphrase will not match, so it is dropped.",
      "",
      "Outlet lean does not gate highlights.",
      "Length is not the rule.",
    ],
  ),
  q(
    "The four highlight kinds are:",
    [
      "Headline, byline, date, and URL.",
      "Word choice, framing, source selection, and omission.",
      "Left, right, center, and absent.",
      "Live, sample, GDELT, and NewsData.",
    ],
    1,
    "Each highlight also has a side: left, right, or neutral. Hovering it shows the explanation.",
    [
      "Those are source fields.",
      "",
      "Those are heatmap states.",
      "Those are data modes, not phrase types.",
    ],
  ),
  q(
    "The model is asked for how many highlights?",
    [
      "Exactly one.",
      "About 3 to 8 when the piece is slanted, and none when it is genuinely neutral.",
      "One per paragraph, always.",
      "Fifty, to fill the page.",
    ],
    1,
    "They should be short phrases or sentences, copied exactly.",
    [
      "One is too few for a slanted piece, and too many for a neutral one.",
      "",
      "There is no per-paragraph quota.",
      "The list is short on purpose.",
    ],
  ),
  q(
    "Neutral highlights still matter because:",
    [
      "They push the lean score to zero by rule.",
      "A loaded verb can be flagged without taking a political side.",
      "They delete the article.",
      "They mark the week absent.",
    ],
    1,
    "In the keyword path those verbs are the framing hits. In the model path a neutral span can still explain emphasis.",
    [
      "Neutral does not zero the meter by itself.",
      "",
      "Nothing is deleted.",
      "Absence is a coverage label.",
    ],
  ),
];

const traps: QuizQuestion[] = [
  q(
    "Sample coverage data should be cited as:",
    [
      "A published finding about that week.",
      "A layout demo. The badge says when the numbers are not live.",
      "The same thing as a NewsData snapshot.",
      "A Ground News export.",
    ],
    1,
    "Live mode is labeled too, including when the figures were fetched and how many weeks were collected.",
    [
      "Sample numbers are not empirical results.",
      "",
      "Live mode names the provider.",
      "The project is not a Ground News export.",
    ],
  ),
  q(
    "The article score and the outlet list answer different questions:",
    [
      "They are the same number shown twice.",
      "The list says where a publication sits. The score says how one piece of text is framed.",
      "The score updates the outlet rating after each paste.",
      "The list is computed from the last article you analyzed.",
    ],
    1,
    "A left-rated outlet can still produce a center article score, because reputation is not supposed to decide the text.",
    [
      "They use different inputs.",
      "",
      "Pasting does not rewrite the ratings.",
      "The ratings are compiled ahead of time.",
    ],
  ),
  q(
    "What would make the coverage charts call NewsData from the browser?",
    [
      "That is how they work today.",
      "Nothing in the current design. The page reads saved JSON. The key stays with the fetch.",
      "Turning on the lean meter.",
      "Opening the about page.",
    ],
    1,
    "Putting the key in the page would spend credits from every visitor and expose the secret.",
    [
      "The browser does not hold the key.",
      "",
      "The meter is article-only.",
      "The about page is methodology.",
    ],
  ),
  q(
    "A fair next limit to admit in an interview is:",
    [
      "The site dedupes every event by hand.",
      "Keyword hits are not story clusters, the same event can be counted many times, and uncollected weeks cannot be rebuilt from the free news feed.",
      "The 65 percent rule changes with the visitor.",
      "Center outlets secretly decide the blindspot.",
    ],
    1,
    "The rule is fixed and symmetric. Center stays out of the split. The gap is still a proxy, not a motive.",
    [
      "There is no hand clustering.",
      "",
      "Every visitor gets the same cutoff.",
      "Center does not name the side.",
    ],
  ),
];

export function TrackerQuiz() {
  return (
    <Chapter
      kicker="Project quiz"
      title="Blindspot Tracker"
      lede="Questions about the political coverage site: what a blindspot means, where the weekly counts come from, and how a single article is scored. Same check as the lessons: pick one, then reveal."
    >
      <h2>What the project claims</h2>
      <Quiz id="bias-product" questions={product} />

      <h2>How the pieces fit</h2>
      <Quiz id="bias-architecture" questions={architecture} />

      <h2>The pages</h2>
      <Quiz id="bias-frontend" questions={frontend} />

      <h2>What a visitor can do</h2>
      <Quiz id="bias-interactions" questions={interactions} />

      <h2>Coverage data</h2>
      <Quiz id="bias-coverage" questions={coverage} />

      <h2>News sources</h2>
      <Quiz id="bias-sources" questions={sources} />

      <h2>How a blindspot is decided</h2>
      <Quiz id="bias-rules" questions={blindspots} />

      <h2>The article analyzer</h2>
      <Quiz id="bias-analyzer" questions={analyzer} />

      <h2>Limits</h2>
      <Quiz id="bias-limits" questions={limits} />

      <h2>The home page</h2>
      <Quiz id="bias-home" questions={home} />

      <h2>The heatmap</h2>
      <Quiz id="bias-heatmap" questions={heatmap} />

      <h2>The gap study</h2>
      <Quiz id="bias-gaps" questions={gaps} />

      <h2>The lean meter</h2>
      <Quiz id="bias-meter" questions={meter} />

      <h2>Lean labels</h2>
      <Quiz id="bias-labels" questions={labels} />

      <h2>The keyword fallback</h2>
      <Quiz id="bias-heuristic" questions={heuristic} />

      <h2>The language model</h2>
      <Quiz id="bias-model" questions={model} />

      <h2>Reading a URL</h2>
      <Quiz id="bias-extract" questions={extract} />

      <h2>When a request fails</h2>
      <Quiz id="bias-errors" questions={errors} />

      <h2>The news fetch</h2>
      <Quiz id="bias-newsdata" questions={newsdata} />

      <h2>Edge cases</h2>
      <Quiz id="bias-edges" questions={edges} />

      <h2>The weekly job</h2>
      <Quiz id="bias-job" questions={job} />

      <h2>Weeks</h2>
      <Quiz id="bias-weeks" questions={weeks} />

      <h2>Outlet ratings</h2>
      <Quiz id="bias-ratings" questions={ratings} />

      <h2>Highlights</h2>
      <Quiz id="bias-spans" questions={spans} />

      <h2>Traps</h2>
      <Quiz id="bias-traps" questions={traps} />
    </Chapter>
  );
}
