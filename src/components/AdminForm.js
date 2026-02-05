import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { User } from "../requests";
import { Form } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";
import Alert from "react-bootstrap/Alert";
import Datetime from "react-datetime";
import {
  CheckCircle,
  AlertTriangle,
  LucideLoader2,
  LucideArrowRight,
  Search,
  Zap,
  Loader2,
  LayoutList,
  FileText,
  Settings,
} from "lucide-react";
import moment from "moment";
// import { withRouter } from 'react-router-dom';
import { useHistory } from "react-router-dom";
import advanced_form from "../img/advanced_form.png";
import standard_form from "../img/standard_form.png";
import {
  beltTextColour,
  beltBackgroundColour,
  beltBackgroundClass,
} from "../utils/beltColourUtils";
import "../App.scss";

const customNotificationCss = `
  @keyframes pulse-success {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } /* Green-500 */
    70% { transform: scale(1.03); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
    100% { transform: scale(1); }
  }
  @keyframes pulse-error {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } /* Red-500 */
    70% { transform: scale(1.03); box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
    100% { transform: scale(1); }
  }
  .animate-pulse-success {
    animation: pulse-success 0.6s ease-out 1;
  }
  .animate-pulse-error {
    animation: pulse-error 0.6s ease-out 1;
  }
`;

// TODO: Unify belt colour shades across all components for consistency

// Helper function to format a Date object or ISO string into YYYY-MM-DD for HTML date input
const toHtmlDateString = (dateInput) => {
  if (!dateInput) return "";
  // Use Date object for consistent UTC date extraction
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date)) return "";
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper function to convert YYYY-MM-DD string back to an ISO string (for backend submission)
const toIsoString = (dateString) => {
  if (!dateString) return null;
  // Set time to midnight UTC to ensure date consistency across timezones
  return new Date(dateString + "T00:00:00.000Z").toISOString();
};

const LoadingSpinner = () => <LucideLoader2 className="animate-spin h-5 w-5 mr-3 text-white" />;

const InlineNotificationBubble = ({ message, type }) => {
  if (!message) {
    console.log("[NOTIF LOGIC] Message is null, returning null component.");
    return null;
  }

  console.log(`[NOTIF LOGIC] Rendering bubble. Message: "${message}", Type: "${type}"`);

  let bgColor, Icon, animationClass;

  if (type === "success") {
    bgColor = "bg-green-600";
    Icon = CheckCircle;
    animationClass = "animate-pulse-success";
  } else if (type === "error") {
    bgColor = "bg-red-600";
    Icon = AlertTriangle;
    animationClass = "animate-pulse-error";
  } else {
    // info/default
    bgColor = "bg-blue-600";
    Icon = Search;
    animationClass = "";
  }

  console.log(
    `[NOTIF LOGIC] Calculated Classes: bgColor="${bgColor}", animationClass="${animationClass}"`
  );

  return (
    <div
      className={`
              flex items-center px-4 py-3 rounded-full shadow-lg 
              ${bgColor} text-white transition-all duration-300 ease-in-out
              w-full md:w-auto transform scale-100
              ${animationClass}
          `}
      role="alert"
    >
      <Icon className="w-4 h-4 flex-shrink-0 mr-2" />
      <span className="font-semibold text-sm whitespace-nowrap">{message}</span>
    </div>
  );
};

// Helper: Convert raw colour name to Tailwind background class
const colourNameToTailwindBg = (rawColour) => {
  if (!rawColour) return "bg-gray-200";
  const normalized = String(rawColour).toLowerCase().trim();
  const colorMap = {
    white: "bg-gray-100",
    yellow: "bg-yellow-300",
    orange: "bg-orange-500",
    green: "bg-green-700",
    purple: "bg-purple-700",
    lightblue: "bg-cyan-200",
    darkblue: "bg-blue-600",
    brown: "bg-amber-800",
  };
  if (normalized.startsWith("bg-")) return normalized;
  const foundKey = Object.keys(colorMap).find((key) => normalized.includes(key));
  return colorMap[foundKey] || "bg-gray-400";
};

// Helper: Convert raw colour name to Tailwind text class
const colourNameToTailwindText = (rawColour) => {
  if (!rawColour) return "text-gray-500";
  const normalized = String(rawColour).toLowerCase().trim();
  const colorMap = {
    white: "text-gray-500",
    yellow: "text-yellow-600",
    orange: "text-orange-600",
    green: "text-green-600",
    purple: "text-purple-600",
    lightblue: "text-blue-500",
    darkblue: "text-blue-900",
    brown: "text-amber-800",
  };
  if (normalized.startsWith("text-")) return normalized;
  const foundKey = Object.keys(colorMap).find((key) => normalized.includes(key));
  return colorMap[foundKey] || "text-gray-500";
};

