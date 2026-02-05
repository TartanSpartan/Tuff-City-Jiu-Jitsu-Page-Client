// This file bridges to the API by using CRUD functions to make requests to various endpoints

import axios from "axios";

// TODO: Try to do a console.log(return value) to find the errant "<" which is an error complained about in the browser console

// Safe JSON parsing helper to avoid uncaught JSON.parse errors when the server
// returns HTML or other non-JSON content (common for 5xx error pages).
function safeJsonParse(text, context = "") {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    try {
      console.error(`[safeJsonParse] failed to parse JSON (${context}):`, e);
      // Log a short excerpt of the payload to help debugging (keeps console output small)
      if (typeof text === "string") console.error(text.slice(0, 200));
    } catch (ee) {
      /* ignore logging failures */
    }
    return null;
  }
}

function getJwt() {
  return localStorage.getItem("jwt");
}

// Utility function to handle the response status
const handleResponse = async (res) => {
  // Check for successful status (200-299 range)
  if (!res.ok) {
    // If the response is not OK, read the body as text (to catch the error message)
    // and throw a structured error object.
    const errorText = await res.text();
    throw new Error(
      `HTTP error! Status: ${res.status}. Response: ${errorText.substring(0, 100)}...`
    );
  }
  // If the response is OK, safely proceed to parse as JSON.
  return res.json();
};

/**
 * Helper function to transform the raw Rails JSON:API response structure
 * into a flat array of user objects with nested relationships.
 * This is necessary because JSON:API places relationships (like belt grades)
 * in a separate 'included' array at the top level. This can be expanded later
 * for other responses if necessary e.g. Syllabus with nested techniques.
 */
const normalizeJsonApi = (jsonApiData) => {
  // Basic defensive check
  if (!jsonApiData || !jsonApiData.data) return [];

  // 1. Map all included resources (BG/IQ) by type and ID for fast lookup
  const includedMap = {};
  if (jsonApiData.included) {
    jsonApiData.included.forEach((resource) => {
      const key = `${resource.type}-${resource.id}`;
      includedMap[key] = {
        id: resource.id,
        ...resource.attributes, // Belt rank, instructor title, etc.
      };
    });
  }

  // 2. Map the primary user data and attach the corresponding nested objects
  const normalizedUsers = jsonApiData.data.map((userResource) => {
    // Handle case where userResource is already flat (if API changed structure)
    if (!userResource.attributes) return userResource;

    const userRelationships = userResource.relationships;

    // Function to look up and attach a related object
    const getNestedResource = (relationshipKey) => {
      const relData = userRelationships[relationshipKey]?.data;
      if (relData) {
        const key = `${relData.type}-${relData.id}`;
        // Attach the full object from the map, or a fallback if not found
        return includedMap[key] || { id: relData.id, name: "Data not included" };
      }
      return null; // No relationship exists
    };

    return {
      // Include the top-level ID
      id: userResource.id,
      // Spread all basic user fields (first_name, email, etc.)
      ...userResource.attributes,

      // Attach the nested objects
      current_belt_grade: getNestedResource("current_belt_grade"),
      current_instructor_qualification: getNestedResource("current_instructor_qualification"),
    };
  });

  return normalizedUsers;
};

// const normalizeTechniqueParams = (params) => {
//     // We must rename client-side keys to match what the Rails strong parameters expects.
//     // Specifically: 'belt' -> 'belt_id', 'videos' -> 'videos_attributes'.
//     // 'category' and 'sub_category' are often part of a TechniqueType,
//     // but without the full context, we assume the backend expects a technique_type_id.
//     // Since the logs show them as 'Unpermitted', we must omit or map them.
//     // Given the initial params description mentioned a 'technique type ID',
//     // we assume the category fields are used to find that ID on the client, or are simply not needed
//     // if a proper 'technique_type_id' is already included (which is missing in the log).

//     const normalized = {
//         // Assume 'summary' is correct
//         summary: params.summary,

//         // Map 'belt' to 'belt_id' (common Rails convention for foreign keys)
//         belt_id: params.belt,

//         // Keep 'syllabus_id' (already correctly named)
//         syllabus_id: params.syllabus_id,

//         // Map 'videos' array to 'videos_attributes' for nested creation/update
//         videos_attributes: params.videos,

//         // If a 'technique_type_id' exists, include it.
//         // We exclude 'category' and 'sub_category' as they were unpermitted.
//         // If 'category' is supposed to map to 'technique_type_id',
//         // the client must be updated to pass 'technique_type_id' instead of 'category'.
//         // For now, we only include the permitted fields to resolve the 422.
//     };

//     // If there is a separate technique type ID (as suggested in the previous prompt),
//     // we would include it here, but based on the log, it's not present or is misnamed.
//     // We will conditionally include other fields that might be used:
//     if (params.technique_type_id) {
//         normalized.technique_type_id = params.technique_type_id;
//     }

//     // Clean up undefined or null values before returning
//     Object.keys(normalized).forEach(key => normalized[key] === undefined || normalized[key] === null && delete normalized[key]);

//     return normalized;
// }

const getCSRFToken = () => {
  // The name of the cookie rails sets
  const name = "CSRF-TOKEN=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    // Clean up leading whitespace
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    // Check if this is the CSRF-TOKEN cookie
    if (c.indexOf(name) === 0) {
      // Return the value part
      return c.substring(name.length, c.length);
    }
  }
  return null; // Token not found
};

// // --- Retry Utility (Exponential Backoff) ---
// /**
//  * Executes a fetch request with automatic retries and exponential backoff on network/timeout errors.
//  * It does NOT retry on structured API errors (4xx/5xx) to avoid repeated failed business logic.
//  *
//  * @param {string} url The URL to fetch.
//  * @param {object} options The fetch options (method, headers, body, etc.).
//  * @param {number} retries The number of times to retry (default 3).
//  * @returns {Promise<Response>} The successful Response object.
//  * @throws {Error} Throws an error on final network failure or the first structured API error.
//  */

