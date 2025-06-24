import React from "react";
import pharmacyBg from "../assets/pharmacyBg.png";
const backgroundStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundImage: `url(${pharmacyBg})`, // replace with your image path
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  opacity: 0.4,
  zIndex: -1, // push it behind other content
};

export default function BackgroundWrapper({ children }) {
  return (
    <>
      <div style={backgroundStyle} />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </>
  );
}
