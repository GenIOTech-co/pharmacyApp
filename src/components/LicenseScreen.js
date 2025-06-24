import React, { useState, useEffect } from "react";

export default function LicenseScreen({ onActivate }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [trialInfo, setTrialInfo] = useState({
    loading: true,
    showTrial: false,
    remainingDays: 0,
  });

  useEffect(() => {
    const checkTrialStatus = async () => {
      const result = await window.electronAPI.checkLicense();
      if (result.status === "trial") {
        setTrialInfo({
          loading: false,
          showTrial: true,
          remainingDays: result.remainingDays,
        });
      } else if (result.status === "expired") {
        setTrialInfo({ loading: false, showTrial: false, remainingDays: 0 });
      } else {
        // No license or full version
        setTrialInfo({ loading: false, showTrial: true, remainingDays: 7 });
      }
    };

    checkTrialStatus();
  }, []);

  const handleActivate = async () => {
    const isValid = validateKeyLocally(key);
    if (isValid) {
      await window.electronAPI.saveLicenseKey({ key: key, type: "full" });
      onActivate();
    } else {
      setError("سریال نا معتبر است");
    }
  };

  const handleTrial = async () => {
    const trialKey = "TRIAL-KEY-999";
    await window.electronAPI.saveLicenseKey({ key: trialKey, type: "trial" });
    onActivate();
  };

  const validateKeyLocally = (key) => {
    const validKeys = ["ABC-123-XYZ", "TRIAL-KEY-999"];
    return validKeys.includes(key.trim().toUpperCase());
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>فعالسازی نرم افزار</h2>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="شماره سریال را وارد نمایید"
          style={styles.input}
        />
        <button onClick={handleActivate} style={styles.button}>
          فعالسازی
        </button>

        {!trialInfo.loading && trialInfo.showTrial && (
          <button onClick={handleTrial} style={styles.trialButton}>
            استفاده آزمایشی
          </button>
        )}

        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    //backgroundColor: "#f5f5f5",
  },
  trialButton: {
    padding: "10px 20px",
    fontSize: "12px",
    backgroundColor: "#2196F3",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    width: "100%",
    marginTop: "10px",
    fontFamily: "IRANSans-Bold",
  },
  card: {
    padding: "30px",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "300px",
  },
  title: {
    marginBottom: "20px",
    fontSize: "20px",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    marginBottom: "15px",
    outline: "none",
    direction: "rtl",
  },
  button: {
    padding: "10px 20px",
    fontSize: "12px",
    backgroundColor: "#4CAF50",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    width: "100%",
    fontFamily: "IRANSans-Bold",
  },
  error: {
    color: "red",
    marginTop: "10px",
    fontSize: "14px",
  },
};