function AdminForm({ currentUser, ...props }) {
  // const forceUpdate = React.useState()[1].bind(null, {}); // see NOTE above

  // ----------------------------------------------------------------------
  // DIAGNOSTIC LOG 1: Check all incoming props on render
  // This will show if the parent is passing data, especially users/waivers/createSelect...Items
  console.log("DIAGNOSTIC: AdminForm received props:", props); // <--- NEW LOG
  console.log("DIAGNOSTIC: AdminForm received currentUser:", currentUser);

  // ----------------------------------------------------------------------

  const rawBeltsData = props.belts;

  console.log("Raw belts data received in AdminForm:", rawBeltsData);

  const normalizedBeltsData = useMemo(() => {
    const data = rawBeltsData;

    // Helper to process a single belt object
    const processBelt = (beltAttributes) => {
      // Store the raw color string, cleaned up
      const rawColour = beltAttributes.colour?.trim() || "default";

      return {
        id: Number(beltAttributes.id),
        name:
          beltAttributes.name ||
          (rawColour ? rawColour.charAt(0).toUpperCase() + rawColour.slice(1) : "Unknown Belt"),
        // Compute text class from kyu_number (8..1), not record ID
        tailwindClass: beltTextColour(Number(beltAttributes.kyu_number)),
        rawColour: rawColour.replace(/ +/g, ""),
        kyu_number: Number(beltAttributes.kyu_number),
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
      const belts = data.included.filter((res) => res && res.type === "belts");
      if (belts.length > 0) {
        return belts.map((belt) => processBelt({ id: belt.id, ...belt.attributes }));
      }
    }

    // Default to an empty array
    return [];
  }, [rawBeltsData]); // Dependency on the raw prop data

  console.log("Normalized List of ALL Available Belts (from Syllabus):", normalizedBeltsData);

  // New: Provide a kyu_number-sorted view (highest to lowest) for potential UI use
  const beltsSortedByKyu = useMemo(() => {
    try {
      const cloned = [...normalizedBeltsData];
      return cloned
        .filter((b) => b && b.kyu_number !== undefined && b.kyu_number !== null)
        .sort((a, b) => Number(b.kyu_number) - Number(a.kyu_number));
    } catch (e) {
      console.warn("[BELT DEBUG] beltsSortedByKyu sort failed", e);
      return [];
    }
  }, [normalizedBeltsData]);
  console.log("[BELT DEBUG] beltsSortedByKyu (descending kyu_number):", beltsSortedByKyu);

  // // Use a state for derived belts data (optional, but good practice for mapped lists)
  // const [derivedBelts, setDerivedBelts] = React.useState([]);

  // // 2. Logic to find the specific belt and map data
  // React.useEffect(() => {
  //   if (!beltsData || !Array.isArray(beltsData)) {
  //     console.warn("Belt data not available or not an array.");
  //     return;
  //   }

  //   // --- A. Dynamic Mapping Approach (Preferred for a full list) ---
  //   // This maps ALL belts, calculating text/background colors for each.
  //   const mappedBelts = beltsData.map((belt) => ({
  //     id: belt.id,
  //     name: belt.name,
  //     color: beltTextColour(belt.id), // Use the utility function
  //     // Remove all spaces from the fetched colour string
  //     backgroundColor: belt.colour?.replace(/ +/g, "") || "transparent",
  //   }));
  //   // --- B. Specific Lookup Approach (To match the original request structure) ---

  //   // Use .find() to locate the object with ID 7
  //   const yellowBeltObject = beltsData.find((b) => b.id === 7);

  //   let yellowBeltConfig = null;

  //   if (yellowBeltObject) {
  //     yellowBeltConfig = {
  //       id: 7,
  //       name: yellowBeltObject.name,
  //       color: beltTextColour(7),
  //       // Safely access the colour property and clean up spaces
  //       backgroundColor: yellowBeltObject.colour.replace(/ +/g, ""),
  //     };
  //   }

  //   // Set state to use the mapped array (A) or the specific item (B)
  //   setDerivedBelts(mappedBelts); // Using the full mapped array (A)
  //   console.log("Derived Belts:", mappedBelts);
  //   console.log("Specific Yellow Belt Config:", yellowBeltConfig);
  // }, [beltsData]); // Re-run if beltsData changes

  // // console.log("What is belt", belt);

  // console.log("beltsData type:", typeof beltsData, beltsData);
  // // const rawBeltsData = props.primaryAdminSyllabus?.belts;

  //   // --- 1. NORMALIZATION STEP: Clean and extract the color string ---
  //   const normalizedBeltsData = useMemo(() => {
  //     const data = rawBeltsData;

  //     // Helper to process a single belt object
  //     const processBelt = (beltAttributes) => {
  //       // Store the raw color string, cleaned up
  //       const rawColour = beltAttributes.colour?.trim() || "default";

  //       return {
  //         id: Number(beltAttributes.id),
  //         name: beltAttributes.name || rawColour || "Unknown",
  //         normalizedColourName: rawColour.toLowerCase().replace(/ +/g, ""), // Store a clean color name for Tailwind mapping
  //         kyu_number: beltAttributes.kyu_number,
  //       };
  //     };

  //     // Check for JSON:API-like structure
  //     if (data && Array.isArray(data.data)) {
  //       return data.data.map((belt) =>
  //         processBelt({
  //           id: belt.id,
  //           ...belt.attributes,
  //         })
  //       );
  //     }

  //     // Check for a simple array structure
  //     if (Array.isArray(data)) {
  //       return data.map((b) => processBelt(b));
  //     }

  //     // Default to an empty array
  //     return [];
  //   }, [rawBeltsData]); // Dependency on the raw prop data

  const history = useHistory();

  const [isUserSelected, setUserSelection] = useState(false);
  // Ref to the "Which user do you wish to update?" heading for autoscroll
  const userUpdateHeadingRef = React.useRef(null);

  const scrollUserUpdateHeadingIntoView = () => {
    if (!userUpdateHeadingRef.current) return;
    const elementTop = userUpdateHeadingRef.current.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: elementTop, behavior: "smooth" });
  };
  const [isWaiverSelected, setWaiverSelection] = useState(false);
  const [waiverInformation, setWaiverInformation] = useState(null);
  const [userInformation, setUserInformation] = useState(null);
  const [formStatus, setFormStatus] = useState({
    type: "initial",
    message: "Select a user to begin editing.",
  });
  const [preferredDifferenceEditorMode, setPreferredDifferenceEditorMode] = useState("standard"); // Assume an admin would wish to use the more simple standard method by default
  const [statusMessage, setStatusMessage] = useState("");

  // const [csrfState, setCsrfState] = useState({ status: 'loading', token: null });

  const [grade, setGrade] = useState(0);
  const [gradeObtainedAt, setGradeObtainedAt] = useState(null);
  const [gi, setGi] = useState(null);
  const [firstAid, setFirstAid] = useState(null);
  const [firstAidDate, setFirstAidDate] = useState(null);
  const [instructorQualification, setInstructorQualification] = useState(null);
  const [instructorQualificationDate, setInstructorQualificationDate] = useState(null);
  // Track hydration/loading specifically for user data fetch to control section spinner
  const [isHydratingUser, setIsHydratingUser] = useState(false);
  // Country selector to control which belt/qualification IDs are shown
  const [country, setCountry] = useState("canada");
  // Committed country used for informational note; updates only on successful submit
  const [countryCommitted, setCountryCommitted] = useState("canada");

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [gradesByUserId, setGradesByUserId] = useState({}); // cache of kyu grades per user

  // const { outstandingWaiverCount } = props;
  const { users, primaryAdminSyllabus, createSelectUserItems, outstandingWaiverCount } = props;

  // ----------------------------------------------------------------------
  // LOGIC TO FIND THE CURRENTLY SELECTED USER AND THEIR BELT
  const selectedUser = useMemo(() => {
    if (!selectedUserId || !users) return null;
    return users.find((u) => u.id === selectedUserId);
  }, [selectedUserId, users]);

  // Extract belt information for the selected user
  const selectedUserBelt = useMemo(() => {
    if (!selectedUser || !selectedUser.current_belt_grade) return null;

    const currentGrade = selectedUser.current_belt_grade;
    const beltId = currentGrade.belt_id;

    // Now, find the full belt details from the normalized list
    const fullBeltDetails = normalizedBeltsData.find((b) => String(b.id) === String(beltId));

    if (fullBeltDetails) {
      return {
        ...fullBeltDetails,
        obtained_at: currentGrade.obtained_at,
      };
    }

    // Fallback if full details are missing
    return {
      id: beltId,
      name: `Belt ID ${beltId}`,
      tailwindClass: beltTextColour(beltId),
      obtained_at: currentGrade.obtained_at,
    };
  }, [selectedUser, normalizedBeltsData]);

  // Initial setup/logging (for debugging)
  useEffect(() => {
    if (!selectedUserId) {
      if (users && users.length > 0) {
        // Prefer first user from list
        setSelectedUserId(users[0].id);
        setUserInformation(users[0]);
        setUserSelection(true);
      } else if (currentUser && currentUser.id) {
        // Fallback: use current admin user when list is empty
        setSelectedUserId(currentUser.id);
        setUserInformation(currentUser);
        setUserSelection(true);
      }
    }
  }, [users, selectedUserId, currentUser]);

  console.log("Selected User:", selectedUser);
  console.log("Selected User's Current Belt:", selectedUserBelt);

  const isInitialDataLoading = props.isInitialDataLoading || false; // Use the general loading state

  const [notification, setNotification] = useState({
    message: null,
    type: "success", // 'success', 'error', or 'info'
  });
  const [isLoading, setIsLoading] = useState(false);
  // Pending grade state: track selected grade until submit completes
  const [pendingGradeId, setPendingGradeId] = useState(null);
  const [pendingActive, setPendingActive] = useState(false);
  // Unified disabled flag for UI controls during initial load or active submit
  const modesDisabled = Boolean(isInitialDataLoading || isLoading);

  // --- FIX: Style Injection useEffect ---
  useEffect(() => {
    // Only run once to inject global styles
    const style = document.createElement("style");
    style.type = "text/css";
    style.appendChild(document.createTextNode(customNotificationCss));
    document.head.appendChild(style);

    console.log("[CSS INJECTION DEBUG] Custom notification styles injected into <head>.");

    // Cleanup function (optional but good practice)
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Helper to clear the notification automatically
  useEffect(() => {
    if (notification.message) {
      console.log(
        `[TOAST STATE DEBUG] Notification set: Type='${notification.type}', Message='${notification.message}'`
      );

      const timer = setTimeout(() => {
        // FIX: Set message to null instead of '' to prevent unnecessary render cycles
        setNotification({ message: null, type: null });
        console.log("[TOAST STATE DEBUG] Notification cleared by timeout (message=null).");
      }, 3000); // Notification disappears after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [notification.message, notification.type]);

  const handleModeChange = useCallback(
    async (event) => {
      const newMode = event.target.value;

      // Ensure we have the user ID before proceeding
      const userId = currentUser?.id;
      if (!userId) {
        setStatusMessage("Error: Admin user identity not loaded. Cannot save preference.");
        console.error("User ID is missing. Cannot call updateAdminPreference.");
        return;
      }

      if (isLoading) return; // Prevent double submission

      const previousMode = preferredDifferenceEditorMode;
      // Optimistically update the UI state
      setPreferredDifferenceEditorMode(newMode);
      setIsLoading(true);
      setStatusMessage("");

      try {
        // Define the payload structure
        const payload = {
          user: {
            preferred_difference_editor_mode: newMode,
          },
        };

        // Call the real API function using the imported 'User' object
        // and pass the correct userId and the structured payload
        await User.updateAdminPreference(userId, payload);

        // This localStorage is now redundant since the preference is saved to the backend,
        // but it's often kept for initial mock/fallback.
        localStorage.setItem("preferredEditorMode", newMode);
        setStatusMessage("Preference saved successfully!");
      } catch (error) {
        console.error("API Update Error:", error);
        // Revert state if the API call fails
        setPreferredDifferenceEditorMode(previousMode);
        setStatusMessage("Failed to save preference. Please try again.");
      } finally {
        setIsLoading(false);
        // Clear status message after a short delay
        setTimeout(() => setStatusMessage(""), 3000);
      }
    },
    // Add currentUser dependency to useCallback
    [isLoading, preferredDifferenceEditorMode, currentUser]
  );

  // useEffect to ensure the form reflects the current mode when it starts
  useEffect(() => {
    (async () => {
      try {
        const userData = await User.current();
        if (userData?.user?.preferred_difference_editor_mode) {
          setPreferredDifferenceEditorMode(userData.user.preferred_difference_editor_mode);
        }
      } catch (error) {
        console.error("Error loading preferred mode:", error);
      }
    })();
  }, []);

  console.log("--- ADMIN FORM RENDER DIAGNOSTICS ---");
  console.log(`[STATE] isUserSelected: ${isUserSelected}`);
  console.log(`[STATE] preferredEditorMode: ${preferredDifferenceEditorMode}`);

  console.log(
    `[STATE] userInformation is: ${userInformation ? "SET (ID: " + userInformation.id + ")" : "NULL or FALSY"}`
  );

  if (typeof userInformation === "undefined") {
    console.error("CRITICAL ERROR: userInformation state is currently UNDEFINED.");
  }
  console.log("-------------------------------------");

  // DIAGNOSTIC 3: Final check of the state value and type before rendering the dropdown
  console.log(
    `DIAGNOSTIC 3 (Render State): Final 'grade' state value: ${grade}, Type: ${typeof grade}`
  );

  console.log("These are the props for the admin form", props);

  // Helper: derive grade id (8..1) from a user object
  const deriveGradeFromUser = (user) => {
    if (!user) return null;
    const effectiveKyu = user?.current_belt_grade?.effective_kyu_grade;
    if (effectiveKyu !== undefined && effectiveKyu !== null) return Number(effectiveKyu);
    const beltId = user?.current_belt_grade?.belt_id;
    if (beltId) {
      const beltObj = normalizedBeltsData.find((b) => String(b.id) === String(beltId));
      if (beltObj?.kyu_number != null) return Number(beltObj.kyu_number);
    }
    const gradeNameRaw = user?.current_belt_grade?.grade_name;
    if (typeof gradeNameRaw === "string" && gradeNameRaw.trim().length > 0) {
      const normalized = gradeNameRaw.toLowerCase().replace(/\s+/g, "");
      const nameToKyu = {
        white: 8,
        yellow: 7,
        orange: 6,
        green: 5,
        purple: 4,
        lightblue: 3,
        darkblue: 2,
        brown: 1,
      };
      if (nameToKyu[normalized]) return Number(nameToKyu[normalized]);
    }
    // Legacy array fallback
    if (Array.isArray(user?.belt_grades) && user.belt_grades.length > 0) {
      const kyus = user.belt_grades
        .map((bg) => {
          const obj = normalizedBeltsData.find((b) => String(b.id) === String(bg.belt_id));
          if (obj?.kyu_number != null) return Number(obj.kyu_number);
          const gn = bg?.grade_name;
          if (typeof gn === "string" && gn.trim().length > 0) {
            const n = gn.toLowerCase().replace(/\s+/g, "");
            const map = {
              white: 8,
              yellow: 7,
              orange: 6,
              green: 5,
              purple: 4,
              lightblue: 3,
              darkblue: 2,
              brown: 1,
            };
            return map[n] || null;
          }
          return null;
        })
        .filter((v) => v != null);
      if (kyus.length > 0) return Math.min(...kyus);
    }
    return null;
  };

  const getCurrentBeltId = (user) => {
    // First, consult the cache populated by on-demand user fetches
    if (user?.id && gradesByUserId[user.id] != null) {
      return Number(gradesByUserId[user.id]);
    }
    const shouldLog = Boolean(
      user?.id && (user?.id === userInformation?.id || user?.id === selectedUser?.id)
    );
    if (shouldLog) {
      console.log(
        `[ADMINDIAG][GET CURRENT BELT] Inputs: userId=${user?.id}, effectiveKyu=${user?.current_belt_grade?.effective_kyu_grade}, belt_id=${user?.current_belt_grade?.belt_id}, grade_name=${user?.current_belt_grade?.grade_name}`
      );
    }
    // Prefer Rails-provided effective_kyu_grade which maps directly to 8..1 UI values
    const effectiveKyu = user?.current_belt_grade?.effective_kyu_grade;
    if (effectiveKyu !== undefined && effectiveKyu !== null) {
      if (shouldLog) {
        console.log(`[ADMINDIAG][GET CURRENT BELT] Using effective_kyu_grade: ${effectiveKyu}`);
      }
      return Number(effectiveKyu);
    }

    // Legacy fallback: belt_id (may not map to 8..1 UI values)
    const currentBeltId = user?.current_belt_grade?.belt_id;
    if (currentBeltId) {
      if (shouldLog) {
        console.log(
          `[ADMINDIAG][GET CURRENT BELT] Found nested current_belt_grade.belt_id: ${currentBeltId}`
        );
      }
      // Attempt to map belt_id -> kyu_number from normalizedBeltsData
      const beltObj = normalizedBeltsData.find((b) => String(b.id) === String(currentBeltId));
      if (beltObj && beltObj.kyu_number !== undefined && beltObj.kyu_number !== null) {
        if (shouldLog) {
          console.log(
            `[ADMINDIAG][GET CURRENT BELT] Mapping belt_id ${currentBeltId} to kyu_number ${beltObj.kyu_number}`
          );
        }
        return Number(beltObj.kyu_number);
      }
      // Safer fallback: map via grade_name to avoid incorrect raw belt_id usage
      const gradeNameRaw = user?.current_belt_grade?.grade_name;
      if (typeof gradeNameRaw === "string" && gradeNameRaw.trim().length > 0) {
        const normalized = gradeNameRaw.toLowerCase().replace(/\s+/g, "");
        const nameToKyu = {
          white: 8,
          yellow: 7,
          orange: 6,
          green: 5,
          purple: 4,
          lightblue: 3,
          darkblue: 2,
          brown: 1,
        };
        const mappedKyu = nameToKyu[normalized];
        if (mappedKyu) {
          if (shouldLog) {
            console.log(
              `[ADMINDIAG][GET CURRENT BELT] Fallback via grade_name '${gradeNameRaw}' -> kyu ${mappedKyu}`
            );
          }
          return Number(mappedKyu);
        }
      }
      // As a last resort, return null to prevent misleading pill rendering
      if (shouldLog) {
        console.log(
          `[ADMINDIAG][GET CURRENT BELT] No reliable mapping for belt_id ${currentBeltId}. Returning null to avoid incorrect UI.`
        );
      }
      return null;
    }

    // 2. Fallback/Legacy logic (less reliable, but kept for completeness)
    if (user?.belt_grades && user.belt_grades.length > 0) {
      if (shouldLog) {
        console.log(
          "[ADMINDIAG][GET CURRENT BELT] Falling back to iterating through legacy 'belt_grades' array."
        );
      }
      // Prefer mapping belt_id -> kyu_number using normalizedBeltsData for each record
      const kyuValues = user.belt_grades
        .map((bg) => {
          const obj = normalizedBeltsData.find((b) => String(b.id) === String(bg.belt_id));
          if (obj && obj.kyu_number != null) return Number(obj.kyu_number);
          const gn = bg.grade_name;
          if (typeof gn === "string" && gn.trim().length > 0) {
            const normalized = gn.toLowerCase().replace(/\s+/g, "");
            const nameToKyu = {
              white: 8,
              yellow: 7,
              orange: 6,
              green: 5,
              purple: 4,
              lightblue: 3,
              darkblue: 2,
              brown: 1,
            };
            return nameToKyu[normalized] || null;
          }
          return null;
        })
        .filter((v) => v != null);
      if (kyuValues.length > 0) {
        // Return the highest kyu achieved (closest to 1)
        const currentKyu = Math.min(...kyuValues);
        if (shouldLog) {
          console.log(`[ADMINDIAG][GET CURRENT BELT] Legacy array mapped to kyu=${currentKyu}`);
        }
        return Number(currentKyu);
      }
      return null;
    }

    if (shouldLog) {
      console.log(
        "[ADMINDIAG][GET CURRENT BELT] No 'current_belt_grade' object found. Returning null (default to 0)."
      );
    }
    return null;
  };
  // Enrich users lacking current grade by fetching their full record once
  useEffect(() => {
    const run = async () => {
      if (!Array.isArray(users) || users.length === 0) return;
      const updates = {};
      await Promise.all(
        users.map(async (u) => {
          if (!u || !u.id) return;
          // Skip if we already have a cached grade or can derive from the provided user object
          const existing = gradesByUserId[u.id];
          const derived = deriveGradeFromUser(u);
          if (existing != null || derived != null) {
            if (derived != null) updates[u.id] = derived;
            return;
          }
          try {
            const full = await User.get(u.id, "current_belt_grade.belt");
            // Attempt to derive kyu from full payload, supporting JSON:API or plain JSON
            const deriveFromPayload = (payload) => {
              if (!payload) return null;
              // Plain JSON shape: payload has current_belt_grade nested
              if (payload.current_belt_grade) {
                return deriveGradeFromUser(payload);
              }
              // JSON:API: payload.data + payload.included
              const data = payload.data;
              const included = Array.isArray(payload.included) ? payload.included : [];
              const relationships = data?.relationships || {};
              const relBg = relationships.current_belt_grade?.data;
              if (relBg && relBg.id) {
                // Find matching included belt_grade
                const bgRes = included.find(
                  (r) => String(r.id) === String(relBg.id) && String(r.type).includes("belt_grade")
                );
                const beltId = bgRes?.attributes?.belt_id;
                const gradeName = bgRes?.attributes?.grade_name;
                if (beltId) {
                  const obj = normalizedBeltsData.find((b) => String(b.id) === String(beltId));
                  if (obj?.kyu_number != null) return Number(obj.kyu_number);
                }
                if (typeof gradeName === "string" && gradeName.trim().length > 0) {
                  const normalized = gradeName.toLowerCase().replace(/\s+/g, "");
                  const map = {
                    white: 8,
                    yellow: 7,
                    orange: 6,
                    green: 5,
                    purple: 4,
                    lightblue: 3,
                    darkblue: 2,
                    brown: 1,
                  };
                  if (map[normalized]) return Number(map[normalized]);
                }
              }
              return null;
            };

            const fullUser = Array.isArray(full)
              ? full[0]
              : full?.user || full?.data?.attributes || full;
            let kyu = deriveGradeFromUser(fullUser);
            if (kyu == null) {
              kyu = deriveFromPayload(full);
            }
            if (kyu != null) updates[u.id] = kyu;
          } catch (e) {
            console.warn(`[USER GRADE FETCH] Failed for user ${u.id}:`, e);
          }
        })
      );
      if (Object.keys(updates).length > 0) {
        setGradesByUserId((prev) => ({ ...prev, ...updates }));
      }
    };
    run();
    // Only re-run when the incoming users list changes
  }, [users]);

  // Helper: derive default country from a belt_id (1–8 Canada, 9–16 UK)
  const deriveCountryFromBeltId = (beltId) => {
    const num = Number(beltId || 0);
    return num >= 9 ? "uk" : "canada";
  };

  // Map the belt ID values from the form/database to their display names
  const BELT_COLOURS = {
    8: "White",
    7: "Yellow",
    6: "Orange",
    5: "Green",
    4: "Purple",
    3: "Light Blue",
    2: "Dark Blue",
    1: "Brown",
  };

  // Text colour class should be derived from utility `beltTextColour`

  const getCurrentBeltName = (user) => {
    const gradeName = user?.current_belt_grade?.grade_name;
    if (gradeName && typeof gradeName === "string" && gradeName.trim().length > 0) {
      return gradeName.trim();
    }
    const beltId = user?.current_belt_grade?.belt_id;
    if (beltId === undefined || beltId === null || beltId === 0) {
      return "No Grade Assigned";
    }
    // Prefer lookup from normalized belts data (handles API names)
    const beltObj = normalizedBeltsData.find((b) => String(b.id) === String(beltId));
    if (beltObj?.name) return beltObj.name;
    if (beltObj?.rawColour) {
      const name = String(beltObj.rawColour).replace(/ +/g, " ").trim();
      return name ? name.charAt(0).toUpperCase() + name.slice(1) : "Unknown Grade";
    }
    // Fallback to static map if available
    return BELT_COLOURS[Number(beltId)] || "Unknown Grade";
  };

  /**
   * Safely retrieves the current belt's Tailwind text coloUr class.
   */
  const getCurrentBeltColourClass = (user) => {
    const effectiveKyu = user?.current_belt_grade?.effective_kyu_grade;
    const beltId = user?.current_belt_grade?.belt_id;

    // Prefer effective kyu (8..1 scale)
    if (effectiveKyu !== undefined && effectiveKyu !== null) {
      return beltTextColour(Number(effectiveKyu));
    }

    // Otherwise try to map belt_id -> kyu_number, then use utility
    if (beltId) {
      const beltObj = normalizedBeltsData.find((b) => String(b.id) === String(beltId));
      if (beltObj && beltObj.kyu_number !== undefined && beltObj.kyu_number !== null) {
        return beltTextColour(Number(beltObj.kyu_number));
      }
      // Fallback to using raw beltId with utility
      return beltTextColour(Number(beltId));
    }

    return "text-gray-500";
  };

  /**
   * Safely retrieves the pre-calculated time held string from the user object.
   */
  const getTimeHeldDisplay = (user) => {
    // We assume the API has calculated and provided this string
    return user?.current_belt_grade?.time_held || "N/A (Calculation pending)";
  };

  // IMPORTANT: Native <option> elements do not reliably render CSS classes.
  // Use inline styles for background/text colors so they appear consistently.
  const getGradeOptionStyle = (gradeId) => {
    try {
      const bg = beltBackgroundColour(Number(gradeId));
      const isLightColour = /(^white$)|(^yellow$)|(^orange$)|(^#add8e6$)/.test(bg);
      const color = isLightColour ? "black" : "white";
      return { backgroundColor: bg, color };
    } catch {
      return { backgroundColor: "#ffffff", color: "black" };
    }
  };

  const getBeltObtainedAt = (user) => {
    const currentBeltGrade =
      user?.current_belt_grade || (user?.belt_grades?.length > 0 ? user.belt_grades[0] : null);
    // Format the date for the HTML date input
    return toIsoString(currentBeltGrade?.obtained_at);
  };

  // Labels for belt grades 8..1
  const getGradeLabel = (id) => {
    switch (Number(id)) {
      case 8:
        return "White";
      case 7:
        return "Yellow";
      case 6:
        return "Orange";
      case 5:
        return "Green";
      case 4:
        return "Purple";
      case 3:
        return "Light Blue";
      case 2:
        return "Dark Blue";
      case 1:
        return "Brown";
      default:
        return "Please select";
    }
  };

  // Map instructor qualification IDs when switching country (1-4 <-> 5-8)
  const mapQualificationToCountry = (id, targetCountry) => {
    const num = Number(id) || 0;
    if (!num) return targetCountry === "uk" ? 5 : 1; // default to country-specific "No qualifications"
    if (targetCountry === "uk") {
      // Canada (1..4) -> UK (5..8)
      if (num >= 1 && num <= 4) return num + 4;
      return num;
    }
    // targetCountry === 'canada'
    if (num >= 5 && num <= 8) return num - 4;
    return num;
  };

  const EDITOR_MODES = [
    { value: "standard", label: "Standard Form", icon: LayoutList },
    { value: "advanced", label: "Advanced/Raw Data", icon: FileText },
  ];

  // Effect to sync single-record state when a user is selected
  useEffect(() => {
    if (userInformation) {
      console.log(
        "[SYNC DEBUG 1] useEffect triggered. Incoming userInformation state:",
        userInformation
      );

      // Initialize states from the selected user's data
      const calculatedBeltId = getCurrentBeltId(userInformation);

      console.log();
      console.log(
        `[DEBUG GRADE SYNC] RAW Grade ID (from API/userInformation.current_belt_grade?.grade_id): ${calculatedBeltId}`
      );

      // Coerce calculatedBeltId to a number or 0.
      // This ensures the 'grade' state is NEVER null when a user is selected.
      // This prevents the dropdown's value={grade || 0} from resolving to 0 when it shouldn't.
      const safeGradeId = Number(calculatedBeltId) || 0;

      // DIAGNOSTIC 2: Check the value being extracted and cast
      console.log(
        `[SYNC DEBUG 2] Calculated beltId: ${calculatedBeltId}. Final safeGradeId being set to state 'grade': ${safeGradeId}`
      );

      if (!isLoading) {
        console.log(
          `[SYNC DEBUG 2b] isLoading=${isLoading}. Applying grade sync to ${safeGradeId}.`
        );
        setGrade(safeGradeId);
      } else {
        console.log(
          `[SYNC DEBUG 2b] isLoading=${isLoading}. Skipping grade sync to avoid overwriting user selection.`
        );
      }

      const rawGradeDate = userInformation.current_belt_grade?.obtained_at;
      const gradeDate = rawGradeDate ? new Date(rawGradeDate) : null;
      setGradeObtainedAt(gradeDate);
      console.log(`[DEBUG GRADE DATE SYNC] Setting gradeObtainedAt to:`, gradeDate);

      // If userInformation.owns_gi is undefined (missing key), set it to null
      // so the dropdown defaults to '0' ('Please select').
      const incomingGiValue = userInformation.owns_gi;
      const safeGiValue = incomingGiValue === undefined ? null : incomingGiValue;

      console.log(
        `DIAGNOSTIC (Gi State Check): Data Value: ${incomingGiValue}, Setting GI state to: ${safeGiValue}`
      );
      setGi(safeGiValue);

      const incomingFirstAid = userInformation.has_first_aid_qualification;
      setFirstAid(incomingFirstAid === undefined ? null : incomingFirstAid);

      // 4. First Aid Date
      const faDate = userInformation.first_aid_achievement_date
        ? new Date(userInformation.first_aid_achievement_date)
        : null;
      setFirstAidDate(faDate);

      // IMPORTANT: Initialize from base qualification_id (IDs 1–8) so country-specific options select correctly
      const incomingQualificationId =
        userInformation.current_instructor_qualification?.qualification_id;

      // Default "No qualifications" depends on country context: Canada=1, UK=5
      const beltIdForCountry = userInformation.current_belt_grade?.belt_id;
      const derivedCountryForDefault = deriveCountryFromBeltId(beltIdForCountry);
      const defaultNoQualificationId = derivedCountryForDefault === "uk" ? 5 : 1;
      const numericQualificationId = incomingQualificationId
        ? Number(incomingQualificationId)
        : defaultNoQualificationId; // Default to country-aware "No qualifications"

      console.log(`[IQ DEBUG] Selected User ID: ${userInformation.id}`);
      // FIX: Use the correct key for the log
      console.log(`[IQ DEBUG] Raw IQ Object:`, userInformation.current_instructor_qualification);
      console.log(
        `[IQ DEBUG] Extracted qualification_id: ${incomingQualificationId} (Type: ${typeof incomingQualificationId})`
      );
      console.log(
        `[IQ DEBUG] Final numericQualificationId set to state: ${numericQualificationId}`
      );

      // If the entire instructor_qualification object is missing, this correctly defaults to null
      setInstructorQualification(numericQualificationId);

      console.log(
        `DIAGNOSTIC (IQ State Check): Incoming Qualification ID: ${incomingQualificationId}, Setting IQ state to: ${numericQualificationId}`
      );

      // 6. Instructor Qualification Date (Set state as a Date object for Datetime component)
      // FIX: Convert the ISO date string to a Date object so react-datetime can display it.
      const iqDate = userInformation.current_instructor_qualification?.achieved_at
        ? new Date(userInformation.current_instructor_qualification.achieved_at)
        : null;

      setInstructorQualificationDate(iqDate);
      // Derive initial country primarily from instructor qualification if present,
      // falling back to belt_id when qualification is missing
      const currentBeltId = userInformation.current_belt_grade?.belt_id;
      const initialCountryByIQ = incomingQualificationId
        ? Number(incomingQualificationId) >= 5
          ? "uk"
          : "canada"
        : null;
      const derivedByBelt = deriveCountryFromBeltId(currentBeltId);
      const initialCountry = initialCountryByIQ || derivedByBelt || "canada";
      setCountry(initialCountry);
      setCountryCommitted(initialCountry);

      console.log(
        `DIAGNOSTIC (IQ Date Check): Achieved At: ${userInformation.current_instructor_qualification?.achieved_at}, Setting IQ Date state to:`,
        iqDate
      );

      setUserSelection(true);
    }
  }, [userInformation, isLoading]);

  // Auto-remap instructor qualification when country changes
  useEffect(() => {
    // Only remap when a user is selected and we have a meaningful ID
    if (!isUserSelected) return;
    if (instructorQualification === null || instructorQualification === undefined) return;

    const mapped = mapQualificationToCountry(instructorQualification, country);
    if (Number(mapped) !== Number(instructorQualification)) {
      setInstructorQualification(mapped);
      // If remapped to 'No qualifications' for the target country, clear the date
      if (mapped === 1 || mapped === 5) {
        setInstructorQualificationDate(null);
      }
    }
  }, [country, isUserSelected, instructorQualification]);

  // Use a function to add to the userInformation object
  console.log("This is userInformation", userInformation);

  // Use a function to add to the waiverInformation object
  console.log(
    "This is waiverInformation",
    waiverInformation
    //  && userInformation.instructor_qualification
  );

  // Ensure grade dropdown colour and achieved-at date reflect the user's current_belt_grade
  useEffect(() => {
    if (!userInformation || isLoading) return;

    const currentId = Number(getCurrentBeltId(userInformation));
    setGrade(currentId || 0);

    const obtainedRaw = userInformation.current_belt_grade?.obtained_at;
    if (obtainedRaw) {
      const dateObj = moment.isMoment(obtainedRaw)
        ? obtainedRaw.toDate()
        : obtainedRaw instanceof Date
          ? obtainedRaw
          : new Date(obtainedRaw);
      setGradeObtainedAt(dateObj);
    } else {
      setGradeObtainedAt(null);
    }

    // Clear any pending/proposed grade when switching or refreshing user data
    setPendingActive(false);
    setPendingGradeId(null);
  }, [userInformation?.id, isLoading]);

  function twoCallsUsers(event) {
    // 1. Call the original function in case it has necessary side effects (e.g., in the parent)
    props.onDropdownSelectedUsers(event, props.users);

    const selectedId = Number(event.target.value);

    // 2. Lookup the user object. If selectedId is 0 or not found, 'user' will be undefined.
    const user = props.users.find((u) => Number(u.id) === selectedId);

    console.log(`[DEBUG SELECT] User selected with ID: ${selectedId}. User object found:`, user); // DEBUG

    console.log(`DEBUG (twoCallsUsers): Selected User ID: ${selectedId}`);
    console.log(
      "DEBUG (twoCallsUsers): User Object found via ID lookup (should match ID above):",
      user
    );

    console.log("DIAGNOSTIC 1 (Raw Data): Selected User's Belt Grades Array:", user?.belt_grades);

    // 3. Use || null to ensure the state value is null if the user is undefined.
    setUserInformation(user || null);

    // 4. Set user selection state based on the user being found
    setUserSelection(!!user);

    // 5. Scroll the update section heading into view for context
    if (user) scrollUserUpdateHeadingIntoView();
  }

  // New handler for Headless UI Listbox user selection
  const handleUserSelect = async (user) => {
    if (!user) {
      setSelectedUserId(null);
      setUserInformation(null);
      setUserSelection(false);
      return;
    }
    setSelectedUserId(user.id);
    setUserSelection(true);
    // Scroll the update section heading into view for context
    scrollUserUpdateHeadingIntoView();
    // Call parent handler with a synthetic event to preserve existing API
    if (props.onDropdownSelectedUsers) {
      const syntheticEvent = { target: { value: String(user.id) } };
      props.onDropdownSelectedUsers(syntheticEvent, props.users);
    }

    // Enrich the selected user with nested relationships for belt grade and IQ
    try {
      setIsLoading(true);
      setIsHydratingUser(true);
      const payload = await User.get(
        user.id,
        "current_belt_grade.belt,current_instructor_qualification"
      );

      let enrichedUser = null;

      // JSON:API hydration path
      if (payload?.data) {
        const baseAttrs = payload.data.attributes || {};
        const baseId = payload.data.id;
        const relationships = payload.data.relationships || {};
        const included = Array.isArray(payload.included) ? payload.included : [];

        // Resolve current_belt_grade
        const cbgRelId = relationships?.current_belt_grade?.data?.id;
        let currentBeltGrade = null;
        if (cbgRelId) {
          const gradeRes = included.find(
            (r) => r.type === "belt_grades" && String(r.id) === String(cbgRelId)
          );
          if (gradeRes) {
            const gradeAttrs = gradeRes.attributes || {};
            const beltRelId = gradeRes.relationships?.belt?.data?.id;
            let beltObj = null;
            if (beltRelId) {
              const beltRes = included.find(
                (r) => r.type === "belts" && String(r.id) === String(beltRelId)
              );
              if (beltRes) {
                beltObj = { id: beltRes.id, ...(beltRes.attributes || {}) };
              }
            }
            currentBeltGrade = {
              id: gradeRes.id,
              ...gradeAttrs,
              belt_id: beltRelId || gradeAttrs.belt_id || beltObj?.id || null,
              belt: beltObj || null,
            };
          }
        }
        // Resolve current_instructor_qualification (IQ)
        const ciqRelId = relationships?.current_instructor_qualification?.data?.id;
        let currentInstructorQualification = null;
        if (ciqRelId) {
          const iqRes = included.find(
            (r) => r.type === "instructor_qualifications" && String(r.id) === String(ciqRelId)
          );
          if (iqRes) {
            const iqAttrs = iqRes.attributes || {};
            currentInstructorQualification = {
              id: iqRes.id,
              ...iqAttrs,
            };
          }
        }

        enrichedUser = {
          id: baseId,
          ...baseAttrs,
          // Preserve embedded attribute if relationship isn't provided
          current_belt_grade: currentBeltGrade || baseAttrs.current_belt_grade || null,
          current_instructor_qualification:
            currentInstructorQualification || baseAttrs.current_instructor_qualification || null,
        };
      }

      // Fallbacks: plain object or service-specific shape
      const fullUser =
        enrichedUser ||
        (Array.isArray(payload)
          ? payload[0]
          : payload?.user || payload?.data?.attributes || payload) ||
        user;

      setUserInformation(fullUser);

      // Seed grade and achieved-at date from enriched data
      const seededGradeId = Number(getCurrentBeltId(fullUser)) || 0;
      setGrade(seededGradeId);
      const obtainedRaw = fullUser?.current_belt_grade?.obtained_at;
      if (obtainedRaw) {
        const dateObj = moment.isMoment(obtainedRaw)
          ? obtainedRaw.toDate()
          : obtainedRaw instanceof Date
            ? obtainedRaw
            : new Date(obtainedRaw);
        setGradeObtainedAt(dateObj);
      } else {
        setGradeObtainedAt(null);
      }
      // Seed instructor qualification ID and date from hydrated user
      const iqId = fullUser?.current_instructor_qualification?.qualification_id;
      if (iqId !== undefined && iqId !== null) {
        setInstructorQualification(Number(iqId));
      } else {
        setInstructorQualification(null);
      }
      const iqDateRaw = fullUser?.current_instructor_qualification?.achieved_at;
      if (iqDateRaw) {
        const iqDateObj = moment.isMoment(iqDateRaw)
          ? iqDateRaw.toDate()
          : iqDateRaw instanceof Date
            ? iqDateRaw
            : new Date(iqDateRaw);
        setInstructorQualificationDate(iqDateObj);
      } else {
        setInstructorQualificationDate(null);
      }
      setPendingActive(false);
      setPendingGradeId(null);
    } catch (e) {
      console.warn("[USER ENRICH] Failed to fetch enriched user:", e);
      setUserInformation(user);
    } finally {
      setIsLoading(false);
      setIsHydratingUser(false);
    }
  };

  // Auto-select and hydrate the first user when the users list loads
  useEffect(() => {
    if (!selectedUserId && Array.isArray(users) && users.length > 0) {
      const firstUser = users[0];
      // Avoid redundant hydration if already set to the same user
      if (!(userInformation && String(userInformation.id) === String(firstUser.id))) {
        handleUserSelect(firstUser);
      }
    }
  }, [users, selectedUserId]);

  function twoCallsWaivers(event) {
    let waiver = props.onDropdownSelectedWaivers(event, props.outstandingWaivers);
    console.log("This is the waiver in twoCalls function", waiver);

    setWaiverInformation(waiver || null); // If falsy values are found, then reset to null

    setWaiverSelection(!!waiver);
  }

  function updateColorBox(event) {
    const newGradeId = Number(event.target.value);

    setGrade(newGradeId);
    setPendingGradeId(newGradeId);
    setPendingActive(true);
    // --- REACTIVE LOGIC: Set date to TODAY when a new grade is selected ---
    const today = new Date();
    // The react-datetime component expects a Date or Moment object.
    setGradeObtainedAt(today);

    console.log(
      `[REACTIVE LOGIC] Grade ID changed to ${newGradeId}. Date auto-set to today: ${today.toDateString()}`
    );
  }

  function updateGradeObtainedAt(event) {
    // Datetime returns a Moment object or Date object
    const dateValue = moment.isMoment(event)
      ? event.toDate()
      : event instanceof Date
        ? event
        : null;
    setGradeObtainedAt(dateValue);
    console.log(`[DATE UPDATE] New Grade Obtained At date set:`, dateValue);
  }

  function updateGiBox(event) {
    console.log(
      `GI when we set ${gi} AdminForm.js:249:1Event target value GI ${event.target.value}`
    );
    setGi(event.target.value === "true");
    // userInformation.owns_gi = event.target.value;
    // forceUpdate();
  }

  function updateFirstAidBox(event) {
    setFirstAid(event.target.value === "true");
  }

  function updateFirstAidDate(event) {
    // Handle Moment object or Date object from Datetime component
    const dateValue = moment.isMoment(event)
      ? event.toDate()
      : event instanceof Date
        ? event
        : null;
    if (dateValue) {
      setFirstAidDate(dateValue);
    }
  }

  function updateInstructorQualificationBox(event) {
    const newId = Number(event.target.value);
    setInstructorQualification(newId);
    // Auto-manage the achievement date:
    // - If selecting a real qualification (2..4 or 6..8), default date to today
    // - If selecting "No qualifications" (1 or 5), clear the date
    if ([2, 3, 4, 6, 7, 8].includes(newId)) {
      setInstructorQualificationDate(new Date());
    } else if ([1, 5].includes(newId)) {
      setInstructorQualificationDate(null);
    }
  }

  function updateInstructorQualificationDate(event) {
    const dateValue = moment.isMoment(event)
      ? event.toDate()
      : event instanceof Date
        ? event
        : null;
    if (dateValue) {
      setInstructorQualificationDate(dateValue);
    }
  }

  const handleWaiverEdit = () => {
    if (waiverInformation?.id) {
      history.push(`/waivers/${waiverInformation.id}/edit/`);
    } else {
      console.log("Waiver not selected or ID missing, cannot navigate.");
    }
  };

  async function handleSubmit(event) {
    console.log("--- SUBMIT HANDLER STARTED ---"); // DEBUG

    event.preventDefault();

    if (!userInformation || !userInformation.id) {
      setNotification({
        message: "Please select a user before attempting to update.",
        type: "error",
      });
      return;
    }

    // If a non-default belt is selected, the obtained date is mandatory.
    if (grade !== 0 && gradeObtainedAt === null) {
      setNotification({
        message: 'Error: Cannot set a belt grade without an "Obtained At" date.',
        type: "error",
      });
      console.log(
        "--- SUBMIT HANDLER ENDED (Client-side validation failed: Missing grade date) ---"
      );
      return;
    }

    console.log(
      `[ADMINDIAG][SUBMIT DEBUG] Pre-submit state: grade=${grade}, currentId=${getCurrentBeltId(userInformation)}, isLoading=${isLoading}, pendingActive=${pendingActive}, pendingGradeId=${pendingGradeId}`
    );
    // Ensure pending state is active for the duration of submit so the pill shows the proposed grade
    try {
      if (!pendingActive) {
        setPendingActive(true);
        console.log(`[ADMINDIAG][SUBMIT DEBUG] Activating pendingActive for submit.`);
      }
      if ((pendingGradeId == null || Number(pendingGradeId) === 0) && Number(grade) > 0) {
        setPendingGradeId(Number(grade));
        console.log(`[ADMINDIAG][SUBMIT DEBUG] Setting pendingGradeId from grade: ${grade}`);
      }
    } catch (e) {
      console.log(`[ADMINDIAG][SUBMIT DEBUG] Pending state activation failed:`, e);
    }
    setIsLoading(true);

    // Helper for consistent date comparison (YYYY-MM-DD)
    const formatDataDateForComparison = (dateInput) => {
      if (!dateInput) return null;
      // Use the existing helper to convert backend ISO to YYYY-MM-DD string
      return toHtmlDateString(dateInput);
    };

    // Create a nested object to collect the user attributes along with belt grade and instructor qualification data
    let userUpdates = {};
    const userId = userInformation.id;
    const latestBeltGradeRecordId = userInformation.current_belt_grade?.id; // Needed for IQ update

    // --- 1. Owns Gi Check ---
    const currentGi = userInformation.owns_gi; // boolean or undefined/null
    const newGi = gi; // boolean or null

    // Only update if a definite boolean state is set (not null) AND it differs from the current value
    if (newGi !== null && currentGi !== newGi) {
      userUpdates.owns_gi = newGi;
    }

    console.log("[ADMINDIAG][SUBMIT DEBUG] Gi Check:", {
      currentGi,
      newGi,
      shouldUpdate: newGi !== null && currentGi !== newGi,
    }); // DEBUG

    // --- 2. Has First Aid Qualification Check ---
    const currentFirstAid = userInformation.has_first_aid_qualification; // boolean or undefined/null
    const newFirstAid = firstAid; // boolean or null

    // Only update if a definite boolean state is set (not null) AND it differs from the current value
    if (newFirstAid !== null && currentFirstAid !== newFirstAid) {
      userUpdates.has_first_aid_qualification = newFirstAid;
    }

    console.log("[ADMINDIAG][SUBMIT DEBUG] First Aid Status Check:", {
      currentFirstAid,
      newFirstAid,
      shouldUpdate: newFirstAid !== null && currentFirstAid !== newFirstAid,
    }); // DEBUG

    // --- 4. Belt Grade Check (FIXED LOGIC) ---
    const currentGradeId = getCurrentBeltId(userInformation);

    // Get current and new dates as YYYY-MM-DD strings for reliable comparison
    const currentGradeDateFormatted = formatDataDateForComparison(
      userInformation.current_belt_grade?.obtained_at
    );
    const newGradeDateFormatted = toHtmlDateString(gradeObtainedAt);

    const gradeIdChanged = currentGradeId !== grade;
    const gradeDateChanged = currentGradeDateFormatted !== newGradeDateFormatted;

    let obtainedAtValue = null;
    if (gradeObtainedAt) {
      obtainedAtValue = toIsoString(newGradeDateFormatted);
    }

    // Map the selected kyu grade (8..1) to the actual belt record ID for the current primary syllabus
    const selectedBeltId = (() => {
      // Resolve to the canonical belt_id from normalizedBeltsData using kyu_number.
      // Avoid any hardcoded id assumptions; use API-provided IDs only.
      try {
        const match = Array.isArray(normalizedBeltsData)
          ? normalizedBeltsData.find((b) => Number(b.kyu_number) === Number(grade))
          : null;
        if (match && match.id != null) {
          console.log(
            `[ADMINDIAG][BELT MAP DEBUG] Found match for kyu=${grade}: id=${match.id}, name=${match.name}, kyu_number=${match.kyu_number}`
          );
          return Number(match.id);
        }
        console.warn(
          "[ADMINDIAG][BELT MAP WARN] Could not resolve belt_id from normalizedBeltsData; falling back to current belt_id."
        );
        // Fallback: use the user's current belt_id when available to avoid sending incorrect IDs
        const currentId = userInformation?.current_belt_grade?.belt_id;
        console.log(
          `[ADMINDIAG][BELT MAP DEBUG] Fallback to current belt_id: currentId=${currentId}, selectedKyu=${grade}`
        );
        return currentId != null ? Number(currentId) : null;
      } catch (e) {
        console.warn("[ADMINDIAG][BELT MAP ERROR] Resolution failed:", e);
        return null;
      }
    })();
    console.log(
      `[ADMINDIAG][SUBMIT BELT DEBUG] Preparing submit: grade=${grade}, selectedBeltId=${selectedBeltId}, currentUserBeltId=${userInformation?.current_belt_grade?.belt_id}`
    );

    // Optimistic UI update: immediately reflect the new belt in the dropdown pill
    const prevUserInformation = userInformation;
    try {
      const optimisticUser = {
        ...userInformation,
        current_belt_grade: {
          ...(userInformation?.current_belt_grade || {}),
          belt_id:
            selectedBeltId != null ? selectedBeltId : userInformation?.current_belt_grade?.belt_id,
          effective_kyu_grade:
            Number(grade) || userInformation?.current_belt_grade?.effective_kyu_grade,
          grade_name:
            getGradeLabel(Number(grade)) || userInformation?.current_belt_grade?.grade_name,
        },
      };
      console.log(
        `[ADMINDIAG][OPTIMISTIC PILL DEBUG] Applying optimistic current_belt_grade: belt_id=${optimisticUser.current_belt_grade.belt_id}, effective_kyu=${optimisticUser.current_belt_grade.effective_kyu_grade}`
      );
      setUserInformation(optimisticUser);
    } catch (e) {
      console.warn(
        "[ADMINDIAG][OPTIMISTIC UPDATE WARN] Could not set optimistic user information:",
        e
      );
    }

    // CONSOLIDATED FIX: Check for ID change OR Date change. If either, send the full update.
    if (gradeIdChanged || gradeDateChanged) {
      console.log(
        `[ADMINDIAG][SUBMIT DEBUG] Belt Grade change detected (ID: ${gradeIdChanged}, Date: ${gradeDateChanged}). Sending full belt_grade update.`
      );

      let beltGradePayload = {
        belt_id: selectedBeltId,
        obtained_at: obtainedAtValue, // This is guaranteed to be non-null if grade !== 0
      };

      // If the ID hasn't changed, we are likely editing the date of the *current* record.
      // We MUST include the existing record's ID for the backend to update it,
      // which resolves the "can't be blank" validation on the existing record.
      if (!gradeIdChanged && latestBeltGradeRecordId) {
        beltGradePayload.id = latestBeltGradeRecordId;
        console.log(
          `[ADMINDIAG][SUBMIT DEBUG] Attaching existing BeltGrade ID: ${latestBeltGradeRecordId} for date-only update.`
        );
      }

      userUpdates.belt_grade = [beltGradePayload];
    } else {
      console.log(`[ADMINDIAG][SUBMIT DEBUG] Belt Grade unchanged. No belt update sent.`);
    }

    console.log("[ADMINDIAG][SUBMIT DEBUG] Belt Grade Check:", {
      currentGradeId,
      newGrade: grade,
      shouldUpdate: gradeIdChanged || gradeDateChanged,
    }); // DEBUG

    // Instructor Qualification Check
    // Compare selected value to the base qualification_id to avoid country mismatches
    const currentIQId = userInformation.current_instructor_qualification?.qualification_id;
    // ...

    // 4. First Aid Date Check
    const currentFirstAidDateFormatted = formatDataDateForComparison(
      userInformation.first_aid_achievement_date
    );
    const newFirstAidDateFormatted = toHtmlDateString(firstAidDate);

    if (currentFirstAidDateFormatted !== newFirstAidDateFormatted) {
      // Send the date to the backend as an ISO string (or null)
      userUpdates.first_aid_achievement_date = toIsoString(newFirstAidDateFormatted);
    }

    console.log("[ADMINDIAG][SUBMIT DEBUG] First Aid Date Check:", {
      currentFirstAidDateFormatted,
      newFirstAidDateFormatted,
      shouldUpdate: currentFirstAidDateFormatted !== newFirstAidDateFormatted,
    }); // DEBUG

    // Get current and new dates as ISO strings for reliable comparison
    const currentIQDateFormatted = formatDataDateForComparison(
      userInformation.current_instructor_qualification?.achieved_at
    );
    const newIQDateFormatted = toHtmlDateString(instructorQualificationDate);

    const iqIdChanged = currentIQId !== instructorQualification;
    const iqDateChanged = currentIQDateFormatted !== newIQDateFormatted;

    console.log("[ADMINDIAG][SUBMIT DEBUG] IQ ID/Date Check:", {
      currentIQId,
      newIQ: instructorQualification,
      iqIdChanged,
      currentIQDateFormatted,
      newIQDateFormatted,
      iqDateChanged,
    }); // DEBUG

    // Determine the achieved_at value to send (null if ID is 1 or 5 [No qualifications])
    let achievedAtValue = null;

    if (![1, 5].includes(Number(instructorQualification))) {
      achievedAtValue = toIsoString(newIQDateFormatted);
    }

    // If ID changed OR Date changed, send the update with required foreign keys
    if (iqIdChanged || iqDateChanged) {
      userUpdates.instructor_qualification = {
        qualification_id: instructorQualification,
        achieved_at: achievedAtValue,
        // --- NEW: Include belt foreign keys to satisfy potential validation ---
        belt_id: selectedBeltId, // Use the currently selected/updated belt record ID for current syllabus
        belt_grade_id: latestBeltGradeRecordId, // Use the ID of the latest BeltGrade record
      };
    }

    console.log("[ADMINDIAG][SUBMIT DEBUG] userUpdates object:", userUpdates); // DEBUG: CHECK WHAT WAS COLLECTED

    const updatesArePresent = Object.keys(userUpdates).length !== 0;

    console.log("[ADMINDIAG][SUBMIT DEBUG] updatesArePresent:", updatesArePresent); // DEBUG: CHECK IF CHANGES WERE DETECTED

    if (!updatesArePresent) {
      setIsLoading(false);
      setNotification({
        message: "No changes detected. Nothing was updated.",
        type: "info",
      });
      console.log("[ADMINDIAG] --- SUBMIT HANDLER ENDED (No updates) ---"); // DEBUG

      return;
    }

    // Construct the final payload for the API call
    let payload = {
      user: userUpdates,
    };

    console.log("[ADMINDIAG][SUBMIT DEBUG] Final PAYLOAD:", payload); // DEBUG: CHECK FINAL DATA SENT

    // --- API Call and Notification Handling ---
    try {
      const responseData = await User.update(userId, payload);
      const updatedUserFromApi = responseData?.user;
      console.log("[ADMINDIAG][API RESPONSE DEBUG] This is updatedUserFromApi", updatedUserFromApi);

      // ** NEW DEBUG STATEMENT 4: Log API Response User Object and extracted ID **
      const extractedNewBeltId = updatedUserFromApi?.current_belt_grade?.belt_id;
      console.log(
        `[ADMINDIAG][API RESPONSE DEBUG] Extracted belt_id from response: ${extractedNewBeltId}`
      );
      console.log(
        "[ADMINDIAG][API RESPONSE DEBUG] Full updatedUserFromApi object:",
        updatedUserFromApi
      );

      if (responseData && !responseData.message?.includes("Submission in progress")) {
        // Success response (200 OK)

        if (updatedUserFromApi) {
          setUserInformation(updatedUserFromApi);
          // Clear pending state on success
          setPendingActive(false);
          setPendingGradeId(null);
          console.log(
            `[ADMINDIAG][API RESPONSE BELT DEBUG] Updated belt: belt_id=${updatedUserFromApi?.current_belt_grade?.belt_id}, effective_kyu=${updatedUserFromApi?.current_belt_grade?.effective_kyu_grade}`
          );
          // Commit country label after a successful update
          setCountryCommitted(country);

          const successMessage = responseData.message || "User updated successfully!";
          console.log(
            `[ADMINDIAG][TOAST HANDLER DEBUG] SUCCESS - Setting notification: '${successMessage}' (type: 'success')`
          );
          setNotification({
            message: successMessage,
            type: "success",
          });
        } else {
          // Fallback for successful submission that did not return the user object
          setNotification({
            message: responseData.message || "Update succeeded! (User data refresh pending)",
            type: "success",
          });
          // Clear pending even if user object isn't returned
          setPendingActive(false);
          setPendingGradeId(null);
          // Commit country label after a successful update
          setCountryCommitted(country);
        }
        console.log("[ADMINDIAG] --- SUBMIT HANDLER ENDED (Success) ---"); // DEBUG
      } else if (responseData && responseData.message?.includes("Submission in progress")) {
        // Handle case where parent debounce blocked the actual API call
        setNotification({
          message: "Still processing previous update. Please wait a moment.",
          type: "info",
        });
      }
    } catch (error) {
      // Roll back optimistic change on error
      if (prevUserInformation) {
        setUserInformation(prevUserInformation);
        console.log(
          "[ADMINDIAG][OPTIMISTIC PILL ROLLBACK] Restored previous userInformation after error."
        );
      }
      // Clear pending state on error
      setPendingActive(false);
      setPendingGradeId(null);
      // UPDATED ERROR HANDLING FOR SERVICE LAYER
      let errorMsg = "An unknown error occurred.";

      try {
        let errorDetails = null;
        try {
          errorDetails = JSON.parse(error.message);
        } catch {
          errorDetails = null;
        }
        errorMsg = errorDetails?.errors?.join(", ") || errorDetails?.error || error.message;
      } catch {
        errorMsg = error.message;
      }

      console.log(
        `[ADMINDIAG][TOAST HANDLER DEBUG] ERROR - Setting notification: '${errorMsg}' (type: 'error')`
      );
      setNotification({
        message: errorMsg,
        type: "error",
      });
      console.error("[ADMINDIAG] --- SUBMIT HANDLER ENDED (Error) --- Error Details:", errorMsg); // DEBUG
    } finally {
      setIsLoading(false);
    }
  }

  // Helper to render status messages
  const renderStatus = () => {
    const { type, message } = formStatus;
    let icon, color;

    switch (type) {
      case "success":
        icon = <CheckCircle className="w-5 h-5" />;
        color = "bg-green-100 text-green-700";
        break;
      case "error":
        icon = <AlertTriangle className="w-5 h-5" />;
        color = "bg-red-100 text-red-700";
        break;
      case "info":
        icon = <Search className="w-5 h-5" />;
        color = "bg-blue-100 text-blue-700";
        break;
      case "loading":
        icon = <LoadingSpinner />;
        color = "bg-yellow-100 text-yellow-700";
        break;
      default:
        return null;
    }

    return (
      <div className={`flex items-center p-3 rounded-lg mt-4 ${color} transition-all duration-300`}>
        {icon}
        <span className="ml-3 font-medium text-sm">{message}</span>
      </div>
    );
  };

  const { errors } = props;

  const waiverDisplayContent = isInitialDataLoading ? (
    <span className="text-xl ml-2 font-mono text-yellow-600">
      <Loader2 className="animate-spin inline mr-1 w-5 h-5" />
      Loading...
    </span>
  ) : (
    <span className="text-4xl ml-2 font-bold">{outstandingWaiverCount}</span>
  );

  // Logic to determine background color based on state (Loading > Outstanding > Clear)
  const getBackgroundColor = () => {
    if (isInitialDataLoading) return "rgba(255, 255, 153, 0.3)"; // Yellow-ish for loading
    //   if (isWaiverCountLoading) return '#fffbe5'; // Neutral Yellow/Amber for loading
    if (outstandingWaiverCount > 0) return "#ffdddd"; // Light Red for outstanding
    return "#eeffee"; // Light Green for clear
  };

  // Logic to determine border color based on state
  const getBorderColor = () => {
    if (isInitialDataLoading) return "rgb(255, 193, 7)"; // Bootstrap Yellow
    //   if (isWaiverCountLoading) return '#d69e2e'; // Darker Amber for loading
    if (outstandingWaiverCount > 0) return "#cc0000"; // Dark Red for outstanding
    return "#00cc00"; // Dark Green for clear
  };

  // Combined readiness check: user selected AND CSRF token loaded
  const isFormReady = isUserSelected; // && csrfState.status === 'loaded';

  const buttonText = "Update User";

  console.log(
    `[DEBUG RENDER] Button Status: isFormReady=${isFormReady}, isLoading=${isLoading}, Disabled=${!isFormReady || isLoading}`
  ); // DEBUG: BUTTON STATUS CHECK

  // Calculate dynamic styles for the selected field
  // const selectedColor = getBeltColor(grade);
  // const selectedTextColor = (grade === 8 || grade === 3) ? 'black' : 'white';

  {
    /* {errors.length > 0 ? (
        <div className="ui negative message FormErrors">
          <Alert variant="danger">
            <div className="header">Access Denied</div>
            <p>{errors.map((err) => err.message).join(",")}</p>
          </Alert>
        </div>
      ) : null} */
  }

  //   return (

  //         <div className="admin-form-container p-6 bg-white shadow-xl rounded-lg">
  //             {notification.message && (
  //                 <NotificationToast
  //                     message={notification.message}
  //                     type={notification.type}
  //                     onClose={() => setNotification({ message: null, type: null })}
  //                 />
  //             )}
  //       <Form.Group controlId="formBasicAdmin">

  // {/* TODO: Get this "behind the scenes" visitor counter going, also see index.html */}
  //  {/* //     let counterContainer = document.querySelector(".website-counter");
  // // let resetButton = document.querySelector("#reset");
  // // let visitCount = localStorage.getItem("page_view");

  // // // Check if page_view entry is present
  // // if (visitCount) {
  // //   visitCount = Number(visitCount) + 1;
  // //   localStorage.setItem("page_view", visitCount);
  // // } else {
  // //   visitCount = 1;
  // //   localStorage.setItem("page_view", 1);
  // // }
  // // counterContainer.innerHTML = visitCount;

  // // // Adding onClick event listener
  // // resetButton.addEventListener("click", () => {
  // //   visitCount = 1;
  // //   localStorage.setItem("page_view", 1);
  // //   counterContainer.innerHTML = visitCount;
  // // }); */}

  //       <h1 id="top-label">
  //           Add an admin's signature for a student's newly signed waiver
  //         </h1>
  //         <br />
  //         <br />

  //         <div
  //             style={{
  //                 textAlign: 'center',
  //                 marginBottom: '2rem',
  //                 padding: '1rem',
  //                 // --- FIX: Updated Color changes to prioritize loading state ---
  //                 backgroundColor: getBackgroundColor(),
  //                 border: '1px solid',
  //                 borderColor: getBorderColor(),
  //                 borderRadius: '8px',
  //                 fontWeight: 'bold'
  //             }}
  //         >
  //           Outstanding Waivers Awaiting Signature: {waiverDisplayContent}
  //         </div>

  //         <Form.Label name="user-choice">
  //         &nbsp;Which user's waiver do you wish to sign?
  //         </Form.Label>
  //         {/* TODO: This does not populate only those waivers which need a signature, but rather all of them; tie it in to the "outstanding" counter to populate the dropdown correctly */}
  //         <Form.Control
  //           name="waiverList"
  //           type="user-name"
  //           as="select"
  //           defaultValue="Please select"
  //           onChange={twoCallsWaivers}
  //           // onClick={(id) => this.updateWaiver(waiver.id)}
  //         >
  //           <option type="select" label="Please Select"></option>
  //           {props.createSelectOutstandingWaiverItems}
  //           {/* {props.outstandingWaivers} */}
  //         </Form.Control>

  //         <br />
  //         <br />

  //         <Button
  //         disabled={!isWaiverSelected}
  //         variant="primary"
  //         onClick={handleWaiverEdit}

  //       >
  //         Jump to Waiver Edit Page
  //       </Button>

  //         <br />
  //         <br />

  //             {isUserSelected && (
  //                 <Form onSubmit={handleSubmit} className="mt-8 space-y-4">
  //         <h1 id="top-label">
  //           Update user information regarding grade, qualifications etc
  //         </h1>
  //         <br />
  //         <br />
  //         <Form.Label name="user-choice">
  //           Which user do you wish to update?
  //         </Form.Label>

  //         {renderStatus()}

  //         {/* Consider putting this in normal chrono order i.e. when they were created */}
  //         <Form.Group>
  //         <Form.Control
  //           name="user"
  //           type="user-name"
  //           as="select"
  //           // defaultValue="Please select"
  //           defaultValue="0"
  //           onChange={twoCallsUsers}
  //         >
  //           <option value="0" label="Please Select"></option>
  //           {/* ---------------------------------------------------------------------- */}
  //           {/* DIAGNOSTIC LOG 3: Check user items right before injection into JSX */}
  //           {console.log("DIAGNOSTIC: User Items to render:", props.createSelectUserItems)}
  //           {/* ---------------------------------------------------------------------- */}
  //           {props.createSelectUserItems}
  //         </Form.Control>
  //       </Form.Group>
  //       <Form.Group controlId="formBasicGrade">
  //         <Form.Label>What is their Jitsu grade?</Form.Label>
  //         <Form.Control
  //           className="color-belt"
  //           name="belt"
  //           type="select"
  //           as="select"
  //           disabled={!isUserSelected}
  //           value={grade || 0}
  //           // defaultValue={props.users[i].belt_grades[0].belt_id}
  //           onChange={updateColorBox}
  //         >
  //           <option value={0}>Please select</option>
  //           <option className="gradecoloroption" style={{ backgroundColor: "white" }} value={8}>White{" "}</option>
  //           <option className="gradecoloroption" style={{ backgroundColor: "yellow" }} value={7}>Yellow{" "}</option>
  //           <option className="gradecoloroption" style={{ backgroundColor: "orange" }} value={6}>Orange</option>
  //           <option className="gradecoloroption" style={{ backgroundColor: "green" }} value={5}>Green</option>
  //           <option className="gradecoloroption" style={{ backgroundColor: "purple" }} value={4}>Purple</option>
  //           <option className="gradecoloroption" style={{ backgroundColor: "#add8e6", color: "black" }} value={3}>Light Blue</option>
  //           <option className="gradecoloroption" style={{ backgroundColor: "#00008b" }} value={2}>Dark Blue{" "}</option>
  //           <option className="gradecoloroption" style={{ backgroundColor: "#b5651d" }} value={1}>Brown</option>
  //         </Form.Control>
  //       </Form.Group>
  //       <Form.Group controlId="formBasicGi">
  //         <Form.Label>Do they have a gi?</Form.Label>
  //         <Form.Control
  //           disabled={!isUserSelected}
  //           className="gi"
  //           type="gi"
  //           name="owns_gi"
  //           as="select"
  //           required={true}
  //           value={gi === true ? "true" : (gi === false ? "false" : "0")}
  //           onChange={updateGiBox}

  //           // defaultValue={props.selectedUser.owns_gi}
  //           // // defaultValue={props.users[i].owns_gi}
  //           // onChange={props.changeSelectColorHandler}
  //         >
  //           <option value="0">Please select </option>
  //           <option value="false">Not yet </option>
  //           <option value="true">Yes </option>
  //         </Form.Control>
  //       </Form.Group>
  //       <Form.Group controlId="formBasicFirstAid">
  //         <Form.Label>Are they first aid qualified?</Form.Label>
  //         {/* {console.log("Is this today?", new Date().toLocaleString("en-US").replace(',', '').replace(':00 ', ' '))}
  //         {console.log("What we'll feed in as the expiry date", (userInformation && userInformation.first_aid_achievement_date))}
  //         {console.log("What we'll feed into the value check", userInformation && (howRecentlyAchieved(userInformation.first_aid_achievement_date, new Date().toLocaleString("en-US").replace(',', '').replace(':00 ', ' '))))} */}
  //         <Form.Control
  //           disabled={!isUserSelected}
  //           className="first-aid"
  //           name="has_first_aid_qualification"
  //           type="first-aid"
  //           as="select"
  //           required={true}
  //           value={firstAid === true ? "true" : (firstAid === false ? "false" : "0")}
  //           // value={userInformation != null ? (userInformation.has_first_aid_qualification != null ? (howRecentlyAchieved(userInformation.first_aid_achievement_date, new Date().toLocaleString("en-US").replace(',', '').replace(':00 ', ' '))[0] != true ? "Yes, but they need to renew it" : "Yes, it's recent and active" ) : "No") : 0}
  //           // value={isUserSelected ? userInformation.first_aid_achievement_date != null ? true : false : false }
  //           //(userInformation.first_aid_achievement_date != null ? (howRecentlyAchieved(userInformation.first_aid_achievement_date, new Date().toLocaleString("en-US").replace(',', '').replace(':00 ', ' '))[0]) : 0) : 0
  //           onChange={updateFirstAidBox}
  //         >
  //           <option value="0">Please select </option>
  //           <option value="false">
  //             No, or they are but they need to renew it
  //           </option>
  //           <option value={true}>Yes, it's recent and active</option>
  //         </Form.Control>
  //       </Form.Group>
  //       <Form.Group controlId="formBasicFirstAidDate">
  //         <Form.Label>
  //           If so, when did they achieve the first aid qualification?
  //         </Form.Label>
  //         {/* <Form.Control
  //           className="first-aid-date"
  //           type="first-aid-date"
  //           // as="select"
  //           // required={true}
  //         //   onChange={props.changeSelectColorHandler}
  //         > */}
  //         {console.log(
  //           "Testing values for the first aid achievement date",
  //           userInformation != null
  //             ? userInformation.first_aid_achievement_date != null
  //               ? new Date(userInformation.first_aid_achievement_date)
  //                   .toLocaleString("en-US")
  //                   .replace(",", "")
  //                   .replace(":00 ", " ")
  //               : 0
  //             : 0
  //         )}
  //         {isUserSelected ? (
  //           <Datetime
  //             inputProps={{ disabled: !isUserSelected }}
  //             required={true}
  //             className="qualification-date"
  //             name="first_aid_achievement_date"
  //             value={firstAidDate}
  //             dateFormat="MM/DD/YYYY"
  //             onChange={updateFirstAidDate}
  //           />
  //         ) : (
  //           ""
  //         )}

  //         {/* </Form.Control> */}
  //       </Form.Group>
  //       <Form.Group controlId="formBasicInstructorQualification">
  //         <Form.Label>Do they have an instructor qualification?</Form.Label>
  //         <Form.Control
  //           disabled={!isUserSelected}
  //           className="instructor-qualification"
  //           name="instructor_qualification"
  //           type="instructor-qualification"
  //           as="select"
  //           required={true}
  //           value={instructorQualification || 0}
  //           // value={isUserSelected ? userInformation.instructor_qualification != null ? userInformation.instructor_qualification.qualification_id : 1 : 0}
  //           onChange={updateInstructorQualificationBox}
  //           //(userInformation.instructor_qualification != null ? userInformation.instructor_qualification.qualification_id : 0) : 0
  //           // defaultValue={props.users[i].instructor_qualifications[0].qualification_id}
  //           //   onChange={props.changeSelectColorHandler}
  //         >
  //           <option value={0}>Please select </option>
  //           <option value={1}>No qualifications </option>
  //           <option value={2}>Assistant Instructor </option>
  //           <option value={3}>Instructor </option>
  //           <option value={4}>Club Instructor </option>
  //         </Form.Control>
  //       </Form.Group>
  //       <Form.Group controlId="formBasicInstructorQualificationDate">
  //         {/* {isUserSelected != null ? userInformation.instructor_qualification : 0} */}
  //         <Form.Label>
  //           If so, when did they achieve the most recent instructor qualification?
  //         </Form.Label>
  //         {/* {console.log("Testing values for the instructor qualification achievement date", userInformation != null ? (userInformation.instructor_qualification != null ? (userInformation.instructor_qualification.qualification_id !== 1 ? new Date(userInformation && userInformation.instructor_qualification.achieved_at).toLocaleString("en-US").replace(',', '').replace(':00 ', ' ') : "") : 0) : 0)} */}
  //         {console.log(
  //           "Testing values for the instructor qualification achievement date",
  //           userInformation != null ? userInformation : ""
  //         )}

  //         {isUserSelected ? (
  //           <Datetime
  //             inputProps={{ disabled: !isUserSelected }}
  //             required={true}
  //             className="qualification-date"
  //             name="instructor_qualification_achievement_date"
  //             value={instructorQualificationDate || ''}
  //             dateFormat="MM/DD/YYYY"
  //             onChange={updateInstructorQualificationDate}
  //           />
  //         ) : (
  //           ""
  //         )}

  //         {/* </Form.Control> */}
  //       </Form.Group>
  //       {/* <Button
  //         disabled={!isFormReady}
  //         variant="primary"
  //         onClick={handleSubmit}
  //       >
  //         {isLoading ? 'Updating...' : buttonText}
  //       </Button> */}

  //                           {/* Submit Button */}
  //                     <Button
  //                         type="submit"
  //                         disabled={!isFormReady || isLoading}
  //                         className={`mt-6 w-full py-3 text-lg font-bold rounded-lg shadow-lg transition-all duration-300
  //                             ${(!isFormReady || isLoading) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
  //                     >
  //                         {isLoading ? <LoadingSpinner /> : buttonText}
  //                     </Button>

  //                     {!isFormReady && (
  //                         <p className="text-sm text-red-500 mt-2 text-center">
  //                             Please select a user and ensure the security token is loaded. (Status: {csrfState.status})
  //                         </p>
  //                     )}

  //     </Form>
  //                   )}
  //                         </Form.Group>
  //     </div>
  //   );
  return (
    <div className="admin-form-container p-6 bg-white shadow-xl rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Admin Panel: User & Waiver Management
      </h2>

      {/* WAIVER MANAGEMENT SECTION (Always Visible) */}
      <h3 className="text-xl font-semibold border-b pb-2 mb-4 text-gray-800">Waiver Signatures</h3>

      <div
        className={`p-4 mb-4 rounded-lg border-2 shadow-md transition-all duration-300`}
        style={{ backgroundColor: getBackgroundColor(), borderColor: getBorderColor() }}
      >
        <h3 className="text-lg font-semibold flex items-center mb-2">
          <Zap className="w-5 h-5 mr-2 text-indigo-500" />
          Outstanding Waivers Awaiting Signature:
          {waiverDisplayContent}
        </h3>

        <Form.Group controlId="formWaiverSelect" className="mb-3">
          <Form.Label className="font-medium text-gray-600">
            Select Outstanding Waiver to Review
          </Form.Label>
          <div className="relative">
            <Form.Control
              as="select"
              onChange={twoCallsWaivers}
              name="waiverList"
              defaultValue="0"
              disabled={
                !props.outstandingWaivers ||
                props.outstandingWaivers.length === isInitialDataLoading
              }
              className="border border-gray-300 rounded-lg p-2 appearance-none pr-10"
            >
              {/* <option value="0">--- Select a Waiver ---</option> */}
              <option value="0">
                {isInitialDataLoading ? "Loading Waivers..." : "--- Select a Waiver ---"}
              </option>
              {props.createSelectOutstandingWaiverItems}
            </Form.Control>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </div>
        </Form.Group>

        <Button
          onClick={handleWaiverEdit}
          disabled={!isWaiverSelected || isInitialDataLoading}
          variant="primary"
          className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out flex items-center"
        >
          Review/Edit Selected Waiver <LucideArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <hr className="my-8" />

      {/* USER SELECTION SECTION (Always Visible, sets the conditional for the form below) */}
      <h3 className="text-xl font-semibold border-b pb-2 mb-4 text-gray-800">User Data Update</h3>
      {/* Added improved colour options */}
      {/* Section wrapper with loading overlay to avoid partial render */}
      <div className="relative">
        {(isInitialDataLoading || isHydratingUser) && (
          <div
            aria-hidden="true"
            className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[1px] flex items-center justify-center"
          >
            <Loader2 className="animate-spin w-6 h-6 mr-2 text-indigo-600" />
            <span className="text-indigo-700 font-medium">Loading user data...</span>
          </div>
        )}
        <div className="mb-4">
          <div ref={userUpdateHeadingRef}>
            <label className="font-semibold text-gray-700">Which user do you wish to update?</label>
          </div>
          <Listbox value={selectedUser} onChange={handleUserSelect}>
            <div className="relative mt-1">
              <ListboxButton className="relative w-full cursor-pointer rounded-lg bg-white py-3 pl-3 pr-10 text-left shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <span className="block truncate text-gray-800">
                  {selectedUser ? (
                    <span className="inline-flex items-center gap-2">
                      <span>{`${selectedUser.first_name || ""} ${selectedUser.last_name || "Name Missing"}`}</span>
                      {(() => {
                        // Robustly detect the edited/selected user via selectedUserId (string-coerced)
                        const isEditedSelected = Boolean(
                          selectedUser &&
                            selectedUserId != null &&
                            String(selectedUser.id) === String(selectedUserId)
                        );
                        // Use the freshest state if this is the currently edited user
                        const displayUser =
                          userInformation && isEditedSelected ? userInformation : selectedUser;
                        const currentId = Number(getCurrentBeltId(displayUser));
                        // Show proposed grade during submit for the edited user; fall back to current if none
                        const proposedId = Number(pendingGradeId ?? grade ?? currentId);
                        const useProposed = Boolean(
                          isLoading && isEditedSelected && proposedId && proposedId !== currentId
                        );
                        const id = useProposed ? proposedId : currentId;
                        console.log(
                          `[ADMINDIAG][PILL DEBUG] ListboxButton: selUserId=${selectedUser?.id}, editingUserId=${userInformation?.id}, isLoading=${isLoading}, pendingActive=${pendingActive}, useProposed=${useProposed}, isEditedSelected=${isEditedSelected}, currentId=${currentId}, grade=${grade}, pendingGradeId=${pendingGradeId}, proposedId=${proposedId}, finalId=${id}`
                        );
                        if (!id)
                          return (
                            <span
                              className="text-gray-600"
                              style={{
                                backgroundColor: "#f3f4f6",
                                display: "inline-block",
                                padding: "0.125rem 0.5rem",
                                borderRadius: "0.375rem",
                                fontSize: "0.875rem",
                                lineHeight: 1.25,
                                border: "1px solid #e5e7eb",
                              }}
                            >
                              <strong>(user's grade is not assigned yet)</strong>
                            </span>
                          );
                        const textClass = beltTextColour(id);
                        const borderStyle = id === 8 ? "1px solid #000" : undefined; // thin black border for white belt
                        return (
                          <span
                            className={`${textClass} ${beltBackgroundClass(id)}`}
                            style={{
                              display: "inline-block",
                              padding: "0.125rem 0.5rem",
                              borderRadius: "0.375rem",
                              fontSize: "0.875rem",
                              lineHeight: 1.25,
                              border: borderStyle,
                            }}
                          >
                            {getGradeLabel(id)}
                          </span>
                        );
                      })()}
                    </span>
                  ) : isInitialDataLoading ? (
                    "Loading Users to Select..."
                  ) : (
                    "--- Select a User ---"
                  )}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </ListboxButton>
              <ListboxOptions className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                {Array.isArray(users) &&
                  users.map((user) => {
                    const firstName = user.first_name || "";
                    const lastName = user.last_name || "Name Missing";
                    // For the currently edited user, show any freshly updated belt info
                    const isEditedOption = Boolean(
                      user && selectedUserId != null && String(user.id) === String(selectedUserId)
                    );
                    const displayUser = userInformation && isEditedOption ? userInformation : user;
                    const currentId = Number(getCurrentBeltId(displayUser));
                    const proposedId = Number(pendingGradeId ?? grade ?? currentId);
                    const useProposed = Boolean(
                      isLoading && isEditedOption && proposedId && proposedId !== currentId
                    );
                    const id = useProposed ? proposedId : currentId;
                    if (isEditedOption) {
                      console.log(
                        `[ADMINDIAG][PILL DEBUG OPTIONS] userId=${user?.id}, isLoading=${isLoading}, pendingActive=${pendingActive}, useProposed=${useProposed}, isEditedOption=${isEditedOption}, currentId=${currentId}, grade=${grade}, pendingGradeId=${pendingGradeId}, proposedId=${proposedId}, finalId=${id}`
                      );
                    }
                    const textClass = id ? beltTextColour(id) : "text-white";
                    return (
                      <ListboxOption
                        key={`user-${user.id}`}
                        value={user}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                            active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span className="block truncate">
                              <span className="inline-flex items-center gap-2">
                                <span>{`${user.id} ${firstName} ${lastName}`}</span>
                                {id ? (
                                  <span
                                    className={`${textClass} ${beltBackgroundClass(id)}`}
                                    style={{
                                      display: "inline-block",
                                      padding: "0.125rem 0.5rem",
                                      borderRadius: "0.375rem",
                                      border: id === 8 ? "1px solid #000" : undefined,
                                    }}
                                  >
                                    {getGradeLabel(id)}
                                  </span>
                                ) : (
                                  <span
                                    className="text-gray-600"
                                    style={{
                                      backgroundColor: "#f3f4f6",
                                      display: "inline-block",
                                      padding: "0.125rem 0.5rem",
                                      borderRadius: "0.375rem",
                                      fontSize: "0.75rem",
                                      lineHeight: 1.25,
                                      border: "1px solid #e5e7eb",
                                    }}
                                  >
                                    <strong>(user's grade is not assigned yet)</strong>
                                  </span>
                                )}
                              </span>
                            </span>
                            {selected && (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                <Check className="h-4 w-4" aria-hidden="true" />
                              </span>
                            )}
                          </>
                        )}
                      </ListboxOption>
                    );
                  })}
              </ListboxOptions>
            </div>
          </Listbox>
        </div>

        {/* End improved colour options */}

        {/* Status Indicator */}
        {renderStatus()}

        {/* USER UPDATE FORM (Conditional on isUserSelected) */}
        {isUserSelected && (
          <Form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <fieldset disabled={!isUserSelected} className="space-y-6">
              {/* Country selection controlling which IDs are used */}
              <Form.Group controlId="formBasicCountry">
                <Form.Label>
                  Which country context (i.e. where has the student achieved their belts and
                  instructor qualifications to date)?
                </Form.Label>
                <div className="relative">
                  <Form.Control
                    className="appearance-none pr-10"
                    as="select"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option value="canada">Canada</option>
                    <option value="uk">UK</option>
                  </Form.Control>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {`Note: if the student ends up moving to another Shorinji-Kan Jiu Jitsu country after ${
                    countryCommitted === "uk" ? "the UK" : "Canada"
                  }, consider a retraining course to familiarise them with the new syllabus.`}
                </p>
              </Form.Group>
              {/* 1. Belt Grade */}
              <Form.Group controlId="formBasicGrade">
                <Form.Label>What is their Jiu Jitsu grade?</Form.Label>
                <div className="mb-2">
                  <Listbox
                    value={grade || 0}
                    onChange={(val) => {
                      // val is the selected grade id (8..1)
                      const newGradeId = Number(val);
                      console.log(
                        `[GRADE UI DEBUG] Listbox onChange: newGradeId=${newGradeId}, prevGrade=${grade}`
                      );
                      setGrade(newGradeId);
                      setPendingGradeId(newGradeId);
                      setPendingActive(true);
                      const today = new Date();
                      setGradeObtainedAt(today);
                      console.log(
                        `[GRADE UI DEBUG] gradeObtainedAt set to today: ${today.toISOString()}`
                      );
                    }}
                    disabled={!isUserSelected}
                  >
                    <div className="relative mt-1">
                      <ListboxButton className="relative w-full cursor-pointer rounded-lg bg-white py-3 pl-3 pr-10 text-left shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <span className="block truncate text-gray-800">
                          {grade ? (
                            // Render selected grade as a colored pill using centralized helpers
                            <span
                              className={`${beltTextColour(grade)} ${beltBackgroundClass(grade)}`}
                              style={{
                                display: "inline-block",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "0.375rem",
                                border: grade === 8 ? "1px solid #000" : undefined,
                              }}
                            >
                              {getGradeLabel(grade)}
                            </span>
                          ) : (
                            "--- Select a Grade ---"
                          )}
                          {/* Intentionally no primary syllabus label here */}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </span>
                      </ListboxButton>
                      <ListboxOptions className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                        {[8, 7, 6, 5, 4, 3, 2, 1].map((id) => {
                          const label = getGradeLabel(id);
                          // Use centralized helpers for background and text colour
                          const textClass = beltTextColour(id);
                          return (
                            <ListboxOption
                              key={`grade-${id}`}
                              value={id}
                              className={({ active }) =>
                                `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                  active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                                }`
                              }
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={`block truncate rounded-md px-2 py-1 ${textClass} ${beltBackgroundClass(id)}`}
                                    style={{
                                      border: id === 8 ? "1px solid #000" : undefined,
                                    }}
                                  >
                                    {label}
                                  </span>
                                  {selected && (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                      <Check className="h-4 w-4" aria-hidden="true" />
                                    </span>
                                  )}
                                </>
                              )}
                            </ListboxOption>
                          );
                        })}
                      </ListboxOptions>
                    </div>
                  </Listbox>
                </div>
              </Form.Group>

              {/* NEW: Grade Obtained At Date Picker */}
              <Form.Group controlId="gradeObtainedAt" className="mb-4">
                <Form.Label>Grade Achieved At</Form.Label>
                <Datetime
                  value={gradeObtainedAt}
                  onChange={updateGradeObtainedAt} // <-- NEW HANDLER
                  dateFormat="YYYY-MM-DD"
                  timeFormat={false} // Only date
                  inputProps={{
                    readOnly: !isUserSelected || isLoading,
                    placeholder: "Select Date",
                    className: "form-control", // Apply bootstrap class for styling
                  }}
                  className="rdt"
                />
              </Form.Group>

              <Form.Label className="font-semibold text-gray-700">
                They have held their{" "}
                {(() => {
                  const currentId = getCurrentBeltId(userInformation);
                  const label = getCurrentBeltName(userInformation);
                  if (!currentId) {
                    return <span className="font-bold text-lg">{label}</span>;
                  }
                  const backgroundColor = beltBackgroundColour(currentId);
                  const textClass = beltTextColour(currentId);
                  const borderStyle = currentId === 8 ? "1px solid #000" : undefined;
                  return (
                    <span
                      className={`font-bold text-lg ${textClass}`}
                      style={{
                        backgroundColor,
                        display: "inline-block",
                        padding: "0.125rem 0.5rem",
                        borderRadius: "0.375rem",
                        border: borderStyle,
                      }}
                    >
                      {label}
                    </span>
                  );
                })()}{" "}
                belt for{" "}
                <span className="font-mono text-base text-gray-800">
                  {getTimeHeldDisplay(userInformation)}
                </span>
                .
              </Form.Label>

              {/* 2. Owns Gi */}
              <Form.Group controlId="formBasicGi">
                <Form.Label>Do they have a gi?</Form.Label>
                <div className="relative">
                  <Form.Control
                    className="gi appearance-none pr-10"
                    name="owns_gi"
                    as="select"
                    required={true}
                    value={gi === true ? "true" : gi === false ? "false" : "0"}
                    onChange={updateGiBox}
                  >
                    <option value="0">Please select </option>
                    <option value="false">Not yet </option>
                    <option value="true">Yes </option>
                  </Form.Control>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </Form.Group>

              {/* 3. Has First Aid Qualification */}
              <Form.Group controlId="formBasicFirstAid">
                <Form.Label>Are they first aid qualified?</Form.Label>
                <div className="relative">
                  <Form.Control
                    className="first-aid appearance-none pr-10"
                    name="has_first_aid_qualification"
                    as="select"
                    required={true}
                    value={firstAid === true ? "true" : firstAid === false ? "false" : "0"}
                    onChange={updateFirstAidBox}
                  >
                    <option value="0">Please select </option>
                    <option value="false">No, or they are but they need to renew it</option>
                    <option value={true}>Yes, it's recent and active</option>
                  </Form.Control>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
              </Form.Group>

              {/* 4. First Aid Achievement Date */}
              {firstAid && (
                <Form.Group controlId="formBasicFirstAidDate">
                  <Form.Label>If so, when did they achieve the first aid qualification?</Form.Label>
                  <Datetime
                    required={true}
                    className="qualification-date"
                    name="first_aid_achievement_date"
                    value={firstAidDate}
                    dateFormat="MM/DD/YYYY"
                    timeFormat={false}
                    onChange={updateFirstAidDate}
                  />
                </Form.Group>
              )}

              {/* 5. Instructor Qualification */}
              <Form.Group controlId="formBasicInstructorQualification">
                <Form.Label>Do they have an instructor qualification?</Form.Label>
                <div className="relative">
                  <Form.Control
                    className="instructor-qualification appearance-none pr-10"
                    name="instructor_qualification"
                    as="select"
                    required={true}
                    value={instructorQualification || 0}
                    onChange={updateInstructorQualificationBox}
                  >
                    <option value={0}>Please select </option>
                    {country === "canada" ? (
                      <>
                        <option value={1}>No qualifications</option>
                        <option value={2}>Assistant Instructor</option>
                        <option value={3}>Instructor</option>
                        <option value={4}>Club Instructor</option>
                      </>
                    ) : (
                      <>
                        <option value={5}>No qualifications</option>
                        <option value={6}>Assistant Instructor</option>
                        <option value={7}>Instructor</option>
                        <option value={8}>Club Instructor</option>
                      </>
                    )}
                  </Form.Control>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                {/* Country hint removed per request; option labels already indicate country */}
              </Form.Group>

              {/* 6. Instructor Qualification Date */}
              {instructorQualification && ![1, 5].includes(Number(instructorQualification)) && (
                <Form.Group controlId="formBasicInstructorQualificationDate">
                  <Form.Label>
                    If so, when did they achieve the most recent instructor qualification?
                  </Form.Label>
                  <Datetime
                    required={true}
                    className="qualification-date"
                    name="instructor_qualification_achievement_date"
                    value={instructorQualificationDate || ""}
                    dateFormat="MM/DD/YYYY"
                    timeFormat={false}
                    onChange={updateInstructorQualificationDate}
                  />
                </Form.Group>
              )}

              {/* Submit Button (Triggers parent Form's onSubmit) */}
              {/* <Button 
          variant="primary" 
          type="submit" 
          disabled={!isFormReady || isLoading} 
          className="w-full py-2 flex justify-center items-center mt-4"
        >
          {isLoading ? <LoadingSpinner /> : <LucideArrowRight className="w-5 h-5 mr-2" />}
          {buttonText}
        </Button> */}
              <Button
                type="submit"
                disabled={!isFormReady || isLoading}
                className={`mt-6 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out 
                            ${!isFormReady || isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
              >
                {isLoading ? <LoadingSpinner /> : buttonText}
              </Button>

              {/* {!isFormReady && (
                        <p className="text-sm text-red-500 mt-2 text-center">
                            Please select a user and ensure the security token is loaded. (Status: {csrfState.status})
                        </p>
                    )} */}
              {/* Renders the flash notification bubble */}
              <InlineNotificationBubble message={notification.message} type={notification.type} />
            </fieldset>
          </Form>
        )}
      </div>

      {/* EDITOR MODE SELECTION WITH PERFECT ALIGNMENT & GLOW */}
      <div className="space-y-8 mt-8" aria-busy={modesDisabled}>
        <hr className="my-8" />

        <h3 className="text-xl font-semibold border-b pb-2 mb-4 text-gray-800">
          Which Technique Difference data form entry mode do you prefer?
        </h3>
        <div className="relative">
          {modesDisabled && (
            <div
              aria-hidden="true"
              className="absolute inset-0 z-10 rounded-lg bg-white/50 backdrop-blur-[1px] pointer-events-none"
            />
          )}
          <fieldset
            disabled={modesDisabled}
            aria-disabled={modesDisabled}
            className={modesDisabled ? "opacity-50 pointer-events-none select-none" : ""}
          >
            {EDITOR_MODES.map(({ value, label, icon: Icon }) => {
              const previewSrc = value === "standard" ? standard_form : advanced_form;
              const isSelected = preferredDifferenceEditorMode === value;

              // Match min-height to preview image height
              const minHeightClass = value === "standard" ? "min-h-[193px]" : "min-h-[553px]";

              return (
                <div
                  key={value}
                  className={`
          grid grid-cols-1 lg:grid-cols-2 gap-8 items-start
          transition-all duration-300
        `}
                >
                  {/* LEFT: Radio Option Card */}
                  <div
                    className={`
            relative p-5 rounded-xl border-2 transition-all duration-300 ease-in-out
            ${
              isSelected
                ? "bg-indigo-50 border-indigo-500 shadow-lg ring-4 ring-indigo-200 animate-glow"
                : "bg-white border-gray-200 hover:shadow-md"
            }
            ${modesDisabled ? "opacity-50 pointer-events-none select-none" : ""}
            ${minHeightClass}
          `}
                  >
                    <label
                      htmlFor={`mode-${value}`}
                      className="flex items-start space-x-4 cursor-pointer"
                    >
                      <input
                        id={`mode-${value}`}
                        type="radio"
                        name="editorMode"
                        value={value}
                        checked={isSelected}
                        onChange={handleModeChange}
                        disabled={modesDisabled}
                        className="mt-1 h-5 w-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-5 h-5 text-indigo-600" />
                          <div className="font-bold text-gray-900">{label} Mode</div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          {value === "standard"
                            ? "Simple, guided input form for beginners or quick drafts."
                            : "Paragraph builder using text fragments and linked technique references for experts."}
                        </p>
                      </div>
                    </label>

                    {/* Loading indicator */}
                    {(isLoading || isInitialDataLoading) && (
                      <div className="mt-3 flex items-center text-indigo-600 text-sm">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving preference...
                      </div>
                    )}
                  </div>

                  {/* RIGHT: Screenshot Preview */}
                  <div
                    className={`
            rounded-lg border-2 p-1 self-start transition-all duration-300 ease-in-out
            ${
              isSelected
                ? "border-indigo-500 shadow-xl ring-4 ring-indigo-100 scale-[1.02]"
                : "border-gray-200"
            }
          `}
                  >
                    <img
                      src={previewSrc}
                      alt={`${label} preview`}
                      className="w-full h-auto rounded-md transition-transform duration-300 ease-in-out"
                    />
                    <p
                      className={`
              text-center text-xs pt-1 font-medium
              ${isSelected ? "text-indigo-700" : "text-gray-600"}
            `}
                    >
                      {label} ({value})
                    </p>
                  </div>
                </div>
              );
            })}
          </fieldset>
        </div>
      </div>

      {/* Keyframes for glowing animation */}
      <style>{`
        @keyframes glowPulse {
          0%,
          100% {
            box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.8);
          }
        }
        .animate-glow {
          animation: glowPulse 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default AdminForm;
