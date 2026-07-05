// Client-safe topic catalog. Kept in its own file so client components can
// import it without pulling in the server-only Supabase modules that live in
// season-subs.ts.

export const SEASON_TOPICS = [
  { id: "strawberries", label: "Strawberry U-Pick", when: "May" },
  { id: "peaches", label: "Peach Season", when: "July–Aug" },
  { id: "apples", label: "Apple Harvest", when: "Aug–Oct" },
  { id: "pumpkins", label: "Pumpkin Patch", when: "October" },
  { id: "cider-release", label: "Cider Club Releases", when: "4× per year" },
  { id: "live-music", label: "Live Music & Events", when: "Seasonal" },
  { id: "farmers-market", label: "Farmers Market Updates", when: "Every Saturday" },
] as const;

export type SeasonTopicId = (typeof SEASON_TOPICS)[number]["id"];
