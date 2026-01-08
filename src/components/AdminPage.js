// Need admin/authentication working to have this functional
// Page of forms to modify waiver and user attributes e.g. belt grades

import React from "react";
import { User, Waiver, Belt, Syllabus } from "../requests";
import { capitalize } from "../utils/countryHelpers";
import { Form } from "react-bootstrap";
import { Button } from "react-bootstrap";
import "../App.scss";
import AdminForm from "./AdminForm";
import { Save, Loader2, ChevronDown, AlertTriangle } from "lucide-react";

// TODO: believe we need to be able to update the grade for both countries instead of just a generic colour which may only update for one or the other

const formatDate = (isoString) => {
  // Ensure readable date for display from ISO date
  if (!isoString) return "No Date";
  try {
    return new Date(isoString).toLocaleDateString();
  } catch (e) {
    return "Invalid Date";
  }
};

const getAttributes = (item) => item.attributes || item; // Ensure nested attributes are safely retrieved

// We use this function to create a dynamic drop down list based on, for example, the users!
function createSelectUserItems(users) {
  let items = [];
  const userList = Array.isArray(users) ? users : [];
  for (let i = 0; i < userList.length; i++) {
    const user = userList[i];

    const firstName = user.first_name || "";
    const lastName = user.last_name || "Name Missing";

    // Use the user's unique ID as the option value
    items.push(
      <option key={`user-${user.id}`} value={user.id}>
        {`${user.id} ${firstName} ${lastName}`}
      </option>
    );
  }
  return items;
}

function createSelectWaiverItems(waivers) {
  const waiverList = Array.isArray(waivers) ? waivers : [];
  return waiverList.map((waiver, i) => {
    // Access attributes object for participant data
    const waiverAttributes = getAttributes(waiver);

    const participant = waiverAttributes.participant_name || "Name Missing";
    const date = formatDate(waiverAttributes.signed_on);

    return (
      // Use i + 1 as value, reserving '0' for the placeholder in AdminForm
      <option key={`waiver-${waiver.id}`} value={waiver.id}>
        {`ID ${waiver.id}: ${participant} (Signed by user on: ${date})`}
      </option>
    );
  });
}

// =========================================================================
// UPDATED: Custom Sorting Function
// This function sorts all users numerically, except ID 1 (Seumas), which is pushed to the very end.
// This works by assuming the senior admin will prefer to edit all other users before themselves.
// =========================================================================
const customUserSort = (a, b) => {
  const aId = Number(a.id);
  const bId = Number(b.id);

  // Check if either ID is 1
  const isALow = aId === 1;
  const isBLow = bId === 1;

  // Rule 1: If A is 1 and B is not, A comes after B (return 1)
  if (isALow && !isBLow) return 1;

  // Rule 2: If B is 1 and A is not, B comes after A (return -1)
  if (isBLow && !isALow) return -1;

  // Rule 3: Otherwise (both are 1, or neither is 1), sort numerically
  // This ensures 2, 3, 4, 5... are in order.
  return aId - bId;
};

// Change instructor_qualifications from an array into an object, on the Rails side

// function AdminPage(props) {
export class AdminPage extends React.Component {
  constructor(props) {
    super(props);
    // this.onDropdownSelected = this.onDropdownSelected.bind(this);
    this.state = {
      // user:null,
      // Data models
      users: [],
      belts: [],
      instructor_qualifications: [],
      waivers: [],
      outstandingWaivers: [],
      outstandingWaiverCount: null, // I.e. "not yet loaded"
      syllabi: [],

      // Debouncing state
      isSubmitting: false,
      isInitialDataLoading: true,

      // UI/State controls for Syllabus Updates
      primaryAdminSyllabus: null, // We can get the belt colours from here
      isPrimarySyllabusUpdating: false,
      isSecondarySyllabusUpdating: false,
      syllabusUpdateMessage: { type: null, text: null },

      // UI/State controls
      currentUser: null, // The data of the logged-in admin (to set their difference editor mode preferences)
      selectedUserForEdit: null, // The data of the user selected via a dropdown (for attribute updates)
      isAdmin: false,

      createSelectUserItems: [],
      createSelectOutstandingWaiverItems: [],

      // Remaining fields (TODO: export to AdminForm.js)
      dues_paid: false,
      owns_gi: false,
      has_first_aid_qualification: false,
      first_aid_achievement_date: "",
      first_aid_expiry_date: "",
      instructor_qualification_achievement_date: "",
    };
    this.handlePrimarySyllabusSubmit = this.handlePrimarySyllabusSubmit.bind(this);
    this.handleSecondarySyllabusSubmit = this.handleSecondarySyllabusSubmit.bind(this);
  }

