import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { apiAuth } from "../utils/api";
import { useAuth } from "../utils/context";
import {
  Container,
  Row,
  Column,
  FormGroup,
  FormFeedback,
  Label,
  Input,
  Button,
} from "../components";

export function Register() {
  const [error, setError] = useState("");

  const { auth, setAuth } = useAuth();
  const history = useHistory();

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .email("Invalid email address")
        .required("Required"),
      password: Yup.string()
        .min(8, "Must be at least 8 characters.")
        .required("Required"),
    }),
    onSubmit: _handleSubmit,
  });

  useEffect(() => {
    if (auth) {
      history.push("/profile");
    }
  }, []);

  function _handleSubmit(values) {
    const { username, password } = values;

    apiAuth
      .register(username, password)
      .then((token) => {
        setAuth({ ...auth, token });
        setTimeout(() => {
          history.push("/profile");
        });
      })
      .catch(() => {
        setError("Unable to register.");
      });
  }

  return (
    <Container className="mt-5">
      <Row>
        <Column className="col-md-6 offset-md-3">
          <h1 className="mb-4">Register</h1>
          <form onSubmit={formik.handleSubmit}>
            <FormGroup>
              <Label>Email</Label>
              <Input
                type="email"
                name="username"
                {...formik.getFieldProps("username")}
                invalid={formik.touched.username && formik.errors.username}
              />
              {formik.touched.username && formik.errors.username && (
                <FormFeedback invalid>{formik.errors.username}</FormFeedback>
              )}
            </FormGroup>
            <FormGroup>
              <Label>Password</Label>
              <Input
                type="password"
                name="password"
                {...formik.getFieldProps("password")}
                invalid={formik.touched.password && formik.errors.password}
              />
              {formik.touched.password && formik.errors.password && (
                <FormFeedback invalid>{formik.errors.password}</FormFeedback>
              )}
            </FormGroup>
            <FormGroup className="text-right">
              <Button className="btn-primary">Register</Button>
            </FormGroup>
            {error && <div className="alert alert-warning">{error}</div>}
          </form>
        </Column>
      </Row>
    </Container>
  );
}
