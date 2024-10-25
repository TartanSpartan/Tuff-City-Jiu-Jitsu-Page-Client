import React, { Component } from "react";
import { Session, Token } from "../requests";
import Form from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Alert from "react-bootstrap/Alert"
// import { User } from "../requests";
import { GoogleLogin } from "react-google-login";
// import styled from "styled-components"
import "../App.scss";
// import { useHistory } from "react-router-dom";

class SignInPage extends React.Component {
  constructor(props) {
    super(props);
    console.log("These are the props", this.props);
    this.state = {
      email: "",
      password: "",
      errors: {
        general: []
      },
      loading: false,
      submitDisabled: false,
    };


    this.signInUser = this.signInUser.bind(this);
    this.handleSignIn = this.handleSignIn.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    // this.handleGoogleSignIn = this.handleGoogleSignIn.bind(this);
    this.handleFailure = this.handleFailure.bind(this);
    this.createSession = this.createSession.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.updateErrors = this.updateErrors.bind(this);
    this.isFormValid = this.isFormValid.bind(this);
  }
  
  // signInUser(params) {
  //   const {onSignIn = () => {}} = this.props;
    
  //   Token
  //     .create(params)
  //     .then(data => {
  //       if (!data.error) {
  //         const {jwt} = data;
  //         localStorage.setItem("jwt", jwt);
  //         onSignIn();
  //         // The "history" prop is only available to components rendered by
  //         // the "<Route ... />" component of "react-router-dom"
  //         this.props.history.push("/");
  //       }
  //     })
  // }

  // async signInUserTest(params) {
  //   const { onSignIn = () => {} } = this.props;
  
  //   try {
  //     const data = await Token.create(params);  // Send the sign-in request to the backend
  
  //     if (data.status === 200) {
  //       // Sign-in successful, store the JWT
  //       const { jwt } = data;
  //       localStorage.setItem("jwt", jwt);
  //       onSignIn();  // Notify the parent component about the sign-in
  //       this.props.history.push("/");  // Redirect the user to the home page
  //     } else if (data.status === 404) {
  //       // Wrong credentials
  //       this.setState({
  //         errors: [{ message: "Wrong email or password" }]
  //       });
  //     } else if (data.status === 401) {
  //       // Unauthorized, invalid credentials
  //       this.setState({
  //         errors: [{ message: "Invalid credentials" }]
  //       });
  //     } else {
  //       // Handle other response statuses or errors
  //       console.log("This is the data's status", data.status);
  //       console.log("Login failed", data.message);
  //     }
  //   } catch (error) {
  //     console.error("Error signing in user:", error);
  //     this.setState({
  //       errors: [{ message: "An unexpected error occurred. Please try again." }]
  //     });
  //   }
  // }

  updateErrors = (field, message) => {
    this.setState((prevState) => {
      const newErrors = { ...prevState.errors };

      if (message) {
        newErrors[field] = message;
      } else {
        delete newErrors[field];
      }

      const submitDisabled = !this.isFormValid(newErrors, prevState);

      return { errors: newErrors, submitDisabled };
    });
  };

  isValidEmailFormat = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  validateField = async (field, value) => {
    let errorMessage = "";
    switch (field) {

      case "email":
        if (value.trim() === "") {
          // this.updateErrors(field, " Email address is required. The submit button will be disabled until it is provided.");
          errorMessage = " Email address is required. The submit button will be disabled until it is provided.";
        }
        else if (!value.includes("@")) {
          errorMessage = " Invalid email address. Must include \"@\". The submit button will be disabled until this is done.";
        } else if (!this.isValidEmailFormat(value)) {
          errorMessage = " Invalid email format. Please enter a valid email address. The submit button will be disabled until this is done.";
        } else {
          errorMessage = "";
        }
        break;

      case "password":
        if (value.trim() === "") {
          errorMessage = " A password is required. The submit button will be disabled until it is provided.";
        } else if (value.length < 8) {
          errorMessage = " Your password must be at least 8 characters long. The submit button will be disabled until this is done.";
        } else {
          errorMessage = "";
        }
        break;

      default:
        break;
    }

    // Testing the below code

    this.updateErrors(field, errorMessage);

    this.setState(prevState => ({
      submitDisabled: Object.values(prevState.errors).some(errArr => errArr.length > 0)
    }));

  };

