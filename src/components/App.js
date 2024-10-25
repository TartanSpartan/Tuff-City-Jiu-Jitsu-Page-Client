import React from 'react';
import { BrowserRouter, Route, Switch, Link, HashRouter } from "react-router-dom";
import { AdminPage } from "./AdminPage";
import AuthRoute from "./AuthRoute";
import Footer from "./Footer";
import FormExample from "./FormExample";
import NavBar from "./NavBar";
import NotFoundPage from "./NotFoundPage";
import SignInPage from "./SignInPage";
import { SignUpPage } from "./SignUpPage";
import { User, Session, Technique } from "../requests";
// import { SyllabusIndexPage } from "./SyllabusIndexPage";
// import { SignatureForm } from "./SignatureForm";
import { SyllabusShowPage } from "./SyllabusShowPage";
import SyllabusMindmapPage from "./SyllabusMindmapPage";
import TechniqueNewPage from "./TechniqueNewPage";
import TechniqueShowPage from "./TechniqueShowPage";
import TechniqueUpdatePage from "./TechniqueUpdatePage";
import WaiverNewPage from "./WaiverNewPage";
import WaiverShowPage from "./WaiverShowPage";
import WaiverUpdatePage from "./WaiverUpdatePage";
import { Welcome } from "./Welcome";
import { WhatIsJiuJitsu } from "./WhatIsJiuJitsu";
import { WhoAreWe } from "./WhoAreWe";
// import TechniqueGenerationEngine from "./TechniqueGenerationEngine";

import "react-datetime/css/react-datetime.css";
import '../App.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
// import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/css/bootstrap.css';
import { useSelector, useDispatch, connect } from 'react-redux'
import { userSlice, setUser } from '../slices/userSlice';
import jwtDecode from 'jwt-decode';
import { treemapBinary } from 'd3';

// TODO: Note that for the production build we should strip all comments and print statement both here on the React client and also on the Rails API
// Also, use VSC extensions to just format the layout of the code better
// Use edging for the sides for each component based on the width of the navbar

// Install html-react-parser if we need it

// And these     "@emotion/react": "^11.11.1",
    // "@emotion/styled": "^11.11.0",
    // "@expo-google-fonts/anton": "^0.2.3",
    // "@mui/lab": "^5.0.0-alpha.140",
    // "@mui/material": "^5.14.5",
    // "@mui/styles": "^5.14.5",
    // "react-transition-group": "^1.2.1",


