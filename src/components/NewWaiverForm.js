// TODO: Will modularise this, and UpdateWaiverForm and related components, after the first commit to the new repo

// import Text from 'react-native';
// import FormErrors from "./FormErrors";
import { Form, Row, Button } from "react-bootstrap";
import { User } from "../requests";
// import FloatingLabel from 'react-bootstrap-floating-label';
import SignatureCanvas from "react-signature-canvas";
// import SignatureForm from "./SignatureForm";
import moment from "moment";
import React, { useState, useRef, useEffect } from "react";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Center the floating label text on this form's fields, vertically, and for all other similar form fields. Make sure no letters' tails clip through the box e.g. g, p.

// import { MDBBtn } from 'mdb-react-ui-kit';
import "../App.scss";


function NewWaiverForm(props) {

  console.log("On render, are the props.waiver getting passed down?", props.waiver)

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

  console.log("This is their name", participantName);
  console.log("This is their address", participantAddress);
  console.log("This is their relationship", relationship);
  let imgString = "/public/images/" + participantName + "'s signature.png";
  console.log("This is imgString", imgString);

const handleInitialsChange = (e) => {
  setParticipantInitials(e.target.value);
};
  
const handleNameChange = (event) => {
    console.log("This is the name", event.target.value);
    setParticipantName(event.target.value);
  };

const handleAddressChange = (event) => {
    console.log("This is the address", event.target.value);
    setParticipantAddress(event.target.value);
  };

const handleParticipantSignatureChange = (event) => {
  console.log("Signature entered:", event.target.value);
  if (!event.target.value) {
      console.log("🚨 Signature is empty! Button might not update.");
  } 
  setParticipantSignature(event.target.value);
};

const handleOrganizationWitnessNameChange = (event) => {
  console.log("This is the witness name", event.target.value);
  setOrganizationWitnessName(event.target.value);
  };

const handleOrganizationWitnessSignatureChange = (event) => {
    console.log("This is the witness Signature", event.target.value);
    setOrganizationWitnessSignature(event.target.value);
  };

const handleSignedToday = (event) => {
    console.log("This is the signing date", event.target.value);
    setSignedToday(event.target.value);
  };

const handleParticipantDateOfBirth = (event) => {
    console.log("This is the signing date", event.target.value);
    setParticipantDateOfBirth(event.target.value);
  };

const handleEmailAddressChange = (event) => {
    console.log("This is the email address", event.target.value);
    setParticipantEmailAddress(event.target.value);
};

const handlePhoneChange = (event) => {
  console.log("This is the phone number", event.target.value);
  setParticipantPhone(event.target.value);
};

const handleEmergencyContactChange = (event) => {
  console.log("This is the emergency contact name", event.target.value);
  setEmergencyContact(event.target.value);
};

const handleEmergencyContactPhone = (event) => {
  console.log("This is the emergency contact phone number", event.target.value);
  setEmergencyContactPhone(event.target.value);
};

const handleRelationship = (event) => {
  console.log("This is the relationship", event.target.value);
  setRelationship(event.target.value);
};
 
console.log("These are the props", props)

  function handleSubmit(event) {
      event.preventDefault();
      const { currentTarget } = event;
      const formData = new FormData(currentTarget);
  
      const data = {
        // participant_initials: formData.get("participantInitials"),
        participant_name: formData.get("participantName"),
        participant_address: formData.get("participantAddress"),
        // participant_signature: formData.get("participantSignature"),
        // We are currently adapting the above one to reflect the file location of the signature image. Test it!
        participant_signature: imgString,
        organization_witness_name: formData.get("organizationWitnessName"),
        organization_witness_signature: formData.get("organizationWitnessSignature"),
        // signedToday: formData.get("signedToday"),
        // Note: Should we pull the date from signedToday, or simply extract it from CreatedAt in the backend?
        participant_date_of_birth: formData.get("participantDateOfBirth"),
        participant_email_address: formData.get("participantEmailAddress"),
        participant_phone: formData.get("participantPhone"),
        emergency_contact_name: formData.get("emergencyContactName"),
        emergency_contact_number: formData.get("emergencyContactPhone"),
        relationship: formData.get("relationship"),
        user_id: User.current.id
    }

    console.log("DATA is", data);
    props.onSubmit(data);    
  }

const { isAuthenticated } = props;
console.log("Are we hitting the currentUser? ", isAuthenticated);

const [openUserModal, setOpenUserModal] = useState(false);
const [openOrgModal, setOpenOrgModal] = useState(false);
const sigCanvasUser = useRef();
const sigCanvasOrg = useRef();
const skipInputRef = React.createRef();

useEffect(() => {
  skipInputRef.current.tabIndex = -1;
}, []);


const [name, setName] = useState('');

// const [penColor, setPenColor] = useState("black"); // changing penColor functionality is broken but that's fine because we don't really need it
// const colors = ["black", "green", "red"];

const [imageUserURL, setImageUserURL] = useState(null);
const [imageOrgURL, setImageOrgURL] = useState(null);

// We must log the participant signature after the state change has been applied, so that createUserSig can update it asynchronously for the next render
useEffect(() => {
  console.log("participantSignature state updated:", participantSignature);
}, [participantSignature]);

const createUserSig = () => {
  const userURL = sigCanvasUser.current.getTrimmedCanvas().toDataURL("image/png");
  console.log("This is the user sig URL", userURL); // Log to ensure `userURL` is valid
  setImageUserURL(userURL);
  setOpenUserModal(false);
  setParticipantSignature(userURL);
  
  console.log("This is the participant signature on hitting the create button, after the state update", participantSignature)
};

const createOrgSig = () => {
  const orgURL = sigCanvasOrg.current.getTrimmedCanvas().toDataURL("image/png");
  setImageOrgURL(orgURL);
  setOpenOrgModal(false);
};

const download = () => {
  const dlink = document.createElement("a");
  dlink.setAttribute("href", imageUserURL);
  dlink.setAttribute("download", "signature.png");
  dlink.click();
};

const printRef = useRef();

const imgFormat = 'PNG'; // Using this to experiment with what produces the best image quality for the PDF; but it doesn't seem to make much difference?


const handleDownloadPdf = async () => {

  // TODO 1 (maybe not in TA): Need to take the current zoom level with window.devicepixelratio and then use this to force the image to resize to fit one page of a PDF using a transform equation. Every browser is different so this can be hard to optimise but let's see how it goes in development.
  const element = printRef.current;
  const canvas = await html2canvas(element);
  const data = canvas.toDataURL('image/png');
  const pageHeight = 296; // ADDED; originally 295
  const pdf = new jsPDF("p", "mm"); // Bracketed part is ADDED
  let position = 0; // ADDED
  const imgProperties = pdf.getImageProperties(data);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight =
    (imgProperties.height * pdfWidth) / imgProperties.width;
  
  let heightLeft = pdfHeight; // ADDED

  // pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
  // uncomment the above to revert
  pdf.addImage(data, imgFormat, 0, position, pdfWidth, pdfHeight); // this is a VARIANT
  heightLeft -= pageHeight;

  while (heightLeft >= 0) { // Whole loop is ADDED
    position = heightLeft - pdfHeight;
    pdf.addPage();
    pdf.addImage(data, imgFormat, 0, position, pdfWidth, pdfHeight)
    heightLeft -= pageHeight;
  }

  // Let's get the participant's name as a prefix on that PDF!
  pdf.save(participantName + ' Waiver.pdf');
  // TODO 2 Also, add a final filename when the admin signs it if possible
  };


const handleDownloadStudentSigImg = async () => {
  const studentSig = document.getElementById("student");
  const studentName = participantName;
  console.log("This is the student signature", studentSig);
  console.log("This is their name", studentName.props);
  const originalImage=studentSig.src;
  const image = await fetch(originalImage);
  
  // split the name
  const nameSplit=originalImage.split("/");
  const  duplicateName=nameSplit.pop();
  
  const imageBlog = await image.blob()
  const imageURL = URL.createObjectURL(imageBlog)
  const link = document.createElement('a')
  link.href = imageURL;
  link.download = studentName+ "'s " +"signature"+ "";
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)  

  // TODO: Right now this *downloads* the image to the local PC but we need it to **upload** the image to our server, that can only come after tweaks with the server/production code; don't leave the download function in production code
};

