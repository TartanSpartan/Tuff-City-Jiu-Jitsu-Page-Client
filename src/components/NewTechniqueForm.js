import React, { useState, useEffect, useRef, useMemo, useCallback, Fragment } from "react";
// import FormErrors from "./FormErrors";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { getCountryAdjective } from "../utils/countryHelpers";
import { beltTextColour } from "../utils/beltColourUtils";
import { Technique } from "../requests";
import {
  Check,
  ChevronsUpDown,
  ChevronDown,
  Plus,
  Trash2,
  ArrowRight,
  RefreshCcw,
  Type,
  Link as LinkIcon,
} from "lucide-react";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  Transition,
} from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import { motion, AnimatePresence } from "framer-motion";
// TODO consider this smooth animation for other conditional rendering on other components' forms
// import Select from "react-select";
import "../App.scss";

// TODO: remove "warning" exclamation mark signs (see <p> note below)

// Useful features would be to batch-process entire technique type groups at a time, and to copy a technique for easy editing, but these may come down the road at some point

// function secondConverter(time) {
//   let fullTime = 0;
//   /*pseudocode:
//   if start/end time is in min:sec format, parse it into seconds
//   i.e. A:BB so time in seconds = A*60 + BB */
//   if (time.includes(":")) {
//     const timeArray = time.split(":");
//     fullTime = (parseInt(timeArray[0] * 60) + parseInt(timeArray[1]));
//   } else {
//     fullTime = time;
//   }
//   return fullTime;
// }

// --- Color Utility Helper ---
// This map converts common belt color names (which might come from the API) to hex codes.
// const COLOR_MAP = {
//     'white': '#F3F4F6', // Light gray for visibility against white background
//     'yellow': '#FFD700', // Gold
//     'yellow-green': '#ADFF2F', // Green-Yellow
//     'orange': '#FFA500',
//     'green': '#008000',
//     'blue': '#0000FF',
//     'purple': '#800080',
//     'brown': '#8B4513',
//     'red': '#FF0000',
//     'black': '#000000',
//     'default': '#A1A1AA', // Gray for unknown/missing colors
// };

/**
 * Converts a raw color string (e.g., "Yellow Belt", "black") into a standard hex code.
 * @param {string} colorString - The raw string from the API.
 * @returns {string} The corresponding hex code or a default color.
 */
// const colourNameToHex = (colorString) => {
//     if (!colorString) return COLOR_MAP.default;

//     // Normalize: lowercase, remove non-alphanumeric/hyphen characters, and trim.
//     const normalized = colorString.toLowerCase().replace(/[^a-z-]/g, '').trim();

//     // Check for exact matches first
//     if (COLOR_MAP[normalized]) {
//         return COLOR_MAP[normalized];
//     }

//     // Check for containment (e.g., "yellow-green belt" should match "yellow-green")
//     const foundKey = Object.keys(COLOR_MAP).find(key => normalized.includes(key));

//     return COLOR_MAP[foundKey] || COLOR_MAP.default;
// };

/**
 * Utility to calculate appropriate text color (black or white) for accessibility.
 * In a real app, this function would be imported from a utility file.
 * @param {string} hexcolor - The hex code for the background.
 * @returns {string} '#000000' (black) or '#FFFFFF' (white).
 */
// const getContrastTextColor = (hexcolor) => {
//     const r = parseInt(hexcolor.substring(1, 3), 16);
//     const g = parseInt(hexcolor.substring(3, 5), 16);
//     const b = parseInt(hexcolor.substring(5, 7), 16);
//     // Calculate the luminance (YIQ method for better color perception)
//     const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
//     return (yiq >= 128) ? '#000000' : '#FFFFFF';
// };

// ----------------------------------------------------------------------
// NEW HELPER FUNCTION: Convert raw color name to a Tailwind background class
// ----------------------------------------------------------------------
const colourNameToTailwindBg = (rawColour) => {
  if (!rawColour) return "bg-gray-200";

  const normalized = rawColour.toLowerCase().trim();

  // Map common names to specific Tailwind utility classes
  const colorMap = {
    white: "bg-gray-100", // Light gray for visibility against white background
    yellow: "bg-yellow-300",
    orange: "bg-orange-500",
    green: "bg-green-700",
    purple: "bg-purple-700",
    lightblue: "bg-cyan-200",
    darkblue: "bg-blue-600",
    brown: "bg-amber-800",
  };

  // If the API returns a full Tailwind class already, use it (unlikely, but safe)
  if (normalized.startsWith("bg-")) {
    return normalized;
  }

  // Check for containment (e.g., "dark green" still matches "green")
  const foundColorKey = Object.keys(colorMap).find((key) => normalized.includes(key));

  return colorMap[foundColorKey] || "bg-gray-400";
};

const categoryOptions = [
  {
    value: "ukemi",
    label: <span className="text-gray-800">Ukemi (breakfalling)</span>,
    displayText: "Ukemi (breakfalling)",
  },
  {
    value: "atemi",
    label: <span className="text-gray-800">Atemi (striking)</span>,
    displayText: "Atemi (striking)",
  },
  {
    value: "kansetsu",
    label: <span className="text-gray-800">Kansetsu (locks)</span>,
    displayText: "Kansetsu (locks)",
  },
  {
    value: "shime",
    label: <span className="text-gray-800">Shime-waza (strangles)</span>,
    displayText: "Shime-waza (strangles)",
  },
  {
    value: "ne-waza",
    label: <span className="text-gray-800">Ne-waza (groundwork)</span>,
    displayText: "Ne-waza (groundwork)",
  },
  {
    value: "nage-waza",
    label: <span className="text-gray-800">Nage-waza (throwing)</span>,
    displayText: "Nage-waza (throwing)",
  },
  {
    value: "nage-no-kata",
    label: <span className="text-gray-800">Nage-no-kata (throwing form)</span>,
    displayText: "Nage-no-kata (throwing form)",
  },
  {
    value: "henka",
    label: <span className="text-gray-800">Henka-waza (transition techniques)</span>,
    displayText: "Henka-waza (transition techniques)",
  },
  {
    value: "kaeshi",
    label: <span className="text-gray-800">Kaeshi-waza (counter techniques)</span>,
    displayText: "Kaeshi-waza (counter techniques)",
  },
  {
    value: "bunkai",
    label: <span className="text-gray-800">Bunkai (application for defence)</span>,
    displayText: "Bunkai (application for defence)",
  },
  {
    value: "weapons",
    label: <span className="text-gray-800">Weapons (striking)</span>,
    displayText: "Weapons (striking)",
  },
  {
    value: "misc",
    label: <span className="text-gray-800">Miscellaneous</span>,
    displayText: "Miscellaneous",
  },
];

function secondConverter(time) {
  let fullTime = 0;
  const timeString = String(time).trim();

  if (!timeString || isNaN(parseInt(timeString, 10))) {
    return 0;
  }

  if (timeString.includes(":")) {
    const timeArray = timeString.split(":");
    // Ensure parts are numbers, default to 0 if not
    const minutes = parseInt(timeArray[0] || 0, 10);
    const seconds = parseInt(timeArray[1] || 0, 10);
    fullTime = minutes * 60 + seconds;
  } else {
    fullTime = parseInt(timeString, 10);
  }
  return fullTime;
}

// console.log("secondConverter test", secondConverter("5:30"))
// If this returns 330 then it works great

// function startTimeIncludeCheck(startTime) {
//   let startFlag = "?start=";
//   let startSubStr = "";
//   if (startTime === "" || startTime === null || startTime === undefined){
//     return startSubStr;
//   } else {
//     startSubStr = startFlag + secondConverter(String(startTime));
//     return startSubStr;
//   }
// }

// function endTimeIncludeCheck(endTime) {
//   let endFlag = "&end=";
//   let endSubStr = "";
//   if (endTime === "" || endTime === null || endTime === undefined){
//     console.log("There is no endSubStr");
//     return endSubStr;
//   } else {
//     endSubStr = endFlag + secondConverter(String(endTime));
//     return endSubStr;
//   }
// }

// console.log("Test for startTimeIncludeCheck", startTimeIncludeCheck(4));

function urlStartEndizer(url, startTime, endTime) {
  if (!url) return url;

  // Helper: remove existing start/end/stop params from URL
  const stripParams = (u) => {
    // Remove start=..., end=..., stop=... params
    let cleaned = u.replace(/[?&](?:start|end|stop)=[^&]*/gi, "");
    // Fix any leftover sequences like '?&' or '&&'
    cleaned = cleaned.replace(/\?&/, "?").replace(/&&+/g, "&");
    // Remove trailing ? or &
    cleaned = cleaned.replace(/[?&]$/g, "");
    return cleaned;
  };

  const existingStart = parseTimeParamFromUrl(url, "start");
  const existingEnd = parseTimeParamFromUrl(url, "end") || parseTimeParamFromUrl(url, "stop");

  // Prefer explicit startTime/endTime arguments; fall back to parsed values from URL
  const convertedStartTime = startTime ? secondConverter(String(startTime)) : existingStart;
  const convertedEndTime = endTime ? secondConverter(String(endTime)) : existingEnd;

  // If neither source provides times, return original url unchanged
  if (convertedStartTime == null && convertedEndTime == null) return url;

  // Build base URL without existing time params
  let finalUrl = stripParams(url);

  // Decide joiner: if finalUrl already contains '?', use '&', else use '?'
  const joiner = finalUrl.includes("?") ? "&" : "?";

  const parts = [];
  if (convertedStartTime != null) parts.push(`start=${convertedStartTime}`);
  if (convertedEndTime != null) parts.push(`end=${convertedEndTime}`);

  if (parts.length > 0) finalUrl += joiner + parts.join("&");

  return finalUrl;
}

