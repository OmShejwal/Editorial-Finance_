# DYP ERMS - Expense Management System

A fully functional Expense Management System with automated workflows, real-time analytics, and OCR receipt scanning.

## 🚀 Local Development Links

- **Frontend (Stitch UI):** [http://localhost:3005/login.html](http://localhost:3005/login.html)
- **Backend API:** [http://localhost:5000/api](http://localhost:5000/api)

## 🛠️ Tech Stack

- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Frontend:** HTML5, Tailwind CSS, JavaScript (ES6+), Chart.js
- **Services:** Tesseract.js (OCR), JWT Authentication, Firebase Analytics

## 🌟 Key Features

- **Workflow Designer:** Configure multi-level approval logic (Unanimous, First to Act, Quorum).
- **Real-time Analytics:** Monthly Spend Velocity and Approved Spend graphs.
- **Role-based Access:** Specialized dashboards for Admin, Manager, and Employee.
- **Receipt Scanning:** Automated data extraction from receipts using OCR.
- **Batch Operations:** Approve multiple expenses with a single click.

## 🏁 Getting Started

1. **Install Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Seed the Database:**
   ```bash
   node backend/seed.js
   ```

3. **Start the Server:**
   ```bash
   npm start
   ```

4. **Launch Frontend:**
   Open `stitch/login.html` using a local live server (e.g., `npx http-server stitch -p 3005 -c-1`).

---
Developed by [Om Shejwal](https://github.com/OmShejwal)
