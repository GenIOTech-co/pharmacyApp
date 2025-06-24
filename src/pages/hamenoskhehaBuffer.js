import React, { useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import SaveExcel from "../components/SaveExcel";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { useUser } from "./UserContext";
import { useToast } from "./ToastContext";
//const { ipcRenderer } = window.require("electron");

export default function HameNoskheha() {
  const navigate = useNavigate();
  const location = useLocation();
  const sandoghNumber = location.state?.sandoghNom;
  const { username } = useUser();
  const [transactions, setTransactions] = useState([]);
  const { showToast } = useToast();
  const [selectedDetails, setSelectedDetails] = useState(null); // متن کامل انتخاب شده
  const [showForm, setShowForm] = useState(false);
  //const [selectedTransactionIndex, setSelectedTransactionIndex] =
  useState(null);
  const [transactionId, setTransactionId] = useState(null);
  // const defaultFormData = {
  //   customerName: "مشتری",
  //   operationType: "پرداخت",
  //   mablaghGhablDaryafti: 0,
  //   pardakhtiBimar: 0,
  //   mablaghDaryaftiNaghdi: 0,
  //   ghablBargasht: 0,
  //   mablaghDaryaftPos: 0,
  //   tozihat: "بدون توضیح",
  //   status: "pending",
  //   receptionist: { username },
  // };
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
    bimeKargozar: "...",
    tozihat: "بدون توضیح",
    status: "pending",
    insurance: "آزاد",
    receptionist: { username },
  };
  const [formData, setFormData] = useState(defaultFormData);
  console.log("default1:", defaultFormData);
  useEffect(() => {
    const fetchTransactions = async () => {
      const result = await window.electronAPI.getTransactions();
      if (Array.isArray(result)) {
        console.log("result:");
        console.log(result);
        setTransactions(result);
      } else {
        setTransactions([]);
        showToast("خطا در دریافت تراکنش‌ها");
      }
    };

    fetchTransactions();
  }, []);

  // تابع برای گرفتن اولین کلمه
  const getFirstWord = (text) => {
    if (!text) return "";
    return text.trim().split(/\s+/)[0];
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
    navigate(-1);
  };

  const handleSave = async () => {
    console.log(formData);
    if (!transactionId || isNaN(transactionId)) {
      return showToast("شناسه تراکنش معتبر نیست");
    }
    const requiredFields = [
      //  "operationType", // mapped to `kind`
      //  "mablaghGhablDaryafti", // mapped to `paymentprice`
      "pardakhtiBimar", // mapped to `customerpayment`
      "mablaghDaryaftiNaghdi", // mapped to `cash`
      "ghablBargasht", // mapped to `refund`
      "mablaghDaryaftPos", // mapped to `pose`
      "status", // 'done' or 'pending'
      "receptionist", // object, we'll check if username exists
    ];

    const hasEmptyField = requiredFields.some((field) => {
      if (field === "receptionist") {
        console.log(formData.receptionist);
        console.log(formData.receptionist.username);
        console.log(!formData.receptionist.username);
        console.log(!formData.receptionist);
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
      const result = await window.electronAPI.updateTransaction({
        formData,
        transactionId,
      });
      console.log(result);
      if (Array.isArray(result)) {
        showToast("تراکنش بروزرسانی گردید");
        console.log(result);
        setTransactions(result);
        setFormData({ ...defaultFormData, receptionist: { username } });
        setShowForm(false);
      } else {
        showToast("خطا در ذخیره‌سازی");
      }
    } catch (err) {
      console.error("IPC error:", err);
      showToast("خطای ارتباط با پایگاه داده");
    }
  };
  // بستن popup
  const closePopup = () => setSelectedDetails(null);
  const rowStyle = {
    display: "flex",
    gap: 16,
    marginBottom: 16,
  };
  const selectStyle = {
    width: "85%",
    padding: "8px 12px",
    fontSize: 16,
    borderRadius: 6,
    border: "1.5px solid #ccc",
    outline: "none",
    marginBottom: 16,
    fontFamily: "IRANSans-Bold",
    backgroundColor: "#eee",
  };
  const textareaStyle = {
    width: "95%",
    padding: "8px 12px",
    fontSize: 16,
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
    backgroundColor: "#dc3545",
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
  const inputStyle = {
    flex: 1,
    padding: "8px 12px",
    fontSize: 16,
    borderRadius: 6,
    border: "1.5px solid #ccc",
    outline: "none",
    fontFamily: "IRANSans-Bold",
    //direction: "ltr",
    direction: "rtl",
    textAlign: "right",
  };
  const labelStyle = {
    display: "block",
    marginBottom: 6,
    fontSize: 16,
  };
  const headerStyle = {
    fontSize: "1.5rem",
    marginBottom: "2rem",
    textAlign: "center",
    fontFamily: "IRANSans-Bold",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    direction: "rtl",
    fontFamily: "IRANSans",
  };

  const thStyle = {
    background: "#1E90FF",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "14px",
    padding: "8px",
    border: "1px solid #ccc",
    textAlign: "center",
  };

  const tdStyle = {
    padding: "8px",
    border: "1px solid #ccc",
    textAlign: "center",
    fontSize: "13px",
    //cursor: "pointer", // برای اینکه مشخص شود قابل کلیک است
    color: "#222",
    // textDecoration: "underline",
  };

  // استایل popup ساده
  const popupStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const popupContentStyle = {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "60%",
    minWidth: "30%",
    maxHeight: "60%",
    overflowY: "auto",
    fontFamily: "IRANSans-Bold",
    fontSize: "16px",
    direction: "rtl",
  };
  const tablediv = {
    //border: " 1px solid red",
    //maxWidth: "90%",
    maxHeight: "70vh",
    // height: "70vh",
    overflowY: "scroll",
  };

  return (
    <div>
      <div
        style={{
          position: "absolute",
          padding: 10,
          right: 0,
          top: 0,
          textAlign: "right",
          justifyContent: "center",
          alignItems: "center",
          // border: "1px solid black",
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
        <h2 style={headerStyle}>لیست تراکنش‌ها</h2>

        {transactions.length === 0 ? (
          <p style={{ textAlign: "center" }}>تراکنشی ثبت نشده است.</p>
        ) : (
          <div style={tablediv}>
            <table style={tableStyle} id="sandoghTable">
              <thead>
                <tr>
                  <th style={thStyle}>شماره</th>
                  <th style={thStyle}>شماره صندوق</th>
                  <th style={thStyle}>نام</th>
                  <th style={thStyle}>نوع عملیات</th>
                  <th style={thStyle}>مبلغ کل</th>
                  <th style={thStyle}>مبلغ پرداختی</th>
                  <th style={thStyle}>مبلغ نقدی</th>
                  <th style={thStyle}>بیمه</th>
                  <th style={thStyle}>کارگزار بیمه</th>
                  <th style={thStyle}>قابل برگشت</th>
                  <th style={thStyle}>مبلغ پوز</th>
                  <th style={thStyle}>وضعیت</th>
                  <th style={thStyle}>توضیحات</th>
                  <th style={thStyle}>ثبت کننده</th>
                  <th style={thStyle}>تاریخ</th>
                  <th style={thStyle}>ویرایش</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={tx.id}>
                    <td style={tdStyle}>{tx.id}</td>
                    <td style={tdStyle}>{tx.sandoghNo}</td>
                    <td style={tdStyle}>{tx.name}</td>
                    <td style={tdStyle}>
                      {tx.kind === "pay" ? "پرداخت" : "دریافت"}
                    </td>
                    <td style={tdStyle}>{tx.paymentprice}</td>
                    <td style={tdStyle}>{tx.customerpayment}</td>
                    <td style={tdStyle}>{tx.cash}</td>
                    <td style={tdStyle}>{tx.insurance}</td>
                    <td style={tdStyle}>{tx.insuranceCompany}</td>
                    <td style={tdStyle}>{tx.refund}</td>
                    <td style={tdStyle}>{tx.pose}</td>
                    <td style={tdStyle}>
                      {tx.status === "pending" ? "در انتظار" : "تسویه"}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        cursor: "pointer",
                        textDecoration: "underline",
                        color: "#0066cc",
                      }}
                      onClick={() => {
                        if (tx.details) setSelectedDetails(tx.details);
                      }}
                      title="برای مشاهده جزئیات کلیک کنید"
                    >
                      {/* Visible: First word */}
                      {getFirstWord(tx.details)}

                      {/* Hidden: Full text for Excel export */}
                      <span style={{ display: "none" }}>{tx.details}</span>
                    </td>

                    <td style={tdStyle}>{tx.receptionist}</td>
                    <td style={tdStyle}>{tx.date_registered}</td>
                    <td style={tdStyle}>
                      <button
                        style={{
                          ...buttonStyle,
                          backgroundColor:
                            tx.status === "done" ? "#ccc" : "#28a745",
                          padding: "3px 5px",
                          minWidth: 30,
                          marginRight: 10,
                          borderRadius: 5,
                        }}
                        disabled={tx.status === "done" ? true : false}
                        onClick={() => {
                          //   setSelectedTransactionIndex(index);
                          var bufferFormData = {
                            customerName: transactions[index].name,
                            operationType:
                              transactions[index].kind === "pay"
                                ? "پرداخت"
                                : "دریافت",
                            mablaghGhablDaryafti:
                              transactions[index].paymentprice,
                            pardakhtiBimar: transactions[index].customerpayment,
                            mablaghDaryaftiNaghdi: transactions[index].cash,
                            ghablBargasht: transactions[index].refund,
                            mablaghDaryaftPos: transactions[index].pose,
                            tozihat: transactions[index].details,
                            status: transactions[index].status,
                            receptionist: { username },
                          };
                          console.log("buffer:", bufferFormData);
                          setFormData(bufferFormData);
                          setTransactionId(tx.id);
                          setShowForm(true);
                        }}
                      >
                        <FaEdit />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedDetails && (
          <div style={popupStyle} onClick={closePopup}>
            <div
              style={popupContentStyle}
              onClick={(e) => e.stopPropagation()} // جلوگیری از بسته شدن popup با کلیک داخل آن
            >
              <h3
                style={{
                  fontFamily: "IRANSans-Bold",
                  fontSize: 14,
                  direction: "rtl",
                }}
              >
                جزئیات تراکنش
              </h3>
              <div
                style={{
                  overflowY: "scroll",
                  height: "50%",
                  width: "100%",
                  marginBottom: 10,
                }}
              >
                <p style={{ fontFamily: "IRANSans-Bold", fontSize: 10 }}>
                  {selectedDetails}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifySelf: "center",
                  width: "30%",
                }}
              >
                <button onClick={closePopup} style={buttonStyle}>
                  بستن
                </button>
              </div>
            </div>
          </div>
        )}
        {showForm && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "5%",
                left: "25%",
                maxWidth: 500,
                margin: "2rem auto",
                fontFamily: "IRANSans-Bold, Arial, sans-serif",
                direction: "rtl",
                padding: "1.5rem",
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                backgroundColor: "#fff",
              }}
            >
              <div style={rowStyle}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle} htmlFor="pardakhtiBimar">
                    نام مشتری
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    style={{ ...inputStyle, backgroundColor: "#eee" }}
                    value={formData.customerName}
                    readOnly
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
                    readOnly
                  >
                    <option value="پرداخت">پرداخت</option>
                    <option value="دریافت">دریافت</option>
                  </select>
                </div>
              </div>
              <div style={rowStyle}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle} htmlFor="mablaghGhablDaryafti">
                    مبلغ قابل دریافت
                  </label>
                  <input
                    type="number"
                    id="mablaghGhablDaryafti"
                    name="mablaghGhablDaryafti"
                    style={{ ...inputStyle, backgroundColor: "#eee" }}
                    value={formData.mablaghGhablDaryafti}
                    readOnly
                  />
                </div>

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
                      setFormData((prev) => ({ ...prev, [e.target.name]: "" }));
                    }}
                  />
                </div>
              </div>

              <div style={rowStyle}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle} htmlFor="mablaghDaryaftiNaghdi">
                    مبلغ دریافتی نقدی
                  </label>
                  <input
                    type="number"
                    id="mablaghDaryaftiNaghdi"
                    name="mablaghDaryaftiNaghdi"
                    style={inputStyle}
                    value={formData.mablaghDaryaftiNaghdi}
                    onChange={handleChange}
                    onFocus={(e) => {
                      setFormData((prev) => ({ ...prev, [e.target.name]: "" }));
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
                      setFormData((prev) => ({ ...prev, [e.target.name]: "" }));
                    }}
                  />
                </div>
              </div>

              <div style={rowStyle}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle} htmlFor="mablaghDaryaftPos">
                    مبلغ دریافت پوز
                  </label>
                  <input
                    type="number"
                    id="mablaghDaryaftPos"
                    name="mablaghDaryaftPos"
                    style={inputStyle}
                    value={formData.mablaghDaryaftPos}
                    onChange={handleChange}
                    onFocus={(e) => {
                      setFormData((prev) => ({ ...prev, [e.target.name]: "" }));
                    }}
                  />
                </div>

                {/* وضعیت (Status) options */}
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>وضعیت</label>
                  <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
                    <label>
                      <input
                        type="radio"
                        name="status"
                        value="done"
                        checked={formData.status === "done"}
                        onChange={handleChange}
                      />{" "}
                      تسویه
                    </label>
                    <label>
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
                <button
                  type="button"
                  style={cancelBtnStyle}
                  onClick={() => {
                    setShowForm(false);
                    setFormData(defaultFormData);
                  }}
                >
                  بستن
                </button>

                <button type="button" style={saveBtnStyle} onClick={handleSave}>
                  اعمال
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
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            marginTop: "20px",
            gap: 20,
          }}
        >
          <BackButton />
          {/* <SaveExcel
          tableId="sandoghTable"
          filename="transactions.xlsx"
          datetimeColumnIndex={12}
        /> */}
          <SaveExcel transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
