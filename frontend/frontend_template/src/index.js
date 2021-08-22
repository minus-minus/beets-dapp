import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import Dapp from "./dapp/components/Dapp";

const dapp = new Dapp();
ReactDOM.render(
  <React.StrictMode>
    <App dapp={dapp}/>
  </React.StrictMode>,
  document.getElementById("root")
);
