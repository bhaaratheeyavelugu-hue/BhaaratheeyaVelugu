/**
 * Region config: only Telangana is selectable; AP and Karnataka are Coming Soon.
 * State outline images: official outlines from Wikimedia Commons (CC BY-SA).
 * Fallback to local /state-*.svg if external URLs are blocked.
 */
const WIKI_PATH = "https://commons.wikimedia.org/wiki/Special:FilePath";
export const STATES = [
  { id: "AP", name: "Andhra Pradesh", comingSoon: true, image: `${WIKI_PATH}/Andhra_Pradesh_map_for_WLM-IN.svg` },
  { id: "TS", name: "Telangana", comingSoon: false, image: `${WIKI_PATH}/Telangana_map_for_WLM-IN.svg` },
  { id: "KA", name: "Karnataka", comingSoon: true, image: `${WIKI_PATH}/Karnataka_map_for_WLM-IN.svg` },
] as const;

export type StateId = (typeof STATES)[number]["id"];
