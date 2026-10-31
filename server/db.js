const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'jazlan.db');
const db = new Database(dbPath);

// Enable WAL mode for high performance and foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDatabase() {
  db.exec(`
    -- 1. PRODUCTS / MATERIALS TABLE
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      category TEXT DEFAULT 'Steel',
      hsn_code TEXT DEFAULT '7214',
      unit TEXT DEFAULT 'Tons', -- Tons, Kg, Pcs, Bundles
      default_sell_rate REAL DEFAULT 0,
      default_bought_rate REAL DEFAULT 0,
      gst_rate REAL DEFAULT 18.0,
      stock_qty REAL DEFAULT 100.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. CUSTOMERS TABLE
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE COLLATE NOCASE,
      phone TEXT,
      address TEXT,
      gstin TEXT,
      lifetime_purchase REAL DEFAULT 0,
      total_paid REAL DEFAULT 0,
      pending_credit REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. VEHICLES TABLE
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_number TEXT NOT NULL UNIQUE COLLATE NOCASE,
      model_type TEXT DEFAULT 'Truck',
      capacity_tons REAL DEFAULT 10.0,
      driver_name TEXT,
      driver_phone TEXT,
      status TEXT DEFAULT 'Active', -- Active, Maintenance, Inactive
      total_diesel_cost REAL DEFAULT 0,
      total_service_cost REAL DEFAULT 0,
      total_other_cost REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. VEHICLE EXPENSES TABLE (Diesel, Service, Other)
    CREATE TABLE IF NOT EXISTS vehicle_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL,
      expense_type TEXT NOT NULL, -- 'Diesel', 'Service', 'Other'
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      liters REAL DEFAULT 0, -- for diesel
      rate_per_liter REAL DEFAULT 0, -- for diesel
      service_type TEXT, -- for service (Engine Oil, Brake, Tyres, etc.)
      garage_name TEXT, -- for service
      category TEXT, -- for other (Toll, Fastag, Insurance, Permit, Batta, etc.)
      odometer_reading REAL DEFAULT 0,
      payment_mode TEXT DEFAULT 'Cash',
      receipt_no TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
    );

    -- 5. EMPLOYEES TABLE
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      employee_type TEXT NOT NULL, -- 'Driver', 'Loader', 'Sales', 'Billing Operator', 'Manager', 'Accountant'
      phone TEXT,
      salary_type TEXT DEFAULT 'Monthly', -- 'Monthly', 'Daily', 'Per Trip'
      base_salary REAL DEFAULT 0,
      total_paid_salary REAL DEFAULT 0,
      current_credit_balance REAL DEFAULT 0, -- Balance pending to be paid or advance
      status TEXT DEFAULT 'Active',
      join_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 6. EMPLOYEE SALARY / PAYMENT TRANSACTIONS
    CREATE TABLE IF NOT EXISTS employee_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      payment_type TEXT NOT NULL, -- 'Salary', 'Advance', 'Bonus', 'Batta'
      amount REAL NOT NULL,
      month_year TEXT, -- e.g. 'October 2026'
      payment_mode TEXT DEFAULT 'Cash',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );

    -- 7. SUPPLIERS TABLE
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company_name TEXT,
      phone TEXT,
      address TEXT,
      gstin TEXT,
      materials_supplied TEXT,
      total_purchases REAL DEFAULT 0,
      total_paid REAL DEFAULT 0,
      pending_credit REAL DEFAULT 0, -- Outstanding amount we have to pay
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 8. SUPPLIER PURCHASES TABLE
    CREATE TABLE IF NOT EXISTS supplier_purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_id INTEGER NOT NULL,
      purchase_date TEXT NOT NULL,
      invoice_no TEXT,
      product_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT DEFAULT 'Tons',
      bought_price_per_unit REAL NOT NULL,
      subtotal REAL NOT NULL,
      gst_rate REAL DEFAULT 18.0,
      cgst_amount REAL DEFAULT 0,
      sgst_amount REAL DEFAULT 0,
      tds_rate REAL DEFAULT 0,
      tds_amount REAL DEFAULT 0,
      freight_charges REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      paid_amount REAL DEFAULT 0,
      balance_due REAL DEFAULT 0,
      payment_status TEXT DEFAULT 'Pending', -- 'Paid', 'Partial', 'Pending'
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
    );

    -- 9. SUPPLIER PAYMENTS TABLE
    CREATE TABLE IF NOT EXISTS supplier_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_mode TEXT DEFAULT 'Bank Transfer',
      reference_no TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
    );

    -- 10. BILLS / INVOICES TABLE (Starting with JS001)
    CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bill_no TEXT NOT NULL UNIQUE, -- JS001, JS002, etc.
      bill_sequence INTEGER NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      customer_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      vehicle_id INTEGER,
      vehicle_number TEXT,
      product_id INTEGER,
      product_name TEXT NOT NULL,
      quantity REAL NOT NULL, -- e.g. tons or kg
      unit TEXT DEFAULT 'Tons',
      rate REAL NOT NULL,
      bought_price_per_unit REAL DEFAULT 0, -- For profit calculations
      rent_transport REAL DEFAULT 0,
      subtotal REAL NOT NULL,
      gst_rate REAL DEFAULT 18.0,
      cgst_amount REAL DEFAULT 0,
      sgst_amount REAL DEFAULT 0,
      tds_rate REAL DEFAULT 0,
      tds_amount REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      amount_received REAL DEFAULT 0,
      balance_due REAL DEFAULT 0,
      payment_mode TEXT DEFAULT 'Cash', -- Cash, UPI, Credit, Cheque, Bank Transfer
      payment_status TEXT DEFAULT 'Paid', -- Paid, Partial, Credit
      upi_reference TEXT,
      notes TEXT,
      biller_name TEXT DEFAULT 'Admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    -- 11. BILL PAYMENTS LEDGER (For when customers pay balance later)
    CREATE TABLE IF NOT EXISTS customer_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      bill_id INTEGER,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_mode TEXT DEFAULT 'Cash',
      reference_no TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    );

    -- 12. GENERAL ACCOUNTS / EXPENSES LEDGER
    CREATE TABLE IF NOT EXISTS accounts_ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      type TEXT NOT NULL, -- 'Income', 'Expense'
      category TEXT NOT NULL, -- 'Sales', 'Raw Material', 'Fuel', 'Vehicle Service', 'Salary', 'Tax CGST', 'Tax SGST', 'TDS', 'Office', 'Other'
      reference_type TEXT, -- 'Bill', 'SupplierPurchase', 'VehicleExpense', 'EmployeePayment', 'Direct'
      reference_id INTEGER,
      amount REAL NOT NULL,
      payment_mode TEXT DEFAULT 'Cash',
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 13. CUSTOMER ADJUSTMENTS / OPENING BALANCE TABLE
    CREATE TABLE IF NOT EXISTS customer_adjustments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'OPENING_BALANCE',
      ref_no TEXT DEFAULT 'OPENING-BAL',
      amount REAL NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    );
  `);

  // Create fast indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_bills_customer ON bills(customer_id);
    CREATE INDEX IF NOT EXISTS idx_bills_date ON bills(date);
    CREATE INDEX IF NOT EXISTS idx_bills_seq ON bills(bill_sequence);
    CREATE INDEX IF NOT EXISTS idx_veh_exp ON vehicle_expenses(vehicle_id);
    CREATE INDEX IF NOT EXISTS idx_emp_pay ON employee_payments(employee_id);
    CREATE INDEX IF NOT EXISTS idx_sup_pur ON supplier_purchases(supplier_id);
    CREATE INDEX IF NOT EXISTS idx_cust_adj ON customer_adjustments(customer_id);
  `);

  // Column migrations
  try {
    db.exec('ALTER TABLE supplier_purchases ADD COLUMN product_id INTEGER');
  } catch (e) {
    // Column already exists
  }
  try {
    db.exec('ALTER TABLE bills ADD COLUMN driver_name TEXT');
  } catch (e) {
    // Column already exists
  }
  try {
    db.exec('ALTER TABLE bills ADD COLUMN supplier_name TEXT');
  } catch (e) {
    // Column already exists
  }

  // Backfill driver_name for bills if missing
  try {
    db.exec(`
      UPDATE bills 
      SET driver_name = (
        SELECT v.driver_name 
        FROM vehicles v 
        WHERE v.id = bills.vehicle_id 
           OR (bills.vehicle_number IS NOT NULL AND bills.vehicle_number != '' AND UPPER(REPLACE(TRIM(v.vehicle_number), ' ', '')) = UPPER(REPLACE(TRIM(bills.vehicle_number), ' ', '')))
      )
      WHERE (driver_name IS NULL OR driver_name = '') 
        AND (vehicle_id IS NOT NULL OR (vehicle_number IS NOT NULL AND vehicle_number != ''));
    `);
  } catch (e) {
    // Column already exists
  }

  // Backfill supplier_name for bills if missing
  try {
    db.exec(`
      UPDATE bills
      SET supplier_name = (
        SELECT s.name
        FROM supplier_purchases sp
        JOIN suppliers s ON sp.supplier_id = s.id
        WHERE LOWER(TRIM(sp.product_name)) = LOWER(TRIM(bills.product_name))
        ORDER BY sp.id DESC LIMIT 1
      )
      WHERE (supplier_name IS NULL OR supplier_name = '');
    `);
  } catch (e) {
    // ignore
  }

  // Seed initial data if database is empty
  seedInitialData();
}

function getNextBillNumber() {
  const row = db.prepare('SELECT MAX(bill_sequence) as maxSeq FROM bills').get();
  const nextSeq = (row && row.maxSeq ? row.maxSeq : 0) + 1;
  const padded = String(nextSeq).padStart(3, '0');
  return { bill_no: `JS${padded}`, sequence: nextSeq };
}

function seedInitialData() {
  const prodCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  if (prodCount === 0) {
    const insertProd = db.prepare(`
      INSERT INTO products (name, category, hsn_code, unit, default_sell_rate, default_bought_rate, gst_rate, stock_qty)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertProd.run('Fe550D TMT Rebars 12mm', 'Steel', '7214', 'Tons', 54500, 49000, 18, 45.5);
    insertProd.run('Fe550D TMT Rebars 16mm', 'Steel', '7214', 'Tons', 54800, 49200, 18, 38.0);
    insertProd.run('Fe550D TMT Rebars 10mm', 'Steel', '7214', 'Tons', 55000, 49500, 18, 50.0);
    insertProd.run('Fe550D TMT Rebars 8mm', 'Steel', '7214', 'Tons', 55500, 49800, 18, 32.5);
    insertProd.run('MS Angles 50x50x5mm', 'Structural Steel', '7216', 'Tons', 52000, 47000, 18, 20.0);
    insertProd.run('MS Binding Wire (G.I)', 'Hardware', '7217', 'Kg', 78, 65, 18, 1200);
    insertProd.run('MS Square Pipes 40x40', 'Pipes', '7306', 'Tons', 56000, 50500, 18, 18.0);
  }

  const vehCount = db.prepare('SELECT COUNT(*) as count FROM vehicles').get().count;
  if (vehCount === 0) {
    const insertVeh = db.prepare(`
      INSERT INTO vehicles (vehicle_number, model_type, capacity_tons, driver_name, driver_phone, status, total_diesel_cost, total_service_cost, total_other_cost)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertVeh.run('TN 45 AB 1001', '10 Wheeler Tipper', 16.0, 'Murugan R', '9842100011', 'Active', 14500, 4200, 1200);
    insertVeh.run('TN 45 BE 2045', '6 Wheeler Lorry', 10.0, 'Karthik S', '9842100022', 'Active', 9200, 1800, 600);
    insertVeh.run('TN 45 CV 9088', 'Tata 407 Pickup', 4.5, 'Suresh Kumar', '9842100033', 'Active', 4800, 850, 300);

    // Seed some initial vehicle expenses
    const veh1 = db.prepare('SELECT id FROM vehicles WHERE vehicle_number = ?').get('TN 45 AB 1001');
    if (veh1) {
      const insExp = db.prepare(`
        INSERT INTO vehicle_expenses (vehicle_id, expense_type, date, amount, liters, rate_per_liter, service_type, garage_name, category, odometer_reading, payment_mode, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insExp.run(veh1.id, 'Diesel', '2026-10-25', 9200, 100, 92, null, null, null, 142500, 'Cash', 'HP Petrol Bunk Trichy');
      insExp.run(veh1.id, 'Service', '2026-10-26', 4200, 0, 0, 'Oil & Filter Change', 'Sri Vari Auto Works', null, 142600, 'UPI', 'Full synthetic engine oil replacement');
      insExp.run(veh1.id, 'Other', '2026-10-27', 1200, 0, 0, null, null, 'Toll & Fastag', 142800, 'Fastag', 'National Highway Toll charges');
    }
  }

  const empCount = db.prepare('SELECT COUNT(*) as count FROM employees').get().count;
  if (empCount === 0) {
    const insertEmp = db.prepare(`
      INSERT INTO employees (name, employee_type, phone, salary_type, base_salary, total_paid_salary, current_credit_balance, status, join_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertEmp.run('Murugan R', 'Driver', '9842100011', 'Monthly', 22000, 22000, 0, 'Active', '2025-01-10');
    insertEmp.run('Karthik S', 'Driver', '9842100022', 'Monthly', 20000, 15000, 5000, 'Active', '2025-03-15');
    insertEmp.run('Praveen Raj', 'Billing Operator', '9842100044', 'Monthly', 18000, 18000, 0, 'Active', '2025-02-01');
    insertEmp.run('Arun Kumar', 'Yard Staff / Loader', '9842100055', 'Daily', 650, 13000, 1300, 'Active', '2025-04-10');
  }

  const supCount = db.prepare('SELECT COUNT(*) as count FROM suppliers').get().count;
  if (supCount === 0) {
    const insertSup = db.prepare(`
      INSERT INTO suppliers (name, company_name, phone, address, gstin, materials_supplied, total_purchases, total_paid, pending_credit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertSup.run('Tata Tiscon Mills', 'Tata Steel Ltd', '044-28290000', 'Chennai Yard, Industrial Estate', '33AAACT1234F1Z1', 'Fe550D TMT Rebars', 485000, 400000, 85000);
    insertSup.run('JSW Steels Agency', 'JSW Steel Distributor', '0431-2450000', 'Trichy Bypass, Thuvakudi', '33AAACJ5678G1Z2', 'MS Angles, Channels, Pipes', 235000, 200000, 35000);
    insertSup.run('Kamachi Sponge & Power', 'Kamachi TMT Corp', '044-24567890', 'Gummidipoondi Works', '33AAACK9988H1Z3', 'TMT Rebars 8mm - 25mm', 150000, 150000, 0);
  }

  const custCount = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;
  if (custCount === 0) {
    const insertCust = db.prepare(`
      INSERT INTO customers (name, phone, address, gstin, lifetime_purchase, total_paid, pending_credit)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertCust.run('Raja Builders', '9842212345', '12 Anna Nagar, Trichy', '33ABCDE1234F1Z5', 218000, 168000, 50000);
    insertCust.run('Kavitha Constructions', '9842323456', '45 Salai Road, Woraiyur', '33BCDEF2345G1Z6', 163500, 163500, 0);
    insertCust.run('Senthil Kumar Infrastructure', '9842434567', '78 Thillai Nagar, Trichy', '33CDEFG3456H1Z7', 109000, 70000, 39000);
  }

  const billCount = db.prepare('SELECT COUNT(*) as count FROM bills').get().count;
  if (billCount === 0) {
    // Seed initial bills starting from JS001
    const cust1 = db.prepare('SELECT id, name FROM customers WHERE name = ?').get('Raja Builders');
    const veh1 = db.prepare('SELECT id, vehicle_number FROM vehicles WHERE vehicle_number = ?').get('TN 45 AB 1001');
    const prod1 = db.prepare('SELECT id, name, default_sell_rate, default_bought_rate FROM products WHERE name LIKE ?').get('%12mm%');

    if (cust1 && veh1 && prod1) {
      const insBill = db.prepare(`
        INSERT INTO bills (
          bill_no, bill_sequence, date, time, customer_id, customer_name,
          vehicle_id, vehicle_number, product_id, product_name,
          quantity, unit, rate, bought_price_per_unit, rent_transport,
          subtotal, gst_rate, cgst_amount, sgst_amount, tds_rate, tds_amount,
          total_amount, amount_received, balance_due, payment_mode, payment_status,
          upi_reference, notes, biller_name
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?
        )
      `);

      // JS001
      insBill.run(
        'JS001', 1, '2026-10-28', '10:30 AM', cust1.id, cust1.name,
        veh1.id, veh1.vehicle_number, prod1.id, prod1.name,
        4.0, 'Tons', 54500, 49000, 1500,
        218000, 18, 19620, 19620, 0, 0,
        258740, 208740, 50000, 'UPI', 'Partial',
        'UPI-984221199', 'Site delivery at Trichy Bypass bypass bridge', 'Admin'
      );

      // JS002
      const cust2 = db.prepare('SELECT id, name FROM customers WHERE name = ?').get('Kavitha Constructions');
      insBill.run(
        'JS002', 2, '2026-10-29', '11:15 AM', cust2.id, cust2.name,
        veh1.id, veh1.vehicle_number, prod1.id, prod1.name,
        3.0, 'Tons', 54500, 49000, 1000,
        163500, 18, 14715, 14715, 0, 0,
        193930, 193930, 0, 'Cash', 'Paid',
        null, 'Direct yard pickup', 'Admin'
      );
    }
  }
}

// Helper function to update customer lifetime totals
function recalculateCustomer(customerId) {
  const row = db.prepare(`
    SELECT
      COALESCE(SUM(total_amount), 0) as totalPurchase,
      COALESCE(SUM(amount_received), 0) as totalReceived,
      COALESCE(SUM(balance_due), 0) as totalBalance
    FROM bills
    WHERE customer_id = ?
  `).get(customerId);

  const directPayments = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as totalDirect
    FROM customer_payments
    WHERE customer_id = ?
  `).get(customerId).totalDirect;

  let totalAdjustments = 0;
  try {
    const adjRow = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as totalAdj
      FROM customer_adjustments
      WHERE customer_id = ?
    `).get(customerId);
    if (adjRow) totalAdjustments = adjRow.totalAdj;
  } catch (e) {}

  const totalPaid = (row ? row.totalReceived : 0) + directPayments;
  const lifetimePurchase = (row ? row.totalPurchase : 0) + totalAdjustments;
  const pendingCredit = Math.max(0, lifetimePurchase - totalPaid);

  db.prepare(`
    UPDATE customers
    SET lifetime_purchase = ?, total_paid = ?, pending_credit = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(lifetimePurchase, totalPaid, pendingCredit, customerId);
}

// Helper function to update vehicle totals
function recalculateVehicle(vehicleId) {
  const diesel = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total FROM vehicle_expenses WHERE vehicle_id = ? AND expense_type = 'Diesel'
  `).get(vehicleId).total;

  const service = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total FROM vehicle_expenses WHERE vehicle_id = ? AND expense_type = 'Service'
  `).get(vehicleId).total;

  const other = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total FROM vehicle_expenses WHERE vehicle_id = ? AND expense_type = 'Other'
  `).get(vehicleId).total;

  db.prepare(`
    UPDATE vehicles
    SET total_diesel_cost = ?, total_service_cost = ?, total_other_cost = ?
    WHERE id = ?
  `).run(diesel, service, other, vehicleId);
}

// Helper function to update employee credit balance
function recalculateEmployee(employeeId) {
  const totalPaid = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total FROM employee_payments WHERE employee_id = ?
  `).get(employeeId).total;

  db.prepare(`
    UPDATE employees
    SET total_paid_salary = ?
    WHERE id = ?
  `).run(totalPaid, employeeId);
}

// Helper function to update supplier totals
function recalculateSupplier(supplierId) {
  const purchases = db.prepare(`
    SELECT
      COALESCE(SUM(total_amount), 0) as totalPurchase,
      COALESCE(SUM(paid_amount), 0) as totalPaidInPurchases
    FROM supplier_purchases
    WHERE supplier_id = ?
  `).get(supplierId);

  const directPayments = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as totalDirect
    FROM supplier_payments
    WHERE supplier_id = ?
  `).get(supplierId).totalDirect;

  const totalPurchases = purchases ? purchases.totalPurchase : 0;
  const totalPaid = (purchases ? purchases.totalPaidInPurchases : 0) + directPayments;
  const pendingCredit = Math.max(0, totalPurchases - totalPaid);

  db.prepare(`
    UPDATE suppliers
    SET total_purchases = ?, total_paid = ?, pending_credit = ?
    WHERE id = ?
  `).run(totalPurchases, totalPaid, pendingCredit, supplierId);
}

module.exports = {
  db,
  initDatabase,
  getNextBillNumber,
  recalculateCustomer,
  recalculateVehicle,
  recalculateEmployee,
  recalculateSupplier
};