// TODO: Implement this into more requests below beyond just User.update

export const fetchWithRetry = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        // Do not retry on a 4xx or 5xx response. Read the error data and throw immediately.
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || response.statusText;
        // Encode the API error details in the error message for consistent handling by the caller.
        throw new Error(
          JSON.stringify({ status: response.status, error: errorMessage, errors: errorData.errors })
        );
      }
      return response;
    } catch (error) {
      // Check if the error is a structured API error (which starts with '{"status...')
      // or if it's the last attempt. If so, rethrow the error.
      if (i === retries - 1 || error.message.startsWith('{"status')) {
        throw error;
      }
      // Wait using exponential backoff (100ms, 200ms, 400ms, ...)
      console.warn(
        `Fetch attempt failed (${i + 1}/${retries}). Retrying in ${Math.pow(2, i) * 100}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 100));
    }
  }
};

// TODO: Determine whether to introduce authorization in headers based on JWT

// TODO: Make a uniform format for requests, following after the example of Create Waiver, for good error handling and
// logging of responses, and add full async functionality to await fetches from the API. Describe *how* errors are handled, and
// the Promises which are returned in each function's case.

export const Token = {
  create(params) {
    // Create an authorization token
    return fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    }).then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        return { error: "Something went wrong!" };
      }
    });
  },
};

// Handling fetch, delete, update etc requests for sessions, users etc

export const Syllabus = {
  // Fetch one syllabus from the server
  one(id) {
    return fetch(`${process.env.REACT_APP_BASE_URL}/syllabi/${id}/user_grade_syllabus`, {
      credentials: "include",
    }).then((res) => res.json());
  },

  // This fetches a list of all syllabi (e.g., Canada 2021, UK 2025).
  all() {
    return fetch(
      `${process.env.REACT_APP_BASE_URL}/syllabi`, // Assumes the Rails index path is /syllabi
      {
        credentials: "include",
      }
    )
      .then(handleResponse)
      .then((data) => {
        return data;
      });
  },

  // all(params) { (original, deprecated, using outdated filtering on the frontend)
  //   // This request is designed to render the syllabus, technique by technique and belt by belt, up to the belt just above
  //   // the user's current belt. The idea is to incentivize the student to learn the syllabus and prepare for the next belt
  //   // but also to not overwhelm them with syllabus material more than one belt above their current level (exceptions could
  //   // be made for special circumstances such as a student who's studied for an unusually long time and whom we deem eligible
  //   // to double grade from white to orange belt). See the find_all_belts function in the controller for more info. The
  //   // relevant params are the syllabus ID and the current user ID.

  //   return fetch(
  //     `${process.env.REACT_APP_BASE_URL}/syllabi/${params.id}/syllabi_full?user_id=${encodeURIComponent(params.user_id)}`,
  //     {
  //       credentials: "include"
  //     }
  //   )
  //     .then(handleResponse)
  //     .then((data) => {
  //       // We no longer need the explicit return of data here, but keeping it
  //       // for consistency if other processing steps are required.
  //       return data;
  //     });
  // },
  // TODO: try .then chaining (i.e. at the end), then console.log the return value, because not all of the syllabus is being returned (NOTE: is this still the case?)

  // Fetch the syllabus filtered for the authenticated student.
  // This request hits the endpoint that uses the SyllabusLimitedSerializer.
  // The serializer uses the authenticated user's credentials (from the included cookie/session)
  // to determine their current belt and calculate the visible belt range.
  getLimitedView(id) {
    // The previous request used a user_id query parameter, but the backend should use
    // the authenticated user from the session/token (handled by "credentials: include").
    // If the backend needs a specific syllabus ID, we pass it via the path.
    return fetch(
      // Assuming the controller endpoint for the filtered view is still /syllabi_full
      `${process.env.REACT_APP_BASE_URL}/syllabi/${id}/user_grade_syllabus`,
      {
        credentials: "include",
      }
    )
      .then(handleResponse) // assuming handleResponse is defined elsewhere
      .then((data) => {
        return data;
      });
  },
    // Request the limited view but force JSON:API serialization on the server
    getLimitedViewJsonApi(id) {
      return fetch(
        `${process.env.REACT_APP_BASE_URL}/syllabi/${id}/user_grade_syllabus?use_jsonapi=1`,
        {
          credentials: "include",
        }
      )
        .then(handleResponse)
        .then((data) => {
          return data;
        });
    },
  // TODO: The original TODO about the syllabus not being fully returned is likely fixed by the serializer's
  // inclusion of `includes(:techniques, :technique_types)`. Need to test this new endpoint!

  // New method to fetch the single syllabus marked as primary
  async getPrimary() {
    // The correct endpoint structure to fetch the dynamically selected primary syllabus.
    const url = `${process.env.REACT_APP_BASE_URL}/syllabi/get_primary`;
    console.log(`[API REQUEST] Fetching Primary Syllabus from: ${url}`);

    try {
      const response = await fetch(url, {
        method: "GET", // Correctly set to GET
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies/credentials for session handling
      });

      // Check if the response was successful (status 200-299)
      if (!response.ok) {
        // If the server returns a 404 (no primary syllabus found) or another error, throw it.
        const errorData = await response.json();
        throw new Error(
          `HTTP error! Status: ${response.status}. Message: ${errorData.error || response.statusText}`
        );
      }

      // Parse and return the JSON data
      const data = await response.json();
      return data;
    } catch (error) {
      // Log the error for debugging and re-throw it for the calling function to handle
      console.error("[API ERROR] Failed to fetch primary syllabus:", error);
      throw error;
    }
  },

  updatePrimary(syllabusId) {
    const csrfToken = getCSRFToken();
    return fetch(`${process.env.REACT_APP_BASE_URL}/syllabi/set_primary`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
        // Include authorization header if required
      },
      // The body needs to match what the Rails controller expects (syllabus_id)
      body: JSON.stringify({ syllabus_id: syllabusId }),
      credentials: "include",
    }).then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Failed to update primary syllabus.");
      }
    });
  },

  updateSecondary(syllabusId) {
    const csrfToken = getCSRFToken();
    return fetch(`${process.env.REACT_APP_BASE_URL}/syllabi/set_secondary`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
        // Include authorization header if required
      },
      body: JSON.stringify({ syllabus_id: syllabusId }),
      credentials: "include",
    }).then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Failed to update secondary syllabus.");
      }
    });
  },

  // New method to fetch the single syllabus marked as secondary
  async getSecondary() {
    const url = `${process.env.REACT_APP_BASE_URL}/syllabi/get_secondary`;
    console.log(`[API REQUEST] Fetching Secondary Syllabus from: ${url}`);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! Status: ${response.status}. Message: ${errorData.error || response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("[API ERROR] Failed to fetch secondary syllabus:", error);
      throw error;
    }
  },
};

export const Video = {
  all() {
    // Fetch all videos from the server, as a series of URLs to be rendered
    return fetch(`${process.env.REACT_APP_BASE_URL}/videos`, {
      credentials: "include",
    }).then((res) => res.json());
  },

  find(id) {
    // Find a specific video URL by ID
    return fetch(`${process.env.REACT_APP_BASE_URL}/videos/${id}`, {
      credentials: "include",
    }).then((res) => {
      console.log("This is the find video response", res);
      return res.json();
    });
  },

  group(id) {
    // Search for a video URL based on the associated technique_id, e.g. the video representing a specific arm-lock
    return fetch(`${process.env.REACT_APP_BASE_URL}/techniques/${id}/videos`, {
      credentials: "include",
    }).then((res) => {
      console.log("This is the group search video response", res);
      return res.json();
    });
  },

  destroy(id) {
    // Destroy a video record
    return fetch(`${process.env.REACT_APP_BASE_URL}/videos/${id}`, {
      method: "DELETE",
      credentials: "include",
    }).then((res) => res.json());
  },

  update(id, data) {
    // Update a video- really to delete specifically one country's URL rather than the other's one
    return fetch(`${process.env.REACT_APP_BASE_URL}/videos/${id}`, {
      credentials: "include",
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => {
      console.log("Are we hitting this for the video update?");
      return res.json();
    });
  },
};

export const Belt = {
  // A Belt object is simply a representation of each coloured belt in the syllabus which can help usefully render for
  // example a syllabus page corresponding of a certain number of techniques per page (and belt). It does NOT correspond
  // to the object which represents each student/instructor's personal belt colour, as there are multiple white belt students,
  // etc. For that object, please see the Belt Grade requests further down this file.

  all() {
    // Fetch all belts from the server, currently from white to brown belt
    return fetch(`${process.env.REACT_APP_BASE_URL}/belts`, {
      credentials: "include",
    }).then((res) => res.json());
  },

  allBySyllabus(syllabusId) {
    if (!syllabusId) {
      return Promise.resolve([]);
    }
    // Fetch belts filtered by syllabus
    return fetch(`${process.env.REACT_APP_BASE_URL}/belts?syllabus_id=${syllabusId}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        // Normalize JSON:API or plain arrays
        if (Array.isArray(data?.data)) {
          return data.data.map((item) => ({ id: item.id, ...item.attributes }));
        }
        if (Array.isArray(data)) {
          return data;
        }
        return [];
      })
      .catch((error) => {
        console.error(`Error fetching belts for syllabus ${syllabusId}:`, error);
        return [];
      });
  },

  find(id) {
    // Find a specific belt by ID, eg ID = 1 means 1st Kyu or brown belt. Returns a Promise that resolves with the belt object
    // if found, or (TODO) rejects with an error if not found (depending on API response).
    return fetch(`${process.env.REACT_APP_BASE_URL}/belts/${id}`, {
      credentials: "include",
    }).then((res) => {
      console.log("This is the belt response", res);
      return res.json();
    });
  },

  // // Fetch one belt from the server
  // one() {
  //   return fetch(`${REACT_APP_BASE_URL}/belts`, {
  //     credentials: "include"
  //   }).then(res => res.json());
  // },
};

