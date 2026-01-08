// TODO: Will modularise this, and UpdateWaiverForm and related components, after the first few commits to the new repo

// import Text from 'react-native';
// import FormErrors from "./FormErrors";
import { Form, Row, Button } from "react-bootstrap";
import { User } from "../requests";
// import FloatingLabel from 'react-bootstrap-floating-label';
import SignatureCanvas from "react-signature-canvas";
// import SignatureForm from "./SignatureForm";
import moment from "moment";
import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useCsrfToken } from "../utils/useCsrfToken";

// TODO: Check floating label implementation and possibly replace it according to these instructions
// Replacement for react-floating-label-input

// We were looking into a modern React 18–compatible drop-in for react‑floating‑label‑input. Based on recent offerings, here are good alternatives:

// Use flowbite-react: It includes a FloatingLabel component built for React + Tailwind, with modern support.
// Flowbite React

// Use a CSS/JS implementation manually (e.g., see the “CustomInput” example from the shadcn site)
// shadcn.in

// Use other UI libraries like Chakra UI that show how to build floating labels with modern React.
// chakra-ui.com

// Conclusion: Try Flowbite FloatingLabel (or a custom simple component) for a low-friction, modern upgrade.

// Center the floating label text on this form's fields, vertically, and for all other similar form fields. Make sure no letters' tails clip through the box e.g. g, p.

// import { MDBBtn } from 'mdb-react-ui-kit';
import "../App.scss";

