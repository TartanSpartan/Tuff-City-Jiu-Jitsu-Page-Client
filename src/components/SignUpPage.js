import React, { useState, useRef, useEffect } from "react";
// import ReactDOM from "react-dom";
// import useForm from "react-hook-form";
import { User } from "../requests";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
// import { useNavigate} from "react-router-dom"; // Note: can upgrade to this if/when we integrate react-router-dom v6 (upgrading deps in npm can be tricky); for now we will use the following import instead
import { useHistory } from 'react-router-dom';
import { GoogleLogin } from "react-google-login";
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
  const debounceRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirmation: ""
  });

  // The following will clean and clear debounceRef so that there aren't any risks of memory leaks or redundant API calls, when the component mounts or unmounts
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
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
          updateErrors(field, " First name is required. The submit button will be disabled until it is provided.");
        } else {
          updateErrors(field, "");
        }
        break;

      case "lastName":
        if (value.trim() === "") {
          updateErrors(field, " Last name is required. The submit button will be disabled until it is provided.");
        } else {
          updateErrors(field, "");
        }
        break;

      case "email":
        if (value.trim() === "") {
          updateErrors(field, " Email address is required. The submit button will be disabled until it is provided.");
        }
        else if (!value.includes("@")) {
          updateErrors(field, " Invalid email address. Must include \"@\". The submit button will be disabled until this is done."); // Take another pass and expand these errors after testing
        } else if (!isValidEmailFormat(value)) {
          updateErrors(field, " Invalid email format. Please enter a valid email address. The submit button will be disabled until this is done.");
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
          updateErrors(field, " A password is required. The submit button will be disabled until it is provided.");
        } else if (value.length < 8) {
          updateErrors(field, " Your password must be at least 8 characters long. The submit button will be disabled until this is done."); // Should I also mention the submit button being disabled in this case?
        } else {
          updateErrors(field, "");
          if (passwordConfirmation && value !== passwordConfirmation) {
            updateErrors("passwordConfirmation", " The passwords do not match. The submit button will be disabled until they are the same.");
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
      updateErrors(field, `${field === "passwordConfirmation" ? " Password confirmation" : "Password"} is required. The submit button will be disabled until it is provided.`);
    } else if (
      field === "passwordConfirmation" &&
      password &&
      value !== password
    ) {
      updateErrors(field, "The passwords do not match. The submit button will be disabled until they are the same.");
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

  const handleSignUp = async ({ googleResponse, formData }) => { 
  // const handleSignUp = async (data) => { 
  const signUpParams = googleResponse 
  ? {
      first_name: googleResponse.profileObj.givenName,
      last_name: googleResponse.profileObj.familyName,
      email: googleResponse.profileObj.email,
      password: googleResponse.googleId
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

    if (process.env.NODE_ENV === 'development') {
      console.log(googleResponse ? "Google login data" : "Traditional form login data", signUpParams);
    }

    const res = await User.create(signUpParams);

    try {
      if (process.env.NODE_ENV === 'development') {
      console.log("Response from sign-up request", res)
      }

      if (res.id) {
        onSignUp();
        history.push("/");
      } else {
        console.error("Sign-up failed according to the response:", res);
      }
     } catch(error) {
      console.error("Error during sign-up in handleSignUp:", error);
     }
  };


  // let first_name = data.Du.VX;
  // let last_name = data.Du.iW;
  // let email = data.Du.tv;

  // const handleFailure = (data) => {
  //   console.error("This is the failure data", data);
  //  }

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
      finalErrors.firstName = " First name is required. The submit button will be disabled until it is provided.";
    }

    if (lastName.trim() === "") {
      finalErrors.lastName = " Last name is required. The submit button will be disabled until it is provided.";
    }

    const emailValue = email.trim();

    if (emailValue === "") {
      finalErrors.email = " An email address is required. The submit button will be disabled until it is provided.";
    } else if (!emailValue.includes("@")) {
      finalErrors.email = " Invalid email address. Must include \"@\". The submit button will be disabled until this is done.";
    } else {
        try {
          const available = await User.checkEmail(emailValue);
          if (!available) {
            finalErrors.email = " This email is already taken by an existing user. The submit button will be disabled until a new and unique email address is used for sign-up."
          } 
        } catch (error) {
            console.error("Error checking email availability", error);
            finalErrors.email = "There was an error checking email availability. Please try again later. The submit button will be disabled until this is done."
        }
    }

    if (password.trim() === "") {
      finalErrors.password = " A password is required. The submit button will be disabled until it is provided.";
    } else if (password.length < 8) {
      finalErrors.password = " Your password must be at least 8 characters long. The submit button will be disabled until this is done."; // Should I also mention the submit button being disabled in this case?
    } else if (passwordConfirmation && password !== passwordConfirmation) {
      finalErrors.password = " The passwords do not match. The submit button will be disabled until they are the same.";
    }

    if (passwordConfirmation.trim() === "") {
      finalErrors.passwordConfirmation = " Password confirmation is required. The submit button will be disabled until it is provided.";
    } else if (password && passwordConfirmation !== password) {
      finalErrors.password = " The passwords do not match. The submit button will be disabled until they are the same.";
    }

    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      return;
    }

    // if (!isEmailAvailable) {
    //   alert("Form submission blocked: the email you're trying to sign up with is already taken, use a unique email address")
    //   return; // With return statements like these, further execution is halted upon failed validation
    // }

    // if (password !== passwordConfirmation) {
    //   alert("Passwords do not match. Please correct them before submitting.");
    //   return;
    // }


    // if (process.env.NODE_ENV === 'development') {
    //   console.log("Form submitted with params:", signUpParams); // Log the sign-up params
    // }
    handleSignUp({ formData });

  }

  return (
    <div>
    {/* <GoogleLogin
    clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
    buttonText="Sign up with Google"
    onSuccess={handleSignUp} // try nSuccess={handleSignUp({ googleResponse })}
    onFailure={handleFailure}
    cookiePolicy={'single_host_origin'}
  /> */}
  <br/>

    <Form 
      style={{
        fontSize: "20px",
        paddingLeft: "2rem",
        // maxWidth: "800px"
        // Think about how maxWidth affects the appearance of the form on various platforms and the children of the form element
      }}
      onSubmit={handleSubmit}>
    <br/>   
    <Form.Label id="top-label">Sign up here</Form.Label>
    <Form.Group controlId="formBasicName" className="form-group">
      <Form.Label>First name</Form.Label>
      <Form.Control name="firstName" type="name" placeholder="First name" value={firstName} className="form-input"
        onChange={handleInputChange}
        onBlur={handleBlur}
        required={false}/>
        {errors.firstName && <p className="error" style={{ color: "red" }}>{errors.firstName}</p>}
    </Form.Group>
    <Form.Group controlId="formBasicName">
      <Form.Label>Last name</Form.Label>
      <Form.Control name="lastName" type="name" placeholder="Last name" value={lastName}
        onChange={handleInputChange}
        onBlur={handleBlur}
        required={false}/>
      {errors.lastName && <p className="error" style={{ color: "red" }}>{errors.lastName}</p>}
    </Form.Group>
    <Form.Group controlId="formBasicEmail">
      <Form.Label>Email address</Form.Label>
      <Form.Control name="email" type="email" value={email} placeholder="Enter email e.g. yourname@usermail.com"
        onChange={handleInputChange}
        onBlur={handleBlur}
        required={false}/>
        {errors.email && <p className="error" style={{ color: "red" }}>{errors.email}</p>}
      <Form.Text className="text-muted">
        We'll never share your email with anyone else.
      </Form.Text>
    </Form.Group>
    <Form.Group controlId="formBasicPassword">
      <Form.Label>Password</Form.Label>
      <Form.Control name="password" type="password" placeholder="Enter password" 
        value={password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })
        }
        onBlur={handleBlur}
        required={false}/>
        {errors.password && <p className="error" style={{ color: "red" }}>{errors.password}</p>}
    </Form.Group>
    <Form.Group controlId="formBasicPasswordConfirmation">
      <Form.Label>Password Confirmation</Form.Label>
      <Form.Control name="passwordConfirmation" type="password" placeholder="Enter password again" 
        value={passwordConfirmation}
        onChange={(e) => setFormData({ ...formData, passwordConfirmation: e.target.value })}
        onBlur={(e) => handleBlurPasswordConfirm("passwordConfirmation", e.target.value)}
        required={false}/>
        {errors.passwordConfirmation && <p className="error" style={{ color: "red" }}>{errors.passwordConfirmation}</p>}
    </Form.Group>
    {/* Display the error message if passwords don't match; check if <p> usage in other components should not be showing with the error triangle, if not then CSS needs a quick tweak */}

    <br/>
        <Button 
        style={{
          fontSize: "20px",
          backgroundColor: "green",
          color: "white"
        }}
        variant="primary" disabled={
                          !isEmailAvailable ||
                          // Object.values(errors).some((error) => error !== ""
                          Object.keys(errors).some(key => errors[key])
                        } 
                          // add more required conditions so that submit can pass validations both here and on the backend and won't be grayed out
          className="custom-pill-button" type="submit">
          Submit
        </Button>
  </Form>
  </div>
  );
}