  handleInputChange = (event) => {
    const { name, value } = event.target;
    // const errorStatus = this.state.errors.general.some(error => 
    //   error.includes("Email not found. Please check the email address and try again.") || 
    //   error.includes("Incorrect password. Please try again.")
    // );

    const errorStatus404 = this.state.errors.general.some(error => 
      error.includes("Email not found. Please check the email address and try again.")
    );

    const errorStatus401 = this.state.errors.general.some(error => 
      error.includes("Incorrect password. Please try again.")
    );

    this.setState(prevState => {
      let newErrors = { ...prevState.errors };

      if (errorStatus404 && name === "email") {
        newErrors.general = newErrors.general?.filter(error => 
          error !== "Email not found. Please check the email address and try again."
        );
      }

        if (errorStatus401 && name === "password") {
          newErrors.general = newErrors.general?.filter(error => 
            error !== "Incorrect password. Please try again."
        ); 
      }

      return {
        [name]: value,
        errors: newErrors,
        submitDisabled: !this.isFormValid(newErrors),
      };
    // }, () => {
    //   this.validateField(name, value);
    });





    // if (errorStatus404 && name === "email") {
    //   this.setState(prevState => {
    //     let newErrors = { ...prevState.errors };
    //     newErrors.general = newErrors.general?.filter(error => 
    //       error !== "Incorrect password. Please try again."
    //     );
    //     return {
    //       [name]: value,
    //       errors: newErrors,
    //       submitDisabled: newErrors.general.length > 0
    //     };
    //   });
    //   // this.validateField(name, value); // Only validate if it's not related to 404 or 401 errors
    //   // this.setState({ submitDisabled: false }); // Trigger re-render to update the button state
    // } else if (errorStatus401 && name === "password") {
    //     this.setState(prevState => {
    //       let newErrors = { ...prevState.errors };
    //       newErrors.general = newErrors.general?.filter(error => 
    //         error !== "Incorrect password. Please try again."
    //       );
    //       return {
    //         [name]: value,
    //         errors: newErrors,
    //         submitDisabled: newErrors.general.length > 0
    //       };
    //   });
    // } else {
    //   this.setState(prevState => ({
    //     [name]: value,
    //     submitDisabled: errorStatus404 || errorStatus401 || prevState.errors.general.length > 0
    //   }));
    // }
  };

//   return {
//     [name]: value,
//     errors: newErrors
//   };
// }, () => {
//   this.validateField(name, value); // Ensure validation updates errors
// });
// };
    
    // this.setState({ [name]: value, submitDisabled: false });

    // this.setState((prevState) => {
    //   // const newState = { [name]: value, submitDisabled: false };
    //   let newErrors = { ...prevState.errors };

    //   console.log("What is newErrors?", newErrors);

    //   // The following two conditionals ensure that the state is not mutated and will clear the respective error if the respective field is modified i.e. suggesting that the user is correcting a typo in that field, for example.

    //   if (name === "email" && prevState.errors.general.includes("Email not found. Please check the email address and try again.")) {
    //     newErrors.general = newErrors.general?.filter(error => error !== "Email not found. Please check the email address and try again.");
    //   } else if (name === "password" && prevState.errors.general.includes("Incorrect password. Please try again.")) {
    //     newErrors.general = newErrors.general?.filter(error => error !== "Incorrect password. Please try again.");
    //   }

    //   // const submitDisabled = Object.keys(newErrors).length > 0 && newErrors.general.length > 0;

    //   // console.log("What is submitDisabled?", submitDisabled);
    //   return {
    //     [name]: value,
    //     errors: newErrors,
    //     // !submitDisabled
    //   };
    // });

    // if (name === "email") {
    //   clearTimeout(this.emailValidationTimeout);
    //   this.emailValidationTimeout = setTimeout(() => {
    //     this.validateField(name, value);
    //   }, 500); // Like with SignUpPage.js, we won't validate the email field until after a 500ms delay
    // } else { 
    //   // We don't want the validation to occur immediately for the email field, rather it should be delayed so that it doesn't instantly show an error on input but only shows if an error is present and e.g. the user tabs away from the field
    //   this.validateField(name, value);
    // }
    // this.validateField(name, value); 
  // };

  isFormValid(newErrors) {
    const emailHasError = newErrors.general?.includes("Email not found. Please check the email address and try again.");
    const passwordHasError = newErrors.general?.includes("Incorrect password. Please try again.");

    // Ensure both fields are valid (no errors) for the submit button to be enabled
    return !(emailHasError || passwordHasError);
  };

  async signInUser(params) {
    console.log("Hitting asyncsignInUser");
    const {onSignIn = () => {}} = this.props;
    
    try {
      const data = await Token.create(params);
      if (!data.error) {
        const {jwt} = data;
        localStorage.setItem("jwt", jwt);
        onSignIn();
        // The "history" prop is only available to components rendered by
        // the "<Route ... />" component of "react-router-dom"
        this.props.history.push("/");
      }
    } catch (error) {
      console.error("Error signing in user:", error);
    }
  }

