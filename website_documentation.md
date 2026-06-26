# TicketPeChalo.in — Project Documentation

This document outlines the technical architecture, design system, user and admin workflows, responsiveness grid system, payment gateway details, and the real-time seat locking mechanism of TicketPeChalo.in.

---

## 1. Tech Stack & Architecture

TicketPeChalo.in is built as a modern, decoupled single-page application using the MERN stack with external services for payment processing, real-time messaging, and content delivery.

- **Frontend**: 
  - **React v19 (Vite)**: Deployed as a fast SPA.
  - **Tailwind CSS v4**: Utility-first CSS compiling with `@tailwindcss/vite` plugin.
  - **Framer Motion**: Smooth micro-animations, transitions, and hover effects.
  - **React Router Dom**: Client-side routing.
  - **React Toastify**: In-app toast alerts.
  - **Socket.io-client**: Real-time client-side WebSocket connections.
- **Backend**:
  - **Node.js + Express.js**: REST API server handling request parsing, routing, and controller logic.
  - **JSON Web Tokens (JWT)**: Secure user session token authorization via HTTP Header authorization.
  - **Socket.io**: Broadcast real-time seat locks and releases.
- **Database & Cache**:
  - **MongoDB (via Mongoose)**: Storing Users, Movies, Theatres, Shows, and Bookings collections.
  - **Redis (Optional/Local Cache)**: Utilized to handle transactional seat locks with low-latency TTL expiry.
- **Authentication**: JWT token-based authentication.
- **Payment Processing**:
  - **Razorpay SDK (Web/Server)**: Process transactions via UPI, cards, Net Banking, and wallets inside the native Razorpay checkout modal.

---

## 2. Color Palette & Design System

The application strictly implements a premium, warm **Beige and Maroon** design system. Generic color tags (blues, yellows, plain oranges) have been fully replaced with curated, high-contrast, accessible brand values.

| Layer | Hex Color Value | Description / Usage |
|---|---|---|
| **Light Background** | `#f8f3e9` | Primary page body background, clean paper texture feel |
| **Container / Cream** | `#faf7f2` | Primary card background, subtle section separation |
| **Section Highlight** | `#fbf9f5` | Inner cards, table headers, checkout sub-panels |
| **Pill Background** | `#f5efe6` | Transaction summary chips, badges |
| **Primary Maroon** | `#8b1e3f` | Nav links hover, action buttons, screen bar, rating text, primary accents |
| **Dark Maroon** | `#5b0f1b` | Buttons hover, headers, tab active highlights, modal titles |
| **Body Text** | `#2e1c14` | High-contrast, warm dark brown charcoal text |
| **Secondary Text** | `#4b2e1e` | Muted labels, date labels, descriptions, subheadings |
| **Border / Divider** | `#e7dac8` | Standard layout borders, table division lines, form inputs |

---

## 3. User Workflow

1. **Landing / Browse Page**: User browses currently playing movies listed in the featured slider or all movies horizontal list. Standard search inputs, genre select, and language selectors allow filtering.
2. **Login / Sign Up**: When a user attempts to select booking options, they are prompt-routed to the credentials page if not authenticated.
3. **Movie Details**: User views synopsis, duration, cast details, language, rating, and watch trailer trigger. Clicking **Book Tickets** starts the checkout wizard.
4. **Showtime Selection**: Displays all showtimes scheduled for the chosen movie. Selecting a time redirects to the theatre listing page.
5. **Theatre Selection**: User selects a theatre displaying available seat counts and ticket pricing.
6. **Seat Mapping**: Renders a 10x10 seat layout representing the screen layout. 
   - Clicking a seat makes a real-time `lockSeats` REST request.
   - Socket.io broadcasts the seat status as **Locked** to other active browsers, preventing double-selection.
7. **Redesigned Cart Page**: User reviews selected seats, movie info, convenience fees (₹30), and CGST/SGST (18%). Selects payment method (Card, UPI, Net Banking, Wallet) and clicks **Book & Pay**.
8. **Razorpay Modal Checkout**: Native checkout pop-up launches to process payment securely.
9. **Booking Confirmation**: On payment success, the user is redirected to a premium light-themed receipt page displaying movie poster, time, location, order ID, payment ID, and a detailed tax invoice.

---

## 4. Admin Workflow

1. **Log in**: Admin credentials bypass normal landing flows and redirect to `/admin`.
2. **Dashboard**: Features custom stats panels tracking total movies, theatres, and active shows.
3. **Manage Movies**: Add, edit, or delete movie listings (Title, Description, Duration, Language, Poster URL, Genre).
4. **Manage Theatres**: Add or modify screen venues, locations, and total seat capacities.
5. **Manage Shows**: Coordinate shows connecting a Movie, Theatre venue, DateTime schedule, and Ticket Price.
6. **View bookings**: Monitor transactions.

---

## 5. Responsiveness

The website implements responsive grid layouts and flex stack logic:
- **Navbar**: Seamlessly shifts to a mobile hamburger menu with a clean dropdown drawer.
- **Movies Page**: Featured section stacks into a single vertical column on viewports `< 1024px`. All movies/theatres horizontally scroll via `overflow-x-auto` to preserve screen real estate on mobile devices.
- **Movie Details**: Image and contents stack vertically on mobile.
- **Seat Page**: The 10x10 layout is enclosed inside an `overflow-x-auto` horizontal wrapper with a minimum container size, ensuring that the seat grid is fully swipeable and interactable on compact devices without page breakages.
- **Cart Page**: Redesigned into a two-column desktop flex grid. On viewports `< 1024px`, the payment options and invoice cards stack vertically.
- **Admin Panel**: The dashboard utilizes collapsible overlay sidebars for menu selection on tablet/mobile views.

---

## 6. Payment Integration

The Razorpay payment system handles secure transactional checkout:
1. **Order Creation**: 
   - When the user triggers "Book & Pay", the frontend sends the selected show ID and seats to the backend.
   - The backend validates seat availability, checks Redis locks, computes total pricing (including GST and convenience fees), and calls Razorpay API to generate a unique `razorpay_order_id`.
2. **Checkout Modal**:
   - The frontend launches the native Razorpay checkout modal with the order credentials.
   - **Note**: The checkout is handled exclusively inside the native Razorpay overlay. No custom mock screens are bypassed unless configured in the environment variables (using public Razorpay test keys).
3. **Signature Verification**:
   - Upon completing payment, Razorpay returns transaction metadata (`razorpay_payment_id`, `razorpay_signature`).
   - The backend verifies the signature using HMAC-SHA256 to ensure no transaction tampering has occurred.
4. **Ticket Booking**:
   - On valid verification, seat status updates to **BOOKED** in MongoDB, releasing the Redis lock.
5. **Cleanup Cron**:
   - A server-side scheduler runs in the background. If a checkout is cancelled or times out, the cron releases locked seats and broadcasts a `seatUnlocked` event via WebSockets.

---

## 7. Real-Time Seat Locking

Concurrency protection is handled through Socket.io and Redis:
- **Seat Locking**: Selecting a seat requests a Redis key lock with a TTL of 300 seconds (5 minutes). This ensures other users cannot select the same seats while checkout is ongoing.
- **Socket Broadcasts**: 
  - `seatLocked`: Triggered when a user selects a seat. The server broadcasts the state to all users in the same show room.
  - `seatUnlocked`: Broadcasted if a user deselects a seat, or if the transaction fails/expires.
  - `seatBooked`: Broadcasted once payment clears, permanently graying out the seats.
