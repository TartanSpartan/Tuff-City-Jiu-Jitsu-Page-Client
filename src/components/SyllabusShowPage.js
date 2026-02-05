// Fetch all syllabus data and render here, not on the syllabus show page(s) (those will be for accessing specific syllabi and info about them)
// Note: make the header's background colour a darker shade of gray so that the yellow font stands out more

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Technique, Syllabus, User, TechniqueType } from "../requests";
// import _ from "lodash";
// ERROR: LODASH DOESN'T WORK NOW! Try to resolve this.
// import AuthRoute from "./AuthRoute";
import { Link } from "react-router-dom";
import moment from "moment";
import Button from "react-bootstrap/Button";
import { beltTextColour } from "../utils/beltColourUtils";
// import Button from "react-bootstrap/Button";
import { Nav } from "react-bootstrap";
// import {confirm} from 'react-bootstrap-confirmation';
import { getCountryAdjective } from "../utils/countryHelpers";
import { syllabusLogoMap } from "../utils/syllabusLogoMap";
import "../App.scss";

/* TO DO:
Check out how to get the page to scroll up to the belt banner when a belt is selected from the dropdown on the New Technique Form page; this might be dependent on good caching so that this page doesn't need to reload everything every time it's navigated to; that's one for a subsequent commit for sure
WORKING SCSS!
Word-specific highlighting in sentences?
Hover-over instead of permanent date stamps
Have all techniques be collapsible under technique types
Transition current CSS to Tailwind including for belt colours: export and leverage functions currently in NewTechniqueForm for this via utils folder
*/

function capitaliseTheFirstLetterOfEachWord(words) {
  let individualWord = words.toLowerCase().split(" ");
  for (var i = 0; i < individualWord.length; i++) {
    individualWord[i] = individualWord[i].charAt(0).toUpperCase() + individualWord[i].substring(1);
  }
  return individualWord.join(" ");
}

/**
 * Maps the raw belt color name (e.g., "Orange") to a softer, pastel hexadecimal color.
 * This is used for the full-bleed header background.
 * @param {string} rawColor The color name from the belt object.
 * @returns {string} The desaturated hex color.
 */

// NOTE: If this is to be implemented and included the colours need to stand out more and be less pastel, I like them the original way since they map closely with the real life belt colours
function getPastelBeltColor(rawColor) {
  const cleanColor = rawColor.replace(/ +/g, "").toLowerCase();

  // These are custom, softer hex values for common belt colors
  const colorMap = {
    orange: "#FFDCB3", // Soft Pastel Orange
    green: "#D1EAD1", // Soft Pastel Green
    purple: "#D8BFD8", // Soft Pastel Purple
    yellow: "#FFFFB3", // Pale Yellow
    blue: "#B3E5FF", // Light Pastel Blue
    brown: "#E6C6B3", // Pale Brown
    red: "#FFC0C0", // Light Red/Pink
    black: "#C0C0C0", // Light Gray for Black Belt (usually not full-bleed)
  };

  // Fallback to the original color if not found in the map, or a light gray default
  return colorMap[cleanColor] || "#E0E0E0";
}

// function beltTextColour(integer) {
//   let color = "";
//   if (integer === 2 || integer === 4) {
//     color = "white"; // This makes the dark blue's or purple's header text display better
//     return color;
//   } else {
//     color = "black";
//     return color;
//   }
// }

let finishKyuNumber = function (integer) {
  let suffix = "";
  if (integer === 1) {
    suffix = "st";
    return suffix;
  } else if (integer === 2) {
    suffix = "nd";
    return suffix;
  } else if (integer === 3) {
    suffix = "rd";
    return suffix;
  } else {
    suffix = "th";
    return suffix;
  }
};

let orderArray = [
  "Waza (techniques)",
  "Ukemi (breakfalling)",
  "Atemi (striking)",
  "Kansetsu (locks)",
  "Shime-waza (strangles)",
  "Ne-waza (groundwork)",
  "Nage-waza (throwing)",
  "~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~",
  "Henka-waza (transition techniques)",
  "Kaeshi-waza (counter techniques)",
  "Bunkai (application for defence)",
  "Miscellaneous",
];

// let sortedArray = [];
// Where to put the following lines?
// function groupedTechniqueTypes(technique_types) {
//   const groupedEntries = _.groupBy(technique_types, "category");
//   const testArray = Object.entries(groupedEntries)
//     .sort((a, b) => {
//       return orderArray.indexOf(a[0]) - orderArray.indexOf(b[0]);
//     })
//     .map((item) => item[1]);
//   return testArray;
// }

