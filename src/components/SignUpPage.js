import React, { useState, useRef, useEffect } from "react";
// import ReactDOM from "react-dom";
// import useForm from "react-hook-form";
import { User } from "../requests";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
// import { useNavigate} from "react-router-dom"; // Note: can upgrade to this if/when we integrate react-router-dom v6 (upgrading deps in npm can be tricky); for now we will use the following import instead
import { useHistory } from "react-router-dom";
// import { GoogleLogin } from "react-google-login";
// import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import { GoogleLogin } from "@react-oauth/google";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { v4 as uuidv4 } from "uuid"; // Example library for generating unique IDs
import googleLogo from "../img/web_light_sq_na@4x.png";
import googleButtonImage from "../img/web_light_sq_SU@1x.png";

// import styled from "styled-components"
import "../App.scss";

// This is not quite working i.e. it doesn't push to signed in and it doesn't save the details they submitted. Fix soon. Comment addressed?

// Add date of birth, any relevant medical conditions,

// Use Ouath to sign up with Gmail and possibly other services such as Facebook
// Also, have admin set most of the user characteristics such as their belt and qualifications from the user admin form

// Fix the input widths so that they aren't infinite. They can be much shorter! Done. Now, do ditto on SignInPage; share the CSS there. Look at other components' form inputs too.

