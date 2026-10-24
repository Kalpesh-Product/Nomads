import { uploadFileToS3 } from "../config/s3Config.js";

const sanitizeS3PathSegment = (value, fallback = "untitled") => {
  const cleaned = String(value || "")
    .replace(/[/\\?%*:|"<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || fallback;
};

const sanitizeFileName = (value, fallback = "image") => {
  const cleaned = String(value || "")
    .replace(/[/\\?%*:|"<>]/g, "_")
    .replace(/\s+/g, "_")
    .trim();

  return cleaned || fallback;
};

const getS3KeyFromUrl = (fileUrl) => {
  try {
    if (!fileUrl) return "";
    const url = new URL(fileUrl);
    return decodeURIComponent(url.pathname.slice(1));
  } catch {
    return "";
  }
};

export const parseContributionSections = (sections) => {
  if (Array.isArray(sections)) return sections;

  if (typeof sections !== "string") return [];

  try {
    const parsed = JSON.parse(sections);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const buildContributionPayloadWithUploads = async ({
  body = {},
  files = [],
  folderType,
  title,
}) => {
  const payload = {
    ...body,
    sections: parseContributionSections(body.sections),
  };
  const uploadFiles = Array.isArray(files) ? files : [];

  if (!uploadFiles.length) return payload;

  const destinationFolder = sanitizeS3PathSegment(payload.destination, "Destination");
  const contentFolder = sanitizeS3PathSegment(title || payload.mainTitle, "Content");
  const baseFolder = `nomads/${folderType}/${destinationFolder}/${contentFolder}`;
  const mainImageFile = uploadFiles.find((file) => file.fieldname === "mainImageFile");

  if (mainImageFile) {
    const key =
      getS3KeyFromUrl(payload.mainImage) ||
      `${baseFolder}/Main Image/${sanitizeFileName(mainImageFile.originalname)}`;
    const uploaded = await uploadFileToS3(key, mainImageFile);
    payload.mainImage = uploaded.url;
  }

  const sectionImageUploads = uploadFiles
    .map((file) => {
      const match = file.fieldname.match(/^sectionImageFiles\[(\d+)\]$/);
      return match ? { index: Number(match[1]), file } : null;
    })
    .filter(Boolean);

  await Promise.all(
    sectionImageUploads.map(async ({ index, file }) => {
      if (!payload.sections[index]) {
        payload.sections[index] = { title: "", content: "", image: "" };
      }

      const key =
        getS3KeyFromUrl(payload.sections[index].image) ||
        `${baseFolder}/Section ${index + 1} Image/${sanitizeFileName(
          file.originalname,
        )}`;
      const uploaded = await uploadFileToS3(key, file);

      payload.sections[index] = {
        ...payload.sections[index],
        image: uploaded.url,
      };
    }),
  );

  return payload;
};
