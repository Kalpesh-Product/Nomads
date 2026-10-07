import SavorTemplate from "./savor/SavorTemplate";
import WayfarerTemplate from "./wayfarer/WayfarerTemplate";
import HavenTemplate from "./haven/HavenTemplate";
import CameliaTemplate from "./camelia/CameliaTemplate";
import CommonsTemplate from "./commons/CommonsTemplate";
import HuddleTemplate from "./huddle/HuddleTemplate";
import TravigoTemplate from "./travigo/TravigoTemplate";
import TulumTemplate from "./tulum/TulumTemplate";

// The vertical-led templates (café, hostel, co-living, co-working, meeting rooms). Each one is a complete site
// (header, every page, footer) driven by the same published data as the panels' builder preview,
// so unlike the older templates it is rendered whole instead of section by section.
export const VERTICAL_TEMPLATES = {
  savor: SavorTemplate,
  wayfarer: WayfarerTemplate,
  haven: HavenTemplate,
  camelia: CameliaTemplate,
  commons: CommonsTemplate,
  huddle: HuddleTemplate,
  travigo: TravigoTemplate,
  tulum: TulumTemplate,
};

export const isVerticalTemplate = (themeVariant) =>
  Object.prototype.hasOwnProperty.call(VERTICAL_TEMPLATES, String(themeVariant || "").trim());
