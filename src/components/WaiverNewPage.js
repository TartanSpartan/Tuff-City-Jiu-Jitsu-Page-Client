import React, { Component } from "react";
import { Waiver } from "../requests"; // Can try to pass User down to the NewWaiverForm component
import NewWaiverForm from "./NewWaiverForm";
import "../App.scss";

export default class WaiverNewPage extends Component {

  state = {
    errors: []
  };

    // componentDidMount = () => {
    //   console.log("This is isAuthenticated", this.props.isAuthenticated);
    //   console.log("This is the props", this.props);
    // }

  
    createWaiver = params => {
      // event.preventDefault();
      console.log("These are the props when we create the waiver", this.props);
      Waiver.create(params).then(waiver => {
        console.log("$$$$$$$$$", waiver)
        if (waiver.errors) {
          this.setState({ errors: waiver.errors });
        } 
        else {
          let ask = window.confirm("Congratulations, you created a waiver! See you at your first class!");
          if (ask) {
            this.props.history.push(`/waivers/${waiver.id}`);
          }
        }
        console.log(params);
      });
    };

    render() {
      console.log("These are the waiver props", this.props);
      return (
        <main>
          <NewWaiverForm
            history={this.props.history}
            value={this.state.value}
            isAuthenticated={this.props.isAuthenticated}
            onSubmit={this.createWaiver}
            onCancel={this.props.handleCancelClick}
            errors={this.state.errors}
          />
        </main>
      );
    }
  }