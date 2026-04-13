export const asoKnowledgeChunks = [
  {
    id: "title-optimization",
    topic: "App Title Optimization",
    content: `App title optimization is the most critical ASO factor. The app title carries the highest keyword weight in both Apple App Store and Google Play algorithms. Best practices: Include your most important keyword in the title naturally. Keep title between 25-30 characters (maximum is 30 for both stores). Use the format "Brand Name: Primary Keyword" or "Primary Keyword - Brand Name". Never keyword stuff or use pipes/special characters excessively. The title should be readable and make sense to humans. For iOS, the title and subtitle together form your primary metadata. For Android, the title alone must carry primary keyword weight. A well-optimized title can increase organic impressions by 30-50%. Avoid changing titles frequently as it resets ranking history. Examples of good titles: "Duolingo: Language Lessons", "Calm: Sleep & Meditation", "Notion: Notes, Docs, Tasks". Bad title examples: "Best App | Top Rated | Free Download", "App Name" (no keywords), titles over 30 characters that get truncated.`
  },
  {
    id: "subtitle-short-description",
    topic: "Subtitle and Short Description Optimization",
    content: `iOS Subtitle (max 30 characters): The subtitle is indexed for search and appears directly below the title on the App Store. It should contain secondary keywords not used in the title. It must communicate a clear value proposition. Never repeat words from the title. Good subtitle examples: "Learn Spanish, French & More", "Focus, Relax & Sleep Better". The subtitle updates affect keyword rankings within 1-2 weeks. Google Play Short Description (max 80 characters): This is the first text users see on the Play Store listing. It's indexed for search ranking. It should be a compelling hook that drives users to read the full description. Include 1-2 important keywords naturally. Use action-oriented language. The short description has significant weight in Google Play's search algorithm. Poor short descriptions that are vague like "The best app for everything" hurt conversion and ranking. A/B test short descriptions using Google Play's built-in testing feature.`
  },
  {
    id: "description-optimization",
    topic: "Long Description Best Practices",
    content: `The long description is crucial for Google Play (indexed for search) and for conversion on both stores. Optimal length is 3000-4000 characters for Google Play, 2000-3000 for App Store. Structure: First 167 characters (before "more" fold) are critical — put your strongest value proposition and primary keyword here. Use bullet points (•) for scanability. Include your primary keyword in the first 100 characters. Use keyword variations naturally throughout — aim for 3-5 mentions of primary keyword. Structure with clear sections: What is this app, Key Features, Who is it for, Why choose us. End with a strong CTA: "Download now", "Start your free trial", "Join X million users". Avoid keyword stuffing (more than 5% keyword density is penalized). The description should answer: What does the app do? Who is it for? What problem does it solve? What makes it better than competitors? iOS descriptions are NOT indexed for search but heavily impact conversion rate. Google Play descriptions ARE indexed and impact both rankings and conversion. Use competitive keywords — analyze top competitor descriptions for keyword ideas.`
  },
  {
    id: "keywords-field",
    topic: "iOS Keywords Field Strategy",
    content: `The iOS keywords field (100 characters, only visible to Apple) is a pure ranking signal. Rules: Use commas to separate keywords, no spaces after commas. Don't repeat words already in title or subtitle. Don't use competitor brand names (violates guidelines). Don't use plurals if singular is included (algorithm handles this). Don't use "app", "free", "best", "top" (filtered out). Do use synonyms, related terms, and long-tail variations. Research keywords using App Store search suggestions, AppFollow, AppTweak, or Sensor Tower free tiers. Prioritize keywords with high search volume and low competition (difficulty). Update keywords every 30-45 days and track ranking changes. The keywords field combined with title and subtitle creates your searchable metadata. Maximum effective strategy: title (primary KW) + subtitle (secondary KW) + keywords field (all other relevant KWs). Google Play has no separate keywords field — keywords in title, short description, and long description serve this purpose.`
  },
  {
    id: "visual-assets-screenshots",
    topic: "Screenshots and Visual Asset Optimization",
    content: `Screenshots are the #1 conversion factor for app store listings — they impact install rate more than any other element. Best practices for screenshots: Use all available screenshot slots (10 for iOS, 8 for Google Play). First 2-3 screenshots must tell your complete value story (visible in search results without tapping). Use portrait orientation for most app types; landscape for games. Add captions/text overlays to each screenshot explaining the feature shown. Use a consistent color theme matching your brand. Show actual app UI, not just marketing imagery. The first screenshot should show the app's core value proposition. Use social proof in screenshots when possible ("10M+ users", "App of the Year"). Preview videos (iOS) and promo videos (Google Play) increase conversion by 20-35% when used effectively. Keep videos under 30 seconds. The icon is the first thing users see in search — it must be distinctive, readable at small sizes, and reflect app category. Icon best practices: No text in icon (unreadable at small sizes), use bold simple shapes, test at 16x16px clarity, avoid generic icons that blend with competitors. A/B test screenshots using Google Play experiments or Storemaven/SplitMetrics for iOS.`
  },
  {
    id: "ratings-reviews",
    topic: "Ratings and Reviews Optimization",
    content: `Ratings and reviews are both a ranking signal and a conversion factor. Rating benchmarks: 4.0+ is acceptable, 4.3+ is good, 4.5+ is excellent. Apps below 3.5 see significant conversion drops. Volume matters: 100 ratings carries less weight than 10,000 ratings even at the same score. Strategies to improve ratings: Use in-app rating prompts (SKStoreReviewRequest for iOS) at positive moments — after task completion, after level up, after positive user action. Never prompt after errors, crashes, or negative experiences. Respond to all negative reviews professionally and promptly — this shows in the listing and improves perception. Address the user's complaint specifically, offer a solution, invite them to re-rate. Responding to reviews is a ranking signal on Google Play. Use review keywords analysis — what words appear most in positive reviews? Use them in your metadata. Track review sentiment over time. Sudden rating drops often correlate with bad updates. The review volume velocity matters — getting 100 reviews in a week signals popularity. Encourage reviews from power users via email/push (where allowed). Never buy fake reviews — this leads to app removal.`
  },
  {
    id: "update-frequency",
    topic: "Update Frequency and Freshness Signals",
    content: `Both Apple and Google reward regularly updated apps with better visibility. Update frequency best practices: Aim for updates every 2-4 weeks minimum. Each update should include genuine improvements, not just version bumps. Update notes (release notes / what's new) are read by users and partially indexed — write them clearly, mention key improvements, can include keywords naturally. Apps not updated in 6+ months may see ranking drops and appear stale to users. Update timing strategy: avoid updating during major holidays when traffic is high (bugs can cause rating drops). Always update after addressing negative reviews. Update notes for iOS are visible on the product page and in App Store Connect. Seasonal updates (holiday themes, new year features) can boost visibility during high-traffic periods. Google Play's algorithm heavily weights freshness — a recently updated app ranks higher than an identical stale one. Track competitor update frequencies as a benchmark.`
  },
  {
    id: "category-optimization",
    topic: "Category Selection and Optimization",
    content: `Category selection affects discoverability in browse sections, chart rankings, and algorithmic recommendations. Category strategy: Choose the most specific, accurate category for primary category. For iOS, selecting a secondary category doubles your browse visibility. Don't misrepresent your app's category — Apple and Google enforce accurate categorization. Consider competitive density: being #5 in a smaller category is more visible than being #50 in a huge category. Category chart rankings (Top Free, Top Paid, Top Grossing) are powerful visibility drivers — even breaking top 100 in a subcategory drives significant downloads. Research which category your competitors use. For games, subcategory selection (Puzzle, Action, Strategy) is particularly important. Some categories have different review policies and requirements. The right category also sets user expectations and reduces negative reviews from mismatched expectations.`
  },
  {
    id: "conversion-rate-optimization",
    topic: "Conversion Rate Optimization (CRO) for App Stores",
    content: `Conversion rate (impressions to installs) is a direct ranking signal — higher converting apps rank higher. Industry benchmarks: 3-5% CVR is average, 7-10% is good, 12%+ is excellent. Conversion optimization tactics: A/B test every visual element (icon, screenshots, preview video). Test different messaging angles (features vs benefits vs social proof). Test different first screenshot layouts. Use Apple's Product Page Optimization and Google Play's Store Listing Experiments. Localization dramatically improves conversion in non-English markets — translating screenshots alone can increase CVR by 25%. Social proof elements boost conversion: total download count, press mentions, awards, ratings displayed prominently. Seasonal creative assets (holiday screenshots) improve conversion during relevant periods. The product page must answer in 3 seconds: What is this? Is it for me? Can I trust it? Reduce friction in the visual story — each screenshot should flow logically to the next. Icons with faces or human elements often outperform abstract icons. Warm colors (red, orange) drive action; cool colors (blue, green) convey trust.`
  },
  {
    id: "keyword-research",
    topic: "Keyword Research Methodology",
    content: `Effective keyword research is the foundation of ASO strategy. Research process: Start with seed keywords (what does your app do in 2-3 words). Expand using App Store search suggestions (type keyword, see autocomplete). Analyze top 3 competitor titles, subtitles, and descriptions for keyword patterns. Use free tools: AppFollow, MobileAction free tier, AppTweak free tier, Sensor Tower free tier. Keyword scoring criteria: Search Volume (how many people search this), Difficulty (how hard to rank — 1-10 scale), Relevance (does it accurately describe your app). Prioritize: High volume + Low difficulty + High relevance = Gold keywords. Long-tail keywords (3+ words) have lower volume but much higher conversion intent. Branded keyword strategy: include your own brand name variants in metadata. Competitor keyword strategy: identify keywords competitors rank for that you don't. Keyword cannibalization: don't use same keyword in title and keyword field — it wastes opportunity. Track keyword ranking weekly and adjust strategy monthly. Seasonal keywords: update metadata to include seasonal terms during peak periods. Localization keyword research must be done natively — don't just translate English keywords.`
  },
  {
    id: "localization",
    topic: "App Store Localization Strategy",
    content: `Localization is one of the highest-ROI ASO activities. Key markets to localize: English (US/UK/AU), Spanish, Portuguese (Brazil), Japanese, Korean, German, French, Chinese (Simplified). Localization goes beyond translation: keywords must be researched natively in each language, cultural references and screenshots should be adapted, pricing should reflect local purchasing power. iOS supports 40+ languages for metadata. Localizing metadata alone (without translating the app) can increase downloads in that market by 30-60%. Screenshot localization (adding text overlays in local language) increases conversion significantly. App name in different locales can be different — use this to target local keywords. Review responses should also be in the user's language. Japanese and Korean markets have very specific design preferences — bold, feature-rich screenshots perform better. Brazilian Portuguese and European Portuguese users have different preferences. Don't use machine translation for metadata — native speakers can identify poor translations which hurts credibility.`
  },
  {
    id: "aso-scoring-rubric",
    topic: "ASO Scoring Rubric and Evaluation Criteria",
    content: `When evaluating an app's ASO quality, use this scoring framework:

TITLE (0-10): 
10 = Primary keyword present, 25-30 chars, brand+keyword formula, compelling
7-9 = Keyword present but not optimally placed or length suboptimal  
4-6 = Weak keyword presence or too short (<15 chars)
0-3 = No keywords, only brand name, or over 30 chars (truncated)

SUBTITLE/SHORT DESC (0-10):
10 = Strong secondary keyword, clear value prop, under limit, no title word repetition
7-9 = Good keyword but repeats title or vague value prop
4-6 = Missing keywords or generic text
0-3 = Empty, missing, or purely generic

DESCRIPTION (0-10):
10 = Strong hook in first 167 chars, keyword in first 100, bullet points, 3000+ chars, CTA
7-9 = Good structure but missing hook or thin on keywords
4-6 = Wall of text or very short or heavy keyword stuffing
0-3 = Under 500 chars, no structure, no keywords

VISUAL ASSETS (0-10):
10 = All screenshot slots used, text overlays, consistent branding, shows core value
7-9 = Most slots used but weak messaging on screenshots
4-6 = Few screenshots, no text overlays, default/generic visuals
0-3 = Only 1-2 screenshots or placeholder images

RATINGS & REVIEWS (0-10):
10 = 4.5+ rating, 10,000+ reviews
8-9 = 4.3-4.4 rating, 1000+ reviews
6-7 = 4.0-4.2 rating, 100+ reviews
4-5 = 3.5-3.9 rating or <100 reviews
0-3 = Below 3.5 rating or no reviews

UPDATE FREQUENCY (0-10):
10 = Updated within last 30 days
7-9 = Updated within last 60 days
4-6 = Updated within last 6 months
0-3 = Not updated in 6+ months or unknown

CATEGORY FIT (0-10):
10 = Perfect category match, not overcrowded top category
7-9 = Good category but could use secondary category
4-6 = Slightly wrong category or missing secondary
0-3 = Wrong category entirely`
  },
  {
    id: "competitive-analysis",
    topic: "Competitive ASO Analysis Framework",
    content: `Competitive analysis is essential for ASO strategy. When comparing multiple apps: Identify the keyword overlap — which keywords do all competitors target? Find keyword gaps — high-value keywords competitors miss that you can target. Analyze screenshot messaging angles — are competitors leading with features, benefits, or social proof? Compare rating trajectories — is a competitor's rating improving or declining? Look at update cadence — frequent updaters typically rank higher. Assess visual differentiation — do competitor icons look similar? Opportunity to stand out. Measure description depth — thin descriptions vs comprehensive ones. In a competitive comparison report, the winner is determined by: highest overall weighted score, strongest performance on high-weight pillars (title, description, visuals), best alignment between metadata keywords and app category. Common ASO mistakes found in competitive analysis: Ignoring subtitle/short description, not using all screenshot slots, no text overlays on screenshots, descriptions under 1000 characters, not responding to reviews, ignoring localization for top markets, not A/B testing any elements, never updating metadata after initial launch.`
  },
  {
    id: "google-play-specific",
    topic: "Google Play Specific ASO Factors",
    content: `Google Play has unique ranking factors different from iOS App Store. Key Google Play-specific factors: Android Vitals (crash rate, ANR rate, battery usage) directly impact rankings — apps with poor vitals are penalized. The long description is fully indexed by Google's search algorithm (unlike iOS). The short description (80 chars) appears in search results and is indexed. Google Play uses semantic search — it understands context, so keyword variations are automatically indexed. Backlinks to the Play Store listing improve rankings (unique to Android). Google Play uses machine learning to analyze screenshots and categorize apps. In-app actions and engagement metrics (retention, session length, uninstall rate) are strong ranking signals. Google Play's "Editors' Choice" and "Featured" placements are heavily algorithm-driven based on quality signals. Google Play allows A/B testing of icon, screenshots, short description, and long description natively. Store Listing Experiments should be running continuously. Google Play ratings are calculated differently — recent ratings are weighted more heavily than old ones. Android app bundle (AAB) requirement signals technical quality.`
  },
  {
    id: "ios-specific",
    topic: "iOS App Store Specific ASO Factors",
    content: `iOS App Store has unique algorithms and features. Key iOS-specific factors: Apple Search Ads performance data influences organic rankings — high conversion in Search Ads signals relevance. The keywords metadata field (100 chars, invisible to users) is iOS-exclusive and critical. Product Page Optimization allows A/B testing of icon, screenshots, and preview video (up to 3 treatments). Custom Product Pages allow different store listings for different Apple Search Ads campaigns. In-App Events appear in search results and on the product page — major feature for driving engagement. App Clips provide lightweight trial experiences that can drive installs. Apple's algorithm heavily weights user engagement metrics: session length, retention rate, crash rate. Ratings reset when a major version update is submitted (optional) — use this to escape a bad rating period. The "App of the Day" and "Game of the Day" features are editorially selected but ASO quality is a prerequisite. Subscription apps get additional merchandising opportunities. Apple's privacy labels impact user trust and conversion — clear, honest privacy labels improve installs. TestFlight beta users provide engagement signals.`
  },
  {
    id: "aso-common-mistakes",
    topic: "Common ASO Mistakes and How to Fix Them",
    content: `Most common ASO mistakes that hurt rankings and conversion:

1. TITLE ONLY HAS BRAND NAME: Fix — research your #1 keyword and add it to the title with a colon separator.

2. EMPTY OR WEAK SUBTITLE: Fix — research secondary keywords, write a compelling 30-char value proposition.

3. THIN DESCRIPTION (under 1000 chars): Fix — expand to 3000+ chars with structured sections, bullet points, keyword variations.

4. NOT USING ALL SCREENSHOT SLOTS: Fix — create 8-10 screenshots with text overlays telling a visual story.

5. SCREENSHOTS WITHOUT TEXT OVERLAYS: Fix — add feature callouts to each screenshot; users scan, not read.

6. RATING BELOW 4.0: Fix — implement in-app review prompts at positive moments, respond to all negative reviews.

7. NOT UPDATED IN 6+ MONTHS: Fix — schedule regular updates even for small improvements.

8. IGNORING LOCALIZATION: Fix — start with Spanish and Portuguese Brazil as highest-ROI non-English markets.

9. KEYWORD STUFFING IN DESCRIPTION: Fix — target 2-3% keyword density, use natural language.

10. NEVER A/B TESTING: Fix — run at least one screenshot test using Google Play Experiments or Storemaven.

11. NOT RESPONDING TO REVIEWS: Fix — respond within 24-48 hours to all 1-2 star reviews professionally.

12. WRONG CATEGORY: Fix — audit top competitors' categories, ensure yours matches user expectations.

13. POOR ICON DESIGN: Fix — simple, bold, distinctive at small sizes, A/B test icon variants.

14. NO PREVIEW VIDEO: Fix — create a 15-30 second preview video showing core app flow.`
  }
];

export default asoKnowledgeChunks;
