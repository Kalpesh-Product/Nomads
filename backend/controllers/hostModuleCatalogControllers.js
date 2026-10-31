import HostModuleCategory from "../models/HostModuleCategory.js";
import { uploadFileToS3, deleteFileFromS3ByKey } from "../config/s3Config.js";

const withoutDisabledModules = (modules = []) =>
  modules
    .filter((module) => module.enabled !== false)
    .map((module) => ({
      ...module,
      children: withoutDisabledModules(module.children || []),
    }));

const withoutDisabled = (categories) =>
  categories.map((category) => ({
    ...category,
    modules: withoutDisabledModules(category.modules || []),
  }));

const walkModules = (modules = [], visit) => {
  for (const module of modules) {
    visit(module);
    walkModules(module.children || [], visit);
  }
};

const findModuleNode = (modules = [], moduleId) => {
  for (const module of modules) {
    if (module.id === moduleId) return module;
    const nested = findModuleNode(module.children || [], moduleId);
    if (nested) return nested;
  }
  return null;
};

const findModuleLocation = (modules = [], moduleId) => {
  for (let index = 0; index < modules.length; index += 1) {
    const module = modules[index];
    if (module.id === moduleId) return { module, siblings: modules, index };
    const nested = findModuleLocation(module.children || [], moduleId);
    if (nested) return nested;
  }
  return null;
};

// Public: feeds host.wono.co's /modules page and sidebar directly, so the
// marketing site never needs its own copy of this content. Disabled
// modules are stripped out here — pass ?includeDisabled=1 (master panel
// only) to see everything, enabled or not.
export const getHostModuleCatalog = async (req, res, next) => {
  try {
    const includeDisabled = ["1", "true"].includes(String(req.query.includeDisabled));
    const categories = await HostModuleCategory.find({}).sort({ order: 1 }).lean();
    return res.status(200).json({ categories: includeDisabled ? categories : withoutDisabled(categories) });
  } catch (error) {
    next(error);
  }
};

const slugify = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";

const inferIconKey = (label = "") => {
  const value = String(label).toLowerCase();
  if (/website|web|listing|global/.test(value)) return "HiOutlineGlobeAlt";
  if (/meeting/.test(value)) return "MdMeetingRoom";
  if (/booking|calendar|schedule|leave/.test(value)) return "HiOutlineCalendar";
  if (/support|help|ticket/.test(value)) return "MdOutlineSupportAgent";
  if (/profile|user|visitor|member|people|team/.test(value)) return "HiOutlineUserCircle";
  if (/company|organization|department|unit|office/.test(value)) {
    return "HiOutlineOfficeBuilding";
  }
  if (/billing|payment|finance|account|budget|price|sales/.test(value)) {
    return "HiOutlineCurrencyDollar";
  }
  if (/report|analytics|dashboard|metric/.test(value)) return "HiOutlineChartBar";
  if (/asset|inventory|resource|document/.test(value)) return "HiOutlineCollection";
  if (/security|password|access|grant/.test(value)) return "HiOutlineLockClosed";
  if (/task|checklist|printout|order/.test(value)) return "HiOutlineClipboardList";
  if (/maintenance|repair|infrastructure|tech|it /.test(`${value} `)) {
    return "HiOutlineWrenchScrewdriver";
  }
  return "HiOutlineViewGrid";
};

// Admin: a brand-new sidebar category (e.g. a future "Integrations"
// section), appended after every existing one.
export const createCategory = async (req, res, next) => {
  try {
    const { label } = req.body || {};
    if (!label || !String(label).trim()) {
      return res.status(400).json({ message: "label is required" });
    }

    const baseId = slugify(label);
    let id = baseId;
    let suffix = 1;
    // eslint-disable-next-line no-await-in-loop
    while (await HostModuleCategory.exists({ id })) {
      id = `${baseId}-${suffix++}`;
    }

    const last = await HostModuleCategory.findOne().sort({ order: -1 }).select("order").lean();
    const order = (last?.order ?? -1) + 1;

    const category = await HostModuleCategory.create({ id, label: String(label).trim(), order, modules: [] });
    return res.status(201).json({ category });
  } catch (error) {
    next(error);
  }
};

