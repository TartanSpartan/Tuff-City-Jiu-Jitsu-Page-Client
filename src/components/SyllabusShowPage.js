// Fetch all syllabus data and render here, not on the syllabus show page(s) (those will be for accessing specific syllabi and info about them)
// Note: make the header's background colour a darker shade of gray so that the yellow font stands out more

import React, { useState } from "react";
import { Technique, Syllabus, User } from "../requests";
import _ from "lodash";
// ERROR: LODASH DOESN'T WORK NOW! Try to resolve this.
// import AuthRoute from "./AuthRoute";
import { Link } from "react-router-dom";
import moment from "moment";
import Button from "react-bootstrap/Button";
// import Button from "react-bootstrap/Button";
import { Nav } from "react-bootstrap";
// import {confirm} from 'react-bootstrap-confirmation';
import jc_logo from "../img/jc_logo.jpg";
import "../App.scss";

/* TO DO:
WORKING SCSS!
Word-specific highlighting in sentences?
Hover-over instead of permanent date stamps
Have all techniques be collapsible under technique types

*/

function capitaliseTheFirstLetterOfEachWord(words) {
  let individualWord = words.toLowerCase().split(" ");
  for (var i = 0; i < individualWord.length; i++) {
    individualWord[i] =
      individualWord[i].charAt(0).toUpperCase() +
      individualWord[i].substring(1);
  }
  return individualWord.join(" ");
}

function textColour(integer) {
  let color = "";
  if (integer === 2 || integer === 4) {
    color = "white"; // This makes the dark blue's or purple's header text display better
    return color;
  } else {
    color = "black";
    return color;
  }
}

let finishKyuNumber = function (integer) {
  let suffix = "";
  if (integer === 1) {
    suffix = "st";
    return suffix;
  } else if (integer === 2) {
    suffix = "nd";
    return suffix;
  } else if (integer === 3) {
    suffix = "rd";
    return suffix;
  } else {
    suffix = "th";
    return suffix;
  }
};

let orderArray = [
  "Waza (techniques)",
  "Ukemi (breakfalling)",
  "Atemi (striking)",
  "Kansetsu (locks)",
  "Shime-waza (strangles)",
  "Ne-waza (groundwork)",
  "Nage-waza (throwing)",
  "~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~",
  "Henka-waza (transition techniques)",
  "Kaeshi-waza (counter techniques)",
  "Bunkai (application for defence)",
  "Miscellaneous",
];
let sortedArray = [];
// Where to put the following lines?
function groupedTechniqueTypes(technique_types) {
  const groupedEntries = _.groupBy(technique_types, "category");
  const testArray = Object.entries(groupedEntries)
    .sort((a, b) => {
      return orderArray.indexOf(a[0]) - orderArray.indexOf(b[0]);
    })
    .map((item) => item[1]);
  return testArray;
}

export class SyllabusShowPage extends React.Component {
  constructor(props) {
    super(props);
    // console.log("These are the props", props);
    this.state = {
      // Populate the list of techniques through fetching them from the server and allow the page to load
      syllabus: [],
      techniques: [],
      technique_types: [],
      belts: [],
      belts_group: [],
      rendered_techniques: [],
      rendered_technique_types: [],
      formatted_techniques: [],
      currentUser: null,
      isAdmin: false,
      isLoading: true,
    };
  }

  componentDidMount() {
    Syllabus.all({ id: 1 }).then((syllabus) => {
      // Hardcoded as 1 for now for Canada but eventually move it to be dynamic for multiple syllabi
      this.setState({
        syllabus: syllabus,
        technique_types: syllabus.technique_types,
        techniques: syllabus.techniques,
        belts: syllabus.belts,
        isLoading: false,
      });
    });
  }

  deleteTechnique(id) {
    Technique.destroy(id).then(() => {
      this.setState({
        techniques: this.state.techniques.filter((q) => q.id !== id),
      });
    });
  }

  string_to_array = function (str) {
    return str.trim().split(" ");
  };

