// import React, {useState} from "react";

// function secondConverter(time) {
//     let fullTime = 0;
//     /*pseudocode: 
//     if start/end time is in min:sec format, parse it into seconds
//     i.e. A:BB so time in seconds = A*60 + BB */
//     if (time.includes(":")) {
//       const timeArray = time.split(":");
//       fullTime = (parseInt(timeArray[0] * 60) + parseInt(timeArray[1]));
//     } else {
//       fullTime = time;
//     }
//     return fullTime;
//   }

//   function urlStartEndizer(url, startTime, endTime) {
//     // console.log("This is the url, start time and end time", url, startTime, endTime)
  
//     let startFlag = "?start=";
//     let endFlag = "&end=";
//     let endOnlyStr = "?end="
  
//     if ((url.includes(startFlag) && url.includes(endFlag)) || url.includes(startFlag) || url.includes(endOnlyStr)){
//       return url;
//     } 
  
//     if (startTime.length && endTime.length) {
//       url += startFlag + startTime + endFlag + endTime;
//     } else if (startTime.length && !endTime.length){ 
//       url += startFlag + startTime;
//     } else if (!startTime.length && endTime.length){ 
//       url += endOnlyStr + endTime;
//     }
//     console.log(url);
//     return url; 
//   }

// // handle input change
// const handleInputChange = (e, index) => {
//     const { name, value } = e.target;
//     const list = [...videos];
//     list[index][name] = value;
//     setVideos(list);
//     console.log("This is the video list", list);
//     // Perhaps add listener for when we edit, if an existing video changes, to see if what it's replaced by is edited, or if it's a new one
//     };

//   // handle click event of the Remove button
//   const handleRemoveClick = (index) => {
//     const list = [...videos];
//     if (index > -1) {
//       list.splice(index, 1);
//     }
//     setVideos(list);
//   };

//   // handle click event of the Remove button
//   const handleRemoveClick = (index) => {
//     const list = [...videos];
//     if (index > -1) {
//       list.splice(index, 1);
//     }
//     setVideos(list);
//   };

//   // handle click event of the Add button
//   const handleAddClick = () => {
//     videos.push({
//       canadian_version: "",
//       canadianStartTime: "",
//       canadianEndTime: "",
//       // canadianUrl: "",
//       // britishUrl: "",
//       britishStartTime: "",
//       britishEndTime: "",
//       uk_version: ""
//     });

//     setVideos([...videos]);
//   };

//   function handleSubmit(event) {
//     event.preventDefault();
//     const { currentTarget } = event;
//     const formData = new FormData(currentTarget);

//     // video conversion
//     videos.map((item, index) => {
//       if (videos?.length && item.canadian_version) {
//         item.canadian_version = urlStartEndizer.apply(
//           item.canadian_version,
//           urlStringGenerator(
//             urlStartEndizer(
//               videos?.length ? item.canadian_version : "",
//               formData.get("canadianStartTime"),
//               formData.get("canadianEndTime")
//             )
//           )
//         );
//       }
//       if (videos?.length && item.uk_version) {
//         // console.log(props.video && props.video[0].british_version);
//         item.uk_version = urlStartEndizer.apply(
//           item.uk_version,
//           urlStringGenerator(
//             urlStartEndizer(
//               videos?.length ? item.uk_version : "",
//               formData.get("britishStartTime"),
//               formData.get("britishEndTime")
//             )
//           )
//         );
//       }
//     });

//     console.log("Here are the videos to be submitted", videos);
//     props.onSubmit({
//       syllabus: formData.get("country").toLowerCase(),
//       belt: parseInt(formData.get("belt")),
//       summary: formData.get("summary"),
//       category: formData.get("category"),
//       sub_category: formData.get("sub_category"),
//       videos: videos,
//       is_different: formData.get("is_different"),
//       difference_content: formData.get("difference_content"),
//     });

//     //     console.log("######## here's the props", props);

//     //      console.log("Here's the video we're passing in", ("canadian_version" + formData.get("canadian_version"),
//     //      "britishUrl" + formData.get("britishUrl")));

//     currentTarget.reset();
//   }

//   export default TechniqueGenerationEngine;