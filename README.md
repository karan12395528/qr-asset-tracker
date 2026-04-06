# 🚀 QR Asset Tracker - Enterprise Edition

> A complete, full-stack Enterprise Asset Tracking System using QR codes, Node.js, and MySQL.

![QR Asset Tracker](https://img.shields.io/badge/Status-Complete-success?style=for-the-badge)
![Tech](https://img.shields.io/badge/Stack-Node.js%20%7C%20MySQL%20%7C%20Vanilla%20JS-blue?style=for-the-badge)

---

## 📝 Project Overview

The **QR Asset Tracker** is a professional-grade solution designed for organizations to manage, track, and audit physical assets (laptops, equipment, furniture, etc.) in real-time. By leveraging QR code technology, users can instantly check assets in or out, view history, and manage inventory from any device.

### Why this is the "Best App":
- **End-to-End Workflow**: Covers everything from asset registration to real-time scanning.
- **Secure**: Built with JWT authentication and Bcrypt password hashing.
- **Auditable**: Every single action is logged in an immutable audit trail.
- **Responsive**: Clean, modern UI that works on desktops and mobile scanners.

---

## ✨ Key Features

### 🔐 1. Secure Authentication
- Multi-role support (`admin` vs `staff`).
- JWT-based session management.
- Secure password hashing.

### 📦 2. Asset Management
- Create, Update, and Delete assets.
- Automatic QR Code generation for every new asset.
- Categorization and location tracking.
- Status monitoring (`available` vs `checked-out`).

### 🔍 3. QR Scanning System
- Live camera integration for scanning asset tags.
- Instant lookup and action (Check-out/Return) upon scanning.

### ⏳ 4. Checkout & History
- Real-time tracking of who has which asset.
- Historical log of all movements.
- Notes field for checkout details.

### 📊 5. Administrative Dashboard
- High-level stats (Total assets, currently out, etc.).
- Recent activity feed.
- Audit logs for security compliance.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | HTML5, Vanilla CSS, JavaScript | High performance, no-build-step UI. |
| **Backend** | Node.js, Express.js | RESTful API and business logic. |
| **Database** | MySQL | Robust relational data storage. |
| **Auth** | JWT (JSON Web Tokens) | Stateless session management. |
| **Security** | Bcrypt.js | Industry-standard password hashing. |
| **QR Engine** | `qrcode` (npm) | server-side QR generation. |

---

## 📁 Project Structure

```text
qr-asset-tracker/
├── backend/                # Node.js API
│   ├── config/             # DB connection logic
│   ├── routes/             # API Endpoints (Auth, Assets, QR, etc.)
│   ├── server.js           # App entry point
│   └── .env                # Environment variables
├── frontend/               # Static UI
│   ├── css/                # Modern UI styles
│   ├── js/                 # API integration logic
│   ├── index.html          # Login Page
│   ├── dashboard.html      # Admin Overview
│   ├── assets.html         # Inventory Management
│   ├── scan.html           # QR Scanner Interface
│   └── history.html        # Audit & Logs
└── database/
    └── migration.sql       # Database schema & initial data
```

---

## 🗄️ Database Schema Description

The system relies on 4 core tables:

1.  **`users`**: Stores credentials, roles, and profile info.
2.  **`assets`**: The inventory catalog. Includes `tag` (unique QR ID), `status`, and `location`.
3.  **`checkouts`**: Relation table linking `users` to `assets` with timestamps.
4.  **`audit_log`**: A read-only record of every system event for security.

---

## 🔌 API Endpoints (Documentation)

### Auth
- `POST /api/auth/login` - Authenticate and get Token.
- `POST /api/auth/register` - Create new staff account (Admin only).

### Assets
- `GET /api/assets` - List all inventory.
- `POST /api/assets` - Register a new item (Generates QR).
- `GET /api/assets/:tag` - Find asset by QR scan.

### Transactions
- `POST /api/checkout/out` - Assign asset to a user.
- `POST /api/checkout/return` - Return asset to inventory.
- `GET /api/dashboard/stats` - Summary data for the home screen.

---

## 🚀 Local Installation

### 1. Database Setup
1. Open MySQL.
2. Run `database/migration.sql`.
3. Default login: `admin@qrtracker.com` / `admin123`.

### 2. Backend Setup
```bash
cd backend
npm install
# Update .env with your MySQL password
npm run dev
```

### 3. Frontend
Open `frontend/index.html` in your browser.

---

## ☁️ Deployment Summary

- **Backend**: Deploy to **Railway** or **Render** (Node.js + MySQL).
- **Frontend**: Deploy to **Netlify** or **Vercel** (Static site).
- **Environment**: Update `API_BASE` in frontend JS files to point to your live URL.

---

## 🛡️ Security Best Practices
- Keep your `JWT_SECRET` private.
- Always use **HTTPS** in production (required for the camera/QR scanner to work).
- Use the `audit_log` to monitor administrative changes.

---

*This project was built with ❤️ for maximum efficiency and enterprise-grade reliability.*
