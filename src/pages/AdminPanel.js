import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import { useToast } from "./ToastContext"; // import from wherever you placed it

export default function AdminPanel() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { setUsername: setGlobalUsername } = useUser();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const result = await window.electronAPI.loginUser({
        username,
        password,
      });
      if (result) {
        setGlobalUsername(username);
        const sandoghNoBuffer = await window.electronAPI.sandoghNumber();
        console.log("dd: ", sandoghNoBuffer);
        showToast("ورود موفق");

        navigate("/home", {
          state: {
            sandoghNom: parseInt(sandoghNoBuffer),
          },
        });
      } else {
        showToast("نام کاربری یا کلمه عبور اشتباه است");
      }
    } catch (err) {
      console.error("Login error:", err);
      showToast("خطا در اتصال");
    }
  };

  const goToAdmin = async () => {
    try {
      const result = await window.electronAPI.loginAdmin({
        username,
        password,
      });
      if (result) {
        showToast("دسترسی به پنل مدیریت");
        navigate("/operators");
      } else {
        showToast("دسترسی به صورت ادمین امکانپذیر نیست");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      showToast("بروز خطا در اتصال به پنل مدیریت");
    }
  };

  const containerStyle = {
    padding: 30,
    fontFamily: "IRANSans-Bold, Arial, sans-serif",
    maxWidth: 400,
    margin: "100px auto",
    //border: "1px solid #ccc",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    direction: "rtl",
  };

  const labelStyle = {
    display: "block",
    marginBottom: 6,
    fontWeight: "bold",
    fontSize: 14,
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    marginBottom: 20,
    fontSize: 16,
    borderRadius: 6,
    border: "1px solid #ccc",
    outline: "none",
    boxSizing: "border-box",
  };

  const buttonStyle = {
    padding: "12px 20px",
    fontWeight: "bold",
    fontFamily: "IRANSans-Bold, Arial, sans-serif",
    cursor: "pointer",
    borderRadius: 6,
    border: "none",
    transition: "background-color 0.3s ease",
  };

  const loginButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#007bff",
    color: "white",
    fontSize: 12,
  };

  const adminButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#28a745",
    color: "white",
    // marginLeft: 10,
    fontSize: 12,
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: 30, fontSize: 20, textAlign: "center" }}>
        صندوق داروخانه بلوچ
      </h2>

      <label style={labelStyle}>نام کاربری:</label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={inputStyle}
        placeholder="نام کاربری خود را وارد کنید"
      />

      <label style={labelStyle}>پسورد:</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
        placeholder="رمز عبور خود را وارد کنید"
      />

      <div
        style={{
          display: "flex",
          //justifyContent: "center",
          flexDirection: "column",
          gap: 10,
          marginTop: 10,
        }}
      >
        <button
          onClick={handleLogin}
          style={loginButtonStyle}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#0056b3")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#007bff")
          }
        >
          ورود
        </button>
        <button
          onClick={goToAdmin}
          style={adminButtonStyle}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#1e7e34")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#28a745")
          }
        >
          برو به پنل مدیر
        </button>
      </div>
    </div>
  );
}