export const TechniqueType = {
  all() {
    // Fetch all technique types from the server
    return fetch(`${process.env.REACT_APP_BASE_URL}/technique_types`, {
      credentials: "include",
    }).then((res) => {
      console.log(res);
      return res.json();
    });
  },

  /**
   * Finds an existing TechniqueType based on criteria, or creates it if it doesn't exist.
   * This sends a POST request to the custom `find` action using find_or_create_by.
   * @param {Object} params - The lookup/creation parameters, e.g., { technique_type: { syllabus_id, ... } }
   * @returns {Promise<Object>} The found or created TechniqueType object, or an errors object.
   */
  async find(params) {
    const csrfToken = getCSRFToken();

    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/technique_types/find`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify(params),
      credentials: "include",
    });

    // Be defensive when parsing server responses: the server may return HTML (e.g., 500 pages)
    // which would cause res.json() to throw. Read text first and attempt a safe JSON parse.
    const text = await res.text().catch(() => null);
    const data = safeJsonParse(text, "TechniqueType.find") || (text ? { error: text } : {});

    // Check for success (200 OK) or unprocessable entity (422) which is the expected
    // error response when using find_or_create_by and validation fails.
    if (!res.ok) {
      // The backend returns { errors: [...] } for 422 status codes
      const errs = (data && data.errors) || (data && data.error) || `Server error during Technique Type processing (Status: ${res.status}).`;
      if (Array.isArray(errs)) {
        return { errors: errs };
      }
      return { errors: [{ message: errs }] };
    }

    // Success (200 OK) — return parsed JSON or the raw text wrapped as `data`.
    return data;
  },

  // The previous find-by-ID logic is now named 'get' to prevent conflict.
  // Simple in-memory cache to avoid refetching technique types repeatedly during a session
  _cache: new Map(),
  get(id) {
    const key = String(id);
    const LOCAL_KEY = "technique_type_cache_v1";
    const TTL_MS = 1000 * 60 * 60; // 1 hour

    // 1) Check in-memory cache
    if (TechniqueType._cache.has(key)) {
      return Promise.resolve(TechniqueType._cache.get(key));
    }

    // 2) Check localStorage cache
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const entry = parsed[key];
        if (entry && entry.ts && Date.now() - entry.ts < TTL_MS) {
          TechniqueType._cache.set(key, entry.data);
          return Promise.resolve(entry.data);
        }
      }
    } catch (e) {
      console.warn("TechniqueType cache read failed:", e);
    }

    // 3) Fetch from network
    return fetch(`${process.env.REACT_APP_BASE_URL}/technique_types/${id}`, {
      credentials: "include",
    }).then((res) => {
      if (res.status === 204) {
        TechniqueType._cache.set(key, null);
        // persist null to localStorage
        try {
          const raw = localStorage.getItem(LOCAL_KEY) || "{}";
          const parsed = JSON.parse(raw);
          parsed[key] = { ts: Date.now(), data: null };
          localStorage.setItem(LOCAL_KEY, JSON.stringify(parsed));
        } catch (e) {}
        return null;
      }
      return res.json().then((data) => {
        TechniqueType._cache.set(key, data);
        // persist to localStorage
        try {
          const raw = localStorage.getItem(LOCAL_KEY) || "{}";
          const parsed = JSON.parse(raw);
          parsed[key] = { ts: Date.now(), data };
          localStorage.setItem(LOCAL_KEY, JSON.stringify(parsed));
        } catch (e) {
          // ignore localStorage failures
        }
        return data;
      });
    });
  },
  // Allow callers to seed the cache with a known payload (useful after creation)
  setCached(id, payload) {
    try {
      const key = String(id);
      TechniqueType._cache.set(key, payload);
      const LOCAL_KEY = "technique_type_cache_v1";
      const raw = localStorage.getItem(LOCAL_KEY) || "{}";
      const parsed = JSON.parse(raw);
      parsed[key] = { ts: Date.now(), data: payload };
      localStorage.setItem(LOCAL_KEY, JSON.stringify(parsed));
    } catch (e) {
      console.warn("TechniqueType.setCached failed:", e);
    }
  },
};

export const Technique = {
  // Fetch all techniques from the server
  all() {
    return fetch(`${process.env.REACT_APP_BASE_URL}/techniques`, {
      credentials: "include",
    }).then((res) => {
      console.log(res);
      return res.json();
    });
  },

  allBySyllabus(syllabusId) {
    if (!syllabusId) {
      return Promise.resolve([]);
    }
    // API endpoint to fetch techniques belonging to a specific syllabus
    return fetch(`${process.env.REACT_APP_BASE_URL}/techniques?syllabus_id=${syllabusId}`, {
      credentials: "include",
    })
      .then((res) => {
        console.log(`Fetched techniques for syllabus ID ${syllabusId}:`, res);
        // NOTE: Assuming the API returns an array of technique objects (not JSON:API format)
        return res.json();
      })
      .catch((error) => {
        console.error(`Error fetching techniques for syllabus ${syllabusId}:`, error);
        return { errors: [{ message: "Failed to load techniques." }] };
      });
  },

  find() {
    // Find a specific technique (TODO: may need to refine in tandem with API endpoint)
    return fetch(`${process.env.REACT_APP_BASE_URL}/techniques_find`, {
      credentials: "include",
    }).then((res) => {
      console.log(res);
      return res.json();
    });
  },

  async create(params) {
    // Create a technique
    console.log("############## technique test", params);

    // Params is an object that represents a technique, including the summary description, a technique type ID
    // to describe what class of techniques it belongs to, a video ID to match it toma video and a belt ID to
    // match it to a specific belt colour.

    const csrfToken = getCSRFToken();

    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/techniques`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify(params),
    });

    // Enhanced error handling: return structured errors for 4xx/5xx
    const contentType = res.headers.get("content-type") || "";
    let data = null;
    try {
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        // Diagnostic: log raw non-JSON response to help debugging
        console.warn("Technique.create: non-JSON response (status", res.status, "):", text);
        try {
          data = JSON.parse(text);
        } catch (parseErr) {
          // If parsing fails, wrap raw text into an error object
          data = { error: text };
        }
      }
    } catch (parseErr) {
      // Log headers/status and raw text for debugging unexpected parse failures
      try {
        const rawText = await res.text();
        console.error("Technique.create: parse error:", parseErr, "status:", res.status, "headers:", Array.from(res.headers.entries()), "raw:", rawText);
        data = { error: rawText || res.statusText };
      } catch (e) {
        console.error("Technique.create: parse error and failed to read raw text:", e);
        data = { error: res.statusText };
      }
    }

    if (!res.ok) {
      // Rails 422 often returns { errors: ["..."] }
      const rawErrors = data?.errors || [data?.error || res.statusText];
      const normalizedErrors = Array.isArray(rawErrors)
        ? rawErrors.map((e) => (typeof e === "string" ? { message: e } : e))
        : [{ message: String(rawErrors) }];
      return { errors: normalizedErrors };
    }

    return data;
  },

  one(id) {
    // Fetch a single technique
    return fetch(`${process.env.REACT_APP_BASE_URL}/techniques/${id}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .catch(console.error);
  },

  async update(id, params) {
    // Update a technique
    console.log("this is from request js and the technique params", params);

    const csrfToken = getCSRFToken();

    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/techniques/${id}`, {
      credentials: "include",
      method: "PATCH",
      body: JSON.stringify(params),
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
    });

    // Use handleResponse for proper status code and error handling.
    return handleResponse(res);
  },

  destroy(id) {
    // Destroy a technique
    return fetch(`${process.env.REACT_APP_BASE_URL}/techniques/${id}`, {
      method: "DELETE",
      credentials: "include",
    }).then((res) => res.json());
  },

  details(id) {
    // Get the details of a technique so that it may be updated
    return fetch(`${process.env.REACT_APP_BASE_URL}/techniques/${id}`, {
      method: "GET",
      credentials: "include",
    }).then((res) => res.json());
  },
};

