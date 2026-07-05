// Client-safe content shapes + defaults (no server imports). Shared by the
// homepage, the server content loader, and the admin CMS editor.

export interface HeroContent {
  label: string;
  line1: string;
  line2: string;
  emphasis: string;
  body: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  imageUrl: string;
}

export interface BannerContent {
  eyebrow: string;
  line1: string;
  line2: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface StoryContent {
  eyebrow: string;
  headline: string;
  emphasis: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  quote: string;
  attribution: string;
  primaryImageUrl: string;
  secondaryImageUrl: string;
}

export interface TapListContent {
  eyebrow: string;
  headline: string;
  emphasis: string;
  intro: string;
  bottles: string;
}

export interface ActivitiesContent {
  eyebrow: string;
  headline: string;
  emphasis: string;
  paragraph1: string;
  paragraph2: string;
}

export interface AdmissionContent {
  admissionValue: string;
  admissionSub: string;
  hoursValue: string;
  hoursSub: string;
  locationValue: string;
  locationSub: string;
}

export interface ClubTeaserContent {
  eyebrow: string;
  headline: string;
  emphasis: string;
  body: string;
  fineprint: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
}

export const DEFAULT_HERO: HeroContent = {
  label: "Rose Hill, Kansas — Est. 2010",
  line1: "Where the",
  line2: "orchard",
  emphasis: "meets the glass.",
  body: "Tom & Gina Brown planted 5,000 trees on Kansas prairie and pressed their first cider in 2010. Every bottle is still made from fruit grown right here.",
  primaryLabel: "Shop Cider",
  primaryHref: "/store",
  secondaryLabel: "Our Story",
  secondaryHref: "/the-farm",
  imageUrl: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1800&q=85",
};

export const DEFAULT_BANNER: BannerContent = {
  eyebrow: "Now Pouring",
  line1: "Meadowlark Red · Meadowlark Gold · Meadow Hopper — on tap at the farm",
  line2: "Also at Wichita Farmers Market every Saturday",
  ctaLabel: "Visit Us →",
  ctaHref: "/visit",
};

export const DEFAULT_STORY: StoryContent = {
  eyebrow: "Tom & Gina Brown",
  headline: "Two lives abroad.",
  emphasis: "One farm back home.",
  paragraph1:
    "Tom and Gina are Kansas born and raised — but for years, Kansas wasn't home. Tom spent time in Pakistan and Afghanistan working in agriculture development. Gina worked in healthcare. They lived rich lives of creative work and friendships from all over the world.",
  paragraph2:
    "When they came back, they brought everything they'd learned about land, food, and community. In 2010, with the help of many friends, they planted 5,000 peach and apple trees east of Wichita and started building what Meadowlark is today.",
  paragraph3:
    "Their cider is different because it has to be: every apple pressed at Meadowlark was grown here, on this land. No concentrate. No outside fruit. An estate cidery in the truest sense.",
  quote: "We love the good people of Kansas and we really enjoy our customers at the farm.",
  attribution: "— Tom & Gina Brown",
  primaryImageUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&q=85",
  secondaryImageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=80",
};

export const DEFAULT_TAP_LIST: TapListContent = {
  eyebrow: "The Cellar",
  headline: "Three tiers.",
  emphasis: "One orchard.",
  intro: "",
  bottles: [
    "Flagship · $9.50 · Meadowlark Red, Meadowlark Gold, Meadow Hopper · The everyday ciders, balanced and made for the tap room.",
    "Sturnella Reserve · $14 · Peach, Blackberry, Strawberry, Scrumpy, Farmhouse Funk · Fruit-forward and wild-fermented. Each batch is its own season.",
    "Fine Cider · $18 · Prize 22, All Seasons · The top of the cellar. Complex, deliberate, and worth the patience.",
  ].join("\n"),
};

export const DEFAULT_ACTIVITIES: ActivitiesContent = {
  eyebrow: "At the Farm",
  headline: "Walk, play,",
  emphasis: "drink, eat, enjoy.",
  paragraph1:
    "Meadowlark isn't just a place to buy cider — it's a place to spend an afternoon. Bring the family, bring your dog, bring a blanket. There's always something happening in Rose Hill.",
  paragraph2:
    "Hard cider on tap alongside sparkling apple cider, house-made root beer, and seasonal slushies — something for everyone, every age.",
};

export const DEFAULT_ADMISSION: AdmissionContent = {
  admissionValue: "$3.50–$4.00",
  admissionSub: "per person (10+) · Kids under 10 free",
  hoursValue: "Wed–Sun",
  hoursSub: "10am–5pm · Fri until 6:30pm · Year-round",
  locationValue: "Rose Hill, KS",
  locationSub: "11249 SW 160th St · No appointment needed",
};

export const DEFAULT_CLUB_TEASER: ClubTeaserContent = {
  eyebrow: "Cider Club",
  headline: "First from the press.",
  emphasis: "Every season.",
  body: "Members receive their allocation before each release goes public — shipped to your door or held for farm pickup.",
  fineprint: "From $120/season · Free first tasting room visit · 10–15% off the shop",
  ctaLabel: "Become a Member",
  ctaHref: "/cider-club",
  imageUrl: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1800&q=80",
};

export interface ContentField {
  key: string;
  label: string;
  multiline?: boolean;
  hint?: string;
}

export const CONTENT_BLOCKS: {
  key: string;
  title: string;
  description: string;
  fields: ContentField[];
  defaults: Record<string, string>;
}[] = [
  {
    key: "hero",
    title: "Homepage Hero",
    description: "The full-screen opening section.",
    fields: [
      { key: "label", label: "Eyebrow label" },
      { key: "line1", label: "Headline line 1" },
      { key: "line2", label: "Headline line 2" },
      { key: "emphasis", label: "Headline emphasis (italic)" },
      { key: "body", label: "Body paragraph", multiline: true },
      { key: "primaryLabel", label: "Primary button label" },
      { key: "primaryHref", label: "Primary button link" },
      { key: "secondaryLabel", label: "Secondary button label" },
      { key: "secondaryHref", label: "Secondary button link" },
      { key: "imageUrl", label: "Background image URL", hint: "Full-bleed hero photograph" },
    ],
    defaults: DEFAULT_HERO as unknown as Record<string, string>,
  },
  {
    key: "seasonal_banner",
    title: "Seasonal Banner",
    description: "The accent strip under the hero.",
    fields: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "line1", label: "Line 1" },
      { key: "line2", label: "Line 2" },
      { key: "ctaLabel", label: "Button label" },
      { key: "ctaHref", label: "Button link" },
    ],
    defaults: DEFAULT_BANNER as unknown as Record<string, string>,
  },
  {
    key: "story",
    title: "Homepage Story Section",
    description: "The Tom & Gina story block.",
    fields: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "headline", label: "Headline" },
      { key: "emphasis", label: "Headline emphasis (italic)" },
      { key: "paragraph1", label: "Paragraph 1", multiline: true },
      { key: "paragraph2", label: "Paragraph 2", multiline: true },
      { key: "paragraph3", label: "Paragraph 3", multiline: true },
      { key: "quote", label: "Pull quote", multiline: true },
      { key: "attribution", label: "Quote attribution" },
      { key: "primaryImageUrl", label: "Primary image URL" },
      { key: "secondaryImageUrl", label: "Secondary image URL" },
    ],
    defaults: DEFAULT_STORY as unknown as Record<string, string>,
  },
  {
    key: "tap_list",
    title: "Tap List / Cellar Preview",
    description: "The three-tier cider showcase.",
    fields: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "headline", label: "Headline" },
      { key: "emphasis", label: "Headline emphasis (italic)" },
      { key: "intro", label: "Optional intro", multiline: true },
      {
        key: "bottles",
        label: "Tier lines (one per line)",
        multiline: true,
        hint: "Format: Tier · Price · Bottle names · Description",
      },
    ],
    defaults: DEFAULT_TAP_LIST as unknown as Record<string, string>,
  },
  {
    key: "activities",
    title: "At the Farm — Activities Intro",
    description: "The 'walk, play, drink' section intro.",
    fields: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "headline", label: "Headline" },
      { key: "emphasis", label: "Headline emphasis (italic)" },
      { key: "paragraph1", label: "Paragraph 1", multiline: true },
      { key: "paragraph2", label: "Paragraph 2", multiline: true },
    ],
    defaults: DEFAULT_ACTIVITIES as unknown as Record<string, string>,
  },
  {
    key: "club_teaser",
    title: "Cider Club Teaser",
    description: "The full-bleed 'First from the press' block.",
    fields: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "headline", label: "Headline" },
      { key: "emphasis", label: "Headline emphasis (italic)" },
      { key: "body", label: "Body", multiline: true },
      { key: "fineprint", label: "Fine print (price + perks)" },
      { key: "ctaLabel", label: "CTA label" },
      { key: "ctaHref", label: "CTA link" },
      { key: "imageUrl", label: "Background image URL" },
    ],
    defaults: DEFAULT_CLUB_TEASER as unknown as Record<string, string>,
  },
  {
    key: "admission",
    title: "Admission / Hours / Location",
    description: "The three-column strip near the bottom of the homepage.",
    fields: [
      { key: "admissionValue", label: "Admission — value" },
      { key: "admissionSub", label: "Admission — subtitle" },
      { key: "hoursValue", label: "Hours — value" },
      { key: "hoursSub", label: "Hours — subtitle" },
      { key: "locationValue", label: "Location — value" },
      { key: "locationSub", label: "Location — subtitle" },
    ],
    defaults: DEFAULT_ADMISSION as unknown as Record<string, string>,
  },
];

// Merge stored CMS value with defaults so missing fields fall back gracefully.
export function mergeContent<T extends Record<string, unknown>>(defaults: T, stored: Record<string, unknown> | undefined): T {
  if (!stored) return defaults;
  return { ...defaults, ...stored } as T;
}
