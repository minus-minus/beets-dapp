import React from "react";
import "../stylesheets/Dapp.css";

export function Loading() {
  return (
    <div className="loading">
      <span className="sr-only">Loading...</span>
      <div className="spinner-border mt-3" role="status"></div>
    </div>
  );
}