export const Difference = {
  // Fetches all difference records
  all() {
    return fetch(`${process.env.REACT_APP_BASE_URL}/differences`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(handleResponse)
      .catch((error) => {
        console.error("Difference.all failed:", error);
        return { status: "error", message: "Network error fetching all differences." };
      });
  },

  // Fetches a single difference by ID
  get(id, include) {
    let url = `${process.env.REACT_APP_BASE_URL}/differences/${id}`;

    // Use the passed include path, or fall back to a default if none is provided
    const includePath = include || "compared_to_technique.belt";

    // Construct the URL with the determined include path
    const urlWithInclude = `${url}?include=${includePath}`;

    return fetch(urlWithInclude, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(handleResponse)
      .catch((error) => {
        console.error(`Difference.get(${id}) failed:`, error);
        return { status: "error", message: `Network error fetching difference ID ${id}.` };
      });
  },

  // Fetches all differences associated with a specific base technique ID
  // Route: GET /api/v1/differences/by_technique/:technique_id
  byTechnique(techniqueId, include) {
    let url = `${process.env.REACT_APP_BASE_URL}/differences/by_technique/${techniqueId}`;

    // Use the passed include path, or fall back to a default if none is provided
    const includePath = include || "compared_to_technique.belt";

    // Append the `include` query parameter for sideloading ***
    const urlWithInclude = `${url}?include=${includePath}`;

    return fetch(urlWithInclude, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(handleResponse)
      .catch((error) => {
        console.error(`Difference.byTechnique(${techniqueId}) failed:`, error);
        return {
          status: "error",
          message: `Network error fetching differences for technique ID ${techniqueId}.`,
        };
      });
  },

  // Creates a new difference record
  // Expects differenceData: { technique_id: number, compared_to_technique_id: number, content: string }
  create(differenceData) {
    const csrfToken = getCSRFToken();

    return fetch(`${process.env.REACT_APP_BASE_URL}/differences`, {
      method: "POST",
      headers: {
        // Assuming we need to pass an authorization token and Content-Type
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify({ difference: differenceData }),
    })
      .then(handleResponse)
      .catch((error) => {
        console.error("Difference.create failed:", error);
        return { status: "error", message: "Network error creating difference." };
      });
  },

  // Updates an existing difference record
  // Expects id: number, differenceData: { technique_id: number, compared_to_technique_id: number, content: string }
  update(id, differenceData) {
    const csrfToken = getCSRFToken(); // <-- Consistency fix

    return fetch(`${process.env.REACT_APP_BASE_URL}/differences/${id}`, {
      method: "PATCH",
      headers: {
        // Assuming we need to pass an authorization token and Content-Type
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken, // <-- Consistency fix
      },
      body: JSON.stringify({ difference: differenceData }),
    })
      .then(handleResponse)
      .catch((error) => {
        console.error(`Difference.update(${id}) failed:`, error);
        return { status: "error", message: `Network error updating difference ID ${id}.` };
      });
  },

  // Destroys a difference record
  destroy(id) {
    const csrfToken = getCSRFToken(); // Add CSRF token for DELETE for security/consistency

    return fetch(`${process.env.REACT_APP_BASE_URL}/differences/${id}`, {
      method: "DELETE",
      headers: {
        // Assuming we need to pass an authorization token
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken, // Added CSRF token
      },
    })
      .then(handleResponse)
      .catch((error) => {
        console.error(`Difference.destroy(${id}) failed:`, error);
        return { status: "error", message: `Network error deleting difference ID ${id}.` };
      });
  },
};

export const Waiver = {
  all() {
    // Fetch all waivers from the server
    return fetch(`${process.env.REACT_APP_BASE_URL}/waivers`, {
      credentials: "include",
    }).then((res) => {
      console.log(res);
      return res.json();
    });
  },

  outstandingCount() {
    // Fetch the count of waivers awaiting admin signature (only accessible by admin)
    return fetch(`${process.env.REACT_APP_BASE_URL}/waivers/outstanding_count`, {
      credentials: "include",
    })
      .then((res) => {
        // Check for success (200 OK) or forbidden (403)
        if (res.status === 403) {
          console.warn("Access Denied: User is not authorized to view the outstanding count.");
          // Return a safe, expected structure even on failure
          return { outstanding_count: 0, errors: "Forbidden" };
        }
        if (!res.ok) {
          console.error("Failed to fetch outstanding count, status:", res.status);
          throw new Error("Failed to fetch outstanding count");
        }
        return res.json();
      })
      .catch((err) => {
        console.error("Network or parsing error fetching outstanding waiver count:", err);
        // Return a structured error response
        return { outstanding_count: 0, errors: [{ message: err.message }] };
      });
  },

  find() {
    // Find a specific technique (TODO: may need to refine in tandem with API endpoint)
    return fetch(`${process.env.REACT_APP_BASE_URL}/waivers_find`, {
      credentials: "include",
    }).then((res) => {
      console.log(res);
      return res.json();
    });
  },

  async create(params, csrfToken) {
    // Create a waiver
    console.log("Creating waiver with params:", params);
    // Params is an object that represents a waiver, including the participant's name, their initals, their email address,
    // their geographical address, their signautre, their date of birth, their phone number, their emergency contact name,
    // number and relationship to participant, the organization witness name (usually this is the instructor) and their
    // signature. TODO: anything else not mentioned?
    const payload = { waiver: params };

    return fetch(`${process.env.REACT_APP_BASE_URL}/waivers`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        // Always attempt to parse JSON body (Rails returns JSON even on 4xx/5xx)
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          console.error("Failed to create waiver, status:", res.status, data);
          // Return the parsed body (which may contain `errors`) so callers can surface messages
          return data || { errors: [{ message: `HTTP ${res.status}` }] };
        }
        return data;
      })
      .then((data) => {
        console.log("Waiver create response:", data);
        return data;
      })
      .catch((err) => {
        console.error("Network or JSON parsing error creating waiver:", err);
        return { errors: [{ message: "Network connection failed or response was invalid JSON." }] };
      });
  },

  one(id) {
    // Fetch a single waiver by ID
    return fetch(`${process.env.REACT_APP_BASE_URL}/waivers/${id}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .catch(console.error);
  },

  // TODO: Try to debug this
  async update(id, params, csrfToken) {
    // Update a waiver
    console.log("this is from request js and the waiver params for update", params);
    const payload = { waiver: params };

    return fetch(`${process.env.REACT_APP_BASE_URL}/waivers/${id}`, {
      credentials: "include",
      method: "PATCH",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
    })
      .then((res) => {
        console.log("Response status for update:", res.status);
        return res.json();
      })
      .catch(console.error);
  },

  destroy(id) {
    // Destroy a waiver
    return fetch(`${process.env.REACT_APP_BASE_URL}/waivers/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => {
        console.log("Response status for destroy:", res.status);
        return res.json();
      })
      .catch(console.error);
  },

  details(id) {
    // Get the details of a waiver so that it may be updated (potential feature)
    return fetch(`${process.env.REACT_APP_BASE_URL}/waivers/${id}`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        console.log("Response status for details:", res.status);
        return res.json();
      })
      .catch(console.error);
  },
};

export const Session = {
  // Create a session aka, sign-in
  async create(params, csrfToken) {
    // Create a session based on params and with a csrfToken to uphold security integrity
    try {
      console.log("From requests session.create: Params being sent to the backend:", params);
      console.log(
        "Step 2: Hitting create.Session, sending sign-in request to backend with following params:",
        params
      );

      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/session`, {
        method: "POST",
        credentials: "include",
        headers: {
          // "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify(params),
      });

      console.log("Step 3: Received raw response from the API:", response);
      console.log("Step 3.5: Received status from the API:", response.status);

      const contentType = response.headers.get("content-type");
      let data = {};
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      // We need to attach the response status to the data object to aid handling of it in the createSession process
      const status = response.status;
      console.log("Step 4: Parsed JSON response:", data);

      if (!response.ok) {
        console.error("Error status:", status);
        console.error(
          "Error message:",
          data.error || "An unknown error occurred during session creation"
        );
        // Now we have the data including the status for processing in createSession

        // Handle specific errors
        if (status === 404) {
          return { error: "User not found. Please check your email and try again.", status };
        } else if (status === 500) {
          return { error: "Server error. Please try again later.", status };
        } else {
          return { error: data.status || "An unexpected error occurred.", status };
        }
      }

      console.log("Session response status:", status);
      console.log("Is user logged in?", data.logged_in);
      console.log("User data:", data.user);

      // if (data.status === 200) {
      //   console.log("Step 5: User signed in successfully! Unless we can't see Admin Page, in which case more debugging is required...");
      return { ...data, status };
    } catch (error) {
      console.error("Session creation error: ", error.message);
      return { error: "Network error. Please check your connection and try again.", status: 500 };
    }
  },

  async destroy() {
    // Destroy a session aka, sign-out
    console.log("Step 1: Starting the session destroy process");
    try {
      // Here we use a regex to search through all the cookies for the page and extract the csrfToken, to use it as a header for our delete request
      const csrfToken = document.cookie.replace(
        /(?:(?:^|.*;\s*)CSRF-TOKEN\s*=\s*([^;]*).*$)|^.*$/,
        "$1"
      );

      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/session`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
      });

      console.log("Step 2: Received response from the DELETE request:", response);

      if (!response.ok) {
        console.error("Step 3: Network response was not ok:", response.statusText);
        const errorData = await response.json().catch(() => ({ message: response.statusText })); // Attempt to parse error JSON, but handle empty body
        throw new Error(errorData.message || "Network response was not ok for session.destroy");
      }

      // Check if the status is 204 (No Content) before trying to parse JSON
      if (response.status !== 204) {
        const data = await response.json();
        console.log("Step 4: Session successfully destroyed. Parsed response data:", data);
        console.log("Successful sign-out upon session destruction", data);
        return data;
      } else {
        console.log("Step 4: Session successfully destroyed. No content in response.");
        return; // Or alternatively return a specific success indicator like an empty object
      }
    } catch (error) {
      console.error("Step 5: Unable to destroy session due to error:", error);
      throw error;
    }
  },
};

