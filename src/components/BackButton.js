// BackButton.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function BackButton({ onClickExtra }) {
  const navigate = useNavigate();

  const buttonStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    backgroundColor: "#f8d7da",
    border: "1.5px solid #f5c2c7",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "IRANSans-Bold, Arial, sans-serif",
    fontSize: 12,
    color: "#842029",
    marginBottom: "1rem",
    transition: "background-color 0.3s ease, border-color 0.3s ease",
    userSelect: "none",
  };

  const iconStyle = {
    color: "#842029",
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = "#f5c2c7";
    e.currentTarget.style.borderColor = "#d39e9e";
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = "#f8d7da";
    e.currentTarget.style.borderColor = "#f5c2c7";
  };

  const handleClick = () => {
    if (onClickExtra) {
      onClickExtra(); // Run extra logic only if provided
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      style={buttonStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="بازگشت"
      title="بازگشت"
      type="button"
    >
      <FaArrowLeft size={20} style={iconStyle} />
      <span>بازگشت</span>
    </button>
  );
}
