export const validateContributionImageSizes = (req, res, next) => {
  for (const file of req.files ?? []) {
    const isMainImage = file.fieldname === "mainImageFile";
    const section = file.fieldname.match(/^sectionImageFiles\[(\d+)\]$/);
    if (!isMainImage && !section) continue;

    const limitMB = isMainImage ? 3 : 1;
    if (file.size > limitMB * 1024 * 1024) {
      const label = isMainImage ? "Main Image" : `Section ${Number(section[1]) + 1} Image`;
      return res.status(413).json({ message: `${label} must be ${limitMB} MB or smaller.` });
    }
  }

  next();
};
