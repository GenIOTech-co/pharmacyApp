import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BackButton from "../components/BackButton";
import { useUser } from "./UserContext";
import { useToast } from "./ToastContext";
import { useCashier } from "./CashierContext";
import {
  FaCashRegister,
  FaListAlt,
  FaCog,
  FaMoneyCheckAlt,
} from "react-icons/fa";

function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cashier, setCashier } = useCashier();
  const { username } = useUser();
  const { showToast } = useToast();
  const [sandoghNom, setSandoghNom] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingCashierAction, setPendingCashierAction] = useState(null); // "open" or "close"

  useEffect(() => {
    if (location.state?.setCashierTrue) {
      setCashier(true); // Your state setter
    }
    if (location.state?.sandoghNom) {
      console.log("sandoghNo: ", location.state.sandoghNom);
      setSandoghNom(location.state.sandoghNom); // Your state setter
    }
  }, [location.state , setCashier, setSandoghNom]);

  const containerStyle = {
    padding: "2rem",
    fontFamily: "IRANSans-Bold, Arial, sans-serif",
    direction: "rtl",
    maxWidth: 900,
    margin: "auto",
  };

  const headerStyle = {
    fontSize: "1.5rem",
    marginBottom: "2rem",
    textAlign: "center",
  };

  const buttonsContainer = {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
    justifyContent: "center",
  };

  const buttonStyle = {
    flex: "1 0 45%", // ✅ allow 2 per row (around 45% each)
    maxWidth: "45%",
    minHeight: "120px",
    minWidth: "120px", // Prevents them from shrinking too small
    backgroundColor: "#1E90FF",
    border: "none",
    borderRadius: 12,
    padding: "1.2rem 1rem",
    color: "white",
    fontSize: "1.1rem",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(30, 144, 255, 0.4)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.6rem",
    transition: "background-color 0.3s ease, box-shadow 0.3s ease",
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = "#187bcd"; // Darker DodgerBlue
    e.currentTarget.style.boxShadow = "0 6px 16px rgba(24, 123, 205, 0.6)";
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = "#1E90FF";
    e.currentTarget.style.boxShadow = "0 4px 12px rgba(30, 144, 255, 0.4)";
  };

  const iconStyle = {
    flexShrink: 0,
  };

  const buttonTextStyle = {
    fontFamily: "IRANSans-Bold",
    fontWeight: "bold",
    fontSize: 14,
  };

  return (
    <div>
      <div
        style={{
          padding: 10,
          textAlign: "right",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            textAlign: "center",
            borderRadius: "50%",
            width: 80,
            height: 80,
            backgroundColor: "#22222299",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Replace with <img src="..." /> if you have a profile image */}
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: "bold",
              color: "#fff",
            }}
          >
            {username}
          </div>
        </div>
      </div>

      <div style={containerStyle}>
        <h1 style={headerStyle}>داشبورد داروخانه</h1>

        <div style={buttonsContainer}>
          <button
            style={buttonStyle}
            onClick={() => {
              setPendingCashierAction(cashier ? "close" : "open");
              setShowConfirmModal(true);
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <FaCashRegister size={36} style={iconStyle} />
            <div style={buttonTextStyle}>
              {cashier ? "بستن صندوق" : "گشودن صندوق"}
            </div>
          </button>

          <button
            style={buttonStyle}
            onClick={() => {
              if (cashier) {
                navigate("/amal", {
                  state: { sandoghNom: parseInt(sandoghNom) },
                });
              } else {
                showToast("لازم است برای ثبت عملیات، ابتدا صندوق را باز کنید");
              }
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            // disabled = {cashier ? false : true}
          >
            <FaMoneyCheckAlt size={36} style={iconStyle} />
            <div style={buttonTextStyle}>ثبت عملیات دریافت و پرداخت</div>
          </button>
          <button
            style={buttonStyle}
            onClick={() => {
              navigate("/Setting", {
                state: { cashstate: cashier, sandoghNom: parseInt(sandoghNom) },
              });
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <FaCog size={36} style={iconStyle} />
            <div style={buttonTextStyle}>امکانات و تنظیمات صندوق</div>
          </button>
          <button
            style={buttonStyle}
            onClick={() => {
              navigate("/HameNoskheha", {
                state: { sandoghNom: parseInt(sandoghNom) },
              });
            }}
            //onClick={() => navigate("/HameNoskheha")}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <FaListAlt size={36} style={iconStyle} />
            <div style={buttonTextStyle}>تمام تراکنش ها</div>
          </button>

          {/* <button
            style={buttonStyle}
            onClick={() => navigate("/noskhe")}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <FaReceipt size={36} style={iconStyle} />
            <div style={buttonTextStyle}>لیست نسخ تسویه شده</div>
          </button>

          <button
            style={buttonStyle}
            onClick={() => navigate("/NoTasvie")}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <FaHourglassHalf size={28} style={iconStyle} />
            <div style={buttonTextStyle}>لیست نسخ تسویه نشده</div>
          </button> */}
        </div>

        <div style={{ marginTop: "3rem", textAlign: "center" }}>
          <BackButton
            onClickExtra={() => {
              if (cashier) {
                setShowConfirmModal(true);
                setPendingCashierAction("close");
              } else {
                navigate("/");
              }
            }}
          />
        </div>
      </div>
      {showConfirmModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: 12,
              textAlign: "center",
              minWidth: 300,
            }}
          >
            <p>
              {pendingCashierAction === "open"
                ? "آیا مطمئن هستید که می‌خواهید صندوق را باز کنید؟"
                : "آیا مطمئن هستید که می‌خواهید صندوق را ببندید؟"}
            </p>
            <div style={{ marginTop: "1.5rem" }}>
              <button
                onClick={async () => {
                  if (pendingCashierAction === "open") {
                    const sandoghData = {
                      sandoghNo: parseInt(sandoghNom),
                      receptionist: { username },
                      status: "open",
                    };
                    console.log(sandoghData);
                    const result = await window.electronAPI.sandoghState(
                      sandoghData
                    );
                    if (result.success) {
                      setCashier(true);
                      showToast(`صندوق توسط '${username}' باز شد`);
                    }
                  } else {
                    const sandoghData = {
                      sandoghNo: parseInt(sandoghNom),
                      receptionist: { username },
                      status: "close",
                    };
                    console.log(sandoghData);
                    const result = await window.electronAPI.closeSandogh(
                      sandoghData
                    );
                    if (result.success) {
                      setCashier(false);
                      showToast(`صندوق توسط '${username}' بسته شد`);
                    }
                  }
                  setShowConfirmModal(false);
                }}
                style={{
                  margin: "0 1rem",
                  // padding: "0.5rem 1rem",
                  padding: "6px 12px",
                  backgroundColor: "#6c757d",
                  border: "none",
                  borderRadius: 6,
                  color: "#fff",
                  cursor: "pointer",
                  fontFamily: "IRANSans-Bold",
                }}
              >
                تایید
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  margin: "0 1rem",
                  // padding: "0.5rem 1rem",
                  padding: "6px 12px",
                  backgroundColor: "#dc3545",
                  border: "none",
                  borderRadius: 6,
                  color: "#fff",
                  cursor: "pointer",
                  fontFamily: "IRANSans-Bold",
                }}
              >
                لغو
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
