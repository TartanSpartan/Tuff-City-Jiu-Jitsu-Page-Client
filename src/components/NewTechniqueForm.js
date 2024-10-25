import React, {useState} from "react";
// import FormErrors from "./FormErrors";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import "../App.scss";

// Useful features would be to batch-process entire technique type groups at a time, and to copy a technique for easy editing, but these will come down the road at some point

function secondConverter(time) {
  let fullTime = 0;
  /*pseudocode: 
  if start/end time is in min:sec format, parse it into seconds
  i.e. A:BB so time in seconds = A*60 + BB */
  if (time.includes(":")) {
    const timeArray = time.split(":");
    fullTime = (parseInt(timeArray[0] * 60) + parseInt(timeArray[1]));
  } else {
    fullTime = time;
  }
  return fullTime;
}

// console.log("secondConverter test", secondConverter("5:30"))
// If this returns 330 then it works great

function startTimeIncludeCheck(startTime) {
  let startFlag = "?start=";
  let startSubStr = "";
  if (startTime === "" || startTime === null || startTime === undefined){
    return startSubStr;
  } else {
    startSubStr = startFlag + secondConverter(String(startTime));
    return startSubStr;
  }
}

function endTimeIncludeCheck(endTime) {
  let endFlag = "&end=";
  let endSubStr = "";
  if (endTime === "" || endTime === null || endTime === undefined){
    console.log("There is no endSubStr");
    return endSubStr;
  } else {
    endSubStr = endFlag + secondConverter(String(endTime));
    return endSubStr;
  }
}

// console.log("Test for startTimeIncludeCheck", startTimeIncludeCheck(4));

function urlStartEndizer(url, startTime, endTime) {
  // console.log("This is the url, start time and end time", url, startTime, endTime)

  let startFlag = "?start=";
  let endFlag = "&end=";
  let endOnlyStr = "?end="

  if ((url.includes(startFlag) && url.includes(endFlag)) || url.includes(startFlag) || url.includes(endOnlyStr)){
    return url;
  } 

  if (startTime.length && endTime.length) {
    url += startFlag + startTime + endFlag + endTime;
  } else if (startTime.length && !endTime.length){ 
    url += startFlag + startTime;
  } else if (!startTime.length && endTime.length){ 
    url += endOnlyStr + endTime;
  }
  console.log(url);
  return url; 
}

// Handy example of an embedded url: https://www.youtube.com/embed/7wUL_tSqdP0?start=20&end=120
// Likewise, but for one with only an end time: https://www.youtube.com/embed/L202EJPSeYM?end=8
console.log("Test for urlStartEndizer", urlStartEndizer("https://www.youtube.com/watch?v=L202EJPSeYM?end=12", "", ""))

console.log("Test for the particular number condition", !!(Number.isInteger("")))
let test_array = ["https://www.youtube.com/watch?v=tLeu22wenlg", 3, ""];

console.log(
  "Array test for urlStartEndizer",
  urlStartEndizer.apply(null, test_array)
);
// THIS WORKS! A successful approach to taking in an array as an argument



