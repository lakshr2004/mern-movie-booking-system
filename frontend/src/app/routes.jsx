import { Routes, Route } from "react-router-dom";
import MoviesPage from "../features/movies/MoviesPage";
import MovieDetailsPage from "../features/movies/MovieDetailsPage";
import ShowsPage from "../features/shows/ShowsPage";
import SeatPage from "../features/seats/SeatPage";
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import AdminDashboard from "../features/admin/AdminDashboard";
import TheatreListPage from "../features/shows/TheatreListPage";
import MyBookings from "../features/bookings/MyBookings";
import ContactPage from "../features/contact/ContactPage";
import ProtectedRoute from "../components/layout/ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MoviesPage />} />
      <Route path="/movie/:id" element={<MovieDetailsPage/>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/my-bookings" element={<MyBookings />} />
      <Route path="/contact" element={<ContactPage />} />

      <Route
        path="/theatres/:movieId"
        element={
          <ProtectedRoute>
            <TheatreListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shows/:movieId"
        element={
          <ProtectedRoute>
            <ShowsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/seat/:showId"
        element={
          <ProtectedRoute>
            <SeatPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