  fetchSyllabi = () => {
    // Fetch all syllabi and, in parallel, try to fetch both current primary and secondary syllabi
    return Promise.all([
      Syllabus.all(),
      Syllabus.getPrimary().catch((e) => {
        console.warn("getPrimary failed; proceeding without explicit primary:", e);
        return null;
      }),
      Syllabus.getSecondary().catch((e) => {
        console.warn("getSecondary failed; proceeding without explicit secondary:", e);
        return null;
      }),
    ]).then(([syllabiResponse, primaryResponse, secondaryResponse]) => {
      // Handle both plain arrays and JSON:API { data: [...] }
      const rawSyllabi = Array.isArray(syllabiResponse)
        ? syllabiResponse
        : Array.isArray(syllabiResponse?.data)
          ? syllabiResponse.data
          : [];

      const normalizedSyllabi = rawSyllabi.map((item) => {
        const attrs = item?.attributes || item || {};
        const id = Number(item?.id || attrs?.id);
        return {
          id,
          ...attrs,
        };
      });

      // Attempt to mark primary/secondary based on dedicated endpoints
      let primaryId = null;
      if (primaryResponse) {
        const pr = primaryResponse?.data
          ? primaryResponse.data.attributes
            ? { id: Number(primaryResponse.data.id), ...primaryResponse.data.attributes }
            : primaryResponse.data
          : primaryResponse;
        primaryId = Number(pr?.id);
      }

      let secondaryId = null;
      if (secondaryResponse) {
        const sr = secondaryResponse?.data
          ? secondaryResponse.data.attributes
            ? { id: Number(secondaryResponse.data.id), ...secondaryResponse.data.attributes }
            : secondaryResponse.data
          : secondaryResponse;
        secondaryId = Number(sr?.id);
      }

      const flaggedSyllabi = normalizedSyllabi.map((s) => {
        const isPrimary = primaryId && Number(s.id) === primaryId;
        const isSecondary = secondaryId && Number(s.id) === secondaryId;
        return {
          ...s,
          is_primary_admin_syllabus: isPrimary || s.is_primary_admin_syllabus || false,
          is_secondary_admin_syllabus: isSecondary || s.is_secondary_admin_syllabus || false,
        };
      });

      this.setState({ syllabi: flaggedSyllabi });
      return flaggedSyllabi;
    });
  };

  // Helper to detect primary/secondary flags across possible API field names
  isPrimaryAdminSyllabus = (s) => {
    return Boolean(
      s?.is_primary_admin_syllabus || s?.is_primary_admin || s?.is_primary || s?.primary_admin
    );
  };

  isSecondaryAdminSyllabus = (s) => {
    return Boolean(
      s?.is_secondary_admin_syllabus ||
        s?.is_secondary_admin ||
        s?.is_secondary ||
        s?.secondary_admin
    );
  };

  // componentDidMount() { // We will fetch all users, all waivers, and all outstanding waivers to be signed by an admin, while incorporating defensive checks TODO do we need one for the third one?

  //   User.all().then((normalizedUsers) => {
  //     console.log("Normalized Users Received:", normalizedUsers);

  //     const sortedUsers = normalizedUsers.sort(customUserSort);

  //     this.setState({
  //       users: sortedUsers, // Use the correctly parsed and normalized array
  //       createSelectUserItems: createSelectUserItems(sortedUsers),
  //     });
  //   }).catch(error => {
  //       console.error("Error fetching users:", error);
  //       this.setState({ errors: [{ message: "Failed to load users from API." }] });
  //   });

  //   Waiver.all().then((waiversResponse) => {
  //     console.log("Raw waiversResponse:", waiversResponse);

  //     const waivers = Array.isArray(waiversResponse) // Futureproofed: works for a {data: [...]} return, a {waivers:[...]} return, etc
  //       ? waiversResponse
  //       : waiversResponse?.data || waiversResponse?.waivers || [];

  //     console.log("Parsed waivers:", waivers);

  //     // Any waivers that are missing an organization signature should be filtered
  //     const outstanding = waivers.filter(waiver => {
  //       const witnessName = waiver.organization_witness_name;

  //       // This handles null/undefined/"" via !witnessName
  //       // If it's a value (like a string of spaces), we trim it and check if it's empty
  //       return !witnessName || String(witnessName).trim() === '';
  //     });

  //     console.log("Outstanding Waivers Fetched:", outstanding);

  //     this.setState({
  //       // waiver:null,
  //       waivers: waivers,
  //       outstandingWaivers: outstanding,
  //       createSelectOutstandingWaiverItems: createSelectWaiverItems(outstanding),
  //     });
  //   });

  //   Waiver.outstandingCount().then((countResponse) => {
  //       console.log("API Response for outstanding count:", countResponse);

  //       const count = typeof countResponse === 'number'
  //                     ? countResponse
  //                     : countResponse.outstanding_count || 0;

  //       console.log("Setting outstandingWaiverCount to:", count);
  //       this.setState({
  //           outstandingWaiverCount: count,
  //           isWaiverCountLoading: false, // When success occurs, the loading indicator can be turned off
  //       });
  //   }).catch(error => {
  //       console.error("Failed to fetch outstanding waiver count:", error);
  //       this.setState({
  //       outstandingWaiverCount: 'Error',
  //       isWaiverCountLoading: false, // When an error occurs, the loading indicator can be turned off too
  //       });
  //   });

