import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { AuthProvider } from "./utils/context";

import "../node_modules/bootstrap/dist/css/bootstrap.min.css";

ReactDOM.render(
  <AuthProvider>
    <App />
  </AuthProvider>,
  document.getElementById("root")
);
