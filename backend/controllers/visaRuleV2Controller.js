import VisaRuleV2 from "../models/VisaRuleV2.js";
import {
  normalizeCountryKey,
  normalizeVisaRequirement,
} from "./visaRuleController.js";

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
