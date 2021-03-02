import React from "react";
import classNames from "classnames";

export function Input(props) {
  const { innerRef, className, valid, invalid, ...attributes } = props;

  const classes = classNames(
    "form-control bg-light",
    { "is-valid": valid },
    { "is-invalid": invalid },
    className
  );

  return <input ref={innerRef} className={classes} {...attributes} />;
}
