console.log("✅ preload.js loaded!");
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  exitApp: () => ipcRenderer.invoke("exit-app"),
  loginUser: (data) => ipcRenderer.invoke("login-user", data),
  loginAdmin: (data) => ipcRenderer.invoke("login-admin", data),
  updateAdmin: (data) => ipcRenderer.invoke("update-admin", data),
  updateOperator: (data) => ipcRenderer.invoke("update-operator", data),
  createOperator: (data) => ipcRenderer.invoke("create-operator", data),
  getOperators: () => ipcRenderer.invoke("get-operators"),
  removeOperator: (username) => ipcRenderer.invoke("remove-operator", username),
  getTransactions: () => ipcRenderer.invoke("get-transactions"),
  saveTransaction: (data) => ipcRenderer.invoke("save-transaction", data),
  updateTransaction: (data) => ipcRenderer.invoke("update-transaction", data),
  saveLicenseKey: (key) => ipcRenderer.invoke("saveLicenseKey", key),
  checkLicense: () => ipcRenderer.invoke("checkLicense"),
  setCashierState: (state) => ipcRenderer.send("cashier-state", state),
  onTryExit: (callback) => ipcRenderer.on("try-exit", callback),
  confirmExit: () => ipcRenderer.send("confirm-exit"),
  sandoghState: (data) => ipcRenderer.invoke("sandogh-state", data),
  closeSandogh: (data) => ipcRenderer.invoke("close-sandogh", data),
  sandoghNumber: (data) => ipcRenderer.invoke("get-sandogh-state", data),
  printTable: (tableHTML) => ipcRenderer.send("print-table", tableHTML),
  getCash: () => ipcRenderer.invoke("get-cash"),
  updateBank: (data) => ipcRenderer.invoke("update-bank", data),
});
