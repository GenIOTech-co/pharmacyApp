import React, { useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import SaveExcel from "../components/SaveExcel";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCheck, FaPrint } from "react-icons/fa";
import { useUser } from "./UserContext";
import { useToast } from "./ToastContext";
//const { ipcRenderer } = window.require("electron");

export default function Setting() {
  const navigate = useNavigate();
  const location = useLocation();
  const sandoghNumber = location.state?.sandoghNom;
  const cashierState = location.state?.cashstate;
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
  const [cashData, setCashData] = useState([]);
  const [bankData, setBankData] = useState([]);
  const [currentDataType, setCurrentDataType] = useState("cash");

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
      const { cashData, bankData } = await window.electronAPI.getCash();
      console.log("cashData: ", cashData);
      console.log("bankData: ", bankData);
      if (Array.isArray(cashData)) {
        setCashData(cashData);
      }
      if (Array.isArray(bankData)) {
        setBankData(bankData);
      }

      // Set initial view to cash
      setTransactions(cashData || []);
    };

    fetchTransactions();
  }, []);

  // تابع برای گرفتن اولین کلمه
  const getFirstWord = (text) => {
    if (!text) return "";
    return text.trim().split(/\s+/)[0];
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
  const handleExtraClick = () => {
    navigate("/home", {
      state: { setCashierTrue: cashierState, sandoghNom: sandoghNumber },
    });
    // You can do any logic here: confirm(), save state, log, etc.
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
        <p style={{ textAlign: "center", fontFamily: "IRANSans-Bold" }}>
          نمایش داده‌های: {currentDataType === "cash" ? "صندوق نقد" : "بانک"}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "20px",
            alignItems: "center", // Ensure inputs and buttons are aligned vertically
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

          <button
            onClick={() => {
              setTransactions(cashData);
              setCurrentDataType("cash");
            }}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              backgroundColor:
                currentDataType === "cash" ? "#28a745" : "#4CAF50",
              color: "white",
              cursor: "pointer",
              marginLeft: 10,
              fontFamily: "IRANSans",
            }}
          >
            صندوق نقد
          </button>

          <button
            onClick={() => {
              setTransactions(bankData);
              setCurrentDataType("bank");
            }}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              backgroundColor:
                currentDataType === "bank" ? "#005f7f" : "#008CBA",
              color: "white",
              cursor: "pointer",
              marginLeft: 10,
              fontFamily: "IRANSans",
            }}
          >
            بانک
          </button>
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

                  <th style={thStyle}>نوع عملیات</th>

                  <th style={thStyle}>مبلغ نقدی</th>

                  <th style={thStyle}>وضعیت</th>

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

                    <td style={tdStyle}>
                      {tx.kind === "pay" ? "پرداخت" : "دریافت"}
                    </td>

                    <td style={tdStyle}>{tx.cash}</td>

                    <td style={tdStyle}>
                      {tx.status === "pending"
                        ? "در انتظار ارسال به بانک"
                        : tx.status === "full"
                        ? "برداشت نشده"
                        : tx.status === "empty"
                        ? "برداشت شده"
                        : "ارسال شده به بانک"}
                    </td>

                    <td style={tdStyle}>{tx.receptionist}</td>
                    <td style={tdStyle}>{tx.date_registered}</td>
                    <td style={tdStyle}>
                      <button
                        style={{
                          ...buttonStyle,

                          backgroundColor:
                            tx.status == "done" ||
                            tx.status == "pending" ||
                            tx.status == "empty" ||
                            tx.receptionist !== username
                              ? "#ccc"
                              : "#28a745",

                          padding: "3px 5px",
                          minWidth: 30,
                          marginRight: 10,
                          borderRadius: 5,
                          cursor:
                            tx.status == "done" ||
                            tx.status == "pending" ||
                            tx.status == "empty" ||
                            tx.receptionist !== username
                              ? "not-allowed"
                              : "pointer",
                        }}
                        disabled={
                          tx.status == "done" ||
                          tx.status == "pending" ||
                          tx.status == "empty" ||
                          tx.receptionist !== username
                            ? true
                            : false
                        }
                        onClick={() => {
                          setTransactionId(tx.id);
                          setShowForm(true);
                        }}
                      >
                        <FaCheck />
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
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            marginTop: "20px",
            gap: 20,
          }}
        >
          <BackButton onClickExtra={handleExtraClick} />
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
      </div>
      {showForm && (
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
            <p>آیا می خواهید پول نقد را از بانک برداشت کنید؟</p>
            <div style={{ marginTop: "1.5rem" }}>
              <button
                onClick={async () => {
                  const result = await window.electronAPI.updateBank({
                    transactionId,
                  });
                  console.log("result: ", result);
                  setTransactions(result);
                  setShowForm(false);
                }}
                style={{
                  margin: "0 1rem",
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
                onClick={() => setShowForm(false)}
                style={{
                  margin: "0 1rem",
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