function NewTechniqueForm(props) {
    const [videos, setVideos] = useState([{canadian_version: "", uk_version: ""}]);
    let truncatedVideos = JSON.stringify(videos).split(":").join(" : ").split(",").join(" , ").split('l"').join("l ").slice(3, -2);
    let canadianVideo = truncatedVideos.substr(0, truncatedVideos.indexOf(","))
    let britishVideo = truncatedVideos.substr(truncatedVideos.indexOf("b"))    // Try to make these videos display on new lines for e.g. half width page, and correctly output for multiple entries
        
    console.log("These are the props", props);
    // handle input change
    const handleInputChange = (e, index) => {
      const { name, value } = e.target;
      const list = [...videos];
      list[index][name] = value;
      setVideos(list);
      console.log("This is the video list", list)
    };

  // handle click event of the Remove button
  const handleRemoveClick = (index) => {
    const list = [...videos];
    if (index > -1) {
      list.splice(index, 1);
    }
    setVideos(list);
  };

  // handle click event of the Add button
  const handleAddClick = () => {
    videos.push({
      canadian_version: "",
      canadianStartTime: "",
      canadianEndTime: "",
      // canadianUrl: "",
      // britishUrl: "",
      britishStartTime: "",
      britishEndTime: "",
      uk_version: ""
    });

    setVideos([...videos]);
  };

    // function to handle the submission for an event
    function handleSubmit(event) {
        event.preventDefault();
        const { currentTarget } = event;
        const formData = new FormData(currentTarget);

          // video conversion
    videos.map((item, index) => {
      console.log("This is the item", item)
      item.canadian_version = urlStartEndizer(
              item.canadian_version,
              formData.get("canadianStartTime"),
              formData.get("canadianEndTime")
            );
            item.uk_version = urlStartEndizer(
              item.uk_version,
              formData.get("britishStartTime"),
              formData.get("britishEndTime")
            );
            
    })

      // console.log("Here are the videos to be submitted", videos)
      // videos[0]["canadianUrl"] = urlStartEndizer(videos[0]["canadianUrl"], formData.get("canadianStartTime"), formData.get("canadianEndTime"));
      // videos[0]["britishUrl"] = urlStartEndizer(videos[0]["britishUrl"], formData.get("britishStartTime"), formData.get("britishEndTime"));
        props.onSubmit({
            syllabus: formData.get("country").toLowerCase(),
            belt: formData.get("belt"),
            summary: formData.get("summary"),
            category: formData.get("category"),
            sub_category: formData.get("sub_category"),
            videos: videos, // This is an ID so need a different way to share e.g. YouTube URLs?
            is_different: formData.get("is_different"),
            difference_content: formData.get("difference_content")
        });

        console.log("######## here's the props", props);
        console.log("Here's the video we're passing in", formData.get("videos"))
        currentTarget.reset();
           
    }

    
    return (
        <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formBasicSyllabus">
        <Form.Label id="top-label">Input new technique</Form.Label>
        <br/>
        <br/>
        <Form.Label name="syllabus">Syllabus associated with the technique</Form.Label>

        <Form.Control name = "country" type="country" as="select" defaultValue="Canada">
        <option id={1}>Canada </option> 
        </Form.Control>
        </Form.Group>
        <Form.Group controlId="formBasicSummary">
          <Form.Label>Name of the technique</Form.Label>
          <Form.Control name="summary" type="summary" placeholder="E.g. O-goshi"  required={true}/>
        </Form.Group>
        {/* Note: try to italicise options */}
        <Form.Group controlId="formBasicGrade">
            <Form.Label>Grade</Form.Label>
            <Form.Control className="color-belt" name = "belt" type="belt" as="select" defaultValue="Yellow">
              {/* Note: setting defaultValue = 7 in the above means the technique type will default to 7. Is there a different way of setting a default value for this form? */}
                <option className="gradecoloroption" style={{backgroundColor:"yellow"}} value={7} >Yellow </option>
                <option className="gradecoloroption" style={{backgroundColor:"orange"}} value={6}>Orange</option>
                <option className="gradecoloroption" style={{backgroundColor:"green"}} value={5}>Green</option>
                <option className="gradecoloroption" style={{backgroundColor:"purple"}} value={4}>Purple</option>
                <option className="gradecoloroption" style={{backgroundColor:"#add8e6", color:"black"}} value={3}>Light Blue</option>
                <option className="gradecoloroption" style={{backgroundColor:"#00008b"}} value={2}>Dark Blue </option>
                <option className="gradecoloroption" style={{backgroundColor:"#b5651d"}} value={1}>Brown</option>
                {/* {console.log("This is the grade we're trying to use", value)} */}
            </Form.Control>
        </Form.Group>
        {/* Note: try to italicise options */}
        <Form.Group controlId="formBasicCategory">
            <Form.Label>Category of technique</Form.Label>
            <Form.Control name="category" type="category" as="select" defaultValue="Bunkai (application for defence)">
                <option>Ukemi (breakfalling) </option>
                <option>Atemi (striking)</option>
                <option>Kansetsu (locks)</option>
                <option>Shime-waza (strangles)</option>
                <option>Ne-waza (groundwork)</option>
                <option>Nage-waza (throwing)</option>
                <option>Nage-no-kata (throwing form)</option>
                <option>Henka-waza (transition techniques)</option>
                <option>Kaeshi-waza (counter techniques)</option>
                <option>Bunkai (application for defence)</option>
                <option>Weapons (striking)</option>
                <option>Miscellaneous</option>
            </Form.Control>
        </Form.Group>
        <Form.Group controlId="formBasicSubCategory">
          <Form.Label>Sub Category</Form.Label>
          <Form.Control name = "sub_category" type="sub_category" placeholder="Can be blank if none comes to mind." />
        </Form.Group>
        <Form.Group controlId="formBasicVideos">
        {videos.map((x, i) => {
          const urlCanada = x.canadian_version;
          const urlBritain = x.uk_version;
          return (
            <>
              <Form.Label>Note: if you just want to show a segment of a video, you can optionally include the start and end time for that segment.</Form.Label>
              {/* Eventually need some sophisticated url-time-duration checking to prevent bad/trolling input! For now just test with sensible inputs */}
              <br/>
              <Form.Label>Provide the Canadian video URL (if available)</Form.Label>
              <Form.Control name = "canadian_version"
              value = {urlCanada}
              type="primary_video"
              placeholder="Try to source this from YouTube if possible."
              onChange={e =>handleInputChange(e, i)}/>
              <br />
              <Form.Label>Segment start time in minutes:seconds or just seconds (optional)</Form.Label>
              <Form.Control name = "canadianStartTime"
              value = {x.canadianStartTime}
              type="primary_video_start_time"
              placeholder="E.g. 0:23, or 72"
              onChange={e =>handleInputChange(e, i)}/>
              
              <br />
              <Form.Label>Segment end time in minutes:seconds or just seconds (optional)</Form.Label>
              <Form.Control name = "canadianEndTime"
              value = {x.canadianEndTime}
              type="primary_video_End_time"
              placeholder="E.g. 2:52, or 210"
              onChange={e =>handleInputChange(e, i)}/>
              
              {/* {urlStartEndizer(x.canadianURL, x.canadianStartTime, x.canadianEndTime)} */}
              <br />
              <Form.Label>If the UK technique is different, provide the UK video URL (if available)</Form.Label>
              <Form.Control name = "uk_version" 
              
              value = {urlBritain}
              type="secondary_video"
              placeholder="Try to source this from YouTube if possible."
              onChange={e =>handleInputChange(e, i)}/>
              
              <br />
              <Form.Label>Segment start time in minutes:seconds or just seconds (optional)</Form.Label>
              <Form.Control name = "britishStartTime"
              value = {x.britishStartTime}
              type="primary_video_start_time"
              placeholder="E.g. 0:31, or 46"
              onChange={e =>handleInputChange(e, i)}/>
              
              <br />
              <Form.Label>Segment end time in minutes:seconds or just seconds (optional)</Form.Label>
              <Form.Control name = "britishEndTime"
              value = {x.britishEndTime}
              type="primary_video_End_time"
              placeholder="E.g. 7:02, or 307"
              onChange={e =>handleInputChange(e, i)}/>
              
              <br />
              {/* Temporary button for farming out easy techniques (but have to scroll down for difference handling). Can comment out when full form instantiation is required. */}
              {/* <Button variant="primary" type="submit">
               Submit
               </Button> */}

              <div className="btn-box">
              {videos.length !== 1 && 
              
              <button className="mr10"
              onClick={() => handleRemoveClick(i)}>Remove</button>}
              <br/>
              <br/>
              {videos.length - 1 === i &&         
              <Button onClick={handleAddClick} variant="success" type="add">Add Another Pair Of URLs</Button>}
              {/* Introduce conditional render so that it only shows two breaks if the add button has been clicked */}

            </div>
          </>
          );
        })}
        <div style={{ marginTop: 20 }}>{canadianVideo}</div>
        <div style={{ marginTop: 20 }}>{britishVideo}</div>

        
          {/* This should be a form which permits multiple URL inputs with a plus button causing new input fields to appear, with an onChange handler, and groups the URLs into an array (print this on the console, and also on the TechniqueShowPage) */}
        </Form.Group>
        <Form.Group controlId="formBasicDifferenceCheck">
          <Form.Label>Is this technique different, or separate, from the UK syllabus?</Form.Label>
          <Form.Control name = "is_different" type="is_different" as="select">
                <option value={false}>Please select </option>
                <option value={false}>No </option>
                <option value={true}>Yes </option>
            </Form.Control>        
        </Form.Group>
        <Form.Group controlId="formBasicDifferenceContent">
          <Form.Label>If yes, describe the differences here</Form.Label>
          <Form.Control name = "difference_content" type="difference_content" placeholder="E.g. transitions aren't present for the UK syllabus"/>
        </Form.Group>
        <Button variant="primary" type="submit">
          Submit
        </Button>
        <br/>
        <br/>
        <Button href={`/syllabus`} variant="secondary" type="cancel" onClick={props.onCancel}> 
            Cancel
        </Button>
      </Form>
    );
}

export default NewTechniqueForm;