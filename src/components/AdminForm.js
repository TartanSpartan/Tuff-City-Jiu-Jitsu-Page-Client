import React, { useEffect, useState, useRef } from "react";
import { User } from "../requests";
import { Form } from "react-bootstrap";
import { Button } from "react-bootstrap";
import Alert from "react-bootstrap/Alert";
import Datetime from "react-datetime";
// import { useNavigate } from "react-router-dom";
// import { useHistory } from "react-router-dom";
// Bring in the following on the backend first
// Add Jitsu Canada registration number
// First session date, and dates for when they graded to each belt
// Dates of seminars
// Course dates e.g. AI, I, CI
// Create user index and user show pages, users can see this but only edit some of their info i.e. not their belts, JC registration number, etc

// import SignatureCanvas from "react-signature-canvas";
import moment from "moment";
import "../App.scss";

export default AdminForm;

function howRecentlyAchieved(achievementDate, expiryDate) {
  let results = [];
  let maxYears = 3;
  let recentAchievement = true;
  let achievementDay = new Date(achievementDate);
  let expiryDay = new Date(expiryDate);
  let difference =
    (expiryDay.getTime() - achievementDay.getTime()) /
    (24 * 60 * 60 * 365 * 1000); // Convert to years by dividing by 24 hours, 3600 seconds in an hour, 1000ms in a second
  if (difference < maxYears) {
    console.log("No need to refresh yet!");
    results = [recentAchievement, difference];
    return results;
  } else if (achievementDate === null) {
    console.log("They haven't achieved it yet!");
    recentAchievement = false;
    results = [recentAchievement, 0]; // In all likelihood this condition won't be met by the render due to other checks but if it does, this is "forced" code which can be debugged if necessary
  } else {
    console.log("Time to refresh!");
    recentAchievement = false;
    results = [recentAchievement, difference];
    return results;
  }
}

// console.log("Test of howRecentlyAchieved", howRecentlyAchieved("2020-11-22T00:00:00.000Z", "2023-12-22T00:00:00.000Z"));

