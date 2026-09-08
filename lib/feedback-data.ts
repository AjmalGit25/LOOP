export type FeedbackRecord = {
  content: string
  channel: string
  customerLabel: string
  sentiment: 'POS' | 'NEU' | 'NEG'
  sentimentScore: number
  daysAgo: number // used to spread createdAt over past 30 days
}

export const FEEDBACK_RECORDS: FeedbackRecord[] = [
  // ── Performance issues ──────────────────────────────────────────────
  { content: "The dashboard takes almost 10 seconds to load. It's unusable during peak hours.", channel: 'slack', customerLabel: 'Sarah K.', sentiment: 'NEG', sentimentScore: -0.88, daysAgo: 1 },
  { content: "Reports page times out every time I try to load more than 3 months of data.", channel: 'support', customerLabel: 'James R.', sentiment: 'NEG', sentimentScore: -0.82, daysAgo: 2 },
  { content: "Filtering feedback is painfully slow. Takes 5+ seconds per filter change.", channel: 'slack', customerLabel: 'Priya M.', sentiment: 'NEG', sentimentScore: -0.79, daysAgo: 3 },
  { content: "CSV import hangs at 80% and never completes for files over 500 rows.", channel: 'support', customerLabel: 'Tom B.', sentiment: 'NEG', sentimentScore: -0.85, daysAgo: 4 },
  { content: "The analytics charts take forever to render. My team has stopped using them.", channel: 'email', customerLabel: 'Linda C.', sentiment: 'NEG', sentimentScore: -0.76, daysAgo: 5 },
  { content: "Page load is noticeably faster this week. Whatever you did, keep doing it.", channel: 'slack', customerLabel: 'Mike D.', sentiment: 'POS', sentimentScore: 0.81, daysAgo: 6 },
  { content: "Search results now appear instantly. Big improvement over last month.", channel: 'email', customerLabel: 'Anna S.', sentiment: 'POS', sentimentScore: 0.78, daysAgo: 7 },

  // ── Bug reports ──────────────────────────────────────────────────────
  { content: "Clicking 'Export' on the feedback list downloads an empty CSV every time.", channel: 'support', customerLabel: 'Chris W.', sentiment: 'NEG', sentimentScore: -0.9, daysAgo: 1 },
  { content: "The date range picker resets to today whenever I navigate away and come back.", channel: 'slack', customerLabel: 'Rachel T.', sentiment: 'NEG', sentimentScore: -0.72, daysAgo: 2 },
  { content: "Pagination breaks after applying a channel filter — always jumps to page 1.", channel: 'support', customerLabel: 'David L.', sentiment: 'NEG', sentimentScore: -0.68, daysAgo: 3 },
  { content: "Status badge shows 'REVIEWED' but the API still returns 'NEW' for the same item.", channel: 'slack', customerLabel: 'Emma P.', sentiment: 'NEG', sentimentScore: -0.83, daysAgo: 4 },
  { content: "Duplicate feedback entries appear after a CSV import — same row inserted twice.", channel: 'support', customerLabel: 'Oliver N.', sentiment: 'NEG', sentimentScore: -0.87, daysAgo: 5 },
  { content: "The sentiment score column is always null even after running AI analysis.", channel: 'email', customerLabel: 'Sophie H.', sentiment: 'NEG', sentimentScore: -0.74, daysAgo: 8 },
  { content: "Mobile: the submit button is hidden behind the keyboard on iOS Safari.", channel: 'mobile', customerLabel: 'Liam F.', sentiment: 'NEG', sentimentScore: -0.71, daysAgo: 9 },
  { content: "Logging out doesn't clear the session cookie — I can still access the dashboard.", channel: 'support', customerLabel: 'Isla G.', sentiment: 'NEG', sentimentScore: -0.95, daysAgo: 10 },

  // ── Feature requests ─────────────────────────────────────────────────
  { content: "Would love a Slack integration so feedback flows in automatically without CSV uploads.", channel: 'slack', customerLabel: 'Noah J.', sentiment: 'NEU', sentimentScore: 0.1, daysAgo: 1 },
  { content: "Please add PDF export for reports. Our execs won't open CSV files.", channel: 'email', customerLabel: 'Mia K.', sentiment: 'NEU', sentimentScore: 0.05, daysAgo: 2 },
  { content: "A Zapier integration would be a game-changer for our workflow.", channel: 'slack', customerLabel: 'Ethan L.', sentiment: 'NEU', sentimentScore: 0.12, daysAgo: 3 },
  { content: "Can you add a way to tag feedback manually before AI analysis runs?", channel: 'support', customerLabel: 'Ava M.', sentiment: 'NEU', sentimentScore: 0.08, daysAgo: 4 },
  { content: "We need bulk status updates — selecting 50 items and marking them ACTIONED at once.", channel: 'email', customerLabel: 'William N.', sentiment: 'NEU', sentimentScore: 0.06, daysAgo: 5 },
  { content: "Dark mode is great but we need a light mode option for presentations.", channel: 'slack', customerLabel: 'Charlotte O.', sentiment: 'NEU', sentimentScore: 0.15, daysAgo: 6 },
  { content: "Would be great to schedule weekly digest emails summarising new feedback.", channel: 'email', customerLabel: 'Benjamin P.', sentiment: 'NEU', sentimentScore: 0.09, daysAgo: 7 },
  { content: "Please add keyboard shortcuts. Power users would love Cmd+K navigation.", channel: 'slack', customerLabel: 'Amelia Q.', sentiment: 'NEU', sentimentScore: 0.11, daysAgo: 8 },
  { content: "An API webhook so we can push feedback from our own app directly would be ideal.", channel: 'email', customerLabel: 'Lucas R.', sentiment: 'NEU', sentimentScore: 0.07, daysAgo: 9 },
  { content: "Custom sentiment labels beyond POS/NEU/NEG — we want URGENT and CHURN_RISK.", channel: 'support', customerLabel: 'Harper S.', sentiment: 'NEU', sentimentScore: 0.04, daysAgo: 10 },
  { content: "Ability to assign feedback items to specific team members would help us triage faster.", channel: 'slack', customerLabel: 'Elijah T.', sentiment: 'NEU', sentimentScore: 0.13, daysAgo: 11 },
  { content: "Please add a Jira integration so we can create tickets directly from feedback.", channel: 'email', customerLabel: 'Abigail U.', sentiment: 'NEU', sentimentScore: 0.06, daysAgo: 12 },

  // ── Pricing concerns ─────────────────────────────────────────────────
  { content: "The Pro plan jumped 40% with no notice. That's not how you treat loyal customers.", channel: 'email', customerLabel: 'Mason V.', sentiment: 'NEG', sentimentScore: -0.91, daysAgo: 1 },
  { content: "Competitor X offers the same features for half the price. Hard to justify renewal.", channel: 'slack', customerLabel: 'Evelyn W.', sentiment: 'NEG', sentimentScore: -0.78, daysAgo: 3 },
  { content: "The per-seat pricing model doesn't work for our 200-person company. Need enterprise flat rate.", channel: 'email', customerLabel: 'Logan X.', sentiment: 'NEG', sentimentScore: -0.72, daysAgo: 5 },
  { content: "No free tier makes it impossible to evaluate before committing. Lost us as a customer.", channel: 'support', customerLabel: 'Scarlett Y.', sentiment: 'NEG', sentimentScore: -0.84, daysAgo: 7 },
  { content: "Annual billing discount is only 10%. Most SaaS tools offer 20%. Not compelling.", channel: 'email', customerLabel: 'Jackson Z.', sentiment: 'NEG', sentimentScore: -0.65, daysAgo: 9 },
  { content: "Pricing is fair for the value we get. Happy to renew for another year.", channel: 'slack', customerLabel: 'Grace A.', sentiment: 'POS', sentimentScore: 0.72, daysAgo: 11 },
  { content: "The startup discount program saved us. Really appreciate the flexibility.", channel: 'email', customerLabel: 'Henry B.', sentiment: 'POS', sentimentScore: 0.83, daysAgo: 13 },

  // ── UX complaints ────────────────────────────────────────────────────
  { content: "The navigation is confusing. I can never find the import button on first try.", channel: 'slack', customerLabel: 'Chloe C.', sentiment: 'NEG', sentimentScore: -0.67, daysAgo: 1 },
  { content: "Too many clicks to get from the dashboard to a single feedback item.", channel: 'support', customerLabel: 'Sebastian D.', sentiment: 'NEG', sentimentScore: -0.61, daysAgo: 2 },
  { content: "The font size in the feedback list is too small. Strains my eyes after an hour.", channel: 'email', customerLabel: 'Zoey E.', sentiment: 'NEG', sentimentScore: -0.58, daysAgo: 3 },
  { content: "Error messages are cryptic. 'Something went wrong' tells me nothing.", channel: 'support', customerLabel: 'Carter F.', sentiment: 'NEG', sentimentScore: -0.73, daysAgo: 4 },
  { content: "The sidebar takes up too much space on a 13-inch laptop. Needs a collapse option.", channel: 'slack', customerLabel: 'Penelope G.', sentiment: 'NEG', sentimentScore: -0.55, daysAgo: 5 },
  { content: "Onboarding flow is non-existent. Dropped me into a blank dashboard with no guidance.", channel: 'email', customerLabel: 'Wyatt H.', sentiment: 'NEG', sentimentScore: -0.79, daysAgo: 6 },
  { content: "The new layout is much cleaner. Finally feels like a professional tool.", channel: 'slack', customerLabel: 'Riley I.', sentiment: 'POS', sentimentScore: 0.76, daysAgo: 7 },
  { content: "Colour-coded status badges are a small thing but make scanning the inbox so much faster.", channel: 'email', customerLabel: 'Nora J.', sentiment: 'POS', sentimentScore: 0.69, daysAgo: 8 },
  { content: "The search bar is front and centre now. Much better than the old buried filter panel.", channel: 'slack', customerLabel: 'Eli K.', sentiment: 'POS', sentimentScore: 0.74, daysAgo: 9 },

  // ── Product praise ───────────────────────────────────────────────────
  { content: "LOOP has completely replaced our weekly manual feedback review. Saves us 4 hours.", channel: 'slack', customerLabel: 'Lily L.', sentiment: 'POS', sentimentScore: 0.95, daysAgo: 1 },
  { content: "The AI theme clustering is scary accurate. It caught a churn signal we missed.", channel: 'email', customerLabel: 'Owen M.', sentiment: 'POS', sentimentScore: 0.93, daysAgo: 2 },
  { content: "Showed LOOP to our CPO and she immediately asked to roll it out company-wide.", channel: 'slack', customerLabel: 'Stella N.', sentiment: 'POS', sentimentScore: 0.91, daysAgo: 3 },
  { content: "Best product decision we made this quarter. ROI was visible within the first week.", channel: 'email', customerLabel: 'Caleb O.', sentiment: 'POS', sentimentScore: 0.94, daysAgo: 4 },
  { content: "The plain-English Q&A feature is genuinely impressive. Asked it a hard question and it nailed it.", channel: 'slack', customerLabel: 'Hazel P.', sentiment: 'POS', sentimentScore: 0.92, daysAgo: 5 },
  { content: "Really liking the new analytics dashboard. The trend charts are exactly what we needed.", channel: 'slack', customerLabel: 'Mike Q.', sentiment: 'POS', sentimentScore: 0.87, daysAgo: 6 },
  { content: "Onboarding was smooth and the support team was incredibly helpful.", channel: 'support', customerLabel: 'Violet R.', sentiment: 'POS', sentimentScore: 0.88, daysAgo: 7 },
  { content: "We've tried three competitors. LOOP is the only one that actually surfaces actionable insights.", channel: 'email', customerLabel: 'Julian S.', sentiment: 'POS', sentimentScore: 0.9, daysAgo: 8 },
  { content: "The CSV import is fast and the validation errors are clear. Rare to see that done well.", channel: 'slack', customerLabel: 'Aurora T.', sentiment: 'POS', sentimentScore: 0.82, daysAgo: 9 },
  { content: "Multi-workspace support is exactly what we needed for our agency clients.", channel: 'email', customerLabel: 'Dominic U.', sentiment: 'POS', sentimentScore: 0.85, daysAgo: 10 },

  // ── Support experiences ──────────────────────────────────────────────
  { content: "Waited 3 days for a response to a critical bug report. That's not acceptable.", channel: 'support', customerLabel: 'Savannah V.', sentiment: 'NEG', sentimentScore: -0.86, daysAgo: 1 },
  { content: "Support chat said 'we'll look into it' two weeks ago. Still no update.", channel: 'email', customerLabel: 'Ezra W.', sentiment: 'NEG', sentimentScore: -0.81, daysAgo: 3 },
  { content: "The support docs are outdated. Screenshots don't match the current UI at all.", channel: 'support', customerLabel: 'Naomi X.', sentiment: 'NEG', sentimentScore: -0.69, daysAgo: 5 },
  { content: "Support team resolved my issue in under 20 minutes. Genuinely impressed.", channel: 'support', customerLabel: 'Levi Y.', sentiment: 'POS', sentimentScore: 0.89, daysAgo: 7 },
  { content: "The live chat support is fast and knowledgeable. Rare for a SaaS tool.", channel: 'slack', customerLabel: 'Elena Z.', sentiment: 'POS', sentimentScore: 0.86, daysAgo: 9 },
  { content: "Got a personalised onboarding call. Didn't expect that at this price point.", channel: 'email', customerLabel: 'Jonah A.', sentiment: 'POS', sentimentScore: 0.91, daysAgo: 11 },
  { content: "The help centre articles are well-written but there aren't enough of them.", channel: 'support', customerLabel: 'Madeline B.', sentiment: 'NEU', sentimentScore: 0.1, daysAgo: 13 },

  // ── Mobile experience ────────────────────────────────────────────────
  { content: "The mobile view is completely broken on Android Chrome. Tables overflow off screen.", channel: 'mobile', customerLabel: 'Asher C.', sentiment: 'NEG', sentimentScore: -0.88, daysAgo: 1 },
  { content: "Can't scroll the feedback list on iPhone — it's stuck after 10 items.", channel: 'mobile', customerLabel: 'Piper D.', sentiment: 'NEG', sentimentScore: -0.83, daysAgo: 2 },
  { content: "The mobile app crashes when I try to open a feedback item with long content.", channel: 'mobile', customerLabel: 'Jasper E.', sentiment: 'NEG', sentimentScore: -0.9, daysAgo: 3 },
  { content: "Mobile experience is passable for read-only but I wouldn't try to do real work on it.", channel: 'mobile', customerLabel: 'Ivy F.', sentiment: 'NEU', sentimentScore: -0.1, daysAgo: 5 },
  { content: "The mobile dashboard loads fast and the charts are readable. Good job.", channel: 'mobile', customerLabel: 'Felix G.', sentiment: 'POS', sentimentScore: 0.71, daysAgo: 7 },

  // ── Onboarding ───────────────────────────────────────────────────────
  { content: "Took me 30 minutes to figure out how to invite a team member. Needs a wizard.", channel: 'support', customerLabel: 'Ruby H.', sentiment: 'NEG', sentimentScore: -0.74, daysAgo: 1 },
  { content: "The getting-started checklist was helpful but disappeared after I completed step 2.", channel: 'email', customerLabel: 'Leo I.', sentiment: 'NEG', sentimentScore: -0.62, daysAgo: 3 },
  { content: "No sample data on first login means the dashboard looks empty and confusing.", channel: 'slack', customerLabel: 'Nadia J.', sentiment: 'NEG', sentimentScore: -0.71, daysAgo: 5 },
  { content: "The onboarding video was clear and got me up and running in 10 minutes.", channel: 'email', customerLabel: 'Theo K.', sentiment: 'POS', sentimentScore: 0.84, daysAgo: 7 },
  { content: "Setup was painless. Had my first feedback imported within 15 minutes of signing up.", channel: 'slack', customerLabel: 'Freya L.', sentiment: 'POS', sentimentScore: 0.88, daysAgo: 9 },

  // ── Integrations & API ───────────────────────────────────────────────
  { content: "The REST API docs are incomplete. Half the endpoints aren't documented.", channel: 'support', customerLabel: 'Archer M.', sentiment: 'NEG', sentimentScore: -0.77, daysAgo: 2 },
  { content: "Intercom integration keeps dropping connections after 24 hours.", channel: 'support', customerLabel: 'Rosie N.', sentiment: 'NEG', sentimentScore: -0.82, daysAgo: 4 },
  { content: "The Zendesk connector works perfectly. Pulled in 3 years of tickets in minutes.", channel: 'email', customerLabel: 'Finn O.', sentiment: 'POS', sentimentScore: 0.87, daysAgo: 6 },
  { content: "API rate limits are too low for our volume. We hit them within an hour.", channel: 'support', customerLabel: 'Isla P.', sentiment: 'NEG', sentimentScore: -0.79, daysAgo: 8 },
  { content: "The webhook payload format is well-designed. Easy to parse on our end.", channel: 'slack', customerLabel: 'Rory Q.', sentiment: 'POS', sentimentScore: 0.8, daysAgo: 10 },

  // ── Analytics & reporting ────────────────────────────────────────────
  { content: "The trend charts don't update in real time. I have to refresh manually.", channel: 'slack', customerLabel: 'Beau R.', sentiment: 'NEG', sentimentScore: -0.64, daysAgo: 1 },
  { content: "Would love to compare sentiment across two date ranges side by side.", channel: 'email', customerLabel: 'Skye S.', sentiment: 'NEU', sentimentScore: 0.08, daysAgo: 3 },
  { content: "The channel breakdown chart is exactly what I show in our weekly product meeting.", channel: 'slack', customerLabel: 'Zara T.', sentiment: 'POS', sentimentScore: 0.83, daysAgo: 5 },
  { content: "Sentiment over time graph helped us pinpoint exactly when a bad release went out.", channel: 'email', customerLabel: 'Kai U.', sentiment: 'POS', sentimentScore: 0.89, daysAgo: 7 },
  { content: "The reports section is bare. We need custom date ranges and downloadable charts.", channel: 'support', customerLabel: 'Sage V.', sentiment: 'NEG', sentimentScore: -0.7, daysAgo: 9 },
  { content: "Daily volume chart is a great addition. Helps us spot spikes immediately.", channel: 'slack', customerLabel: 'River W.', sentiment: 'POS', sentimentScore: 0.77, daysAgo: 11 },

  // ── Security & privacy ───────────────────────────────────────────────
  { content: "We need SOC 2 compliance documentation before our security team will approve this.", channel: 'email', customerLabel: 'Blake X.', sentiment: 'NEU', sentimentScore: 0.0, daysAgo: 2 },
  { content: "Is customer feedback data encrypted at rest? Can't find this in your docs.", channel: 'support', customerLabel: 'Quinn Y.', sentiment: 'NEU', sentimentScore: -0.05, daysAgo: 4 },
  { content: "GDPR data deletion request took 2 weeks. Should be instant via the UI.", channel: 'email', customerLabel: 'Drew Z.', sentiment: 'NEG', sentimentScore: -0.76, daysAgo: 6 },
  { content: "SSO via Okta works flawlessly. Security team is happy.", channel: 'support', customerLabel: 'Alex A.', sentiment: 'POS', sentimentScore: 0.85, daysAgo: 8 },

  // ── Miscellaneous realistic entries ──────────────────────────────────
  { content: "The AI summary feature saved our PM 2 hours of reading this week.", channel: 'slack', customerLabel: 'Morgan B.', sentiment: 'POS', sentimentScore: 0.92, daysAgo: 1 },
  { content: "Feedback themes keep getting reassigned after I manually edit them.", channel: 'support', customerLabel: 'Taylor C.', sentiment: 'NEG', sentimentScore: -0.73, daysAgo: 2 },
  { content: "The product is good but the documentation is seriously lacking.", channel: 'email', customerLabel: 'Jordan D.', sentiment: 'NEU', sentimentScore: -0.15, daysAgo: 3 },
  { content: "Would be great to see a public roadmap so we know what's coming.", channel: 'slack', customerLabel: 'Casey E.', sentiment: 'NEU', sentimentScore: 0.1, daysAgo: 4 },
  { content: "The changelog is helpful. Keep publishing it — it builds trust.", channel: 'email', customerLabel: 'Reese F.', sentiment: 'POS', sentimentScore: 0.75, daysAgo: 5 },
  { content: "Bulk delete is missing. I have 2,000 test records I can't remove.", channel: 'support', customerLabel: 'Avery G.', sentiment: 'NEG', sentimentScore: -0.68, daysAgo: 6 },
  { content: "The workspace name shows up in the wrong place on the billing invoice.", channel: 'email', customerLabel: 'Peyton H.', sentiment: 'NEU', sentimentScore: -0.2, daysAgo: 7 },
  { content: "Sentiment analysis flagged a clearly positive review as negative. Needs tuning.", channel: 'slack', customerLabel: 'Hayden I.', sentiment: 'NEG', sentimentScore: -0.55, daysAgo: 8 },
  { content: "The product keeps getting better every sprint. You can feel the momentum.", channel: 'email', customerLabel: 'Emery J.', sentiment: 'POS', sentimentScore: 0.88, daysAgo: 9 },
  { content: "Wish there was a way to star or bookmark important feedback items.", channel: 'slack', customerLabel: 'Finley K.', sentiment: 'NEU', sentimentScore: 0.07, daysAgo: 10 },
  { content: "The team collaboration features are solid. Comments on feedback items are great.", channel: 'email', customerLabel: 'Rowan L.', sentiment: 'POS', sentimentScore: 0.81, daysAgo: 11 },
  { content: "Notifications are too noisy. I get an email for every single status change.", channel: 'support', customerLabel: 'Shiloh M.', sentiment: 'NEG', sentimentScore: -0.6, daysAgo: 12 },
  { content: "The AI Q&A gave a completely wrong answer when I asked about churn trends.", channel: 'slack', customerLabel: 'Indigo N.', sentiment: 'NEG', sentimentScore: -0.78, daysAgo: 13 },
  { content: "Love that you can filter by channel and status simultaneously. Saves so much time.", channel: 'email', customerLabel: 'Marlowe O.', sentiment: 'POS', sentimentScore: 0.79, daysAgo: 14 },
  { content: "The feedback inbox is now my team's single source of truth. Couldn't work without it.", channel: 'slack', customerLabel: 'Sable P.', sentiment: 'POS', sentimentScore: 0.93, daysAgo: 15 },
  { content: "Two-factor authentication is missing. Our IT policy requires it.", channel: 'support', customerLabel: 'Cove Q.', sentiment: 'NEG', sentimentScore: -0.8, daysAgo: 16 },
  { content: "The import validation errors are clear and actionable. Fixed my CSV in minutes.", channel: 'email', customerLabel: 'Wren R.', sentiment: 'POS', sentimentScore: 0.77, daysAgo: 17 },
  { content: "Pricing page is confusing. Took me 10 minutes to understand what's included.", channel: 'web', customerLabel: 'Lark S.', sentiment: 'NEG', sentimentScore: -0.62, daysAgo: 18 },
  { content: "The free trial is too short. 7 days isn't enough to evaluate an analytics tool.", channel: 'email', customerLabel: 'Fern T.', sentiment: 'NEG', sentimentScore: -0.67, daysAgo: 19 },
  { content: "Switched from a competitor last month. The AI insights are noticeably better here.", channel: 'slack', customerLabel: 'Moss U.', sentiment: 'POS', sentimentScore: 0.9, daysAgo: 20 },
  { content: "The status workflow (NEW → REVIEWED → ACTIONED) maps perfectly to our process.", channel: 'email', customerLabel: 'Reed V.', sentiment: 'POS', sentimentScore: 0.84, daysAgo: 21 },
  { content: "Would love a native iOS app. The mobile web experience is okay but not great.", channel: 'mobile', customerLabel: 'Stone W.', sentiment: 'NEU', sentimentScore: -0.08, daysAgo: 22 },
  { content: "The RBAC system is exactly what we needed for our enterprise clients.", channel: 'email', customerLabel: 'Clay X.', sentiment: 'POS', sentimentScore: 0.86, daysAgo: 23 },
  { content: "Viewer role can still see workspace IDs in the URL. That feels like a data leak.", channel: 'support', customerLabel: 'Flint Y.', sentiment: 'NEG', sentimentScore: -0.71, daysAgo: 24 },
  { content: "The product roadmap alignment with our needs is uncanny. Keep it up.", channel: 'slack', customerLabel: 'Slate Z.', sentiment: 'POS', sentimentScore: 0.87, daysAgo: 25 },
  { content: "Exporting to Excel would be more useful than CSV for our non-technical stakeholders.", channel: 'email', customerLabel: 'Ash A.', sentiment: 'NEU', sentimentScore: 0.05, daysAgo: 26 },
  { content: "The AI took 45 seconds to analyse 50 feedback items. Needs to be faster.", channel: 'slack', customerLabel: 'Birch B.', sentiment: 'NEG', sentimentScore: -0.65, daysAgo: 27 },
  { content: "Honestly one of the best-designed internal tools I've used in my career.", channel: 'email', customerLabel: 'Cedar C.', sentiment: 'POS', sentimentScore: 0.96, daysAgo: 28 },
  { content: "The channel simulation feature is a clever way to test without real data.", channel: 'slack', customerLabel: 'Elm D.', sentiment: 'POS', sentimentScore: 0.78, daysAgo: 29 },
  { content: "We use LOOP in our weekly product review. It's become a core part of our process.", channel: 'email', customerLabel: 'Grove E.', sentiment: 'POS', sentimentScore: 0.91, daysAgo: 30 },
]
