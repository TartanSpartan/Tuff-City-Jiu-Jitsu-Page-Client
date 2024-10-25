import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Waiver } from "../requests";
import UpdateWaiverForm from "./UpdateWaiverForm";
import "../App.scss";

// TODO: Fix "can't refresh" error or is this "can't click" error?

export default class WaiverUpdatePage extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        waiver: {
            initials: "",
            participant_name: "",
            participant_address: "",
            participant_signature: "",
            organization_witness_name: "",
            organization_witness_signature: "",
            participant_date_of_birth: "",
            participant_email_address: "", 
            participant_phone: "", 
            emergency_contact_name: "", 
            emergency_contact_number: "", 
            relationship: ""
        },
        isLoading: true,
        errors: false,
      };
      // console.log(
      //   "These are the state values for the waiver update",
      //   this.state.technique
      // );
    }
  
    componentDidMount() {
      const {
        match: {
          params: { id },
        },
      } = this.props;
      const {
        initials,
        participant_name,
        participant_address,
        participant_signature,
        organization_witness_name,
        organization_witness_signature,
        // signedToday,
        participant_date_of_birth,
        participant_email_address,
        participant_phone,
        emergency_contact_name,
        emergency_contact_number,
        relationship
      } = this.state;
      // console.log("These are the params", this.props)
      Waiver.one(this.props.match.params.id)
        .then(
          (waiver) =>
            Promise.all([
              waiver
            ])
        )
        .then(([waiver]) => {
          //
          this.setState({
            isLoading: false,
            waiver: waiver,
          });
          console.log("Check the waiver", waiver);
          return waiver;
        });
    }
  
    // updateColorBox = (event) => {
    //   this.setState((state) => {
    //     state.technique.belt_id = event.target.value;
    //   });
    //   this.forceUpdate();
    // };
  
    // updateCategoryBox = (event) => {
    //   this.setState((state) => {
    //     state.technique_type.category = event.target.value;
    //   });
    //   this.forceUpdate();
    // };
  
    // updateDifferentBox = (event) => {
    //   this.setState((state) => {
    //     state.technique.is_different = event.target.value;
    //   });
    //   this.forceUpdate();
    // };
  
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
  
      Waiver.update(this.state.waiver.id, data).then((waiver) => {
        console.log("This is the waiver to be updated", waiver);
        this.props.history.push(`/waivers/${waiver.id}`);
        if (waiver.errors) {
          this.setState({ errors: waiver.errors });
        } else {
            let ask = window.confirm("Thanks, you've updated and signed off on " + this.state.waiver.participant_name + "'s waiver! They're now ready to train when they come to class.");
            if (ask) {
              this.props.history.push(`/waivers/${waiver.id}`);
            }
        }
      });
    };
  
    render() {
      return (
        <main>
          <div className="central">
            <h1>EDIT A WAIVER</h1>
          </div>
          <br />
          
            <UpdateWaiverForm
              waiver={this.state.waiver}
              key={this.state.id}
              onSubmit={this.updatePostRequest}
              onCancel={this.props.handleCancelClick}
              errors={this.state.errors}
              isAuthenticated={this.props.isAuthenticated}
            //   changeSelectColorHandler={this.updateColorBox.bind(this)}
            //   changeSelectCategoryHandler={this.updateCategoryBox.bind(this)}
            //   changeSelectDifferentHandler={this.updateDifferentBox.bind(this)}
            />
        </main>
      );
    }
  }