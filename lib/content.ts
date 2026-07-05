import { createClient } from "./supabase/server";
import {
  DEFAULT_HERO,
  DEFAULT_BANNER,
  DEFAULT_STORY,
  DEFAULT_TAP_LIST,
  DEFAULT_ACTIVITIES,
  DEFAULT_ADMISSION,
  DEFAULT_CLUB_TEASER,
  mergeContent,
  type HeroContent,
  type BannerContent,
  type StoryContent,
  type TapListContent,
  type ActivitiesContent,
  type AdmissionContent,
  type ClubTeaserContent,
} from "./content-types";

export interface FarmVideosBlock {
  eyebrow: string;
  headline: string;
  emphasis: string;
  videos: { title: string; url: string; posterUrl?: string }[];
}

const DEFAULT_FARM_VIDEOS: FarmVideosBlock = {
  eyebrow: "Come see this in action",
  headline: "Small snippets.",
  emphasis: "Same farm.",
  videos: [],
};

// Loads stored site-content blocks by key → { key: { field: value } }.
export async function getContentMap(keys: string[]): Promise<Record<string, Record<string, string>>> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_content").select("key, value").in("key", keys);
  const map: Record<string, Record<string, string>> = {};
  for (const row of data ?? []) {
    map[row.key] = (row.value as Record<string, string>) ?? {};
  }
  return map;
}

export interface HomepageContent {
  hero: HeroContent;
  banner: BannerContent;
  story: StoryContent;
  tapList: TapListContent;
  activities: ActivitiesContent;
  admission: AdmissionContent;
  clubTeaser: ClubTeaserContent;
  farmVideos: FarmVideosBlock;
}

// Loads a single JSONB block by key (used for the video block which has a
// non-flat shape the generic string-based CMS editor doesn't handle).
export async function getContentJson<T>(key: string, fallback: T): Promise<T> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_content").select("value").eq("key", key).maybeSingle();
  if (!data) return fallback;
  return { ...(fallback as object), ...(data.value as object) } as T;
}

// Server-side load for the homepage — everything the page needs merged with
// defaults. Avoids the old client-effect flicker.
export async function getHomepageContent(): Promise<HomepageContent> {
  const [map, farmVideos] = await Promise.all([
    getContentMap([
      "hero",
      "seasonal_banner",
      "story",
      "tap_list",
      "activities",
      "admission",
      "club_teaser",
    ]),
    getContentJson<FarmVideosBlock>("farm_videos", DEFAULT_FARM_VIDEOS),
  ]);
  return {
    hero: mergeContent(DEFAULT_HERO, map.hero),
    banner: mergeContent(DEFAULT_BANNER, map.seasonal_banner),
    story: mergeContent(DEFAULT_STORY, map.story),
    tapList: mergeContent(DEFAULT_TAP_LIST, map.tap_list),
    activities: mergeContent(DEFAULT_ACTIVITIES, map.activities),
    admission: mergeContent(DEFAULT_ADMISSION, map.admission),
    clubTeaser: mergeContent(DEFAULT_CLUB_TEASER, map.club_teaser),
    farmVideos,
  };
}