class App extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        loading: true,
      };
      this.signIn = this.signIn.bind(this);
    }

    signOut = () => {
        console.log("Attempting to sign out...");
        Session.destroy()
          .then(() => {
            console.log("Session destroyed, now it's time to update the state...");
            // console.log("Current state before sign out:", this.state);
            localStorage.removeItem("jwt"); // Wipe the token if the user signs out
            this.props.setUser(null); // This means in Redux, the user is cleared
            // this.setState({ currentUser: null }, () => {
            //   console.log("State after sign out:", this.state);
            //   console.log("Is the current user still active?", this.state.currentUser);
            //   console.log("Having cleared the user state, we will now remove the JWT token...");
        })
        .catch((error) => {
          console.error("Error during sign-out:", error);
        });
      };

      // getUser = () =>  {
      //   console.log("What is user?", User)
      //   console.log("Current user test", User.current())
      //   User.current()
      //   .then(data => {
      //     console.log("This is the current user as data", data)
      //     // console.log("This is the session", this.props)
      //     if (typeof data.id !== "number") {
      //       this.setState({ loading: false });
      //     } else {
      //       this.props.setUser(data);
      //       // Try to implement the loading in the store
      //       this.setState({ loading: false });
      //     }
      //     return data;
      //     // console.log("This is the current user", data)
      //   })
      //   .catch((err) => {
      //     console.log("This is the sign in error", err);
      //     this.setState({ loading: false });
      //   });
      // };

      getUser = async () =>  {
        // console.log("What is user?", User)
        // console.log("Current user test", User.current())
        try{
          const data = await User.current();
          console.log("This is the current user as data", data);
          if (data && typeof data.id === "number") {
            this.props.setUser(data); // Set user in Redux if the data is valid to allow that
          }
        } catch (err) {
          console.error("Error fetching current user:", err);
        } finally {
          this.setState({ loading: false}); // Best practice to set loading to false at the end
        }
      };  
      //   .then(data => {

      //     // console.log("This is the session", this.props)
      //     if (typeof data.id !== "number") {
      //       this.setState({ loading: false });
      //     } else {
      //       this.props.setUser(data);
      //       // Try to implement the loading in the store
      //       this.setState({ loading: false });
      //     }
      //     return data;
      //     // console.log("This is the current user", data)
      //   })
      //   .catch((err) => {
      //     console.log("This is the sign in error", err);
      //     this.setState({ loading: false });
      //   });
      // };
    
    // signIn(){
    //   const jwt = localStorage.getItem('jwt');
    //   console.log("This is jwt", jwt)
    //   if (jwt) {
    //     const payload = jwtDecode(jwt);
    //     this.setState({user: payload}); // Confirm how to set user here
    //   }
    //   console.log("This is the state after JWT", this.state);
    // }

    // If the JWT exists, then decode it and set the user in the state
    signIn() {
      const jwt = localStorage.getItem('jwt');
      if (jwt) {
        try {
          const payload = jwtDecode(jwt);
          this.props.setUser(payload); // Here we update the Redux store from the payload, to carry out setUser
          // this.setState({ currentUser: payload }, () => {
          //   console.log("Current user after setting JWT:", this.state.currentUser);
          // });
        } catch (err) {
          console.error("Error decoding JWT:", err);
          localStorage.removeItem('jwt'); // If there's an error in the JWT, it's invalid and must be removed
        }
      } else {
        console.log("No JWT found");
      }
    }    

    componentDidMount() {
      this.getUser();
      this.signIn();
    }
    
    // isSignedIn(){
    //   return !!this.props.currentUser
    // }
    
    render() {
        const { loading } = this.state;
        const { currentUser } = this.props;
        console.log("This is the state, let's find currentUser", this.state);
        console.log("This is the current user from Redux", currentUser);
        console.log("This is the base URL", process.env.REACT_APP_BASE_URL);
        if (loading) {
            return <div />;
        }

        return (
          <>
                <HashRouter>
                <BrowserRouter>
                <div 
                className= "ui segment"
                >
                    <NavBar currentUser={currentUser} onSignOut={this.signOut}/>
                        <Switch>
                            <Route path="/" exact component={Welcome} />
                            {/* <Route path="/posts" exact component={Blog} /> */}
                            <Route path="/whatisjiujitsu" exact component={WhatIsJiuJitsu} />
                            <Route 
                              exact path="/waiver/new"
                              render = {props => <WaiverNewPage {...props} isAuthenticated={currentUser}  />}
                              // exact component={WaiverNewPage}
                            />
                            <Route
                            exact path="/waivers/:id/"
                            render = {props => <WaiverShowPage {...props} isAuthenticated={currentUser}  />}

                            // component={WaiverUpdatePage}
                            />
                            <Route
                            exact path="/waivers/:id/edit"
                            isAuthenticated={currentUser}
                            render = {props => <WaiverUpdatePage {...props} isAuthenticated={currentUser}  />}

                            // component={WaiverUpdatePage}
                            />
                            {/* TODO: Signed out users and probably non-admin users can still access that component when they shouldn't be able to, fix that */}
                            {/* <Route path="/signature" exact component={SignatureForm} /> */}
                            <Route path="/profiles" exact component={WhoAreWe} />
                            <Route path="/example" exact component={FormExample} />
                            <Route exact 
                            isAuthenticated={currentUser}
                            path="/techniques/:id/edit"
                            component={TechniqueUpdatePage}
                            />
                           <AuthRoute
                            isAuthenticated={currentUser}
                            path="/admin"
                            component={AdminPage}
                            />
                            {/* <AuthRoute
                            isAuthenticated={currentUser}
                            path="/syllabus"
                            component={SyllabusIndexPage}
                            /> */}
                            
                           <AuthRoute
                            isAuthenticated={currentUser}
                            path="/syllabus"
                            component={SyllabusShowPage}
                            />
                            <AuthRoute
                            isAuthenticated={currentUser}
                            path="/techniques/:id"
                            component={TechniqueShowPage}
                            />
                            {/* <AuthRoute
                            isAuthenticated={currentUser}
                            path="/syllabi/:syllabus_id/mindmap"
                            component={SyllabusMindmapPage} 
                            /> */}
                            {/* <AuthRoute
                            isAuthenticated={currentUser}
                            path="/syllabus/:id"
                            render={routeProps => (
                            <SyllabusShowPage {...routeProps} currentUser={currentUser} />
                            )} */}
                            {/* /> */}
                            
                            
                            {/* Ensure that only admin, and no other users, can see and do actions on this page  */}
                            <AuthRoute
                            isAuthenticated={currentUser}
                            path="/technique/new"
                            component={TechniqueNewPage}
                            />
                            {/* <Route exact 
                            isAuthenticated={currentUser}
                            path="?"
                            component={TechniqueGenerationEngine}
                            /> */}
                            {/* <AuthRoute
                            isAuthenticated={currentUser}
                            path="/videos(???)"
                            component={VideoIndexPage}
                            /> */}
                            {/*
                            <Route
                            path="/events"
                            component={EventsList}    
                            />*/}
                            {/* Uncomment out the following block when we are ready for sign in/up functionality again */}
                            <Route
                            exact
                            path="/sign_up"
                            render={routeProps => (
                                <SignUpPage {...routeProps} onSignUp={this.getUser} />
                            )}
                            />
                            
                            <Route
                            path="/sign_in"
                            render={routeProps => (
                                <SignInPage {...routeProps} onSignIn={this.getUser} />
                            )}
                            />
                            <Route component={NotFoundPage} />
                        </Switch>
                </div>
            </BrowserRouter>
            </HashRouter>
            <Footer />
                        </>
        );
    }
}

// Map the Redux state to component props
const mapStateToProps = (state) => ({
  currentUser: state.user.user
});

// const mapDispatchToProps = { setUser };

// export default connect(mapStateToProps, mapDispatchToProps)(App);

export default connect(mapStateToProps, { setUser })(App);