import React from "react";

const Loading = ({ label = "Memuat..." }) => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    {label && <p>{label}</p>}
  </div>
);

export default Loading;
