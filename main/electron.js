const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const db = require("./database"); // Your DB connection
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");

const licenseFile = path.join(app.getPath("userData"), "license.json");
let cashierState = false;
let win;
function hashPassword(password, salt = null) {
  salt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.createHmac("sha256", salt).update(password).digest("hex");
  return { salt, hash };
}

function verifyPassword(storedHash, storedSalt, passwordAttempt) {
  const attemptHash = crypto
    .createHmac("sha256", storedSalt)
    .update(passwordAttempt)
    .digest("hex");
  return storedHash === attemptHash;
}
function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    title: "داروخانه بلوچ",
    icon: path.join(__dirname, "../src/assets/pharmacy.png"),
    webPreferences: {
      preload: path.join(__dirname, "../preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
    },
  });

  //win.loadURL("http://localhost:3000");
  win.loadFile(path.join(__dirname, "../build/index.html"));

  // win.loadFile(path.join(__dirname, "../build/index.html")); // production
  return win;
}

app.whenReady().then(() => {
  win = createWindow(); // IMPORTANT: assign the returned BrowserWindow to `win`

  // Handle cashier state from renderer
  ipcMain.on("print-table", (event, tableHTML) => {
    const printWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      webPreferences: { contextIsolation: true },
    });

    const html = `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; padding: 20px; direction: rtl; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 8px; text-align: right; }
          </style>
        </head>
        <body>
          <h3>گزارش تراکنش‌ها</h3>
          ${tableHTML}
          <script>
            window.onload = () => {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.loadURL(
      "data:text/html;charset=utf-8," + encodeURIComponent(html)
    );
  });
  ipcMain.on("cashier-state", (event, state) => {
    cashierState = state;
  });

  // If user confirms forced exit
  ipcMain.on("confirm-exit", () => {
    win.destroy(); // force close without prompting
  });

  // Intercept window close
  win.on("close", (e) => {
    if (cashierState) {
      e.preventDefault(); // block exit
      win.webContents.send("try-exit"); // notify React to show confirmation/toast
    }
  });
  ipcMain.handle("saveLicenseKey", (event, { key, type }) => {
    try {
      const licenseData = {
        key,
        type,
        activated: true,
      };

      if (type === "trial") {
        licenseData.launchCount = 0; // start counter at zero
        // you can still store startDate if you want
        licenseData.startDate = new Date().toISOString();
      }

      fs.writeFileSync(licenseFile, JSON.stringify(licenseData));
      return { success: true };
    } catch (err) {
      console.error("Error saving license:", err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle("checkLicense", () => {
    try {
      if (!fs.existsSync(licenseFile)) return { status: "none" };

      const data = JSON.parse(fs.readFileSync(licenseFile, "utf8"));
      if (!data.activated) return { status: "inactive" };

      if (data.type === "full") {
        return { status: "full" };
      }

      if (data.type === "trial") {
        // Initialize startDate if missing
        if (!data.startDate) {
          data.startDate = new Date().toISOString();
          data.launchCount = 0;
          fs.writeFileSync(licenseFile, JSON.stringify(data));
        }

        // Initialize launchCount if missing
        if (typeof data.launchCount !== "number") {
          data.launchCount = 0;
        }

        const now = new Date();
        const startDate = new Date(data.startDate);
        const diffDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));

        // Increment launchCount
        data.launchCount++;

        // Save updated data
        fs.writeFileSync(licenseFile, JSON.stringify(data));

        // Check if either condition expired
        if (diffDays >= 3 || data.launchCount > 4) {
          return { status: "expired" };
        }

        // Return remaining days and launches
        return {
          status: "trial",
          remainingDays: 3 - diffDays,
          remainingLaunches: 3 - data.launchCount,
        };
      }

      return { status: "unknown" };
    } catch (err) {
      console.error("Error reading license:", err);
      return { status: "error", error: err.message };
    }
  });

  // Check license
  // ipcMain.handle("checkLicense", () => {
  //   if (!fs.existsSync(licenseFile)) return false;
  //   const data = JSON.parse(fs.readFileSync(licenseFile));
  //   return data.activated === true;
  // });
  console.log("LICENSE FILE PATH:", licenseFile);
  ipcMain.handle("exit-app", () => {
    app.quit();
  });
  // Login user (general)

  // Login user (general)
  ipcMain.handle("login-user", async (event, { username, password }) => {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM users WHERE username = ?",
        [username],
        (err, user) => {
          if (err) return reject(err);
          if (!user) return resolve(null);

          if (verifyPassword(user.password, user.salt, password)) {
            resolve(user);
          } else {
            resolve(null);
          }
        }
      );
    });
  });

  // Login admin specifically
  ipcMain.handle("login-admin", async (event, { username, password }) => {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM users WHERE username = ? AND state = 'admin'",
        [username],
        (err, admin) => {
          if (err) return reject(err);
          if (!admin) return resolve(null);

          if (verifyPassword(admin.password, admin.salt, password)) {
            resolve(admin);
          } else {
            resolve(null);
          }
        }
      );
    });
  });

  // Update admin credentials
  ipcMain.handle("update-admin", async (_, { oldPassword, newPassword }) => {
    return new Promise((resolve) => {
      db.get("SELECT * FROM users WHERE state = 'admin'", (err, admin) => {
        if (err || !admin) return resolve(false);

        if (!verifyPassword(admin.password, admin.salt, oldPassword))
          return resolve(false);

        // Hash new password with new salt
        const { salt, hash } = hashPassword(newPassword);

        db.run(
          "UPDATE users SET password = ?, salt = ? WHERE state = 'admin'",
          [hash, salt],
          (err) => {
            resolve(!err);
          }
        );
      });
    });
  });
  ipcMain.handle(
    "update-operator",
    async (_, { oldUsername, newUsername, newPassword }) => {
      return new Promise((resolve) => {
        db.get(
          "SELECT * FROM users WHERE username = ?",
          [oldUsername],
          (err, user) => {
            if (err || !user) return resolve(false);

            // Hash new password with new salt
            const { salt, hash } = hashPassword(newPassword);

            db.run(
              "UPDATE users SET username=? , password = ?, salt = ? WHERE username = ?",

              [newUsername, hash, salt, oldUsername],
              (err) => {
                resolve(!err);
              }
            );
          }
        );
      });
    }
  );

  // Create operator user
  ipcMain.handle("create-operator", async (_, { username, password }) => {
    return new Promise((resolve) => {
      // Hash password + salt before insert
      const { salt, hash } = hashPassword(password);

      db.run(
        "INSERT INTO users (username, password, salt, state) VALUES (?, ?, ?, 'operator')",
        [username, hash, salt],
        function (err) {
          resolve(!err);
        }
      );
    });
  });
  ipcMain.handle("get-operators", async () => {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT username FROM users WHERE state = 'operator'",
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  });

  ipcMain.handle("remove-operator", async (event, username) => {
    return new Promise((resolve, reject) => {
      db.run(
        "DELETE FROM users WHERE username = ?",
        [username],
        function (err) {
          if (err) return reject(err);
          resolve(this.changes > 0); // 'this' refers to the statement context
        }
      );
    });
  });
  ipcMain.handle("get-transactions", async () => {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM transactions ORDER BY id DESC", [], (err, rows) => {
        if (err) {
          console.error("DB Error:", err);
          resolve(null);
        } else {
          resolve(rows);
        }
      });
    });
  });

  // ipcMain.handle("save-transaction", async (event, formData) => {
  //   return new Promise((resolve, reject) => {
  //     const {
  //       sandoghNo,
  //       customerName,
  //       operationType,
  //       mablaghGhablDaryafti,
  //       pardakhtiBimar,
  //       mablaghDaryaftiNaghdi,
  //       ghablBargasht,
  //       mablaghDaryaftPos,
  //       chequeAmount,
  //       chequeDate,
  //       bimeKargozar,
  //       tozihat,
  //       status,
  //       insurance,
  //       receptionist,
  //     } = formData;

  //     const stmt = db.prepare(`
  //       INSERT INTO transactions (
  //         sandoghNo , kind, paymentprice, customerpayment, cash, refund, pose, checkPrice, checkDate,
  //         status, details, receptionist,insurance, insuranceCompany, name , receptionist
  //       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ? , ? , ?)
  //     `);

  //     stmt.run(
  //       parseInt(sandoghNo),
  //       operationType === "پرداخت" ? "pay" : "receive",
  //       parseInt(mablaghGhablDaryafti) || 0,
  //       parseInt(pardakhtiBimar) || 0,
  //       parseInt(mablaghDaryaftiNaghdi) || 0,
  //       parseInt(ghablBargasht) || 0,
  //       parseInt(mablaghDaryaftPos) || 0,
  //       parseInt(chequeAmount) || 0,
  //       chequeDate,
  //       status,
  //       tozihat || null,
  //       receptionist.username,
  //       insurance,
  //       bimeKargozar,
  //       customerName || null,
  //       receptionist,
  //       function (err) {
  //         if (err) {
  //           console.error("DB insert error:", err.message);
  //           reject(err.message);
  //         } else {
  //           resolve({ success: true, id: this.lastID });
  //         }
  //         stmt.finalize();
  //       }
  //     );
  //   });
  // });
  ipcMain.handle("save-transaction", async (event, formData) => {
    return new Promise((resolve, reject) => {
      const {
        sandoghNo,
        customerName,
        operationType,
        mablaghGhablDaryafti,
        pardakhtiBimar,
        mablaghDaryaftiNaghdi,
        ghablBargasht,
        mablaghDaryaftPos,
        chequeAmount,
        chequeDate,
        bimeKargozar,
        tozihat,
        status,
        insurance,
        receptionist,
      } = formData;

      const stmt = db.prepare(`
        INSERT INTO transactions (
          sandoghNo, kind, paymentprice, customerpayment, cash, refund, pose, checkPrice, checkDate,
          status, details, receptionist, insurance, insuranceCompany, name, receptionist
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        parseInt(sandoghNo),
        operationType === "پرداخت" ? "pay" : "receive",
        parseInt(mablaghGhablDaryafti) || 0,
        parseInt(pardakhtiBimar) || 0,
        parseInt(mablaghDaryaftiNaghdi) || 0,
        parseInt(ghablBargasht) || 0,
        parseInt(mablaghDaryaftPos) || 0,
        parseInt(chequeAmount) || 0,
        chequeDate,
        status,
        tozihat || null,
        receptionist.username,
        insurance,
        bimeKargozar,
        customerName || null,
        receptionist.username, // fix: probably a copy-paste mistake before
        function (err) {
          if (err) {
            console.error("DB insert error (transactions):", err.message);
            stmt.finalize();
            return reject(err.message);
          }

          // Insert into cashTran after transaction insertion
          const cashStmt = db.prepare(`
            INSERT INTO cashTran (sandoghNo, kind, cash, receptionist, status)
            VALUES (?, ?, ?, ?, 'pending')
          `);

          cashStmt.run(
            parseInt(sandoghNo),
            operationType === "پرداخت" ? "pay" : "receive",
            parseInt(mablaghDaryaftiNaghdi) || 0,
            receptionist.username,
            function (err2) {
              stmt.finalize();
              cashStmt.finalize();

              if (err2) {
                console.error("DB insert error (cashTran):", err2.message);
                return reject(err2.message);
              }

              return resolve({ success: true, id: this.lastID });
            }
          );
        }
      );
    });
  });

  // ipcMain.handle(
  //   "update-transaction",
  //   async (event, { formData, transactionId }) => {
  //     return new Promise((resolve, reject) => {
  //       const {
  //         sandoghNo,
  //         customerName,
  //         operationType,
  //         mablaghGhablDaryafti,
  //         pardakhtiBimar,
  //         mablaghDaryaftiNaghdi,
  //         ghablBargasht,
  //         mablaghDaryaftPos,
  //         chequeAmount,
  //         chequeDate,
  //         bimeKargozar,
  //         tozihat,
  //         status,
  //         insurance,
  //         receptionist,
  //       } = formData;

  //       const stmt = db.prepare(`
  //       UPDATE transactions SET
  //         customerpayment = ?,
  //         cash = ?,
  //         refund = ?,
  //         pose = ?,
  //         checkPrice = ?,
  //         checkDate = ?,
  //         status = ?,
  //         details = ?
  //       WHERE id = ?
  //     `);
  //       stmt.run(
  //         parseInt(pardakhtiBimar) || 0,
  //         parseInt(mablaghDaryaftiNaghdi) || 0,
  //         parseInt(ghablBargasht) || 0,
  //         parseInt(mablaghDaryaftPos) || 0,
  //         parseInt(chequeAmount) || 0,
  //         chequeDate,
  //         status,
  //         tozihat || null,
  //         transactionId,
  //         function (err) {
  //           stmt.finalize();

  //           if (err) {
  //             console.error("DB update error:", err.message);
  //             return reject(err.message);
  //           }

  //           // Now fetch updated list and resolve
  //           db.all(
  //             "SELECT * FROM transactions ORDER BY id ASC",
  //             [],
  //             (err, rows) => {
  //               if (err) {
  //                 console.error("DB fetch error:", err.message);
  //                 return reject(err.message);
  //               } else {
  //                 console.log("rows:", rows);
  //                 return resolve(rows);
  //               }
  //             }
  //           );
  //         }
  //       );
  //     });
  //   }
  // );
  ipcMain.handle(
    "update-transaction",
    async (event, { formData, transactionId }) => {
      return new Promise((resolve, reject) => {
        const {
          sandoghNo,
          customerName,
          operationType,
          mablaghGhablDaryafti,
          pardakhtiBimar,
          mablaghDaryaftiNaghdi,
          ghablBargasht,
          mablaghDaryaftPos,
          chequeAmount,
          chequeDate,
          bimeKargozar,
          tozihat,
          status,
          insurance,
          receptionist,
        } = formData;

        const stmt = db.prepare(`
          UPDATE transactions SET
            customerpayment = ?, 
            cash = ?, 
            refund = ?, 
            pose = ?, 
            checkPrice = ?,
            checkDate = ?,
            status = ?, 
            details = ? 
          WHERE id = ?
        `);

        stmt.run(
          parseInt(pardakhtiBimar) || 0,
          parseInt(mablaghDaryaftiNaghdi) || 0,
          parseInt(ghablBargasht) || 0,
          parseInt(mablaghDaryaftPos) || 0,
          parseInt(chequeAmount) || 0,
          chequeDate,
          status,
          tozihat || null,
          transactionId,
          function (err) {
            stmt.finalize();

            if (err) {
              console.error("DB update error:", err.message);
              return reject(err.message);
            }

            // ✅ Now update the corresponding row in cashTran with the same ID
            const cashStmt = db.prepare(`
              UPDATE cashTran SET
                sandoghNo = ?,
                kind = ?,
                cash = ?,
                receptionist = ?,
                status = 'pending'
              WHERE id = ?
            `);

            cashStmt.run(
              parseInt(sandoghNo),
              operationType === "پرداخت" ? "pay" : "receive",
              parseInt(mablaghDaryaftiNaghdi) || 0,
              receptionist.username,
              transactionId,
              function (err2) {
                cashStmt.finalize();

                if (err2) {
                  console.error("DB update error (cashTran):", err2.message);
                  return reject(err2.message);
                }

                // ✅ Return updated list
                db.all(
                  "SELECT * FROM transactions ORDER BY id ASC",
                  [],
                  (err3, rows) => {
                    if (err3) {
                      console.error("DB fetch error:", err3.message);
                      return reject(err3.message);
                    } else {
                      return resolve(rows);
                    }
                  }
                );
              }
            );
          }
        );
      });
    }
  );

  ipcMain.handle("get-sandogh-state", async () => {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT MAX(sandoghNo) AS maxSandoghNo FROM sandoghTable",
        [],
        (err, row) => {
          if (err) {
            console.error("DB Error:", err);
            reject(err);
          } else {
            const nextSandoghNo = row?.maxSandoghNo ? row.maxSandoghNo + 1 : 1;
            resolve(nextSandoghNo);
          }
        }
      );
    });
  });
  ipcMain.handle("sandogh-state", async (event, sandoghData) => {
    const { sandoghNo, receptionist, status } = sandoghData;
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO sandoghTable (
          sandoghNo, receptionist, status
        ) VALUES (?, ?, ?)
      `);

      stmt.run(sandoghNo, receptionist.username, status, function (err) {
        stmt.finalize(); // ✅ finalizing inside callback
        if (err) {
          console.error("DB insert error:", err.message);
          reject(err.message);
        } else {
          resolve({ success: true });
        }
      });
    });
  });
  // ipcMain.handle("close-sandogh", async (event, sandoghData) => {
  //   const { sandoghNo, receptionist, status } = sandoghData;
  //   return new Promise((resolve, reject) => {
  //     const stmt = db.prepare(`
  //       INSERT INTO sandoghTable (
  //         sandoghNo, receptionist, status
  //       ) VALUES (?, ?, ?)
  //     `);

  //     stmt.run(sandoghNo, receptionist.username, status, function (err) {
  //       stmt.finalize(); // ✅ finalizing inside callback
  //       if (err) {
  //         console.error("DB insert error:", err.message);
  //         reject(err.message);
  //       } else {
  //         resolve({ success: true });
  //       }
  //     });
  //   });
  // });
});
ipcMain.handle("get-cash", async () => {
  return new Promise((resolve, reject) => {
    const cashQuery = `SELECT * FROM cashTran WHERE cash > 0`;
    const bankQuery = `SELECT * FROM banktable`;

    const cashData = [];
    const bankData = [];

    db.all(cashQuery, [], (cashErr, cashRows) => {
      if (cashErr) {
        console.error("Error fetching from cashTran:", cashErr.message);
        return reject(cashErr.message);
      }

      cashData.push(...cashRows); // Save cash rows

      db.all(bankQuery, [], (bankErr, bankRows) => {
        if (bankErr) {
          console.error("Error fetching from banktable:", bankErr.message);
          return reject(bankErr.message);
        }

        bankData.push(...bankRows); // Save bank rows

        resolve({ cashData, bankData }); // Send both together
      });
    });
  });
});

ipcMain.handle("close-sandogh", async (event, sandoghData) => {
  const { sandoghNo, receptionist, status } = sandoghData;

  return new Promise((resolve, reject) => {
    // Step 1: Insert into sandoghTable
    const stmt = db.prepare(`
      INSERT INTO sandoghTable (sandoghNo, receptionist, status)
      VALUES (?, ?, ?)
    `);

    stmt.run(sandoghNo, receptionist.username, status, function (err) {
      stmt.finalize();
      if (err) {
        console.error("DB insert error (sandoghTable):", err.message);
        return reject(err.message);
      }

      // Step 2: Read all 'pending' cashTran rows for this sandoghNo
      db.all(
        `SELECT * FROM cashTran WHERE sandoghNo = ? AND status = 'pending'`,
        [sandoghNo],
        (err2, rows) => {
          if (err2) {
            console.error("DB select error (cashTran):", err2.message);
            return reject(err2.message);
          }

          // Step 3: Update their status to 'done'
          const updateStmt = db.prepare(`
            UPDATE cashTran SET status = 'done' WHERE sandoghNo = ? AND status = 'pending'
          `);
          updateStmt.run(sandoghNo, function (err3) {
            updateStmt.finalize();
            if (err3) {
              console.error("DB update error (cashTran):", err3.message);
              return reject(err3.message);
            }

            // Step 4: Calculate net cash (receive - pay)
            let totalReceive = 0;
            let totalPay = 0;

            rows.forEach((row) => {
              if (row.kind === "receive") totalReceive += row.cash;
              else if (row.kind === "pay") totalPay += row.cash;
            });

            const netCash = totalReceive - totalPay;
            const statusText = netCash > 0 ? "full" : "empty";

            // Step 5: Insert into banktable
            const insertBankStmt = db.prepare(`
              INSERT INTO banktable (sandoghNo, cash, receptionist, status)
              VALUES (?, ?, ?, ?)
            `);

            insertBankStmt.run(
              sandoghNo,
              netCash,
              receptionist.username,
              statusText,
              function (err4) {
                insertBankStmt.finalize();
                if (err4) {
                  console.error("DB insert error (banktable):", err4.message);
                  return reject(err4.message);
                }

                return resolve({ success: true, netCash });
              }
            );
          });
        }
      );
    });
  });
});
ipcMain.handle("update-bank", async (_, { transactionId }) => {
  return new Promise((resolve, reject) => {
    // First, update the status
    db.run(
      "UPDATE bankTable SET status = 'empty' WHERE id = ?",
      [transactionId],
      function (err) {
        if (err) {
          reject(err);
          return;
        }

        // After successful update, fetch all rows
        db.all("SELECT * FROM bankTable", (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows);
        });
      }
    );
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
