import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import { useToast } from "./ToastContext";
import { FaTrash, FaEdit } from "react-icons/fa";
//const { ipcRenderer } = window.require("electron");

export default function Operators() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("admin");
  const [operators, setOperators] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editData, setEditData] = useState({
    oldUsername: "",
    newUsername: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [adminData, setAdminData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [operatorData, setOperatorData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const inputStyle = {
    width: "90%",
    padding: "8px 12px",
    marginBottom: 12,
    fontSize: 16,
    fontFamily: "IRANSans-Bold",
    borderRadius: 6,
    border: "1.5px solid #ccc",
    outline: "none",
    direction: "ltr",
  };

  const labelStyle = {
    display: "block",
    marginBottom: 6,
    fontFamily: "IRANSans-Bold",
    fontSize: 16,
  };

  const buttonStyle = {
    padding: "10px 18px",
    //marginRight: 12,
    marginTop: 8,
    fontFamily: "IRANSans-Bold",
    fontSize: 16,
    cursor: "pointer",
    borderRadius: 6,
    border: "none",
    backgroundColor: "#007bff",
    color: "white",
    minWidth: 100,
    transition: "background-color 0.3s",
  };

  const buttonClearStyle = {
    ...buttonStyle,
    backgroundColor: "#6c757d",
  };

  const tabButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#17a2b8",
    minWidth: 140,
  };

  const activeTabButtonStyle = {
    ...tabButtonStyle,
    backgroundColor: "#117a8b",
  };

  const containerStyle = {
    maxWidth: 600, // max width for the container
    minHeight: 600,
    margin: "40px auto", // center horizontally and some top margin
    padding: "30px 60px",
    backgroundColor: "#fdfdfd", // white or off-white background
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    fontFamily: "IRANSans-Bold",
    direction: "rtl",
  };

  const formSectionStyle = {
    marginBottom: 30,
  };

  // Handlers unchanged...

  const handleAdminUpdate = async () => {
    const { oldPassword, newPassword, confirmPassword } = adminData;
    if (!oldPassword || !newPassword || !confirmPassword) {
      return showToast("لطفا همه فیلدها را پر کنید");
    }
    if (newPassword !== confirmPassword)
      return showToast("رمزهای عبور مطابقت ندارند");

    const success = await window.electronAPI.updateAdmin({
      oldPassword,
      newPassword,
    });

    if (success) {
      showToast("مدیر با موفقیت به‌روزرسانی شد");
      setAdminData({
        oldPassword: "",
        newUsername: "",
        newPassword: "",
        confirmPassword: "",
      });
      navigate(-1);
    } else {
      showToast("رمز قدیمی اشتباه است");
    }
  };

  const handleCreateOperator = async () => {
    const { username, password, confirmPassword } = operatorData;
    if (!username || !password || !confirmPassword)
      return showToast("لطفا همه فیلدها را پر کنید");
    if (password !== confirmPassword)
      return showToast("رمزهای عبور مطابقت ندارند");

    const success = await window.electronAPI.createOperator({
      username,
      password,
    });

    if (success) {
      showToast("اپراتور با موفقیت ایجاد شد");
      setOperatorData({ username: "", password: "", confirmPassword: "" });
    } else {
      showToast("نام کاربری موجود است یا خطا رخ داده");
    }
  };
  const fetchOperators = async () => {
    const result = await window.electronAPI.getOperators();
    if (Array.isArray(result)) {
      setOperators(result);
    } else {
      setOperators([]);
      showToast("خطا در دریافت اپراتورها");
    }
  };
  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: 24, textAlign: "center" }}>
        مدیریت اپراتورها
      </h2>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 12,
          marginBottom: 30,
        }}
      >
        <button
          style={activeTab === "admin" ? activeTabButtonStyle : tabButtonStyle}
          onClick={() => setActiveTab("admin")}
        >
          تغییر اطلاعات مدیر
        </button>
        <button
          style={
            activeTab === "operator" ? activeTabButtonStyle : tabButtonStyle
          }
          onClick={() => setActiveTab("operator")}
        >
          ایجاد اپراتور جدید
        </button>
        <button
          style={activeTab === "list" ? activeTabButtonStyle : tabButtonStyle}
          onClick={() => {
            setActiveTab("list");
            fetchOperators();
          }}
        >
          لیست اپراتورها
        </button>
      </div>

      {activeTab === "admin" && (
        <div style={formSectionStyle}>
          <label style={labelStyle}>رمز عبور قبلی</label>
          <input
            type="password"
            style={inputStyle}
            value={adminData.oldPassword}
            onChange={(e) =>
              setAdminData({ ...adminData, oldPassword: e.target.value })
            }
          />

          <label style={labelStyle}>رمز عبور جدید</label>
          <input
            type="password"
            style={inputStyle}
            value={adminData.newPassword}
            onChange={(e) =>
              setAdminData({ ...adminData, newPassword: e.target.value })
            }
          />

          <label style={labelStyle}>تأیید رمز عبور جدید</label>
          <input
            type="password"
            style={inputStyle}
            value={adminData.confirmPassword}
            onChange={(e) =>
              setAdminData({ ...adminData, confirmPassword: e.target.value })
            }
          />

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              gap: 20,
              marginTop: 8,
            }}
          >
            <button style={buttonStyle} onClick={handleAdminUpdate}>
              ثبت تغییرات
            </button>
            <button
              style={buttonClearStyle}
              onClick={() =>
                setAdminData({
                  oldPassword: "",
                  newUsername: "",
                  newPassword: "",
                  confirmPassword: "",
                })
              }
            >
              پاک کردن
            </button>
          </div>
        </div>
      )}

      {activeTab === "operator" && (
        <div style={formSectionStyle}>
          <label style={labelStyle}>نام کاربری</label>
          <input
            type="text"
            style={inputStyle}
            value={operatorData.username}
            onChange={(e) =>
              setOperatorData({ ...operatorData, username: e.target.value })
            }
          />

          <label style={labelStyle}>رمز عبور</label>
          <input
            type="password"
            style={inputStyle}
            value={operatorData.password}
            onChange={(e) =>
              setOperatorData({ ...operatorData, password: e.target.value })
            }
          />

          <label style={labelStyle}>تأیید رمز عبور</label>
          <input
            type="password"
            style={inputStyle}
            value={operatorData.confirmPassword}
            onChange={(e) =>
              setOperatorData({
                ...operatorData,
                confirmPassword: e.target.value,
              })
            }
          />
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              gap: 20,
              marginTop: 8,
            }}
          >
            <button style={buttonStyle} onClick={handleCreateOperator}>
              ثبت اپراتور
            </button>
            <button
              style={buttonClearStyle}
              onClick={() =>
                setOperatorData({
                  username: "",
                  password: "",
                  confirmPassword: "",
                })
              }
            >
              پاک کردن
            </button>
          </div>
        </div>
      )}
      {activeTab === "list" && (
        <div style={formSectionStyle}>
          {operators.length === 0 ? (
            <p>هیچ اپراتوری یافت نشد.</p>
          ) : (
            <div
              style={{
                height: 300,
                overflowY: "scroll",
                border: "1px solid #ddd",
                padding: 10,
                borderRadius: 10,
              }}
            >
              <ul style={{ listStyle: "none", padding: 0 }}>
                {operators.map((op) => (
                  <li
                    key={op.username}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                      padding: 10,
                      border: "1px solid #ccc",
                      borderRadius: 6,
                    }}
                  >
                    <div
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <button
                        style={{
                          ...buttonStyle,
                          backgroundColor: "#dc3545",
                          padding: "3px 5px",
                          minWidth: 40,
                        }}
                        onClick={() => {
                          setSelectedOperator(op.username);
                          setShowConfirm(true);
                        }}
                      >
                        <FaTrash />
                      </button>
                      <button
                        style={{
                          ...buttonStyle,
                          backgroundColor: "#28a745",
                          padding: "3px 5px",
                          minWidth: 40,
                          marginRight: 10,
                        }}
                        onClick={() => {
                          setEditData({
                            oldUsername: op.username,
                            newUsername: op.username,
                            newPassword: "",
                            confirmPassword: "",
                          });
                          setShowEditDialog(true);
                        }}
                      >
                        <FaEdit />
                      </button>
                    </div>
                    <span>{op.username}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {showConfirm && (
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
              backgroundColor: "white",
              padding: 24,
              borderRadius: 8,
              textAlign: "center",
              width: 300,
            }}
          >
            <p>آیا از حذف این اپراتور مطمئن هستید؟</p>
            <div
              style={{
                marginTop: 20,
                display: "flex",
                gap: 10,
                justifyContent: "center",
              }}
            >
              <button
                style={{ ...buttonStyle, backgroundColor: "#dc3545" }}
                onClick={async () => {
                  const success = await window.electronAPI.removeOperator(
                    selectedOperator
                  );
                  if (success) {
                    showToast("اپراتور حذف شد");
                    fetchOperators();
                  } else {
                    showToast("خطا در حذف اپراتور");
                  }
                  setShowConfirm(false);
                  setSelectedOperator(null);
                }}
              >
                بله
              </button>
              <button
                style={buttonClearStyle}
                onClick={() => {
                  setShowConfirm(false);
                  setSelectedOperator(null);
                }}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditDialog && (
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
              backgroundColor: "white",
              padding: 24,
              borderRadius: 8,
              textAlign: "center",
              width: 320,
            }}
          >
            <h3>ویرایش اپراتور</h3>
            <label style={labelStyle}>نام کاربری جدید</label>
            <input
              type="text"
              style={inputStyle}
              value={editData.newUsername}
              onChange={(e) =>
                setEditData({ ...editData, newUsername: e.target.value })
              }
            />

            <label style={labelStyle}>رمز عبور جدید</label>
            <input
              type="password"
              style={inputStyle}
              value={editData.newPassword}
              onChange={(e) =>
                setEditData({ ...editData, newPassword: e.target.value })
              }
            />

            <label style={labelStyle}>تأیید رمز عبور</label>
            <input
              type="password"
              style={inputStyle}
              value={editData.confirmPassword}
              onChange={(e) =>
                setEditData({ ...editData, confirmPassword: e.target.value })
              }
            />

            <div
              style={{
                marginTop: 20,
                display: "flex",
                gap: 10,
                justifyContent: "center",
              }}
            >
              <button
                style={{ ...buttonStyle, backgroundColor: "#28a745" }}
                onClick={async () => {
                  const {
                    oldUsername,
                    newUsername,
                    newPassword,
                    confirmPassword,
                  } = editData;
                  console.log(editData);
                  if (!newUsername || !newPassword || !confirmPassword) {
                    showToast("لطفا همه فیلدها را پر کنید");
                    return;
                  }
                  if (newPassword !== confirmPassword) {
                    showToast("رمزهای عبور مطابقت ندارند");
                    return;
                  }

                  const success = await window.electronAPI.updateOperator({
                    oldUsername,
                    newUsername,
                    newPassword,
                  });

                  if (success) {
                    showToast("اپراتور با موفقیت به‌روزرسانی شد");
                    fetchOperators();
                    setShowEditDialog(false);
                  } else {
                    showToast("خطا در به‌روزرسانی اپراتور");
                  }
                }}
              >
                ثبت تغییرات
              </button>
              <button
                style={buttonClearStyle}
                onClick={() => setShowEditDialog(false)}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      <BackButton />
    </div>
  );
}
