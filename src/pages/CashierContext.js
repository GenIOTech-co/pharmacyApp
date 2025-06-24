import React, { createContext, useContext, useState } from "react";

// Create context
const CashierContext = createContext();

// Exported hook for easy usage
export const useCashier = () => useContext(CashierContext);

// Provider component
export const CashierProvider = ({ children }) => {
  const [cashier, setCashier] = useState(false); // initial state

  return (
    <CashierContext.Provider value={{ cashier, setCashier }}>
      {children}
    </CashierContext.Provider>
  );
};
