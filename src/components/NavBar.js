// import React from "react";
// // import { NavLink } from "react-router-dom";
// import "../App.scss";
import tuff_logo from "../img/tuff-city-logo-no-background.png";
// import { Navbar, Nav, Container, Row } from "react-bootstrap";
// import { getCountryAdjective } from "../utils/countryHelpers";
// // import {useFonts, Anton_400Regular } from '@expo-google-fonts/anton'
// // TODO: Try to get that working for NavBar font

// // We should add new students (this will be the current What is Jiu Jitsu page) and then repurpose the link for What is Jiu Jitsu to be an explanation of jiu jitsu and history
// // import { NavItem, NavDropdown, MenuItem } from 'react-bootstrap';

// // TODO: Apply Tailwind CSS to NavBar for better styling and use Sans-Serif font for better readability: done, but confirm that everything is ported over

// function NavBar(props) {
//   const { currentUser, onSignOut, primarySyllabus } = props;
//   console.log("Testing if we've received currentUser in NavBar:", currentUser);
//   const handleSignOutClick = (event) => {
//     event.preventDefault();
//     console.log("Sign out clicked"); // Log the click for debugging
//     if (typeof onSignOut === "function") {
//       onSignOut();
//     }

//     console.log(props);
//   };

//   // console.log("Who is current user?", typeof currentUser.is_admin != "undefined");

//   let syllabusLink = null;

//   if (currentUser && primarySyllabus) {
//     const countryAdjective = getCountryAdjective(primarySyllabus.country);
//     const year = primarySyllabus.year;
//     const syllabusId = primarySyllabus.id;

//     const linkText = `${year} ${countryAdjective} Syllabus`;
//     // Assumes the link structure for user syllabus view is: /syllabi/:id/user_grade_syllabus
//     const linkUrl = `/syllabi/${syllabusId}/user_grade_syllabus`;

//     // syllabusLink = (
//     //     <Nav.Link className="nav-link" href={linkUrl}>
//     //         {linkText}
//     //     </Nav.Link>
//     // );
//     syllabusLink = (
//       <Nav.Link className="nav-link" href={linkUrl}>
//         <span style={{ color: "#007bff", fontWeight: "bold" }}>
//           {/* TODO: Maybe colour code the syllabi, alternatively leave it as it is because blue is a good primary colour */}
//           {linkText}
//         </span>
//       </Nav.Link>
//     );
//   }

//   return (
//     <Navbar
//       id="navbar"
//       className="navbar"
//       style={{ display: "flex", fontFamily: "Anton_400Regular" }}
//     >
//       <Container id="nav-container" className="nav-container" style={{ flexDirection: "row" }}>
//         {/* <Row xs={1} md={4} lg={12}> */}
//         {/* <Navbar.Brand className="gettingAround" id="gettingAround" href="/">
//           Getting Around
//         </Navbar.Brand> */}
//         {/* Use flex to ensure the image and other elements fit in nicely */}
//         <Navbar.Brand className="gettingAround" id="gettingAround" href="/">
//           <img
//             style={{
//               display: "flex",
//               width: 90,
//               height: 90,
//               marginTop: "-3.2rem",
//               marginLeft: "-16.4rem",
//             }}
//             src={tuff_logo}
//             alt="clublogo"
//           />
//         </Navbar.Brand>

//         <Nav className="me-auto">
//           <Nav.Link className="nav-link" href="/">
//             Home
//           </Nav.Link>
//           {/* <Nav.Link href="/posts">Blog</Nav.Link> */}
//           <Nav.Link className="nav-link" href="/whatisjiujitsu">
//             What Is Jiu Jitsu?
//           </Nav.Link>
//           <Nav.Link className="nav-link" href="/profiles">
//             Who Are We?
//           </Nav.Link>
//           <Nav.Link className="nav-link" href="/waiver/new">
//             Create Waiver
//           </Nav.Link>

//           {/* {typeof currentUser.is_admin != "undefined" ? (
//           <>
//           <Nav.Link className="nav-link" href="/waiver/new">
//             Create Waiver
//           </Nav.Link>
//           </>
//         ) : (
//           <></>
//         )} */}

