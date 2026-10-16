import HostModuleCategory from "../models/HostModuleCategory.js";
import { uploadFileToS3, deleteFileFromS3ByKey } from "../config/s3Config.js";

const withoutDisabled = (categories) =>
  categories.map((category) => ({
    ...category,
    modules: (category.modules || [])
      .filter((mod) => mod.enabled !== false)
      .map((mod) => ({
        ...mod,
        children: (mod.children || []).filter((child) => child.enabled !== false),
      })),
  }));

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
    const { label } = req.body || {};
    if (!label || !String(label).trim()) {
      return res.status(400).json({ message: "label is required" });
    }

    const category = await HostModuleCategory.findOne({ id: categoryId });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const existingIds = new Set(
      category.modules.flatMap((mod) => [mod.id, ...(mod.children || []).map((child) => child.id)]),
    );
    const baseId = slugify(label);
    let id = baseId;
    let suffix = 1;
    while (existingIds.has(id)) {
      id = `${baseId}-${suffix++}`;
    }

    category.modules.push({ id, label: String(label).trim(), bullets: [], image: {}, enabled: true });
    await category.save();

    return res.status(201).json({ category });
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

const EDITABLE_FIELDS = ["label", "summary", "bullets", "plan", "enabled"];

// Admin: the common case — edit one module or child's copy (label, summary,
// bullets, plan tier) without touching the rest of the category document.
// Pass `childId` in the body to target a department's sub-module instead of
// the top-level module itself.
export const updateModuleFields = async (req, res, next) => {
  try {
    const { categoryId, moduleId } = req.params;
    const { childId, ...fields } = req.body || {};

    const setOps = {};
    for (const key of EDITABLE_FIELDS) {
      if (fields[key] === undefined) continue;
      const path = childId ? `modules.$[mod].children.$[child].${key}` : `modules.$[mod].${key}`;
      setOps[path] = fields[key];
    }

    if (!Object.keys(setOps).length) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const arrayFilters = [{ "mod.id": moduleId }];
    if (childId) arrayFilters.push({ "child.id": childId });

    const category = await HostModuleCategory.findOneAndUpdate(
      { id: categoryId },
      { $set: setOps },
      { new: true, arrayFilters, runValidators: true },
    );

    if (!category) {
      return res.status(404).json({ message: "Category or module not found" });
    }

    return res.status(200).json({ category });
  } catch (error) {
    next(error);
  }
};

const findModuleAndTarget = (category, moduleId, childId) => {
  const module = category.modules.find((mod) => mod.id === moduleId);
  if (!module) return null;
  if (!childId) return { module, target: module };
  const child = module.children.find((c) => c.id === childId);
  if (!child) return null;
  return { module, target: child };
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

    if (childId) {
      found.module.children = found.module.children.filter((c) => c.id !== childId);
    } else {
      category.modules = category.modules.filter((mod) => mod.id !== moduleId);
    }

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
