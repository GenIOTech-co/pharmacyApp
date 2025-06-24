// context/ToastContext.js
import React, { createContext, useContext, useState, useCallback } from "react";
import Toast from "../components/Toast";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [message, setMessage] = useState(null);

  const showToast = useCallback((msg, duration = 3000) => {
    setMessage({ msg, duration });
  }, []);

  const handleClose = () => setMessage(null);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && (
        <Toast
          message={message.msg}
          duration={message.duration}
          onClose={handleClose}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
