import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Technique, TechniqueType, Video } from "../requests";
import UpdateTechniqueForm from "./UpdateTechniqueForm";
import "../App.scss";

export default class TechniqueUpdatePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      technique: {
        summary: "",
        is_different: false,
        difference_content: "",
        videourls: [],
        videos: {
          canadianUrl: "",
          britishUrl: "",
        },
        technique_type_id: 0,
      },
      technique_type: [],
      belt: [],
      isLoading: true,
      errors: false,
    };
    console.log(
      "These are the state values for the technique update",
      this.state.technique
    );
  }

  componentDidMount() {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    const {
      videos,
      videourls,
      setVideos,
      syllabus,
      belt,
      summary,
      category,
      sub_category,
      is_different,
      difference_content,
    } = this.state;
    // console.log("These are the params", this.props)
    Technique.one(this.props.match.params.id)
      .then(
        (technique) =>
          Promise.all([
            technique,
            Video.group(technique.id),
            TechniqueType.find(technique.technique_type_id),
          ])
        // this.setState({
        //   technique: technique,
        //   videourls: technique.videourls,
        //   isLoading: false,
        // });
        // console.log("Is the videourl inside the technique?", technique)
        // console.log("What are the props?", this.props)
        // return technique;
      )
      .then(([technique, video, technique_type]) => {
        //
        console.log(video);
        this.setState({
          isLoading: false,
          technique: technique,
          technique_type: technique_type,
          video: video,
        });
        console.log("Check the video", video);
        return technique;
      });
    // .then((technique) => TechniqueType.find(technique.technique_type_id))
    // .then((technique_type) =>
    //   this.setState({
    //     technique_type: technique_type,
    //     isLoading: false,
    //     errors: false,
    //   })
    // )
    // console.log("Does this work?", Video.find(technique.videourls))
    // .then((technique) => Video.find(technique.videourls[0])) // How do you account for a videourl array of N-size?
    // .then((videos) =>
    //   this.setState({
    //     videos: videos,
    //     isLoading: false,
    //     errors: false,
    //   }),
    //   console.log("What are the props?", this.props),
    //   console.log("Is the video inside the state?", this.state.videos),
    // );
  }

  updateColorBox = (event) => {
    this.setState((state) => {
      state.technique.belt_id = event.target.value;
    });
    this.forceUpdate();
  };

  updateCategoryBox = (event) => {
    this.setState((state) => {
      state.technique_type.category = event.target.value;
    });
    this.forceUpdate();
  };

  updateDifferentBox = (event) => {
    this.setState((state) => {
      state.technique.is_different = event.target.value;
    });
    this.forceUpdate();
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

  // Fix this one to remove fetch request and avoid duplication of work
  updatePostRequest = (data) => {
    // console.log("this is the technique.id", this.state.technique.id)
    // console.log(this.simpleStringify(event));
    // console.log("This is the event", event);
    // console.log("This is the event's current target", event.currentTarget);
    // console.log("This is the event.target", event.target)
    // const formData = new FormData(event.target)
    // console.log("This is the formData", formData)
    // const formDataObj = Object.fromEntries(formData.entries())
    // console.log("New test", formDataObj)

    Technique.update(this.state.technique.id, data).then((technique) => {
      console.log(technique);
      this.props.history.push(`/syllabus#/`);
      if (technique.errors) {
        this.setState({ errors: technique.errors });
      } else {
        // console.log("This is the history", this.props.history)
        this.props.history.push(`/syllabus`);
      }
    });
  };

  render() {
    return (
      <main>
        <div className="central">
          <h1>EDIT A TECHNIQUE</h1>
        </div>
        <br />
        {this.state.video && (
          <UpdateTechniqueForm
            technique={this.state.technique}
            technique_type={this.state.technique_type}
            videos={this.state.video}
            key={this.state.id}
            onSubmit={this.updatePostRequest}
            onCancel={this.props.handleCancelClick}
            errors={this.state.errors}
            changeSelectColorHandler={this.updateColorBox.bind(this)}
            changeSelectCategoryHandler={this.updateCategoryBox.bind(this)}
            changeSelectDifferentHandler={this.updateDifferentBox.bind(this)}
          />
        )}
      </main>
    );
  }
}