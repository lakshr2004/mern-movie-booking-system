import { Routes, Route, Navigate } from "react-router-dom";
import MoviesPage from "../features/movies/MoviesPage";
import MovieDetailsPage from "../features/movies/MovieDetailsPage";
import ShowsPage from "../features/shows/ShowsPage";
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import AdminDashboard from "../features/admin/AdminDashboard";
import TheatreListPage from "../features/shows/TheatreListPage";
import SeatPage from "../features/shows/SeatPage";
import MyBookings from "../features/bookings/MyBookings";
import ContactPage from "../features/contact/ContactPage";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import CartPage from "../features/bookings/CartPage.jsx";
import BookingConfirmation from "../features/bookings/BookingConfirmation";

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute userOnly={true}>
            <MoviesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/movie/:id"
        element={
          <ProtectedRoute userOnly={true}>
            <MovieDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute userOnly={true}>
            <MyBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contact"
        element={
          <ProtectedRoute userOnly={true}>
            <ContactPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute userOnly={true}>
            <CartPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking-confirmation"
        element={
          <ProtectedRoute userOnly={true}>
            <BookingConfirmation />
          </ProtectedRoute>
        }
      />

      <Route
        path="/theatres/:movieId"
        element={
          <ProtectedRoute userOnly={true}>
            <TheatreListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shows/:movieId"
        element={
          <ProtectedRoute userOnly={true}>
            <ShowsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/seat/:showId"
        element={
          <ProtectedRoute userOnly={true}>
            <SeatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={<Navigate to="/admin/dashboard" replace />}
      />
    </Routes>
  );
}

export default AppRoutes;