  //   Belt.all().then((beltsResponse) => {
  //       console.log("Belts Received:", beltsResponse);
  //       // Uses a defensive check: assumes response is an array or an object
  //       // containing an array named 'belts'
  //       const belts = Array.isArray(beltsResponse) ? beltsResponse : beltsResponse?.belts || [];

  //       this.setState({
  //           belts: belts,
  //           // createSelectBeltItems: createSelectBeltItems(belts), // Generate options
  //       });
  //   }).catch(error => {
  //       console.error("Error fetching belts:", error);
  //       this.setState({ errors: [{ message: "Failed to load belts from API." }] });
  //   });
  // }

  // onDropdownSelectedUsers = (e, users) => { // TODO 2: Can we adapt this to work for the waiver too?
  //   console.log("This is the selected user", users[e.target.value]);
  //   // this.setState({
  //   //   user: users[e.target.value]
  //   // });
  //   // this.state.user = users[e.target.value];
  //   return users[e.target.value];
  // }

  componentDidMount() {
    // 1. Define all API calls as Promises
    const userAllPromise = User.all();
    const userCurrentPromise = User.current();
    const waiverAllPromise = Waiver.all();
    const waiverCountPromise = Waiver.outstandingCount();
    const beltPromise = Belt.all();
    const syllabusPromise = this.fetchSyllabi();

    // Use Promise.all to wait for all necessary data to load before turning off the loading flag
    Promise.all([
      userAllPromise,
      userCurrentPromise,
      waiverAllPromise,
      waiverCountPromise,
      beltPromise,
      syllabusPromise,
    ])
      .then(
        ([
          usersResponse,
          currentUserResponse,
          waiversResponse,
          countResponse,
          beltsResponse,
          syllabusResponse,
        ]) => {
          // --- Handle Users (All) ---
          console.log("Normalized Users Received:", usersResponse);
          const sortedUsers = usersResponse.sort(customUserSort);

          // --- Handle Current User ---
          // Assume User.current() returns the user object, potentially nested under 'data' or 'user'
          const initialCurrentUser =
            currentUserResponse?.data || currentUserResponse?.user || currentUserResponse;

          if (initialCurrentUser) {
            console.log("Initial currentUser set via User.current():", initialCurrentUser);
          } else {
            // If User.current() fails, we might still set the default Admin Page state
            console.warn(
              "User.current() did not return a valid current user. Assuming admin is not logged in or session expired."
            );
          }

          this.setState({
            users: sortedUsers,
            createSelectUserItems: createSelectUserItems(sortedUsers),
            // Set the logged-in admin's data for admin-specific functions
            adminUser: initialCurrentUser,
            // The user to be edited is initially null
            selectedUserForEdit: null,
          });

          // --- Handle Waivers (All and Outstanding) ---
          console.log("Raw waiversResponse:", waiversResponse);
          const waivers = Array.isArray(waiversResponse)
            ? waiversResponse
            : waiversResponse?.data || waiversResponse?.waivers || [];

          console.log("Parsed waivers:", waivers);

          const outstanding = waivers.filter((waiver) => {
            const witnessName = waiver.organization_witness_name;
            return !witnessName || String(witnessName).trim() === "";
          });

          console.log("Outstanding Waivers Fetched:", outstanding);

          this.setState({
            waivers: waivers,
            outstandingWaivers: outstanding,
            createSelectOutstandingWaiverItems: createSelectWaiverItems(outstanding),
          });

          // --- Handle Waiver Count ---
          console.log("API Response for outstanding count:", countResponse);
          const count =
            typeof countResponse === "number"
              ? countResponse
              : countResponse.outstanding_count || 0;

          console.log("Setting outstandingWaiverCount to:", count);
          this.setState({ outstandingWaiverCount: count });

          // --- Handle Belts ---
          console.log("Belts Received (raw):", beltsResponse);
          // Normalize possible response shapes:
          // 1. Plain array of belt objects
          // 2. JSON:API { data: [{id, attributes:{...}}] }
          // 3. Wrapped { belts: [...] }
          let rawBelts = [];
          if (Array.isArray(beltsResponse)) {
            rawBelts = beltsResponse;
          } else if (Array.isArray(beltsResponse?.belts)) {
            rawBelts = beltsResponse.belts;
          } else if (Array.isArray(beltsResponse?.data)) {
            rawBelts = beltsResponse.data.map((b) => ({ id: b.id, ...b.attributes }));
          }
          console.log("Belts Normalized (pre-filter) count=", rawBelts.length, rawBelts);

          // Identify the current primary admin syllabus from the normalized syllabi response
          const currentPrimarySyllabus = Array.isArray(syllabusResponse)
            ? syllabusResponse.find(this.isPrimaryAdminSyllabus)
            : null;

          // PRIMARY SOURCE: Extract belts directly from the primary syllabus object when available
          let primaryBelts = [];
          if (currentPrimarySyllabus && Array.isArray(currentPrimarySyllabus.belts)) {
            primaryBelts = currentPrimarySyllabus.belts.map((b) =>
              b && b.attributes ? { id: b.id, ...b.attributes } : b
            );
            console.log(
              "[Belts Primary] Using belts from primary syllabus. Count=",
              primaryBelts.length,
              primaryBelts.map((b) => b?.id)
            );
          }

          // FALLBACK: If primary syllabus belts are missing/empty, filter raw belts to match the primary syllabus
          let filteredBelts = primaryBelts;
          if ((!filteredBelts || filteredBelts.length === 0) && currentPrimarySyllabus) {
            filteredBelts = rawBelts.filter((belt) => {
              // Common possible property names for syllabus linkage
              const syllabusId = belt.syllabus_id || belt.syllabusId || belt.syllabus?.id;
              if (syllabusId) {
                return Number(syllabusId) === Number(currentPrimarySyllabus.id);
              }

              // Fallback: match by country and/or year if provided on belt objects
              const beltCountry = belt.country || belt.syllabus_country || belt.syllabus?.country;
              const beltYear = belt.year || belt.syllabus_year || belt.syllabus?.year;

              let countryMatch = true;
              let yearMatch = true;
              if (beltCountry && currentPrimarySyllabus.country) {
                countryMatch =
                  String(beltCountry).toLowerCase() ===
                  String(currentPrimarySyllabus.country).toLowerCase();
              }
              if (beltYear && currentPrimarySyllabus.year) {
                yearMatch = Number(beltYear) === Number(currentPrimarySyllabus.year);
              }
              return countryMatch && yearMatch;
            });

            console.log(
              "[Belts Fallback] Filtered raw belts to match primary syllabus:",
              filteredBelts.length,
              filteredBelts.map((b) => b.id)
            );
          }

          // FINAL: Choose belts from primary syllabus if available; otherwise use filtered raw belts (or rawBelts if no syllabus)
          const chosenBelts =
            primaryBelts && primaryBelts.length > 0
              ? primaryBelts
              : currentPrimarySyllabus
                ? filteredBelts
                : rawBelts;

          this.setState({
            belts: chosenBelts,
            primaryAdminSyllabus: currentPrimarySyllabus || this.state.primaryAdminSyllabus,
          });
        }
      )
      .catch((error) => {
        console.error("One or more initial data fetches failed:", error);
        this.setState({ errors: [{ message: "Failed to load initial admin data." }] });
      })
      .finally(() => {
        // Set the overall loading state to false regardless of success or failure
        this.setState({ isInitialDataLoading: false });
      });
  }

