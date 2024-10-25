import React, { Component } from "react";
import { Waiver } from "../requests";
import Form from "react-bootstrap/Form";
import ShowWaiverForm from "./ShowWaiverForm";

import "../App.scss";

export default class WaiverShowPage extends Component {
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
        console.log(
          "These are the state values for the waiver update",
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



    // console.log("These are the waiver props FROM THE PAGE", props);

  
      // componentDidMount = () => {
      //   console.log("This is isAuthenticated", this.props.isAuthenticated);
      //   console.log("This is the props", this.props);
      // }
    
  
      render() {
        return (
          <main>
          <ShowWaiverForm
              waiver={this.state.waiver}
              key={this.state.id}
              isAuthenticated={this.props.isAuthenticated}
            //   onSubmit={this.updatePostRequest}
            //   onCancel={this.props.handleCancelClick}
              errors={this.state.errors}
          />
          </main>
        );
      }
    }