// Styles for each Technique Type category

const CATEGORY_STYLES = {
  "Waza (techniques)": {
    style: {
      fontWeight: "bold",
      fontStyle: "italic",
      textDecorationLine: "underline",
      textDecorationSkipInk: "none",
    },
    content: "Waza (techniques)",
    showPrevious: true,
  },
  "Ukemi (breakfalling)": {
    style: {
      fontWeight: "bold",
      fontStyle: "italic",
      textDecorationLine: "underline",
      textDecorationSkipInk: "none",
    },
    content: "Ukemi (breakfalling):",
  },
  "Bunkai (application for defence)": {
    style: {
      fontWeight: "bold",
      fontStyle: "italic",
      textDecorationLine: "underline",
      textDecorationSkipInk: "none",
    },
    content: "Bunkai (application for defence):",
  },
  "~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~": {
    style: {
      fontWeight: "bold",
      fontStyle: "italic",
      textAlign: "center",
    },
    content: "~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~",
  },
  "Henka-waza (transition techniques)": {
    style: {
      fontWeight: "bold",
      fontStyle: "italic",
      textDecorationLine: "underline",
      textDecorationSkipInk: "none",
    },
  },
  "Kaeshi-waza (counter techniques)": {
    style: {
      fontWeight: "bold",
      fontStyle: "italic",
      textDecorationLine: "underline",
      textDecorationSkipInk: "none",
    },
  },
  Miscellaneous: {
    content: null, // Don't render
  },
  // Add other specific ones (Henka, Kaeshi) here...
};

// function groupedTechniqueTypes(technique_types) {
//   // Defensive check to handle null or non-array input.
//   if (!technique_types || !Array.isArray(technique_types) || technique_types.length === 0) {
//       return [];
//   }
//   const groupedEntries = technique_types.reduce((acc, obj) => {
//       const key = obj.category;
//       if (!acc[key]) {
//           acc[key] = [];
//       }
//       acc[key].push(obj);
//       return acc;
//   }, {});

//   const testArray = Object.entries(groupedEntries)
//     .sort((a, b) => {
//       return orderArray.indexOf(a[0]) - orderArray.indexOf(b[0]);
//     })
//     .map((item) => item[1]);
//   return testArray;
// }

function groupedTechniqueTypes(technique_types) {
  // Use JS reduce for grouping, replacing lodash
  if (!technique_types || !Array.isArray(technique_types) || technique_types.length === 0) {
    return [];
  }
  const groupedEntries = technique_types.reduce((acc, obj) => {
    const key = obj.category;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});

  // Sort by the predefined orderArray
  const sortedGroups = Object.entries(groupedEntries)
    .sort((a, b) => {
      return orderArray.indexOf(a[0]) - orderArray.indexOf(b[0]);
    })
    .map((item) => item[1]);

  return sortedGroups;
}

// Function to unwrap nested technique/type collections (used in fetchData)
const unwrapNestedResources = (nestedCollection) => {
  return (nestedCollection?.data || []).map((resource) => ({
    id: parseInt(resource.id),
    // Merge attributes directly
    ...resource.attributes,
    technique_type_id: resource.attributes.technique_type_id
      ? parseInt(resource.attributes.technique_type_id)
      : null,
    category: resource.attributes.category || null,
  }));
};

function getSyllabusLogo(country, year) {
  // if (!country) return can_jc_logo; // fallback TODO: Fix with regard to import

  const key = `${country.toLowerCase()}_${year || "default"}`;

  return syllabusLogoMap[key] || syllabusLogoMap[`${country?.toLowerCase()}_default`]; //|| can_jc_logo; TODO: Fix with regard to import

  // Fallbacks: Try country-year → country-default → generic fallback
  // return logoMap[key] || logoMap[`${country.toLowerCase()}_default`] || can_jc_logo; TODO: Fix with regard to import
}

