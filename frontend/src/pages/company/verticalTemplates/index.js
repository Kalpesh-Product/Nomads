import SavorTemplate from "./savor/SavorTemplate";
import WayfarerTemplate from "./wayfarer/WayfarerTemplate";
import HavenTemplate from "./haven/HavenTemplate";
import CameliaTemplate from "./camelia/CameliaTemplate";
import CommonsTemplate from "./commons/CommonsTemplate";
import HuddleTemplate from "./huddle/HuddleTemplate";
import TravigoTemplate from "./travigo/TravigoTemplate";
import LodgeTemplate from "./lodge/LodgeTemplate";
import OrchardTemplate from "./orchard/OrchardTemplate";
import DestinflowTemplate from "./destinflow/DestinflowTemplate";
import CaliHostelTemplate from "./caliHostel/CaliHostelTemplate";
import TastycTemplate from "./tastyc/TastycTemplate";
import GrandBarTemplate from "./grandbar/GrandBarTemplate";
import AromaticaTemplate from "./aromatica/AromaticaTemplate";
import ItalianoTemplate from "./italiano/ItalianoTemplate";
import RestobarTemplate from "./restobar/RestobarTemplate";
import CabinTemplate from "./cabin/CabinTemplate";
import TinyHomeTemplate from "./tinyhome/TinyHomeTemplate";
import FlowspaceTemplate from "./flowspace/FlowspaceTemplate";
import WorkscapeTemplate from "./workscape/WorkscapeTemplate";
import WorkhubTemplate from "./workhub/WorkhubTemplate";
import BrixspaceTemplate from "./brixspace/BrixspaceTemplate";
import WorpaceTemplate from "./worpace/WorpaceTemplate";
import CoPlaceTemplate from "./coplace/CoPlaceTemplate";
import CoboxTemplate from "./cobox/CoboxTemplate";
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
  orchard: OrchardTemplate,
  destinflow: DestinflowTemplate,
  "cali-hostel": CaliHostelTemplate,
  tastyc: TastycTemplate,
  grandbar: GrandBarTemplate,
  aromatica: AromaticaTemplate,
  italiano: ItalianoTemplate,
  restobar: RestobarTemplate,
  cabin: CabinTemplate,

  tinyhome: TinyHomeTemplate,
  flowspace: FlowspaceTemplate,
  workscape: WorkscapeTemplate,
  workhub: WorkhubTemplate,
  brixspace: BrixspaceTemplate,
  worpace: WorpaceTemplate,
  coplace: CoPlaceTemplate,
  cobox: CoboxTemplate,
  qerja: QerjaTemplate,
  tulum: TulumTemplate,
  grindelwald: GrindelwaldTemplate,
};

export const isVerticalTemplate = (themeVariant) =>
  Object.prototype.hasOwnProperty.call(VERTICAL_TEMPLATES, String(themeVariant || "").trim());
