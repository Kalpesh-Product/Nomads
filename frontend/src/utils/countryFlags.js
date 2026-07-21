const COUNTRY_FLAG_ALIASES = {
  bahamas: "The Bahamas",
  fiji: "Fiji Islands",
  "north macedonia": "Macedonia",
  usa: "United States",
};

export const findCountryByName = (countries, countryName = "") => {
  const normalizedCountryName = countryName.trim().toLowerCase();
  const lookupName =
    COUNTRY_FLAG_ALIASES[normalizedCountryName] || countryName.trim();

  return (
    countries.find(
      (country) => country.name.toLowerCase() === lookupName.toLowerCase(),
    ) || null
  );
};
