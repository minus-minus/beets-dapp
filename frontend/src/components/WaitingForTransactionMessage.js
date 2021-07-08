import React from "react";

export function WaitingForTransactionMessage({ transactionHash }) {
  return (
    <div className="alert alert-info" role="alert">
      Waiting for transaction <strong>{transactionHash}</strong> to be mined
    </div>
  );
}
