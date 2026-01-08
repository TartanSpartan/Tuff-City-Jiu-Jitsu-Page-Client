import React, { useState, useEffect } from "react";
import { Session, Token } from "../requests";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import googleButtonImage from "../img/web_light_sq_SI@1x.png";
// import { User } from "../requests";
// import { GoogleLogin } from "react-google-login";
// import styled from "styled-components"
import "../App.scss";
// import { useHistory } from "react-router-dom";

export function SignInPage(props) {
  console.log("These are the props", props);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ general: [] });
  const [loading, setLoading] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [csrfState, setCsrfState] = useState({ status: "loading", token: null });

  const updateErrors = (field, message) => {
    setErrors((prevState) => {
      const newErrors = { ...prevState };
      if (message) {
        newErrors[field] = message;
      } else {
        delete newErrors[field];
      }

      setSubmitDisabled(!isFormValid(newErrors, { email, password }));
      return newErrors;
    });
  };

  const isValidEmailFormat = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const validateField = async (field, value) => {
    let errorMessage = "";

    switch (field) {
      case "email":
        if (value.trim() === "") {
          errorMessage =
            " Email address is required. The submit button will be disabled until it is provided.";
        } else if (!value.includes("@")) {
          errorMessage =
            ' Invalid email address. Must include "@". The submit button will be disabled until this is done.';
        } else if (!isValidEmailFormat(value)) {
          errorMessage =
            " Invalid email format. Please enter a valid email address. The submit button will be disabled until this is done.";
        } else {
          errorMessage = "";
        }
        break;

      case "password":
        if (value.trim() === "") {
          errorMessage =
            " A password is required. The submit button will be disabled until it is provided.";
        } else if (value.length < 8) {
          errorMessage =
            " Your password must be at least 8 characters long. The submit button will be disabled until this is done.";
        } else {
          errorMessage = "";
        }
        break;

      default:
        break;
    }

    updateErrors(field, errorMessage);
    setSubmitDisabled(Object.values(errors).some((errArr) => errArr?.length > 0));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);

    setErrors((prevState) => {
      const newErrors = { ...prevState };

      const errorStatus404 = errors.general.some((error) =>
        error.includes("Email not found. Please check the email address and try again.")
      );

      const errorStatus401 = errors.general.some((error) =>
        error.includes("Incorrect password. Please try again.")
      );

      if (errorStatus404 && name === "email") {
        newErrors.general = newErrors.general?.filter(
          (error) => error !== "Email not found. Please check the email address and try again."
        );
      }

      if (errorStatus401 && name === "password") {
        newErrors.general = newErrors.general?.filter(
          (error) => error !== "Incorrect password. Please try again."
        );
      }

      return newErrors;
    });
  };

  // The following uses axios to send a GET request for the csrf token from the backend
  // TODO: Adapt to using custom hook in src/utils/useCsrfToken.js
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/csrf_token`);
        setCsrfState({ status: "loaded", token: response.data.csrf_token });
        console.log("CSRF Token fetched SUCCESSFULLY:", response.data.csrf_token);
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
        setCsrfState({ status: "error", token: null });
      }
    };
    fetchCsrfToken();
  }, []);

  const isFormValid = (currentErrors, currentValues) => {
    const emailHasError = currentErrors.general?.includes(
      "Email not found. Please check the email address and try again."
    );
    const passwordHasError = currentErrors.general?.includes(
      "Incorrect password. Please try again."
    );

    // Ensure both fields are valid (no errors) for the submit button to be enabled
    return !(emailHasError || passwordHasError);
  };

  const signInUser = async (params) => {
    console.log("Hitting asyncsignInUser");
    const { onSignIn = () => {} } = props;

    try {
      const data = await Token.create(params);
      if (!data.error) {
        const { jwt } = data;
        localStorage.setItem("jwt", jwt);
        onSignIn();
        // The "history" prop is only available to components rendered by
        // the "<Route ... />" component of "react-router-dom"
        props.history.push("/");
      }
    } catch (error) {
      console.error("Error signing in user:", error);
    }
  };

  const handleSignIn = async (data) => {
    console.log("Testing async handleSignIn");
    console.log("This is the login data", data);
    // let history = useHistory();
    // console.log("This is this in handleSignIn", this);
    try {
      const sessionData = await Session.create({
        // Need to send the JWT payload and a token type here instead of the email and password
        // The backend can determine whether it's a JWT key or an API key
        email: data.Lu.Bv,
        password: data.googleId,
      });

      if (sessionData) {
        props.history.push("/");
      }
    } catch (error) {
      console.error("Error handling the sign in", error);
    }
  };

  const handleBlur = async (event) => {
    const { name, value } = event.target;
    // console.log(`Blurred field: ${name}, value: ${value}`);
    await validateField(name, value);
  };

  const handleFailure = (data) => {
    console.log("This is the failure data", data);
  };

  const createSession = async (event) => {
    // Rename to createSessionOriginal if testing other versions of the function
    console.log(
      "Step 1: Hitting createSession; submitting sign-in form with email and password, step 2 should be Session.create in requests.js"
    );
    event.preventDefault();
    console.log("Testing async createSession");

    setErrors({ general: [] });
    setLoading(true);
    // TODO add loading spinner

    try {
      const data = await Session.create(
        {
          session: {
            email: email,
            password: password,
          },
        },
        csrfState.token
      );

      console.log("API Response Data:", data);
      console.log("What's the error?", getErrorMessage(data.status));

      if (data.status === 200) {
        // In this instance, the sign in attempt was successful; we can clear errors and proceed
        setErrors({ general: [] });
        props.history.push("/");
        if (typeof props.onSignIn === "function") {
          props.onSignIn();
        }
      } else if ([404, 401].includes(data?.status)) {
        console.log("Are we hitting the else if?");
        setErrors({ general: [getErrorMessage(data?.status)] });
        setLoading(false);
        setSubmitDisabled(true); // Disable button only on 404/401 errors
      } else {
        setErrors({ general: [getErrorMessage(data?.status)] });
        setLoading(false);
        setSubmitDisabled(true); // Disable button only on 404/401 errors
        console.log("Error message:", getErrorMessage(data.status));
      }
    } catch (error) {
      console.error("Error during createSession:", error);
      setErrors({ general: ["An unexpected error occurred. Please try again."] });
      setSubmitDisabled(true);
      alert("An unexpected error occurred. Please try again.");
      // Can we use React's Alert import here? Check
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (status) => {
    switch (status) {
      case 401:
        return "Incorrect password. Please try again."; // This is a 401 unauthorized response, with an incorrect password causing an authentication failure, so throw an error to helpfully translate this to the user
      case 404:
        return "Email not found. Please check the email address and try again."; // In this instance, the user who was being attempted to sign in with was not found by their email address, so inform the user of this fact
      default:
        return "Login failed. Please try again."; // Let's see if other specific server responses are returned, and handle them as they come (can adapt more conditions if so)
    }
  };

  const handleUseGoogleLoginSuccess = async (codeResponse) => {
    console.log("Google Sign-Up Client-Side Success with Auth Code:", codeResponse);
    if (props.csrfState?.status === "loaded" && props.csrfState?.token && codeResponse?.code) {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/auth/google_oauth2/callback`,
          { code: codeResponse.code },
          { headers: { "X-CSRF-Token": props.csrfState.token } }
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

  const googleSignIn = useGoogleLogin({
    onSuccess: handleUseGoogleLoginSuccess,
    flow: "auth-code",
    ux_mode: "redirect",
    redirect_uri: `${process.env.REACT_APP_BASE_URL}/auth/google_oauth2/callback`,
  });

  const handleGoogleSignInClick = () => {
    window.location.href = `${process.env.REACT_APP_BASE_URL}/auth/google_oauth2`;
  };

  return (
    <div>
      {csrfState.status === "loaded" && (
        <>
          {/* Spacer to separate from the navbar above */}
          <div className="navbar-spacer" aria-hidden="true" />
          <button onClick={handleGoogleSignInClick} className="google-sign-in-button-image">
            <img
              src={googleButtonImage}
              alt="Sign up with Google"
              style={{ border: "none", paddingLeft: "2rem", display: "block" }}
            />
          </button>
        </>

        // Note: we're using Google-provided logos to do an all-in-one button, but see if this approach works well and will probably have to use different sizes for different page sizes, scaling etc.
      )}

      <br />

      <Form
        style={{
          fontSize: "20px",
          paddingLeft: "2rem",
        }}
        onSubmit={createSession}
        // noValidate
      >
        <br />
        <Form.Label id="top-label">Sign in here with your credentials</Form.Label>
        <br />
        <Form.Group controlId="formBasicEmail">
          <Form.Label id="bottom-label" style={{}}>
            Email address
          </Form.Label>
          <Form.Control
            name="email"
            type="email"
            value={email}
            placeholder="Enter email e.g. yourname@usermail.com"
            aria-label="Email address"
            onChange={handleInputChange}
            onBlur={handleBlur}
            required={false}
          />
          {errors.email && (
            <p className="error" style={{ color: "red" }}>
              {errors.email}
            </p>
          )}
          <Form.Text
            className="text-muted"
            style={{
              fontSize: "20px",
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
            value={password}
            placeholder="Enter password"
            aria-label="Password"
            onChange={handleInputChange}
            onBlur={handleBlur}
            required={false}
          />
          {errors.password && (
            <p className="error" style={{ color: "red" }}>
              {errors.password}
            </p>
          )}
        </Form.Group>
        <br />
        <Button
          // style={{
          //   fontSize: "20px",
          //   backgroundColor: "green",
          //   color: "white"
          // }}
          variant="primary"
          className="custom-pill-button"
          type="submit"
          // disabled={Object.keys(this.state.errors).length > 0 || !this.state.email || !this.state.password}
          disabled={submitDisabled}
        >
          {loading ? "Submitting..." : "Submit"}
        </Button>
        <br />
        <br />
        {errors.general?.length > 0 && (
          <Alert
            className="in"
            // Note: crucially, this "in" class is key to making React Bootstrap Alerts be visible with the current dependency framework. Look throughout the other components to see where Alert can be implemented.
            variant="danger"
          >
            <div className="header">Error Signing in...</div>
            <ul>
              {errors.general?.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </Alert>
        )}
      </Form>
    </div>
  );
}
