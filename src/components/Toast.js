// components/Toast.js
import React, { useEffect } from "react";

export default function Toast({ message, onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const toastStyle = {
    position: "fixed",
    bottom: "2rem",
    right: "2rem",
    backgroundColor: "#333",
    color: "white",
    padding: "12px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    zIndex: 9999,
    boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
    fontFamily: "IRANSans-Bold, Arial, sans-serif",
    direction: "rtl",
  };

  return <div style={toastStyle}>{message}</div>;
}
