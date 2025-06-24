import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminPanel from "./pages/AdminPanel";
import HomePage from "./pages/HomePage";
import Amaliat from "./pages/Amaliat";

//import Sandogh from "./pages/Sandogh";
//import Settings from "./pages/Settings";
import HameNoskheha from "./pages/HameNoskheha";
import Setting from "./pages/Setting";
import Operators from "./pages/Operators";
import BackgroundWrapper from "./components/BackgroundWrapper";
import ExitApp from "./components/ExitApp";
import LicenseScreen from "./components/LicenseScreen";
import { useToast } from "./pages/ToastContext";
import { useCashier } from "./pages/CashierContext";

function App() {
  const [licensed, setLicensed] = useState(null);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);
  const { showToast } = useToast();
  const { cashier } = useCashier();
  //const isElectron = window?.electronAPI !== undefined;

  useEffect(() => {
    const checkLicenseState = async () => {
      if (1) {
        const license = await window.electronAPI.checkLicense("checkLicense");
        console.log(license);
        switch (license?.status) {
          case "full":
            console.log("Licensed: Full Version");
            setLicensed(true);
            break;
          case "trial":
            console.log(
              `Trial active - ${license.remainingDays} days remaining`
            );
            setLicensed(true);
            break;
          case "expired":
            showToast(
              "دوره آزمایشی شما تمام شده است. لطفا سریال فعالسازی را وارد نمایید"
            );
            setLicensed(false);
            break;
          default:
            showToast("سریال یافت نشد. لطفا سریال فعالسازی را وارد نمایید");
            setLicensed(false);
        }
      } else {
        // Fallback for browser mode
        setLicensed(true); // or false to simulate unlicensed
      }
    };

    checkLicenseState();
  }, []);
  useEffect(() => {
    // Whenever cashier changes, notify main process
    window.electronAPI.setCashierState(cashier);
  }, [cashier]);
  useEffect(() => {
    window.electronAPI.onTryExit(() => {
      console.log("here we are!");
      showToast("ابتدا باید صندوق را ببندید");
    });
  }, []);

  if (licensed === null) return <p>در حال بارگذاری...</p>;

  if (!licensed) {
    return (
      <BackgroundWrapper>
        <div style={{ position: "fixed", top: 20, left: 20, zIndex: 999 }}>
          <ExitApp />
        </div>
        <LicenseScreen onActivate={() => setLicensed(true)} />
      </BackgroundWrapper>
    );
  }

  return (
    <Router>
      <BackgroundWrapper>
        <div style={{ position: "fixed", top: 20, left: 20, zIndex: 999 }}>
          <ExitApp />
        </div>

        <Routes>
          <Route path="/" element={<AdminPanel />} />
          <Route path="/operators" element={<Operators />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/amal" element={<Amaliat />} />
       
          <Route path="/HameNoskheha" element={<HameNoskheha />} />
          <Route path="/setting" element={<Setting />} />
        </Routes>
      </BackgroundWrapper>
    </Router>
  );
}

export default App;