function AdminForm(props) {
  // const [openModel, setOpenModal] = useState(false);
  // const sigCanvas = useRef();
  // const [penColor, setPenColor] = useState("black");
  // const [imageURL, setImageURL] = useState(null);
  // const colors = ["black", "green", "red"];
  // const create = () => {
  //   const URL = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
  //   setImageURL(URL);
  //   setOpenModal(false);
  // };
  // const download = () => {
  //   const dlink = document.createElement("a");
  //   dlink.setAttribute("href", imageURL);
  //   dlink.setAttribute("download", "signature.png");
  //   dlink.click();
  // };



  const forceUpdate = React.useState()[1].bind(null, {}); // see NOTE above

  console.log("These are the props for the admin form", props);

  const [isUserSelected, setUserSelection] = useState(false);
  const [isWaiverSelected, setWaiverSelection] = useState(false);
  const [selectedWaiver, setSelectedWaiver] = useState(null);
  const [userInformation, setUserInformation] = useState(null);
  const [waiverInformation, setWaiverInformation] = useState(null);
  const [grade, setGrade] = useState(null);
  const [gi, setGi] = useState(null);
  const [firstAid, setFirstAid] = useState(null);
  const [firstAidDate, setFirstAidDate] = useState(null);
  const [instructorQualification, setInstructorQualification] = useState(null);
  const [instructorQualificationDate, setInstructorQualificationDate] =
    useState(null);

    
  // let navigate = useNavigate(); 
  // const routeChange = () =>{ 
  //   let path = `newPath`; 
  //   navigate(path);
  // }

  // const history = useHistory();
  
  // const routeChange = () =>{ 
  //   let path = `waivers/2/edit`; // Change this to be dynamic based on the id passed from the waiver dropdown
  //   history.push(path);
  // }

  useEffect(() => {
    if (userInformation?.instructor_qualification?.achieved_at) {
      setInstructorQualificationDate(
        new Date(
          moment(userInformation.instructor_qualification.achieved_at).format(
            "MM/DD/YYYY hh:mm"
          )
        )
      );
    }

    if (userInformation?.first_aid_achievement_date) {
      setFirstAidDate(
        new Date(
          moment(userInformation.first_aid_achievement_date).format(
            "MM/DD/YYYY hh:mm"
          )
        )
      );
    }
  }, [userInformation]);

  // Use a function to add to the userInformation object
  console.log(
    "This is userInformation",
    userInformation && userInformation.instructor_qualification
  );

  // Use a function to add to the waiverInformation object
  console.log(
    "This is waiverInformation",
    waiverInformation
    //  && userInformation.instructor_qualification
  );

  // Use the following function (actually do it inside of handleSubmit) to validate the form and check that the admin has actually made changes to the user and if so then update the information on the back end
  function twoCallsUsers(event) {
    // console.log(event);

    // console.log("user informations", userInformation);

    // let userValue = Number(props.onDropdownSelected(event, users)) + 1;
    // console.log(userValue);
    // console.log(event.target[userValue].getAttribute('data-set'));
    let user = props.onDropdownSelectedUsers(event, props.users);
    console.log("This is the user in twoCalls function", user);
    // user.owns_gi = false;
    // user.has_first_aid_qualification = false;
    // user.instructor_qualification.qualification_id = false;
    // Use if/else to check for null data when setting these characteristics
    // if (user.owns_gi) === null {
      // setGi(null);
    // } else {
      // setGi(user.owns_gi)
    // }
    setUserInformation(user);
    setGrade(user.belt_grade.belt_id);
    setGi(user.owns_gi);
    setFirstAid(user.has_first_aid_qualification);
    setFirstAidDate(user.first_aid_achievement_date);
    setInstructorQualification(user.instructor_qualification.qualification_id);
    setInstructorQualificationDate(user.instructor_qualification.achieved_at);
    setUserSelection(true);
  }

    function twoCallsWaivers(event) {
    // console.log(event);

    // console.log("user informations", userInformation);

    // let userValue = Number(props.onDropdownSelected(event, users)) + 1;
    // console.log(userValue);
    // console.log(event.target[userValue].getAttribute('data-set'));
    let waiver = props.onDropdownSelectedWaivers(event, props.waivers);
    console.log("This is the waiver in twoCalls function", waiver);
    // user.owns_gi = false;
    // user.has_first_aid_qualification = false;
    // user.instructor_qualification.qualification_id = false;
    // Use if/else to check for null data when setting these characteristics
    // if (user.owns_gi) === null {
      // setGi(null);
    // } else {
      // setGi(user.owns_gi)
    // }
    setWaiverInformation(waiver);
    // setGrade(user.belt_grade.belt_id);
    // setGi(user.owns_gi);
    // setFirstAid(user.has_first_aid_qualification);
    // setFirstAidDate(user.first_aid_achievement_date);
    // setInstructorQualification(user.instructor_qualification.qualification_id);
    // setInstructorQualificationDate(user.instructor_qualification.achieved_at);
    setWaiverSelection(true);
  }

  function updateColorBox(event) {
    setGrade(event.target.value);
  }

  function updateGiBox(event) {
    setGi(event.target.value);
    console.log("GI when we set", gi);
    console.log("Event target value GI", event.target.value);
    // userInformation.owns_gi = event.target.value;
    // forceUpdate();
  }

  function updateFirstAidBox(event) {
    setFirstAid(event.target.value);
  }

  function updateFirstAidDate(event) {
    console.log("This is the event", new Date(event).toLocaleString());
    setFirstAidDate(new Date(event).toLocaleString());
  }

  function updateInstructorQualificationBox(event) {
    setInstructorQualification(event.target.value);
  }

  function updateInstructorQualificationDate(event) {
    setInstructorQualificationDate(new Date(event).toLocaleString());
  }

  const handleWaiverEdit = () => {
    props.history.push(`/waivers/${waiverInformation.id}/edit#/`)
  }

  function handleSubmit(event) {
    // event.preventDefault();
    // const { currentTarget } = event;
    // const formData = new FormData(currentTarget);

    // const data = {
    //   dues_paid: formData.get("dues_paid"),
    //   owns_gi: formData.get("owns_gi"),
    //   has_first_aid_qualification: formData.get("has_first_aid_qualification"),
    //   first_aid_achievement_date: formData.get("first_aid_achievement_date"),
    //   first_aid_expiry_date: formData.get("first_aid_expiry_date"),
    //   belt: formData.get("belt"),
    //   instructor_qualification: formData.get("instructor_qualification"),
    //   instructor_qualification_achievement_date: formData.get(
    //     "instructor_qualification_achievement_date"
    //   ),
    // }
    // console.log("This is handleSubmit", data)
    // currentTarget.reset();

    // format the instructor_qualification_achieved_at using moment
    console.log("This is the start of handleSubmit");
    let object = {
      belt_id: null,
      owns_gi: null,
      has_first_aid_qualification: null,
      first_aid_achievement_date: null,
      instructor_qualification: {
        qualification_id: null,
        achieved_at: null,
      },
    };

    if (userInformation != null) {
      if (userInformation.belt_id !== grade) {
        object.belt_id = grade;
      } 
      else {
        delete object.belt_id;
      }

      if (userInformation.owns_gi !== gi) {
        object.owns_gi = gi;
      } 
      else {
        delete object.owns_gi;
      }

      if (userInformation.has_first_aid_qualification !== firstAid) {
        object.has_first_aid_qualification = firstAid;
      } 
      else {
        delete object.has_first_aid_qualification;
      }

      if (userInformation.first_aid_achievement_date !== firstAidDate) {
        object.first_aid_achievement_date = firstAidDate;
      }
      else {
        delete object.first_aid_achievement_date;
      }

      if (
        userInformation.instructor_qualification.qualification_id !==
        instructorQualification
      ) {
        object.instructor_qualification.qualification_id =
          instructorQualification;
      } 
      else {
        delete object.instructor_qualification.qualification_id;
      }

      if (
        moment(userInformation.instructor_qualification.achieved_at).format(
          "DD-MM-YYYY"
        ) !== moment(instructorQualificationDate).format("DD-MM-YYYY")
      ) {
        object.instructor_qualification.achieved_at =
          instructorQualificationDate;
      } else {
        delete object.instructor_qualification.achieved_at;
        console.log(Object.keys(object.instructor_qualification));
        if (Object.keys(object.instructor_qualification).length === 0) {
          delete object.instructor_qualification;
        }
      }
      console.log("This is the object for checking against the server", object);

      // CHECK FOR THAT IF ELSE SECTIONS, DOES IT WORK
      if (Object.keys(object).length !== 0) {
        props.onSubmit(object, userInformation.id);
      } else {
        alert("You did not change anything!");
      }
    }
  }
  const { errors } = props;

  console.log(
    "This is what we're trying to use for the menu",
    props.createSelectUserItems
  );
  // console.log("These are the belt grades", this.state.belt_grades);

  // console.log("This is the achievement date", userInformation != null ? (userInformation.instructor_qualification.achieved_at != null ? userInformation.instructor_qualification.achieved_at : 0) : 0)

  // let outstanding = props.waivers.length; // Redfine this by checking instead of the length, which actually have nil Admin/witness sigs thus need an actual sig
  // console.log("These waivers are outstanding", outstanding);

  console.log("Number of waivers", props.waivers.length);
  let outstanding = 0;

  for (let i = 0; i < props.waivers.length; i++) {
    // console.log("Are we accessing the props?", props.waivers[i])
    let waiver = props.waivers[i];
    if ( (waiver.organization_witness_name === "The witness will print their name for you")) {
      outstanding = outstanding + 1; 
      waiver.is_outstanding = true;
      // console.log("These waivers are outstanding and incrementing", outstanding);
    } else if (waiver.organization_witness_name === "Seumas Finlayson" || waiver.organization_witness_name === "David Corbett") {
      // TODO: Check that this is actually giving the correct count
      waiver.is_outstanding = false;
    }
    // return (outstanding);
  }

  console.log("Number of outstanding waivers to be signed", outstanding);
  


  // console.log("These waivers are outstanding", outstanding);


  // function outstandingWaivers(outstanding){
  //   // return("There are currently " + outstanding + "outstanding waivers which must be signed by an admin.&nbsp;");
  //   return(document.getElementById('caption').textContent = 'Hello \nlcr World!');
  // }
  let label = document.getElementById("caption");
  console.log("This is the text we are changing", label);
  // TODO: Might want a loading cog here so that the outstanding text is rendered simultaneously with "Which user's waiver do you wish to sign?".
  if (label != null) {
    label.textContent = "There are currently " + outstanding + " outstanding waivers which must be signed by an admin.";
  }

  
  
  return (
    <Form>
      {/* {errors.length > 0 ? (
        <div className="ui negative message FormErrors">
          <Alert variant="danger">
            <div className="header">Access Denied</div>
            <p>{errors.map((err) => err.message).join(",")}</p>
          </Alert>
        </div>
      ) : null} */}

      <Form.Group controlId="formBasicAdmin">

{/* TODO: Get this "behind the scenes" visitor counter going, also see index.html */}
 {/* //     let counterContainer = document.querySelector(".website-counter");
// let resetButton = document.querySelector("#reset");
// let visitCount = localStorage.getItem("page_view");

// // Check if page_view entry is present
// if (visitCount) {
//   visitCount = Number(visitCount) + 1;
//   localStorage.setItem("page_view", visitCount);
// } else {
//   visitCount = 1;
//   localStorage.setItem("page_view", 1);
// }
// counterContainer.innerHTML = visitCount;

// // Adding onClick event listener
// resetButton.addEventListener("click", () => {
//   visitCount = 1;
//   localStorage.setItem("page_view", 1);
//   counterContainer.innerHTML = visitCount;
// }); */}

      <h1 id="top-label">
          Add an admin's signature for a student's newly signed waiver
        </h1>
        <br />
        <br />

        <label 
        name="oustandingSignatures"
        // textContent="caption"
        id="caption"
        htmlFor="changeMe"
        > 
        </label>
        
        <Form.Label name="user-choice">
        &nbsp;Which user's waiver do you wish to sign?
        </Form.Label>
        {/* TODO: This does not populate only those waivers which need a signature, but rather all of them; tie it in to the "outstanding" counter to populate the dropdown correctly */}
        <Form.Control
          name="waiverList"
          type="user-name"
          as="select"
          defaultValue="Please select"
          onChange={twoCallsWaivers}
          // onClick={(id) => this.updateWaiver(waiver.id)}
        >
          <option type="select" label="Please Select"></option>
          {props.createSelectWaiverItems}
        </Form.Control>

        <br />
        <br />

        <Button
        disabled={!isWaiverSelected}
        variant="primary"
        onClick={handleWaiverEdit}

      >
        Jump to Waiver Edit Page
      </Button>

        <br />
        <br />

        <h1 id="top-label">
          Update user information regarding grade, qualifications etc
        </h1>
        <br />
        <br />
        <Form.Label name="user-choice">
          Which user do you wish to update?
        </Form.Label>
        {/* Consider putting this in normal chrono order */}
        <Form.Control
          name="user"
          type="user-name"
          as="select"
          defaultValue="Please select"
          onChange={twoCallsUsers}
        >
          <option type="select" label="Please Select"></option>
          {props.createSelectUserItems}
        </Form.Control>
      </Form.Group>
      <Form.Group controlId="formBasicGrade">
        <Form.Label>What is their Jitsu grade?</Form.Label>
        <Form.Control
          className="color-belt"
          name="belt"
          type="select"
          as="select"
          disabled={!isUserSelected}
          value={userInformation != null ? grade : 0}
          // defaultValue={props.users[i].belt_grades[0].belt_id}
          onChange={updateColorBox}
        >
          <option
            className="gradecoloroption"
            style={{ backgroundColor: "white" }}
            value={8}
          >
            White{" "}
          </option>
          <option
            className="gradecoloroption"
            style={{ backgroundColor: "yellow" }}
            value={7}
          >
            Yellow{" "}
          </option>
          <option
            className="gradecoloroption"
            style={{ backgroundColor: "orange" }}
            value={6}
          >
            Orange
          </option>
          <option
            className="gradecoloroption"
            style={{ backgroundColor: "green" }}
            value={5}
          >
            Green
          </option>
          <option
            className="gradecoloroption"
            style={{ backgroundColor: "purple" }}
            value={4}
          >
            Purple
          </option>
          <option
            className="gradecoloroption"
            style={{ backgroundColor: "#add8e6", color: "black" }}
            value={3}
          >
            Light Blue
          </option>
          <option
            className="gradecoloroption"
            style={{ backgroundColor: "#00008b" }}
            value={2}
          >
            Dark Blue{" "}
          </option>
          <option
            className="gradecoloroption"
            style={{ backgroundColor: "#b5651d" }}
            value={1}
          >
            Brown
          </option>
        </Form.Control>
      </Form.Group>
      <Form.Group controlId="formBasicGi">
        <Form.Label>Do they have a gi?</Form.Label>
        <Form.Control
          disabled={!isUserSelected}
          className="gi"
          type="gi"
          name="owns_gi"
          as="select"
          required={true}
          value={userInformation != null ? gi : 0}
          onChange={updateGiBox}

          // defaultValue={props.selectedUser.owns_gi}
          // // defaultValue={props.users[i].owns_gi}
          // onChange={props.changeSelectColorHandler}
        >
          <option value={0}>Please select </option>
          <option value={false}>Not yet </option>
          <option value={true}>Yes </option>
        </Form.Control>
      </Form.Group>
      <Form.Group controlId="formBasicFirstAid">
        <Form.Label>Are they first aid qualified?</Form.Label>
        {/* {console.log("Is this today?", new Date().toLocaleString("en-US").replace(',', '').replace(':00 ', ' '))}
        {console.log("What we'll feed in as the expiry date", (userInformation && userInformation.first_aid_achievement_date))}
        {console.log("What we'll feed into the value check", userInformation && (howRecentlyAchieved(userInformation.first_aid_achievement_date, new Date().toLocaleString("en-US").replace(',', '').replace(':00 ', ' '))))} */}
        <Form.Control
          disabled={!isUserSelected}
          className="first-aid"
          name="has_first_aid_qualification"
          type="first-aid"
          as="select"
          required={true}
          value={userInformation != null ? firstAid : 0}
          // value={userInformation != null ? (userInformation.has_first_aid_qualification != null ? (howRecentlyAchieved(userInformation.first_aid_achievement_date, new Date().toLocaleString("en-US").replace(',', '').replace(':00 ', ' '))[0] != true ? "Yes, but they need to renew it" : "Yes, it's recent and active" ) : "No") : 0}
          // value={isUserSelected ? userInformation.first_aid_achievement_date != null ? true : false : false }
          //(userInformation.first_aid_achievement_date != null ? (howRecentlyAchieved(userInformation.first_aid_achievement_date, new Date().toLocaleString("en-US").replace(',', '').replace(':00 ', ' '))[0]) : 0) : 0
          onChange={updateFirstAidBox}
        >
          <option>Please select </option>
          <option value={false}>
            No, or they are but they need to renew it
          </option>
          <option value={true}>Yes, it's recent and active</option>
        </Form.Control>
      </Form.Group>
      <Form.Group controlId="formBasicFirstAidDate">
        <Form.Label>
          If so, when did they achieve the first aid qualification?
        </Form.Label>
        {/* <Form.Control
          className="first-aid-date"
          type="first-aid-date"
          // as="select"
          // required={true}
        //   onChange={props.changeSelectColorHandler}
        > */}
        {console.log(
          "Testing values for the first aid achievement date",
          userInformation != null
            ? userInformation.first_aid_achievement_date != null
              ? new Date(userInformation.first_aid_achievement_date)
                  .toLocaleString("en-US")
                  .replace(",", "")
                  .replace(":00 ", " ")
              : 0
            : 0
        )}
        {isUserSelected ? (
          <Datetime
            inputProps={{ disabled: !isUserSelected }}
            required={true}
            className="qualification-date"
            name="first_aid_achievement_date"
            value={firstAidDate}
            // value={
            //   userInformation != null
            //     ? new Date(firstAidDate)
            //         .toLocaleString("en-US")
            //         .replace(",", "")
            //         .replace(":00 ", " ")
            //     : ""
            // }
            // value={userInformation != null ? (userInformation.first_aid_achievement_date != null ? new Date(userInformation.first_aid_achievement_date).toLocaleString("en-US").replace(',', '').replace(':00 ', ' ') : 0) : 0}
            // value={isUserSelected ? userInformation.first_aid_achievement_date != null ? new Date(userInformation.first_aid_achievement_date) : 'Please select a date' : ''}
            // initialValue={isUserSelected ? moment(userInformation.first_aid_achievement_date).utc().format("MM/DD/YYYY") : 'Please select a date'}
            dateFormat="MM/DD/YYYY"
            onChange={updateFirstAidDate}
            // initialValue={isUserSelected ? new Date(userInformation.first_aid_achievement_date) : 'Please select a date'}
            // value="11/22/2020 4:00 PM"
            // value={userInformation != null ? userInformation.first_aid_achievement_date != null ? moment(userInformation.first_aid_achievement_date).utc().format('DD MM, YYYY') : 0 : 0}
            // userInformation != null ? (userInformation.first_aid_achievement_date != null ? new Date(userInformation.first_aid_achievement_date) : 0) : 0

            // value={new Date('2020-11-22T00:00:00.000Z').toLocaleDateString()}
            // value={userInformation != null ? moment().toDate(userInformation.first_aid_achievement_date) : 0}
            // For some reason that's returning today's date instead of the one we intend!

            // defaultValue={props.users[i].first_aid_achievement_date}
          />
        ) : (
          ""
        )}

        {/* </Form.Control> */}
      </Form.Group>
      <Form.Group controlId="formBasicInstructorQualification">
        <Form.Label>Do they have an instructor qualification?</Form.Label>
        <Form.Control
          disabled={!isUserSelected}
          className="instructor-qualification"
          name="instructor_qualification"
          type="instructor-qualification"
          as="select"
          required={true}
          value={userInformation != null ? instructorQualification : 0}
          // value={isUserSelected ? userInformation.instructor_qualification != null ? userInformation.instructor_qualification.qualification_id : 1 : 0}
          onChange={updateInstructorQualificationBox}
          //(userInformation.instructor_qualification != null ? userInformation.instructor_qualification.qualification_id : 0) : 0
          // defaultValue={props.users[i].instructor_qualifications[0].qualification_id}
          //   onChange={props.changeSelectColorHandler}
        >
          <option>Please select </option>
          <option value={1}>No qualifications </option>
          <option value={2}>Assistant Instructor </option>
          <option value={3}>Instructor </option>
          <option value={4}>Club Instructor </option>
        </Form.Control>
      </Form.Group>
      <Form.Group controlId="formBasicInstructorQualificationDate">
        {/* {isUserSelected != null ? userInformation.instructor_qualification : 0} */}
        <Form.Label>
          If so, when did they achieve the most recent instructor qualification?
        </Form.Label>
        {/* {console.log("Testing values for the instructor qualification achievement date", userInformation != null ? (userInformation.instructor_qualification != null ? (userInformation.instructor_qualification.qualification_id !== 1 ? new Date(userInformation && userInformation.instructor_qualification.achieved_at).toLocaleString("en-US").replace(',', '').replace(':00 ', ' ') : "") : 0) : 0)} */}
        {console.log(
          "Testing values for the instructor qualification achievement date",
          userInformation != null ? userInformation : ""
        )}

        {isUserSelected ? (
          <Datetime
            inputProps={{ disabled: !isUserSelected }}
            required={true}
            className="qualification-date"
            name="instructor_qualification_achievement_date"
            // value={userInformation != null ? new Date(instructorQualificationDate).toLocaleString("en-US").replace(',', '').replace(':00 ', ' ') : 0}
            value={instructorQualificationDate}
            dateFormat="MM/DD/YYYY"
            // value={isUserSelected ? userInformation.instructor_qualification != null ? userInformation.instructor_qualification.qualification_id != 1 ? new Date(userInformation.instructor_qualification.achieved_at) : 'Please select a date' : 'Please select a date' : 'Please select a date'}
            onChange={updateInstructorQualificationDate}
            // initialValue={isUserSelected ? moment(userInformation.instructor_qualification.achieved_at).format("MM/DD/YYYY HH:mm A") : 'Please select a date'}
            // value={userInformation != null ? moment().toDate(userInformation.instructor_qualifications[0].achieved_at) : 0}
            // value={userInformation != null ? new Date(userInformation.first_aid_achievement_date).toLocaleString("en-US").replace(',', '').replace(':00 ', ' ') : 0}

            // Intentionally do not render the "achievement date" if a user has not, in fact, achieved a qualification!

            // value={userInformation != null ? (userInformation.instructor_qualification != null ? (userInformation.instructor_qualification.qualification_id !== 1 ? new Date(userInformation && userInformation.instructor_qualification.achieved_at).toLocaleString("en-US").replace(',', '').replace(':00 ', ' ') : "") : 0) : 0}
            // This one is a struggle to populate!

            // defaultValue={props.users[i].instructor_qualifications[0].achieved_at}
          />
        ) : (
          ""
        )}

        {/* </Form.Control> */}
      </Form.Group>
      <Button
        disabled={!isUserSelected}
        variant="primary"
        onClick={handleSubmit}
      >
        Update User
      </Button>
    </Form>
  );
}