export function SignUpPage(props) {
  const { onSignUp } = props;
  // const navigate = useNavigate();
  const history = useHistory();
  // const [hasSubmitted, setHasSubmitted] = useState(false); // This element will ensure that the form doesn't assume a blank name field is an error on a fresh page load, only if the user tries to submit without filling it in will the error condition be triggered
  const [isEmailAvailable, setIsEmailAvailable] = useState(true);
  // const [password, setPassword] = useState("");
  // const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [csrfState, setCsrfState] = useState({ status: "loading", token: null });
  // const [csrfToken, setCsrfToken] = useState(null);
  // const [isCsrfTokenLoaded, setIsCsrfTokenLoaded] = useState(false);
  const debounceRef = useRef(null);
  const [authState, setAuthState] = useState(uuidv4()); // Generate a unique state value

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });

  useEffect(() => {
    console.log("REACT_APP_BASE_URL is:", process.env.REACT_APP_BASE_URL);
  }, []);

  // The following will clean and clear debounceRef so that there aren't any risks of memory leaks or redundant API calls, when the component mounts or unmounts
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []); // The use of empty dependency arrays enforces that the function runs only once on mount

  // The following uses axios to send a GET request for the csrf token from the backend
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/csrf_token`);
        // setCsrfToken(response.data.csrfToken);
        // setIsCsrfTokenLoaded(true);
        setCsrfState({ status: "loaded", token: response.data.csrf_token });
        console.log("CSRF Token fetched SUCCESSFULLY:", response.data.csrf_token); // [LOGGING ENHANCEMENT 1] - Success log
        // console.log("isCsrfTokenLoaded set to TRUE after fetch"); // [LOGGING ENHANCEMENT 2] - State update log
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
        // setIsCsrfTokenLoaded(false);
        setCsrfState({ status: "error", token: null });
      }
    };
    fetchCsrfToken();
  }, []);

  const { firstName, lastName, email, password, passwordConfirmation } = formData;
  const [errors, setErrors] = useState({});

  const updateErrors = (field, message) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: message,
    }));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    // We don't want the validation to occur immediately for the email field, rather it should be delayed so that it doesn't instantly show an error on input but only shows if an error is present and e.g. the user tabs away from the field
    if (name !== "email") {
      validateField(name, value);
    }
  };

  const validateField = async (field, value) => {
    switch (field) {
      case "firstName":
        if (value.trim() === "") {
          updateErrors(
            field,
            " First name is required. The submit button will be disabled until it is provided."
          );
        } else {
          updateErrors(field, "");
        }
        break;

      case "lastName":
        if (value.trim() === "") {
          updateErrors(
            field,
            " Last name is required. The submit button will be disabled until it is provided."
          );
        } else {
          updateErrors(field, "");
        }
        break;

      case "email":
        if (value.trim() === "") {
          updateErrors(
            field,
            " Email address is required. The submit button will be disabled until it is provided."
          );
        } else if (!value.includes("@")) {
          updateErrors(
            field,
            ' Invalid email address. Must include "@". The submit button will be disabled until this is done.'
          ); // Take another pass and expand these errors after testing
        } else if (!isValidEmailFormat(value)) {
          updateErrors(
            field,
            " Invalid email format. Please enter a valid email address. The submit button will be disabled until this is done."
          );
        } else {
          updateErrors(field, "");
          if (debounceRef.current) clearTimeout(debounceRef.current);

          // Perform the asynchronous email availability check
          debounceRef.current = setTimeout(async () => {
            try {
              const available = await User.checkEmail(value);
              console.log("Email availability response:", available);
              setIsEmailAvailable(available);
              if (!available) {
                updateErrors(
                  field,
                  " This email is already taken by an existing user. The submit button will be disabled until a new and unique email address is used for sign-up."
                );
              } else {
                updateErrors(field, ""); // Clear error if email is available
              }
            } catch (error) {
              console.error("Error checking email availability", error);
              updateErrors(field, " An error occurred while checking email availability.");
            }
          }, 500); // 500ms debounce to prevent excessive API calls
        }
        break;

      case "password":
        if (value.trim() === "") {
          updateErrors(
            field,
            " A password is required. The submit button will be disabled until it is provided."
          );
        } else if (value.length < 8) {
          updateErrors(
            field,
            " Your password must be at least 8 characters long. The submit button will be disabled until this is done."
          ); // Should I also mention the submit button being disabled in this case?
        } else {
          updateErrors(field, "");
          if (passwordConfirmation && value !== passwordConfirmation) {
            updateErrors(
              "passwordConfirmation",
              " The passwords do not match. The submit button will be disabled until they are the same."
            );
          } else {
            updateErrors("passwordConfirmation", "");
          }
        }
        break;

      // NOTE: Have commented the following block out because the errors don't seem to manifest in this case and when user tabs from the field, so have used handleBlurPasswordConfirm for now until the below case can be properly integrated
      // Additionally, is there scope for having an error automatically be fixed if it's the last one, so the user doesn't have to tab away from the field?

      // case "passwordConfirm":
      //   if (value.trim() === "") {
      //     updateErrors(field, "  Password confirmation is required. The submit button will be disabled until it is provided.");
      //   } else if (password && value !== password) {
      //     updateErrors(field, "Passwords do not match.");
      //   } else {
      //     updateErrors(field, "");
      //   }
      //   break;

      default:
        break;
    }
  };

  useEffect(() => {
    console.log("Password updated:", password);
  }, [password]);

  // Let's say we have a test case where the user comes back to this page and has their email autofilled in, well, they don't really need to be warned that it's already taken except in certain scenarios
  // So we'll use handleBlur to only run the validation when the element loses focus

  const handleBlur = async (event) => {
    const { name, value } = event.target;
    // console.log(`Blurred field: ${name}, value: ${value}`);
    await validateField(name, value);
  };

  // Will try to integrate the following handleBlur in tandem with switch:case:break for passwordConfirm, if they can be done as one would expect, and so then upholding Don't Repeat Yourself principle with clean code
  // const handleBlur = (field, value) => {
  //   validateField(field, value);
  // };

  const handleBlurPasswordConfirm = (field, value) => {
    console.log("Blur event triggered for password confirm");
    if (value.trim() === "") {
      updateErrors(
        field,
        `${field === "passwordConfirmation" ? " Password confirmation" : "Password"} is required. The submit button will be disabled until it is provided.`
      );
    } else if (field === "passwordConfirmation" && password && value !== password) {
      updateErrors(
        field,
        "The passwords do not match. The submit button will be disabled until they are the same."
      );
    } else {
      updateErrors(field, ""); // Clear errors if validation passes
    }
  };

  const isValidEmailFormat = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  // Refactor the below, in fact likely gut it, and figure out how to use isValidEmailFormat
  // const handleEmailChange = async (event) => {
  //     const email = event.target.value;
  //     setEmail(email);
  //     if (isValidEmailFormat(email)) {
  //         const isEmailTaken = await User.checkEmail(email);
  //         if (isEmailTaken) {
  //             alert("That email address is already taken");
  //         }
  //     } else {
  //         alert("Invalid email format");
  //     }
  // };

  const handleSignUp = async ({ googleResponse, formData, csrfToken }) => {
    // const handleSignUp = async (data) => {
    const credential = googleResponse?.credential;
    const signUpParams = googleResponse
      ? {
          // first_name: googleResponse?.profileObj?.givenName,
          // last_name: googleResponse?.profileObj?.familyName,
          // email: googleResponse?.profileObj?.email,
          // password: googleResponse?.googleId
          google_id_token: credential,
        }
      : {
          // first_name: get("first_name"),
          first_name: firstName,
          last_name: lastName,
          email: email,
          password: password,
          password_confirmation: passwordConfirmation,
          // New elements: check that these make sense, or should they be things that the admin manually adds?
          // belt_grade_id: formData.get("belt_grade_id"),
          // owns_gi: formData.get("owns_gi")
        };

    const authType = googleResponse ? "google_auth2" : "traditional";
    let apiUrl = "";

    if (authType === "google_oauth2") {
      apiUrl = `${process.env.REACT_APP_BASE_URL}/users/auth/google_oauth2/callback`;
    } else {
      apiUrl = `${process.env.REACT_APP_BASE_URL}/users/`;
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`${authType} signup data:`, signUpParams, `Posting to: ${apiUrl}`);
    }

    const res = await User.create(signUpParams, csrfToken, apiUrl); // <--- Pass csrfToken to User.create in both cases

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("Response from sign-up request", res);
      }

      if (res.id) {
        onSignUp();
        history.push("/");
      } else {
        console.error("Sign-up failed according to the response:", res);
      }
    } catch (error) {
      console.error("Error during sign-up in handleSignUp:", error);
    }
  };

  // let first_name = data.Du.VX;
  // let last_name = data.Du.iW;
  // let email = data.Du.tv;

  const handleFailure = (data) => {
    console.error("This is the failure data", data);
  };

  // const { register, errors, watch } = useForm({});
  // const passwordTest = useRef({});
  // passwordCurrent = watch("passwordTest", "");
  // const onSubmit = async data => {
  // alert(JSON.stringify(data));
  // };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // setHasSubmitted(true);
    // const newErrors = {};

    console.log("Submitting form with state values:", formData);
    console.log("Password:", password);
    console.log("Password Confirmation:", passwordConfirmation);
    // const { currentTarget } = event;
    // const formData = new FormData(currentTarget);

    const finalErrors = {};

    if (firstName.trim() === "") {
      finalErrors.firstName =
        " First name is required. The submit button will be disabled until it is provided.";
    }

    if (lastName.trim() === "") {
      finalErrors.lastName =
        " Last name is required. The submit button will be disabled until it is provided.";
    }

    const emailValue = email.trim();

    if (emailValue === "") {
      finalErrors.email =
        " An email address is required. The submit button will be disabled until it is provided.";
    } else if (!emailValue.includes("@")) {
      finalErrors.email =
        ' Invalid email address. Must include "@". The submit button will be disabled until this is done.';
    } else {
      try {
        const available = await User.checkEmail(emailValue);
        if (!available) {
          finalErrors.email =
            " This email is already taken by an existing user. The submit button will be disabled until a new and unique email address is used for sign-up.";
        }
      } catch (error) {
        console.error("Error checking email availability", error);
        finalErrors.email =
          "There was an error checking email availability. Please try again later. The submit button will be disabled until this is done.";
      }
    }

    if (password.trim() === "") {
      finalErrors.password =
        " A password is required. The submit button will be disabled until it is provided.";
    } else if (password.length < 8) {
      finalErrors.password =
        " Your password must be at least 8 characters long. The submit button will be disabled until this is done."; // Should I also mention the submit button being disabled in this case?
    } else if (passwordConfirmation && password !== passwordConfirmation) {
      finalErrors.password =
        " The passwords do not match. The submit button will be disabled until they are the same.";
    }

    if (passwordConfirmation.trim() === "") {
      finalErrors.passwordConfirmation =
        " Password confirmation is required. The submit button will be disabled until it is provided.";
    } else if (password && passwordConfirmation !== password) {
      finalErrors.password =
        " The passwords do not match. The submit button will be disabled until they are the same.";
    }

    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      return;
    }

    handleSignUp({ googleResponse: null, formData: formData, csrfToken: csrfState.token }); // <--- Pass csrfState.token here
  };

  const responseMessage = (response) => {
    console.log("Success! Here's the response", response);
  };
  const errorMessage = (error) => {
    console.log("errorMessage function TRIGGERED - Google Sign-Up Failure:", error); // [DEBUGGING LOG for ERROR] - Log when errorMessage is called
  };

  // };

  // const login = useGoogleLogin({
  //   onSuccess: (codeResponse) => setUser(codeResponse),
  //   onError: (error) => console.log("Login Failed:", error),
  // });

  // const handleSuccess = async (response) => {
  //   console.log("Google login successful (client-side):", response);
  //   const googleIdToken = response.credential;

  //   try {
  //     // Note: if this works, port it to requests.js (two requests) to reduce bloat in this SignUpPage compoonent and prune comments

  //     const csrfTokenResponse = await fetch(`${process.env.REACT_APP_BASE_URL}/csrf_token`);

  //     if (!csrfTokenResponse.ok) {
  //       console.error("Failed to fetch CSRF token:", csrfTokenResponse.status, csrfTokenResponse.statusText);
  //       return;
  //     }

  //     const csrfTokenData = await csrfTokenResponse.json();
  //     const csrfToken = csrfTokenData.csrf_token;
  //     console.log("CSRF Token fetched:", csrfToken);

  //     const serverResponse = await fetch(`${process.env.REACT_APP_BASE_URL}/users/auth/google_oauth2/callback`, { // Your Rails callback route
  //       method: 'POST', // Or 'GET' if preferRED, but POST is usually better for auth data
  //       headers: {
  //       'Content-Type': 'application/json', // Or 'application/x-www-form-urlencoded' if you send data differently
  //       },
  //       body: JSON.stringify({
  //         google_id_token: googleIdToken,
  //         authenticity_token: csrfToken
  //         }), // Send the ID token to your server
  //     });

  //   if (serverResponse.ok) {
  //   const data = await serverResponse.json();
  //   console.log("Server response:", data);
  //   // Handle successful server-side authentication (e.g., redirect, update UI)
  //   // Might get a session token or user info back from the server in 'data'
  //   window.location.href = '/'; // Try to redirect to root page
  //    } else {
  //     console.error("Server authentication failed:", serverResponse.status, serverResponse.statusText);
  //     // Handle server-side authentication failure (e.g., display error message)
  //    }
  //   } catch (error) {
  //       console.error("Error sending token to server:", error);
  //       // Handle network or other errors
  //   }
  // };
  const handleUseGoogleLoginSuccess = async (codeResponse) => {
    console.log("Google Sign-Up Client-Side Success with Auth Code:", codeResponse);
    if (csrfState.status === "loaded" && csrfState.token && codeResponse?.code) {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/users/auth/google_oauth2/callback`,
          { code: codeResponse.code },
          { headers: { "X-CSRF-Token": csrfState.token } }
        );
        console.log("Backend response after Google sign-in:", response.data);
        // Handle success - maybe redirect the user
        window.location.href = "/"; // Or wherever you want to redirect
      } catch (error) {
        console.error("Error sending authorization code to backend:", error);
      }
    } else {
      console.error("CSRF token not loaded or authorization code missing.");
    }
  };

  const handleGoogleLoginSuccess = async (googleResponse) => {
    console.log("Google Sign-Up Client-Side Success...");
    if (csrfState.status === "loaded" && csrfState.token) {
      console.log("CSRF Token Value:", csrfState.token);
      const credential = googleResponse?.credential;
      // form.setAttribute('action', `${process.env.REACT_APP_BASE_URL}/users/auth/google_oauth2`);

      // const googleTokenInput = document.createElement('input');
      // googleTokenInput.setAttribute('type', 'hidden');
      // googleTokenInput.setAttribute('name', 'google_id_token');
      // googleTokenInput.setAttribute('value', credential);
      // form.appendChild(googleTokenInput);

      // const csrfTokenInput = document.createElement('input');
      // csrfTokenInput.setAttribute('type', 'hidden');
      // csrfTokenInput.setAttribute('name', 'authenticity_token');
      // csrfTokenInput.setAttribute('value', csrfState.token);
      // form.appendChild(csrfTokenInput);

      // document.body.appendChild(form);
      // form.submit();

      // document.body.removeChild(form);

      // window.location.href = `${process.env.REACT_APP_BASE_URL}/users/auth/google_oauth2`;
      // window.location.href = `${process.env.REACT_APP_BASE_URL}/users/auth/google_oauth2/callback`;
    } else {
      console.error("CSRF token not loaded yet.");
    }
    console.log("handleGoogleLoginSuccess EXITED");
  };

  const googleSignUp = useGoogleLogin({
    onSuccess: handleUseGoogleLoginSuccess,
    flow: "auth-code",
    ux_mode: "redirect",
    redirect_uri: `${process.env.REACT_APP_BASE_URL}/auth/google_oauth2/callback`,
    // Note: currently it's only possible to log in if we omit the callback string in the redirect_uri above, trying to fix this bug
    // state: authState
  });

  useEffect(() => {
    console.log("SignUpPage COMPONENT MOUNTED");
    return () => {
      console.log("SignUpPage COMPONENT UNMOUNTED");
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const googleButtonRef = useRef(null);

  const handleGoogleButtonClick = () => {
    console.log("Manual button click - Redirecting to backend initiation URL (GET)...");
    window.location.href = `${process.env.REACT_APP_BASE_URL}/users/auth/google_oauth2`;
  };

  const onSuccess = (googleResponse) => {
    console.log("Google onSuccess callback TRIGGERED:", googleResponse);
  };

  const onError = (errorMessage) => {
    console.error(errorMessage);
  };

  return (
    <div>
      {csrfState.status === "loaded" && (
        <>
          {/* Spacer to separate from the navbar above */}
          <div className="navbar-spacer" aria-hidden="true" />
          <button onClick={() => googleSignUp()} className="google-sign-in-button-image">
            <img
              src={googleButtonImage}
              alt="Sign up with Google"
              style={{ border: "none", paddingLeft: "2rem", display: "block" }}
            />
          </button>
        </>

        // Note: we're using Google-provided logos to do an all-in-one button, but see if this approach works well and will probably have to use different sizes for different page sizes, scaling etc.
      )}

      {csrfState.status === "loading" && <p>Loading Google Sign-In button...</p>}
      {csrfState.status === "error" && <p>Error loading Google Sign-In button.</p>}
      {

        (console.log(
          "Rendering GoogleLogin Button? csrfState.status:",
          csrfState.status,
          ", csrfState.token:",
          csrfState.token
        ),
        csrfState.status === "loaded" && csrfState.token ? ( // Check csrfState.status
          <useGoogleLogin
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            buttonText="Sign up with Google"
            onSuccess={handleUseGoogleLoginSuccess}
            flow="auth-code"
            uxMode="redirect"
            redirectUri={`${process.env.REACT_APP_BASE_URL}/users/auth/google_oauth2/callback`}
            onError={errorMessage}
            cookiePolicy={"single_host_origin"}
          />
        ) : (
          <p>Loading Sign-In Button...</p>
        ))
      }
      <br />

      <Form
        style={{
          fontSize: "20px",
          paddingLeft: "2rem",
          // maxWidth: "800px"
          // Think about how maxWidth affects the appearance of the form on various platforms and the children of the form element
        }}
        onSubmit={handleSubmit}
      >
        <br />
        {/* <Button onClick={() => { window.location.href = `${process.env.REACT_APP_BASE_URL}/users/auth/google_oauth2`; }}>
        Sign up with Google
      </Button> */}
        <Form.Label id="top-label">Sign up here with an email and password</Form.Label>
        <Form.Group controlId="formBasicName" className="form-group">
          <Form.Label>First name</Form.Label>
          <Form.Control
            name="firstName"
            type="name"
            placeholder="First name"
            value={firstName}
            className="form-input"
            onChange={handleInputChange}
            onBlur={handleBlur}
            required={false}
          />
          {errors.firstName && (
            <p className="error" style={{ color: "red" }}>
              {errors.firstName}
            </p>
          )}
        </Form.Group>
        <Form.Group controlId="formBasicName">
          <Form.Label>Last name</Form.Label>
          <Form.Control
            name="lastName"
            type="name"
            placeholder="Last name"
            value={lastName}
            onChange={handleInputChange}
            onBlur={handleBlur}
            required={false}
          />
          {errors.lastName && (
            <p className="error" style={{ color: "red" }}>
              {errors.lastName}
            </p>
          )}
        </Form.Group>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            name="email"
            type="email"
            value={email}
            placeholder="Enter email e.g. yourname@usermail.com"
            onChange={handleInputChange}
            onBlur={handleBlur}
            required={false}
          />
          {errors.email && (
            <p className="error" style={{ color: "red" }}>
              {errors.email}
            </p>
          )}
          <Form.Text className="text-muted">
            We'll never share your email with anyone else.
          </Form.Text>
        </Form.Group>
        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            name="password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            onBlur={handleBlur}
            required={false}
          />
          {errors.password && (
            <p className="error" style={{ color: "red" }}>
              {errors.password}
            </p>
          )}
        </Form.Group>
        <Form.Group controlId="formBasicPasswordConfirmation">
          <Form.Label>Password Confirmation</Form.Label>
          <Form.Control
            name="passwordConfirmation"
            type="password"
            placeholder="Enter password again"
            value={passwordConfirmation}
            onChange={(e) => setFormData({ ...formData, passwordConfirmation: e.target.value })}
            onBlur={(e) => handleBlurPasswordConfirm("passwordConfirmation", e.target.value)}
            required={false}
          />
          {errors.passwordConfirmation && (
            <p className="error" style={{ color: "red" }}>
              {errors.passwordConfirmation}
            </p>
          )}
        </Form.Group>
        {/* Display the error message if passwords don't match; check if <p> usage in other components should not be showing with the error triangle, if not then CSS needs a quick tweak */}

        <br />
        <Button
          style={{
            fontSize: "20px",
            backgroundColor: "green",
            color: "white",
          }}
          variant="primary"
          disabled={
            !isEmailAvailable ||
            // Object.values(errors).some((error) => error !== ""
            Object.keys(errors).some((key) => errors[key])
          }
          // add more required conditions so that submit can pass validations both here and on the backend and won't be grayed out
          className="custom-pill-button"
          type="submit"
        >
          Submit
        </Button>
      </Form>
    </div>
  );
}
