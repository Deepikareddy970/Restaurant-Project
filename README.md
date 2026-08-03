# Guramrit Resto & Cafe - Full-Stack Table Booking & Menu System

This is the complete, production-ready, full-stack website codebase for **Guramrit Resto & Cafe** (under *Guramrit Food & Beverages Pvt Ltd*), a premium **Multi-Cuisine AC Restaurant** located in JK Pur, Rayagada, Odisha.

The codebase features a decoupled architecture:
- `/backend`: Node.js + Express API server with structured menu storage, database persistence for table reservations, strict server-side validation, and anti-spam rate-limiters.
- `/frontend`: Vite + Vanilla JS & CSS Single Page Application (SPA) with a dynamic menu search/filter browser, custom accordion sub-section layouts, and a multi-step booking wizard.

---

## 🛠️ Installation & Execution

Follow these steps to get both the backend and frontend services running concurrently on your local machine.

### Step 1: Clone & Navigate to Project Folder
Ensure you are in the root directory:
```bash
cd "RESTAURANT PROJECT"
```

### Step 2: Set Up the Backend
Open a new terminal window, navigate to the `/backend` folder, install dependencies, and start the API:
```bash
cd backend
npm install
npm run dev
```
*Note: Make sure your `.env` file is configured. It will run on `http://localhost:5000`.*

### Step 3: Set Up the Frontend
Open a second terminal window, navigate to the `/frontend` folder, install dependencies, and start the Vite development server:
```bash
cd frontend
npm install
npm run dev
```
*Vite will compile files and start the client portal on `http://localhost:3000`.*

Open `http://localhost:3000` in your web browser to browse the portal.

---

## 📁 Repository Structure
```
RESTAURANT PROJECT/
├── backend/
│   ├── data/
│   │   ├── menu.json          # 150+ item authentic menu database
│   │   └── bookings.json      # Persistent reservation logs
│   ├── public/
│   │   └── admin.html         # Secure Owner Dashboard
│   ├── server.js              # Express API server
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── index.html             # Customer landing page with SEO & Schema
│   ├── src/
│   │   ├── main.js            # Frontend JavaScript controller
│   │   └── styles/            # HSL design system stylesheet sheets
│   ├── package.json
│   └── README.md
└── README.md                  # This file
```

---

## 🔒 Authentic Business Rules (Enforced)
- **Legal Entity**: Guramrit Food & Beverages Pvt Ltd
- **Hours**:
  - Afternoon: 12:00 PM – 3:00 PM IST
  - Evening: 6:00 PM – 10:00 PM IST
- **Address**: Cooperative Building, JKPM Road, JK Pur, PIN: 765017, Rayagada District, Odisha
- **Reservations Line**: +91-860-221-7770
- **Instagram**: `@guramrit.fnb`

---

## 🔑 Owner Administration
To access the list of reservations:
1. Open the admin portal at `http://localhost:5000/admin` in your web browser.
2. Enter the passkey token defined as `ADMIN_SECRET` in your backend `.env` (default is `GuramritAdmin2026`).
3. View active customer reservations, guest counts, times, and occasion breakdowns in real time.
