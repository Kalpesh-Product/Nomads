import mongoose from "mongoose";

// Master-panel-editable mirror of the host.wono.co /modules marketing page.
// One document per sidebar category (Common Modules, Extra Common Modules,
// Key Apps, Core Modules, Department Accesses, Add-ons); each holds its
// modules in display order. Any module can nest its Dashboard and card/tab
// pages under `children`, including department modules that themselves sit
// below a department landing module. `iconKey` is the react-icons export name
// (e.g. "HiOutlineChip") since a component can't be stored in Mongo — the
// frontend resolves it through a lookup map.
const imageSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true, default: "" },
    key: { type: String, trim: true, default: "" }, // S3 object key, for cleanup on replace/delete
  },
  { _id: false },
);

const moduleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    iconKey: { type: String, trim: true, default: "" },
    // Omitted on a child module so it inherits its parent's plan tier.
    plan: { type: String, trim: true, enum: ["basic", "professional", "custom", null], default: null },
    // Most modules remain available in higher plans. Plan-specific surfaces
    // such as the three dashboards use "exact" instead.
    planAccessMode: {
      type: String,
      trim: true,
      enum: ["cumulative", "exact"],
      default: "cumulative",
    },
    // Optional business vertical requirement shown separately from plan access
    // on host.wono.co (for example Cafe, Hostel, or Co-living).
    verticals: { type: [String], default: [] },
    summary: { type: String, trim: true, default: "" },
    bullets: { type: [String], default: [] },
    image: { type: imageSchema, default: () => ({}) },
    // Master-panel kill switch — hides this module from host.wono.co
    // without deleting its content. Absent on documents seeded before this
    // field existed, which the public read treats the same as `true`.
    enabled: { type: Boolean, default: true },
  },
  { _id: false },
);

// Recursive on purpose: Sales Department > Cafe Management > Dashboard /
// card pages uses the same shape as Website Builder > Dashboard / tabs.
moduleSchema.add({ children: { type: [moduleSchema], default: [] } });

const hostModuleCategorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    label: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    modules: { type: [moduleSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model("HostModuleCategory", hostModuleCategorySchema);