  onDropdownSelectedUsers = (e, users) => {
    // This function must convert the dropdown value (i.e., '1', '2', '3') back into a
    // zero-based index (0, 1, 2) to correctly access the item in the `outstandingWaivers` array.
    const selectedValue = e.target.value;

    // If the placeholder (value="") is selected, return null
    if (!selectedValue || selectedValue === "0" || selectedValue === "Please select") {
      this.setState({ selectedUserForEdit: null });
      console.log("onDropdownSelectedUsers: Placeholder selected, returning null.");
      return null;
    }

    const selectedId = Number(selectedValue);

    // Find the user by its unique ID, not by index.
    const selectedUser = users.find((u) => Number(u.id) === selectedId);

    if (selectedUser) {
      console.log("onDropdownSelectedUsers: Selected user found:", selectedUser);
      this.setState({ currentUser: selectedUser });
      return selectedUser;
    }

    return null;
  };

  // onDropdownSelectedWaivers = (e, waivers) => {
  //   console.log("This is the selected waiver", waivers[e.target.value]);
  //   // this.setState({
  //   //   user: users[e.target.value]
  //   // });
  //   // this.state.user = users[e.target.value];
  //   return waivers[e.target.value];
  // }

  onDropdownSelectedWaivers = (e, waivers) => {
    // This function must convert the dropdown value (i.e., '1', '2', '3') back into a
    // zero-based index (0, 1, 2) to correctly access the item in the `outstandingWaivers` array.
    const selectedValue = e.target.value;

    // If the placeholder (value="") is selected, return null
    if (!selectedValue || selectedValue === "0") {
      // Added "0" check just in case
      return null;
    }

    const selectedId = Number(selectedValue);

    const selectedWaiver = waivers.find((w) => Number(w.id) === selectedId);

    if (selectedWaiver) {
      console.log("This is the selected waiver", selectedWaiver);
      return selectedWaiver;
    }

    return null;
  };

  deleteUser(id) {
    User.destroy(id).then(() => {
      this.setState({
        users: this.state.users.filter((q) => q.id !== id),
      });
    });
  }

