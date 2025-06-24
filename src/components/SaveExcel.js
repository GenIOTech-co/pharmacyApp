
import React from "react";
import { FaSave } from "react-icons/fa";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function SaveExcel({ transactions }) {
  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("تراکنش‌ها", {
      properties: { rtl: true },
    });

    const headerStyle = {
      font: { bold: true, name: "IRANSans-Bold", size: 12 },
      alignment: { horizontal: "center", vertical: "middle" },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "1E90FF" } },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      },
      fontColor: { argb: "FFFFFF" },
    };

    const cellStyle = {
      font: { name: "IRANSans-Bold", size: 10 },
      alignment: { horizontal: "center", vertical: "middle" },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      },
    };

    const headers = [
      "شماره",
      "نام",
      "نوع عملیات",
      "مبلغ قابل دریافت",
      "پرداختی بیمار",
      "مبلغ دریافتی نقدی",
      "قابل برگشت",
      "مبلغ دریافت پوز",
      "وضعیت",
      "توضیحات",
      "ثبت‌کننده",
      "تاریخ",
    ];
    worksheet.addRow(headers);
    worksheet.columns = headers.map(() => ({ width: 20 }));
    worksheet.getRow(1).eachCell((cell) => {
      Object.assign(cell, headerStyle);
      cell.font = { ...headerStyle.font, color: { argb: "FFFFFF" } };
      cell.fill = headerStyle.fill;
      cell.alignment = headerStyle.alignment;
      cell.border = headerStyle.border;
    });

    Object.values(transactions).forEach((tx) => {
      const row = [
        tx.id,
        tx.name,
        tx.kind === "pay" ? "پرداخت" : "دریافت",
        tx.paymentprice,
        tx.customerpayment,
        tx.cash,
        tx.refund,
        tx.pose,
        tx.status === "pending" ? "در انتظار" : "تسویه",
        tx.details,
        tx.receptionist,
        tx.date_registered,
      ];
      const newRow = worksheet.addRow(row);
      newRow.eachCell((cell) => {
        Object.assign(cell, cellStyle);
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "تراکنش‌ها.xlsx");
  };
  const buttonStyle = {
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
    userSelect: "none",
  };

  // const iconStyle = {
  //   color: "#0f5132",
  // };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = "#badbcc";
    e.currentTarget.style.borderColor = "#a3c7b9";
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = "#d1e7dd";
    e.currentTarget.style.borderColor = "#badbcc";
  };
  return (
    <button
      onClick={handleExport}
      title="ذخیره فایل اکسل"
      style={buttonStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <FaSave size={20} />
      <span>ذخیره اکسل</span>
    </button>
  );
}