  async handleSignIn(data){
    console.log("Testing async handleSignIn");
    console.log("This is the login data", data);
    // let history = useHistory();
    console.log("This is this in handleSignIn", this)
    try {
      const sessionData = await Session.create({
      // Need to send the JWT payload and a token type here instead of the email and password
      // The backend can determine whether it's a JWT key or an API key
      email: data.Lu.Bv,
      password: data.googleId
      });

      if (sessionData) {
        this.props.history.push("/");
      }
    } catch (error) {
      console.error("Error handling the sign in", error);
    }
  }

  handleBlur = async (event) => {
    const { name, value } = event.target;
    // console.log(`Blurred field: ${name}, value: ${value}`);
    await this.validateField(name, value);
  };
 
   handleFailure = (data) => {
     console.log("This is the failure data", data);
    }

  async createSession(event) {
    // Rename to createSessionOriginal if testing other versions of the function
    console.log("Step 1: Hitting createSession; submitting sign-in form with email and password, step 2 should be Session.create in requests.js");
    event.preventDefault();
    console.log("Testing async createSession");

    this.setState({ errors: { general: [] }, loading: true });
    // TODO add loading spinner

    // const { currentTarget } = event;
    // const formData = new FormData(currentTarget);

    // Prior to making the API request, we attempt to validate the email and password inputs
    // const email = this.state.email.trim();
    // const password = formData.get("password");

    // Double double checks for the form values
    // console.log("Email value 1:", formData.get("email"));
    // console.log("Password value 1:", formData.get("password"));
    // console.log("Email value 2:", email);
    // console.log("Password value 2:", password);

    const { email, password } = this.state;

    // console.log("Directly checking the regex match", emailRegex.test(email));

    // if (!email || !password) {
    //   // alert("Form submission blocked: the email and/or password you've submitted are incorrect or missing.");
    //   const errorMessage = "Form submission blocked: the email and/or password cannot be empty.";
    //   this.setState({ 
    //     errors: [{ message: errorMessage }],
    //     loading: false }); // Prevent loading to reset the submit button if it's hit with an empty input field
    //   return;
    // }

    // // Regular expression to validate the email address submitted
    // const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i;
    // // This check isn't working, how do we fix it? When it's true, the test should pass and allow the user to sign in

    // console.log("Email before regex check:", this.state.email)

    // console.log("Regex test result:", emailRegex.test(email));
    // if (emailRegex.test(email) === false || password.length < 8) {
    // //if (password.length < 4) {
    //   const errorMessage = emailRegex.test(email) === false
    //   ? "Form submission blocked: Please enter a valid email with an '@' character"
    //   : "Form submission blocked: Please enter a password at least 8 characters long";
    //   console.log("Regex test result:", emailRegex.test(email));
    //   console.error("Validation failed:", errorMessage);
    //   // alert("Form submission blocked: Please enter a valid email with an '@' character and ensure the password is at least 4 characters long.");
    //   this.setState({ 
    //     errors: [{ message: errorMessage }],
    //     loading: false 
    //   }); // Prevent loading to reset the submit button if it's hit with an empty input field, and display the error message if present
    //   return;
    // }

    // event.preventDefault();
    // this.setState({ errors: [], loading: true });

  //   if (
  //     // !email || !password || 
  //     Object.keys(this.state.errors).length > 0) {
  //     this.setState({ 
  //         errors: [{ message: "Please fill in all required fields correctly before submitting." }],
  //         loading: false,
  //         submitDisabled: false
  //     });
  //     return;
  // }

    try {
      const data = await Session.create({
        email: email,
        password: password
      });

      console.log("API Response Data:", data);
      console.log("What's the error?", this.getErrorMessage(data.status));

      if (data.status === 200) {
        // In this instance, the sign in attempt was successful; we can clear errors and proceed
        this.setState({ errors: { general: [] } });
        this.props.history.push("/");
        if (typeof this.props.onSignIn === "function") {
          this.props.onSignIn();
        }
      } else if ([404, 401].includes(data?.status)) {
        console.log("Are we hitting the else if?");
        this.setState({
          errors: { general: [this.getErrorMessage(data?.status)] } ,
          loading: false,
          submitDisabled: true, // Disable button only on 404/401 errors
        });
      } else {
        this.setState({
          errors: { general: [this.getErrorMessage(data?.status)] }, 
          loading: false,
          submitDisabled: true,
        });
        // {
        //   this.setState(prevState => ({
        //     errors: [{ message: this.getErrorMessage(data.status) }], 
        //     loading: false,
        //     submitDisabled: true,
        //   }));
        console.log("Error message:", this.getErrorMessage(data.status));
      }
    } catch (error) {
      console.error("Error during createSession:", error);
      this.setState({
        errors: [{ general: "An unexpected error occurred. Please try again." }],
        submitDisabled: true,
      });
      alert("An unexpected error occurred. Please try again.");
      // Can we use React's Alert import here? Check
    } finally {
      this.setState({ loading: false });
    }
  }  

