/**
 * Utility functions for country and string manipulation.
 */

/**
 * Capitalizes the first letter of a string.
 * @param {string} s - The input string.
 * @returns {string} The capitalized string, or an empty string if input is falsy.
 */
export const capitalize = (s) => {
  if (!s) return "";
  const str = String(s).trim();
  if (str.toLowerCase() === "uk") return "UK";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Converts a country slug (e.g., 'canada', 'uk') to its corresponding adjective form.
 * @param {string} countrySlug - The slug of the country (e.g., 'canada').
 * @returns {string} The adjective form (e.g., 'Canadian', 'British'), or 'Default'.
 */
export const getCountryAdjective = (countrySlug) => {
  if (!countrySlug) return 'Default';
  const slug = countrySlug.toLowerCase();
  switch (slug) {
    case 'canada':
      return 'Canadian';
    case 'uk':
      return 'British';
    default:
      // Fallback for other countries we might add later (e.g., usa -> Usa)
      return capitalize(slug); 
  }
};