export default function NewWaiverForm(props) {
  // Submission and CSRF Token integration
  const { token: csrfToken, status: csrfStatus } = useCsrfToken();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  // Helper to stringify unknown error shapes for display
  const formatErrorForDisplay = (err) => {
    try {
      if (!err && err !== 0) return String(err);
      if (typeof err === "string") return err;
      if (err && typeof err === "object") {
        if (err.message) return String(err.message);
        if (err.field && err.message !== undefined) return `${err.field}: ${String(err.message)}`;
        if (Array.isArray(err)) return err.map((e) => formatErrorForDisplay(e)).join("; ");
        // Fallback: return a compact JSON string
        return JSON.stringify(err);
      }
      return String(err);
    } catch (e) {
      return String(err);
    }
  };

  // Helper to make base errors friendlier: lowercase 'User'/'Participant' and prepend 'This' for 'already taken' messages
  const transformBaseMessage = (raw) => {
    try {
      let s = String(raw).trim();
      // lowercase specific words
      s = s.replace(/\bUser\b/g, "user").replace(/\bParticipant\b/g, "participant");
      // If message contains variants of 'already taken' or 'is taken' and doesn't start with 'This', prepend 'This '
      const takenRe =
        /(has already been taken|is already taken|is taken|already taken|already been taken)/i;
      if (takenRe.test(s) && !/^This\b/i.test(s)) {
        s = `This ${s}`;
      }
      return s;
    } catch (e) {
      return String(raw);
    }
  };

  const hasError = (field) => validationErrors.some((e) => e.field === field);
  const fieldError = (field) => {
    const msg = (validationErrors.find((e) => e.field === field) || {}).message;
    // For field-level validation messages (client-side and field-specific server messages),
    // preserve the original casing so 'Participant' remains capitalized in strings we control.
    return msg ? formatErrorForDisplay(msg) : msg;
  };

  // Merge arrays of validation errors, normalizing entries and deduplicating by field+message
  const mergeValidationErrors = (existing = [], incoming = []) => {
    const normalize = (e) => {
      if (!e && e !== 0) return { field: "base", message: String(e) };
      if (typeof e === "string") return { field: "base", message: e };
      if (Array.isArray(e)) return { field: "base", message: e.join("; ") };
      if (e && typeof e === "object") {
        const field = e.field || "base";
        const message = e.message !== undefined ? String(e.message) : JSON.stringify(e);
        return { field, message };
      }
      return { field: "base", message: String(e) };
    };

    const combined = [...(existing || []), ...(incoming || [])].map(normalize);
    const seen = new Set();
    const out = [];
    combined.forEach((item) => {
      const key = `${item.field}::${item.message}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(item);
      }
    });
    return out;
  };

  console.log("On render, are the props.waiver getting passed down?", props.waiver);

  // Participant states for data
  const [participantInitials, setParticipantInitials] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [participantAddress, setParticipantAddress] = useState("");
  const [participantSignature, setParticipantSignature] = useState("");
  const [organizationWitnessName, setOrganizationWitnessName] = useState("");
  const [organizationWitnessSignature, setOrganizationWitnessSignature] = useState("");
  const [signedToday, setSignedToday] = useState("");
  const [participantDateOfBirth, setParticipantDateOfBirth] = useState("");
  const [participantEmailAddress, setParticipantEmailAddress] = useState("");
  const [participantPhone, setParticipantPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [participantNameFocused, setParticipantNameFocused] = useState(false);
  const [emergencyContactFocused, setEmergencyContactFocused] = useState(false);

  // Change handlers
  const handleInitialsChange = (e) => setParticipantInitials(e.target.value);
  const handleNameChange = (e) => setParticipantName(e.target.value);
  const handleAddressChange = (e) => setParticipantAddress(e.target.value);
  const handleParticipantSignatureChange = (event) => {
    console.log("Signature entered:", event.target.value);
    if (!event.target.value) {
      console.log("🚨 Signature is empty! Button might not update.");
    }
    setParticipantSignature(event.target.value);
  };
  const handleOrganizationWitnessNameChange = (e) => setOrganizationWitnessName(e.target.value);
  const handleOrganizationWitnessSignatureChange = (e) =>
    setOrganizationWitnessSignature(e.target.value);
  const handleSignedToday = (e) => setSignedToday(e.target.value);
  const handleParticipantDateOfBirth = (e) => setParticipantDateOfBirth(e.target.value);
  const handleEmailAddressChange = (e) => setParticipantEmailAddress(e.target.value);
  const handlePhoneChange = (e) => setParticipantPhone(e.target.value);
  const handleEmergencyContactChange = (e) => setEmergencyContact(e.target.value);
  const handleEmergencyContactPhone = (e) => setEmergencyContactPhone(e.target.value);
  const handleRelationship = (e) => setRelationship(e.target.value);

  // Signature and modal states
  const [openUserModal, setOpenUserModal] = useState(false);
  const [openOrgModal, setOpenOrgModal] = useState(false);
  const [userSigHasInk, setUserSigHasInk] = useState(false);
  const [orgSigHasInk, setOrgSigHasInk] = useState(false);
  const sigCanvasUser = useRef();
  const sigCanvasOrg = useRef();
  const skipInputRef = useRef();
  const printRef = useRef();
  const [imageUserURL, setImageUserURL] = useState(null);
  const [imageOrgURL, setImageOrgURL] = useState(null);

  // Variable utilities
  const imgFormat = "PNG"; // Using this to experiment with what produces the best image quality for the PDF; but it doesn't seem to make much difference?
  const imgString = "/public/images/" + participantName + "'s signature.png";
  const { isAuthenticated } = props;

  console.log("This is their name", participantName);
  console.log("This is their address", participantAddress);
  console.log("This is their relationship", relationship);
  console.log("This is imgString", imgString);

  // Date utilities
  const current = new Date();
  const date = `${current.getDate()}/${current.getMonth() + 1}/${current.getFullYear()}`;
  const day = `${current.getDate()}`;
  const day_with_ord = moment.localeData().ordinal(day); // This provides the correct suffix or "ordinal" to the date
  const month = current.toLocaleString("en-EN", { month: "long" });
  const year = `${current.getFullYear()}`;

  // Signature creators and remover
  const createUserSig = () => {
    // Guard: require ink on canvas before creating
    if (
      sigCanvasUser.current &&
      typeof sigCanvasUser.current.isEmpty === "function" &&
      sigCanvasUser.current.isEmpty()
    ) {
      console.warn("Create blocked: user signature canvas is empty.");
      return;
    }
    const userURL = sigCanvasUser.current.getTrimmedCanvas().toDataURL("image/png");
    console.log("This is the user sig URL", userURL); // Log to ensure `userURL` is valid
    setImageUserURL(userURL);
    closeUserModalHandler();
    setParticipantSignature(userURL);
    console.log(
      "This is the participant signature on hitting the create button, after the state update",
      participantSignature
    );
  };

  const createOrgSig = () => {
    // Guard: require ink on canvas before creating
    if (
      sigCanvasOrg.current &&
      typeof sigCanvasOrg.current.isEmpty === "function" &&
      sigCanvasOrg.current.isEmpty()
    ) {
      console.warn("Create blocked: organization signature canvas is empty.");
      return;
    }
    const orgURL = sigCanvasOrg.current.getTrimmedCanvas().toDataURL("image/png");
    setImageOrgURL(orgURL);
    // Ensure UI reflects that an organization witness signature now exists (only an admin would be expected to submit this for themselves, though)
    setOrganizationWitnessSignature(orgURL);
    closeOrgModalHandler();
  };

  const clearUserSig = () => {
    sigCanvasUser.current.clear();
    setImageUserURL(null);
    setParticipantSignature("");
    setUserSigHasInk(false);
  };

  const clearOrgSig = () => {
    sigCanvasOrg.current.clear();
    setImageOrgURL(null);
    setOrganizationWitnessSignature("");
    setOrgSigHasInk(false);
  };

  // Modal open/close helpers to ensure Create is disabled on open
  const openUserModalHandler = () => {
    setUserSigHasInk(false);
    if (sigCanvasUser.current && typeof sigCanvasUser.current.clear === "function") {
      try {
        sigCanvasUser.current.clear();
      } catch (e) {}
    }
    setOpenUserModal(true);
  };
  const closeUserModalHandler = () => {
    setOpenUserModal(false);
    setUserSigHasInk(false);
    if (sigCanvasUser.current && typeof sigCanvasUser.current.clear === "function") {
      try {
        sigCanvasUser.current.clear();
      } catch (e) {}
    }
  };

  const openOrgModalHandler = () => {
    setOrgSigHasInk(false);
    if (sigCanvasOrg.current && typeof sigCanvasOrg.current.clear === "function") {
      try {
        sigCanvasOrg.current.clear();
      } catch (e) {}
    }
    setOpenOrgModal(true);
  };
  const closeOrgModalHandler = () => {
    setOpenOrgModal(false);
    setOrgSigHasInk(false);
    if (sigCanvasOrg.current && typeof sigCanvasOrg.current.clear === "function") {
      try {
        sigCanvasOrg.current.clear();
      } catch (e) {}
    }
  };

  console.log("These are the props", props);

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("[NewWaiverForm] Submit clicked");

    const signedOnTimestamp = new Date().toISOString();

    if (csrfStatus !== "loaded" || !csrfToken) {
      const msg =
        "Submission blocked: CSRF token is not ready. Please wait a moment and try again.";
      console.error(msg, { csrfStatus, csrfTokenPresent: !!csrfToken });
      setValidationErrors([msg]);
      return;
    }

    // Client-side validations mirroring Rails model
    const errors = [];
    const emailRegex = /\A([\w+\-].?)+@[a-z\d\-]+(\.[a-z]+)*\.[a-z]+\z/i; // Rails-compatible regex; JS will ignore \A/\z anchors
    const jsEmailRegex = /^([\w+\-.])+@[a-z\d\-]+(\.[a-z]+)*\.[a-z]+$/i;

    // Required fields
    if (!participantName.trim())
      errors.push({ field: "participant_name", message: "Participant name is required" });
    if (!participantInitials.trim())
      errors.push({ field: "initials", message: "Initials are required" });
    if (!participantAddress.trim())
      errors.push({ field: "participant_address", message: "Participant address is required" });
    // Participant signature image must be created before submission
    if (!participantSignature || String(participantSignature).trim().length === 0)
      errors.push({ field: "participant_signature", message: "Participant signature is required" });
    if (!participantPhone.trim())
      errors.push({ field: "participant_phone", message: "Participant phone is required" });
    if (!emergencyContact.trim())
      errors.push({
        field: "emergency_contact_name",
        message: "Emergency contact name is required",
      });
    if (!emergencyContactPhone.trim())
      errors.push({
        field: "emergency_contact_number",
        message: "Emergency contact phone is required",
      });
    if (!relationship.trim())
      errors.push({ field: "relationship", message: "Relationship is required" });

    // Email format
    if (!participantEmailAddress.trim()) {
      errors.push({
        field: "participant_email_address",
        message: "Participant email address is required",
      });
    } else if (!jsEmailRegex.test(participantEmailAddress.trim())) {
      errors.push({ field: "participant_email_address", message: "Invalid email format" });
    }

    // Participant Date of Birth required
    if (!participantDateOfBirth || String(participantDateOfBirth).trim().length === 0) {
      errors.push({
        field: "participant_date_of_birth",
        message: "Participant Date of Birth is required",
      });
    }
    // Legal age check: 18+
    if (participantDateOfBirth) {
      const dob = new Date(participantDateOfBirth);
      const signedOn = new Date(signedOnTimestamp);
      let age = signedOn.getFullYear() - dob.getFullYear();
      const signedYday = Math.floor((signedOn - new Date(signedOn.getFullYear(), 0, 0)) / 86400000);
      const dobYday = Math.floor((dob - new Date(dob.getFullYear(), 0, 0)) / 86400000);
      if (signedYday < dobYday) age -= 1;
      if (age < 18) {
        errors.push({
          field: "participant_date_of_birth",
          message: "Participant must be 18 years or older",
        });
      }
    }

    if (errors.length > 0) {
      setValidationErrors((prev) => mergeValidationErrors(prev, errors));
      return;
    }

    // Clear any previous validation errors
    if (validationErrors.length) setValidationErrors([]);

    setIsSubmitting(true);

    const { currentTarget } = event;
    const formData = new FormData(currentTarget);

    const data = {
      initials: formData.get("participantInitials"),
      participant_name: formData.get("participantName"),
      participant_address: formData.get("participantAddress"),
      // Include the actual signature image data URL captured from the canvas
      participant_signature: participantSignature,

      // These two will be nil until the admin updates the form with them
      organization_witness_name: formData.get("organizationWitnessName"),
      organization_witness_signature: formData.get("organizationWitnessSignature"),
      signed_on: signedOnTimestamp,
      // signedToday: formData.get("signedToday"),
      // Note: Should we pull the date from signedToday, or simply extract it from CreatedAt in the backend?
      participant_date_of_birth: formData.get("participantDateOfBirth"),
      participant_email_address: formData.get("participantEmailAddress"),
      participant_phone: formData.get("participantPhone"),
      emergency_contact_name: formData.get("emergencyContactName"),
      emergency_contact_number: formData.get("emergencyContactPhone"),
      relationship: formData.get("relationship"),
      // user_id: User.current.id // Check if this is available globally
    };

    console.log("[NewWaiverForm] Submitting DATA with CSRF Token:", data, csrfToken);
    if (props.onSubmit) {
      try {
        const result = await props.onSubmit(data, csrfToken);
        console.log("[NewWaiverForm] onSubmit result:", result);
        // Attempt to extract the created waiver ID from common response shapes
        const createdId = result?.id || result?.data?.id || result?.waiver?.id;
        if (createdId) {
          // Redirect to the show page for the newly created waiver
          window.location.href = `/waivers/${createdId}`;
        } else {
          console.warn("Waiver created, but no ID found in response. Result:", result);
        }
      } catch (error) {
        console.error(
          "Error during submission in parent component (likely network or server error):",
          error
        );

        // Normalize API error responses into array of { field, message }
        const parsed = [];
        const payload = error?.response?.data || error?.data || error;

        const pushMessage = (msg, inferredField = "base") => {
          parsed.push({ field: inferredField, message: String(msg) });
        };

        if (payload) {
          // If payload.errors exists, prefer it (can be object or array)
          if (payload.errors) {
            if (Array.isArray(payload.errors)) {
              payload.errors.forEach((m) => {
                // Handle string errors and object-shaped errors like { message: '...' } or { field: 'x', message: 'y' }
                if (typeof m === "string") {
                  const msg = m;
                  if (/email/i.test(msg)) pushMessage(msg, "participant_email_address");
                  else if (/user/i.test(msg) || /already.*created/i.test(msg))
                    pushMessage(msg, "base");
                  else pushMessage(msg, "base");
                } else if (m && typeof m === "object") {
                  if (m.field && m.message !== undefined) {
                    pushMessage(m.message, m.field);
                  } else if (m.message) {
                    const msg = String(m.message);
                    if (/email/i.test(msg)) pushMessage(msg, "participant_email_address");
                    else if (/user/i.test(msg) || /already.*created/i.test(msg))
                      pushMessage(msg, "base");
                    else pushMessage(msg, "base");
                  } else if (m.error) {
                    pushMessage(String(m.error), "base");
                  } else {
                    pushMessage(JSON.stringify(m), "base");
                  }
                } else {
                  pushMessage(String(m), "base");
                }
              });
            } else if (typeof payload.errors === "object") {
              Object.entries(payload.errors).forEach(([key, val]) => {
                if (Array.isArray(val)) {
                  val.forEach((m) => {
                    if (typeof m === "string") pushMessage(m, key === "base" ? "base" : key);
                    else if (m && typeof m === "object") {
                      if (m.message) pushMessage(m.message, key === "base" ? "base" : key);
                      else if (m.error) pushMessage(m.error, key === "base" ? "base" : key);
                      else pushMessage(JSON.stringify(m), key === "base" ? "base" : key);
                    } else pushMessage(String(m), key === "base" ? "base" : key);
                  });
                } else {
                  if (typeof val === "string") pushMessage(val, key === "base" ? "base" : key);
                  else if (val && typeof val === "object") {
                    if (val.message) pushMessage(val.message, key === "base" ? "base" : key);
                    else pushMessage(JSON.stringify(val), key === "base" ? "base" : key);
                  } else pushMessage(String(val), key === "base" ? "base" : key);
                }
              });
            } else {
              pushMessage(payload.errors, "base");
            }
          }

          // Also accept top-level message/error fields and include them if present
          if (payload.message && (!payload.errors || payload.errors.length === 0)) {
            pushMessage(payload.message, "base");
          }
          if (payload.error && (!payload.errors || payload.errors.length === 0)) {
            pushMessage(payload.error, "base");
          }

          // If nothing parsed, try common shapes (string payload)
          if (parsed.length === 0) {
            if (typeof payload === "string") pushMessage(payload, "base");
            else pushMessage("Submission failed. Please try again.", "base");
          }
        } else {
          pushMessage("Submission failed. Please try again.", "base");
        }

        console.debug("API error payload:", payload);
        console.debug("Parsed validation errors:", parsed);
        setValidationErrors(parsed);
      } finally {
        // Re-enable submit button regardless of success/failure
        setIsSubmitting(false);
        console.log("[NewWaiverForm] Submission flow finished");
      }
    } else {
      console.error(
        "CRITICAL ERROR: props.onSubmit function is missing from the parent component. Cannot submit waiver."
      );
      setValidationErrors(["Submission configuration error: missing onSubmit handler."]);
      setIsSubmitting(false);
    }
  };

  console.log("Are we hitting the currentUser? ", isAuthenticated);

  // const [penColor, setPenColor] = useState("black"); // changing penColor functionality is broken but that's fine because we don't really need it
  // const colors = ["black", "green", "red"];

  const download = () => {
    const dlink = document.createElement("a");
    dlink.setAttribute("href", imageUserURL);
    dlink.setAttribute("download", "signature.png");
    dlink.click();
  };

  const handleDownloadPdf = async () => {
    // TODO 1 (maybe not in TA): Need to take the current zoom level with window.devicepixelratio and then use this to force the image to resize to fit one page of a PDF using a transform equation. Every browser is different so this can be hard to optimise but let's see how it goes in development.
    const element = printRef.current;
    const canvas = await html2canvas(element);
    const data = canvas.toDataURL("image/png");
    const pageHeight = 296; // ADDED; originally 295
    const pdf = new jsPDF("p", "mm"); // Bracketed part is ADDED
    let position = 0; // ADDED
    const imgProperties = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

    let heightLeft = pdfHeight; // ADDED

    // pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    // uncomment the above to revert
    pdf.addImage(data, imgFormat, 0, position, pdfWidth, pdfHeight); // this is a VARIANT
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      // Whole loop is ADDED
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(data, imgFormat, 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    // Let's get the participant's name as a prefix on that PDF!
    pdf.save(participantName + " Waiver.pdf");
    // TODO 2 Also, add a final filename when the admin signs it if possible
  };

  const handleDownloadStudentSigImg = async () => {
    const studentSig = document.getElementById("student");
    const studentName = participantName;
    console.log("This is the student signature", studentSig);
    console.log("This is their name", studentName.props);
    const originalImage = studentSig.src;
    const image = await fetch(originalImage);

    // split the name
    const nameSplit = originalImage.split("/");
    const duplicateName = nameSplit.pop();

    const imageBlog = await image.blob();
    const imageURL = URL.createObjectURL(imageBlog);
    const link = document.createElement("a");
    link.href = imageURL;
    link.download = studentName + "'s " + "signature" + "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // this.createWaiver;

    // TODO: Right now this *downloads* the image to the local PC but we need it to **upload** the image to our server, that can only come after tweaks with the server/production code; don't leave the download function in production code
  };

  // Use effects
  useEffect(() => {
    skipInputRef.current.tabIndex = -1;
  }, []);

  useEffect(() => {
    // We must log the participant signature after the state change has been applied, so that createUserSig can update it asynchronously for the next render
    console.log("participantSignature state updated:", participantSignature);
  }, [participantSignature]);

  // TODO 3: So the above function produces a nice PDF print of the page, but the boundary between the bottom of a page and the top of the next one may need work. Can we use a blank whitespace image (basically a white row) as buffer to make it look nicer, TA?
  // Also, we need to ensure that it looks good as a print from a mobile device, etc. Can we force it to render as a desktop view for the PDF? That seems like it may be easiest. If not, must put row elements onto their own lines to make all the data nice and visible.

  console.log("This is the signature", participantSignature);

  const hasFieldErrors = validationErrors.some((e) => e.field && e.field !== "base");

  return (
    <Form
      noValidate
      onSubmit={handleSubmit}
      className="waiver-form"
      style={{ fontSize: 20, maxWidth: "1100px", width: "100%", margin: "0 auto" }}
    >
      {/* TODO 4- note: the shift to the right may be because of appJS, the footer, or perhaps the welcome page, investigate */}
      <Form.Group controlId="formFullWaiverNotButtons" ref={printRef}>
        {/* Top-level alert removed: field-level errors display next to inputs; base errors show below submit button. */}
        <Form.Group controlId="formBasicWaiver">
          <Form.Label
            id="top-label"
            style={{
              textDecorationLine: "underline",
              display: "flex",
              flexDirection: "column",
              alignContent: "center",
              margin: "0px",
              flexWrap: "wrap",
            }}
          >
            Jitsu Canada Waiver (mandatory for all participants)
          </Form.Label>
          <br />
        </Form.Group>
        <Form.Group
          controlId="formBasicSummary"
          style={{
            display: "flex",
            flexDirection: "row",
            alignContent: "flexStart",
            margin: "0px",
            flexWrap: "wrap",
          }}
        >
          <Row
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "center",
              flexGrow: "2",
            }}
          >
            <Form.Label
              id="top-label"
              style={{
                textDecorationLine: "underline",
                textAlign: "center",
                margin: "0px",
                maxWidth: "900px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              ACKNOWLEDGEMENT OF RISK AND RELEASE OF LIABILITY
            </Form.Label>
            <Form.Label
              id="top-label"
              style={{
                textAlign: "center",
                margin: "0px",
                maxWidth: "1000px",
                marginLeft: "auto",
                marginRight: "auto",
                fontSize: "14px",
                lineHeight: "1.2",
                letterSpacing: "0.35px",
                wordSpacing: "1px",
              }}
            >
              For Participants <i>Over the Age of Majority</i> in the Province or Territory in which
              the Athletic Activities are Provided by the Organization
            </Form.Label>
            <span></span>
            <Form.Label
              style={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "20px",
                margin: "5px",
                lineHeight: "rem",
                maxWidth: "900px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
              id="top-label"
            >
              WARNING: THIS AGREEMENT WILL AFFECT YOUR LEGAL RIGHTS, READ IT CAREFULLY!
            </Form.Label>
            <Form.Label
              id="top-label"
              style={{
                textAlign: "center",
                marginTop: "-3px",
                maxWidth: "900px",
                marginLeft: "auto",
                marginRight: "auto",
                fontSize: "14px",
                lineHeight: "1.3",
              }}
            >
              Every Person MUST Read and Understand this Waiver Before Participating in Athletic
              Activities
            </Form.Label>
            {/* Paragraph moved below so it aligns with the numbered clauses */}
          </Row>
        </Form.Group>
        <Form.Group
          controlId="formBasicSummary"
          style={{
            display: "flex",
            flexDirection: "column",
            alignContent: "flexStart",
            margin: "0px",
            flexWrap: "wrap",
          }}
        >
          {/* Waiver intro paragraph aligned with the numbered clauses below */}
          <Row
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              flexGrow: "2",
              marginBottom: "0.5rem",
            }}
          >
            <div />
            <div style={{ marginLeft: "1rem", flex: 1 }}>
              The following waiver of all claims, release from all liability, assumption of all
              risks and other terms of this agreement are entered into by me (the "Participant")
              with and for the benefit of: Jitsu Canada, its owners, directors, officers, employees,
              volunteers, coaches, officials, business operators, agents and site property owners or
              Occupiers (the "Organization"). Occupiers is defined in accordance with the definition
              of Occupiers contained in the Occupiers Liability legislation applicable to the
              Province or Territory in which the Athletic Activities are provided by the
              Organization.
            </div>
          </Row>
          <Row
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              flexGrow: "2",
              marginBottom: "0rem",
            }}
          >
            <div style={{ width: "2rem", flexShrink: 0 }}>1.</div>
            <div style={{ marginLeft: "1rem", flex: 1 }}>
              "Athletic Activities" includes but is not limited to contact and non-contact sports,
              fitness activities, personal training instruction and activities, use of facilities,
              and fitness programs and services provided to the Participant by the Organization.
            </div>
          </Row>
          <Row
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              flexGrow: "2",
            }}
          >
            <div style={{ width: "2rem", flexShrink: 0 }}>2.</div>
            <div style={{ marginLeft: "1rem", flex: 1 }}>
              I am aware that there are inherent and significant risks ("Risks") associated with the
              participation in Athletic Activities, I am aware that those Risks include but are not
              limited to the potential for serious personal injury caused by any event or any
              condition of the facility or equipment where Athletic Activities are provided by the
              Organization, and health risks such as transient light-headedness, fainting, abnormal
              blood pressure, chest discomfort, muscle cramps or soreness, and nausea. I understand
              the Risks are relative to my own state of fitness and health (physical, mental and
              emotional), and to the awareness, care and skill with which I conduct myself while
              participating in Athletic Activities.
            </div>
          </Row>
          <Row
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              flexGrow: "2",
            }}
          >
            <div style={{ width: "2rem", flexShrink: 0 }}>3.</div>
            <div style={{ marginLeft: "1rem", flex: 1 }}>
              I freely accept and fully assume all responsibility for all Risks and possibilities of
              personal injury, death, property damage or loss resulting from my participation in
              Athletic Activities. I agree that although the Organization has taken steps to reduce
              the Risks and increase safety of the Athletic Activities, it is not possible for the
              Organization to make the Athletic Activities completely safe. I accept these Risks and
              agree to the terms of this waiver even if the Organization is found to be negligent or
              in breach of any duty of care or any obligation to me in my participation in Athletic
              Activities.
            </div>
          </Row>
          <Row
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              flexGrow: "2",
            }}
          >
            <div style={{ width: "2rem", flexShrink: 0 }}>4.</div>
            <div style={{ marginLeft: "1rem", flex: 1 }}>
              I acknowledge my obligation to immediately inform the nearest employee or others of
              the Organization if I feel any pain, discomfort, fatigue or other symptoms that I may
              suffer during and immediately after my participation in Athletic Activities. I
              understand I may stop participation at any time, and I may be requested to stop by an
              employee or others of the Organization who observes any symptoms of distress or
              abnormal response.
            </div>
          </Row>
          <Row
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              flexGrow: "2",
            }}
          >
            <div style={{ width: "2rem", flexShrink: 0 }}>5.</div>
            <div style={{ marginLeft: "1rem", flex: 1 }}>
              I confirm that I have reached the age of majority in the province or territory in
              which I am participating in Athletic Activities.
            </div>
          </Row>
          <Row
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              flexGrow: "2",
            }}
          >
            <div style={{ width: "2rem", flexShrink: 0 }}>6.</div>
            <div style={{ marginLeft: "1rem", flex: 1 }}>
              In addition to consideration given to the Organization for my participation in
              Athletic Activities, I and my heirs, next of kin, and assigns (collectively my "Legal
              Representatives"), agree:
              <Row
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  flexGrow: "2",
                }}
              >
                <div style={{ width: "2rem", flexShrink: 0, marginLeft: "3rem" }}>a.</div>
                <div style={{ marginLeft: "1rem", flex: 1 }}>
                  to waive all claims that I have or may have in the future against the
                  Organization;
                </div>
              </Row>
              <Row
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  flexGrow: "2",
                }}
              >
                <div style={{ width: "2rem", flexShrink: 0, marginLeft: "3rem" }}>b.</div>
                <div style={{ marginLeft: "1rem", flex: 1 }}>
                  to release and forever discharge the Organization from all liability for all
                  personal injury, death, property damage, or loss resulting from my participation
                  in the Fitness Activities due to any cause, including but not limited to
                  negligence (failure to use such care as a reasonably prudent and careful person
                  would use under similar circumstances), breach of any duty imposed by law, breach
                  of contract or mistake or error of judgment of the Organization; and
                </div>
              </Row>
              <Row
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  flexGrow: "2",
                }}
              >
                <div style={{ width: "2rem", flexShrink: 0, marginLeft: "3rem" }}>c.</div>
                <div style={{ marginLeft: "1rem", flex: 1 }}>
                  to be liable for and to hold harmless and indemnify the Organization from all
                  actions, proceedings, claims, damages, costs demands including court costs and
                  costs on a solicitor and own client basis, and liabilities of whatsoever nature or
                  kind arising out of or in any way connected with my participation in Athletic
                  Activities.
                </div>
              </Row>
            </div>
          </Row>
          <Row
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              flexGrow: "2",
            }}
          >
            <div style={{ width: "2rem", flexShrink: 0 }}>7.</div>
            <div style={{ marginLeft: "1rem", flex: 1 }}>
              I agree that this waiver and all terms contained within are governed exclusively by
              the laws of the Province or Territory of Canada in which the Athletics Activities are
              provided to me by the Organization. I hereby irrevocably submit to the exclusive
              jurisdiction of the courts of that Province or Territory. Any litigation to enforce
              this waiver must be instituted in the Province or Territory in which the Athletic
              Activities are provided by the Organization.
            </div>
          </Row>
          <Row
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              flexGrow: "2",
              marginBottom: "2rem",
            }}
          >
            <div style={{ width: "2rem", flexShrink: 0 }}>8.</div>
            <div style={{ marginLeft: "0.5rem", flex: 1 }}>
              I confirm that I have had sufficient time to read and understand each term in this
              waiver in its entirety, and have agreed to the terms freely and voluntarily. I
              understand that this waiver is binding on myself and my Legal Representatives.
            </div>
          </Row>
          <br />
        </Form.Group>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            marginBottom: "2rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              name="participantInitials"
              type="text"
              style={{ width: "4rem" }}
              required={true}
              value={participantInitials}
              onChange={handleInitialsChange}
            />
            <label name="initials" style={{ marginLeft: "1rem" }}>
              Please initial the box after reading and understanding the above statements and
              conditions
            </label>
          </div>
          {hasError("initials") && (
            <div style={{ color: "#dc3545", marginTop: "0.25rem", marginLeft: "1rem" }}>
              {fieldError("initials")}
            </div>
          )}
        </div>

        <Form.Group
          controlId="formBasicSummary"
          style={{
            display: "flex",
            flexDirection: "column",
            alignContent: "flexStart",
            margin: "0px",
            flexWrap: "wrap",
            marginTop: "1rem",
          }}
        >
          <Row
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              flexGrow: "2",
            }}
          >
            {/* TODO 5 (but down the road): Refactor to use an object to set the common style for these Form.Group items; has this already been done? */}
            <div className="input-container" style={{ flex: 1, marginBottom: "3rem" }}>
              <input
                name="participantName"
                type="text"
                id="title"
                required={true}
                style={{
                  boxShadow: "none",
                  // border: "none",
                  boxSizing: "inherit",
                  height: "3rem",
                  color: "black",
                  // marginTop: "2rem"
                }}
                onChange={handleNameChange}
                onFocus={() => setParticipantNameFocused(true)}
                onBlur={() => setParticipantNameFocused(false)}
                value={participantName}
                placeholder=""
              ></input>
              {hasError("participant_name") && (
                <div style={{ color: "#dc3545", marginTop: "0.25rem" }}>
                  {fieldError("participant_name")}
                </div>
              )}
              <label
                className={participantName && "filled"}
                htmlFor={participantName}
                style={{ fontSize: 20, marginLeft: "1rem" }}
              >
                Participant Name
              </label>
              {participantNameFocused && (
                <div
                  style={{
                    color: "#6c757d",
                    fontSize: "0.9rem",
                    marginTop: "0.25rem",
                    fontWeight: "700",
                    textDecoration: "underline",
                  }}
                >
                  Please enter the participant's full name (first and last) if applicable.
                </div>
              )}
            </div>
            <Form.Group
              name="groupParticipantAddress"
              controlId="formParticipantAddress"
              style={{ flex: 1, margin: "0px" }}
            >
              <div className="input-container" style={{ flex: 1, margin: "0px" }}>
                <input
                  name="participantAddress"
                  type="text"
                  id="studentName"
                  required={true}
                  style={{
                    boxShadow: "none",
                    // border: "none",
                    boxSizing: "inherit",
                    height: "3rem",
                  }}
                  onChange={handleAddressChange}
                  value={participantAddress}
                  placeholder=""
                />
                {hasError("participant_address") && (
                  <div style={{ color: "#dc3545", marginTop: "0.25rem" }}>
                    {fieldError("participant_address")}
                  </div>
                )}
                <label className={participantAddress && "filled"} htmlFor={participantAddress}>
                  Participant Address
                </label>
              </div>
            </Form.Group>
            <Form.Group
              name="groupParticipantSignature"
              controlId="formParticipantSignature"
              style={{ flex: 1, marginBottom: "1rem" }}
            >
              <div className="input-container" style={{ flex: 1, margin: "0px" }}>
                <input
                  type="text"
                  readOnly
                  id="title"
                  required={true}
                  style={{
                    boxShadow: "none",
                    // border: "none",
                    boxSizing: "inherit",
                    height: "3rem",
                  }}
                  value="Please sign this using the button below"
                />
                <label className={"filled"} htmlFor={participantSignature}>
                  Participant Signature
                </label>
              </div>
            </Form.Group>
          </Row>
          <Row
            className="field-row--spaced"
            style={{ display: "flex", flexDirection: "row", marginBottom: "2rem" }}
          >
            <Form.Group
              name="groupOrganizationWitnessName"
              controlId="formOrganizationWitnessName"
              style={{ flex: 1 }}
            >
              <div className="input-container" style={{ flex: 1, margin: "0px" }}>
                <input
                  type="text"
                  readOnly
                  id="title"
                  required={true}
                  style={{
                    boxShadow: "none",
                    // border: "none",
                    boxSizing: "inherit",
                    height: "3rem",
                  }}
                  value="The witness will print their name for you"
                  placeholder=""
                />
                <label className={"filled"} htmlFor={organizationWitnessName}>
                  Organization Witness Name
                </label>
              </div>
            </Form.Group>
            <Form.Group
              name="groupOrganizationWitnessSignature"
              controlId="formOrganizationWitnessSignature"
              style={{ flex: 1, marginTop: "0px" }}
            >
              <div className="input-container" style={{ flex: 1, margin: "0px" }}>
                <input
                  type="text"
                  readOnly
                  id="title"
                  required={true}
                  style={{
                    boxShadow: "none",
                    // border: "none",
                    boxSizing: "inherit",
                    height: "3rem",
                  }}
                  value="The witness will sign this for you"
                  placeholder=""
                />
                <label
                  className={"filled"}
                  htmlFor={organizationWitnessSignature}
                  style={{ whiteSpace: "nowrap", overflow: "visible" }}
                >
                  Organization Witness Signature
                </label>
              </div>
            </Form.Group>
          </Row>
          <Row
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              flexGrow: "2",
              marginBottom: "3rem",
            }}
          >
            <Form.Group
              name="groupsignedToday"
              controlId="formSignedToday"
              ref={skipInputRef}
              style={{ flex: 2, marginBottom: "0px" }}
            >
              <Form.Control
                name="signedToday"
                placeholder={
                  "Signed this " +
                  String(day_with_ord) +
                  " day of " +
                  String(month) +
                  ", " +
                  String(year)
                }
                readOnly
                style={{ fontWeight: "bold" }}
              ></Form.Control>
            </Form.Group>
          </Row>
          <Row
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              flexGrow: "2",
              marginBottom: "3rem",
            }}
          >
            <Form.Group
              name="groupParticipantDateOfBirth"
              controlId="formGroupParticipantDateOfBirth"
              style={{ flex: 1, margin: "0px" }}
            >
              <div className="input-container" style={{ flex: 1, margin: "0px" }}>
                <input
                  name="participantDateOfBirth"
                  type="date"
                  id="title"
                  required={true}
                  style={{
                    boxShadow: "none",
                    // border: "none",
                    boxSizing: "inherit",
                    height: "3rem",
                  }}
                  onChange={handleParticipantDateOfBirth}
                  value={participantDateOfBirth}
                  placeholder=""
                />
                {hasError("participant_date_of_birth") && (
                  <div style={{ color: "#dc3545", marginTop: "0.25rem" }}>
                    {fieldError("participant_date_of_birth")}
                  </div>
                )}
                <label className={"filled"} htmlFor={participantDateOfBirth}>
                  Participant Date Of Birth
                </label>
              </div>
            </Form.Group>
            <Form.Group
              name="groupParticipantEmailAddress"
              controlId="formGroupParticipantEmailAddress"
              style={{ flex: 1, margin: "0px" }}
            >
              <div className="input-container" style={{ flex: 1, margin: "0px" }}>
                <input
                  name="participantEmailAddress"
                  type="email"
                  pattern="^([\\w+\\-.])+@[a-z\\d\\-]+(\\.[a-z]+)*\\.[a-z]+$"
                  id="title"
                  required={true}
                  style={{
                    boxShadow: "none",
                    // border: "none",
                    boxSizing: "inherit",
                    height: "3rem",
                  }}
                  onChange={handleEmailAddressChange}
                  value={participantEmailAddress}
                  placeholder=""
                />
                {hasError("participant_email_address") && (
                  <div style={{ color: "#dc3545", marginTop: "0.25rem" }}>
                    {fieldError("participant_email_address")}
                  </div>
                )}
                <label
                  className={participantEmailAddress && "filled"}
                  htmlFor={participantEmailAddress}
                >
                  Participant Email Address
                </label>
              </div>
            </Form.Group>
            <Form.Group
              name="groupParticipantPhone"
              controlId="formParticipantPhone"
              style={{ flex: 1, marginTop: "0rem", marginBottom: "0px" }}
            >
              <div className="input-container" style={{ flex: 1, margin: "0px" }}>
                <input
                  name="participantPhone"
                  type="text"
                  id="title"
                  required={true}
                  style={{
                    boxShadow: "none",
                    // border: "none",
                    boxSizing: "inherit",
                    height: "3rem",
                  }}
                  onChange={handlePhoneChange}
                  value={participantPhone}
                  placeholder=""
                />
                {hasError("participant_phone") && (
                  <div style={{ color: "#dc3545", marginTop: "0.25rem" }}>
                    {fieldError("participant_phone")}
                  </div>
                )}
                <label className={participantPhone && "filled"} htmlFor={participantPhone}>
                  Participant Phone
                </label>
              </div>
            </Form.Group>
          </Row>
          <Row
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              flexGrow: "2",
            }}
          >
            <Form.Group
              name="groupEmergencyContactName"
              controlId="formEmergencyContactName"
              style={{ flex: 1, marginTop: "-1rem" }}
            >
              <div className="input-container" style={{ flex: 1, margin: "0px" }}>
                <input
                  name="emergencyContactName"
                  type="text"
                  id="title"
                  required={true}
                  style={{
                    boxShadow: "none",
                    // border: "none",
                    boxSizing: "inherit",
                    height: "3rem",
                  }}
                  onChange={handleEmergencyContactChange}
                  onFocus={() => setEmergencyContactFocused(true)}
                  onBlur={() => setEmergencyContactFocused(false)}
                  value={emergencyContact}
                  placeholder=""
                />
                <label className={emergencyContact && "filled"} htmlFor={emergencyContact}>
                  Emergency Contact Name
                </label>
                {emergencyContactFocused && (
                  <div
                    style={{
                      color: "#6c757d",
                      fontSize: "0.9rem",
                      marginTop: "0.25rem",
                      fontWeight: "700",
                      textDecoration: "underline",
                    }}
                  >
                    Please enter the emergency contact's full name (first, last and any middles) if
                    applicable.
                  </div>
                )}
                {hasError("emergency_contact_name") && (
                  <div style={{ color: "#dc3545", marginTop: "0.25rem" }}>
                    {fieldError("emergency_contact_name")}
                  </div>
                )}
              </div>
            </Form.Group>
            <Form.Group
              name="groupEmergencyContactPhone"
              controlId="formEmergencyContactPhone"
              style={{ flex: 1, marginTop: "-1rem" }}
            >
              <div className="input-container" style={{ flex: 1, margin: "0px" }}>
                <input
                  name="emergencyContactPhone"
                  type="text"
                  id="title"
                  required={true}
                  style={{
                    boxShadow: "none",
                    // border: "none",
                    boxSizing: "inherit",
                    height: "3rem",
                  }}
                  onChange={handleEmergencyContactPhone}
                  value={emergencyContactPhone}
                  placeholder=""
                />
                <label
                  className={emergencyContactPhone && "filled"}
                  htmlFor={emergencyContactPhone}
                >
                  Emergency Contact Phone
                </label>
                {hasError("emergency_contact_number") && (
                  <div style={{ color: "#dc3545", marginTop: "0.25rem" }}>
                    {fieldError("emergency_contact_number")}
                  </div>
                )}
              </div>
            </Form.Group>
            <Form.Group
              name="groupRelationship"
              controlId="formRelationship"
              style={{ flex: 1, marginTop: "-1rem" }}
            >
              <div className="input-container" style={{ flex: 1, margin: "0px" }}>
                <input
                  name="relationship"
                  type="text"
                  id="title"
                  required={true}
                  style={{
                    boxShadow: "none",
                    boxSizing: "inherit",
                    height: "3rem",
                  }}
                  onChange={handleRelationship}
                  value={relationship}
                  placeholder=""
                />
                <label className={relationship && "filled"} htmlFor={relationship}>
                  Relationship
                </label>
                {hasError("relationship") && (
                  <div style={{ color: "#dc3545", marginTop: "0.25rem" }}>
                    {fieldError("relationship")}
                  </div>
                )}
              </div>
            </Form.Group>
          </Row>
          {/* Possibly put in a conditional render here... if I can rememeber the rationale for doing so. */}
          <span
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "2.5rem",
              marginBottom: "1rem",
            }}
          >
            Please press the signature button below then print your participant signature in the pad
            which will appear below:
          </span>

          {isAuthenticated && isAuthenticated.is_admin ? (
            <>
              <br />
              <br />

              <div style={{ marginRight: "20rem" }}>
                <Button
                  className="custom-pill-button"
                  variant="primary"
                  type="button"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    backgroundColor: "green",
                    color: "white",
                  }}
                  onClick={openUserModalHandler}
                >
                  {participantSignature
                    ? "Replace Participant Signature"
                    : "Create Participant Signature"}
                </Button>
              </div>
              <br />
              {hasError("participant_signature") && (
                <div
                  style={{
                    color: "#dc3545",
                    marginTop: "0.5rem",
                    textAlign: "left",
                    marginLeft: "calc(50% - 275px)",
                  }}
                >
                  {fieldError("participant_signature")}
                </div>
              )}
            </>
          ) : (
            <div>
              <Button
                className="custom-pill-button"
                variant="primary"
                type="button"
                style={{
                  display: "flex",
                  justifyContent: "center !important",
                  marginBottom: "0rem",
                  backgroundColor: "green",
                  color: "white",
                }}
                onClick={openUserModalHandler}
              >
                {participantSignature
                  ? "Replace Participant Signature"
                  : "Create Participant Signature"}
              </Button>
              {hasError("participant_signature") && (
                <div style={{ color: "#dc3545", marginTop: "0.5rem" }}>
                  {fieldError("participant_signature")}
                </div>
              )}
            </div>
          )}

          {/* TODO 6: (But not with TA): For any of the above, can we improve/clarify the form fields over the printed version? */}

          <div className="app">
            {imageUserURL && (
              <>
                <img src={imageUserURL} alt="signature" className="signature" id="student" />
              </>
            )}
            <br />
            <br />​
            {openUserModal && (
              <div className="modalContainer">
                <div>
                  {/* NOTE: the previous div should have "className="modal"" but including it breaks the code. What's wrong there? Some CSS error? Let's discuss this in TA!!!*/}
                  {/* <div className="sigPad__penColors">
              <p>Pen Color:</p>
              {colors.map((color) => (
              <span
              key={color}
              style={{
              backgroundColor: color,
              border: `${color === penColor ? `2px solid ${color}` : ""}`,
              }}
              onClick={() => setPenColor(color)}
              // The change colour element isn't working, try to get it operational or else cut it and just use black by default, according to TA recommendation
              ></span>
              ))}
              </div> */}
                  <div className="sigPadContainer">
                    <SignatureCanvas
                      // penColor={penColor}
                      canvasProps={{ className: "sigCanvas" }}
                      ref={sigCanvasUser}
                      onEnd={() => setUserSigHasInk(true)}
                    />
                    <hr />
                    <button type="button" onClick={clearUserSig}>
                      Clear
                    </button>
                  </div>

                  <div className="modal__bottom">
                    <br />
                    <Button
                      style={{ backgroundColor: "red", color: "white", marginRight: "0.5rem" }}
                      className="custom-pill-button-cancel"
                      onClick={closeUserModalHandler}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="custom-pill-button"
                      onClick={createUserSig}
                      disabled={!userSigHasInk}
                    >
                      Create
                    </Button>
                  </div>
                  <br />
                </div>
              </div>
            )}
            {/* Test of printRef functionality */}
            {/* <div>I will not be in the PDF.</div>
      <div ref={printRef}>I will be in the PDF.</div> */}
            <div>
              {imageOrgURL && (
                <>
                  <img src={imageOrgURL} alt="signature" className="signature" id="admin" />
                </>
              )}
              <br />
              {/* Uncomment the following block to download the signature as a .png, but we shouldn't need to do that, instead we might want the signatures to instantiate in the appropriate fields*/}

              {openOrgModal && (
                <div className="modalContainer">
                  <div>
                    {/* Organization witness signature modal */}

                    <div className="sigPadContainer">
                      <SignatureCanvas
                        // penColor={penColor}
                        canvasProps={{ className: "sigCanvas" }}
                        ref={sigCanvasOrg}
                        onEnd={() => setOrgSigHasInk(true)}
                      />
                      <hr />
                      <button type="button" onClick={clearOrgSig}>
                        Clear
                      </button>
                    </div>
                    <div className="modal__bottom">
                      <Button
                        type="button"
                        style={{ backgroundColor: "red", color: "white", marginRight: "0.5rem" }}
                        className="custom-pill-button-cancel"
                        onClick={closeOrgModalHandler}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        className="custom-pill-button"
                        onClick={createOrgSig}
                        disabled={!orgSigHasInk}
                      >
                        Create
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {isAuthenticated && isAuthenticated.is_admin ? (
            // This conditional render is not working for some reason so if you're logged out you can still see it. Fix this.
            <>
              <div style={{ marginTop: "10rem" }}>
                <span style={{ display: "flex", justifyContent: "center" }}>
                  Please press the signature button below then print the organization witness
                  signature in the pad which will appear above ▲
                  {/* <span aria-hidden="true" style={{ marginLeft: "0.25rem" }}>
                    ▲
                  </span> */}
                </span>
              </div>
              <br />
              <br />
            </>
          ) : (
            <div></div>
          )}
        </Form.Group>
      </Form.Group>

      {/* <button style={{ display: "flex", justifyContent: "center !important", marginBottom: "0rem" }} onClick={() => setOpenUserModal(true)}>Create Participant Signature</button> */}

      <br />
      <br />
      <br />
      <br />

      {/* PRIORITY TODO: Add interstitial "Congrats, you've signed the waiver!" flash and then redirect to the home page after a countdown timer, 5, 4, 3, 2, 1... boom*/}
      {/* Because we don't want to cause confusion about has the submit button worked or not, this new approach shows the user that it succeeded very nicely */}

      {isAuthenticated && isAuthenticated.is_admin ? (
        <>
          <br />
          <div>
            <Button
              className="custom-pill-button"
              variant="secondary"
              type="button"
              style={{ backgroundColor: "green", color: "white" }}
              onClick={() => setOpenOrgModal(true)}
            >
              {organizationWitnessSignature
                ? "Replace Organization Witness Signature"
                : "Create Organization Witness Signature"}
            </Button>
          </div>
          <br />
        </>
      ) : (
        <div></div>
      )}

      {/* <button type="button" onClick={handleDownloadPdf} style={{ marginTop: "-10rem" }}>
      Download as PDF
      </button> */}
      <br />
      <br />

      {/* NOTE: do restyling for the custom button below */}

      <button
        className="pill"
        variant="primary"
        type="submit"
        aria-busy={isSubmitting}
        disabled={isSubmitting || csrfStatus !== "loaded"}
        // onClick={handleDownloadStudentSigImg}
        style={{
          display: "flex",
          justifyContent: "center !important",
          marginTop: "2rem",
          opacity: isSubmitting ? 0.7 : 1,
          cursor: isSubmitting ? "not-allowed" : "pointer",
          background: "linear-gradient(to right, rgb(3, 138, 255), rgb(118, 75, 162))",
          color: "white",
        }}
      >
        {isSubmitting ? "Submitting…" : "Save Your Signature and Submit Waiver"}
      </button>
      <div style={{ marginTop: "0.5rem", textAlign: "center" }}>
        {isSubmitting && <span>Submitting your waiver…</span>}
        {!isSubmitting && csrfStatus !== "loaded" && (
          <span style={{ color: "#6c757d" }}>Preparing security token… please wait</span>
        )}
      </div>

      {/* Render base (non-field) errors below the submit button */}
      {validationErrors.some((e) => e.field === "base") && (
        <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
          {validationErrors
            .filter((e) => e.field === "base")
            .map((e, idx) => (
              <div key={idx} style={{ color: "#dc3545", marginTop: "0.25rem" }}>
                {transformBaseMessage(formatErrorForDisplay(e.message || e))}
              </div>
            ))}
          {hasFieldErrors && (
            <div style={{ color: "#6c757d", marginTop: "0.5rem" }}>
              Please scroll up and check the form for any field-specific errors highlighted above.
            </div>
          )}
        </div>
      )}

      {/* <button
        className="pill"
        variant="primary"
        type="submit"
        // onClick={handleDownloadStudentSigImg}
        style={{
          display: "flex",
          justifyContent: "center !important",
          marginTop: "2rem",
          background: "linear-gradient(to right, rgb(3, 138, 255), rgb(118, 75, 162))",
          color: "white",
        }}
      >
        Save Your Signature and Submit Waiver
      </button> */}

      {/* ^^ This seems to be Ajax interrupting React JS so that it makes all clickable elements nullified and forcing a refresh to make the page interactive again, so drill into this to solve the problem; maybe it does a partial refresh itself */}

      {/* <button
      className="pill"
      variant="primary"
      type="submit"
      style={{ 
        display: "flex",
        justifyContent: "center !important",
        marginTop: "2rem",
        background: 'linear-gradient(to right, rgb(3, 138, 255), rgb(118, 75, 162))', color: "white"}}>
        onClick={handleSubmit}
        Submit
      </button> */}

      {/* The button above seems redundant if the downloadSig button submits anyway. Wonder why that is? */}

      {/* TODO 7 (redundant unless we lean on PDF functionality again): We need the functionality of the previous two buttons to be merged. The waiver needs to submit into the backend and simultaneously generate the PDF which should be sent via automailer to myself. function twoCalls(event) in AdminForm.js may be of use.  */}
      <br />
      <br />

      {/* TODO 8: Can a TA advise if we should use a captcha to lock bots out? And require the signature to be created before handleSubmit is approved? */}
      {/* Last TODO 9 (doesn't have to be immediate): make the signature buttons a modular reusable component */}
    </Form>
  );
}