  getErrorMessage(status) {
    switch (status) {
      case 401: return "Incorrect password. Please try again."; // This is a 401 unauthorized response, with an incorrect password causing an authentication failure, so throw an error to helpfully translate this to the user
      case 404: return "Email not found. Please check the email address and try again." // In this instance, the user who was being attempted to sign in with was not found by their email address, so inform the user of this fact
      default: return "Login failed. Please try again." // Let's see if other specific server responses are returned, and handle them as they come (can adapt more conditions if so)
    }
  }

  render() {
    const { email, password, errors, loading } = this.state;
    console.log("This is the state", this.state);
    console.log("Is it http or https...", window.location.protocol); // "http:" or "https:"; here we're checking for which protocol the client is using; can confirm it's http
    console.log("Current email state:", this.state.email);
    console.log("Directly checking the regex match in render block", /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email));
    console.log("General errors state in render:", this.state.errors);
    // console.log("Length of errors state in render:", this.state.errors.length);
    return (   
      <div>
      {/* <GoogleLogin
      clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
      buttonText="Sign in with Google"
      onSuccess={this.handleSignIn}
      onFailure={this.handleFailure}
      cookiePolicy={'single_host_origin'}
    /> */}
    <br/>   
    
      <Form 
        style={{
            fontSize: "20px",
            paddingLeft: "2rem"
          }}
        onSubmit={this.createSession}
        // noValidate
        >
                  {/* {errors.length > 0 ? (
            <div className="ui negative message FormErrors">
              <Alert variant="danger">
              <div className="header">Error Signing in...</div>
              <p>{errors.map(err => err.message).join(",")}</p>
              </Alert>
            </div>
          ) : null} */}
        {/* {errors.length > 0 && (
          <Alert variant="danger">
            <div className="header">Error Signing in...</div>
            <ul>
              {errors.map((err, index) => (
                <li key={index}>{err.message}</li>
              ))}
            </ul>
          </Alert>
        )} */}
          <br/>   
        <Form.Label id="top-label">Sign in here</Form.Label>
        <br/>
        <Form.Group controlId="formBasicEmail">
          <Form.Label id="bottom-label" style={{
            
          }}>Email address</Form.Label>
          <Form.Control 
          name="email"
          type="email"
          value={this.state.email}
          placeholder="Enter email e.g. yourname@usermail.com"
          aria-label="Email address"
          onChange={this.handleInputChange} 
          onBlur={this.handleBlur}
          required={false}
          />
          {this.state.errors.email && <p className="error" style={{ color: "red" }}>{this.state.errors.email}</p>}
          <Form.Text 
            className="text-muted"
            style={{
              fontSize: "20px"
            }}
          >
            We'll never share your email with anyone else.
          </Form.Text>
        </Form.Group>

        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
          name="password"
          type="password"
          className="formInput"
          value={this.state.password}
          placeholder="Enter password"
          aria-label="Password"
          onChange={this.handleInputChange}
          onBlur={this.handleBlur}
          required={false}
          />
          {this.state.errors.password && <p className="error" style={{ color: "red" }}>{this.state.errors.password}</p>}
        </Form.Group>
        <br/>
        <Button
        // style={{
        //   fontSize: "20px",
        //   backgroundColor: "green",
        //   color: "white"
        // }}
        variant="primary" className="custom-pill-button" type="submit" 
        // disabled={Object.keys(this.state.errors).length > 0 || !this.state.email || !this.state.password} 
        disabled={this.state.submitDisabled}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
        <br />
        <br />
        {this.state.errors.general?.length > 0 && (
        <Alert 
        className="in"
        // Note: crucially, this "in" class is key to making React Bootstrap Alerts be visible with the current dependency framework. Look throughout the other components to see where Alert can be implemented.
        variant="danger">
          <div className="header">Error Signing in...</div>
          <ul>
            {this.state.errors.general?.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        </Alert>
         )}
      </Form>
      </div>
    );
  }
}

export default SignInPage;