  updateColorBox = (event) => {
    console.log("AdminPage updateColorBox called, state update handled in AdminForm.");
  };

  updateGiBox = (event) => {
    console.log("AdminPage updateGiBox called, state update handled in AdminForm.");
  };

  updateFirstAidBox = (event) => {
    console.log("AdminPage updateFirstAidBox called, state update handled in AdminForm.");
  };

  updateInstructorQualificationBox = (event) => {
    console.log(
      "AdminPage updateInstructorQualificationBox called, state update handled in AdminForm."
    );
  };

  handleInputChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  simpleStringify = (object) => {
    var simpleObject = {};
    for (var prop in object) {
      if (!object.hasOwnProperty(prop)) {
        continue;
      }
      if (typeof object[prop] == "object") {
        continue;
      }
      if (typeof object[prop] == "function") {
        continue;
      }
      simpleObject[prop] = object[prop];
    }
    return JSON.stringify(simpleObject); // returns cleaned up JSON
  };

  updatePostRequest = (data, id) => {
    console.log("data is at admin page ", data);
    // >>>>>>> CSRF Token Passed Here <<<<<<<

    if (this.state.isSubmitting) {
      console.warn("Update attempt ignored: A request is already in progress.");
      return Promise.resolve({ message: "Submission in progress" }); // Return a resolved promise to avoid error chaining
    }

    // 1. Set the flag to true to block subsequent calls
    this.setState({ isSubmitting: true });

    return User.update(id, data)
      .then((user) => {
        console.log(user);
        // NOTE: We don't usually push to the same route; it might not trigger a re-render.
        // If we are trying to refresh the page/data, consider calling the fetch functions again.
        // For now, we'll keep the original logic but TODO: review
        if (user && user.errors) {
          this.setState({ errors: user.errors });
          return user;
        } else {
          this.props.history.push(`/admin`);
          return user;
        }
      })
      .catch((error) => {
        // Handle any errors from the User.update promise rejection
        console.error("User update failed:", error);
        // Optionally set an error state here if needed
        throw error; // Re-throw the error so AdminForm can catch it
      })
      .finally(() => {
        // 2. Reset the flag, regardless of success or failure
        this.setState({ isSubmitting: false });
      });
  };

  // Helper to show temporary notification
  setNotification = (type, text) => {
    this.setState({ syllabusUpdateMessage: { type, text } });
    setTimeout(() => {
      this.setState({ syllabusUpdateMessage: { type: null, text: null } });
    }, 4000); // Notification clears after 4 seconds
  };

  handlePrimarySyllabusSubmit(event) {
    event.preventDefault();

    // Access the selected value directly from the form element's name
    const selectedId = Number(event.currentTarget.elements.primarySyllabusSelect.value);
    const currentPrimary = this.state.syllabi.find((s) => s.is_primary_admin_syllabus) || null;
    const currentSecondary = this.state.syllabi.find((s) => s.is_secondary_admin_syllabus) || null;

    if (!selectedId) {
      console.error("No syllabus ID selected.");
      return;
    }

    // Swap logic: if choosing current Secondary as new Primary, auto-swap the other
    if (currentSecondary && selectedId === currentSecondary.id && currentPrimary) {
      this.setState({ isPrimarySyllabusUpdating: true, isSecondarySyllabusUpdating: true });
      // Try preferred order; if it fails, retry inverse order.
      Promise.resolve()
        .then(() => Syllabus.updateSecondary(currentPrimary.id))
        .then(() => Syllabus.updatePrimary(selectedId))
        .catch((firstErr) => {
          console.warn("Primary swap order A failed; retrying order B.", firstErr);
          return Promise.resolve()
            .then(() => Syllabus.updatePrimary(selectedId))
            .then(() => Syllabus.updateSecondary(currentPrimary.id));
        })
        .then(() => {
          this.setNotification(
            "success",
            `Swapped: Primary is now ${capitalize(currentSecondary.country)} ${currentSecondary.year}; Secondary set to ${capitalize(currentPrimary.country)} ${currentPrimary.year}.`
          );
          return this.fetchSyllabi();
        })
        .catch((error) => {
          console.error("Swap operation failed after retry:", error);
          this.setNotification(
            "error",
            "Failed to swap primary/secondary syllabi. Please try again."
          );
        })
        .finally(() => {
          this.setState({ isPrimarySyllabusUpdating: false, isSecondarySyllabusUpdating: false });
        });
      return;
    }

    // Enforce primary ≠ secondary (standard update)
    if (currentSecondary && selectedId === currentSecondary.id) {
      this.setNotification(
        "error",
        "Primary and Secondary syllabi cannot be the same. Please choose a different syllabus."
      );
      return;
    }

    this.setState({ isPrimarySyllabusUpdating: true }); // Start loading

    // You can add state here to handle loading/error messages,
    // but for simplicity, we'll focus on the core logic.

    Syllabus.updatePrimary(selectedId)
      .then((data) => {
        if (data.status === "success") {
          // 1. Find the syllabus object from the current state
          const selectedSyllabus = this.state.syllabi.find((s) => s.id === selectedId);

          // 2. Construct the new, descriptive notification message
          const notificationMessage = selectedSyllabus
            ? `Primary syllabus set to ${capitalize(selectedSyllabus.country)} ${selectedSyllabus.year} successfully!`
            : `Primary syllabus set to ID ${selectedId} successfully! (Details unavailable)`;

          // 3. Call the notification method with the new message
          this.setNotification("success", notificationMessage);
          console.log(notificationMessage);
          // Re-fetch the syllabi to update the state. This is necessary
          // because the API update changes the is_primary_admin_syllabus flag,
          // and we need to pull the new data to re-render the current primary display.
          return this.fetchSyllabi();
          // TODO: Add a temporary success notification state update here
        } else {
          this.setNotification(
            "error",
            `Error updating primary syllabus: ${data.message || "unknown error"}`
          );
          console.error("Error updating primary syllabus:", data.message);
          return Promise.resolve(); // Continue the chain even if server-side status is not 'success'

          // TODO: Add an error notification state update here
        }
      })
      .catch((error) => {
        console.error("Network error during primary syllabus update.", error);
        // TODO: Add a network error notification state update here
      })
      .finally(() => {
        // This is now guaranteed to run after fetchSyllabi() completes (if successful) or immediately after error/failure.
        this.setState({ isPrimarySyllabusUpdating: false }); // End loading
      });
  }

