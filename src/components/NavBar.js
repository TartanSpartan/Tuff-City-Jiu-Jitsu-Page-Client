import React from "react";
// import { NavLink } from "react-router-dom";
import "../App.scss";
import tuff_logo from '../img/tuff-city-logo-no-background.png';
import { Navbar, Nav, Container, Row } from "react-bootstrap";
// import {useFonts, Anton_400Regular } from '@expo-google-fonts/anton'
// Try to get that working for NavBar font

// We should add new students (this will be the current What is Jiu Jitsu page) and then repurpose the link for What is Jiu Jitsu to be an explanation of jiu jitsu and history
// import { NavItem, NavDropdown, MenuItem } from 'react-bootstrap';

function NavBar(props) {
  const { currentUser, onSignOut } = props;
  console.log("Testing if we've received currentUser in NavBar:", currentUser);
  const handleSignOutClick = (event) => {
    event.preventDefault();
    console.log("Sign out clicked"); // Log the click for debugging
    if (typeof onSignOut === "function") {
      onSignOut();
    }

    console.log(props);
  };

  // console.log("Who is current user?", typeof currentUser.is_admin != "undefined");

  return (
    <Navbar id="navbar" className="navbar" style={{ display: "flex", fontFamily: "Anton_400Regular"}}>
      <Container id="nav-container" className="nav-container" style={{ flexDirection: "row"}}>
      {/* <Row xs={1} md={4} lg={12}> */}
        {/* <Navbar.Brand className="gettingAround" id="gettingAround" href="/">
          Getting Around
        </Navbar.Brand> */}
        {/* Use flex to ensure the image and other elements fit in nicely */}
        <Navbar.Brand className="gettingAround" id="gettingAround" href='/'><img style={{ display: "flex", width: 90, height: 90, marginTop: "-3.2rem", marginLeft: "-16.4rem" }} src={tuff_logo} alt="clublogo" /></Navbar.Brand>

        <Nav className="me-auto">
          <Nav.Link className="nav-link" href="/">
            Home
          </Nav.Link>
          {/* <Nav.Link href="/posts">Blog</Nav.Link> */}
          <Nav.Link className="nav-link" href="/whatisjiujitsu">
            What Is Jiu Jitsu?
          </Nav.Link>
          <Nav.Link className="nav-link" href="/profiles">
            Who Are We?
          </Nav.Link>
          <Nav.Link className="nav-link" href="/waiver/new">
            Create Waiver
          </Nav.Link>

        {/* {typeof currentUser.is_admin != "undefined" ? (
          <>
          <Nav.Link className="nav-link" href="/waiver/new">
            Create Waiver
          </Nav.Link>
          </>
        ) : (
          <></>
        )} */}

          {currentUser ? (
            <>
              {/* <Nav.Link className="nav-link" href="/syllabus">
                Syllabus
              </Nav.Link>
              {currentUser?.is_admin ? (
                <Nav.Link className="nav-link" href="/technique/new">
                  Add Techniques To Syllabus
                </Nav.Link>
              ) : (
                <div></div>
              )}
              <Nav.Link href="/syllabus/mindmap">Mindmap For Syllabus</Nav.Link> */}
              {/* <Nav.Link href="/events">Events</Nav.Link> */}
              <>
              <Nav.Link className="nav-link" href="/" onClick={handleSignOutClick}>
                Sign Out
              </Nav.Link>
              {currentUser.is_admin && (
                  <Nav.Link href="/admin">Admin Page</Nav.Link>
                )}
                </>


              {/* <Nav.Link
                className="nav-link"
                className="item"
                style={{ color: "green", pointerEvents: "none" }}
              >
                Welcome {currentUser.full_name}
              </Nav.Link> */}
            </>
          ) : (
            <React.Fragment>
              {/* Uncomment this block to debut the sign in/up features when we're ready for them */}
              <Nav.Link className="nav-link" href="/sign_in">
                Sign In
              </Nav.Link>
              <Nav.Link className="nav-link" href="/sign_up">
                Sign Up
              </Nav.Link>
            </React.Fragment>
          )}
        </Nav>
        {/* </Row> */}
      </Container>
    </Navbar>
  );
}
export default NavBar;