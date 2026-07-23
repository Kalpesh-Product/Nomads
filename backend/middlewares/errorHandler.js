import { config } from "dotenv";

config();
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err?.code === 11000) {
    const duplicateField = Object.keys(err.keyPattern || err.keyValue || {})[0];
    const duplicateLabel = duplicateField
      ? duplicateField.replace(/([A-Z])/g, " $1").toLowerCase()
      : "record";

    return res.status(409).json({
      message: `A ${duplicateLabel} with these details already exists.`,
    });
  }

  return res.status(err?.statusCode || err?.status || 500).json({
    message: err?.message || "Internal server error",
  });
};

export default errorHandler;