// Returns true if the given URL already contains start/end time parameters
function urlHasTimeParams(url) {
  if (!url) return false;
  return url.includes("?start=") || url.includes("?end=") || url.includes("&end=");
}

function urlHasStartParam(url) {
  if (!url) return false;
  return /[?&]start=/.test(url);
}

function urlHasEndParam(url) {
  if (!url) return false;
  return /[?&]end=/.test(url) || /[?&]stop=/.test(url);
}

function parseTimeParamFromUrl(url, param) {
  if (!url) return null;
  const re = new RegExp(`[?&]${param}=([^&]+)`);
  const m = url.match(re);
  if (!m) return null;
  const raw = m[1];
  // try parse as integer seconds; if it's in mm:ss format, convert
  if (raw.includes(":")) return secondConverter(raw);
  const n = parseInt(raw, 10);
  return Number.isNaN(n) ? null : n;
}

// Handy example of an embedded url: https://www.youtube.com/embed/7wUL_tSqdP0?start=20&end=120
// Likewise, but for one with only an end time: https://www.youtube.com/embed/L202EJPSeYM?end=8
console.log(
  "Test for urlStartEndizer",
  urlStartEndizer("https://www.youtube.com/watch?v=L202EJPSeYM?end=12", "", "")
);

console.log("Test for the particular number condition", !!Number.isInteger(""));
let test_array = ["https://www.youtube.com/watch?v=tLeu22wenlg", 3, ""];

console.log("Array test for urlStartEndizer", urlStartEndizer.apply(null, test_array));
// THIS WORKS! A successful approach to taking in an array as an argument

// --- FIX: Helper function to create a new video object with a unique ID ---
const createNewVideoState = () => ({
  primary_version: "",
  primaryStartTime: "",
  primaryEndTime: "",
  secondaryStartTime: "",
  secondaryEndTime: "",
  secondary_version: "",
  // MANDATORY FIX: Add a unique ID for React list key stability.
  // tempId: Date.now() + Math.random(),
  tempId: crypto.randomUUID(),
});

const initialVideoState = createNewVideoState(); // Base state now includes an ID

// function NewTechniqueForm({
//   primaryAdminSyllabus,
//   secondaryAdminSyllabus,
//   errors = [],
//   onSubmit,
//   onCancel,
//   syllabi,
//   onCategoryChange,
//   onBeltChange
// }) {

// --- HTML/TAILWIND CONVERSION FOR REACT-BOOTSTRAP ELEMENTS ---
const FormElement = ({ children, onSubmit, className = "" }) => (
  <form
    onSubmit={onSubmit}
    className={`space-y-6 p-6 bg-gray-50 rounded-xl shadow-lg ${className}`}
  >
    {children}
  </form>
);

const FormGroup = ({ children, title, description }) => (
  <div className="space-y-2 border-b border-gray-200 pb-4">
    <label className="block text-sm font-medium text-gray-700">
      {typeof title === "string" ? title : title}
    </label>
    {description && <p className="text-xs text-gray-500">{description}</p>}
    {children}
  </div>
);
const FormControl = React.forwardRef(
  (
    {
      name,
      type,
      as = "input",
      placeholder,
      value,
      onChange,
      defaultValue,
      required,
      children,
      ...props
    },
    ref
  ) => {
    const commonClasses =
      "mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";

    // DIAGNOSTIC LOG 4: Check the final value passed to the input element
    console.log(
      `DIAGNOSTIC 4: [FormControl Render] Input Name: ${name}, Received Value: "${value}"`
    );

    if (as === "select") {
      return (
        <select
          name={name}
          className={commonClasses + (name === "belt" ? " appearance-none" : "")}
          // Standardize value fallback for controlled components
          value={value ?? defaultValue ?? ""}
          onChange={onChange}
          required={required}
          {...props}
        >
          {children}
        </select>
      );
    }

    if (as === "textarea") {
      return (
        <textarea
          ref={ref}
          name={name}
          rows={props.rows || 3}
          placeholder={placeholder}
          className={commonClasses}
          // Standardize value fallback for controlled components
          value={value ?? defaultValue ?? ""}
          onChange={onChange}
          required={required}
          {...props}
        />
      );
    }

    // Simplified and standardized finalValue calculation
    const finalValue = value ?? defaultValue ?? ""; // Fallback to empty string if value or defaultValue is null/undefined

    return (
      <input
        ref={ref}
        name={name}
        type={type}
        placeholder={placeholder}
        className={commonClasses}
        value={finalValue}
        onChange={onChange}
        required={required}
        {...props}
      />
    );
  }
);

const AlertComponent = ({ variant, children }) => {
  const colorMap = {
    danger: "bg-red-100 border-red-400 text-red-700",
    success: "bg-green-100 border-green-400 text-green-700",
    info: "bg-blue-100 border-blue-400 text-blue-700",
  };
  return (
    <div className={`border p-4 rounded-md ${colorMap[variant]} mb-4`} role="alert">
      {children}
    </div>
  );
};

