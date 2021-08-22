import React from "react";
import ReactDOM from "react-dom";
import { Dapp } from "./components/Dapp";
import "bootstrap/dist/css/bootstrap.css";
import "./stylesheets/index.css";

ReactDOM.render(
  <React.StrictMode>
    <Dapp />
  </React.StrictMode>,
  document.getElementById("root")
);