  handleSecondarySyllabusSubmit(event) {
    event.preventDefault();

    // Access the selected value directly from the form element's name
    const selectedId = Number(event.currentTarget.elements.secondarySyllabusSelect.value);
    const currentPrimary = this.state.syllabi.find((s) => s.is_primary_admin_syllabus) || null;
    const currentSecondary = this.state.syllabi.find((s) => s.is_secondary_admin_syllabus) || null;

    if (!selectedId) {
      console.error("No syllabus ID selected.");
      return;
    }

    // Swap logic: if choosing current Primary as new Secondary, auto-swap the other
    if (currentPrimary && selectedId === currentPrimary.id && currentSecondary) {
      this.setState({ isSecondarySyllabusUpdating: true, isPrimarySyllabusUpdating: true });
      // Try preferred order; if it fails, retry inverse order.
      Promise.resolve()
        .then(() => Syllabus.updateSecondary(selectedId))
        .then(() => Syllabus.updatePrimary(currentSecondary.id))
        .catch((firstErr) => {
          console.warn("Secondary swap order A failed; retrying order B.", firstErr);
          return Promise.resolve()
            .then(() => Syllabus.updatePrimary(currentSecondary.id))
            .then(() => Syllabus.updateSecondary(selectedId));
        })
        .then(() => {
          this.setNotification(
            "success",
            `Swapped: Secondary is now ${capitalize(currentPrimary.country)} ${currentPrimary.year}; Primary set to ${capitalize(currentSecondary.country)} ${currentSecondary.year}.`
          );
          return this.fetchSyllabi();
        })
        .catch((error) => {
          console.error("Swap operation failed after retry:", error);
          this.setNotification(
            "error",
            "Failed to swap primary/secondary syllabi. Please try again."
          );
        })
        .finally(() => {
          this.setState({ isSecondarySyllabusUpdating: false, isPrimarySyllabusUpdating: false });
        });
      return;
    }

    // Enforce secondary ≠ primary (standard update)
    if (currentPrimary && selectedId === currentPrimary.id) {
      this.setNotification(
        "error",
        "Secondary and Primary syllabi cannot be the same. Please choose a different syllabus."
      );
      return;
    }

    // Start loading for secondary update
    this.setState({ isSecondarySyllabusUpdating: true });

    // You can add state here to handle loading/error messages,
    // but for simplicity, we'll focus on the core logic.

    Syllabus.updateSecondary(selectedId)
      .then((data) => {
        if (data.status === "success") {
          // 1. Find the syllabus object from the current state
          const selectedSyllabus = this.state.syllabi.find((s) => s.id === selectedId);

          // 2. Construct the new, descriptive notification message
          const notificationMessage = selectedSyllabus
            ? `Secondary syllabus set to ${capitalize(selectedSyllabus.country)} ${selectedSyllabus.year} successfully!`
            : `Secondary syllabus set to ID ${selectedId} successfully! (Details unavailable)`;

          // 3. Call the notification method with the new message
          this.setNotification("success", notificationMessage);
          console.log(notificationMessage);
          return this.fetchSyllabi();

          // TODO: Add a temporary success notification state update here
        } else {
          this.setNotification(
            "error",
            `Error updating secondary syllabus: ${data.message || "unknown error"}`
          );
          console.error("Error updating secondary syllabus:", data.message);
          return Promise.resolve(); // Continue the chain even if server-side status is not 'success'

          // TODO: Add an error notification state update here
        }
      })
      .catch((error) => {
        this.setNotification("error", "Network error during secondary syllabus update.");
        console.error("Network error during secondary syllabus update.", error);
        // TODO: Add a network error notification state update here
      })
      .finally(() => {
        // This is now guaranteed to run after fetchSyllabi() completes (if successful) or immediately after error/failure.
        this.setState({ isSecondarySyllabusUpdating: false }); // End loading
      });
  }

