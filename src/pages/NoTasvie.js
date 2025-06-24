import React, { useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import SaveExcel from "../components/SaveExcel";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEdit, FaPrint } from "react-icons/fa";
import { useUser } from "./UserContext";
import { useToast } from "./ToastContext";
//const { ipcRenderer } = window.require("electron");

export default function Setting() {
  const navigate = useNavigate();
  const location = useLocation();
  const sandoghNumber = location.state?.sandoghNom;
  const { username } = useUser();
  const [transactions, setTransactions] = useState([]);
  const { showToast } = useToast();
  const [selectedDetails, setSelectedDetails] = useState(null); // متن کامل انتخاب شده
  const [showForm, setShowForm] = useState(false);
  const [transactionId, setTransactionId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  //const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDisabled, setConfirmDisabled] = useState(true);
  // const filteredTransactions = transactions.filter((tx) => {
  //   const term = searchTerm.toLowerCase();
  //   const kindMap = {
  //     pay: "پرداخت",
  //     receive: "دریافت",
  //   };

  //   const statusMap = {
  //     pending: "در انتظار",
  //     done: "تسویه",
  //   };

  //   return (
  //     tx.name?.toLowerCase().includes(term) ||
  //     tx.sandoghNo?.toString().includes(term) ||
  //     tx.insurance?.toLowerCase().includes(term) ||
  //     tx.insuranceCompany?.toLowerCase().includes(term) ||
  //     tx.details?.toLowerCase().includes(term) ||
  //     tx.receptionist?.toLowerCase().includes(term) ||
  //     kindMap[tx.kind]?.includes(term) ||
  //     statusMap[tx.status]?.includes(term)
  //   );
  // });
  const kindMap = {
    pay: "پرداخت",
    receive: "دریافت",
  };

  const statusMap = {
    pending: "در انتظار",
    done: "تسویه",
  };

  const filteredTransactions = transactions.filter((tx) => {
    const terms = searchTerm.trim().toLowerCase().split(/\s+/); // split by space

    return terms.every((term) => {
      return (
        tx.name?.toLowerCase().includes(term) ||
        tx.sandoghNo?.toString().includes(term) ||
        tx.insurance?.toLowerCase().includes(term) ||
        tx.insuranceCompany?.toLowerCase().includes(term) ||
        tx.details?.toLowerCase().includes(term) ||
        tx.receptionist?.toLowerCase().includes(term) ||
        kindMap[tx.kind]?.includes(term) ||
        statusMap[tx.status]?.includes(term)
      );
    });
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const currentTransactions = filteredTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // const totalPages = Math.ceil(transactions.length / itemsPerPage);
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

  const handleCancel = () => {
    setShowForm(false);
    // setFormData({ ...defaultFormData, receptionist: { username } });
    // navigate(-1);
  };

  const handleSave = async () => {
    console.log(formData);
    if (!transactionId || isNaN(transactionId)) {
      return showToast("شناسه تراکنش معتبر نیست");
    }
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
  const handlePrint = () => {
    const tableElement = document.getElementById("sandoghTable");
    if (tableElement) {
      window.electronAPI.printTable(tableElement.outerHTML);
    } else {
      alert("Table not found!");
    }
  };
  // بستن popup
  const closePopup = () => setSelectedDetails(null);

  const onChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : +value) : value,
    }));
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

  const handleMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = "#badbcc";
    e.currentTarget.style.borderColor = "#a3c7b9";
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = "#d1e7dd";
    e.currentTarget.style.borderColor = "#badbcc";
  };
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
      position: "absolute",
      direction: "rtl",
      top: 120,
      overflowY: "auto",
      //display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: 20,
      margin: "auto",
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

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "20px",
          }}
        >
          <input
            type="text"
            placeholder="جستجو..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "8px",
              fontSize: "14px",
              width: "200px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              direction: "rtl",
              fontFamily: "IRANSans",
            }}
          />

          <input
            type="number"
            placeholder="تعداد ردیف"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(e.target.value)}
            style={{
              padding: "8px",
              fontSize: "12px",
              width: "100px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              direction: "rtl",
              fontFamily: "IRANSans-Bold",
              marginLeft: 10,
            }}
          />
        </div>

        {transactions.length === 0 ? (
          <p style={{ textAlign: "center" }}>تراکنشی ثبت نشده است</p>
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
                  <th style={thStyle}>مبلغ چک</th>
                  <th style={thStyle}>تاریخ چک</th>
                  <th style={thStyle}>وضعیت</th>
                  <th style={thStyle}>توضیحات</th>
                  <th style={thStyle}>ثبت کننده</th>
                  <th style={thStyle}>تاریخ</th>
                  <th style={thStyle}>ویرایش</th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.map((tx, index) => (
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
                    <td style={tdStyle}>{tx.checkPrice}</td>
                    <td style={tdStyle}>{tx.checkDate}</td>
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
                            tx.status == "done" || tx.receptionist !== username
                              ? "#ccc"
                              : "#28a745",

                          padding: "3px 5px",
                          minWidth: 30,
                          marginRight: 10,
                          borderRadius: 5,
                          cursor:
                            tx.status == "done" || tx.receptionist !== username
                              ? "not-allowed"
                              : "pointer",
                        }}
                        disabled={
                          tx.status == "done" || tx.receptionist !== username
                            ? true
                            : false
                        }
                        onClick={() => {
                          //   setSelectedTransactionIndex(index);
                          var bufferFormData = {
                            sandoghNo: sandoghNumber,
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
                            chequeAmount: parseInt(
                              transactions[index].checkPrice
                            ),
                            chequeDate: transactions[index].checkDate,
                            bimeKargozar: "...",
                            tozihat: transactions[index].details,
                            status: transactions[index].status,
                            insurance: transactions[index].insurance,
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
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 20,
                  gap: 10,
                }}
              >
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#eee",
                    border: "1px solid #ccc",
                    borderRadius: 5,
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    fontFamily: "IRANSans",
                  }}
                >
                  ◀
                </button>

                <span
                  style={{
                    fontFamily: "IRANSans-Bold",
                    fontSize: "14px",
                    padding: "0 10px",
                  }}
                >
                  صفحه {currentPage} از {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#eee",
                    border: "1px solid #ccc",
                    borderRadius: 5,
                    cursor:
                      currentPage === totalPages ? "not-allowed" : "pointer",
                    fontFamily: "IRANSans",
                  }}
                >
                  ▶
                </button>
              </div>
            </div>
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
          <SaveExcel transactions={currentTransactions} />
          <button
            onClick={handlePrint}
            title="پرینت"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              backgroundColor: "#d1e7dd",
              border: "1.5px solid #badbcc",
              borderRadius: 6,
              cursor: "pointer",
              fontFamily: "IRANSans-Bold, Arial, sans-serif",
              fontSize: 12,
              color: "#0f5132",
              marginBottom: "1rem",
              transition: "background-color 0.3s ease, border-color 0.3s ease",
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <FaPrint size={20} />
            <span>پرینت</span>
          </button>
        </div>
        {showForm && (
          <div style={styles.container}>
            <h2 style={styles.title}>ویرایش دریافت و پرداخت</h2>

            {[
              [
                {
                  label: "نام مشتری",
                  name: "customerName",
                  type: "text",
                  disabledState: true,
                },
                {
                  label: "نوع عملیات",
                  name: "operationType",
                  type: "select",
                  options: ["پرداخت", "دریافت"],
                  disabledState: true,
                },
                {
                  label: "کل مبلغ",
                  name: "mablaghGhablDaryafti",
                  type: "number",
                  disabledState: true,
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
                {
                  label: "مبلغ پرداختی",
                  name: "pardakhtiBimar",
                  type: "number",
                  disabledState: false,
                },
                {
                  label: "وضعیت بیمه",
                  name: "insurance",
                  type: "select",
                  options: ["بیمه", "آزاد"],
                  disabledState: true,
                },
                {
                  label: "کارگزار بیمه",
                  name: "bimeKargozar",
                  type: "text",
                  disabledState: true,
                },
                {
                  label: "قابل برگشت",
                  name: "ghablBargasht",
                  type: "number",
                  disabledState: false,
                },
              ],
              [
                {
                  label: "نقدی",
                  name: "mablaghDaryaftiNaghdi",
                  type: "number",
                  disabledState: false,
                },
                {
                  label: "کارت بانکی",
                  name: "mablaghDaryaftPos",
                  type: "number",
                  disabledState: false,
                },
                {
                  label: "چک بانکی",
                  name: "chequeAmount",
                  type: "number",
                  disabledState: false,
                },
                {
                  label: "تاریخ چک",
                  name: "chequeDate",
                  type: "text",
                  disabledState: false,
                },
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
                        disabled={f.disabledState}
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
                        disabled={f.disabledState}
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
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
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

              <button style={styles.save} onClick={handleSave}>
                اعمال تغییرات
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