//           {currentUser ? (
//             <>
//               {syllabusLink}
//               {/* TODO: Later, user preferences can possibly be set for which syllabus to study if we deem that good business logic */}
//               {currentUser?.is_admin ? (
//                 <Nav.Link className="nav-link" href="/technique/new">
//                   Add Techniques To Syllabus
//                 </Nav.Link>
//               ) : (
//                 <div></div>
//               )}
//               {/* <Nav.Link href="/syllabus/mindmap">Mindmap For Syllabus</Nav.Link> */} */}
//               {/* <Nav.Link href="/events">Events</Nav.Link> */}
//               <>
//                 <Nav.Link className="nav-link" href="/" onClick={handleSignOutClick}>
//                   Sign Out
//                 </Nav.Link>
//                 {currentUser.is_admin && <Nav.Link href="/admin">Admin Page</Nav.Link>}
//               </>
//               <Nav.Link
//                 className="nav-link"
//                 className="item"
//                 style={{ color: "green", pointerEvents: "none" }}
//               >
//                 Welcome {currentUser.first_name} !
//               </Nav.Link>
//             </>
//           ) : (
//             <React.Fragment>
//               {/* Uncomment this block to debut the sign in/up features when we're ready for them */}
//               <Nav.Link className="nav-link" href="/sign_in">
//                 Sign In
//               </Nav.Link>
//               <Nav.Link className="nav-link" href="/sign_up">
//                 Sign Up
//               </Nav.Link>
//             </React.Fragment>
//           )}
//         </Nav>
//         {/* </Row> */}
//       </Container>
//     </Navbar>
//   );
// }
// export default NavBar;

import React from "react";
import { getCountryAdjective } from "../utils/countryHelpers";
// Removed react-bootstrap imports and local SCSS import

// The following imports are assumed to be available for styling, but are now unnecessary
// import { Navbar, Nav, Container, Row } from "react-bootstrap";
// import "../App.scss";
// import {useFonts, Anton_400Regular } from '@expo-google-fonts/anton'

function NavBar(props) {
  const { currentUser, onSignOut, primarySyllabus } = props;
  console.log("Testing if we've received currentUser in NavBar:", currentUser);

  const handleSignOutClick = (event) => {
    event.preventDefault();
    console.log("Sign out clicked");
    if (typeof onSignOut === "function") {
      onSignOut();
    }
    console.log(props);
  };

  let syllabusLink = null;

  if (currentUser && primarySyllabus) {
    const countryAdjective = getCountryAdjective(primarySyllabus.country);
    const year = primarySyllabus.year;
    const syllabusId = primarySyllabus.id;

    const linkText = `${year} ${countryAdjective} Syllabus`;
    // Assumes the link structure for user syllabus view is: /syllabi/:id/user_grade_syllabus
    const linkUrl = `/syllabi/${syllabusId}/user_grade_syllabus`;

    // Converted Nav.Link to standard <a> tag with Tailwind styling
    syllabusLink = (
      <a
        href={linkUrl}
        className="text-blue-400 hover:text-blue-200 px-3 py-2 rounded-md text-sm font-bold transition duration-150 ease-in-out"
      >
        {linkText}
      </a>
    );
  }

  // Define a common class for non-highlighted navigation links
  const baseLinkClasses =
    "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out";

  return (
    // Converted Navbar to <nav> with Tailwind styles for dark background, shadow, and sans-serif font
    <nav
      id="navbar"
      className="bg-gray-800 shadow-lg font-sans"
      style={{ display: "flex" }} // Keep original flex layout
    >
      {/* Converted Container to a centered, responsive <div> */}
      <div
        id="nav-container"
        className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-row justify-between items-center h-20"
      >
        {/* Logo/Brand section: Adjusting image positioning for a cleaner flex layout */}
        <div className="flex-shrink-0">
          <a href="/" className="flex items-center space-x-2">
            <img
              // Constrain within navbar; slightly smaller for balance
              className="h-16 w-auto max-h-20 object-contain" // stays within the 5rem navbar height
              src={tuff_logo}
              alt="club logo"
            />
          </a>
        </div>

        {/* Main Navigation Links section */}
        <div className="flex items-center">
          <div className="flex space-x-4">
            <a href="/" className={baseLinkClasses}>
              Home
            </a>
            <a href="/whatisjiujitsu" className={baseLinkClasses}>
              What Is Jiu Jitsu?
            </a>
            <a href="/profiles" className={baseLinkClasses}>
              Who Are We?
            </a>
            <a href="/waiver/new" className={baseLinkClasses}>
              Create Waiver
            </a>

            {currentUser ? (
              <>
                {syllabusLink}

                {currentUser?.is_admin && (
                  <a href="/technique/new" className={baseLinkClasses}>
                    Add Techniques To Syllabus
                  </a>
                )}

                {/* Sign Out and Admin Links */}
                <a href="/" onClick={handleSignOutClick} className={baseLinkClasses}>
                  Sign Out
                </a>

                {currentUser.is_admin && (
                  <a href="/admin" className={baseLinkClasses}>
                    Admin Page
                  </a>
                )}

                {/* Welcome Message */}
                <span
                  className="text-green-400 cursor-default px-3 py-2 text-sm font-medium whitespace-nowrap"
                  style={{ pointerEvents: "none" }} // Retain original pointer-events style
                >
                  Welcome {currentUser.first_name} !
                </span>
              </>
            ) : (
              <React.Fragment>
                {/* Sign In/Up Features */}
                <a href="/sign_in" className={baseLinkClasses}>
                  Sign In
                </a>
                <a href="/sign_up" className={baseLinkClasses}>
                  Sign Up
                </a>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
