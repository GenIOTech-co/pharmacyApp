import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useCashier } from "../pages/CashierContext";
import { useToast } from "../pages/ToastContext";
export default function ExitApp() {
  const { cashier } = useCashier();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);

  const buttonStyle = {
    width: 40,
    height: 40,
    borderRadius: "50%",
    backgroundColor: "#f8d7da",
    border: "1.5px solid #f5c2c7",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
    margin: 8,
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

  const exitApp = () => {
    window.electronAPI?.exitApp(); // Make sure this is defined in preload.js
  };
  const closeCahier = () => {
    showToast("ابتدا باید صندوق را ببندید"); // Make sure this is defined in preload.js
  };
  return (
    <>
      <button
        onClick={() => {
          if (!cashier) {
            setShowModal(true);
          } else {
            closeCahier();
          }
        }}
        style={buttonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="خروج از برنامه"
        title="خروج از برنامه"
        type="button"
      >
        <FaTimes size={18} style={iconStyle} />
      </button>

      {!cashier && showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.title}>خروج از برنامه</h3>
            <p style={{ fontSize: 12 }}>
              آیا مطمئن هستید که می‌خواهید خارج شوید؟
            </p>
            <div style={styles.buttons}>
              <button style={styles.yesBtn} onClick={exitApp}>
                بله
              </button>
              <button style={styles.noBtn} onClick={() => setShowModal(false)}>
                خیر
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    backgroundColor: "#fff",
    paddingBottom: "1rem",
    borderRadius: 10,
    width: "300px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    textAlign: "center",
    fontFamily: "IRANSans, Arial, sans-serif",
  },
  title: {
    marginBottom: "1rem",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttons: {
    display: "flex",
    justifyContent: "center",
    marginTop: "1rem",
    gap: 20,
  },
  yesBtn: {
    padding: "6px 12px",
    backgroundColor: "#dc3545",
    border: "none",
    borderRadius: 6,
    color: "#fff",
    cursor: "pointer",
    fontFamily: "IRANSans-Bold",
  },
  noBtn: {
    padding: "6px 12px",
    backgroundColor: "#6c757d",
    border: "none",
    borderRadius: 6,
    color: "#fff",
    cursor: "pointer",
    fontFamily: "IRANSans-Bold",
  },
};
