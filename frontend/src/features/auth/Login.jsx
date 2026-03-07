import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import API from "../../services/api";
import { AuthContext } from "./AuthContext";
import logo from "../../assets/logo.jpeg";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/auth/login", form);
      login(res.data);
      toast.success(`Welcome ${res.data.user?.name || "User"}`);
      navigate("/", { replace: true });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Invalid username or password";
      toast.error(errorMessage);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center relative px-3 sm:px-4 py-6 sm:py-8">
        <div className="absolute inset-0 bg-black/50"></div>

        <Motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative backdrop-blur-lg bg-[#7a0d16] border border-white/20 p-5 sm:p-8 md:p-10 rounded-2xl w-[95%] sm:w-[90%] max-w-[380px] sm:max-w-[420px] text-white shadow-2xl mx-3 sm:mx-auto"
        >
          <Motion.img
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            src={logo}
            alt="logo"
            className="w-40 sm:w-48 md:w-56 mx-auto mb-4"
          />

          <Motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-2xl sm:text-3xl font-bold text-center mb-2"
          >
            Login
          </Motion.h2>

          <p className="text-center text-gray-200 mb-5 sm:mb-6 text-sm sm:text-base">
            Book your next movie experience
          </p>

          <form onSubmit={handleSubmit}>
            <div className="flex items-center bg-[#5a0a11] rounded-lg mb-3 sm:mb-4 px-3 focus-within:ring-2 focus-within:ring-[#ff6b81]">
              <FaEnvelope className="text-gray-300 text-sm sm:text-base" />
              <input
                type="email"
                placeholder="Email"
                required
                className="w-full p-2.5 sm:p-3 bg-transparent outline-none text-sm sm:text-base"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="flex items-center bg-[#5a0a11] rounded-lg mb-4 sm:mb-6 px-3 focus-within:ring-2 focus-within:ring-[#ff6b81]">
              <FaLock className="text-gray-300 text-sm sm:text-base" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                className="w-full p-2.5 sm:p-3 bg-transparent outline-none text-sm sm:text-base"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-300 text-sm"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <Motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black hover:bg-[#c43b60] py-2.5 sm:py-3 rounded-xl font-semibold transition shadow-lg text-sm sm:text-base"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? "Logging in..." : "Login"}
            </Motion.button>
          </form>

          <p className="text-sm text-center mt-4 sm:mt-5">
            Don't have an account?{" "}
            <Link to="/register" className="underline font-semibold">
              Register
            </Link>
          </p>
        </Motion.div>
      </main>
    </div>
  );
}

export default Login;