function NewTechniqueForm(props) {
  // TODO: Is that the most efficient way to do that?
  // const { primaryAdminSyllabus, secondaryAdminSyllabus, secondarySyllabusTechniques = [], errors = [], onSubmit, onCancel, syllabi } = props;
  // const {
  //   primaryAdminSyllabus,
  //   secondaryAdminSyllabus,
  //   errors = [],
  //   onSubmit,
  //   onCancel,
  //   syllabi
  // } = props;

  const beltsData = props.primaryAdminSyllabus?.belts || props.belts;

  // Use a state for derived belts data (optional, but good practice for mapped lists)
  const [derivedBelts, setDerivedBelts] = React.useState([]);

  // 2. Logic to find the specific belt and map data
  React.useEffect(() => {
    if (!beltsData || !Array.isArray(beltsData)) {
      console.warn("Belt data not available or not an array.");
      return;
    }

    // --- A. Dynamic Mapping Approach (Preferred for a full list) ---
    // This maps ALL belts, calculating text/background colors for each.
    const mappedBelts = beltsData.map((belt) => ({
      id: belt.id,
      name: belt.name,
      color: beltTextColour(belt.id), // Use the utility function
      // Remove all spaces from the fetched colour string
      backgroundColor: belt.colour?.replace(/ +/g, "") || "transparent",
    }));
    // --- B. Specific Lookup Approach (To match original request structure) ---

    // Use .find() to locate the object with ID 7
    const yellowBeltObject = beltsData.find((b) => b.id === 7);

    let yellowBeltConfig = null;

    if (yellowBeltObject) {
      yellowBeltConfig = {
        id: 7,
        name: yellowBeltObject.name,
        color: beltTextColour(7),
        // Safely access the colour property and clean up spaces
        backgroundColor: yellowBeltObject.colour.replace(/ +/g, ""),
      };
    }

    // Set state to use the mapped array (A) or the specific item (B)
    setDerivedBelts(mappedBelts); // Using the full mapped array (A)
    console.log("Derived Belts:", mappedBelts);
    console.log("Specific Yellow Belt Config:", yellowBeltConfig);
  }, [beltsData]); // Re-run if beltsData changes

  // console.log("What is belt", belt);

  console.log("beltsData type:", typeof beltsData, beltsData);

  // const normalizedBeltsData = Array.isArray(beltsData?.data)
  //   ? beltsData.data.map(b => ({
  //       id: Number(b.id), // convert to number just in case it's a string
  //       name: b.attributes?.name || "",
  //       colour: b.attributes?.colour?.trim() || "",
  //     }))
  //   : Array.isArray(beltsData)
  //   ? beltsData.map(b => ({
  //       id: Number(b.id),
  //       name: b.name,
  //       colour: b.colour?.trim() || "",
  //     }))
  //   : [];

  //   const normalizedBeltsData = beltsData.data.map((belt) => ({
  //   id: parseInt(belt.id, 10),
  //   name: belt.attributes.colour, // "Yellow"
  //   colour: belt.attributes.colour, // same, since "colour" is a name string, not a hex value
  //   kyu_number: belt.attributes.kyu_number,
  // }));

  const rawBeltsData = props.primaryAdminSyllabus?.belts || props.belts;

  //     // 1. Define normalizedBeltsData using useMemo for efficient, single-source normalization.
  // const normalizedBeltsData = useMemo(() => {
  //     const data = rawBeltsData;

  //     // 1. Check for JSON:API-like structure (object with a 'data' array and 'attributes')
  //     if (data && Array.isArray(data.data)) {
  //         return data.data.map((belt) => ({
  //             id: Number(belt.id),
  //             // Correctly mapping name from attributes.name, falling back to colour string
  //             name: belt.attributes?.name || belt.attributes?.colour || "Unknown",
  //             // Use the colour string for background color
  //             // colour: belt.attributes?.colour?.trim() || "transparent",
  //             kyu_number: belt.attributes?.kyu_number,
  //         }));
  //     }

  //     // 2. Check for a simple array structure
  //     if (Array.isArray(data)) {
  //          return data.map(b => ({
  //             id: Number(b.id),
  //             name: b.name || b.colour || "Unknown",
  //             colour: b.colour?.trim() || "transparent",
  //             kyu_number: b.kyu_number,
  //         }));
  //     }

  //     // Default to an empty array
  //     return [];
  // }, [rawBeltsData]); // Dependency on the raw prop data

  // --- 1. NORMALIZATION STEP: Clean and extract the color string ---
  const normalizedBeltsData = useMemo(() => {
    const data = rawBeltsData;

    // Helper to process a single belt object
    const processBelt = (beltAttributes) => {
      // Store the raw color string, cleaned up
      const rawColour = beltAttributes.colour?.trim() || "default";

      return {
        id: Number(beltAttributes.id),
        name: beltAttributes.name || rawColour || "Unknown",
        normalizedColourName: rawColour.toLowerCase().replace(/ +/g, ""), // Store a clean color name for Tailwind mapping
        kyu_number: beltAttributes.kyu_number,
      };
    };

    // Check for JSON:API-like structure
    if (data && Array.isArray(data.data)) {
      return data.data.map((belt) =>
        processBelt({
          id: belt.id,
          ...belt.attributes,
        })
      );
    }

    // Check for a simple array structure
    if (Array.isArray(data)) {
      return data.map((b) => processBelt(b));
    }

    // Fallback: JSON:API primary payload with belts in `included`
    if (data && Array.isArray(data.included)) {
      try {
        return data.included
          .filter((res) => res && res.type === "belts")
          .map((beltRes) =>
            processBelt({
              id: beltRes.id,
              ...beltRes.attributes,
            })
          );
      } catch (e) {
        console.warn("[BELT NORMALIZE] Failed to process included belts:", e);
        return [];
      }
    }

    // Default to an empty array
    return [];
  }, [rawBeltsData]); // Dependency on the raw prop data

  console.log("beltsData type:", typeof beltsData, beltsData);
  console.log(
    "normalizedBeltsData type:",
    Array.isArray(normalizedBeltsData) ? "array" : typeof normalizedBeltsData,
    normalizedBeltsData
  );
  console.log("primaryAdminSyllabus.belts:", props.primaryAdminSyllabus?.belts);
  console.log(
    "Object.keys(primaryAdminSyllabus.belts):",
    Object.keys(props.primaryAdminSyllabus?.belts || {})
  );

  const yellowBelt = normalizedBeltsData.find((b) => b.id === 7);

  console.log("What is yellowBelt?", yellowBelt);

  // const belts = [
  //   {
  //     id: 7,
  //     name: yellowBelt?.name || 'Yellow',
  //     color: beltTextColour(7),
  //     backgroundColor: yellowBelt?.colour?.replace(/ +/g, '') || 'transparent'
  //   },
  //   { id: 6, name: 'Orange', color: 'bg-orange-400 text-black' },
  //   { id: 5, name: 'Green', color: 'bg-green-500 text-white' },
  //   { id: 4, name: 'Purple', color: 'bg-purple-500 text-white' },
  //   { id: 3, name: 'Light Blue', color: 'bg-sky-300 text-black' },
  //   { id: 2, name: 'Dark Blue', color: 'bg-blue-900 text-white' },
  //   { id: 1, name: 'Brown', color: 'bg-amber-700 text-white' },
  // ];

  // const belts = normalizedBeltsData.map(b => ({
  //   id: b.id,
  //   name: b.name,
  //   // Calculate text color based on ID using the utility
  //   color: beltTextColour(b.id),
  //   // Use the 'colour' attribute from the normalized data for the background, cleaned of spaces
  //   backgroundColor: b.colour.replace(/ +/g, '') || 'transparent',
  //   kyu_number: b.kyu_number,
  // }));

  // --- 2. FINAL MAPPING STEP: Generate Tailwind classes ---
  const belts = normalizedBeltsData.map((b) => ({
    id: b.id,
    name: b.name,
    // Text color is derived from ID using the existing utility (returns Tailwind text classes like 'text-white')
    color: beltTextColour(b.id),
    // Background color is derived from the normalized name using the new utility (returns Tailwind bg classes like 'bg-yellow-400')
    backgroundColor: colourNameToTailwindBg(b.normalizedColourName),
    kyu_number: b.kyu_number,
  }));

  // Filter out white belt and only allow yellow through brown
  const filteredBelts = belts.filter((b) => {
    const allowed = ["yellow", "orange", "green", "purple", "lightblue", "darkblue", "brown"];
    const normalized = b.name.toLowerCase().replace(/\s+/g, "");
    return allowed.some((c) => normalized.includes(c));
  });

  // const belts = normalizedBeltsData.map(belt => ({
  //   id: belt.id,
  //   name: belt.name,
  //   color: beltTextColour(belt.id),
  //   backgroundColor: belt.colour?.replace(/ +/g, '') || 'transparent'
  // }));

  const [summary, setSummary] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [defaultAttack, setDefaultAttack] = useState("");

  const [videos, setVideos] = useState([{ ...initialVideoState }]);

  const [selectedCategory, setSelectedCategory] = useState(
    categoryOptions.find((opt) => opt.value === "bunkai")
  );

  // Define a safe default belt object ---
  const defaultBelt = {
    id: null,
    name: "Select Grade (Loading Belts...)",
    color: "text-gray-800",
    backgroundColor: "bg-white",
  };

  const [selectedBelt, setSelectedBelt] = useState(filteredBelts[0] || defaultBelt);

  // Use useEffect to select the first belt once the data loads ---
  useEffect(() => {
    // If belts is populated and the current selection is the default/null belt
    if (filteredBelts.length > 0 && selectedBelt.id === null) {
      setSelectedBelt(filteredBelts[0]);
    }
  }, [filteredBelts, selectedBelt.id]); // Dependency on belts array and the current selection's id

  // --- NEW: Preselect belt based on query param from SyllabusShowPage ---
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const kyuParam = params.get("belt_kyu");
      if (kyuParam && filteredBelts.length > 0) {
        const desiredKyu = parseInt(kyuParam, 10);
        const match = filteredBelts.find((b) => Number(b.kyu_number) === desiredKyu);
        if (match) {
          setSelectedBelt(match);
        }
      }
    } catch (e) {
      // ignore URL parsing issues in non-browser contexts
    }
  }, [filteredBelts]);

  // Unified change handlers
  const handleCategoryChange = (val) => {
    setSelectedCategory(val);
    if (props.onCategoryChange) props.onCategoryChange(val); // Accessing prop via props
  };

  const handleGeneralInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "summary") setSummary(value);
    else if (name === "sub_category") setSubCategory(value);
    else if (name === "default_attack") setDefaultAttack(value);
  };

  const handleBeltChange = (val) => {
    setSelectedBelt(val);
    if (props.onBeltChange) props.onBeltChange(val); // Accessing prop via props
  };

  // State holds an ordered array of parts for the difference paragraph
  const [parts, setParts] = useState([
    { type: "text", content: "Start composing your difference paragraph here e.g." },
    { type: "text", content: "\n" },
    { type: "text", content: "Unlike the British syllabus's" },
    { type: "ref", techniqueId: 1 },
    {
      type: "text",
      content: ", the Canadian throw is simpler and focuses on the hip rotation whereas",
    },
    { type: "text", content: "." },
  ]);

  // Diagnostic Log: Track video state changes
  useEffect(() => {
    console.log(
      "DIAGNOSTIC: VIDEO STATE CHANGED",
      videos.map((v) => ({ id: v.tempId, pv: v.primary_version.substring(0, 10) + "..." }))
    );
  }, [videos]);

  const [newText, setNewText] = useState("");
  const [submitError, setSubmitError] = useState(null);
  const [videoTimeWarnings, setVideoTimeWarnings] = useState([]);
  const [videoTimeInvalid, setVideoTimeInvalid] = useState(false);

  // Validate video start/end times live: if both fields are filled and end <= start, mark invalid
  useEffect(() => {
    const warnings = [];
    for (let i = 0; i < videos.length; i += 1) {
      const item = videos[i] || {};

      // Primary: compute effective start/end from fields or URL params
      let primaryEffectiveStart = null;
      let primaryEffectiveEnd = null;
      if (item.primaryStartTime !== undefined && String(item.primaryStartTime).trim() !== "") {
        primaryEffectiveStart = secondConverter(String(item.primaryStartTime));
      } else if (urlHasStartParam(item.primary_version)) {
        primaryEffectiveStart = parseTimeParamFromUrl(item.primary_version, "start");
      }

      if (item.primaryEndTime !== undefined && String(item.primaryEndTime).trim() !== "") {
        primaryEffectiveEnd = secondConverter(String(item.primaryEndTime));
      } else if (urlHasEndParam(item.primary_version)) {
        primaryEffectiveEnd = parseTimeParamFromUrl(item.primary_version, "end");
      }

      if (primaryEffectiveStart !== null && primaryEffectiveEnd !== null) {
        if (!(primaryEffectiveEnd > primaryEffectiveStart)) {
          warnings.push(
            `Video Pair #${i + 1}: primary end time must be greater than primary start time.`
          );
        }
      }

      // Secondary: compute effective start/end from fields or URL params
      let secondaryEffectiveStart = null;
      let secondaryEffectiveEnd = null;
      if (item.secondaryStartTime !== undefined && String(item.secondaryStartTime).trim() !== "") {
        secondaryEffectiveStart = secondConverter(String(item.secondaryStartTime));
      } else if (urlHasStartParam(item.secondary_version)) {
        secondaryEffectiveStart = parseTimeParamFromUrl(item.secondary_version, "start");
      }

      if (item.secondaryEndTime !== undefined && String(item.secondaryEndTime).trim() !== "") {
        secondaryEffectiveEnd = secondConverter(String(item.secondaryEndTime));
      } else if (urlHasEndParam(item.secondary_version)) {
        secondaryEffectiveEnd = parseTimeParamFromUrl(item.secondary_version, "end");
      }

      if (secondaryEffectiveStart !== null && secondaryEffectiveEnd !== null) {
        if (!(secondaryEffectiveEnd > secondaryEffectiveStart)) {
          warnings.push(
            `Video Pair #${i + 1}: secondary end time must be greater than secondary start time.`
          );
        }
      }
    }

    setVideoTimeWarnings(warnings);
    setVideoTimeInvalid(warnings.length > 0);
  }, [videos]);

  // New State for dynamic insertion
  const [primaryTechniques, setPrimaryTechniques] = useState([]);
  const [secondaryTechniques, setSecondaryTechniques] = useState([]);
  const [techniquesLoading, setTechniquesLoading] = useState(false);
  const [differenceContent, setDifferenceContent] = useState("");
  const [isDifferent, setIsDifferent] = useState(false);
  const [comparedToTechniqueId, setComparedToTechniqueId] = useState(null);

  // --- Technique Reference + Syllabus Context Setup ---

  // Syllabus context (make sure to pass in props.currentSyllabusId if available)
  const [selectedSyllabusId, setSelectedSyllabusId] = useState(
    props.currentSyllabusId || 2 // fallback if not passed
  );

  const currentSyllabusId = selectedSyllabusId;

  // Reference technique selection
  const [newRefId, setNewRefId] = useState(null);

  const differenceSectionRef = useRef(null);

  // --- Inline reference preview (enhancement) ---
  // Converts [[UK 2011 O-goshi]] into a styled clickable span
  // const renderDifferencePreview = (text) => {
  //   if (!text) return "";
  //   return text.replace(
  //     /\[\[(.*?)\]\]/g,
  //     `<span class="tech-ref" style="color: #007bff; cursor: pointer;">$1</span>`
  //   );
  // };

  // Use useMemo to calculate country/year names once
  const { primaryCountryName, secondaryCountryName, primaryYear, secondaryYear } = useMemo(
    () => ({
      primaryCountryName: getCountryAdjective(props.primaryAdminSyllabus?.country || "Canada"), // Accessing prop via props
      secondaryCountryName: getCountryAdjective(props.secondaryAdminSyllabus?.country || "UK"), // Accessing prop via props
      primaryYear: props.primaryAdminSyllabus?.year, // Accessing prop via props
      secondaryYear: props.secondaryAdminSyllabus?.year, // Accessing prop via props
    }),
    [props.primaryAdminSyllabus, props.secondaryAdminSyllabus]
  ); // Accessing prop via props

  // Ref to target the textarea for cursor insertion
  const differenceContentRef = useRef(null);

  // Ref for the top of the page/container, used in scroll-up demonstration
  const formTopRef = useRef(null);

  /**
   * Modified useEffect to handle both scroll-down (isDifferent: true)
   * and scroll-up (isDifferent: false) with a smooth transition delay.
   */
  // useEffect(() => {
  //   // Wait 500ms for any potential animations (like expanding sections or transitions)
  //   const timeout = setTimeout(() => {
  //     if (isDifferent && differenceSectionRef.current) {
  //       // SCROLL DOWN: isDifferent became true, scroll to the difference section
  //       differenceSectionRef.current.scrollIntoView({
  //         behavior: "smooth",
  //         block: "start",
  //       });
  //     } else if (!isDifferent) {
  //       // SCROLL UP: isDifferent became false, scroll to the top section
  //       // We use window.scrollTo(0, 0) as a robust way to scroll to the very top,
  //       // but we can use topRef if the scroll should be contained within a specific element.
  //       if (formTopRef.current) {
  //            formTopRef.current.scrollIntoView({
  //               behavior: "smooth",
  //               block: "start",
  //           });
  //       }
  //       // else {
  //       //      window.scrollTo({
  //       //         top: 0,
  //       //         behavior: "smooth",
  //       //     });
  //       // }
  //     }
  //   }, 500); // 500ms delay

  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip running on initial mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Wait 500ms for any potential animations (like expanding sections or transitions)
    const timeout = setTimeout(() => {
      if (!isDifferent && formTopRef.current) {
        // SCROLL UP: isDifferent became false.

        // --- FIX: Use window.scrollTo with an offset to guarantee scroll UP ---
        const elementTop = formTopRef.current.getBoundingClientRect().top + window.scrollY;

        // TODO: ask testers if the upscrolling animation is janky

        // Scroll the window to a position 50 pixels *above* the element's top edge
        // This ensures an upward scroll, even if the element's top is currently visible.
        window.scrollTo({
          top: elementTop - 50,
          behavior: "smooth",
        });
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timeout);
  }, [isDifferent]);
  //   return () => clearTimeout(timeout);
  // }, [isDifferent]);

  // useEffect to fetch techniques when the primary syllabus prop is loaded

  useEffect(() => {
    //  Add cleanup flag
    let isSubscribed = true;
    if (props.primaryAdminSyllabus && props.primaryAdminSyllabus.id) {
      // Accessing prop via props
      setTechniquesLoading(true);
      Technique.allBySyllabus(props.primaryAdminSyllabus.id) // Accessing prop via props
        .then((response) => {
          const techniques = Array.isArray(response?.data)
            ? response.data.map((item) => ({
                id: item.id,
                ...item.attributes,
              }))
            : Array.isArray(response)
              ? response
              : [];

          console.log("Fetched primary syllabus techniques:", techniques);
          if (isSubscribed) {
            setPrimaryTechniques(techniques);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch primary techniques:", error);
          if (isSubscribed) {
            setPrimaryTechniques([]);
          }
        })
        .finally(() => {
          if (isSubscribed) {
            setTechniquesLoading(false);
          }
        });
    }
    return () => {
      isSubscribed = false;
    }; // Cleanup function
  }, [props.primaryAdminSyllabus]); // Dependency updated to props.primaryAdminSyllabus

  // useEffect to fetch techniques when the secondary syllabus prop is loaded
  useEffect(() => {
    // Add cleanup flag
    let isSubscribed = true;
    if (props.secondaryAdminSyllabus && props.secondaryAdminSyllabus.id) {
      // Accessing prop via props
      setTechniquesLoading(true);
      Technique.allBySyllabus(props.secondaryAdminSyllabus.id) // Accessing prop via props
        .then((response) => {
          const techniques = Array.isArray(response?.data)
            ? response.data.map((item) => ({
                id: item.id,
                ...item.attributes,
              }))
            : Array.isArray(response)
              ? response
              : [];

          console.log("Fetched secondary syllabus techniques:", techniques);
          if (isSubscribed) {
            setSecondaryTechniques(techniques);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch secondary techniques:", error);
          if (isSubscribed) {
            setSecondaryTechniques([]);
          }
        })
        .finally(() => {
          if (isSubscribed) {
            setTechniquesLoading(false);
          }
        });
    }
    return () => {
      isSubscribed = false;
    }; //  Cleanup function
  }, [props.secondaryAdminSyllabus]); // Dependency updated to props.secondaryAdminSyllabus

  // const primaryCountryName = getCountryAdjective(primaryAdminSyllabus?.country || 'Canada');
  // const secondaryCountryName = getCountryAdjective(secondaryAdminSyllabus?.country || 'UK');
  // const primaryYear = props.primaryAdminSyllabus?.year;
  // const secondaryYear = props.secondaryAdminSyllabus?.year;

  console.log("What is secondaryYear?", secondaryYear);

  const handleDifferenceSelection = (event) => {
    const selectedId = event.target.value; // This is now the technique ID

    // 1. Store the ID (for the parent component to use in the API call)
    setComparedToTechniqueId(selectedId);

    // Don't proceed if the user selects the default option or clears the selection
    if (!selectedId || selectedId === "") {
      setComparedToTechniqueId(null); // Clear ID if default is selected
      return;
    }

    // 2. Find the selected technique object to get its summary
    // The ID is now correctly in selectedId
    const selectedTech = secondaryTechniques.find((tech) => String(tech.id) === String(selectedId));

    if (!selectedTech) return; // Should not happen with corrected option values

    const selectedTechniqueSummary = selectedTech.summary;

    // Create the formatted string for insertion, including year for context
    const textToInsert = `[Compared to ${secondaryCountryName} ${secondaryYear}'s "${selectedTechniqueSummary}"]: `;

    const textarea = differenceContentRef.current;
    if (!textarea) return;

    // Prepend the new content
    const newContent = textToInsert + differenceContent;

    // 3. Update the state
    setDifferenceContent(newContent);

    // Focus the textarea and set the cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      // The new cursor position is right after the inserted text
      textarea.selectionStart = textarea.selectionEnd = textToInsert.length;
    }, 0);
  };

  // let truncatedVideos = JSON.stringify(videos).split(":").join(" : ").split(",").join(" , ").split('l"').join("l ").slice(3, -2);
  // let primaryVideo = truncatedVideos.substr(0, truncatedVideos.indexOf(","))
  // let secondaryVideo = truncatedVideos.substr(truncatedVideos.indexOf("b"))    // Try to make these videos display on new lines for e.g. half width page, and correctly output for multiple entries

  console.log("NEW TECHNIQUE FORM: props.syllabi received:", props.syllabi);
  console.log("These are the props on NewTechniqueForm", props);

  // // handle input change
  // const handleInputChange = (e, index) => {
  //   const { name, value } = e.target;

  //   // DIAGNOSTIC LOG 1: Check what the handler captures
  //   console.log(`DIAGNOSTIC 1: [handleInputChange] Index: ${index}, Name: ${name}, New Value: "${value}" (Length: ${value.length})`);

  //   // 1. Create a shallow copy of the array
  //   const list = [...videos];

  //   // 2. IMMUTABILITY FIX: Create a brand new object for the video being updated
  //   list[index] = {
  //     ...list[index], // Copy all existing properties from the old object
  //     [name]: value,  // Overwrite the specific property that changed
  //   };

  //   // 3. Update the state with the new array reference containing the new object reference
  //   setVideos(list);
  //   // DIAGNOSTIC LOG 2: Check the new array before state update
  //   console.log("DIAGNOSTIC 2: [handleInputChange] New video object structure:", list[index]);
  // };

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    console.log(`Updating video[${index}].${name} = ${value}`);

    setVideos((prevVideos) => {
      if (!Array.isArray(prevVideos)) return [];
      return prevVideos.map((v, i) => (i === index ? { ...v, [name]: value } : v));
    });
  };

  // handle click event of the Remove button
  const handleRemoveClick = (indexToRemove) => {
    // Use filter to immutably remove the element
    setVideos((prevVideos) => prevVideos.filter((_, index) => index !== indexToRemove));
  };

  // Use the existing secondaryTechniques list as the reference source for comparison
  // const ALL_TECHNIQUES = useMemo(() => {
  //   // This function returns the calculated value
  //   return [
  //     ...(Array.isArray(primaryAdminSyllabus?.techniques) ? primaryAdminSyllabus.techniques : []),
  //     ...(Array.isArray(secondaryTechniques) ? secondaryTechniques : [])
  //   ];
  // }, [primaryAdminSyllabus, secondaryTechniques]); // <--- Dependency Array is required

  const ALL_TECHNIQUES = useMemo(() => {
    const primary = Array.isArray(primaryTechniques) ? primaryTechniques : [];
    const secondary = Array.isArray(secondaryTechniques) ? secondaryTechniques : [];
    return [...primary, ...secondary];
  }, [primaryTechniques, secondaryTechniques]);

  console.log("Do we have all the primary techniques in NewTechniqueForm?", primaryTechniques); // Simplified log
  console.log("What is primaryAdminSyllabus in NewTechniqueForm?", props.primaryAdminSyllabus); // Accessing prop via props
  console.log("Do we have all the secondary techniques in NewTechniqueForm?", secondaryTechniques); // Simplified log
  console.log(
    "Is the technique list going to work to populate them as links in NewTechniqueForm?",
    ALL_TECHNIQUES
  );

  // Helper to fetch a technique object by ID
  // const getTechnique = useCallback(
  //   (id) => {
  //     const all = ALL_TECHNIQUES;
  //     return all.find((t) => t.id === parseInt(id, 10));
  //   }, [ALL_TECHNIQUES]
  // );

  const getTechnique = useCallback(
    (id) => {
      const all = ALL_TECHNIQUES || [];
      const found = all.find((t) => String(t.id) === String(id));
      if (!found) console.warn("Technique not found for ID:", id);
      return found;
    },
    [ALL_TECHNIQUES]
  );

  // --- CORE LOGIC: GENERATE PARAGRAPH for composer editor ---
  const generatedOutput = useMemo(() => {
    let rawString = "";
    let htmlString = "";
    let isDifferentSyllabus = false;

    parts.forEach((part) => {
      if (part.type === "text") {
        rawString += part.content;
        htmlString += part.content;
      } else if (part.type === "ref") {
        const tech = getTechnique(part.techniqueId);
        if (!tech) return;

        const techniqueDisplayName = tech.summary;

        // 1. Check if the syllabus is different
        isDifferentSyllabus = tech.syllabus !== currentSyllabusId;
        const display = `${techniqueDisplayName} (${tech.syllabusName})`;

        // 2. Build the output
        if (isDifferentSyllabus) {
          // If different, make it a clickable anchor tag
          // NOTE: The 'href' would link to the technique's detail page
          htmlString += `<a href="/techniques/${tech.id}" class="text-blue-600 hover:text-blue-800 font-semibold underline transition duration-150">${techniqueDisplayName}</a>`;
        } else {
          // If same syllabus, just render the name (no link)
          htmlString += `<span class="font-medium text-gray-700">${techniqueDisplayName}</span>`;
        }

        // Raw string includes the syllabus info for reference/debugging
        rawString += `[[${display}]]`;
      }
    });

    return { rawString, htmlString };
  }, [parts, currentSyllabusId, getTechnique]);

  // --- EDITOR FUNCTIONS ---
  const handleAddPart = (type) => {
    if (type === "text" && newText.trim()) {
      setParts([...parts, { type: "text", content: newText }]);
      setNewText("");
    } else if (type === "ref") {
      const tech = getTechnique(newRefId);
      if (tech) {
        setParts([...parts, { type: "ref", techniqueId: newRefId }]);
      }
    }
  };

  const handleDeletePart = (index) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const handleUpdateText = (indexToUpdate, value) => {
    setParts((prevParts) =>
      prevParts.map((part, i) => (i === indexToUpdate ? { ...part, content: value } : part))
    );
  };

  const handleUpdateRef = (indexToUpdate, id) => {
    setParts((prevParts) =>
      prevParts.map((part, i) => (i === indexToUpdate ? { ...part, techniqueId: id } : part))
    );
  };

  const renderPartEditor = (part, index) => (
    <div
      key={index}
      className="flex items-center space-x-2 p-2 bg-gray-50 border border-gray-200 rounded-lg"
    >
      {part.type === "text" ? (
        <>
          <Type size={18} className="text-gray-500 flex-shrink-0" />
          <input
            type="text"
            value={part.content}
            onChange={(e) => handleUpdateText(index, e.target.value)}
            className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            placeholder="Enter text..."
          />
        </>
      ) : (
        <>
          <LinkIcon size={18} className="text-blue-500 flex-shrink-0" />
          <select
            value={part.techniqueId}
            onChange={(e) => handleUpdateRef(index, e.target.value)}
            className="flex-grow p-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            {ALL_TECHNIQUES.map((tech) => (
              <option key={tech.id} value={tech.id}>
                {tech.summary} ({tech.technique_type?.category})
              </option>
            ))}
          </select>
        </>
      )}
      <button
        type="button"
        onClick={() => handleDeletePart(index)}
        className="p-2 text-red-500 hover:bg-red-100 rounded-full transition"
        title="Delete part"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );

  // Handle click event of the Add button
  // const handleAddClick = () => {
  //   setVideos([...videos, createNewVideoState()]);
  // };

  const handleAddClick = () => {
    const newVideo = {
      tempId: crypto.randomUUID(),
      primary_version: "",
      primaryStartTime: "",
      primaryEndTime: "",
      secondary_version: "",
      secondaryStartTime: "",
      secondaryEndTime: "",
    };
    setVideos([...videos, newVideo]);
  };

  // function to handle the submission for an event
  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      const { currentTarget } = event;
      const formData = new FormData(currentTarget);

      // Get the ID of the syllabus the technique is being created for
      const targetSyllabusId = formData.get("syllabus_id");

      // 1. Find the full syllabus object corresponding to the selected ID
      const targetSyllabus = props.syllabi.find((s) => String(s.id) === targetSyllabusId); // Accessing prop via props

      // 2. Determine the correct country and year from the *selected* syllabus for the primary video
      // These are used to correctly tag the video records in the database.
      const selectedSyllabusCountry = targetSyllabus?.country || "Canada";
      const selectedSyllabusYear = targetSyllabus?.year || new Date().getFullYear();

      // The secondary country/year still refers to the fixed secondary admin syllabus for comparison videos
      const secondaryCountry = props.secondaryAdminSyllabus?.country || "UK"; // Accessing prop via props
      const secondaryYear = props.secondaryAdminSyllabus?.year || new Date().getFullYear(); // Accessing prop via props

      // Clear previous submit errors
      setSubmitError(null);

      // Validate video start/end times: use effective values from fields or embedded URL params
      for (let i = 0; i < videos.length; i += 1) {
        const item = videos[i] || {};

        // Primary
        let primaryEffectiveStart = null;
        let primaryEffectiveEnd = null;
        if (item.primaryStartTime !== undefined && String(item.primaryStartTime).trim() !== "") {
          primaryEffectiveStart = secondConverter(String(item.primaryStartTime));
        } else if (urlHasStartParam(item.primary_version)) {
          primaryEffectiveStart = parseTimeParamFromUrl(item.primary_version, "start");
        }

        if (item.primaryEndTime !== undefined && String(item.primaryEndTime).trim() !== "") {
          primaryEffectiveEnd = secondConverter(String(item.primaryEndTime));
        } else if (urlHasEndParam(item.primary_version)) {
          primaryEffectiveEnd = parseTimeParamFromUrl(item.primary_version, "end");
        }

        if (primaryEffectiveStart !== null && primaryEffectiveEnd !== null) {
          if (!(primaryEffectiveEnd > primaryEffectiveStart)) {
            setSubmitError(
              `Video Pair #${i + 1}: primary end time must be greater than primary start time.`
            );
            return;
          }
        }

        // Secondary
        let secondaryEffectiveStart = null;
        let secondaryEffectiveEnd = null;
        if (
          item.secondaryStartTime !== undefined &&
          String(item.secondaryStartTime).trim() !== ""
        ) {
          secondaryEffectiveStart = secondConverter(String(item.secondaryStartTime));
        } else if (urlHasStartParam(item.secondary_version)) {
          secondaryEffectiveStart = parseTimeParamFromUrl(item.secondary_version, "start");
        }

        if (item.secondaryEndTime !== undefined && String(item.secondaryEndTime).trim() !== "") {
          secondaryEffectiveEnd = secondConverter(String(item.secondaryEndTime));
        } else if (urlHasEndParam(item.secondary_version)) {
          secondaryEffectiveEnd = parseTimeParamFromUrl(item.secondary_version, "end");
        }

        if (secondaryEffectiveStart !== null && secondaryEffectiveEnd !== null) {
          if (!(secondaryEffectiveEnd > secondaryEffectiveStart)) {
            setSubmitError(
              `Video Pair #${i + 1}: secondary end time must be greater than secondary start time.`
            );
            return;
          }
        }
      }

      // video conversion: This now uses flatMap to transform the array of (primary_version, secondary_version) objects
      // into a flattened array of correctly formatted video objects (url, country, year) for the Rails backend.
      const flatVideosToSubmit = videos.flatMap((item) => {
        const videoRecords = [];

        // 1. Encode URLs based on start/end times
        const primaryUrl = urlStartEndizer(
          item.primary_version,
          item.primaryStartTime,
          item.primaryEndTime
        );
        const secondaryUrl = urlStartEndizer(
          item.secondary_version,
          item.secondaryStartTime,
          item.secondaryEndTime
        );

        // 2. Create the Primary Video Record (for the server)
        if (primaryUrl) {
          videoRecords.push({
            url: primaryUrl,
            country: selectedSyllabusCountry,
            year: selectedSyllabusYear, // Use current year as a placeholder. This might eventually come from the syllabus or be manually set.
          });
        }

        // 3. Create the Secondary Video Record (for the server)
        if (secondaryUrl) {
          videoRecords.push({
            url: secondaryUrl,
            country: secondaryCountry,
            year: secondaryYear,
          });
        }

        // flatMap flattens the resulting array of arrays into a single array
        return videoRecords;
      });
      // End of video conversion logic

      setVideos([createNewVideoState()]);

      // Final object to be submitted
      const payload = {
        syllabus_id: formData.get("syllabus_id"),
        belt: parseInt(formData.get("belt"), 10), // Ensure belt is an integer, not a string
        summary: formData.get("summary"),
        category: formData.get("category"),
        sub_category: formData.get("sub_category"),
        default_attack: formData.get("default_attack"),
        videos: flatVideosToSubmit,
        is_different: formData.get("is_different") === "true",
        difference_content: differenceContent, // Controlled state
        composed_paragraph_parts: parts, // Submit the structured parts
        compared_to_technique_id: comparedToTechniqueId,
      };

      try {
        await props.onSubmit(payload);
        // Flag the belt section to scroll to upon returning to SyllabusShowPage
        try {
          if (selectedBelt && selectedBelt.kyu_number != null) {
            localStorage.setItem("scroll_to_belt_kyu", String(selectedBelt.kyu_number));
            // Also set the hash anchor to assist router-driven navigation
            try {
              window.location.hash = `belt-kyu-${selectedBelt.kyu_number}`;
            } catch {}
          }
        } catch (e) {
          console.warn("[SCROLL FLAG DEBUG] Unable to set scroll_to_belt_kyu:", e);
        }
        // optional: success notification
      } catch (error) {
        console.error("Form submission failed:", error);
        setSubmitError(error.message || "Failed to submit technique.");
      } finally {
        // Always reset even if it fails; Clear difference specific states after submission
        setDifferenceContent("");
        setComparedToTechniqueId(null);
        setParts([{ type: "text", content: "Unlike the " }]); // Reset composer
      }
    },
    [
      videos,
      differenceContent,
      parts,
      comparedToTechniqueId,
      props.syllabi,
      props.onSubmit,
      props.secondaryAdminSyllabus,
    ]
  );

  //   const FormControl = React.forwardRef(({ name, type, as = 'input', placeholder, value, onChange, defaultValue, required, children, ...props }, ref) => {
  //   const commonClasses = "mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";

  //   if (as === 'select') {
  //     return (
  //       <select
  //         name={name}
  //         className={commonClasses + (name === 'belt' ? ' appearance-none' : '')}
  //         value={value} // Use value for controlled components
  //         onChange={onChange}
  //         required={required}
  //         ref={ref}
  //         {...props}
  //       >
  //         {children}
  //       </select>
  //     );
  //   }

  //   if (as === 'textarea') {
  //     return (
  //       <textarea
  //         name={name}
  //         rows={props.rows || 3}
  //         placeholder={placeholder}
  //         className={commonClasses}
  //         value={value}
  //         onChange={onChange}
  //         ref={ref} // Ref passed correctly here
  //         required={required}
  //       />
  //     );
  //   }

  //   return (
  //     <input
  //       name={name}
  //       type={type}
  //       placeholder={placeholder}
  //       className={commonClasses}
  //       value={value}
  //       onChange={onChange}
  //       defaultValue={defaultValue}
  //       required={required}
  //       ref={ref}
  //       {...props}
  //     />
  //   );
  // });

  console.log(
    "RENDER CHECK: videos state snapshot",
    videos.map((v) => ({
      id: v.tempId,
      pv: v.primary_version,
    }))
  );

  return (
    <div className="max-w-4xl mx-auto">
      <FormElement onSubmit={handleSubmit}>
        <h1 id="top-label" className="text-3xl font-bold text-gray-800 mb-4 border-b pb-2">
          Input New Technique
        </h1>

        {/* Removed top error block; errors will render above the submit button */}

        <FormGroup title="Syllabus associated with the technique">
          <FormControl
            name="syllabus_id"
            as="select"
            defaultValue={props.primaryAdminSyllabus?.id || props.syllabi[0]?.id || ""}
            onChange={(e) => setSelectedSyllabusId(e.target.value)}
          >
            {props.syllabi && props.syllabi.length > 0 ? (
              props.syllabi.map((syllabus) => {
                const capitalizedCountry =
                  syllabus.country.charAt(0).toUpperCase() + syllabus.country.slice(1);
                return (
                  <option key={syllabus.id} value={syllabus.id}>
                    {capitalizedCountry} {syllabus.year}
                  </option>
                );
              })
            ) : (
              <option value="" disabled>
                Loading Syllabi...
              </option>
            )}
          </FormControl>
        </FormGroup>

        <FormGroup title="Name of the technique">
          <FormControl
            name="summary"
            type="text"
            placeholder="E.g. O-goshi"
            required={true}
            value={summary}
            onChange={handleGeneralInputChange}
          />
        </FormGroup>

        <FormGroup title="Grade">
          <div className="w-128">
            <input type="hidden" name="belt" value={selectedBelt.id} />
            <Listbox value={selectedBelt} onChange={setSelectedBelt}>
              <div className="relative mt-1">
                <ListboxButton
                  className={`relative w-full cursor-pointer rounded-lg py-3 pl-3 pr-10 text-left shadow-md ${selectedBelt.color} ${selectedBelt.backgroundColor}`}
                >
                  <span className="block truncate font-medium">{selectedBelt.name}</span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronDown className="h-5 w-5 text-gray-800" aria-hidden="true" />
                  </span>
                </ListboxButton>
                <ListboxOptions className="absolute z-30 mt-1 max-h-96 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                  {filteredBelts.map((belt) => (
                    <ListboxOption
                      key={belt.id}
                      value={belt}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-3 pl-10 pr-4 transition-all duration-150 ${
                          active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate rounded-md px-2 py-1 ${belt.color} ${belt.backgroundColor} ${
                              selected ? "font-bold opacity-100" : "opacity-50 font-normal"
                            }`}
                          >
                            {belt.name}
                          </span>
                          {selected && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          )}
                        </>
                      )}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </div>
            </Listbox>
          </div>
        </FormGroup>

        {/* TODO: Add bold-and-dim effect to other dropdowns */}

        <FormGroup title="Category of technique">
          <div className="w-full">
            {/* <label className="block text-sm font-medium text-gray-700 mb-1">
              Category of technique
            </label> */}

            {/* TODO: Should these be in italics, or not? */}
            <Listbox
              value={selectedCategory?.value}
              onChange={handleCategoryChange} // onChange receives the selected object
            >
              <div className="relative mt-1">
                <ListboxButton className="relative w-full cursor-pointer rounded-lg bg-white py-3 pl-3 pr-10 text-left shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <span className="block truncate text-gray-800">
                    {selectedCategory.displayText}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </span>
                </ListboxButton>
                <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                  {categoryOptions.map((category) => (
                    <ListboxOption
                      key={category.value}
                      value={category}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                          active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate ${
                              selected ? "font-semibold" : "font-normal"
                            }`}
                          >
                            {category.displayText}
                          </span>
                          {selected && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          )}
                        </>
                      )}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </div>
            </Listbox>
            <input type="hidden" name="category" value={selectedCategory?.value || ""} />
          </div>
        </FormGroup>

        <FormGroup title="Sub Category">
          <FormControl
            name="sub_category"
            type="text"
            placeholder="Can be blank if none comes to mind."
            value={subCategory}
            onChange={handleGeneralInputChange}
          />
        </FormGroup>

        <FormGroup
          title="Default Attack (Optional)"
          description="E.g. Lapel Grab & hook punch, wrist grab etc. (Required for testing/assessment for certain techniques, but grades should be proficient against a variety of attacks regardless)"
        >
          <FormControl
            name="default_attack"
            type="text"
            value={defaultAttack}
            onChange={handleGeneralInputChange}
          />
        </FormGroup>

        <div className="space-y-8 p-4 border border-indigo-200 rounded-lg bg-white shadow-inner">
          <h3 className="text-xl font-semibold text-indigo-700">
            Video References ({primaryCountryName} vs. {secondaryCountryName})
          </h3>
          {/* TODO: <p> tags have a warning symbol which was used for another component, but shouldn't be used for the ones on this page, find a way to split those concerns */}
          <p className="text-sm text-gray-600">
            Note: if you just want to show a segment of a video, you can optionally include the
            start and end time for that segment.
          </p>
          <p className="text-sm text-gray-600">
            Note: To show a segment, include the start and end time in seconds or min:sec format.
          </p>

          {videos.map((video, index) => {
            // DIAGNOSTIC LOG 3: Check value passed to controlled component before rendering
            console.log(
              `DIAGNOSTIC 3: [Video Field Map ${index}] primary_version value: "${video.primary_version}"`
            );

            const encodedPrimaryUrl = urlStartEndizer(
              video.primary_version,
              video.primaryStartTime,
              video.primaryEndTime
            );
            const encodedSecondaryUrl = urlStartEndizer(
              video.secondary_version,
              video.secondaryStartTime,
              video.secondaryEndTime
            );

            // Use the stable video.tempId as the key ---
            return (
              <div
                key={video.tempId}
                className="space-y-4 p-4 border border-gray-200 rounded-lg relative bg-white"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-700">Video Pair #{index + 1}</h4>
                  {videos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveClick(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition"
                      title="Remove Video Pair"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>

                {/* Primary Video */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-l-4 border-indigo-500 pl-4">
                  {/* <FormGroup title={`${primaryCountryName} Primary URL <div>(provide if available)</div> \n`}> */}
                  <FormGroup
                    title={
                      <>
                        {primaryCountryName} Primary URL
                        <div className="text-gray-500 text-sm">(provide if available)</div>
                      </>
                    }
                  >
                    <FormControl
                      name="primary_version"
                      value={video.primary_version}
                      type="text"
                      placeholder="YouTube URL"
                      onChange={(e) => handleInputChange(e, index)}
                    />
                  </FormGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <FormGroup
                      title={
                        <>
                          Start Time
                          <div className="text-gray-500 text-sm">(either min:sec or sec)</div>
                        </>
                      }
                    >
                      <FormControl
                        name="primaryStartTime"
                        value={video.primaryStartTime}
                        type="text"
                        placeholder="E.g. 2:52 or 210"
                        onChange={(e) => handleInputChange(e, index)}
                        disabled={urlHasStartParam(video.primary_version)}
                      />
                      {urlHasStartParam(video.primary_version) && (
                        <div className="text-xs text-gray-500 mt-1">
                          Start disabled — time already present in the provided URL.
                        </div>
                      )}
                    </FormGroup>

                    <FormGroup
                      title={
                        <>
                          End Time
                          <div className="text-gray-500 text-sm">(either min:sec or sec)</div>
                        </>
                      }
                    >
                      <FormControl
                        name="primaryEndTime"
                        value={video.primaryEndTime}
                        type="text"
                        placeholder="E.g. 2:52 or 210"
                        onChange={(e) => handleInputChange(e, index)}
                        disabled={urlHasEndParam(video.primary_version)}
                      />
                      {urlHasEndParam(video.primary_version) && (
                        <div className="text-xs text-gray-500 mt-1">
                          End disabled — time already present in the provided URL.
                        </div>
                      )}
                    </FormGroup>
                  </div>
                  {video.primary_version && (
                    <div className="md:col-span-2 p-3 bg-indigo-50 border border-indigo-300 rounded-lg text-xs text-indigo-800 break-words font-mono shadow-inner">
                      <span className="font-bold">
                        Encoded URL ({primaryCountryName} {primaryYear}):
                      </span>{" "}
                      <a
                        href={encodedPrimaryUrl} // TODO: These URLs are obviously not technique URLs but the frontend seems to think they are. Ensure they go to the YouTube links instead, in a new tab
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        {encodedPrimaryUrl}
                      </a>
                    </div>
                  )}
                </div>

                {/* Secondary Video */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-l-4 border-gray-500 pl-4 pt-4 mt-4 border-t border-dashed">
                  <FormGroup
                    title={
                      <>
                        {secondaryCountryName} Comparison URL
                        <div className="text-gray-500 text-sm">(Optional)</div>
                      </>
                    }
                  >
                    <FormControl
                      name="secondary_version"
                      value={video.secondary_version}
                      type="text"
                      placeholder="YouTube URL"
                      onChange={(e) => handleInputChange(e, index)}
                    />
                  </FormGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <FormGroup
                      title={
                        <>
                          Start Time
                          <div className="text-gray-500 text-sm">(either min:sec or sec)</div>
                        </>
                      }
                    >
                      <FormControl
                        name="secondaryStartTime"
                        value={video.secondaryStartTime}
                        type="text"
                        placeholder="E.g. 0:31 or 46"
                        onChange={(e) => handleInputChange(e, index)}
                        disabled={urlHasStartParam(video.secondary_version)}
                      />
                      {urlHasStartParam(video.secondary_version) && (
                        <div className="text-xs text-gray-500 mt-1">
                          Start disabled — time already present in the provided URL.
                        </div>
                      )}
                    </FormGroup>
                    <FormGroup
                      title={
                        <>
                          End Time
                          <div className="text-gray-500 text-sm">(either min:sec or sec)</div>
                        </>
                      }
                    >
                      <FormControl
                        name="secondaryEndTime"
                        value={video.secondaryEndTime}
                        type="text"
                        placeholder="E.g. 7:02 or 307"
                        onChange={(e) => handleInputChange(e, index)}
                        disabled={urlHasEndParam(video.secondary_version)}
                      />
                      {urlHasEndParam(video.secondary_version) && (
                        <div className="text-xs text-gray-500 mt-1">
                          End disabled — time already present in the provided URL.
                        </div>
                      )}
                    </FormGroup>
                  </div>
                  {video.secondary_version && (
                    <div className="md:col-span-2 p-3 bg-gray-100 border border-gray-300 rounded-lg text-xs text-gray-800 break-words font-mono shadow-inner">
                      <span className="font-bold">
                        Encoded URL ({secondaryCountryName} {secondaryYear}):
                      </span>{" "}
                      <a
                        href={encodedSecondaryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:underline"
                      >
                        {encodedSecondaryUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="flex justify-center mt-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleAddClick}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition"
            >
              <Plus size={18} /> <span>Add Another Video Pair</span>
            </button>
          </div>
        </div>

        {/* TODO NOTE: will keep the below until the replacements are verified as fully functional */}
        {/* Note: try to italicise options */}
        {/* <React.Fragment key="grade-section">
        <Form.Group controlId="formBasicGrade">
            <Form.Label>Grade</Form.Label>
            <Form.Control className="color-belt" name = "belt" type="belt" as="select" defaultValue={7}>
              {/* Note: setting defaultValue = 7 in the above means the technique type will default to 7. Is there a different way of setting a default value for this form? */}
        {/* <option className="gradecoloroption" style={{backgroundColor:"yellow"}} value={7} >Yellow </option> */}
        {/* <option className="gradecoloroption" style={{backgroundColor:"orange"}} value={6}>Orange</option> */}
        {/* <option className="gradecoloroption" style={{backgroundColor:"green"}} value={5}>Green</option> */}
        {/* <option className="gradecoloroption" style={{backgroundColor:"purple"}} value={4}>Purple</option> */}
        {/* <option className="gradecoloroption" style={{backgroundColor:"#add8e6", color:"black"}} value={3}>Light Blue</option> */}
        {/* <option className="gradecoloroption" style={{backgroundColor:"#00008b"}} value={2}>Dark Blue </option> */}
        {/* <option className="gradecoloroption" style={{backgroundColor:"#b5651d"}} value={1}>Brown</option> */}
        {/* {console.log("This is the grade we're trying to use", value)} */}
        {/* </Form.Control> */}
        {/* </Form.Group> */}
        {/* </React.Fragment> */}

        {/* <Form.Group controlId="formBasicDifferenceCheck">
          <Form.Label>Is this technique different, or separate, from the {secondaryCountryName} syllabus?</Form.Label>
          <Form.Control name = "is_different" type="is_different" as="select">
                <option value={false}>Please select </option>
                <option value={false}>No </option>
                <option value={true}>Yes </option>
            </Form.Control>        
        </Form.Group> */}
        {/* <React.Fragment key="difference-section"> */}
        {/* <div className="border border-purple-200 p-6 rounded-xl bg-white shadow-lg space-y-6" ref={formTopRef}>
         */}
        <div
          ref={formTopRef}
          key="difference-section-container"
          className="border border-purple-200 p-6 rounded-xl bg-white shadow-lg space-y-6"
        >
          <FormGroup
            title={`Is this technique different from an equivalent on the ${secondaryYear || "(loading...)"} ${secondaryCountryName} syllabus?`}
          >
            {/* TODO: Consider changing "undefined" to something like loading */}
            <FormControl
              name="is_different"
              as="select"
              value={String(isDifferent)}
              onChange={(e) => setIsDifferent(e.target.value === "true")}
            >
              <option value="false">No (It is the same) </option>
              <option value="true">
                Yes (It differs from the version in the {secondaryCountryName} syllabus or doesn't
                exist there){" "}
              </option>
            </FormControl>
          </FormGroup>
          {/* <Form.Group controlId="formBasicDifferenceContent">
          <Form.Label>If yes, describe the differences here</Form.Label>
          <Form.Control name = "difference_content" as="textarea" rows={3} placeholder="E.g. transitions aren't present for the UK 2011 syllabus"/>
        </Form.Group> */}
          <AnimatePresence>
            {isDifferent && (
              <motion.div
                key="difference-section"
                ref={differenceSectionRef}
                initial={{ opacity: 0, height: 0 }}
                animate={isDifferent ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                onAnimationComplete={() => {
                  if (isDifferent) {
                    // Scroll *down* to the section heading to keep context clear
                    if (formTopRef.current) {
                      const elementTop =
                        formTopRef.current.getBoundingClientRect().top + window.scrollY;
                      window.scrollTo({
                        top: elementTop,
                        behavior: "smooth",
                      });
                    }
                  } else {
                    // Scroll *up* to the top of the form
                    formTopRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
                className="overflow-hidden"
              >
                {/* Use the preferredDifferenceEditorMode prop to conditionally render the editor view */}
                {props.preferredDifferenceEditorMode === "standard" && (
                  // --- Standard Editor Block: Reference Selector + Free Text Area ---
                  <>
                    {/* <Form.Group controlId="formTechniqueInsert" className="mt-3 mb-3" w-full> */}
                    <div className="mt-3 mb-3 w-full">
                      <Form.Label>
                        Reference a Technique from the {secondaryCountryName} Syllabus
                      </Form.Label>
                      <div className="relative w-full" style={{ width: "100%" }}>
                        <Form.Control
                          as="select"
                          style={{ width: "100%" }}
                          onChange={handleDifferenceSelection}
                          disabled={techniquesLoading || secondaryTechniques.length === 0}
                          defaultValue=""
                          value={comparedToTechniqueId || ""}
                          // className="!w-full appearance-none pr-8"
                          className="block w-full !w-full min-w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-sm"
                        >
                          <option value="" disabled>
                            {techniquesLoading
                              ? "Loading secondary techniques..."
                              : secondaryTechniques.length > 0
                                ? "Click to insert a technique summary into the box below"
                                : `No techniques found for the ${secondaryCountryName} syllabus`}
                          </option>
                          {secondaryTechniques.map((tech) => (
                            <option key={tech.id} value={tech.id}>
                              {tech.summary}
                            </option>
                          ))}
                        </Form.Control>
                        <ChevronDown
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                          size={18}
                        />
                      </div>
                      {/* </Form.Group> */}
                    </div>

                    <FormGroup title="Difference Description (Free Text)">
                      <FormControl
                        name="difference_content"
                        as="textarea"
                        rows={5}
                        placeholder={`Start your description here. The selection above will prepend a comparison statement if chosen.`}
                        value={differenceContent}
                        onChange={(e) => setDifferenceContent(e.target.value)}
                        ref={differenceContentRef}
                      />
                    </FormGroup>
                  </>
                )}

                {props.preferredDifferenceEditorMode === "advanced" && (
                  /* --- Composer Editor (Completed Section) --- */
                  <div className="mb-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h2 className="text-xl font-semibold text-purple-800 mb-4 flex items-center space-x-2">
                      <RefreshCcw size={20} /> <span>Compose Structured Difference Paragraph</span>
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                      Use this editor to build a paragraph from text fragments and linked technique
                      references.
                    </p>

                    {/* Part Editor List */}
                    <div className="space-y-3">{parts.map(renderPartEditor)}</div>

                    {/* Add New Part Controls */}
                    <div className="pt-4 border-t border-gray-200 space-y-3 mt-4">
                      <h3 className="text-lg font-medium text-gray-700">Add New Part</h3>

                      {/* Add Text Part */}
                      <div className="flex items-stretch space-x-2">
                        <input
                          type="text"
                          value={newText}
                          onChange={(e) => setNewText(e.target.value)}
                          className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          placeholder="Enter new text part..."
                        />
                        <button
                          type="button"
                          onClick={() => handleAddPart("text")}
                          disabled={!newText.trim()}
                          className="flex-shrink-0 p-3 bg-green-500 text-white rounded-r-lg hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center"
                          title="Add Text"
                        >
                          <Plus size={18} />
                        </button>
                      </div>

                      {/* Add Reference Part */}
                      <div className="flex items-stretch space-x-2">
                        <select
                          value={newRefId || ""}
                          onChange={(e) => setNewRefId(e.target.value)}
                          className="flex-grow p-3 border border-gray-300 rounded-l-lg bg-white focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                          <option value="" disabled>
                            Select technique to reference...
                          </option>
                          {ALL_TECHNIQUES.map((tech) => (
                            <option key={`new-ref-${tech.id}`} value={tech.id}>
                              {tech.summary} ({tech.technique_type?.category})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleAddPart("ref")}
                          disabled={!newRefId}
                          className="flex-shrink-0 p-3 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition disabled:opacity-50 flex items-center justify-center"
                          title="Add Reference"
                        >
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Output Preview */}
                    <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg shadow-inner">
                      <h3 className="text-md font-semibold text-yellow-800 mb-2">
                        Final Paragraph Preview:
                      </h3>
                      <p
                        className="text-gray-900 leading-relaxed text-sm italic"
                        // Using dangerouslySetInnerHTML to render the styled link tags
                        dangerouslySetInnerHTML={{ __html: generatedOutput.htmlString }}
                      />
                      <p className="mt-3 text-xs text-yellow-700 font-mono break-words">
                        (Raw Data: {generatedOutput.rawString})
                      </p>
                    </div>
                  </div>
                  /* End Composer Editor */
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Validation Errors (rendered above the final submit button) */}
        {videoTimeInvalid && (
          <div className="mt-6 pt-4 border-t border-red-200">
            <AlertComponent variant="danger">
              <span className="font-bold">Video time validation</span> — please fix the following:
              <ul className="list-disc ml-5 mt-2">
                {videoTimeWarnings.map((msg, idx) => (
                  <li key={`vtw-${idx}`}>{msg}</li>
                ))}
              </ul>
            </AlertComponent>
          </div>
        )}
        {Array.isArray(props.errors) && props.errors.length > 0 && (
          <div className="mt-6 pt-4 border-t border-red-200">
            <AlertComponent variant="danger">
              <span className="font-bold">Validation errors</span> — please fix the following:
              <ul className="list-disc ml-5 mt-2">
                {props.errors.map((error, index) => {
                  const text =
                    error.message ||
                    error.msg ||
                    error.detail ||
                    error.error ||
                    (typeof error === "string" ? error : JSON.stringify(error));
                  return <li key={`err-${index}`}>{text}</li>;
                })}
              </ul>
            </AlertComponent>
          </div>
        )}

        {/* Final Submit and Cancel Buttons */}
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={props.onCancel}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 bg-white text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition"
          >
            <Trash2 size={18} /> <span>Cancel</span>
          </button>
          <button
            type="submit"
            disabled={videoTimeInvalid}
            className={`flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition ${
              videoTimeInvalid ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title={videoTimeInvalid ? "Fix video start/end times to enable submit" : undefined}
          >
            <Plus size={18} /> <span>Create Technique</span>
            {/* TODO: add validation to say "currently, non-Youtube URLs are not supported" until such time as they are (if indeed they ever are)*/}
          </button>
        </div>
      </FormElement>
    </div>
  );
}

export default NewTechniqueForm;