  renderPrimaryAndSecondarySyllabusSelector() {
    const {
      syllabi,
      isInitialDataLoading,
      isPrimarySyllabusUpdating,
      isSecondarySyllabusUpdating,
      syllabusUpdateMessage,
    } = this.state;

    if (isInitialDataLoading) {
      return (
        <p className="mb-4">
          <Loader2 className="animate-spin inline mr-2 w-5 h-5" />
          Loading syllabus configuration...
        </p>
      );
    }

    if (!syllabi.length) {
      return (
        <p className="mb-4 text-red-600 font-semibold p-4 border rounded-lg border-red-300 bg-red-50">
          <AlertTriangle className="inline mr-2 w-5 h-5" />
          No syllabi found to configure. Please create a syllabus first.
        </p>
      );
    }

    const currentPrimarySyllabus = syllabi.find(this.isPrimaryAdminSyllabus);
    const currentSecondarySyllabus = syllabi.find(this.isSecondaryAdminSyllabus);

    // Get the IDs that should be excluded from the *other* dropdown
    const primaryIdToExclude = currentSecondarySyllabus ? currentSecondarySyllabus.id : null;
    const secondaryIdToExclude = currentPrimarySyllabus ? currentPrimarySyllabus.id : null;

    // Set defaults: use the current setting, otherwise default to the first available syllabus
    const primaryDefaultId = currentPrimarySyllabus?.id || syllabi[0]?.id;
    // For the secondary default, ensure it's not the same as the primary default if possible
    const secondaryDefaultId =
      currentSecondarySyllabus?.id ||
      syllabi.find((s) => s.id !== primaryDefaultId)?.id ||
      primaryDefaultId;

    // Ensure the default selection exists in the filtered list. If the user only has one syllabus,
    // we must allow primary and secondary to be the same, as there is no alternative.
    // If there is only one syllabus, primaryDefaultId === secondaryDefaultId. The filter step handles this.

    const { type, text } = syllabusUpdateMessage;

    // Fetch primary syllabus belts if available
    // if (primaryAdminSyllabus) {
    //   techniquePromises.push(
    //     Technique.allBySyllabus(primaryAdminSyllabus.id)
    //       .then((res) =>
    //         Array.isArray(res?.data)
    //           ? res.data.map((i) => ({ id: i.id, ...i.attributes }))
    //           : Array.isArray(res)
    //             ? res
    //             : []
    //       )
    //       .then((techniques) => {
    //         primarySyllabusTechniques = techniques;
    //         console.log(
    //           "Loaded techniques for primary syllabus:",
    //           primaryAdminSyllabus.title,
    //           techniques.map((t) => t.summary || t.id)
    //         );
    //       })
    //       .catch((e) => {
    //         console.error("Failed to fetch primary techniques:", e);
    //       })
    //   );
    // }

    return (
      <div className="syllabus-selector-panel border border-blue-300 p-4 rounded-lg shadow-md mb-5 bg-blue-50">
        <h2 className="text-xl font-bold mb-3 text-blue-800">Syllabus Configuration</h2>

        {text && (
          <div
            className={`p-3 mb-4 rounded-lg font-semibold text-center transition duration-300 ease-in-out ${
              type === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
            role="alert"
          >
            {text}
          </div>
        )}
        <p className="mb-3 text-sm text-blue-700">
          This selection determines the default/primary syllabus ID used when creating new records
          (e.g., new techniques). That means to set the primary syllabus you, an admin, wishes to
          edit for the time being.
        </p>
        <p className="mb-3">
          **Current Primary:**{" "}
          <span className="font-semibold text-green-700 ml-1">
            {currentPrimarySyllabus
              ? `${capitalize(currentPrimarySyllabus.country)} ${currentPrimarySyllabus.year}`
              : "None Set"}
          </span>
        </p>

        <Form onSubmit={this.handlePrimarySyllabusSubmit}>
          <Form.Group controlId="primarySyllabusSelect" className="mb-3">
            <Form.Label className="font-medium text-blue-700">
              Select Syllabus to Make Primary:
            </Form.Label>
            <div className="relative">
              <Form.Control
                as="select"
                name="primarySyllabusSelect" // Used in the handler to get the value
                defaultValue={primaryDefaultId}
                disabled={isPrimarySyllabusUpdating || isSecondarySyllabusUpdating}
                className="shadow-sm border-blue-300 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-10"
              >
                {/* Show all syllabi; enforcement happens on submit */}
                {syllabi.map((syllabus) => (
                  <option key={`p-opt-${syllabus.id}`} value={syllabus.id}>
                    {capitalize(syllabus.country)} {syllabus.year}
                  </option>
                ))}
              </Form.Control>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
            </div>
          </Form.Group>
          <Button
            variant="primary"
            type="submit"
            disabled={isPrimarySyllabusUpdating || isSecondarySyllabusUpdating}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
          >
            {isPrimarySyllabusUpdating ? (
              <Loader2 className="animate-spin inline mr-2 w-4 h-4" />
            ) : (
              <Save className="inline mr-2 w-4 h-4 text-indigo-100" />
            )}
            {isPrimarySyllabusUpdating ? "Updating..." : "Set As Primary Syllabus"}
          </Button>

          <br />
          <br />

          <p className="mb-3 text-sm text-blue-700">
            This selection determines the secondary syllabus ID used when creating new records
            (e.g., differences to the first syllabus' techniques). That means to set the secondary
            syllabus you, an admin, wishes to compare against the primary syllabus (by building out
            the differences). Recommend reversing these two selections when you wish to edit the
            secondary and compare the primary syllabi.
          </p>
          <p className="mb-3">
            **Current Secondary:**{" "}
            <span className="font-semibold text-green-700 ml-1">
              {currentSecondarySyllabus
                ? `${capitalize(currentSecondarySyllabus.country)} ${currentSecondarySyllabus.year}`
                : "None Set"}
            </span>
          </p>
        </Form>

        <Form onSubmit={this.handleSecondarySyllabusSubmit}>
          <Form.Group controlId="secondarySyllabusSelect" className="mb-3">
            <Form.Label className="font-medium text-blue-700">
              Select Syllabus to Make Secondary:
            </Form.Label>
            <div className="relative">
              <Form.Control
                as="select"
                name="secondarySyllabusSelect" // Used in the handler to get the value
                defaultValue={secondaryDefaultId}
                disabled={isSecondarySyllabusUpdating || isPrimarySyllabusUpdating}
                className="shadow-sm border-purple-300 focus:ring-purple-500 focus:border-purple-500 appearance-none pr-10"
              >
                {/* Show all syllabi; enforcement happens on submit */}
                {syllabi.map((syllabus) => (
                  <option key={`s-opt-${syllabus.id}`} value={syllabus.id}>
                    {capitalize(syllabus.country)} {syllabus.year}
                  </option>
                ))}
              </Form.Control>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-600" />
            </div>
          </Form.Group>
          <Button
            variant="info"
            type="submit"
            disabled={isSecondarySyllabusUpdating || isPrimarySyllabusUpdating}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
          >
            {isSecondarySyllabusUpdating ? (
              <Loader2 className="animate-spin inline mr-2 w-4 h-4" />
            ) : (
              <Save className="inline mr-2 w-4 h-4 text-indigo-100" />
            )}
            {isSecondarySyllabusUpdating ? "Updating..." : "Set As Secondary Syllabus"}
          </Button>
        </Form>
      </div>
    );
  }

  render() {
    console.log("admin's state", this.state);
    console.log("This!", this);

    // 1. SAFELY EXTRACT THE NEW ATTRIBUTE FROM CURRENT USER
    // The value will be null unless the Admin has selected their own user record
    // from the user dropdown, which populates `this.state.currentUser`.
    const preferredDifferenceEditorMode =
      this.state.adminUser?.preferred_difference_editor_mode || null;

    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 -ml-4 sm:ml-0">
            USER AND WEBSITE ADMIN PAGE
          </h1>
        </div>

        {this.renderPrimaryAndSecondarySyllabusSelector()}

        <hr className="my-5" />

        {
          <AdminForm
            users={this.state.users}
            belts={this.state.belts}
            primaryAdminSyllabus={this.state.primaryAdminSyllabus}
            outstandingWaivers={this.state.outstandingWaivers}
            history={this.props.history}
            errors={this.state.errors}
            // key={this.state.id}
            key="admin-form-instance"
            onSubmit={this.updatePostRequest}
            onDropdownSelectedUsers={this.onDropdownSelectedUsers}
            onDropdownSelectedWaivers={this.onDropdownSelectedWaivers}
            createSelectUserItems={this.state.createSelectUserItems}
            createSelectOutstandingWaiverItems={this.state.createSelectOutstandingWaiverItems}
            changeSelectColorHandler={this.updateColorBox.bind(this)}
            outstandingWaiverCount={this.state.outstandingWaiverCount}
            currentUser={this.state.adminUser}
            isAdmin={this.state.isAdmin}
            userInformation={this.state.selectedUserForEdit}
            isInitialDataLoading={this.state.isInitialDataLoading}
            preferredDifferenceEditorMode={preferredDifferenceEditorMode}
          />
        }
      </main>
    );
  }
}