export function SyllabusShowPage({ params, user, location, history }) {
  // State setup
  const [syllabus, setSyllabus] = useState(null);
  const [belts, setBelts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Diagnostic logs to help debug missing nested techniques (kept minimal)

  // Derived state from props
  const isAdmin = user?.is_admin || false;
  // Access syllabusId from the params prop (mimicking react-router behavior)
  const currentSyllabusId = params?.syllabusId;
  console.log("SyllabusShowPage currentSyllabusId:", currentSyllabusId);

  // Memoize grouped technique types per-belt to avoid recalculating on every render
  const groupedTechniqueTypesCache = useMemo(() => {
    const map = {};
    (belts || []).forEach((belt) => {
      const key = belt.id || belt.kyu_number;
      map[key] = groupedTechniqueTypes(belt.technique_types || []);
    });
    return map;
  }, [belts]);

  // Function to fetch data for a specific syllabus ID
  const fetchSyllabusData = useCallback(async (id) => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Prefer JSON:API serialization to ensure technique_type attributes are included
      let syllabusResponse;
      try {
        syllabusResponse = await Syllabus.getLimitedViewJsonApi(id);
      } catch (e) {
        // Fallback to the default limited view if forcing JSON:API fails
        console.warn("getLimitedViewJsonApi failed, falling back to getLimitedView:", e);
        syllabusResponse = await Syllabus.getLimitedView(id);
      }
      const syllabusData = syllabusResponse.data || {};
      // JSON:API may include related resources in `included`.
      const included = syllabusResponse.included || [];

      // Build a lookup map for included resources by type:id for quick access
      const includedMap = included.reduce((acc, resource) => {
        acc[`${resource.type}:${resource.id}`] = resource;
        return acc;
      }, {});

      // Belts may be returned either inside `attributes.belts` or as a relationship
      // depending on how the serializer renders the resource. Check both places.
      const rawBeltData =
        syllabusData.attributes?.belts?.data ||
        syllabusData.relationships?.belts?.data ||
        syllabusData.belts?.data ||
        [];

      const processedBelts = await Promise.all(
        rawBeltData.map(async (beltResource) => {
          // Belt attributes may be missing if the syllabus returned relationship references only.
          // Prefer attributes from the belt resource itself, else fall back to an included resource if present.
          let beltAttributes = beltResource.attributes || {};
          const includedBelt = includedMap[`${beltResource.type}:${beltResource.id}`];
          if ((!beltAttributes || Object.keys(beltAttributes).length === 0) && includedBelt) {
            beltAttributes = includedBelt.attributes || includedBelt || {};
          }

          // Relationship references (may only contain id/type); fetch full resource from `included` when present
          let techniqueTypeRefs = beltResource.relationships?.technique_types?.data || [];
          let techniqueRefs = beltResource.relationships?.techniques?.data || [];

          // If the beltResource is only a reference (no relationships/attributes),
          // try to read relationships from the included belt resource.
          if ((techniqueTypeRefs.length === 0 || techniqueRefs.length === 0) && includedBelt) {
            techniqueTypeRefs = techniqueTypeRefs.length
              ? techniqueTypeRefs
              : includedBelt.relationships?.technique_types?.data || [];
            techniqueRefs = techniqueRefs.length
              ? techniqueRefs
              : includedBelt.relationships?.techniques?.data || [];
          }

          // Try to map from top-level `included` if available
          let technique_types = techniqueTypeRefs
            .map((ref) => {
              // Try exact type:id lookup first, then fall back to any included resource with matching id.
              const res =
                includedMap[`${ref.type}:${ref.id}`] ||
                included.find((r) => r.id === ref.id || r.id === String(ref.id));
              if (res) return { id: parseInt(res.id), ...(res.attributes || {}) };
              return { id: parseInt(ref.id) };
            })
            .map((tt) => ({
              ...tt,
              category: tt.category || tt.sub_category || null,
              technique_type_id: tt.technique_type_id
                ? parseInt(tt.technique_type_id)
                : tt.technique_type_id || null,
            }));

          let techniques = techniqueRefs.map((ref) => {
            const res =
              includedMap[`${ref.type}:${ref.id}`] ||
              included.find((r) => r.id === ref.id || r.id === String(ref.id));
            if (res)
              return {
                id: parseInt(res.id),
                ...(res.attributes || {}),
                relationships: res.relationships || {},
              };
            return { id: parseInt(ref.id) };
          });

          // If included resources weren't provided (or lacked attributes), fetch belt details
          const needFetchDetails =
            technique_types.length === 0 ||
            technique_types.every((t) => !t.category) ||
            techniques.length === 0 ||
            techniques.every((t) => t.technique_type_id === undefined);

          if (needFetchDetails) {
            try {
              const resp = await fetch(
                `${process.env.REACT_APP_BASE_URL}/belts/${beltResource.id}`,
                {
                  credentials: "include",
                }
              );
              if (resp.ok) {
                const beltDetail = await resp.json();
                const detailData = beltDetail.data || beltDetail;
                const detailAttrs = detailData.attributes || detailData;

                // Use unwrapNestedResources when detailed attributes include nested collections
                const ttFromAttrs = unwrapNestedResources(
                  detailAttrs.technique_types || detailAttrs.technique_types
                );
                const techFromAttrs = unwrapNestedResources(
                  detailAttrs.techniques || detailAttrs.techniques
                );

                if (ttFromAttrs && ttFromAttrs.length > 0) technique_types = ttFromAttrs;
                if (techFromAttrs && techFromAttrs.length > 0) techniques = techFromAttrs;
              }
            } catch (e) {
              console.warn("Failed to fetch belt details for", beltResource.id, e);
            }
          }

          // Ensure categories are present so grouping doesn't produce 'null' headers
          technique_types = technique_types.map((tt) => ({
            ...tt,
            category: tt.category || tt.sub_category || `Type ${tt.id}`,
            technique_type_id: tt.technique_type_id
              ? parseInt(tt.technique_type_id)
              : tt.technique_type_id || null,
          }));

          // Ensure techniques include a technique_type_id where possible (try relationships in included resources)
          techniques = techniques.map((t) => {
            const enriched = { ...t };
            if (enriched.technique_type_id) {
              enriched.technique_type_id = parseInt(enriched.technique_type_id);
            } else if (enriched.relationships && enriched.relationships.technique_type?.data) {
              enriched.technique_type_id = parseInt(enriched.relationships.technique_type.data.id);
            } else if (beltAttributes.techniques && beltAttributes.techniques.data) {
              // If attributes include nested technique objects, try to find matching entry
              const match = (beltAttributes.techniques.data || []).find(
                (r) => parseInt(r.id) === enriched.id
              );
              if (match && match.attributes && match.attributes.technique_type_id) {
                enriched.technique_type_id = parseInt(match.attributes.technique_type_id);
              }
            }
            return enriched;
          });

          return {
            id: parseInt(beltResource.id),
            // Ensure colour and kyu_number are present with safe fallbacks
            colour: beltAttributes.colour || "#E0E0E0",
            kyu_number: beltAttributes.kyu_number
              ? parseInt(beltAttributes.kyu_number)
              : parseInt(beltResource.id) || 0,
            ...beltAttributes,
            technique_types,
            techniques,
          };
        })
      );

      setSyllabus(syllabusData.attributes);
      
      // Fetch techniques separately since they may not be included in the syllabus response anymore
      // This handles API performance optimizations that removed techniques from nested responses
      let allTechniques = [];
      try {
        const techniquesResponse = await Technique.allBySyllabus(id);
        console.log("[DEBUG] Techniques response from API:", techniquesResponse);
        
        // Handle different possible response formats (JSON:API or plain array)
        if (techniquesResponse.data && Array.isArray(techniquesResponse.data)) {
          // JSON:API format
          allTechniques = techniquesResponse.data.map((t) => ({
            id: parseInt(t.id),
            ...(t.attributes || {}),
            technique_type_id: t.attributes?.technique_type_id 
              ? parseInt(t.attributes.technique_type_id) 
              : (t.relationships?.technique_type?.data?.id 
                ? parseInt(t.relationships.technique_type.data.id) 
                : null),
            belt_id: t.attributes?.belt_id 
              ? parseInt(t.attributes.belt_id) 
              : (t.relationships?.belt?.data?.id 
                ? parseInt(t.relationships.belt.data.id) 
                : null),
          }));
        } else if (Array.isArray(techniquesResponse)) {
          // Plain array format
          allTechniques = techniquesResponse.map((t) => ({
            ...t,
            id: parseInt(t.id),
            technique_type_id: t.technique_type_id ? parseInt(t.technique_type_id) : null,
            belt_id: t.belt_id ? parseInt(t.belt_id) : null,
          }));
        }
        console.log("[DEBUG] Processed techniques:", allTechniques.slice(0, 3));
      } catch (techErr) {
        console.warn("[API Warning] Failed to fetch techniques separately:", techErr);
      }

      // Merge techniques into their respective belts
      const beltsWithTechniques = processedBelts.map((belt) => {
        const beltTechniques = allTechniques.filter((t) => t.belt_id === belt.id);
        console.log(`[DEBUG] Belt ${belt.id} (kyu ${belt.kyu_number}) matched ${beltTechniques.length} techniques`);
        return {
          ...belt,
          techniques: beltTechniques.length > 0 ? beltTechniques : belt.techniques,
        };
      });

      // Ensure technique_types includes any types referenced by techniques but missing from the belt's technique_types
      beltsWithTechniques.forEach((belt) => {
        // Normalize existing technique type ids (ensure numbers)
        belt.technique_types = (belt.technique_types || []).map((tt) => ({ ...tt, id: Number(tt.id) }));

        const existingTypeIds = new Set((belt.technique_types || []).map((tt) => Number(tt.id)));
        const techniquesReferencing = (belt.techniques || [])
          .map((t) => (t && t.technique_type_id ? Number(t.technique_type_id) : null))
          .filter(Boolean);

        // Diagnostic: log the current ids to help debug mismatches
        console.log(`[DIAG] Belt ${belt.id} existingTypeIds:`, Array.from(existingTypeIds));
        console.log(`[DIAG] Belt ${belt.id} techniquesReferenceTypeIds:`, techniquesReferencing);

        techniquesReferencing.forEach((ttId) => {
          if (!existingTypeIds.has(ttId)) {
            // Try to find a matching technique_type resource in the top-level included map
            const includedRes =
              included.find((r) => Number(r.id) === ttId && String(r.type).toLowerCase().includes("technique")) ||
              included.find((r) => Number(r.id) === ttId);

            if (includedRes) {
              const ttAttr = includedRes.attributes || {};
              belt.technique_types = belt.technique_types || [];
              belt.technique_types.push({
                id: Number(includedRes.id),
                ...ttAttr,
                category: ttAttr.category || ttAttr.sub_category || `Type ${includedRes.id}`,
              });
              existingTypeIds.add(Number(includedRes.id));
              console.log(`[DIAG] Added technique_type from included for belt ${belt.id}:`, Number(includedRes.id));
            } else {
              // Last resort: create a placeholder technique_type so the UI renders a header
              belt.technique_types = belt.technique_types || [];
              belt.technique_types.push({ id: ttId, category: `Type ${ttId}` });
              existingTypeIds.add(ttId);
              console.log(`[DIAG] Added placeholder technique_type for belt ${belt.id}:`, ttId);
            }
          }
        });

        // Deduplicate technique_types by id and ensure categories exist
        const deduped = Array.from(
          new Map((belt.technique_types || []).map((t) => [Number(t.id), { ...t, id: Number(t.id) }])).values()
        ).map((t) => ({
          ...t,
          category: t.category || t.sub_category || `Type ${t.id}`,
        }));

        // Sort technique_types to make rendering deterministic (by id)
        deduped.sort((a, b) => Number(a.id) - Number(b.id));
        belt.technique_types = deduped;
        console.log(`[DIAG] Belt ${belt.id} final technique_types:`, belt.technique_types.map((t) => t.id));
      });

      // Identify technique_type ids that still look like placeholders (e.g., category "Type N")
      const placeholderTypeIds = new Set();
      beltsWithTechniques.forEach((belt) => {
        (belt.technique_types || []).forEach((tt) => {
          const cat = tt.category || tt.sub_category || "";
          if (!cat || /^Type\s*\d+$/i.test(String(cat).trim())) {
            placeholderTypeIds.add(Number(tt.id));
          }
        });
      });

      // Merge any recently-created technique passed via navigation state so it appears immediately
      try {
        const recent = location?.state?.recentCreatedTechnique;
        const recentType = location?.state?.recentTechniqueType;
        if (recent) {
          // Cache the technique_type payload if present
          if (recentType && recentType.id) {
            try {
              TechniqueType.setCached(recentType.id, recentType);
            } catch (e) {}
          }

          // Merge the recent technique into the appropriate belt if it matches this syllabus
          const normRecent = {
            id: Number(recent.id),
            summary: recent.summary || "",
            technique_type_id: recent.technique_type_id ? Number(recent.technique_type_id) : null,
            belt_id: recent.belt_id ? Number(recent.belt_id) : null,
            created_at: recent.created_at || new Date().toISOString(),
          };
          beltsWithTechniques.forEach((belt) => {
            if (belt.id === normRecent.belt_id) {
              belt.techniques = belt.techniques || [];
              // Prevent duplicates
              if (!belt.techniques.some((t) => Number(t.id) === Number(normRecent.id))) {
                belt.techniques = [normRecent, ...belt.techniques];
              }
            }
          });

          // Clear the navigation state to avoid reapplying on back/forward
          try {
            const newState = { ...(location.state || {}) };
            delete newState.recentCreatedTechnique;
            delete newState.recentTechniqueType;
            history.replace(location.pathname + (location.search || ""), newState);
          } catch (e) {}
        }
      } catch (e) {
        console.warn("Failed merging recentCreatedTechnique:", e);
      }

      // Pre-warm missing technique_type metadata before rendering to avoid placeholder flicker
      if (placeholderTypeIds.size > 0) {
        try {
          const fetches = Array.from(placeholderTypeIds).map((id) =>
            TechniqueType.get(id).then((res) => ({ id, res })).catch((e) => ({ id, res: null, err: e }))
          );
          const fetched = await Promise.all(fetches);

          const fetchedMap = fetched.reduce((acc, item) => {
            if (item && item.res) acc[item.id] = item.res;
            return acc;
          }, {});

          // Integrate fetched attributes into technique_types
          const updatedBelts = beltsWithTechniques.map((belt) => {
            const updatedTypes = (belt.technique_types || []).map((tt) => {
              const fetchedData = fetchedMap[Number(tt.id)];
              if (fetchedData) {
                const payload = fetchedData.data || fetchedData;
                const attrs = payload.attributes || payload;
                const category = attrs.category || attrs.sub_category || tt.category || `Type ${tt.id}`;
                return {
                  ...tt,
                  ...attrs,
                  id: Number(tt.id),
                  category,
                };
              }
              return tt;
            });
            return {
              ...belt,
              technique_types: updatedTypes,
            };
          });

          setBelts(updatedBelts);
          console.log("[DIAG] Pre-warmed technique_type details:", Object.keys(fetchedMap));
        } catch (e) {
          console.warn("[DIAG] Failed pre-warming technique_type details:", e);
          // Fallback to render whatever we have
          setBelts(beltsWithTechniques);
        }
      } else {
        setBelts(beltsWithTechniques);
      }

      setIsLoading(false);
    } catch (err) {
      console.error("[API Error] Failed to load syllabus:", err);
      setError(`Failed to load syllabus data for ID ${id}.`);
      setBelts([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array means this function reference is stable

  // Function to fetch the primary syllabus ID if none is provided
  const fetchPrimarySyllabus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const primaryResponse = await Syllabus.getPrimary();
      const primaryId = primaryResponse.data?.id;

      if (primaryId) {
        fetchSyllabusData(primaryId);
      } else {
        setError("Primary syllabus ID not found and no ID provided in URL.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("[Fatal API Error] Failed to determine primary syllabus:", err);
      setError("Could not connect to determine primary syllabus.");
      setIsLoading(false);
    }
  }, [fetchSyllabusData]);

  // useEffect Hook: Mimics componentDidMount and componentDidUpdate for syllabusId changes
  useEffect(() => {
    if (currentSyllabusId) {
      fetchSyllabusData(currentSyllabusId);
    } else {
      // Fallback if no ID is provided in the route
      fetchPrimarySyllabus();
    }
  }, [currentSyllabusId, fetchSyllabusData, fetchPrimarySyllabus]);

  // Smooth-scroll to a specific belt banner if indicated via URL or localStorage
  useEffect(() => {
    if (isLoading) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const queryKyu = params.get("scroll_to_belt_kyu") || params.get("belt_kyu");
      const hash = window.location.hash?.startsWith("#belt-kyu-")
        ? window.location.hash.replace("#belt-kyu-", "")
        : null;
      const ls = localStorage.getItem("scroll_to_belt_kyu");

      const targetKyu = Number(queryKyu || hash || ls);
      if (!targetKyu) return;

      // Ensure that the belt exists in the loaded dataset
      const exists = (belts || []).some((b) => Number(b.kyu_number) === targetKyu);
      if (!exists) return;

      // Defer until after paint to ensure the elements are in the DOM
      const scroll = () => {
        const el = document.getElementById(`belt-banner-kyu-${targetKyu}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          // Persist anchor in the URL for clarity when not using HashRouter
          // If HashRouter is active, the hash begins with "#/" and is used for routing.
          // In that case, avoid overwriting it with an anchor to prevent route changes.
          try {
            const currentHash = window.location.hash || "";
            if (!currentHash.startsWith("#/")) {
              window.location.hash = `belt-kyu-${targetKyu}`;
            }
          } catch {}
          // Cleanup: remove the localStorage flag
          localStorage.removeItem("scroll_to_belt_kyu");
        }
      };
      // Use rAF for smoother scheduling after layout
      if (typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(scroll);
      } else {
        setTimeout(scroll, 0);
      }
    } catch (e) {
      console.warn("[SCROLL DEBUG] Failed to process scroll_to_belt_kyu:", e);
    }
  }, [isLoading, belts]);

  // Function to delete a technique
  const deleteTechnique = (id) => {
    // The original class component's delete was simplistic, we'll keep that
    // logic but apply it to functional state setting (optimistic update).
    Technique.destroy(id)
      .then(() => {
        // Update the belts state by filtering out the deleted technique
        setBelts((prevBelts) =>
          prevBelts.map((belt) => ({
            ...belt,
            techniques: belt.techniques.filter((q) => q.id !== id),
          }))
        );
      })
      .catch((err) => {
        console.error("Failed to delete technique:", err);
        // Might show a notification here
      });
  };

  // --- Render Logic ---

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-700">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
          <h2 className="text-2xl font-semibold">Loading Syllabus</h2>
        </div>
        <p>Fetching belt and technique data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-700 p-8 text-center">
        <h2 className="text-3xl font-bold mb-4 text-red-600">Loading Error</h2>
        <p className="text-lg mb-6">{error}</p>
      </div>
    );
  }

  // No data found after loading
  if (belts.length === 0 && !syllabus) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-700 p-8 text-center">
        <h2 className="text-3xl font-bold mb-4 text-red-600">No Syllabus Data Found</h2>
        <p className="text-md font-medium">
          The application could not find any belt or technique data for this syllabus.
        </p>
      </div>
    );
  }

  // 1. Filter and sort belts for display
  const filteredAndSortedBelts = (belts || [])
    .slice()
    // Filter out kyu_number 8 (e.g., initial white belt)
    .filter((belt) => belt.kyu_number !== 8)
    // Sort the belts by kyu_number in DESCENDING order (7th Kyu first, 1st Kyu last).
    .sort((a, b) => b.kyu_number - a.kyu_number);

  return (
    <main className="SyllabusShowPage min-h-screen bg-gray-100">
      {/* Dark Header for Syllabus Title */}
      <div className="bg-gray-800 p-4 text-center shadow-lg mb-4">
        <h2 className="text-2xl font-extrabold tracking-wider text-yellow-400">SYLLABUS</h2>
      </div>

      {/* TODO: consider changing background colour based on which syllabus if more distinction is desired */}

      <div className="central max-w-4xl mx-auto p-4 md:p-8">
        <div id="logoBox" className="flex justify-center mb-8">
          <img
            src={getSyllabusLogo(syllabus?.country, syllabus?.year)}
            alt={`${syllabus?.country || "Syllabus"} Logo`}
            id="syllabusLogo"
            className="max-w-xs w-full h-auto rounded shadow-md"
          />
        </div>

        {/* Optional: show caption */}
        <div className="text-center text-sm text-gray-500 italic">
          {syllabus?.country && syllabus?.year
            ? `${getCountryAdjective(syllabus.country)} Syllabus (${syllabus.year})`
            : ""}
        </div>
      </div>

      {/* This is the main loop. 
        We render the full-width header OUTSIDE the central container, 
        and then render the detailed content INSIDE the central container. 
      */}
      {filteredAndSortedBelts.map((belt) => (
        <React.Fragment key={belt.kyu_number}>
          {/* 1. FULL-WIDTH BELT HEADER */}
          <div
            // w-full ensures it spans the whole screen width
            className="w-full mb-8 shadow-inner"
            id={`belt-banner-kyu-${belt.kyu_number}`}
            style={{
              // Set background color from data (full-bleed)
              backgroundColor: belt.colour.replace(/ +/g, ""),
              // backgroundColor: getPastelBeltColor(belt.colour),
            }}
          >
            <h1
              // p-4 provides generous padding top/bottom and left/right
              className={`text-xl md:text-2xl font-bold p-4 text-center ${beltTextColour(Number(belt.kyu_number))}`}
              style={{
                textDecorationLine: "underline",
                textDecorationSkipInk: "none",
                pointerEvents: "none",
              }}
            >
              {belt.kyu_number +
                finishKyuNumber(belt.kyu_number) +
                " Kyu (" +
                capitaliseTheFirstLetterOfEachWord(belt.colour) +
                ")"}
            </h1>
          </div>

          {/* 2. CONSTRAINED BELT CONTENT (Techniques) */}
          <div className="central max-w-4xl mx-auto p-4 md:p-8 pt-0">
            {/* Iterate through grouped technique types for the current belt */}
            {(groupedTechniqueTypesCache[belt.id || belt.kyu_number] || []).map((techniqueTypeGroup) => {
              const category = techniqueTypeGroup[0].category;
              const headerInfo = CATEGORY_STYLES[category] || {
                content: category + ":",
                style: { fontWeight: "bold", fontStyle: "italic" },
                showPrevious: false,
              };

              if (headerInfo.content === null) return null;

              const isSeparator = category === "~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~";

              return (
                <div key={category} className="mb-6">
                  {/* RENDER THE CATEGORY HEADER */}
                  <div
                    style={headerInfo.style}
                    className={`text-lg mb-2 ${category === "Waza (techniques)" ? "underline-me" : ""}`}
                  >
                    {headerInfo.content || category + ":"}
                  </div>

                  {/* Handle "All previous syllabus." text */}
                  {headerInfo.showPrevious && belt.kyu_number !== 7 && (
                    <div className="mt-2 text-sm italic">{"All previous syllabus."}</div>
                  )}

                  {isSeparator ? <br /> : null}

                  {/* Technique Boxes */}
                  {!isSeparator &&
                    techniqueTypeGroup.map((technique_type) => {
                      // Debug: Log technique_type and matching techniques
                      const matchingTechniques = (belt.techniques || []).filter(
                        (technique) => technique.technique_type_id === technique_type.id
                      );
                      // NOTE: Detailed per-technique diagnostics removed to reduce console noise
                      return (
                        <div key={technique_type.id} className="mt-4">
                          {matchingTechniques.map((element) => {
                              return (
                                <div
                                  key={element.id}
                                  className="techniqueBox bg-white p-3 mb-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300"
                                  id="techniqueBox"
                                  style={{ border: "1px solid #ccc" }}
                                >
                                  <Link
                                    to={`/techniques/${element.id}`}
                                    key={element.id}
                                    id="techniqueLink"
                                    className="text-blue-600 hover:text-blue-800 font-semibold text-base"
                                  >
                                    {element.summary}
                                  </Link>
                                  <div className="text-sm text-gray-500 italic">
                                    {technique_type.sub_category}
                                  </div>

                                  {isAdmin && element.is_different && (
                                    <div className="mt-3 p-2 bg-yellow-50 border-l-4 border-yellow-500">
                                      <p className="font-bold text-sm text-yellow-700 mb-1">
                                        What's different to the UK syllabus?
                                      </p>
                                      <p className="text-sm text-yellow-700">
                                        {element.difference_content}
                                      </p>
                                    </div>
                                  )}

                                  {isAdmin && (
                                    <p className="text-xs text-gray-400 mt-2">
                                      Posted on {moment(element.created_at).format("MMM Do, YYYY")}
                                    </p>
                                  )}

                                  {/* Admin button removed here; shown once per belt below */}
                                  {/* Delete Button (Admin Only) */}
                                  {isAdmin && (
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => deleteTechnique(element.id)}
                                      className="mt-2 text-xs"
                                    >
                                      Delete
                                    </Button>
                                  )}
                                  {/* Need confirmation window and visual indication of successful delete */}
                                </div>
                              );
                            })}
                        </div>
                      );
                    })}
                </div>
              );
            })}

            {/* Admin Button to create new techniques (belt-aware). TODO: this has been suggested to clash with the green belt so a contrast should be considered.*/}
            {isAdmin && (
              <div className="flex justify-center mt-6 mb-10">
                <Button
                  variant="success"
                  size="lg"
                  href={`/technique/new?belt_kyu=${belt.kyu_number}`}
                  className="shadow-md hover:shadow-lg transition-shadow"
                >
                  Add New Technique
                </Button>
              </div>
            )}
          </div>
        </React.Fragment>
      ))}
    </main>
  );
}

export default SyllabusShowPage;
