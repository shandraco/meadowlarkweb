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
}

export interface BannerContent {
  eyebrow: string;
  line1: string;
  line2: string;
  ctaLabel: string;
  ctaHref: string;
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
};

export const DEFAULT_BANNER: BannerContent = {
  eyebrow: "Now Pouring",
  line1: "Meadowlark Red · Meadowlark Gold · Meadow Hopper — on tap at the farm",
  line2: "Also at Wichita Farmers Market every Saturday",
  ctaLabel: "Visit Us →",
  ctaHref: "/visit",
};

// Editable-field metadata that drives the admin CMS form generically.
export interface ContentField {
  key: string;
  label: string;
  multiline?: boolean;
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
    ],
    defaults: DEFAULT_HERO as unknown as Record<string, string>,
  },
  {
    key: "seasonal_banner",
    title: "Seasonal Banner",
    description: "The maroon strip under the hero.",
    fields: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "line1", label: "Line 1" },
      { key: "line2", label: "Line 2" },
      { key: "ctaLabel", label: "Button label" },
      { key: "ctaHref", label: "Button link" },
    ],
    defaults: DEFAULT_BANNER as unknown as Record<string, string>,
  },
];
