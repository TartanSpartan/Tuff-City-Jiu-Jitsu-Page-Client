import React, { Component } from "react";
import { Technique, Difference, TechniqueType, Syllabus, User, Belt } from "../requests";
import NewTechniqueForm from "./NewTechniqueForm";
import "../App.scss";

export default class TechniqueNewPage extends Component {
  state = {
    errors: [],
    syllabi: [],
    primaryAdminSyllabus: null,
    secondaryAdminSyllabus: null,
    secondarySyllabusTechniques: [],
    belts: [],
    successMessage: null,
    preferredDifferenceEditorMode: "standard",
  };

  // TODO: Bug- this page will *only* update the Canadian 2021 syllabus, even when the British 2011 syllabus is set to primary and CA 2021 is set to secondary, so fix that (CHECK: has it been triaged?)

  async componentDidMount() {
    let syllabiArray = [];
    let primaryAdminSyllabus = null;
    let secondaryAdminSyllabus = null;
    let primarySyllabusTechniques = [];
    let secondarySyllabusTechniques = [];
    let preferredDifferenceEditorMode = "standard";

    try {
      // --- 1. Concurrently fetch Syllabi and Current User ---
      const [syllabiResponse, userData] = await Promise.all([Syllabus.all(), User.current()]);

      console.log("DIAGNOSTIC: Full User Data Object (User.current() response):", userData);

      // Process User Data (extracting the preference)
      preferredDifferenceEditorMode = userData?.preferred_difference_editor_mode; //|| "standard";
      console.log("Current user preferred editor mode set to:", preferredDifferenceEditorMode);

      // Process Syllabi Data (based on original logic)
      const rawSyllabi =
        syllabiResponse && Array.isArray(syllabiResponse.data)
          ? syllabiResponse.data
          : Array.isArray(syllabiResponse)
            ? syllabiResponse
            : [];
      syllabiArray = rawSyllabi.map((item) => ({
        id: item.id,
        ...item.attributes,
      }));

      const primarySyllabus = syllabiArray.find((s) => s.is_primary_admin_syllabus === true);
      const secondarySyllabus = syllabiArray.find((s) => s.is_secondary_admin_syllabus === true);

      primaryAdminSyllabus = primarySyllabus || (syllabiArray.length > 0 ? syllabiArray[0] : null);
      secondaryAdminSyllabus = secondarySyllabus;

      // This log should now show the array with the syllabus object(s) inside
      console.log("TECHNIQUE NEW PAGE: Syllabi array final check:", syllabiArray);

      // --- 2. Fetch Techniques for Primary and Secondary Syllabi ---

      const techniquePromises = [];

      // Fetch secondary syllabus techniques if available
      if (secondarySyllabus) {
        techniquePromises.push(
          Technique.allBySyllabus(secondarySyllabus.id)
            .then((res) =>
              Array.isArray(res?.data)
                ? res.data.map((i) => ({ id: i.id, ...i.attributes }))
                : Array.isArray(res)
                  ? res
                  : []
            )
            .then((techniques) => {
              secondarySyllabusTechniques = techniques;
              console.log(
                "Loaded techniques for secondary syllabus:",
                secondarySyllabus.title,
                techniques.map((t) => t.summary || t.id)
              );
            })
            .catch((e) => {
              console.error("Failed to fetch secondary techniques:", e);
            })
        );
      }

      // Fetch primary syllabus techniques if available
      if (primaryAdminSyllabus) {
        techniquePromises.push(
          Technique.allBySyllabus(primaryAdminSyllabus.id)
            .then((res) =>
              Array.isArray(res?.data)
                ? res.data.map((i) => ({ id: i.id, ...i.attributes }))
                : Array.isArray(res)
                  ? res
                  : []
            )
            .then((techniques) => {
              primarySyllabusTechniques = techniques;
              console.log(
                "Loaded techniques for primary syllabus:",
                primaryAdminSyllabus.title,
                techniques.map((t) => t.summary || t.id)
              );
            })
            .catch((e) => {
              console.error("Failed to fetch primary techniques:", e);
            })
        );
      }

      // Wait for all technique fetches to complete
      await Promise.all(techniquePromises);

      // --- 3. Fetch belts for the PRIMARY syllabus only ---
      try {
        if (primaryAdminSyllabus?.id) {
          const beltsList = await Belt.allBySyllabus(primaryAdminSyllabus.id);
          console.log(
            "Loaded belts for primary syllabus:",
            primaryAdminSyllabus.title,
            beltsList.map((b) => b.name || b.colour || b.id)
          );
          this.setState({ belts: beltsList });
        } else {
          this.setState({ belts: [] });
        }
      } catch (e) {
        console.error("Failed to fetch primary syllabus belts:", e);
        this.setState({ belts: [] });
      }
    } catch (error) {
      console.error("TECHNIQUE NEW PAGE: Failed in componentDidMount:", error);
    }

    // --- 3. Final State Update ---
    this.setState({
      syllabi: syllabiArray,
      primaryAdminSyllabus: primaryAdminSyllabus,
      secondaryAdminSyllabus: secondaryAdminSyllabus,
      primarySyllabusTechniques,
      secondarySyllabusTechniques,
      preferredDifferenceEditorMode: preferredDifferenceEditorMode, // Set the retrieved mode
    });

    // Syllabus.all()
    //   .then(async (data) => {
    //     let syllabiArray = [];
    //     const rawSyllabi =
    //       data && Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];

    //     // Convert JSON:API format to simple object array
    //     syllabiArray = rawSyllabi.map((item) => ({
    //       id: item.id,
    //       ...item.attributes, // Spread the attributes into the main object
    //     }));

    //     // Find the primary and secondary syllabi based on the admin flags
    //     const primarySyllabus = syllabiArray.find((s) => s.is_primary_admin_syllabus === true);
    //     const secondarySyllabus = syllabiArray.find((s) => s.is_secondary_admin_syllabus === true);

    //     // Fallback logic: If no primary is set, use the first one.
    //     const primaryAdminSyllabus =
    //       primarySyllabus || (syllabiArray.length > 0 ? syllabiArray[0] : null);

    //     // This log should now show the array with the syllabus object(s) inside
    //     console.log("TECHNIQUE NEW PAGE: Syllabi array final check:", syllabiArray);

    //     // --- Fetch secondary syllabus techniques if available ---
    //     let secondarySyllabusTechniques = [];
    //     if (secondarySyllabus) {
    //       try {
    //         const techniquesResponse = await Technique.allBySyllabus(secondarySyllabus.id);
    //         // Handle both JSON:API and plain arrays
    //         secondarySyllabusTechniques = Array.isArray(techniquesResponse?.data)
    //           ? techniquesResponse.data.map((item) => ({
    //               id: item.id,
    //               ...item.attributes,
    //             }))
    //           : Array.isArray(techniquesResponse)
    //             ? techniquesResponse
    //             : [];
    //         console.log(
    //           "Loaded techniques for secondary syllabus:",
    //           secondarySyllabus?.title,
    //           secondarySyllabusTechniques.map((t) => t.summary || t.id)
    //         );
    //       } catch (error) {
    //         console.error("Failed to fetch secondary syllabus techniques:", error);
    //       }
    //     }
    //     let primarySyllabusTechniques = [];
    //     if (primaryAdminSyllabus) {
    //       try {
    //         const primaryTechniquesResponse = await Technique.allBySyllabus(
    //           primaryAdminSyllabus.id
    //         );
    //         primarySyllabusTechniques = Array.isArray(primaryTechniquesResponse?.data)
    //           ? primaryTechniquesResponse.data.map((item) => ({
    //               id: item.id,
    //               ...item.attributes,
    //             }))
    //           : Array.isArray(primaryTechniquesResponse)
    //             ? primaryTechniquesResponse
    //             : [];
    //         console.log(
    //           "Loaded techniques for primary syllabus:",
    //           primaryAdminSyllabus?.title,
    //           primarySyllabusTechniques.map((t) => t.summary || t.id)
    //         );
    //       } catch (error) {
    //         console.error("Failed to fetch primary syllabus techniques:", error);
    //       }
    //     }

    //     this.setState({
    //       syllabi: syllabiArray,
    //       primaryAdminSyllabus: primaryAdminSyllabus,
    //       secondaryAdminSyllabus: secondarySyllabus,
    //       primarySyllabusTechniques,
    //       secondarySyllabusTechniques,
    //     });
    //   })
    //   .catch((error) => {
    //     console.error("TECHNIQUE NEW PAGE: Failed to fetch syllabi:", error);
    //     this.setState({ syllabi: [], primaryAdminSyllabus: null });
    //   });
  }