export const User = {
  all() {
    // Fetch all users and handle both JSON:API and plain array shapes
    return fetch(`${process.env.REACT_APP_BASE_URL}/users`, {
      credentials: "include",
    }).then(async (res) => {
      if (!res.ok) {
        const errorBody = await res.text().catch(() => "");
        throw new Error(
          `API call failed with status ${res.status}: ${errorBody || res.statusText}`
        );
      }

      const bodyText = await res.text();
      let payload;
      try {
        payload = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        // If not JSON, return empty list to avoid crashing UI
        return [];
      }

      // Handle plain array (e.g., [{ id, ... }])
      if (Array.isArray(payload)) {
        return payload;
      }
      // Handle named array (e.g., { users: [...] })
      if (Array.isArray(payload.users)) {
        return payload.users;
      }
      // Handle JSON:API ({ data: [...], included: [...] })
      if (Array.isArray(payload.data)) {
        return normalizeJsonApi(payload);
      }
      // Fallback: no recognizable structure
      return [];
    });
  },

  get(id, include) {
    // Fetch a single user by ID; optional `include` to request nested relationships (e.g., current_belt_grade.belt)
    const base = `${process.env.REACT_APP_BASE_URL}/users/${id}`;
    const url = include ? `${base}?include=${encodeURIComponent(include)}` : base;
    return fetch(url, {
      method: "GET",
      credentials: "include",
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Failed to fetch user ${id}: ${text || res.statusText}`);
      }
      return res.json();
    });
  },

  current() {
    // Fetch the current user
    return fetch(`${process.env.REACT_APP_BASE_URL}/users/current`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok for current user block"); // New error handling approach for the console
        }
        return res.json(); // Otherwise the response is valid, so return it
      })
      .then((data) => {
        console.log("Current user fetched as data:", data);
        return data;
      })
      .catch((error) => {
        console.error("Error for current user fetch:", error);
        return null; // Don't return anything significant if an error is caught
      });
  },

  create(params, csrfToken, apiUrl = `${process.env.REACT_APP_BASE_URL}/users`) {
    // Create a user including for oauth signup cases as handled in SignUpPage NOTE double check there against this
    const requestBody = apiUrl.endsWith("/auth/google_oauth2/callback")
      ? // Ternary operator checks if we're trying to do an OAuth sign up, if not then we're doing traditional form sign up
        JSON.stringify(params)
      : JSON.stringify({ user: params });
    return fetch(apiUrl, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: requestBody,
    }).then((res) => {
      if (!res.ok) {
        // Check if the response status is NOT ok (e.g., 422, 400, 500)
        return res.text().then((text) => {
          // If not ok, try to read response as text
          throw new Error(`HTTP error! status: ${res.status}, message: ${text}`); // Throw an error with status and text message
        });
      } else {
        return res.json(); // If ok (2xx status), parse as JSON as before
      }
    });
  },

  destroy(id, csrfToken) {
    // Destroy a user
    return fetch(`${process.env.REACT_APP_BASE_URL}/users/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "X-CSRF-Token": csrfToken },
    }).then((res) => res.json());
  },

  // update(id, csrfToken, params) {
  //   // Update a user using new params; these could include first or last names, email address, admin status, are their dues paid,
  //   // do they own a gi and a boolean to  check if they're first aid qualified (and if so the achievement and expiry dates of the
  //   // qualification).
  //   console.log("this is from request js and the user params", params);
  //   return fetch(`${process.env.REACT_APP_BASE_URL}/users/${id}`, {
  //     credentials: "include",
  //     method: "PATCH",
  //     body: JSON.stringify(params),
  //     headers: {
  //        "Content-Type": "application/json",
  //         "X-CSRF-Token": csrfToken,
  //       },
  //   }).then((res) => {
  //     if (!res.ok) {
  //       return res.text().then(text => {
  //         // Throw an error containing the response body text for detailed error messages
  //         throw new Error(text || `HTTP error! status: ${res.status}`);
  //       });
  //     } else {
  //       // Return the parsed JSON body (e.g., the updated user object or success message)
  //       return res.json();
  //     }
  //   });
  // },

  //   async update(id, csrfToken, params) {
  //   console.log("this is from request js and the user params", params);

  //   try {
  //       // Use fetchWithRetry to handle the request, retries, and error checks.
  //       const response = await fetchWithRetry(`${process.env.REACT_APP_BASE_URL}/users/${id}`, {
  //           credentials: "include",
  //           method: "PATCH",
  //           body: JSON.stringify(params),
  //           headers: {
  //               "Content-Type": "application/json",
  //               "X-CSRF-Token": csrfToken,
  //           },
  //       });

  //       // Since fetchWithRetry succeeded, we can safely return the JSON body.
  //       const responseText = await response.text();
  //       return responseText ? JSON.parse(responseText) : {};

  //   } catch (error) {
  //       // Re-throw the error containing the structured API error details (status, errors, etc.)
  //       throw error;
  //   }
  // },
  async update(id, params) {
    const csrfToken = getCSRFToken();

    // Ensure the API version path is included to match the server logs
    const url = `${process.env.REACT_APP_BASE_URL}/users/${id}`;

    if (typeof csrfToken === "string" && csrfToken.length > 0) {
      console.log(`[Request] Including X-CSRF-Token: ${csrfToken.substring(0, 10)}...`);
    } else {
      // This is the likely cause of the original API rejection if the token is missing
      console.warn("[Request] Warning: CSRF Token not found or is not a string.");
    }

    try {
      // 3. Use fetchWithRetry, passing the internally retrieved token
      const response = await fetchWithRetry(url, {
        credentials: "include",
        method: "PATCH",
        body: JSON.stringify(params),
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken, // Use the actual token
        },
      });

      // Handle successful response
      const responseText = await response.text();
      if (!responseText) return {};
      const parsed = safeJsonParse(responseText, `User.update(${id})`);
      if (parsed !== null) return parsed;
      // If parsing failed, return the raw text in a harmless wrapper so callers can inspect it
      return { raw: responseText };
    } catch (error) {
      // Re-throw the error
      throw error;
    }
  },

  //   update(id, csrfToken, params) {
  //     console.log("this is from request js and the user params", params);

  //     const url = `${process.env.REACT_APP_BASE_URL}/users/${id}`;

  //     // Switch from native fetch to axios.patch for increased stability in
  //     // sending session cookies (required for CSRF verification).
  //     return axios.patch(url, params, {
  //         // Ensure the session cookie is sent with the request
  //         withCredentials: true,
  //         headers: {
  //             "Content-Type": "application/json",
  //             "X-CSRF-Token": csrfToken, // Sending the token in the required header
  //         },
  //     })
  //     .then((response) => {
  //         // Axios wraps the response body in `response.data`
  //         return response.data;
  //     })
  //     .catch((error) => {
  //         // Robust error handling to catch server and network issues
  //         if (error.response) {
  //             const errorDetails = JSON.stringify({
  //                 error: error.response.data.error || 'Server error occurred during update.',
  //                 errors: error.response.data.errors,
  //                 status: error.response.status
  //             });
  //             throw new Error(errorDetails);
  //         } else {
  //             // Network error
  //             throw new Error(`Network or request error: ${error.message}`);
  //         }
  //     });
  // },

  // New function to replace mockUpdateAdminPreference
  updateAdminPreference(id, preferenceParams) {
    // This is a specialized, cleaner wrapper that uses the main User.update function
    // to handle the PATCH request for admin preference changes.
    // The preferenceParams should contain the specific fields being updated
    // (e.g., { user: { show_admin_dashboard: true } }).
    console.log(`[Request] Calling updateAdminPreference for user ${id} with:`, preferenceParams);
    // The generic update function already handles the full PATCH logic
    return this.update(id, preferenceParams);
  },

  checkEmail: async (email) => {
    // Helper request to check if an email address has already been taken; if so then signUpPage won't let it be reused for a new user
    const response = await fetch(
      `${process.env.REACT_APP_BASE_URL}/users/email_available?email=${email}`
    );
    const data = await response.json();
    return data.available;
  },
};

