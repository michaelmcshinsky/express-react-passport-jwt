import React from "react";
import classNames from "classnames";

export function FormFeedback(props) {
  const { children, className, valid, invalid, ...attributes } = props;

  const classes = classNames(
    "form-group mb-3",
    { "invalid-feedback": invalid },
    { "valid-feedback": valid },
    className
  );

  return (
    <div className={classes} {...attributes}>
      {children}
    </div>
  );
}
