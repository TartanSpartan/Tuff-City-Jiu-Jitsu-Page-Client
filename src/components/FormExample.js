import Form from "react-bootstrap/Form";
import { Button, Nav } from "react-bootstrap";
//import FloatingLabel from 'react-bootstrap-floating-label';
import SignatureCanvas from "react-signature-canvas";
// import SignatureForm from "./SignatureForm";
import moment from "moment";
import React, { useState, useRef, useEffect } from "react";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
// import { MDBBtn } from 'mdb-react-ui-kit';
import "../App.scss";

class FormExample extends React.Component {
    constructor(props, context) {
      super(props, context);
  
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit= this.handleSubmit.bind(this);

  
      this.state = {
        value: ''
      };
    }
  
    getValidationState() {
      const length = this.state.value.length;
      if (length > 10) return 'success';
      if (length > 5) return 'warning';
      if (length > 0) return 'error';
      return null;
    }
  
    handleChange(e) {
      this.setState({ value: e.target.value });
    }

    handleSubmit(event) {
    event.preventDefault();
    console.log("State", this.state.value);
      // const { currentTarget } = event;
      // const formData = new FormData(currentTarget);
  

    }
  
    render() {
      return (
        <Form>
          <Form.Group
            controlId="formBasicText"
            validationState={this.getValidationState()}
          >
            <label>Working example with validation</label>
            <Form.Control
              type="text"
              value={this.state.value}
              placeholder="Enter text"
              onChange={this.handleChange}
            />
            <Form.Control.Feedback />
            <help>Validation is based on string length.</help>
          </Form.Group>
          <button
        className="pill"
        variant="primary"
        type="submit"
        onClick={this.handleSubmit}
        style={{ 
          display: "flex",
          justifyContent: "center !important",
          marginTop: "2rem",
          background: 'linear-gradient(to right, rgb(3, 138, 255), rgb(118, 75, 162))', color: "white"}}>
          Submit
        </button>
        </Form>
        
      );
    }
  }
  
  // render(<FormExample />);

  export default FormExample;