  render() {
    const { isLoading } = this.state;
    const currentUser = this.props.user;
    const isAdmin = this.props.user.is_admin;
    if (isLoading) {
      return <div />;
    }

    const { showAll = false } = this.props;
    console.log("These are the belts" + this.state.belts);
    console.log("This is the user and whether they are an admin", currentUser);
    console.log("This is whether the user is an admin", isAdmin);
    console.log(
      "these are the rendered technique types",
      this.state.rendered_technique_types
    );
    console.log("this is the syllabus, is it", this.state.syllabus);
    console.log("These are the belts" + this.state.belts);

    return (
      <main className="SyllabusShowPage">
        <br />
        <div className="central">
          <h2 style={{ display: "flex", justifyContent: "center" }}>
            SYLLABUS
          </h2>
          <br />
          <div id="logoBox">
            {/* Uncomment when this image (and the whole page!) can use SCSS correctly: */}
            {/* <img src={jc_logo} alt="jitsuCanadaLogo" id="jcLogo"/> */}
          </div>

          {this.state.belts
            .reverse()
            .filter((belt) => belt.id !== 8)
            .map((belt) => (
              <>
                <br />
                <h1
                  style={{
                    fontWeight: "bold",
                    textDecorationLine: "underline",
                    textDecorationSkipInk: "none",
                    display: "flex",
                    justifyContent: "center",
                    backgroundColor: belt.colour.replace(/ +/g, ""),
                    color: textColour(belt.id),
                    pointerEvents: "none",
                  }}
                >
                  {belt.id +
                    finishKyuNumber(belt.id) +
                    " Kyu (" +
                    capitaliseTheFirstLetterOfEachWord(belt.colour) +
                    ")"}
                </h1>

                {groupedTechniqueTypes(belt.technique_types).map(
                  (key, index) => (
                    <div key={index}>
                      {key[0].category === "Waza (techniques)" ? (
                        <>
                        <div
                          className="underline-me"
                          style={{
                            fontWeight: "bold",
                            fontStyle: "italic",
                            textDecorationLine: "underline",
                            textDecorationSkipInk: "none",
                          }}
                        >
                          {"Waza (techniques)"}
                          </div>
                          <div>
                            {belt.id === 7 ? (
                              <div></div>
                            ) : (
                              <div>
                                <br />

                                {"All previous syllabus."}
                              </div>

                            )}
                          </div>
                          </>
                      ) : key[0].category ===
                        "~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~" ? (
                        <>
                          <br />
                          <div
                            style={{
                              fontWeight: "bold",
                              fontStyle: "italic",
                              textAlign: "center",
                            }}
                          >
                            {"~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~"}
                          </div>
                        </>
                      ) : key[0].category ===
                        "Bunkai (application for defence)" ? (
                        <div
                          style={{
                            fontWeight: "bold",
                            fontStyle: "italic",
                            textDecorationLine: "underline",
                            textDecorationSkipInk: "none",
                          }}
                        >
                          {"Bunkai (application for defence):"}
                        </div>
                      ) : key[0].category ===
                        "Henka-waza (transition techniques)" ? (
                        <div
                          style={{
                            fontWeight: "bold",
                            fontStyle: "italic",
                            textDecorationLine: "underline",
                            textDecorationSkipInk: "none",
                          }}
                        >
                          {"Henka-waza (transition techniques):"}
                        </div>
                      ) : key[0].category ===
                        "Kaeshi-waza (counter techniques)" ? (
                        <div
                          style={{
                            fontWeight: "bold",
                            fontStyle: "italic",
                            textDecorationLine: "underline",
                            textDecorationSkipInk: "none",
                          }}
                        >
                          {"Kaeshi-waza (counter techniques):"}
                        </div>
                      ) : key[0].category === "Miscellaneous" ? (
                        <div></div>
                      ) : (
                        <div
                          style={{ fontWeight: "bold", fontStyle: "italic" }}
                        >
                          {key[0].category + ":"}
                        </div>
                      )}
                      <br />

                      {key.map((technique_type) => {
                        return (
                          <div key={technique_type.id}>
                            {belt.techniques
                              .filter(
                                (technique) =>
                                  technique.technique_type_id ===
                                  technique_type.id
                              )
                              .map((element) => {
                                console.log(
                                  "This is the technique we want",
                                  element
                                );
                                return (
                                  <div
                                    key={element.id}
                                    className="techniqueBox"
                                    id="techniqueBox"
                                    style={{
                                      borderBottom: "1px solid",
                                      borderTop: "1px solid",
                                      borderLeft: "1px solid",
                                      borderRight: "1px solid",
                                      paddingLeft: "1rem",
                                      paddingTop: "0.5rem",
                                    }}
                                  >
                                    <Link
                                      to={`/techniques/${element.id}`}
                                      key={element.id}
                                      id="techniqueLink"
                                      style={{ paddingLeft: 0, paddingTop: 0 }}
                                    >
                                      {element.summary}
                                    </Link>
                                    <div>{technique_type.sub_category}</div>

                                    {isAdmin ? (
                                      <>
                                        {element.is_different ? (
                                          <>
                                            <br />
                                            {
                                              <p style={{ fontWeight: "bold" }}>
                                                What's different to the UK
                                                syllabus?
                                              </p>
                                            }
                                            {element.difference_content}
                                            <br />
                                          </>
                                        ) : (
                                          <></>
                                        )}
                                      </>
                                    ) : (
                                      <></>
                                    )}
                                    {isAdmin ? (
                                      <p>
                                        Posted on{" "}
                                        {moment(element.created_at).format(
                                          "MMM Do, YYYY"
                                        )}
                                      </p>
                                    ) : (
                                      <br />
                                    )}
                                  </div>
                                );
                              })}
                            <br />

                            {technique_type.category === "Waza (techniques)" ? (
                              <span></span>
                            ) : technique_type.category ===
                              "~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~" ? (
                              <span></span>
                            ) : (
                              <></>
                            )}
                            <div>{technique_type.techniques_id}</div>
                            <br />
                          </div>
                        );
                      })}
                    </div>
                  )
                )}

                {/* The following button should only be visible to admins, and it may be preferential to turn it off even for them once all techniques are recorded such that the syllabus is complete*/}

                {isAdmin ? (
                  <>
                    <Button
                      variant="success"
                      style={{ paddingLeft: 10, paddingRight: 10 }}
                      href={`/technique/new`}
                    >
                      Add New Technique
                    </Button>
                    <br />
                    <br />
                  </>
                ) : (
                  <></>
                )}
              </>
            ))}
        </div>

        <br />
        <div
          className="ui list"
          style={{
            listStyle: "none",
            paddingLeft: 0,
          }}
        ></div>
      </main>
    );
  }
}