export const InstructorQualification = {
  // Create an instructor qualification, which are ranked from bottom to top as follows: Assistant Instructor, Instructor
  // and Club Instructor with corresponding IDs 2, 3 and 4. If a student has no such qualification at all, their ID is 1
  // to represent that lack of instructor status. That array of length 4 corresponds to the Qualification object array
  // in the API. TODO: Double check if the range isn't 0-3 instead.
  create(params) {
    return fetch(`${process.env.REACT_APP_BASE_URL}/instructor_qualifications`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ instructor_qualification: params }),
    }).then((res) => res.json());
  },

  all() {
    // Fetch all instructor qualifications from the server
    return fetch(`${process.env.REACT_APP_BASE_URL}/instructor_qualifications`, {
      credentials: "include",
    }).then((res) => {
      console.log(res);
      return res.json();
    });
  },

  find(id) {
    // Find an instructor qualification by ID
    return fetch(`${process.env.REACT_APP_BASE_URL}/instructor_qualifications/${id}`, {
      credentials: "include",
    }).then((res) => {
      console.log(res);
      return res.json();
    });
  },

  update(id, params) {
    // Update an instructor qualification by upgrading the qualification ID param. We may also opt to upgrade
    // the belt grade ID at the same time, because a student might gain a new qualification AND a belt in a
    // short span of time.
    console.log("this is from request js and the instructor qualification params", params);
    return fetch(`${process.env.REACT_APP_BASE_URL}/instructor_qualifications/${id}`, {
      credentials: "include",
      method: "PATCH",
      body: JSON.stringify(params),
      headers: { "Content-Type": "application/json" },
    }).then((res) => {
      return res.json();
    });
  },
};

