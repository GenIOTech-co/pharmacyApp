import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "./ToastContext";
import { useUser } from "./UserContext";

export default function Amaliat() {
  const navigate = useNavigate();
  const location = useLocation();
  const sandoghNumber = location.state?.sandoghNom;
  const { username } = useUser();
  const { showToast } = useToast();
  const defaultFormData = {
    sandoghNo: sandoghNumber,
    customerName: "مشتری",
    operationType: "پرداخت",
    mablaghGhablDaryafti: 0,
    pardakhtiBimar: 0,
    mablaghDaryaftiNaghdi: 0,
    ghablBargasht: 0,
    mablaghDaryaftPos: 0,
    chequeAmount: 0,
    chequeDate: "",
    bimeKargozar: "",
    tozihat: "بدون توضیح",
    status: "pending",
    insurance: "آزاد",
    receptionist: { username },
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [confirmDisabled, setConfirmDisabled] = useState(true);

  // Enable confirm when POS amount > 0
  useEffect(() => {
    setConfirmDisabled(formData.mablaghDaryaftPos <= 0);
  }, [formData.mablaghDaryaftPos]);

  const onChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : +value) : value,
    }));
  };

  const resetForm = () => {
    setFormData({ ...defaultFormData, receptionist: { username } });
  };

  const handleCancel = () => {
    resetForm();
    navigate("/home", {
      state: { setCashierTrue: true, sandoghNom: sandoghNumber },
    });
  };

  const handleNew = () => {
    resetForm();
    showToast("فرم جدید آماده شد");
  };

  const handleSave = async () => {
    const required = [
      "operationType",
      "mablaghGhablDaryafti",
      "pardakhtiBimar",
      "mablaghDaryaftiNaghdi",
      "ghablBargasht",
      "mablaghDaryaftPos",
      "chequeAmount",
      "status",
      "insurance",
      "receptionist",
    ];
    const missing = required.some((k) => {
      if (k === "receptionist") return !formData.receptionist?.username;
      return formData[k] === "" || formData[k] == null;
    });
    if (missing) return showToast("لطفاً همه فیلدها را پر کنید");
    if (parseInt(formData.mablaghGhablDaryafti) === 0) {
      return showToast("مبلغ قابل دریافت نمی‌تواند صفر باشد");
    }
    try {
      const res = await window.electronAPI.saveTransaction(formData);
      showToast(res.success ? "ذخیره شد" : "خطا در ذخیره‌سازی");
      if (res.success) resetForm();
    } catch {
      showToast("خطای ارتباط با پایگاه داده");
    }
  };

  const handleConfirm = () => {
    showToast("مبلغ تایید و به کارتخوان ارسال شد");
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.avatar}>{username}</div>
      </div>
      <div style={styles.container}>
        <h2 style={styles.title}>عملیات دریافت و پرداخت</h2>

        {[
          [
            { label: "نام مشتری", name: "customerName", type: "text" },
            {
              label: "نوع عملیات",
              name: "operationType",
              type: "select",
              options: ["پرداخت", "دریافت"],
            },
            {
              label: "کل مبلغ",
              name: "mablaghGhablDaryafti",
              type: "number",
            },
            {
              label: "وضعیت",
              name: "status",
              type: "radio",
              options: [
                { v: "done", l: "تسویه" },
                { v: "pending", l: "در انتظار" },
              ],
            },
          ],
          [
            { label: "مبلغ پرداختی", name: "pardakhtiBimar", type: "number" },
            {
              label: "وضعیت بیمه",
              name: "insurance",
              type: "select",
              options: ["بیمه", "آزاد"],
            },
            { label: "کارگزار بیمه", name: "bimeKargozar", type: "text" },
            { label: "قابل برگشت", name: "ghablBargasht", type: "number" },
          ],
          [
            { label: "نقدی", name: "mablaghDaryaftiNaghdi", type: "number" },
            { label: "کارت بانکی", name: "mablaghDaryaftPos", type: "number" },
            { label: "چک بانکی", name: "chequeAmount", type: "number" },
            { label: "تاریخ چک", name: "chequeDate", type: "text" },
          ],
        ].map((row, i) => (
          <div key={i} style={styles.row}>
            {row.map((f) => (
              <div key={f.name} style={styles.field}>
                <label style={styles.label}>{f.label}</label>
                {f.type === "text" || f.type === "number" ? (
                  <input
                    type={f.type}
                    name={f.name}
                    value={formData[f.name]}
                    onChange={onChange}
                    style={styles.input}
                    onFocus={(e) =>
                      e.target.value === "0" &&
                      onChange({ target: { name: f.name, value: "" } })
                    }
                  />
                ) : f.type === "select" ? (
                  <select
                    name={f.name}
                    value={formData[f.name]}
                    onChange={onChange}
                    style={styles.select}
                  >
                    {f.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  // <div style={{ ...styles.row, gap: 4 }}>
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    {f.options.map((opt) => (
                      <label key={opt.v} style={styles.label}>
                        <input
                          type="radio"
                          name={f.name}
                          value={opt.v}
                          checked={formData.status === opt.v}
                          onChange={onChange}
                        />{" "}
                        {opt.l}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

        <div>
          <label style={styles.label}>توضیحات</label>
          <textarea
            name="tozihat"
            value={formData.tozihat}
            onChange={onChange}
            style={styles.textarea}
          />
        </div>

        <div style={styles.buttons}>
          <button style={styles.cancel} onClick={handleCancel}>
            بازگشت
          </button>
          <button style={styles.new} onClick={handleNew}>
            جدید
          </button>
          <button style={styles.save} onClick={handleSave}>
            ذخیره
          </button>
          <button
            style={confirmDisabled ? styles.confirmDisabled : styles.confirm}
            onClick={handleConfirm}
            disabled={confirmDisabled}
          >
            ارسال به کارتخوان
          </button>
        </div>
      </div>
    </div>
  );
}

// central style
const styles = {
  page: {
    fontFamily: "IRANSans-Bold, Arial,sans-serif",
    direction: "rtl",
    // backgroundColor: "#f3f4f6",
    height: "90vh",
    display: "flex",
    flexDirection: "column",
  },

  container: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    padding: 20,
    margin: 0,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "90%",
    alignSelf: "center",
  },

  header: {
    padding: 16,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    backgroundColor: "#333a",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
  },

  title: { fontSize: 20, textAlign: "center", marginBottom: 24 },
  // row: {
  //   display: "flex",
  //   flexWrap: "nowrap",
  //   gap: 16,
  //   // marginBottom: 16,
  //   overflowX: "auto",
  //   // background: "#f9f9f9",
  //   padding: "8px",
  //   borderRadius: 8,
  // },
  // field: {
  //   flex: "0 0 220px", // fixed width field, no wrapping
  //   minWidth: 220,
  //   boxSizing: "border-box",
  // },
  row: {
    display: "flex",
    flexWrap: "wrap", // Allow wrap on small screens
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },

  field: {
    flex: "1 1 calc(25% - 12px)", // 4 per row minus gap
    minWidth: "160px", // Still usable on smaller screens
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
  },
  label: { display: "block", marginBottom: 6, fontSize: 13 },
  input: {
    width: "100%",
    padding: "8px 12px",
    fontSize: 13,
    borderRadius: 6,
    border: "1px solid #ccc",
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    appearance: "none",
    width: "100%",
    padding: "8px 12px",
    fontSize: 13,
    borderRadius: 6,
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "8px 12px",
    fontSize: 13,
    borderRadius: 6,
    border: "1px solid #ccc",
    minHeight: 100,
    resize: "vertical",
    boxSizing: "border-box",
  },
  buttons: { display: "flex", gap: 12, marginTop: 24 },
  cancel: {
    flex: 1,
    padding: "10px 0",
    background: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "IRANSans-Bold",
  },
  new: {
    flex: 1,
    padding: "10px 0",
    background: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "IRANSans-Bold",
  },
  save: {
    flex: 1,
    padding: "10px 0",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "IRANSans-Bold",
  },
  confirm: {
    flex: 1,
    padding: "10px 0",
    background: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "IRANSans-Bold",
  },
  confirmDisabled: {
    flex: 1,
    padding: "10px 0",
    background: "#ccc",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontFamily: "IRANSans-Bold",
  },
};