// TODO 3: So the above function produces a nice PDF print of the page, but the boundary between the bottom of a page and the top of the next one may need work. Can we use a blank whitespace image (basically a white row) as buffer to make it look nicer, TA?
// Also, we need to ensure that it looks good as a print from a mobile device, etc. Can we force it to render as a desktop view for the PDF? That seems like it may be easiest. If not, must put row elements onto their own lines to make all the data nice and visible.
  
const current = new Date();
const date = `${current.getDate()}/${current.getMonth()+1}/${current.getFullYear()}`;
const day = `${current.getDate()}`;
const day_with_ord = moment.localeData().ordinal(day); // This provides the correct suffix or "ordinal" to the date 
const month = current.toLocaleString('en-EN', { month: "long" });
const year = `${current.getFullYear()}`;
console.log("This is the signature", participantSignature);

  return (
    <Form onSubmit={handleSubmit} style={{fontSize: 20, marginLeft: "2rem"}}>
      {/* TODO 4- note: the shift to the right may be because of appJS, the footer, or perhaps the welcome page, investigate */}
      <Form.Group controlId="formFullWaiverNotButtons" ref={printRef} >
        <Form.Group controlId="formBasicWaiver">
          <Form.Label id="top-label" style={{ textDecorationLine:"underline", display: "flex", flexDirection: "column", alignContent: "center", margin: "0px", flexWrap: "wrap" }}>Jitsu Canada Waiver (mandatory for all participants)</Form.Label>
          <br/>
        </Form.Group>
        <Form.Group controlId="formBasicSummary" style={{ display: "flex", flexDirection: "row", alignContent: "flexStart", margin: "0px", flexWrap: "wrap"}}>
          <Row style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", flexGrow: "2"}}>
            <Form.Label id="top-label" style={{textDecorationLine:"underline", textAlign: "center", margin: "0px"}}>ACKNOWLEDGEMENT OF RISK AND RELEASE OF LIABILITY</Form.Label>
            <Form.Label id="top-label" style={{textAlign: "center", margin: "0px"}}>For Participants <i>Over the Age of Majority</i> in the Province or Territory in which the Athletic Activities are Provided by the Organization</Form.Label>
            <span ></span>
            <Form.Label style={{textAlign: "center", fontWeight: "bold", fontSize: "24px", margin: "5px", lineHeight: "rem"}} id="top-label">WARNING: THIS AGREEMENT WILL AFFECT YOUR LEGAL RIGHTS, READ IT CAREFULLY!</Form.Label>
            <Form.Label id="top-label" style={{textAlign: "center", marginTop: "-3px",}}>Every Person MUST Read and Understand this Waiver Before Participating in Athletic Activities</Form.Label>
            <Form.Label name="clauses">The following waiver of all claims, release from all liability, assumption of all risks and other terms of this agreement are entered into by me
            (the "Participant") with and for the benefit of: Jitsu Canada, its owners, directors, officers, employees, volunteers, coaches, officials,
            business operators, agents and site property owners or Occupiers (the "Organization"). Occupiers is defined in accordance with the
            definition of Occupiers contained in the Occupiers Liability legislation applicable to the Province or Territory in which the Athletic Activities
            are provided by the Organization.
              <br/>
            </Form.Label>
          </Row>
          </Form.Group>
        <Form.Group controlId="formBasicSummary" style={{ display: "flex", flexDirection: "column", alignContent: "flexStart", margin: "0px", flexWrap: "wrap"}}>
        <Row style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", flexGrow: "2"}}>
          <div>1.</div>
          <div style={{ marginLeft: '1rem'}}>
            "Athletic Activities" includes but is not limited to contact and non-contact sports, fitness activities, personal training instruction and activities, use of facilities, and fitness programs and services provided to the Participant by the Organization.
          </div>
        </Row>
        <Row style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", flexGrow: "2"}}>
          <div>2.</div>
          <div style={{ marginLeft: '1rem'}}>
            I am aware that there are inherent and significant risks ("Risks") associated with the participation in Athletic Activities, I am aware that those Risks include but are not limited to the potential for serious personal injury caused by any event or any condition of the facility or equipment where Athletic Activities are provided by the Organization, and health risks such as transient light-headedness, fainting, abnormal blood pressure, chest discomfort, muscle cramps or soreness, and nausea. I understand the Risks are relative to my own state of fitness and health (physical, mental and emotional), and to the awareness, care and skill with which I conduct myself while participating in Athletic Activities.
          </div>
        </Row>
        <Row style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", flexGrow: "2"}}>
          <div>3.</div>
          <div style={{ marginLeft: '1rem'}}>
          I freely accept and fully assume all responsibility for all Risks and possibilities of personal injury, death, property damage or loss resulting from my participation in Athletic Activities. I agree that although the Organization has taken steps to reduce the Risks and increase safety of the Athletic Activities, it is not possible for the Organization to make the Athletic Activities completely safe. I accept these Risks and agree to the terms of this waiver even if the Organization is found to be negligent or in breach of any duty of care or any obligation to me in my participation in Athletic Activities.
          </div>
        </Row>
        <Row style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", flexGrow: "2"}}>
          <div>4.</div>
          <div style={{ marginLeft: '1rem'}}>
          I acknowledge my obligation to immediately inform the nearest employee or others of the Organization if I feel any pain, discomfort, fatigue or other symptoms that I may suffer during and immediately after my participation in Athletic Activities. I understand I may stop participation at any time, and I may be requested to stop by an employee or others of the Organization who observes any symptoms of distress or abnormal response.
          </div>
        </Row>
        <Row style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", flexGrow: "2"}}>
          <div>5.</div>
          <div style={{ marginLeft: '1rem'}}>
          I confirm that I have reached the age of majority in the province or territory in which I am participating in Athletic Activities.
          </div>
        </Row>
        <Row style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", flexGrow: "2"}}>
          <div>6.</div>
          <div style={{ marginLeft: '1rem'}}>
          In addition to consideration given to the Organization for my participation in Athletic Activities, I and my heirs, next of kin, and assigns (collectively my "Legal Representatives"), agree:
          <Row style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", flexGrow: "2"}}>
            <div style={{ marginLeft: '4rem'}}>a.</div>
            <div>
              <div style={{ marginLeft: '1rem'}}> to waive all claims that I have or may have in the future against the Organization;{" "}</div>
            </div>
          </Row>
          <Row style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", flexGrow: "2"}}>
              <div style={{ marginLeft: '4rem'}}>b.</div>
              <div style={{ marginLeft: '1rem'}}>
                to release and forever discharge the Organization from all liability for all personal injury, death, property damage, or loss
                resulting from my participation in the Fitness Activities due to any cause, including but not limited to negligence (failure to
                use such care as a reasonably prudent and careful person would use under similar circumstances), breach of any duty
                imposed by law, breach of contract or mistake or error of judgment of the Organization; and
              </div>
          </Row>
          <Row style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", flexGrow: "2"}}>
              <div style={{ marginLeft: '4rem'}}>c.</div>
              <div>
                <div style={{ marginLeft: '1rem'}}>
                to be liable for and to hold harmless and indemnify the Organization from all actions, proceedings, claims, damages, costs demands including court costs and costs on a solicitor and own client basis, and liabilities of whatsoever nature or kind arising out of or in any way connected with my participation in Athletic Activities.
              </div>
              </div>
          </Row>
          </div>
        </Row>
        <Row style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", flexGrow: "2"}}>
          <div>7.</div>
          <div style={{ marginLeft: '1rem'}}>
          I agree that this waiver and all terms contained within are governed exclusively by the laws of the Province or Territory of Canada in which the Athletics Activities are provided to me by the Organization. I hereby irrevocably submit to the exclusive jurisdiction of the courts of that Province or Territory. Any litigation to enforce this waiver must be instituted in the Province or Territory in which the Athletic Activities are provided by the Organization.
          </div>
        </Row>
        <Row
          style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", flexGrow: "2", marginBottom:"2rem"}}>
          <div>8.</div>
          <div style={{ marginLeft: '1rem'}}>
          I confirm that I have had sufficient time to read and understand each term in this waiver in its entirety, and have agreed to the terms freely and voluntarily. I understand that this waiver is binding on myself and my Legal Representatives.
          </div>
        </Row>
        <br/>
        </Form.Group>
      <div className="mb-4 align-middle flex flex-row items-center justify-center space-x-10" >
        <div>
        <input
            name="participantInitials"
            type="text"
            style={{ width: '4rem'}}
            required={true}
            value={participantInitials}
            onChange={handleInitialsChange}
            // onChange={(e) => setTitle(e.target.value)}
            // placeholder="Your Initials"
          />
        <label name="initials" style={{ marginLeft: '1rem'}}>
          Please initial the box after reading and understanding the above statements and conditions
        </label>
        </div>
      </div>

    <Form.Group controlId="formBasicSummary" style={{ display: "flex", flexDirection: "column", alignContent: "flexStart", margin: "0px", flexWrap: "wrap", marginTop: "1rem" }}>
      <Row style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", flexGrow: "2"}}>
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
            value={participantName} 
            placeholder=""
            >
            </input>
            <label className={participantName && 'filled'} htmlFor={name} style={{fontSize: 20}}>
              Participant Name
            </label>
          </div>
        <Form.Group name="groupParticipantAddress" controlId="formParticipantAddress" style={{ flex: 1, margin: "0px" }}>
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
              height: "3rem"
              }}
              onChange={handleAddressChange}
              value={participantAddress} 
              placeholder=""
            />
            <label className={participantAddress && 'filled'} htmlFor={name}>
              Participant Address
            </label>
          </div>
        </Form.Group>
      <Form.Group name="groupParticipantSignature" controlId="formParticipantSignature" style={{ flex: 1, margin: "0px" }}>
        <div className="input-container" style={{ flex: 1, margin: "0px" }}>
          <input
            name="participantSignature" 
            type="text"
            id="title"
            required={true}
            style={{ 
              boxShadow: "none",
              // border: "none",
              boxSizing: "inherit",
              height: "3rem"
              }}
              value="Please sign this using the button below" 
              onChange={handleParticipantSignatureChange}
            />
            <label className={'filled'} htmlFor={participantSignature}>
              Participant Signature
            </label>
          </div>
      </Form.Group>
      </Row>
    <Row style={{ display: "flex", flexDirection: "row", marginBottom: "2rem" }}>
      <Form.Group name="groupOrganizationWitnessName" controlId="formOrganizationWitnessName" style={{ flex: 1}}>
        <div className="input-container" style={{ flex: 1, margin: "0px" }}>
          <input
            name="organizationWitnessName" 
            type="text"
            id="title"
            required={true}
            style={{ 
              boxShadow: "none",
              // border: "none",
              boxSizing: "inherit",
              height: "3rem"
              }}
              onChange={handleOrganizationWitnessNameChange}
              value="The witness will print their name for you"
              placeholder=""
          />
          <label className={'filled'} htmlFor={name}>
            Organization Witness Name
          </label>
        </div>
      </Form.Group>
      <Form.Group name="groupOrganizationWitnessSignature" controlId="formOrganizationWitnessSignature" style={{ flex: 1, margin: "0px" }}>
        <div className="input-container" style={{ flex: 1, margin: "0px" }}>
          <input
            name="organizationWitnessSignature" 
            type="text"
            id="title"
            required={true}
            style={{ 
              boxShadow: "none",
              // border: "none",
              boxSizing: "inherit",
              height: "3rem"
              }}
              onChange={handleOrganizationWitnessSignatureChange}
              value="The witness will sign this for you"
              placeholder=""
          />
          <label className={'filled'} htmlFor={name}>
            Organization Witness Signature
          </label>
        </div>
      </Form.Group>
    </Row>
    <Row style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", flexGrow: "2", marginBottom: "3rem" }}>
      <Form.Group name="groupsignedToday" controlId="formSignedToday" ref={skipInputRef} style={{ flex: 1, margin: "0px" }}>
          <Form.Control name="signedToday" placeholder={"Signed this " + String(day_with_ord) + " day of " + String(month) + ", " + String(year)} readOnly style= {{ fontWeight: "bold" }}>
          </Form.Control>
      </Form.Group>
    </Row>
    <Row style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", flexGrow: "2", marginBottom: "3rem" }}>
      <Form.Group name="groupParticipantDateOfBirth" controlId="formGroupParticipantDateOfBirth"  style={{ flex: 1, margin: "0px" }}>
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
              height: "3rem"
              }}
              onChange={handleParticipantDateOfBirth}
              value={participantDateOfBirth} 
              placeholder=""
          />
          <label className={'filled'} htmlFor={name}>
            Participant Date Of Birth
          </label>
        </div>
      </Form.Group>
      <Form.Group name="groupParticipantEmailAddress" controlId="formGroupParticipantEmailAddress" style={{ flex: 1, margin: "0px" }}>
        <div className="input-container" style={{ flex: 1, margin: "0px" }}>
          <input
            name="participantEmailAddress" 
            type="text"
            id="title"
            required={true}
            style={{ 
              boxShadow: "none",
              // border: "none",
              boxSizing: "inherit",
              height: "3rem"
              }}
              onChange={handleEmailAddressChange}
              value={participantEmailAddress} 
              placeholder=""
          />
          <label className={participantEmailAddress && 'filled'} htmlFor={name}>
            Participant Email Address
          </label>
        </div>
      </Form.Group>
      <Form.Group name="groupParticipantPhone" controlId="formParticipantPhone" style={{ flex: 1, margin: "0px" }}>
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
              height: "3rem"
              }}
              onChange={handlePhoneChange}
              value={participantPhone} 
              placeholder=""
          />
          <label className={participantPhone && 'filled'} htmlFor={name}>
            Participant Phone
          </label>
        </div>
      </Form.Group>
    </Row>
    <Row style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", flexGrow: "2"}}>
      <Form.Group name="groupEmergencyContactName" controlId="formEmergencyContactName" style={{ flex: 1, margin: "0px" }}>
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
              height: "3rem"
              }}
              onChange={handleEmergencyContactChange}
              value={emergencyContact} 
              placeholder=""
          />
          <label className={emergencyContact && 'filled'} htmlFor={name}>
            Emergency Contact Name
          </label>
        </div>
      </Form.Group>
      <Form.Group name="groupEmergencyContactPhone" controlId="formEmergencyContactPhone" style={{ flex: 1, margin: "0px" }}>
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
              height: "3rem"
              }}
              onChange={handleEmergencyContactPhone}
              value={emergencyContactPhone} 
              placeholder=""
          />
          <label className={emergencyContactPhone && 'filled'} htmlFor={name}>
            Emergency Contact Phone
          </label>
        </div>
      </Form.Group>
      <Form.Group name="groupRelationship" controlId="formRelationship" style={{ flex: 1, margin: "0px" }}>
        <div className="input-container" style={{ flex: 1, margin: "0px" }}>
          <input
            name="relationship" 
            type="text"
            id="title"
            required={true}
            style={{ 
              boxShadow: "none",
              // border: "none",
              boxSizing: "inherit",
              height: "3rem"
              }}
              onChange={handleRelationship}
              value={relationship} 
              placeholder=""
          />
          <label className={relationship && 'filled'} htmlFor={name}>
            Relationship
          </label>
        </div>
        <br/>
      </Form.Group>
    </Row>
    {/* Possibly put in a conditional render here... if I can rememeber the rationale for doing so. */}
    <span style={{ display: "flex", justifyContent:"center" }}>Please press the signature button below then print your participant signature in the pad which will appear below:</span>

    {/* TODO 6: (But not with TA): For any of the above, can we improve/clarify the form fields over the printed version? */}
    
      <div className="app">
        {
        imageUserURL && (
          <>
          <img src={imageUserURL} alt="signature" className="signature" id="student" />
          </>
        )
        }
        <br />
        <br />
      ​
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
                />
                <hr/>
                <button onClick={() => sigCanvasUser.current.clear()}>Clear</button>
              </div>

              <div className="modal__bottom">
                <br/>
                <Button style={{ backgroundColor: "red", color: "white" }}
                className="custom-pill-button-cancel" onClick={() => setOpenUserModal(false)}>Cancel</Button>
                <Button className="custom-pill-button" onClick={createUserSig}>
                Create
                </Button>
              </div>
              <br/>
            </div>
          </div>
          )
        }
        {/* Test of printRef functionality */}
      {/* <div>I will not be in the PDF.</div>
      <div ref={printRef}>I will be in the PDF.</div> */}

        <div>
          {
          imageOrgURL && (
            <>
            <img src={imageOrgURL} alt="signature" className="signature" id="admin" />
            </>
            )
          }
          <br />
          {/* Uncomment the following block to download the signature as a .png, but we shouldn't need to do that, instead we might want the signatures to instantiate in the appropriate fields*/}

          {/* <button 
          onClick={download}
          style={{padding: '5px', marginTop: '5px'}}
          >Download</button>
          <br /> */}

          {openOrgModal && (
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
                  ref={sigCanvasOrg}
                  />
                  <hr/>
                  <button onClick={() => sigCanvasOrg.current.clear()}>Clear</button>
                </div>
                <div className="modal__bottom">
                <button style={{ backgroundColor: "red", color: "white" }} className="pill" onClick={() => setOpenUserModal(false)}>Cancel</button>
                <button style={{ backgroundColor: "green", color: "white" }}className="pill" onClick={createOrgSig}>
                Create
                </button>
                </div>
              </div>
            </div>
            )
        }</div>
      </div>
      {isAuthenticated && isAuthenticated.is_admin ? (
        // This conditional render is not working for some reason so if you're logged out you can still see it. Fix this.
        <>
        <div style={{ marginTop: "10rem"}}>
          Please press the signature button then print the organization witness signature in the pad which will appear above:
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
      {isAuthenticated && isAuthenticated.is_admin ? (
        <>
        <br />
        <div  style={{ marginRight: "20rem"}}>
          <Button 
            className="custom-pill-button"
            variant="primary"
            type="button"
            // style={{ display: "flex", justifyContent: "center", backgroundColor: "green", color: "white" }}
            onClick={() => setOpenUserModal(true)}>
              {participantSignature ? "Replace Participant Signature" : "Create Participant Signature"}
          </Button>
        </div>
        <br />
        </>
      ) : (
        <div>
          <Button 
            className="custom-pill-button"
            variant="primary"
            type="button"
            style={{ display: "flex", justifyContent: "center !important", marginBottom: "0rem", backgroundColor: "green", color: "white" }}
            onClick={() => setOpenUserModal(true)}>
            {participantSignature ? "Replace Participant Signature" : "Create Participant Signature"}
          </Button>
        </div>
      )}

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
            onClick={() => setOpenOrgModal(true)}>
            Create Organization Witness Signature
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
      // type="submit"
      onClick={handleDownloadStudentSigImg}
      style={{ 
        display: "flex",
        justifyContent: "center !important",
        marginTop: "2rem",
        background: 'linear-gradient(to right, rgb(3, 138, 255), rgb(118, 75, 162))', 
        color: "white"
        }}>
        Save Your Signature and Submit Waiver
      </button>

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
      <br/>
      <br/>
                

      {/* TODO 8: Can a TA advise if we should use a captcha to lock bots out? And require the signature to be created before handleSubmit is approved? */}
      {/* Last TODO 9 (doesn't have to be immediate): make the signature buttons a modular reusable component */}
    </Form>
  );
}

export default NewWaiverForm;