import ColivingCompany from "../../models/coliving/ColivingCompany";
import { Readable } from "stream";
import csvParser from "csv-parser";

const bulkInsertColivingCompanies = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid csv file" });
    }

    const stream = Readable.from(file.buffer.toString("utf-8").trim());
    
  } catch (error) {
    next(error);
  }
};
