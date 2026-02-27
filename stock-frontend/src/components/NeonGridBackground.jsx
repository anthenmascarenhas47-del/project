import React from "react";

const NeonGridBackground = () => {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background:
          "linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        zIndex: -1,
      }}
    />
  );
};

export default NeonGridBackground;