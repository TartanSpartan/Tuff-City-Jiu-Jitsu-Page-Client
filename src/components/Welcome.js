import React from "react";
import tuff_logo from '../img/tuff_logo.jpg';
import wide_logo from '../img/wide_logo.png';
import { InstagramEmbed } from 'react-social-media-embed';
import { Box } from "./FooterStyles";
import "../App.scss";



export class Welcome extends React.Component {
    constructor(props) {
      super(props);
      this.state = {};
    }
  
    render() {
      return (
        <main 
        className="Welcome"
        >

          <h1 className="grabber" style={{fontFamily: "arial"}}>
          Tuff City Jiu Jitsu: Teaching practical self defence in Tofino in a safe and supportive environment since 2018

          {/* Work in progress for that motto */}
          </h1>
          <br/>
            
          {/* <div 
          style={{ display: "flex", flexDirection: "row", justifyContent: "center", flexGrow: "1", margin: "0", padding: "0"}}
          > */}
          {/* <div> */}
          <div className="img-fluid">
          <a href='/profiles'><img id="heroImage" src={wide_logo} alt="widelogo" /></a>
          </div>
          {/* </div> */}
          {/* Get this looking good on wide page widths too! TA question           // background: "yellow", width: "100%", backgroundSize: "cover", position: "relative", backgroundPosition:"center" */}

        {/* </div> */}

          <Box style=
          {{ 
            background: "yellow",
            width: "100%",
            // backgroundSize: "170% auto",
            // position: "relative",
            marginTop: "1rem",
            // paddingLeft: "-22rem"
          }}
            >

          {/* Properly stretch that box, and the image above it, with no white space off to the margins, ask TA */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: 'center'}}>
            {/* <h1 style={{ fontFamily: "arial black", minWidth: "0" }}>
            Welcome to our website! If you would like to train with us, please fill out the&nbsp;{<a href={('waiver')}>waiver</a>}&nbsp;here
            before your first session.

            Add some operating info with key words
            </h1> */}
            <h1 className="grabber" style={{fontFamily: "arial"}}>
            Welcome to our website! If you would like to train
            </h1>
            <h1 className="grabber" style={{fontFamily: "arial"}}>
            with us, please fill out the&nbsp;{<a href={('waiver/new')}>waiver</a>}&nbsp;here before your
            </h1>
            <h1 className="grabber" style={{fontFamily: "arial"}}>
            first session.
            </h1>
            <br/>
            <h1 className="grabber" style={{fontFamily: "arial"}}>
            Signing up to this site is optional, and encouraged, but by no means mandatory.
            </h1>
            
          </div>
          </Box>
          <br/>
          <br/>
        </main>
      );
    }
  }