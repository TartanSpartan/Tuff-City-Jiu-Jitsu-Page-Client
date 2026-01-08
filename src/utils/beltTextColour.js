/**
 * Determines the appropriate text colour (black or white) for a given belt integer ID.
 * This is typically used to ensure text visibility against dark belt colours.
 *
 * @param {number} integer - The integer ID of the belt (e.g., 2 for Dark Blue, 4 for Purple).
 * @returns {string} The text colour, either "white" or "black".
 */
export function beltTextColour(integer) {
  // 2 is Dark Blue, 4 is Purple
  if (integer === 1 || integer === 2 || integer === 4) {
    // This makes the brown, dark blue's or purple's belt's header text display better
    // return "white";
    return "text-white";
  } else {
    return "black";
  }
}

/**
 * Returns a CSS background color value for a given belt integer grade (8..1).
 * Designed for inline styles on <option> elements where Tailwind classes may not apply.
 *
 * 8: White, 7: Yellow, 6: Orange, 5: Green, 4: Purple,
 * 3: Light Blue, 2: Dark Blue, 1: Brown
 *
 * @param {number} integer - The kyu grade number (8..1)
 * @returns {string} A CSS color string suitable for `style.backgroundColor`.
 */
export function beltBackgroundColour(integer) {
  const map = {
    8: "white",
    7: "yellow",
    6: "orange",
    5: "green",
    4: "purple",
    3: "#add8e6", // light blue
    2: "#00008b", // dark blue
    1: "#b5651d", // brown
  };
  return map[Number(integer)] || "white";
}
