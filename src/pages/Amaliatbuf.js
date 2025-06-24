import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
//import BackButton from "../components/BackButton";
import { useToast } from "./ToastContext";
import { useUser } from "./UserContext";
//const { ipcRenderer } = window.require("electron");
export default function Amaliat() {
  const navigate = useNavigate();
  const { username } = useUser();
  const { showToast } = useToast();
  const [confirmDisabled, setConfirmDisabled] = useState(true); // default true
  const defaultFormData = {
    customerName: "مشتری",
    operationType: "پرداخت",
    mablaghGhablDaryafti: 0,
    pardakhtiBimar: 0,
    mablaghDaryaftiNaghdi: 0,
    ghablBargasht: 0,
    mablaghDaryaftPos: 0,
    tozihat: "بدون توضیح",
    status: "pending",
    receptionist: { username },
  };
  const [formData, setFormData] = useState(defaultFormData);
  console.log("default:", defaultFormData);
  const containerStyle = {
    maxWidth: "900px", // بیشتر از قبل
    margin: "auto",
    fontFamily: "IRANSans-Bold, Arial, sans-serif",
    direction: "rtl",
    padding: "2rem",
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
    overflow: "hidden",
  };

  const labelStyle = {
    display: "block",
    marginBottom: 6,
    fontSize: 12,
    // textAlign:"center",
  };

  const selectStyle = {
    flex: "1 1 200px",
    minWidth: "180px",
    padding: "8px 12px",
    fontSize: 11,
    borderRadius: 6,
    border: "1.5px solid #ccc",
    outline: "none",
    marginBottom: 16,
    fontFamily: "IRANSans-Bold",
  };

  const rowStyle = {
    display: "flex",
    flexWrap: "wrap", // اجازه به عناصر برای رفتن به خط بعدی
    gap: "10px",
    marginBottom: "16px",
    justifyContent: "space-between",
  };

  // Each input inside a row takes half width minus gap
  const inputStyle = {
    flex: "1 1 200px", // اجازه تغییر سایز و حداقل 200px
    minWidth: "180px", // حداقل عرض برای جلوگیری از ریز شدن زیاد
    padding: "8px 12px",
    fontSize: 12,
    borderRadius: 6,
    border: "1.5px solid #ccc",
    outline: "none",
    fontFamily: "IRANSans-Bold",
    direction: "rtl",
    textAlign: "right",
  };

  const textareaStyle = {
    width: "95%",
    padding: "8px 12px",
    fontSize: 12,
    borderRadius: 6,
    border: "1.5px solid #ccc",
    outline: "none",
    marginBottom: 16,
    fontFamily: "IRANSans-Bold",
    minHeight: 80,
    resize: "vertical",
  };

  const buttonsContainer = {
    display: "flex",
    gap: "12px",
    justifyContent: "space-between",
  };

  const buttonStyle = {
    flex: 1,
    padding: "10px 0",
    borderRadius: 8,
    fontSize: 12,
    fontFamily: "IRANSans-Bold",
    cursor: "pointer",
    border: "none",
    transition: "background-color 0.3s ease",
    color: "white",
  };

  const cancelBtnStyle = {
    ...buttonStyle,
    backgroundColor: "#dc3545",
  };

  const newBtnStyle = {
    ...buttonStyle,
    backgroundColor: "#6c757d",
  };

  const saveBtnStyle = {
    ...buttonStyle,
    backgroundColor: "#007bff",
  };

  // const confirmBtnStyle = {
  //   ...buttonStyle,
  //   backgroundColor: "#28a745",
  // };
  const confirmBtnStyle = {
    ...buttonStyle,
    backgroundColor: confirmDisabled ? "#cccccc" : "#28a745", // pale gray if disabled
    cursor: confirmDisabled ? "not-allowed" : "pointer",
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setFormData({ ...defaultFormData, receptionist: { username } });
    navigate("/home", { state: { setCashierTrue: true } });
  };

  const handleNew = () => {
    showToast("فرم جدید آماده شد");
    setFormData({ ...defaultFormData, receptionist: { username } });
  };

  const handleSave = async () => {
    const requiredFields = [
      "operationType", // mapped to `kind`
      "mablaghGhablDaryafti", // mapped to `paymentprice`
      "pardakhtiBimar", // mapped to `customerpayment`
      "mablaghDaryaftiNaghdi", // mapped to `cash`
      "ghablBargasht", // mapped to `refund`
      "mablaghDaryaftPos", // mapped to `pose`
      "status", // 'done' or 'pending'
      "receptionist", // object, we'll check if username exists
    ];

    const hasEmptyField = requiredFields.some((field) => {
      console.log("recept:", formData.receptionist.username);
      console.log("recept1:", formData.receptionist);
      if (field === "receptionist") {
        return !formData.receptionist || !formData.receptionist.username;
      }
      return (
        formData[field] === "" ||
        formData[field] === null ||
        formData[field] === undefined
      );
    });

    if (hasEmptyField) {
      showToast("لطفاً تمام فیلدهای ضروری را پر کنید");
      return;
    }

    try {
      const result = await window.electronAPI.saveTransaction(formData);
      if (result.success) {
        showToast("تراکنش ذخیره شد");
        setFormData({ ...defaultFormData, receptionist: { username } });
      } else {
        showToast("خطا در ذخیره‌سازی");
      }
    } catch (err) {
      console.error("IPC error:", err);
      showToast("خطای ارتباط با پایگاه داده");
    }
  };

  const handleConfirmAndSend = () => {
    showToast("مبلغ تایید و به کارتخوان ارسال شد");
  };

  return (
    <div>
      <div
        style={{
          position: "absolute",
          padding: 10,
          right: 0,
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
      <div style={{ padding: "50px 20px" }}>
        <div style={containerStyle}>
          <h2
            style={{
              fontFamily: "IRANSans-Bold",
              textAlign: "center",
              marginBottom: 30,
              fontSize: 18,
            }}
          >
            عملیات دریافت و پرداخت
          </h2>
          <div style={rowStyle}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle} htmlFor="pardakhtiBimar">
                نام مشتری
              </label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                style={inputStyle}
                value={formData.customerName || ""}
                onChange={handleChange}
                onFocus={(e) => {
                  if (e.target.value === "مشتری") {
                    setFormData((prev) => ({ ...prev, [e.target.name]: "" }));
                  }
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle} htmlFor="operationType">
                نوع عملیات
              </label>
              <select
                id="operationType"
                name="operationType"
                style={selectStyle}
                value={formData.operationType}
                onChange={handleChange}
              >
                <option value="پرداخت">پرداخت</option>
                <option value="دریافت">دریافت</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle} htmlFor="mablaghGhablDaryafti">
                مبلغ قابل دریافت
              </label>
              <input
                type="number"
                id="mablaghGhablDaryafti"
                name="mablaghGhablDaryafti"
                style={inputStyle}
                value={formData.mablaghGhablDaryafti}
                onChange={handleChange}
                onFocus={(e) => {
                  if (e.target.value === "0") {
                    setFormData((prev) => ({ ...prev, [e.target.name]: "" }));
                  }
                }}
              />
            </div>
          </div>
          <div style={rowStyle}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle} htmlFor="pardakhtiBimar">
                پرداختی بیمار
              </label>
              <input
                type="number"
                id="pardakhtiBimar"
                name="pardakhtiBimar"
                style={inputStyle}
                value={formData.pardakhtiBimar}
                onChange={handleChange}
                onFocus={(e) => {
                  if (e.target.value === "0") {
                    setFormData((prev) => ({ ...prev, [e.target.name]: "" }));
                  }
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle} htmlFor="operationType">
                وضعیت بیمه
              </label>
              <select
                id="operationType"
                name="operationType"
                style={selectStyle}
                value={formData.operationType}
                onChange={handleChange}
              >
                <option value="پرداخت">بیمه</option>
                <option value="دریافت">آزاد</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle} htmlFor="pardakhtiBimar">
                بیمه کننده
              </label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                style={inputStyle}
                value={formData.customerName || ""}
                onChange={handleChange}
                onFocus={(e) => {
                  if (e.target.value === "مشتری") {
                    setFormData((prev) => ({ ...prev, [e.target.name]: "" }));
                  }
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle} htmlFor="ghablBargasht">
                قابل برگشت
              </label>
              <input
                type="number"
                id="ghablBargasht"
                name="ghablBargasht"
                style={inputStyle}
                value={formData.ghablBargasht}
                onChange={handleChange}
                onFocus={(e) => {
                  if (e.target.value === "0") {
                    setFormData((prev) => ({ ...prev, [e.target.name]: "" }));
                  }
                }}
              />
            </div>
          </div>

          <div style={rowStyle}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle} htmlFor="mablaghDaryaftiNaghdi">
                مبلغ نقدی
              </label>
              <input
                type="number"
                id="mablaghDaryaftiNaghdi"
                name="mablaghDaryaftiNaghdi"
                style={inputStyle}
                value={formData.mablaghDaryaftiNaghdi}
                onChange={handleChange}
                onFocus={(e) => {
                  if (e.target.value === "0") {
                    setFormData((prev) => ({ ...prev, [e.target.name]: "" }));
                  }
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle} htmlFor="mablaghDaryaftiNaghdi">
                مبلغ چک
              </label>
              <input
                type="number"
                id="mablaghDaryaftiNaghdi"
                name="mablaghDaryaftiNaghdi"
                style={inputStyle}
                value={formData.mablaghDaryaftiNaghdi}
                onChange={handleChange}
                onFocus={(e) => {
                  if (e.target.value === "0") {
                    setFormData((prev) => ({ ...prev, [e.target.name]: "" }));
                  }
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle} htmlFor="mablaghDaryaftiNaghdi">
                تاریخ چک
              </label>
              <input
                type="number"
                id="mablaghDaryaftiNaghdi"
                name="mablaghDaryaftiNaghdi"
                style={inputStyle}
                value={formData.mablaghDaryaftiNaghdi}
                onChange={handleChange}
                onFocus={(e) => {
                  if (e.target.value === "0") {
                    setFormData((prev) => ({ ...prev, [e.target.name]: "" }));
                  }
                }}
              />
            </div>
          </div>

          <div style={rowStyle}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle} htmlFor="mablaghDaryaftPos">
                کارت بانکی
              </label>
              <input
                type="number"
                id="mablaghDaryaftPos"
                name="mablaghDaryaftPos"
                style={inputStyle}
                value={formData.mablaghDaryaftPos}
                onChange={handleChange}
                onFocus={(e) => {
                  if (e.target.value === "0") {
                    setFormData((prev) => ({ ...prev, [e.target.name]: "" }));
                  }
                }}
              />
            </div>

            {/* وضعیت (Status) options */}
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>وضعیت</label>
              <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
                <label style={labelStyle}>
                  <input
                    type="radio"
                    name="status"
                    value="done"
                    checked={formData.status === "done"}
                    onChange={handleChange}
                  />{" "}
                  تسویه
                </label>
                <label style={labelStyle}>
                  <input
                    type="radio"
                    name="status"
                    value="pending"
                    checked={formData.status === "pending"}
                    onChange={handleChange}
                  />{" "}
                  در انتظار
                </label>
              </div>
            </div>
          </div>

          <label style={labelStyle} htmlFor="tozihat">
            توضیحات
          </label>
          <textarea
            id="tozihat"
            name="tozihat"
            style={textareaStyle}
            value={formData.tozihat}
            onChange={handleChange}
            placeholder="..."
          />

          <div style={buttonsContainer}>
            <button type="button" style={cancelBtnStyle} onClick={handleCancel}>
              بازگشت
            </button>
            <button type="button" style={newBtnStyle} onClick={handleNew}>
              جدید
            </button>
            <button type="button" style={saveBtnStyle} onClick={handleSave}>
              ذخیره
            </button>
            <button
              type="button"
              style={confirmBtnStyle}
              onClick={handleConfirmAndSend}
              disabled={confirmDisabled}
            >
              ارسال به کارتخوان
            </button>
          </div>
          <div
            style={{
              marginTop: 20,
              justifyContent: "center",
              flexDirection: "row",
              display: "flex",
            }}
          >
            {/* <BackButton /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