  // NOTE: These legacy handlers are unused but remain in the class structure.
  createTechnique = (params) => {
    Technique.create(params).then((response) => {
      console.log("Create technique response in TechniqueNewPage component is", response);
      if (response.errors) {
        this.setState({ errors: response.errors });
      } else {
        console.log("Technique created. Preventing navigation.");
      }
      console.log(params);
    });
  };

  createDifference = (params) => {
    Difference.create(params).then((response) => {
      console.log("Create difference response in TechniqueNewPage component is", response);
      if (response.errors) {
        this.setState({ errors: response.errors });
      } else {
        console.log("Difference created. Preventing navigation.");
      }
      console.log(params);
    });
  };

  // New combined handler to manage the full submission flow with unconditional navigation upon technique creation success
  handleFormSubmission = async (params) => {
    // Clear previous success/errors
    this.setState({ errors: [], successMessage: null });

    console.log("Input parameters received from form (params):", params);

    // 1. Separate Technique and Difference parameters from the form data
    const {
      summary,
      default_attack,
      belt: belt_id, // Rename belt to belt_id for clarity/API matching
      syllabus_id,
      category,
      sub_category,
      videos,
      is_different,
      difference_content,
      composed_paragraph_parts, // TODO: this is not in the API so should probably be refactored here in the client
      compared_to_technique_id,
    } = params;

    const isDifferentFlag = is_different === "true" || is_different === true;
    const primarySyllabus = this.state.primaryAdminSyllabus;
    const secondarySyllabus = this.state.secondaryAdminSyllabus;

    // --- 2. Find TechniqueType and get its ID ---
    let techniqueTypeId;
    try {
      // Wrap request parameters under 'technique_type' key and change to TechniqueType.find
      const typeRequestParams = {
        technique_type: {
          syllabus_id: syllabus_id, // Used for lookup on the server
          belt_id: belt_id,
          category: category,
          sub_category: sub_category,
        },
      };

      const typeResponse = await TechniqueType.find(typeRequestParams);

      // Try to extract the ID from common locations
      const typeIdFromResponse =
        typeResponse?.data?.id || typeResponse?.id || typeResponse?.data?.attributes?.id;

      if (typeResponse.errors || !typeIdFromResponse) {
        // If the Technique Type couldn't be found or created, surface errors to the child and reject to stop the submit flow.
        const errs = typeResponse.errors || [
          {
            message:
              "Failed to establish Technique Type ID. Please ensure all category fields are valid.",
          },
        ];
        this.setState({ errors: errs });
        // Reject so NewTechniqueForm's catch runs and avoids success-side effects
        throw new Error(
          Array.isArray(errs)
            ? errs[0]?.message || String(errs[0])
            : "Technique type validation failed"
        );
      }

      // Set the successfully retrieved ID
      techniqueTypeId = typeIdFromResponse;
      console.log("Found Technique Type ID (Attempt 3):", techniqueTypeId);
    } catch (error) {
      console.error("Technique Type lookup error:", error);
      // Do not overwrite specific validation errors already set above.
      // If none exist, surface the actual error message from the catch.
      this.setState((prev) => {
        if (Array.isArray(prev.errors) && prev.errors.length > 0) {
          return { errors: prev.errors };
        }
        const msg = error?.message || "Technique Type request failed.";
        return { errors: [{ message: msg }] };
      });
      // Ensure the parent rejects so the form catch displays feedback and halts
      throw error;
    }

    // --- 3. Construct the FINAL Technique parameters for the API ---
    const techniqueParams = {
      // IMPORTANT: Wrap the parameters in 'technique' key as required by Rails strong params
      technique: {
        default_attack: default_attack,
        summary: summary,
        belt_id: belt_id,
        technique_type_id: techniqueTypeId, // <--- Using the acquired ID
        videos_attributes: videos.map((video) => ({
          url: video.url,
          country: video.country,
          year: video.year,
        })),
      },
    };

    console.log("Technique Creation Payload (Client-Side):", techniqueParams);

    // --- 4. Create the Technique ---
    let techniqueResponse;
    try {
      techniqueResponse = await Technique.create(techniqueParams);
      console.log("Create technique response:", techniqueResponse);

      if (techniqueResponse.errors) {
        this.setState({ errors: techniqueResponse.errors });
        throw new Error(
          Array.isArray(techniqueResponse.errors)
            ? techniqueResponse.errors[0]?.message || String(techniqueResponse.errors[0])
            : "Technique creation failed"
        );
      }
    } catch (error) {
      console.error("Technique creation error:", error);
      const msg = error?.message || "Technique creation failed.";
      // Preserve previously set detailed errors (from response.errors) if present
      this.setState((prev) => {
        if (Array.isArray(prev.errors) && prev.errors.length > 0) {
          return { errors: prev.errors };
        }
        return { errors: [{ message: msg }] };
      });
      throw error;
    }

    // Attempt to safely retrieve the ID from the response (works for both JSON and JSON:API)
    const newTechniqueId = techniqueResponse?.data?.id || techniqueResponse?.id;

    if (!newTechniqueId) {
      this.setState({
        errors: [{ message: "Technique created but failed to retrieve ID for navigation." }],
      });
      return;
    }

    let finalSuccessMessage = `Technique (ID: ${newTechniqueId}) created successfully!`;

    // --- 5. Create the Difference (if necessary) ---
    if (isDifferentFlag && newTechniqueId && secondarySyllabus) {
      if (!compared_to_technique_id) {
        // If the user checked 'is_different' but didn't select a technique to compare against
        finalSuccessMessage +=
          " WARNING: Difference logging skipped because no secondary technique was selected, which is required when marking a difference.";
      } else {
        // Use the extracted ID instead of the placeholder
        const differenceParams = {
          technique_id: newTechniqueId,
          compared_to_technique_id: compared_to_technique_id,
          content: difference_content,
        };

        try {
          const differenceResponse = await Difference.create(differenceParams);
          console.log("Create difference response:", differenceResponse);

          if (differenceResponse.errors) {
            console.error("Difference creation failed with errors:", differenceResponse.errors);
            finalSuccessMessage += " WARNING: Difference logging failed. See console for details.";
          } else {
            finalSuccessMessage = `Technique (ID: ${newTechniqueId}) created and DIFFERENCE successfully logged! (Compared to ID: ${compared_to_technique_id})`;
          }
        } catch (error) {
          console.error("Difference creation network error:", error);
          finalSuccessMessage +=
            " WARNING: Difference logging failed due to network error. See console for details.";
        }
      }
    }

    // --- 6. Success Feedback and Navigation ---
    this.setState({ successMessage: finalSuccessMessage });

    // Navigate back to the syllabus page, anchored to the relevant belt banner
    setTimeout(() => {
      const targetSyllabusId = syllabus_id;
      // Read the belt kyu number stored by NewTechniqueForm for scroll targeting
      let beltKyu = null;
      try {
        const lsVal = localStorage.getItem("scroll_to_belt_kyu");
        if (lsVal) beltKyu = String(lsVal);
      } catch {}

      if (targetSyllabusId) {
        const hash = beltKyu ? `#belt-kyu-${beltKyu}` : "";
        console.log(`Navigating to Syllabus ID ${targetSyllabusId} with hash`, hash || "(none)");
        this.props.history.push(`/syllabi/${targetSyllabusId}/user_grade_syllabus${hash}`);
      } else {
        console.error("Cannot navigate: Target Syllabus ID not found in submission.");
        this.props.history.push(`/`);
      }
    }, 50);
  };

  render() {
    return (
      <main>
        <div className="central">{/* <h1>CREATE A TECHNIQUE</h1> */}</div>
        <br />
        {this.state.successMessage && (
          <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
            <span className="font-medium">Success!</span> {this.state.successMessage}
          </div>
        )}
        <NewTechniqueForm
          onSubmit={this.handleFormSubmission}
          onCancel={this.props.handleCancelClick}
          errors={this.state.errors}
          syllabi={this.state.syllabi}
          primaryAdminSyllabus={this.state.primaryAdminSyllabus}
          secondaryAdminSyllabus={this.state.secondaryAdminSyllabus}
          primarySyllabusTechniques={this.state.primarySyllabusTechniques}
          secondarySyllabusTechniques={this.state.secondarySyllabusTechniques}
          preferredDifferenceEditorMode={this.state.preferredDifferenceEditorMode}
          belts={this.state.belts}
        />
      </main>
    );
  }
}
