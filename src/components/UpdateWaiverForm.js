import React, { useState, useRef, useEffect } from "react";
// import FormErrors from "./FormErrors";
import { Form, Button, Row, Alert } from "react-bootstrap";
import PropTypes from "prop-types";
import isLoading from "./TechniqueUpdatePage";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import SignatureCanvas from "react-signature-canvas";
import moment from "moment";
// import { } from ;
import "../App.scss";
// console.log("Sophisticated image grabbing magic", props.waiver.participant_signature);



function UpdateWaiverForm(props) {
    console.log("These are the waiver props", props);

    const [participantName, setParticipantName] = useState(props.waiver ? props.waiver.participant_name : "");
    const [participantAddress, setParticipantAddress] = useState(props.waiver ? props.waiver.participant_address : "");
    const [participantSignature, setParticipantSignature] = useState("");
    const [organizationWitnessName, setOrganizationWitnessName] = useState(props.waiver ? props.waiver.organization_witness_name : "");
    const [organizationWitnessSignature, setOrganizationWitnessSignature] = useState("");
    const [signedToday, setSignedToday] = useState("");
    const [participantDateOfBirth, setParticipantDateOfBirth] = useState(props.waiver ? props.waiver.participant_date_of_birth : "");
    const [participantEmailAddress, setParticipantEmailAddress] = useState(props.waiver ? props.waiver.participant_email_address : "");
    const [participantPhone, setParticipantPhone] = useState(props.waiver ? props.waiver.participant_phone : "");
    const [emergencyContact, setEmergencyContact] = useState(props.waiver ? props.waiver.emergency_contact_name : "");
    const [emergencyContactPhone, setEmergencyContactPhone] = useState(props.waiver ? props.waiver.emergency_contact_number : "");
    const [relationship, setRelationship] = useState(props.waiver ? props.waiver.relationship : "");
    // const [name, setName] = useState('');

    console.log("Sophisticated image grabbing magic", props.waiver.participant_signature);
    console.log("This is their name", props.waiver.participant_name);

    let imgStringParticipant = "/public/images/" + props.waiver.participant_name + "'s signature.png";
    let imgStringAdmin = "/public/images/" + props.isAuthenticated.first_name + " " + props.isAuthenticated.last_name + "'s signature for " + props.waiver.participant_name + ".png";
    console.log("This is imgStringParticipant", imgStringParticipant);
    console.log("This is imgStringAdmin", imgStringAdmin);
    console.log("This is the signature", participantSignature);

    // function importAll(r) {
    //   let images = {};
    //    r.keys().forEach((item, index) => { images[item.replace('./', '')] = r(item); });
    //   return images
    //  }
    //  const images = importAll(require.context('../img', false, /\.(png|jpe?g|svg)$/));


    const images = require.context('../img/', true);
    // const images = importAll(require.context('../img', true));
    // , '/\.png/'
    // const images = import.meta.glob("../img/*")
    console.log("This is images", images);
    const imageList = images.keys().map(image => images(image));
    console.log("This is images", imageList);
    

    console.log("Check the waiver in the form", props.waiver);


    // import wide_logo from '../img/wide_logo.png';


    const handleNameChange = (event) => {
        console.log("This is the name", event.target.value);
        setParticipantName(event.target.value);
      }
  
    const handleAddressChange = (event) => {
        console.log("This is the address", event.target.value);
        setParticipantAddress(event.target.value);
      }
  
    const handleParticipantSignatureChange = (event) => {
        console.log("This is the signature", event.target.value);
        setParticipantSignature(event.target.value);
      }
  
    const handleOrganizationWitnessNameChange = (event) => {
      console.log("This is the witness name", event.target.value);
      setOrganizationWitnessName(event.target.value);
      }
  
    const handleOrganizationWitnessSignatureChange = (event) => {
        console.log("This is the witness Signature", event.target.value);
        setOrganizationWitnessSignature(event.target.value);
      }
  
    const handleSignedToday = (event) => {
        console.log("This is the signing date", event.target.value);
        setSignedToday(event.target.value);
      }
  
    const handleParticipantDateOfBirth = (event) => {
        console.log("This is the signing date", event.target.value);
        setParticipantDateOfBirth(event.target.value);
      }

    const formattedDateOfBirth = moment(props.waiver.participant_date_of_birth).format("YYYY-MM-DD");
    console.log("Is it formatted?", formattedDateOfBirth);
  
    const handleEmailAddressChange = (event) => {
        console.log("This is the email address", event.target.value);
        setParticipantEmailAddress(event.target.value);
    }
  
    const handlePhoneChange = (event) => {
      console.log("This is the phone number", event.target.value);
      setParticipantPhone(event.target.value);
    }
  
    const handleEmergencyContactChange = (event) => {
      console.log("This is the emergency contact name", event.target.value);
      setEmergencyContact(event.target.value);
    }
  
    const handleEmergencyContactPhone = (event) => {
      console.log("This is the emergency contact phone number", event.target.value);
      setEmergencyContactPhone(event.target.value);
    }

    // console.log("Is that working?", handleEmergencyContactPhone)
  
    const handleRelationship = (event) => {
      console.log("This is the relationship", event.target.value);
      setRelationship(event.target.value);
    }

    function handleSubmit(event) {
        event.preventDefault();
        const { currentTarget } = event;
        const formData = new FormData(currentTarget);
    
        const data = {
          initials: formData.get("initials"),
          participant_name: formData.get("participantName"),
          participant_address: formData.get("participantAddress"),
          participant_signature: imgStringParticipant,
          organization_witness_name: formData.get("organizationWitnessName"),
          organization_witness_signature: imgStringAdmin,
          // signedToday: formData.get("signedToday"),
          participant_date_of_birth: formData.get("participantDateOfBirth"),
          participant_email_address: formData.get("participantEmailAddress"),
          participant_phone: formData.get("participantPhone"),
          emergency_contact_name: formData.get("emergencyContactName"),
          emergency_contact_number: formData.get("emergencyContactPhone"),
          relationship: formData.get("relationship")
      }
  
      console.log("DATA is", data);
      props.onSubmit(data);
  
      const participantName = event.target.participantName.value;
      console.log("This should print the participant name", participantName);
      // alert("Thanks, you've updated and signed off on " + participantName + "'s waiver! They're now ready to train when they come to class.");

      // currentTarget.reset();  
    }
    const { errors } = props;

    const { isAuthenticated } = props || false; // try = false inside the curly brackets

    // if (isAuthenticated === null) {
    //   return <div>Loading...</div>;
    // }


    console.log("These are the props on the UpdateWaiverForm", props)
    console.log("Are we hitting the currentUser? ", isAuthenticated);

    const [openUserModal, setOpenUserModal] = useState(false);
    const [openOrgModal, setOpenOrgModal] = useState(false);
    const sigCanvasUser = useRef();
    const sigCanvasOrg = useRef();
  
      const skipInputRef = React.createRef();
    
      useEffect(() => {
        skipInputRef.current.tabIndex = -1;
      }, []);

      const [imageUserURL, setImageUserURL] = useState(null);
      const [imageOrgURL, setImageOrgURL] = useState(null);
      // const colors = ["black", "green", "red"];
      const createUserSig = () => {
        const userURL = sigCanvasUser.current.getTrimmedCanvas().toDataURL("image/png");
        setImageUserURL(userURL);
        setOpenUserModal(false);
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
      // const ref = useRef();
      const printRef = useRef();

      // Augment this if block and use it or don't depending on the nature of the success
      if( props.waiver.organization_witness_signature === "/images/The witness will print their name for you's signature.png" ){

      } else {
        console.log("This is the admin's name associated with their signature", props.isAuthenticated.first_name);

      }
      // console.log("This is the admin signature", props.waiver.organization_witness_signature);

      console.log("Testing a logical check", (props.waiver.organization_witness_signature !== null));
      console.log("Testing more", isAuthenticated && isAuthenticated.is_admin && (props.waiver.organization_witness_signature !== null));
      console.log("Testing all logic", isAuthenticated && isAuthenticated.is_admin && (props.waiver.organization_witness_signature !== null)  && (props.waiver.organization_witness_signature === ""));
      console.log("Why isn't the emergency number working?", props.waiver.emergency_contact_number.length);

      const handleDownloadPdf = async () => {
        // The following is extra code before the main section which already works, to experiment and build a multi-page PDF
        // const pages = [];
        // for (const i = 0; i < pages.length; i++) {
        //   await new Promise(function(resolve) {
        //     html2canvas(pages[i], {scale: 1}).then(function(canvas) {
    
        //       const img=canvas.toDataURL("image/png");
        //       const pdf = new jsPDF();
        //       pdf.addImage(img,'JPEG', 10, 10);
        //       if ((i+1) == pages.length) {
        //         pdf.save('menu.pdf');
        //       } else {
        //         pdf.addPage();
        //       }
        //       resolve();
        //     });
        //   });
        // }
    
    
        // TODO 1 (maybe not in TA): Need to take the current zoom level with window.devicepixelratio and then use this to force the image to resize to fit one page of a PDF using a transform equation. Every browser is different so this can be hard to optimise but let's see how it goes in development.
        const element = printRef.current;
        const canvas = await html2canvas(element);
        const data = canvas.toDataURL('image/png');
        const imgFormat = 'PNG'; // Using this to experiment with what produces the best image quality for the PDF; but it doesn't seem to make much difference?
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
        // TODO Also, add a final filename when the admin signs it if possible
      };

      const handleDownloadAdminSigImg = async () => {
        const adminSig = document.getElementById("admin");
        if (!adminSig) {
          console.error("Admin signature element not found!");
          return; // Exit early if the element doesn't exist
      }
        // const studentName = document.getElementById("studentName");
        const adminName = props.isAuthenticated.first_name + " " + props.isAuthenticated.last_name;
        console.log("This is the admin signature", adminSig);
        console.log("This is their name", adminName);
        const originalImage=adminSig.src;
        const image = await fetch(originalImage);
       
        // split the name
        const nameSplit = originalImage.split("/");
        const duplicateName = nameSplit.pop();
        const imageBlog = await image.blob()
        const imageURL = URL.createObjectURL(imageBlog)
        const link = document.createElement('a')
        link.href = imageURL;
        link.download = adminName + "'s " + "signature for " + participantName; // creates warning: unexpected string concatenation of string literals, check this
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)  
    
        // Right now this *downloads* the image to the local PC but we need it to **upload** the image to our server, that can only come after tweaks with the server/production code
      };
    
      const current = new Date();
      const date = `${current.getDate()}/${current.getMonth()+1}/${current.getFullYear()}`;
      const day = `${current.getDate()}`;
      const day_with_ord = moment.localeData().ordinal(day); // This provides the correct suffix or "ordinal" to the date 
      const month = current.toLocaleString('en-EN', { month: "long" });
      const year = `${current.getFullYear()}`;

      useEffect(()=>{
        if(props.waiver) setParticipantName(props.waiver.participant_name)
        },[props])

     useEffect(()=>{
          if(props.waiver) setParticipantAddress(props.waiver.participant_address)
          },[props])

      useEffect(()=>{
        if(props.waiver) setParticipantSignature(props.waiver.participant_signature)
        },[props])

      useEffect(()=>{
        if(props.waiver) setOrganizationWitnessName(props.waiver.organization_witness_name)
        },[props])

      useEffect(()=>{
        if(props.waiver) setOrganizationWitnessSignature(props.waiver.organization_witness_name)
        },[props])

      useEffect(()=>{
        if(props.waiver) setParticipantDateOfBirth(props.waiver.participant_date_of_birth)
        },[props])

      useEffect(()=>{
          if(props.waiver) setParticipantEmailAddress(props.waiver.participant_email_address)
          },[props])
          
      useEffect(()=>{
        if(props.waiver) setParticipantPhone(props.waiver.participant_phone)
        },[props])

      useEffect(()=>{
        if(props.waiver) setEmergencyContact(props.waiver.emergency_contact_name)
        },[props])

      useEffect(()=>{
          if(props.waiver) setEmergencyContactPhone(props.waiver.emergency_contact_phone)
          },[props])
          
      useEffect(()=>{
        if(props.waiver) setRelationship(props.waiver.relationship)
        },[props])
  


      return (
        <Form onSubmit={handleSubmit} style={{fontSize: 20}}>
            {errors.length > 0 ? (
                <div className="ui negative message FormErrors">
                <Alert variant="danger">
                    <div className="header">Access Denied</div>
                    <p>{errors.map((err) => err.message).join(",")}</p>
                </Alert>
                </div>
            ) : null}
          <Form.Group controlId="formFullWaiverNotButtons" ref={printRef}>
          <Form.Label id="top-label">Edit existing waiver</Form.Label>
            <br />
            <br />
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
            <Row style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", flexGrow: "2"}}>
              <div>8.</div>
              <div style={{ marginLeft: '1rem'}}>
              I confirm that I have had sufficient time to read and understand each term in this waiver in its entirety, and have agreed to the terms freely and voluntarily. I understand that this waiver is binding on myself and my Legal Representatives.
              </div>
            </Row>
            <br/>
           </Form.Group>
            
          <div className="mb-4 align-middle flex flex-row items-center justify-center space-x-10">
            <div>
            <input
                name="initials"
                type="text"
                style={{ width: '4rem'}}
                defaultValue={props.waiver.initials}
                placeholder={props.waiver.initials}
                // value={title}
                // onChange={(e) => setTitle(e.target.value)}
                // placeholder=""
              />
            <label name="initials" style={{ marginLeft: '1rem'}}>
              Please initial the box after reading and understanding the above statements and conditions
            </label>
            </div>
          </div>
  
        <Form.Group controlId="formBasicSummary" style={{ display: "flex", flexDirection: "column", alignContent: "flexStart", margin: "0px", flexWrap: "wrap", marginTop: "1rem" }}>
          <Row style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", flexGrow: "2"}}>
            {/* <Form.Group controlId="formParticipantName" style={{ flex: 1, margin: "0px" }}> */}
              {/* TODO 3(but not with TA): Refactor to use an object to set the common style for these Form.Group items; has this already been done? */}
              {/* <FloatingLabel 
                controlId="floatingInput"
                label="Participant Name"
                // onChange={handleChange}                    
              > */}
              <div className="input-container" style={{ flex: 1, marginBottom: "3rem" }}>
  
              <input
                name="participantName" 
                type="text"
                id="title"
                style={{ 
                  boxShadow: "none",
                  // border: "none",
                  boxSizing: "inherit",
                  height: "3rem",
                  color: "black",
                  // marginTop: "2rem"
                }}
                // onChange={handleNameChange}
                // value={participantName} 
                // placeholder=""
                onChange={handleNameChange}
                defaultValue={props.waiver.participant_name} 
                placeholder=""
                />
                <label className={participantName.length > 0 && 'filled'} htmlFor={participantName}>
                  Participant Name
                </label>
  
                {/* <label for="participantName">Participant Name</label> */}
  
  
              </div>
  
              {/* </FloatingLabel> */}
            {/* </Form.Group> */}
            <Form.Group name="groupParticipantAddress" controlId="formParticipantAddress" style={{ flex: 1, margin: "0px" }}>
             <div className="input-container" style={{ flex: 1, margin: "0px" }}>
              <input
                name="participantAddress" 
                type="text"
                id="title"
                style={{ 
                  boxShadow: "none",
                  // border: "none",
                  boxSizing: "inherit",
                  height: "3rem"
                 }}
                //   onChange={handleAddressChange}
                //   value={participantAddress} 
                //   placeholder=""
                onChange={handleAddressChange}
                defaultValue={props.waiver.participant_address} 
                placeholder=""
                />
                
                <label className={participantAddress.length > 0 && 'filled'} htmlFor={participantAddress}>
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
                style={{ 
                  boxShadow: "none",
                  // border: "none",
                  boxSizing: "inherit",
                  height: "3rem"
                  }}
                //   onChange={handleParticipantSignatureChange}
                //   value={participantSignature} 
                //   placeholder=""
                onChange={handleParticipantSignatureChange}
                value="Please sign this using the button below"
                placeholder=""
                />
                <label className={participantSignature.length > 0 && 'filled'} htmlFor={participantSignature}>
                  Participant Signature
                </label>
              </div>
          </Form.Group>
          </Row>
        {/* <Row style={{ display: "flex", flexDirection: "row"}}>
            <div className="container">
                <input className="input" type="text" id="input" value/>
                <img src="data:image/png;base64,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" className="image"/>
              </div>
        </Row> */}
        {/* This shows a signature sourced from the web, now can we put it in the field for the form? Or is it better to have the signatures have their own, big section at the bottom? */}
        <Row style={{ display: "flex", flexDirection: "row", marginBottom: "2rem" }}>
          <Form.Group name="groupOrganizationWitnessName" controlId="formOrganizationWitnessName" style={{ flex: 1}}>
            <div className="input-container" style={{ flex: 1, margin: "0px" }}>
              <input
                name="organizationWitnessName" 
                type="text"
                id="title"
                style={{ 
                  boxShadow: "none",
                  // border: "none",
                  boxSizing: "inherit",
                  height: "3rem"
                  }}
                //   onChange={handleOrganizationWitnessNameChange}
                value={isAuthenticated.first_name + " " + isAuthenticated.last_name} 
                //   placeholder=""
                onChange={handleOrganizationWitnessNameChange}
                // defaultValue={props.waiver.organization_witness_name} 
                placeholder=""
              />
              <label className={organizationWitnessName.length > 0 && 'filled'} htmlFor={organizationWitnessName}>
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
                style={{ 
                  boxShadow: "none",
                  // border: "none",
                  boxSizing: "inherit",
                  height: "3rem"
                  }}
                //   onChange={handleOrganizationWitnessSignatureChange}
                //   value={organizationWitnessSignature} 
                //   placeholder=""
                onChange={handleOrganizationWitnessSignatureChange}
                defaultValue="The witness will sign this for you"
                placeholder=""
              />
              <label className={'filled'} htmlFor={organizationWitnessSignature}>
                Organization Witness Signature
              </label>
            </div>
          </Form.Group>
        </Row>
        <Row style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", flexGrow: "2", marginBottom: "3rem" }}>
          <Form.Group name="groupsignedToday" controlId="formSignedToday" ref={skipInputRef} style={{ flex: 1, margin: "0px" }}>
              <Form.Control name="signedToday" placeholder={"Signed this " + String(day_with_ord) + " day of " + String(month) + ", " + String(year)} readOnly style= {{ fontWeight: "bold" }}>
                {/* <input type="hidden" label = "testing">Test</input> */}
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
                style={{ 
                  boxShadow: "none",
                  // border: "none",
                  boxSizing: "inherit",
                  height: "3rem"
                  }}
                  // onChange={handleParticipantDateOfBirth}
                  // defaultValue={props.waiver.participant_date_of_birth} 
                //   placeholder=""
                  onChange={handleParticipantDateOfBirth}
                  value={formattedDateOfBirth.toString()} 
                  // value="22-02-2018"
                  placeholder=""
              />
              <label className={participantDateOfBirth && participantDateOfBirth.length > 0 && 'filled'} htmlFor={participantDateOfBirth}>
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
                style={{ 
                  boxShadow: "none",
                  // border: "none",
                  boxSizing: "inherit",
                  height: "3rem"
                  }}
                //   onChange={handleEmailAddressChange}
                //   value={participantEmailAddress} 
                //   placeholder=""
                onChange={handleEmailAddressChange}
                defaultValue={props.waiver.participant_email_address} 
                placeholder=""
              />
              <label className={participantEmailAddress.length > 0 && 'filled'} htmlFor={participantEmailAddress}>
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
                style={{ 
                  boxShadow: "none",
                  // border: "none",
                  boxSizing: "inherit",
                  height: "3rem"
                  }}
                //   onChange={handlePhoneChange}
                //   value={participantPhone} 
                //   placeholder=""
                onChange={handlePhoneChange}
                defaultValue={props.waiver.participant_phone} 
                placeholder=""
              />
              <label className={participantPhone.length > 0 && 'filled'} htmlFor={participantPhone}>
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
                style={{ 
                  boxShadow: "none",
                  // border: "none",
                  boxSizing: "inherit",
                  height: "3rem"
                  }}
                //   onChange={handleEmergencyContactChange}
                //   value={emergencyContact} 
                //   placeholder=""
                onChange={handleEmergencyContactChange}
                defaultValue={props.waiver.emergency_contact_name} 
                placeholder=""
              />
              <label className={emergencyContact.length > 0 && 'filled'} htmlFor={emergencyContact}>
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
                style={{ 
                  boxShadow: "none",
                  // border: "none",
                  boxSizing: "inherit",
                  height: "3rem"
                  }}
                //   onChange={handleEmergencyContactPhone}
                //   value={emergencyContactPhone} 
                //   placeholder=""
                onChange={handleEmergencyContactPhone}
                defaultValue={props.waiver.emergency_contact_number} 
                placeholder=""
              />
              <label className={props.waiver.emergency_contact_number.length > 0 && 'filled'} htmlFor={props.waiver.emergency_contact_number}>
                Emergency Contact Phone
              </label>
            </div>
          </Form.Group>
          <Form.Group name="groupRelationship" controlId="formRelationship" style={{ flex: 1, margin: "0px" }}>
            {/* <FloatingLabel 
                controlId="floatingInput"
                label="Relationship"
            >
            <Form.Control name="relationship" type="relationship"/>
            </FloatingLabel> */}
            <div className="input-container" style={{ flex: 1, margin: "0px" }}>
              <input
                name="relationship" 
                type="text"
                id="title"
                style={{ 
                  boxShadow: "none",
                  // border: "none",
                  boxSizing: "inherit",
                  height: "3rem"
                  }}
                //   onChange={handleRelationship}
                //   value={relationship} 
                //   placeholder=""
                onChange={handleRelationship}
                defaultValue={props.waiver.relationship} 
                placeholder=""
              />
              <label className={relationship.length > 0 && 'filled'} htmlFor={relationship}>
                Relationship
              </label>
            </div>
            <br/>
          </Form.Group>
        </Row>
        {/* Possibly put in a conditional render here... if I can remember the rationale for doing so. */}
        {/* TODO: Admin only adds their own signature, doesn't touch student signature, and ensure the latter is pulled for display */}
        <span style={{ display: "flex", justifyContent:"center" }}>Please press the signature button below then print your participant signature in the pad which will appear below:</span>
        <br/>
        <br/>

        <div style={{ display: "flex", justifyContent:"center", paddingTop:"3rem" }}><img src={props.waiver.participant_signature} alt="student-sig" /></div>
        {/* TODO 4: (But not with TA): For any of the above, can we improve/clarify the form fields over the printed version? */}
        
          <div className="app">
          {/* <div>I will not be in the PDF.</div>
          <div ref={printRef}>I will be in the PDF.</div> */}
  
            {
            imageUserURL && (
              <>
              <img src={imageUserURL} alt="signature" className="signature" />
              </>
            )
            }
            <br />
  
            {/* Uncomment the following block to download the signature as a .png, but we shouldn't need to do that, instead we want the signatures to instantiate in the appropriate fields*/}
            {/* <button 
            onClick={download}
            style={{padding: '5px', marginTop: '5px'}}
            >Download</button> */}
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
                    <button style={{ backgroundColor: "red", color: "white" }}
  className="pill" onClick={() => setOpenUserModal(false)}>Cancel</button>
                    <button style={{ backgroundColor: "green", color: "white" }}className="pill" onClick={createUserSig}>
                    Create
                    </button>
                  </div>
                  <br/>
  
                </div>
              </div>
             )
            }
  
          {/* <div>I will not be in the PDF.</div>
          <div ref={printRef}>I will be in the PDF.</div> */}
  
            <div>
              {
              imageOrgURL && (
                <>
                <img src={imageOrgURL} alt="signature" className="signature" id="admin"/>
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
                    <button style={{ backgroundColor: "red", color: "white" }} className="pill" onClick={() => setOpenOrgModal(false)}>Cancel</button>
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
            <>
            <br />
            <br />
            <span style={{ display: "flex", justifyContent:"center"}}>
              Please press the signature button then print the organization witness signature in the pad which will appear above:
            </span>
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
            <div/>
            <br />
            </>
          ) : (
            <div>
              <button 
                className="pill"
                variant="primary"
                type="button"
                style={{ display: "flex", justifyContent: "center !important", marginBottom: "0rem", backgroundColor: "green", color: "white" }}
                onClick={() => setOpenUserModal(true)}>
                  Create Participant Signature
              </button>
            </div>
          )}
  
          <br />
          <br />
          <br />
          <br />

          {(props.waiver.organization_witness_name !== "The witness will print their name for you") ? (
            <>
        {/* Pull the admin signature image for rendering; TODO make the "admin-sig" empty image invisible in the absence of a signature, otherwise it's misleading  */}
        <div style={{ display: "flex", justifyContent:"center", paddingBottom:"3rem" }}><img src={props.waiver.organization_witness_signature} alt="admin-sig" /></div>

        <div>
        <br/>
            <br/>
            <br/>

              {/* <button 
                className="pill"
                variant="secondary"
                type="button"
                style={{ backgroundColor: "green", color: "white" }}
                onClick={() => setOpenOrgModal(true)}>
                Replace Organization Witness Signature
              </button> */}
            {/* TODO 5: This button isn't working in this case, why? Because the existing sig overrides creation of a new one? */}
            </div>


            </>
          ) : (
            <>

            <br />
            <div>
              <button 
                className="pill"
                variant="secondary"
                type="button"
                style={{ backgroundColor: "green", color: "white" }}
                onClick={() => setOpenOrgModal(true)}>
                Create Organization Witness Signature
              </button>
            {/* TODO 5: This button (in fact, all the buttons) has some screwy behaviour where it force-refreshes the page, leaves a "?signedToday=#/" suffix at the end of the URL and only after these two things can you create a signature. What gives? TA's to the rescue! */}
            {/* TODO: Make the button jump the admin up the page to the signature modal */}
            </div>
            <br />
            </>
          )}
  
          {isAuthenticated && isAuthenticated.is_admin ? (
            <>

            </>
          ) : (
            <div></div>
          )}
  
          {/* <button type="button" onClick={handleDownloadPdf} style={{ marginTop: "-10rem" }}>
          Download as PDF
          </button> */}
                  <button
        className="pill"
        variant="primary"
        // type="submit"
        onClick={handleDownloadAdminSigImg}
        style={{ 
          display: "flex",
          justifyContent: "center !important",
          marginTop: "2rem",
          background: 'linear-gradient(to right, rgb(3, 138, 255), rgb(118, 75, 162))', color: "white"
          }}>
          Save Your Signature and/or Update Form Fields
        </button>
        {/* For some reason this updates the waiver on Rails, not sure why...?  But let's roll with it until a TA can clarify.*/}
          <br />
          <br />
  
          {/* <button
          className="pill"
          variant="primary"
          type="submit"
          style={{ 
            display: "flex",
            justifyContent: "center !important",
            marginTop: "2rem",
            background: 'linear-gradient(to right, rgb(3, 138, 255), rgb(118, 75, 162))', color: "white"}}>
            Submit
          </button> */}
  
          {/* TODO 6: Add guarding behaviour so that the admin MUST submit their name along with the signature before submission, do the same for the New page for the student's side */}
  
          {/* TODO 7: We need the functionality of the previous two buttons to be merged. The waiver needs to submit into the backend and simultaneously generate the PDF which should be sent via automailer to myself. function twoCalls(event) in AdminForm.js may be of use.  */}
          <br/>
          <br/>
                    
  
          {/* TODO 8: Can a TA advise if we should use a captcha to lock bots out? */}
          {/* Last TODO 9 (doesn't have to be immediate): make the signature buttons a modular reusable component */}
  
  
        </Form>
      );

}


UpdateWaiverForm.propTypes = {
  isAuthenticated: PropTypes.bool,
  waiver: PropTypes.object,
};

export default UpdateWaiverForm;
