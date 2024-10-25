import React, { useEffect, useState } from "react";
// import FormErrors from "./FormErrors";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import isLoading from "./TechniqueUpdatePage";
import "../App.scss";
import { map } from "lodash";
import TechniqueGenerationEngine from "./TechniqueGenerationEngine";

// decouple props and state so that they can edit a url if it's there as a string but if it isn't then they can use the default prop value
// think about flattening state so that urls are easily accessible without having to use nested code
// setVideos may be overwriting the url values- check and simplify the inputchangehandler functions
// consider making videos a single element instead of an array- if you wanted to have multiple videos,
// edit a single video instead of editing an entire technique may be easier in an architectural sense
// dev 2 (as opposed to medium) writing is good for resume
// small projects, going on LinkedIn, look for my language of choice and network

function secondConverter(time) {
  let fullTime = 0;
  /*pseudocode: 
    if start/end time is in min:sec format, parse it into seconds
    i.e. A:BB so time in seconds = A*60 + BB */
  if (time.includes(":")) {
    const timeArray = time.split(":");
    fullTime = parseInt(timeArray[0] * 60) + parseInt(timeArray[1]);
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
  if (startTime === "" || startTime === null || startTime === undefined) {
    return startSubStr;
  } else {
    startSubStr = startFlag + secondConverter(String(startTime));
    return startSubStr;
  }
}

function endTimeIncludeCheck(endTime) {
  let endFlag = "&end=";
  let endSubStr = "";
  if (endTime === "" || endTime === null || endTime === undefined) {
    console.log("There is no endSubStr");
    return endSubStr;
  } else {
    endSubStr = endFlag + secondConverter(String(endTime));
    return endSubStr;
  }
}

function urlStartEndizer(url, startTime, endTime) {
  // console.log("This is the url, start time and end time", url, startTime, endTime)

  let startFlag = "?start=";
  let endFlag = "&end=";
  let endOnlyStr = "?end="

  if ((url.includes(startFlag) && url.includes(endFlag)) || url.includes(startFlag) || url.includes(endOnlyStr)){
    return url;
  } 

  if (startTime?.length && endTime?.length) {
    url += startFlag + startTime + endFlag + endTime;
  } else if (startTime?.length && !endTime?.length){ 
    url += startFlag + startTime;
  } else if (!startTime?.length && endTime?.length){ 
    url += endOnlyStr + endTime;
  }
  console.log(url);
  return url; 
}

function urlStringGenerator(url) {
  let rootUrl = "";
  let startTime = "";
  let startCheck = "?start=";
  let endTime = "";
  let endCheck = "&end=";
  let partialSplit = url.split(startCheck);
  let start = partialSplit[1]?.split(endCheck);
  let end = url.split("end=");

  return [url, start?.length? start[0] : "", end?.length? end[1] : ""];
}

console.log("Test the URL string generator", urlStringGenerator("https://www.youtube.com/watch?v=tLeu22wenlg?start=5&end=12"))

// let test_array = ["https://www.youtube.com/watch?v=tLeu22wenlg", "", 8];

// console.log(
//   "Array test for urlStartEndizer",
//   urlStartEndizer.apply(null, test_array)
// );
// THIS WORKS! A successful approach to taking in an array as an argument

// console.log(
//   "Test for urlStartEndizer",
//   urlStartEndizer("https://www.youtube.com/watch?v=tLeu22wenlg", 12, 20)
// );
// console.log(
//   "Test for urlStringGenerator",
//   urlStringGenerator(
//     "https://www.youtube.com/embed/7wUL_tSqdP0?start=20&end=120"
//   )
// );

// console.log(
//   "Second test for urlStringGenerator- blank url",
//   urlStringGenerator("")
// );

// console.log("Third, heavy test for urlStringGenerator", urlStringGenerator("https://www.youtube.com/watch?v=L202EJPSeYM?start=38&end=56?start=39&end=56"))

// // Use outputUrl for the following one
// function timeFormBuilder(url){
//   let urlArray = [];

// }

// console.log("Test for timeFormBuilder", timeFormBuilder())

export default UpdateTechniqueForm;
function UpdateTechniqueForm(props) {
  const [videos, setVideos] = useState([
    { canadian_version: "", uk_version: "" },
  ]); //canadianStartTime: ""
  useEffect(() => {
    // This is to monitor props.videos so that every time it changes, the component will rerender
    if (props.videos.length) {
      const urls = props.videos.map((each) => ({
        canadian_version: each.canadian_version || "",
        uk_version: each.uk_version || "",
        // canadianStartTime: each.canadianStartTime || ""
      }));
      setVideos(urls);
    }
  }, [props.videos]);
  console.log(
    "This is what we're using for the videos there",
    props.video?.length ? props.video : ""
  );
  let truncatedVideos = JSON.stringify(videos)
    .split(":")
    .join(" : ")
    .split(",")
    .join(" , ")
    .split('l"')
    .join("l ")
    .slice(3, -2);
  let canadianVideo = truncatedVideos.substr(0, truncatedVideos.indexOf(","));
  let britishVideo = truncatedVideos.substr(truncatedVideos.indexOf("b"));

  // console.log("These are the videos", props);
  // console.log("Test the videos object", videos)

  // Drill deeper!
  // console.log("Test the British videos object", videos[0].britishUrl.split("start"))
  // console.log("Test the Canadian videos object", videos[0].canadian_version.split("start"))

  // console.log("These are the props", props);
  // Try to make these videos display on new lines for e.g. half width page, and correctly output for multiple entries

  // handle input change
  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...videos];
    list[index][name] = value;
    setVideos(list);
    console.log("This is the video list", list);
    // Perhaps add listener for when we edit, if an existing video changes, to see if what it's replaced by is edited, or if it's a new one
  };

  // handle input change for the case of start times changing in the form
  const handleInputChangeStartTimeCanadian = (e, index) => {
    // console.log("This is the Canadian URL", videos[index].canadian_version);
    let url = "";
    if (videos[index].canadian_version.includes("?start")){
      url = videos[index].canadian_version.split("?start");
    } else if (videos[index].canadian_version.includes("?end")){
      url = videos[index].canadian_version.split("?end");
    }

    const endTime = videos[index].canadian_version.split("end=");
    let formattedUrl = "";
    if (e.target.value?.length && endTime[1]?.length) {
    formattedUrl =
      url[0] + "?start=" + e.target.value + "&end=" + endTime[1];
    } else if (e.target.value?.length && !endTime[1]?.length) {
      formattedUrl =
      url[0] + "?start=" + e.target.value;
    } else if (!e.target.value?.length && endTime[1]?.length) {
      formattedUrl =
      url[0] + "?end=" + endTime[1];
    }
    let oldArray = [...videos];
    oldArray[index] = { canadian_version: formattedUrl };
    setVideos(oldArray);
    // https://www.youtube.com/watch?v=L202EJPSeYM?start=3&end=38
  };

  // handle input change for the case of start times changing in the form
  const handleInputChangeStartTimeBritish = (e, index) => {
    // console.log("This is the British URL", videos[index].britishUrl);
    let url = "";
    if (videos[index].uk_version.includes("?start")){
      url = videos[index].uk_version.split("?start");
    } else if (videos[index].uk_version.includes("?end")){
      url = videos[index].uk_version.split("?end");
    }

    const endTime = videos[index].uk_version.split("end=");
    let formattedUrl = "";
    if (e.target.value?.length && endTime[1]?.length) {
    formattedUrl =
      url[0] + "?start=" + e.target.value + "&end=" + endTime[1];
    } else if (e.target.value?.length && !endTime[1]?.length) {
      formattedUrl =
      url[0] + "?start=" + e.target.value;
    } else if (!e.target.value?.length && endTime[1]?.length) {
      formattedUrl =
      url[0] + "?end=" + endTime[1];
    }
    let oldArray = [...videos];
    oldArray[index] = { uk_version: formattedUrl };
    setVideos(oldArray);
    // https://www.youtube.com/watch?v=L202EJPSeYM?start=3&end=38
  };

  // handle input change for the case of end times changing in the form
  const handleInputChangeEndTimeCanadian = (e, index) => {
    // console.log("This is the Canadian URL", videos[index].canadian_version);

    let url = "";
    if (videos[index].canadian_version.includes("?start")){
      url = videos[index].canadian_version.split("?start");
    } else if (videos[index].canadian_version.includes("?end")){
      url = videos[index].canadian_version.split("?end");
    }
    console.log("Is the url getting split?", url);

    const partialSplit = videos[index].canadian_version.split("start=");
    // console.log("🚀 ~ file: UpdateTechniqueForm.js ~ line 260 ~ handleInputChangeEndTimeCanadian ~ partialSplit", partialSplit)
    const startTime = partialSplit[1].split("&");
    console.log("This is the start time from the url split", startTime);
    let formattedUrl = "";
    
    if (e.target.value?.length && startTime[0]?.length) {
      formattedUrl =
        url[0] + "?start=" + startTime[0] + "&end=" + e.target.value;
      } else if (e.target.value?.length && !startTime[0]?.length) {
        formattedUrl =
        url[0] + "?end=" + e.target.value;
      } else if (!e.target.value?.length && startTime[0]?.length) {
        formattedUrl =
        url[0] + "?start=" + startTime[0];
      }

    let oldArray = [...videos];
    oldArray[index] = { canadian_version: formattedUrl };
    setVideos(oldArray);
  };

  // handle input change for the case of start/end times changing in the form
  const handleInputChangeEndTimeBritish = (e, index) => {
    // console.log("This is the Canadian URL", videos[index].canadian_version);
    let url = "";
    if (videos[index].uk_version.includes("?start")){
      url = videos[index].uk_version.split("?start");
    } else if (videos[index].uk_version.includes("?end")){
      url = videos[index].uk_version.split("?end");
    }
    console.log("Is the url getting split?", url);

    const partialSplit = videos[index].uk_version.split("start=");
    // console.log("🚀 ~ file: UpdateTechniqueForm.js ~ line 260 ~ handleInputChangeEndTimeCanadian ~ partialSplit", partialSplit)
    const startTime = partialSplit[1].split("&");
    console.log("This is the start time from the url split", startTime);
    let formattedUrl = "";
    
    if (e.target.value?.length && startTime[0]?.length) {
      formattedUrl =
        url[0] + "?start=" + startTime[0] + "&end=" + e.target.value;
      } else if (e.target.value?.length && !startTime[0]?.length) {
        formattedUrl =
        url[0] + "?end=" + e.target.value;
      } else if (!e.target.value?.length && startTime[0]?.length) {
        formattedUrl =
        url[0] + "?start=" + startTime[0];
      }

    let oldArray = [...videos];
    oldArray[index] = { uk_version: formattedUrl };
    setVideos(oldArray);
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
      uk_version: "",
    });

    setVideos([...videos]);
  };

  // When should we use this one?
  const handleChange = (e) => {
    // console.log("This is e", e.target.value)
    // console.log("These are the belt id props", props.technique.belt_id)
    // this.setState({selectValue:e.target.value});
  };

  // functions to check for undefined or null values for video properties
  function checkErrorsCanadianVersion(data) {
    if (typeof data != "undefined") {
      if (typeof data.canadian_version != "undefined") {
        return data.canadian_version;
      }
    }
    return "";
  }

  function checkErrorsUkVersion(data) {
    if (typeof data != "undefined") {
      if (typeof data.uk_version != "undefined") {
        return data.uk_version;
      }
    }
    return "";
  }

  // function to handle the submission for an event
  function handleSubmit(event) {
    event.preventDefault();
    const { currentTarget } = event;
    const formData = new FormData(currentTarget);

    // video conversion
    videos.map((item, index) => {
      if (videos?.length && item.canadian_version) {
        item.canadian_version = urlStartEndizer.apply(
          item.canadian_version,
          urlStringGenerator(
            urlStartEndizer(
              videos?.length ? item.canadian_version : "",
              formData.get("canadianStartTime"),
              formData.get("canadianEndTime")
            )
          )
        );
      }
      if (videos?.length && item.uk_version) {
        // console.log(props.video && props.video[0].british_version);
        item.uk_version = urlStartEndizer.apply(
          item.uk_version,
          urlStringGenerator(
            urlStartEndizer(
              videos?.length ? item.uk_version : "",
              formData.get("britishStartTime"),
              formData.get("britishEndTime")
            )
          )
        );
      }
    });

    console.log("Here are the videos to be submitted", videos);
    props.onSubmit({
      syllabus: formData.get("country").toLowerCase(),
      belt: parseInt(formData.get("belt")),
      summary: formData.get("summary"),
      category: formData.get("category"),
      sub_category: formData.get("sub_category"),
      videos: videos,
      is_different: formData.get("is_different"),
      difference_content: formData.get("difference_content"),
    });

    //     console.log("######## here's the props", props);

    //      console.log("Here's the video we're passing in", ("canadian_version" + formData.get("canadian_version"),
    //      "britishUrl" + formData.get("britishUrl")));

    currentTarget.reset();
  }
  const { errors } = props;

  // console.log("These are the props", props);

  // console.log(
  //   "Let's grab that start time",
  //   props.video && urlStringGenerator(props.video[0].canadian_version)[1]
  // );

  // console.log("What is the British URL?", props.video[0].british_version)

  return (
    // Page loading function isn't working so ask a TA
    // <div> { isLoading ? <p>Loading</p>
    // :
    // technique.map(

    <Form onSubmit={handleSubmit}>
      {errors.length > 0 ? (
        <div className="ui negative message FormErrors">
          <Alert variant="danger">
            <div className="header">Access Denied</div>
            <p>{errors.map((err) => err.message).join(",")}</p>
          </Alert>
        </div>
      ) : null}

      <Form.Group controlId="formBasicSyllabus">
        <Form.Label id="top-label">Edit existing technique</Form.Label>
        <br />
        <br />
        <Form.Label name="syllabus">
          Syllabus associated with the technique
        </Form.Label>
        <Form.Control
          name="country"
          type="country"
          as="select"
          defaultValue="Canada"
        >
          <option id={1}>Canada </option>
        </Form.Control>
      </Form.Group>
      <Form.Group controlId="formBasicSummary">
        <Form.Label>Name of the technique </Form.Label>
        <Form.Control
          defaultValue={props.technique.summary}
          placeholder={props.technique.summary}
          name="summary"
          type="text"
          required={true}
        />
      </Form.Group>
      {/* Note: italicise options */}
      <Form.Group controlId="formBasicGrade">
        <Form.Label>Grade</Form.Label>
        <Form.Control
          className="color-belt"
          name="belt"
          type="belt"
          as="select"
          value={props.technique.belt_id}
          onChange={props.changeSelectColorHandler}
        >
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
      {/* Note: italicise options */}
      <Form.Group controlId="formBasicCategory">
        <Form.Label>Category of technique</Form.Label>
        <Form.Control
          name="category"
          type="category"
          as="select"
          value={props.technique_type.category}
          onChange={props.changeSelectCategoryHandler}
        >
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
        <Form.Control
          name="sub_category"
          type="sub_category"
          placeholder="Can be blank if none comes to mind."
          defaultValue={props.technique_type.sub_category}
        />
      </Form.Group>
      <Form.Group controlId="formBasicVideos">
        {/* {console.log("These are the videos before mapping", videos)} */}
        {videos.map((x, i) => {
          // console.log("This is the Canadian Video value", x.canadian_version);
          const urlCanada = x.canadian_version;
          const urlBritain = x.uk_version;
          console.log("What is x?", x);
          console.log(
            "What is the Canadian time value (non-default)?",
            x.canadianStartTime
          );
          console.log("What is that url?", urlCanada);
          console.log("Check for the props", props);
          console.log(
            "Check for the Canadian start time",
            props.videos?.length
              ? urlStringGenerator(checkErrorsCanadianVersion(videos[i]))[1]
              : ""
          );
          console.log(
            "What is that Canadian error check?",
            props.videos?.length ? checkErrorsCanadianVersion(videos[i]) : ""
          );
          console.log(
            "What is that British error check?",
            props.videos?.length ? checkErrorsUkVersion(videos[i]) : ""
          );

          return (
            <>
              <Form.Label>
                Note: if you just want to show a segment of a video, you can
                optionally include the start and end time for that segment.
              </Form.Label>
              {/* Eventually need some sophisticated url-time-duration checking to prevent bad/trolling input! For now just test with sensible inputs */}
              <Form.Label>
                Provide the Canadian video URL (if available)
              </Form.Label>
              <Form.Control
                name="canadian_version"
                value={urlCanada}
                defaultValue={
                  props.videos?.length
                    ? checkErrorsCanadianVersion(videos[i])
                    : ""
                }
                type="primary_video"
                placeholder={props.technique.videos}
                onChange={(e) => handleInputChange(e, i)}
              />
              <br />
              <Form.Label>
                Segment start time in minutes:seconds or just seconds (optional)
              </Form.Label>
              <Form.Control
                name="canadianStartTime"
                value={
                  props.videos?.length
                    ? urlStringGenerator(
                        checkErrorsCanadianVersion(videos[i])
                      )[1]
                    : ""
                }
                // defaultValue={
                //   props.videos?.length
                //     ? urlStringGenerator(checkErrorsCanadianVersion(videos[i]))[1]
                //     : ""
                // }
                type="primary_video_start_time"
                placeholder="E.g. 0:23, or 72"
                onChange={(e) => handleInputChangeStartTimeCanadian(e, i)}
              />
              <br />
              <Form.Label>
                Segment end time in minutes:seconds or just seconds (optional)
              </Form.Label>
              <Form.Control
                name="canadianEndTime"
                value={
                  props.videos?.length
                    ? urlStringGenerator(
                        checkErrorsCanadianVersion(videos[i])
                      )[2]
                    : ""
                }
                // defaultValue={
                //   props.videos?.length
                //     ? urlStringGenerator(checkErrorsCanadianVersion(videos[i]))[2]
                //     : ""
                // }
                type="primary_video_End_time"
                placeholder="E.g. 2:52, or 210"
                onChange={(e) => handleInputChangeEndTimeCanadian(e, i)}
              />

              <br />
              <Form.Label>
                If the UK technique is different, provide the UK video URL (if
                available)
              </Form.Label>
              <Form.Control
                name="uk_version"
                value={urlBritain}
                defaultValue={
                  props.videos?.length ? checkErrorsUkVersion(videos[i]) : ""
                }
                type="secondary_video"
                placeholder="Try to source this from YouTube if possible."
                onChange={(e) => handleInputChange(e, i)}
              />
              <br />
              <Form.Label>
                Segment start time in minutes:seconds or just seconds (optional)
              </Form.Label>
              <Form.Control
                name="britishStartTime"
                value={
                  props.video?.length
                    ? urlStringGenerator(checkErrorsUkVersion(videos[i]))[1]
                    : ""
                }
                // defaultValue={
                // props.video?.length
                // ? urlStringGenerator(checkErrorsUkVersion(videos[i]))[1]
                // : ""
                // }
                type="primary_video_start_time"
                placeholder="E.g. 0:31, or 46"
                onChange={(e) => handleInputChangeStartTimeBritish(e, i)}
              />
              <br />
              <Form.Label>
                Segment end time in minutes:seconds or just seconds (optional)
              </Form.Label>
              <Form.Control
                name="britishEndTime"
                value={
                  props.video?.length
                    ? urlStringGenerator(checkErrorsUkVersion(videos[i]))[2]
                    : ""
                }
                // defaultValue={
                //   props.video?.length
                //   ? urlStringGenerator(checkErrorsUkVersion(videos[i]))[2]
                //   : ""
                // }
                type="primary_video_End_time"
                placeholder="E.g. 7:02, or 307"
                onChange={(e) => handleInputChangeEndTimeBritish(e, i)}
              />
              <br />
              <div className="btn-box">
                {videos.length !== 1 && (
                  <button className="mr10" onClick={() => handleRemoveClick(i)}>
                    Remove
                  </button>
                )}
                {/* Introduce conditional render so that it only shows two breaks if the add button has been clicked */}
                <br />
                <br />
                {videos.length - 1 === i && (
                  <Button onClick={handleAddClick} variant="success" type="add">
                    Add Another Pair Of URLs
                  </Button>
                )}
              </div>
            </>
          );
        })}
        <div style={{ marginTop: 20 }}>{canadianVideo}</div>
        <div style={{ marginTop: 20 }}>{britishVideo}</div>

        {/* This should be a form which permits multiple URL inputs with a plus button causing new input fields to appear, with an onChange handler, and groups the URLs into an array (print this on the console, and also on the TechniqueShowPage) */}
      </Form.Group>
      <Form.Group controlId="formBasicDifferenceCheck">
        <Form.Label>
          Is this technique different, or separate, from the UK syllabus?
        </Form.Label>
        <Form.Control
          name="is_different"
          type="is_different"
          as="select"
          value={props.technique.is_different}
          onChange={props.changeSelectDifferentHandler}
        >
          <option value={false}>No </option>
          <option value={true}>Yes </option>
        </Form.Control>
      </Form.Group>
      <Form.Group controlId="formBasicDifferenceContent">
        <Form.Label>If yes, describe the differences here</Form.Label>
        <Form.Control
          name="difference_content"
          type="difference_content"
          placeholder={props.technique.difference_content}
          defaultValue={props.technique.difference_content}
        />
      </Form.Group>
      <Button variant="primary" type="submit">
        Update
      </Button>
      <br />
      <br />
      <Button
        href={`/techniques/${props.technique.id}`}
        variant="secondary"
        type="cancel"
        onClick={props.onCancel}
      >
        Cancel
      </Button>
    </Form>
    //     )
    // }</div>
  );
}


{/* <TechniqueGenerationEngine
key={this.state.id}
onSubmit={this.createTechnique}
onCancel={this.props.handleCancelClick}
errors={this.state.errors}
/> */}