export const BeltGrade = {
  create(params) {
    // Create a belt grade (note: this represents which colour of belt a specific user has, see the controller and schema table in the
    // API for more info). The key IDs that it links to from other objects' tables are those of the User and the Belt. When we create
    // a belt grade, we need to specify these params for the user so that we have a record of which grade they are at when they join
    // the club.
    return fetch(`${process.env.REACT_APP_BASE_URL}/belt_grades`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ belt_grade: params }),
    }).then((res) => res.json());
  },

  getAll() {
    // Fetch all belt grades from the server
    return fetch(`${process.env.REACT_APP_BASE_URL}/belt_grades`, {
      credentials: "include",
    }).then((res) => {
      console.log(res);
      return res.json();
    });
  },

  find(id) {
    // Find a belt grade by ID. // Finds a specific belt by ID. Returns a Promise that resolves with the belt grade object
    // if found, or (TODO) rejects with an error if not found (depending on API response).
    return fetch(`${process.env.REACT_APP_BASE_URL}/belt_grades/${id}`, {}).then((res) => {
      console.log(res);
      return res.json();
    });
  },

  // TODO: add functionality for searching for a belt grade by the associated User ID (and with corresponding API work)

  update(id, params) {
    // Update a belt grade; the logic behind this is to update the belt ID param for a user to reflect their achievement
    // of a new belt colour in the club in a grading test.
    console.log("this is from request js and the belt_grade params", params);
    return fetch(`${process.env.REACT_APP_BASE_URL}/belt_grades/${id}`, {
      credentials: "include",
      method: "PATCH",
      body: JSON.stringify(params),
      headers: { "Content-Type": "application/json" },
    }).then((res) => {
      return res.json();
    });
  },
};
