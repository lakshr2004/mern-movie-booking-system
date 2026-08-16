🎬 TicketPeChalo.in – MERN Movie Booking System

TicketPeChalo.in is a full-stack movie ticket booking web application built using the MERN Stack (MongoDB, Express.js, React.js, Node.js).

The platform allows users to browse movies, check theatres and showtimes, select seats, and book movie tickets online.

Admins can manage movies, theatres, and shows through a dedicated Admin Dashboard.

🚀 Features

👤 User Features

🎥 Browse Movies

Users can explore movies available on the platform:

View Now Showing Movies

View Top Rated Movies

Search movies by name

Filter movies by:

Language

Genre

📄 Movie Details

Users can see detailed movie information including:

Movie poster

Rating

Genre

Language

Duration

Cast

Description

Trailer option

Book ticket option

🎭 Theatre Selection

After selecting a movie, users can view available theatres.

Information displayed:

Theatre name

Location

Ticket price

Available seats

⏰ Showtime Selection

Users can select available showtimes for a movie.

💺 Seat Selection

Interactive seat layout allows users to:

Select seats

View available seats

View booked seats

Real-time seat locking

Automatically calculate ticket price

🎟 Booking Confirmation

After selecting seats, users can confirm ticket booking.

The system:

Saves booking to database

Updates seat availability

Shows confirmation in My Bookings

📜 My Bookings

Users can view their booking history including:

Movie name

Theatre

Location

Showtime

Seat numbers

Total price

Booking status

📩 Contact Page

Users can contact the platform through a contact form.

🔐 Authentication

Authentication system includes:

User registration

User login

Logout functionality

JWT authentication

🛠 Admin Features

Admins manage the entire platform through the Admin Dashboard.

🎬 Movie Management

Admins can:

Add movies

Edit movies

Delete movies

Movie information includes:

Title

Description

Duration

Genre

Language

Poster URL

Rating

🎭 Theatre Management

Admins can:

Add theatres

Edit theatre details

Delete theatres

Theatre information includes:

Theatre name

Location

Total seats

🎟 Show Management

Admins can create and manage shows including:

Movie selection

Theatre selection

Show time

Ticket price

Seat availability

⚡ Real-Time Seat Booking System

TicketPeChalo uses Socket.IO to handle real-time seat updates.

Features

Live seat locking

Prevent double booking

Automatic seat unlock after 5 minutes (300 seconds)

Real-time updates across users

Events
Event	Description
joinShow	User joins show room
lockSeat	Lock seat temporarily
unlockSeat	Unlock seat
bookSeat	Confirm seat booking
seatLocked	Broadcast locked seat
seatUnlocked	Broadcast unlocked seat
seatsBooked	Broadcast booked seats
🎟 Booking Flow

The ticket booking process works as follows:

Step 1 — Browse Movies

User selects a movie from Now Showing.

Step 2 — View Movie Details

User views:

Movie description

Cast

Duration

Rating

Step 3 — Select Showtime

User selects a showtime.

Step 4 — Select Theatre

User selects a theatre showing the movie.

Step 5 — Seat Selection

User selects available seats.

Seats can be:

Available

Locked

Booked

Step 6 — Real-time Seat Lock

When a seat is selected:

It is locked for 5 minutes (300 seconds)

Other users cannot select it

Step 7 — Booking Confirmation

User confirms booking.

System:

Saves booking

Marks seats as booked

Broadcasts update via Socket.IO

🧠 Tech Stack
Frontend

React.js

Vite

Tailwind CSS

React Router

Axios

Backend

Node.js

Express.js

MongoDB

Mongoose

JWT Authentication

Socket.IO

Compression

CORS

📂 Project Structure
mern-movie-booking-system
│
├── backend
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── package.json
│   └── server.js
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── app
│   │   ├── components
│   │   ├── features
│   │   │   ├── admin
│   │   │   ├── movies
│   │   │   ├── shows
│   │   │   ├── bookings
│   │   │   └── auth
│   │   └── services
│   │
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── eslint.config.js
│
└── .gitignore
🔌 API Overview

Base URL:

http://localhost:5000/api
🔐 Authentication API
Register User
POST /api/auth/register

Body

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
Login User
POST /api/auth/login
🎬 Movies API
Get All Movies
GET /api/movies
Get Movie By ID
GET /api/movies/:id
Create Movie (Admin)
POST /api/movies
Update Movie (Admin)
PUT /api/movies/:id
Delete Movie (Admin)
DELETE /api/movies/:id
🎭 Theatres API
Get All Theatres
GET /api/theatres
Get Theatre By ID
GET /api/theatres/:id
Create Theatre (Admin)
POST /api/theatres
Update Theatre (Admin)
PUT /api/theatres/:id
Delete Theatre (Admin)
DELETE /api/theatres/:id
🎟 Shows API
Get Shows By Movie
GET /api/shows/movie/:movieId
Get Show By ID
GET /api/shows/:id
Get All Shows (Admin)
GET /api/shows
Create Show (Admin)
POST /api/shows
Update Show (Admin)
PUT /api/shows/:id
Delete Show (Admin)
DELETE /api/shows/:id
🎫 Bookings API
Get My Bookings
GET /api/bookings/my

Authentication required.

📩 Contact API
Send Contact Message
POST /api/contact
⚙️ Installation & Setup
Clone the Repository
git clone https://github.com/lakshr2004/mern-movie-booking-system.git
cd mern-movie-booking-system
🔧 Backend Setup
cd backend
npm install

Create .env inside backend

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000

Run backend server

npm start

Backend runs on

http://localhost:5000
💻 Frontend Setup
cd frontend
npm install
npm run dev

Frontend runs on

http://localhost:5173
📦 Requirements

Install these before running the project:

Node.js (v18 or higher)

npm

MongoDB (Local or MongoDB Atlas)

Git

🔐 Environment Variables

Create .env inside backend

MONGO_URI=
JWT_SECRET=
PORT=

👨‍💻 Author

Laksh Raj

GitHub
https://github.com/lakshr2004

LinkedIn
https://www.linkedin.com/in/laksh-raj-0b14ab298/

⭐ Future Improvements

Online payment gateway integration

Email ticket confirmation

Movie recommendation system

Admin analytics dashboard

QR code based movie tickets

Mobile responsive improvements
