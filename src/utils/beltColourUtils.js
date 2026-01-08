/**
 * Utilities for belt colour handling.
 * - beltTextColour: returns text colour class for a given kyu grade.
 * - beltBackgroundColour: returns CSS background color for a given kyu grade.
 */
export function beltTextColour(integer) {
  if (integer === 1 || integer === 2 || integer === 4) {
    return "text-white";
  } else {
    return "text-black";
  }
}

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

// New: Tailwind background class mapping for belt pills
export function beltBackgroundClass(integer) {
  const map = {
    8: "bg-gray-100", // white belt pill background
    7: "bg-yellow-300",
    6: "bg-orange-500",
    5: "bg-green-700",
    4: "bg-purple-700",
    3: "bg-cyan-200", // light blue
    2: "bg-blue-600", // dark blue
    1: "bg-amber-800", // brown
  };
  return map[Number(integer)] || "bg-gray-200";
}