// Admin: a brand-new top-level module in an existing category — just a
// label to start; summary/bullets/plan/screenshot are filled in afterwards
// through the edit endpoints above.
export const createModule = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const {
      label,
      parentModuleId,
      iconKey = "",
      plan = null,
      planAccessMode = "cumulative",
      verticals = [],
      summary = "",
      bullets = [],
    } = req.body || {};
    if (!label || !String(label).trim()) {
      return res.status(400).json({ message: "label is required" });
    }

    const category = await HostModuleCategory.findOne({ id: categoryId });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const existingIds = new Set();
    walkModules(category.modules, (item) => existingIds.add(item.id));
    const baseId = slugify(label);
    let id = baseId;
    let suffix = 1;
    while (existingIds.has(id)) {
      id = `${baseId}-${suffix++}`;
    }

    const module = {
      id,
      label: String(label).trim(),
      iconKey: String(iconKey || "").trim() || inferIconKey(label),
      plan: ["basic", "professional", "custom"].includes(plan) ? plan : null,
      planAccessMode: planAccessMode === "exact" ? "exact" : "cumulative",
      verticals: Array.isArray(verticals)
        ? [...new Set(verticals.map((item) => String(item || "").trim()).filter(Boolean))]
        : [],
      summary: String(summary || "").trim(),
      bullets: Array.isArray(bullets)
        ? bullets.map((item) => String(item || "").trim()).filter(Boolean)
        : [],
      image: {},
      enabled: true,
    };

    if (parentModuleId) {
      const parent = findModuleNode(category.modules, parentModuleId);
      if (!parent) {
        return res.status(404).json({ message: "Parent module not found" });
      }
      // Every module detail can be a Dashboard followed by its offered pages.
      // Keep a newly added dashboard first; all other pages retain insertion
      // order and can still be rearranged from the Master panel.
      if (/dashboard/i.test(module.label)) {
        parent.children.unshift(module);
      } else {
        parent.children.push(module);
      }
    } else {
      category.modules.push(module);
    }
    await category.save();

    return res.status(201).json({ category, moduleId: id, parentModuleId: parentModuleId || null });
  } catch (error) {
    next(error);
  }
};

// Admin (master panel): structural edits — add/remove/reorder a category's
// modules or a module's children — go through one whole-array replace
// instead of a pile of array-index endpoints.
export const replaceCategoryModules = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { modules, label, order } = req.body || {};

    if (!Array.isArray(modules)) {
      return res.status(400).json({ message: "modules array is required" });
    }

    const update = { modules };
    if (label !== undefined) update.label = label;
    if (order !== undefined) update.order = order;

    const category = await HostModuleCategory.findOneAndUpdate(
      { id: categoryId },
      update,
      { new: true, runValidators: true },
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({ category });
  } catch (error) {
    next(error);
  }
};

const EDITABLE_FIELDS = [
  "label",
  "iconKey",
  "summary",
  "bullets",
  "plan",
  "planAccessMode",
  "verticals",
  "enabled",
];

// Admin: the common case — edit one module or child's copy (label, summary,
// bullets, plan tier) without touching the rest of the category document.
// Pass `childId` in the body to target a department's sub-module instead of
// the top-level module itself.
export const updateModuleFields = async (req, res, next) => {
  try {
    const { categoryId, moduleId } = req.params;
    const { childId, ...fields } = req.body || {};
    const editableFields = EDITABLE_FIELDS.filter((key) => fields[key] !== undefined);

    if (!editableFields.length) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const category = await HostModuleCategory.findOne({ id: categoryId });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // childId is retained for older Master clients; newer clients can address
    // any nested node directly with moduleId.
    const target = findModuleNode(category.modules, childId || moduleId);
    if (!target) return res.status(404).json({ message: "Module not found" });

    editableFields.forEach((key) => {
      target[key] = fields[key];
    });
    await category.save();

    return res.status(200).json({ category });
  } catch (error) {
    next(error);
  }
};

const findModuleAndTarget = (category, moduleId, childId) => {
  const target = findModuleNode(category.modules, childId || moduleId);
  return target ? { module: target, target } : null;
};

// Admin: screenshot upload for one module/child. Uploads to S3 first, then
// deletes the previous image (if any) so a failed upload never leaves the
// module without a picture.
export const uploadModuleScreenshot = async (req, res, next) => {
  try {
    const { categoryId, moduleId } = req.params;
    const childId = req.query.childId || req.body?.childId;

    if (!req.file) {
      return res.status(400).json({ message: "image file is required" });
    }

    const category = await HostModuleCategory.findOne({ id: categoryId });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const found = findModuleAndTarget(category, moduleId, childId);
    if (!found) {
      return res.status(404).json({ message: "Module not found" });
    }

    const previousKey = found.target.image?.key;
    const extension = (req.file.mimetype.split("/")[1] || "png").toLowerCase();
    const key = `host-modules/${categoryId}/${childId || moduleId}-${Date.now()}.${extension}`;
    const { url } = await uploadFileToS3(key, req.file);

    found.target.image = { url, key };
    await category.save();

    if (previousKey) {
      deleteFileFromS3ByKey(previousKey).catch((error) =>
        console.error("Failed to delete previous host-module screenshot:", error?.message),
      );
    }

    return res.status(200).json({ category });
  } catch (error) {
    next(error);
  }
};

// Admin: remove a module, or one child from a department-style module, and
// best-effort clean up its S3 screenshot.
export const deleteModule = async (req, res, next) => {
  try {
    const { categoryId, moduleId } = req.params;
    const childId = req.query.childId;

    const category = await HostModuleCategory.findOne({ id: categoryId });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const found = findModuleAndTarget(category, moduleId, childId);
    if (!found) {
      return res.status(404).json({ message: "Module not found" });
    }

    const imageKey = found.target.image?.key;

    const location = findModuleLocation(category.modules, childId || moduleId);
    if (!location) return res.status(404).json({ message: "Module not found" });
    location.siblings.splice(location.index, 1);

    await category.save();

    if (imageKey) {
      deleteFileFromS3ByKey(imageKey).catch((error) =>
        console.error("Failed to delete host-module screenshot:", error?.message),
      );
    }

    return res.status(200).json({ category });
  } catch (error) {
    next(error);
  }
};
