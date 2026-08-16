# 🎬 TicketPeChalo.in — Enterprise MERN Movie Booking Platform

[![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green?logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-5.0-lightgrey?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen?logo=mongodb)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-Upstash-red?logo=redis)](https://upstash.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.1-black?logo=socket.io)](https://socket.io/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payment--Gateway-blue?logo=razorpay)](https://razorpay.com/)
[![QA Score](https://img.shields.io/badge/QA%20Audit-9.5%2F10%20PASSED-success)](#-qa-audit--security-verification)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**TicketPeChalo.in** is an enterprise-grade, full-stack real-time movie ticket booking web application built using the modern MERN Stack (**MongoDB, Express 5, React 19, Node.js**), **Upstash Distributed Redis Locks**, **Socket.IO WebSockets**, and **Razorpay Payment Gateway**.

It features real-time seat locking with sub-millisecond Socket.IO updates, server-side authoritative payment price calculation, atomic multi-seat lock rollbacks, and a comprehensive Admin Management Dashboard.

---

## 📸 Screenshots & Visual Walkthrough

<div align="center">
  <table>
    <tr>
      <td width="50%">
        <img src="docs/images/homepage.png" alt="TicketPeChalo Homepage" width="100%"/>
        <p align="center"><b>🎬 Movie Discovery & Showtimes</b></p>
      </td>
      <td width="50%">
        <img src="docs/images/cart_checkout.png" alt="Seat Selection & Cart Checkout" width="100%"/>
        <p align="center"><b>💺 Real-Time Seat Map & Cart Breakdown</b></p>
      </td>
    </tr>
    <tr>
      <td width="50%">
        <img src="docs/images/booking_confirmed.png" alt="Booking Confirmation E-Ticket" width="100%"/>
        <p align="center"><b>🎟️ Instant E-Ticket Pass & QR Code</b></p>
      </td>
      <td width="50%">
        <img src="docs/images/my_bookings.png" alt="My Bookings Dashboard" width="100%"/>
        <p align="center"><b>📜 User Booking History & Status</b></p>
      </td>
    </tr>
  </table>
</div>

---

## ⚡ Architecture & Real-Time Flow

### 🔒 Distributed Seat Locking Architecture
```text
  [ Client Browser 1 ]          [ Client Browser 2 ]
          │                              │
          ├── (1) Click Seat H5          │
          ▼                              │
  [ React 19 Frontend ]                  │
          │                              │
   POST /api/booking/lock                │
          │                              │
          ▼                              │
  [ Express 5 Backend ]                  │
          │                              │
          ├─► (2) Redis SET key val EX 300 NX
          │        (Atomic EX/NX Distributed Lock)
          │                              │
          └─► (3) Socket.IO Broadcast ───┼─► (4) Instant UI Update
              `seatLocked` Event         │   (Seat H5 turns LOCKED/Yellow)
```

### 💳 Authoritative Payment Security Pipeline
```text
  [ User Cart Checkout ]
            │
     POST /api/payment/create-order
            │
            ▼
  ┌──────────────────────────────────────────────────────────┐
  │              Server-Side Price Calculation               │
  │  Ticket Price = seats.length * show.price               │
  │  Convenience Fee = ₹30.00                                │
  │  Taxable Base = Ticket Price + Convenience Fee           │
  │  CGST (9%) + SGST (9%)                                  │
  │  Authoritative Total = Math.round(Total * 100)           │
  └──────────────────────────────────────────────────────────┘
            │
            ├─► Reject & Ignore Client-Supplied `req.body.amount`
            ├─► Store Pending Booking in MongoDB
            └─► Issue Razorpay Order with Authoritative Amount
```

---

## 🚀 Key Features

### 👤 User Features
- 🎬 **Dynamic Movie Showcase**: Browse Now Showing, Trending, and Top-Rated movies with poster art, ratings, certificate tags, and genre filters.
- 🎭 **Theatre & Showtime Finder**: Select preferred show slots across multiple cinema chains (*PVR Icon*, *INOX*, *Cinepolis*) with live pricing.
- 💺 **Interactive 10x10 Seat Grid**: 100-seat layout featuring real-time visual seat states:
  - 🟢 **Available** (Green / Grey)
  - 🟡 **Locked** (Yellow — Active 300s Redis Lock)
  - ⬛ **Booked** (Black — Permanently Reserved in MongoDB)
- 🎟️ **Instant E-Ticket Generation**: Confirmed bookings generate digital passes complete with unique Booking IDs, seat allocations, theatre location, QR code, and payment transaction metadata.
- 📜 **Personal Booking History**: Protected `/my-bookings` route with 100% IDOR data isolation.

### ⚡ Distributed Concurrency & Real-Time Sync
- 🔒 **Redis Key-Value Seat Locks**: High-performance Upstash Redis locks (`SET key val EX 300 NX`) guarantee **max 1 owner per seat**.
- 🔄 **Atomic Multi-Seat Rollback**: Partial lock failures immediately trigger automated Lua unlock rollbacks for all previously acquired seats in the request.
- 📡 **Socket.IO Room Broadcasting**: Sub-millisecond WebSocket event emission (`seatLocked`, `seatUnlocked`, `seatBooked`) synchronized across all connected client browser tabs.
- ⏳ **Automated Lock Expiration**: 5-minute TTL background cron task releases unconfirmed pending seats.

### 🛡️ Security & Hardening
- 💳 **Price Manipulation Defense**: Backend strictly recalculates ticket price + convenience fee + GST. Client amount payloads (`amount = 1`, `0`, `-50`, `9999`) are completely ignored.
- 🔐 **HMAC-SHA256 Signature Verification**: Razorpay payment signatures verified server-side prior to confirming bookings.
- 🛡️ **JWT & Role-Based Access Control (RBAC)**: All protected routes and admin endpoints enforced with `protect` and `adminOnly` middlewares. Unauthenticated users are redirected to `/login`.
- 🔑 **Environment Secret Management**: Admin credentials and API keys stored strictly in `.env` configuration files.

### 👑 Admin Management Dashboard
- 📊 **Executive Metrics**: Live overview of Total Revenue, Total Bookings, Confirmed Transactions, Registered Users, and Active Movies.
- 🎬 **Movie CRUD**: Full admin capability to Create, Read, Update, and Delete movies with poster URLs, cast arrays, and showtime slots.
- 🎭 **Theatre CRUD**: Add, edit, and manage multiplex chains, screen capacities, and locations.
- 🎟️ **Show Management**: Schedule movie screenings with custom pricing and seat allocation trackers.
- 👥 **User & Transaction Auditing**: View paginated lists of all registered users and booking records.

---

## 🛠️ Technology Stack

| Domain | Framework / Library | Description |
| ------ | ------------------- | ----------- |
| **Frontend** | React 19, Vite 5, Tailwind CSS | High-performance single-page application |
| **Routing & Auth** | React Router 6, Axios, AuthContext | Client-side routing and JWT state management |
| **Backend** | Node.js, Express 5 | RESTful API server with middleware chain |
| **Database** | MongoDB Atlas, Mongoose 8 | Document-oriented primary database |
| **Caching & Locking**| Upstash Redis (`ioredis`) | High-speed distributed key-value locking |
| **Real-Time** | Socket.IO 4.8 | Low-latency WebSockets for seat synchronization |
| **Payments** | Razorpay Node SDK | Secured payment gateway order & signature verification |

---

## 🔌 API Reference

Base API Endpoint: `http://localhost:5000/api`

### 🔑 Authentication Routes
| Method | Endpoint | Description | Auth Required |
| ------ | -------- | ----------- | ------------- |
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT | No |

### 🎬 Movies & Shows Routes
| Method | Endpoint | Description | Auth Required |
| ------ | -------- | ----------- | ------------- |
| `GET` | `/api/movies` | Fetch all active movies | No |
| `GET` | `/api/movies/:id` | Fetch single movie details | No |
| `GET` | `/api/shows/movie/:movieId` | Fetch shows for a specific movie | No |
| `GET` | `/api/shows/:id` | Fetch single show details | No |
| `GET` | `/api/shows/:id/seats` | Fetch real-time seat status grid | Yes |

### 💺 Booking & Seat Lock Routes
| Method | Endpoint | Description | Auth Required |
| ------ | -------- | ----------- | ------------- |
| `POST` | `/api/booking/lock` | Acquire atomic Redis seat lock | Yes |
| `POST` | `/api/booking/unlock` | Release seat lock | Yes |
| `GET` | `/api/booking/my` | Fetch authenticated user's bookings | Yes |

### 💳 Payment Gateway Routes
| Method | Endpoint | Description | Auth Required |
| ------ | -------- | ----------- | ------------- |
| `POST` | `/api/payment/create-order` | Create Razorpay Order & Pending Booking | Yes |
| `POST` | `/api/payment/verify-payment` | Verify HMAC signature & confirm booking | Yes |
| `POST` | `/api/payment/cancel-order` | Cancel pending order & release seats | Yes |
| `POST` | `/api/payment/webhook` | Webhook listener for payment events | HMAC Header |

### 👑 Admin Routes
| Method | Endpoint | Description | Auth Required |
| ------ | -------- | ----------- | ------------- |
| `GET` | `/api/admin/stats` | Aggregate dashboard analytics | Admin |
| `GET` | `/api/admin/movies` | Paginated movie list | Admin |
| `POST` | `/api/admin/movies` | Create new movie | Admin |
| `PUT` | `/api/admin/movies/:id` | Update movie details | Admin |
| `DELETE` | `/api/admin/movies/:id` | Delete movie record | Admin |
| `POST` | `/api/theatres` | Create new theatre | Admin |
| `PUT` | `/api/theatres/:id` | Update theatre details | Admin |
| `DELETE` | `/api/theatres/:id` | Delete theatre record | Admin |
| `POST` | `/api/shows` | Schedule new show | Admin |
| `PUT` | `/api/shows/:id` | Update show price/time | Admin |
| `DELETE` | `/api/shows/:id` | Delete show schedule | Admin |

---

## 📊 QA Audit & Security Verification

The platform underwent a **3-Phase Adversarial QA Audit & Stress Test**:

- ✅ **5-User Same-Seat Concurrency Race (10/10 Rounds Passed)**: 5 concurrent browser clients attacked identical seats (`H5`). In 100% of test rounds, **exactly 1 winner** acquired the lock and **4 were rejected**, preserving single-ownership invariants.
- ✅ **3-User Overlapping Multi-Seat Race**: Verified that partial collisions immediately trigger atomic unlock rollbacks for free seats, avoiding orphan locks.
- ✅ **Price Tampering Defense**: Passed 11 payload injection attacks (`amount = 1`, `0`, `-50`, `9999999`, `null`, `NaN`). Server-side total calculation enforced 100% of the time.
- ✅ **IDOR Data Isolation**: Verified 0 booking history overlap across all test user accounts.
- **Overall QA Score**: **`9.5 / 10` (PASSED & PRODUCTION READY)**. Detailed reports available in [`QA_REPORT.md`](QA_REPORT.md) and [`FINAL_STRESS_TEST_REPORT.md`](FINAL_STRESS_TEST_REPORT.md).

---

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** (Local instance or MongoDB Atlas URI)
- **Redis** (Local instance or Upstash Cloud Redis URI)

### 1. Clone Repository
```bash
git clone https://github.com/lakshr2004/TicketPeChalo.in.git
cd TicketPeChalo.in
```

### 2. Backend Configuration
Create `.env` inside `backend/`:
```env
MONGO_URI=mongodb://127.0.0.1:27017/movieDB
PORT=5000
JWT_SECRET=your_jwt_secret_key
ADMIN_EMAIL=admin@ticket.in
ADMIN_PASS=AdminPass123!
REDIS_URL=rediss://default:your_redis_token@your-redis-host.upstash.io:6379
RAZORPAY_KEY_ID=rzp_test_TALTCKGwqHoHty
RAZORPAY_KEY_SECRET=b6H4CYhr44e6FdI415Loig3H
RAZORPAY_WEBHOOK_SECRET=ticketpechalo_webhook_2024
```

Install backend dependencies and run server:
```bash
cd backend
npm install
npm run dev
```
*Backend server runs on `http://localhost:5000`*

### 3. Frontend Configuration
Create `.env` inside `frontend/`:
```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_TALTCKGwqHoHty
```

Install frontend dependencies and start Vite dev server:
```bash
cd ../frontend
npm install
npm run dev
```
*Frontend application runs on `http://localhost:5173`*

---

## 🧪 Default Test Accounts

| Account | Email | Password | Role |
| ------- | ----- | -------- | ---- |
| **Admin** | `admin@ticket.in` | `AdminPass123!` | Admin |
| **User A** | `qa.user.a@example.com` | `QaPassword123!` | User |
| **User B** | `qa.user.b@example.com` | `QaPassword123!` | User |
| **User C** | `qa.user.c@example.com` | `QaPassword123!` | User |

---

## 📁 Workspace Directory Structure

```text
TicketPeChalo.in/
├── backend/
│   ├── config/          # Cloudinary & database configs
│   ├── controllers/     # Express route handlers (Booking, Auth, Payment, Admin, Movie, Theatre, Show)
│   ├── middleware/      # JWT verification & RBAC authorization
│   ├── models/          # Mongoose schemas (User, Movie, Theatre, Show, Booking, Contact)
│   ├── routes/          # API route definitions
│   ├── utils/           # Redis locking client & Lua unlock scripts
│   ├── seedNowShowing.js# Database seeder script
│   ├── server.js        # Express app initialization & Socket.IO server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/         # Main App router setup
│   │   ├── components/  # Layout, Navbar, Footer, ProtectedRoute HOC
│   │   ├── features/    # React feature modules (admin, auth, bookings, movies, shows, contact)
│   │   ├── services/    # Axios API client & Socket.IO client instances
│   │   ├── index.css    # Tailwind CSS imports & global styles
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
├── docs/
│   └── images/          # Application screenshots & visual evidence
├── QA_REPORT.md         # Comprehensive Phase 1-3 QA & Security Audit Report
├── FINAL_E2E_WALKTHROUGH.md # End-to-end user & admin walkthrough logs
├── FINAL_STRESS_TEST_REPORT.md # 5-User concurrency stress test report
└── README.md
```

---

## 👨‍💻 Author

**Laksh Raj**
- **GitHub**: [@lakshr2004](https://github.com/lakshr2004)
- **LinkedIn**: [Laksh Raj](https://www.linkedin.com/in/laksh-raj-0b14ab298/)
- **Repository**: [TicketPeChalo.in](https://github.com/lakshr2004/TicketPeChalo.in)

---

## 📜 License
This project is licensed under the [MIT License](LICENSE).
