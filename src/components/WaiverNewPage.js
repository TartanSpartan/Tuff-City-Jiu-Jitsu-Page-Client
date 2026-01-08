import React, { Component } from "react";
import { Waiver } from "../requests"; // Can try to pass User down to the NewWaiverForm component
import NewWaiverForm from "./NewWaiverForm";
import "../App.scss";

export default class WaiverNewPage extends Component {
  state = {
    errors: [],
    successMessage: null,
  };

  // componentDidMount = () => {
  //   console.log("This is isAuthenticated", this.props.isAuthenticated);
  //   console.log("This is the props", this.props);
  // }

  createWaiver = (params, csrfToken) => {
    // event.preventDefault();
    this.setState({ errors: [], successMessage: null });
    console.log("These are the props when we create the waiver", this.props);
    return Waiver.create(params, csrfToken)
      .then((waiver) => {
        console.log("$$$$$$$$$", waiver);
        if (waiver.errors) {
          this.setState({ errors: waiver.errors });
          console.error("Waiver submission failed due to validation errors:", waiver.errors);
          // Reject with an object shaped like an Axios error so callers can inspect `error.response.data`
          return Promise.reject({ response: { data: waiver } });
        } else {
          // Success (200/201 response)
          console.log("Waiver created successfully! ID:", waiver.id);

          this.setState({ successMessage: "Waiver created successfully! Redirecting..." });

          // Use setTimeout for a smooth transition after success message
          setTimeout(() => {
            this.props.history.push(`/waivers/${waiver.id}`);
          }, 1500); // 1.5 second delay before redirect

          return waiver; // Resolve with the waiver object
        }
      })
      .catch((error) => {
        // This handles network errors or explicit Promise.reject from above
        console.error("API call error in createWaiver:", error);
        // If the error isn't a validation error, show a generic failure message
        if (!this.state.errors.length) {
          this.setState({
            errors: [{ message: "A network or server error occurred. Please try again." }],
          });
        }
        return Promise.reject(error); // Re-throw/reject the error
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
