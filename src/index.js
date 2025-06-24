import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./fonts.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ToastProvider } from "./pages/ToastContext";
import { UserProvider } from "./pages/UserContext";
import { CashierProvider } from "./pages/CashierContext";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ToastProvider>
      <UserProvider>
        <CashierProvider>
          <App />
        </CashierProvider>
      </UserProvider>
    </ToastProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
