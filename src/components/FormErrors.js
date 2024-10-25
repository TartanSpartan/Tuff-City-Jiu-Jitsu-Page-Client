import React from "react";

import "./FormErrors.css";

const FormErrors = props => {
  const { errors = [], forField } = props;

  let filteredErrors = errors;
  if (forField) {
    filteredErrors = errors.filter(
      err => err.field.toLowerCase() === forField.toLowerCase()
    );
  }

  return (
    <ul className="FormError">
      {filteredErrors.map((error, index) => (
        <li key={index}>
          {error.field} {error.message}
        </li>
      ))}
    </ul>
  );
};

export default FormErrors;