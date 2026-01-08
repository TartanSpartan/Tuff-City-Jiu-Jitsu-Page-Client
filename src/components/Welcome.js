import React from "react";
import { withRouter } from "react-router-dom";
import tuff_logo from "../img/tuff_logo.jpg";
import wide_logo from "../img/wide_logo.png";
import { InstagramEmbed } from "react-social-media-embed";
import { Box } from "./FooterStyles";
import "../App.scss";

export class Welcome extends React.Component {
  constructor(props) {
    super(props);
    this.state = { inlineAlert: null };
  }

  componentDidMount() {
    const alert =
      this.props.location && this.props.location.state && this.props.location.state.alert;
    if (alert) {
      this.setState({ inlineAlert: alert });
      // Clear the alert state in history to avoid re-showing on back/forward
      const { history, location } = this.props;
      if (history && location) {
        const cleanState = { ...location.state };
        delete cleanState.alert;
        history.replace({ ...location, state: cleanState });
      }
      // Auto-hide after 5s
      this._alertTimer = setTimeout(() => {
        this.setState({ inlineAlert: null });
      }, 5000);
    }
  }

  componentWillUnmount() {
    if (this._alertTimer) {
      clearTimeout(this._alertTimer);
      this._alertTimer = null;
    }
  }

  render() {
    return (
      <main className="Welcome">
        {this.state.inlineAlert && (
          <div
            role="alert"
            style={{
              margin: "1rem 0",
              padding: "0.75rem 1rem",
              borderRadius: "0.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
              color: this.state.inlineAlert.type === "danger" ? "#842029" : "#084298",
              backgroundColor: this.state.inlineAlert.type === "danger" ? "#f8d7da" : "#cfe2ff",
              border:
                this.state.inlineAlert.type === "danger"
                  ? "1px solid #f5c2c7"
                  : "1px solid #b6d4fe",
            }}
          >
            <span>{this.state.inlineAlert.message}</span>
            <button
              aria-label="Dismiss alert"
              title="Dismiss"
              onClick={() => this.setState({ inlineAlert: null })}
              style={{
                border:
                  this.state.inlineAlert.type === "danger"
                    ? "1px solid #842029"
                    : "1px solid #084298",
                background: this.state.inlineAlert.type === "danger" ? "#f1aeb5" : "#bfd6ff",
                color: this.state.inlineAlert.type === "danger" ? "#58151c" : "#052c65",
                cursor: "pointer",
                fontWeight: 700,
                lineHeight: 1,
                width: "2rem",
                height: "2rem",
                borderRadius: "9999px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>
        )}
        <h1 className="grabber" style={{ fontFamily: "arial" }}>
          Tuff City Jiu Jitsu: Teaching practical self defence in Tofino in a safe and supportive
          environment since 2018
          {/* Work in progress for that motto */}
        </h1>
        <br />

        {/* <div 
          style={{ display: "flex", flexDirection: "row", justifyContent: "center", flexGrow: "1", margin: "0", padding: "0"}}
          > */}
        {/* <div> */}
        <div className="img-fluid">
          <a href="/profiles">
            <img id="heroImage" src={wide_logo} alt="widelogo" />
          </a>
        </div>
        {/* </div> */}
        {/* Get this looking good on wide page widths too! TA question           // background: "yellow", width: "100%", backgroundSize: "cover", position: "relative", backgroundPosition:"center" */}

        {/* </div> */}

        <Box
          style={{
            background: "yellow",
            width: "100%",
            // backgroundSize: "170% auto",
            // position: "relative",
            marginTop: "1rem",
            // paddingLeft: "-22rem"
          }}
        >
          {/* Properly stretch that box, and the image above it, with no white space off to the margins, ask TA */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {/* <h1 style={{ fontFamily: "arial black", minWidth: "0" }}>
            Welcome to our website! If you would like to train with us, please fill out the&nbsp;{<a href={('waiver')}>waiver</a>}&nbsp;here
            before your first session.

            Add some operating info with key words
            </h1> */}
            <h1 className="grabber" style={{ fontFamily: "arial" }}>
              Welcome to our website! If you would like to train
            </h1>
            <h1 className="grabber" style={{ fontFamily: "arial" }}>
              with us, please fill out the&nbsp;{<a href={"waiver/new"}>waiver</a>}&nbsp;here before
              your
            </h1>
            <h1 className="grabber" style={{ fontFamily: "arial" }}>
              first session.
            </h1>
            <br />
            <h1 className="grabber" style={{ fontFamily: "arial" }}>
              Signing up to this site is optional, and encouraged, but by no means mandatory.
            </h1>
          </div>
        </Box>
        <br />
        <br />
      </main>
    );
  }
}

export default withRouter(Welcome);
