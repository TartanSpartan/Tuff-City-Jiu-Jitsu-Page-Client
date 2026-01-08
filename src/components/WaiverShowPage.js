import React, { Component } from "react";
// import { Waiver } from "../requests"; // Using direct fetch for status-aware auth enforcement
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
        relationship: "",
      },
      isLoading: true,
      errors: false,
    };
    this.redirectTimeout = null;
    console.log("These are the state values for the waiver update", this.state.technique);
  }

  componentWillUnmount() {
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
      this.redirectTimeout = null;
    }
  }

  componentDidMount() {
    const {
      match: {
        params: { id },
      },
      history,
    } = this.props;

    // Fetch waiver directly so we can inspect HTTP status for auth enforcement
    fetch(`${process.env.REACT_APP_BASE_URL}/waivers/${id}`, { credentials: "include" })
      .then(async (res) => {
        // Handle unauthorized (403)
        if (res.status === 403) {
          console.error("Unauthorized waiver access attempt (403). Redirecting home.");
          this.setState({ isLoading: false, unauthorized: true });
          this.redirectTimeout = setTimeout(() => {
            history.push("/", {
              alert: {
                type: "danger",
                message: "You are not authorized to view that waiver.",
              },
            });
          }, 1200);
          return null;
        }
        // Handle not found (404)
        if (res.status === 404) {
          console.warn("Waiver not found (404). Redirecting to not-found page.");
          this.setState({ isLoading: false, notFound: true });
          this.redirectTimeout = setTimeout(() => {
            history.push("/not-found");
          }, 1200);
          return null;
        }
        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `Failed to fetch waiver. Status: ${res.status}. Body: ${text.substring(0, 140)}...`
          );
        }
        const data = await res.json();
        this.setState({ waiver: data, isLoading: false });
        return data;
      })
      .catch((err) => {
        console.error("Error fetching waiver:", err);
        this.setState({ errors: true, isLoading: false });
      });
  }

  // console.log("These are the waiver props FROM THE PAGE", props);

  // componentDidMount = () => {
  //   console.log("This is isAuthenticated", this.props.isAuthenticated);
  //   console.log("This is the props", this.props);
  // }

  render() {
    const { isLoading, unauthorized, notFound } = this.state;
    if (isLoading) {
      return <div>Loading waiver…</div>;
    }
    if (unauthorized) {
      // Brief flash; user is being redirected
      return <div>Redirecting…</div>;
    }
    if (notFound) {
      return <div>Redirecting…</div>;
    }
    return (
      <main>
        <ShowWaiverForm
          waiver={this.state.waiver}
          key={this.state.id}
          isAuthenticated={this.props.isAuthenticated}
          errors={this.state.errors}
        />
      </main>
    );
  }
}
