import SavorTemplate from "./savor/SavorTemplate";
import WayfarerTemplate from "./wayfarer/WayfarerTemplate";
import HavenTemplate from "./haven/HavenTemplate";
import CameliaTemplate from "./camelia/CameliaTemplate";
import CommonsTemplate from "./commons/CommonsTemplate";
import HuddleTemplate from "./huddle/HuddleTemplate";
import TravigoTemplate from "./travigo/TravigoTemplate";
import LodgeTemplate from "./lodge/LodgeTemplate";
import CaliHostelTemplate from "./caliHostel/CaliHostelTemplate";
import TastycTemplate from "./tastyc/TastycTemplate";
import GrandBarTemplate from "./grandbar/GrandBarTemplate";
import AromaticaTemplate from "./aromatica/AromaticaTemplate";
import FlowspaceTemplate from "./flowspace/FlowspaceTemplate";
import WorkscapeTemplate from "./workscape/WorkscapeTemplate";
import BrixspaceTemplate from "./brixspace/BrixspaceTemplate";
import WorpaceTemplate from "./worpace/WorpaceTemplate";
import QerjaTemplate from "./qerja/QerjaTemplate";
import TulumTemplate from "./tulum/TulumTemplate";
import GrindelwaldTemplate from "./grindelwald/GrindelwaldTemplate";

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
  lodge: LodgeTemplate,
  "cali-hostel": CaliHostelTemplate,
  tastyc: TastycTemplate,
  grandbar: GrandBarTemplate,
  aromatica: AromaticaTemplate,
  flowspace: FlowspaceTemplate,
  workscape: WorkscapeTemplate,
  brixspace: BrixspaceTemplate,
  worpace: WorpaceTemplate,
  qerja: QerjaTemplate,
  tulum: TulumTemplate,
  grindelwald: GrindelwaldTemplate,
};

export const isVerticalTemplate = (themeVariant) =>
  Object.prototype.hasOwnProperty.call(VERTICAL_TEMPLATES, String(themeVariant || "").trim());
