import VisaRuleV2 from "../models/VisaRuleV2.js";
import {
  normalizeCountryKey,
  normalizeVisaRequirement,
} from "./visaRuleController.js";

const escapeRegExp = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getVisaRulesV2 = async (req, res, next) => {
  try {
    const {
      passportCountry,
      destinationCountry,
      requirement: rawRequirement,
    } = req.query;

    const requirement = normalizeVisaRequirement(rawRequirement);
    const query = {};

    if (passportCountry) {
      const normalizedPassport = normalizeCountryKey(passportCountry);
      query.$or = [{ passport: passportCountry }, { normalizedPassport }];
    }
    if (destinationCountry) {
      query.normalizedDestination = normalizeCountryKey(destinationCountry);
    }
    if (requirement) query.requirement = requirement;

    const data = (
      await VisaRuleV2.find(query).sort({ passport: 1, destination: 1 }).lean()
    ).filter((rule) => {
      if (
        passportCountry &&
        (rule.normalizedPassport || normalizeCountryKey(rule.passport)) !==
          normalizeCountryKey(passportCountry)
      ) {
        return false;
      }

      if (
        destinationCountry &&
        (rule.normalizedDestination ||
          normalizeCountryKey(rule.destination)) !==
          normalizeCountryKey(destinationCountry)
      ) {
        return false;
      }

      return true;
    });

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getUniqueDestinationCountriesV2 = async (req, res, next) => {
  try {
    const destinationCountries = await VisaRuleV2.aggregate([
      {
        $project: {
          destination: 1,
          normalizedKey: {
            $toLower: {
              $trim: {
                input: {
                  $ifNull: ["$normalizedDestination", "$destination"],
                },
              },
            },
          },
        },
      },
      {
        $match: {
          destination: { $type: "string", $ne: "" },
          normalizedKey: { $ne: "" },
        },
      },
      {
        $group: {
          _id: "$normalizedKey",
          destination: { $first: "$destination" },
        },
      },
      { $sort: { destination: 1 } },
      {
        $project: {
          _id: 0,
          destination: 1,
        },
      },
    ]);

    const countries = destinationCountries.map((item) => item.destination);

    return res.status(200).json({
      success: true,
      count: countries.length,
      countries,
    });
  } catch (error) {
    next(error);
  }
};

export const getVisaRuleDetailsByPassportV2 = async (req, res, next) => {
  try {
    const passport = String(req.params.passport || "").trim();

    if (!passport) {
      return res.status(400).json({
        success: false,
        message: "passport is required in route params.",
      });
    }

    const normalizedPassport = normalizeCountryKey(passport);

    const data = await VisaRuleV2.find({
      $or: [{ passport }, { normalizedPassport }],
    })
      .sort({ destination: 1 })
      .lean();

    const filteredData = data.filter(
      (rule) =>
        (rule.normalizedPassport || normalizeCountryKey(rule.passport)) ===
        normalizedPassport,
    );

    return res.status(200).json({
      success: true,
      count: filteredData.length,
      data: filteredData,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVisaRuleByPassportV2 = async (req, res, next) => {
  try {
    const passport = String(req.params.passport || "").trim();

    if (!passport) {
      return res.status(400).json({
        success: false,
        message: "passport is required in route params.",
      });
    }

    const destination = String(req.body.destination || "").trim();
    if (!destination) {
      return res.status(400).json({
        success: false,
        message: "destination is required in request body.",
      });
    }

    const updates = {};

    if (Object.prototype.hasOwnProperty.call(req.body, "requirement")) {
      updates.requirement = normalizeVisaRequirement(req.body.requirement);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "durationDays")) {
      const rawDuration = req.body.durationDays;
      if (rawDuration === null || rawDuration === "") {
        updates.durationDays = null;
      } else {
        const parsed = Number(rawDuration);
        if (!Number.isFinite(parsed)) {
          return res.status(400).json({
            success: false,
            message: "durationDays must be a valid number or null.",
          });
        }
        updates.durationDays = parsed;
      }
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({
        success: false,
        message:
          "Provide at least one editable field (requirement, durationDays).",
      });
    }

    const normalizedPassport = normalizeCountryKey(passport);
    const normalizedDestination = normalizeCountryKey(destination);

    const updatedRule = await VisaRuleV2.findOneAndUpdate(
      {
        $and: [
          {
            $or: [
              { normalizedPassport },
              { passport: new RegExp(`^${escapeRegExp(passport)}$`, "i") },
            ],
          },
          {
            $or: [
              { normalizedDestination },
              {
                destination: new RegExp(`^${escapeRegExp(destination)}$`, "i"),
              },
            ],
          },
        ],
      },
      { $set: updates },
      { new: true, runValidators: true },
    ).lean();

    if (!updatedRule) {
      return res.status(404).json({
        success: false,
        message:
          "Visa rule not found for the provided passport and destination.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Visa rule updated successfully.",
      data: updatedRule,
    });
  } catch (error) {
    next(error);
  }
};
