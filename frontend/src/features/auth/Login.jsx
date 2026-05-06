import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

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

  // 🚀 FAST LOGIN
  const handleSubmit = async (e) => {
    e.preventDefault();

    // prevent multiple clicks
    if (loading) return;

    try {
      setLoading(true);

      const res = await API.post("/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });

      // ✅ Save user instantly
      login(res.data);

      // ✅ Success toast
      toast.success(
        `Welcome ${res.data?.user?.name || "User"}`
      );

      // ✅ Instant navigation
      navigate("/", { replace: true });

    } catch (error) {

      console.error(error);

      const errorMessage =
        error.response?.data?.message ||
        "Invalid email or password";

      toast.error(errorMessage);

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f1eb]">

      <main className="flex-1 flex items-center justify-center px-4 py-8">

        {/* CARD */}
        <Motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="
            w-full
            max-w-[420px]
            rounded-3xl
            bg-[#5a0a11]
            border
            border-[#e5ddd3]
            shadow-2xl
            p-6
            sm:p-8
          "
        >

          {/* LOGO */}
          <Motion.img
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            src={logo}
            alt="logo"
            className="w-40 sm:w-48 mx-auto mb-5"
          />

          {/* TITLE */}
          <Motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="
              text-3xl
              font-bold
              text-center
              text-[#3b2f2f]
              mb-2
            "
          >
            Welcome Back
          </Motion.h2>

          <p className="text-center text-[#7a6f67] mb-7">
            Login to continue booking movies
          </p>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* EMAIL */}
            <div
              className="
                flex
                items-center
                rounded-2xl
                bg-white
                border
                border-[#ddd3c7]
                px-4
                focus-within:border-[#8b5e3c]
                transition
              "
            >
              <FaEnvelope className="text-[#8b7d74]" />

              <input
                type="email"
                required
                autoComplete="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                className="
                  w-full
                  bg-transparent
                  outline-none
                  px-3
                  py-4
                  text-[#2d2d2d]
                  placeholder:text-[#a89f96]
                "
              />
            </div>

            {/* PASSWORD */}
            <div
              className="
                flex
                items-center
                rounded-2xl
                bg-white
                border
                border-[#ddd3c7]
                px-4
                focus-within:border-[#8b5e3c]
                transition
              "
            >
              <FaLock className="text-[#8b7d74]" />

              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                className="
                  w-full
                  bg-transparent
                  outline-none
                  px-3
                  py-4
                  text-[#2d2d2d]
                  placeholder:text-[#a89f96]
                "
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="
                  text-[#8b7d74]
                  hover:text-[#3b2f2f]
                  transition
                "
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>
            </div>

            {/* BUTTON */}
            <Motion.button
              whileHover={{
                scale: loading ? 1 : 1.02,
              }}
              whileTap={{
                scale: loading ? 1 : 0.98,
              }}
              type="submit"
              disabled={loading}
              className={`
                w-full
                py-4
                rounded-2xl
                font-semibold
                text-white
                transition-all
                duration-200
                shadow-lg
                ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#7a0d16] hover:bg-[#5f0911]"
                }
              `}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">

                  <div
                    className="
                      w-5
                      h-5
                      border-2
                      border-white
                      border-t-transparent
                      rounded-full
                      animate-spin
                    "
                  />

                  Logging in...

                </div>
              ) : (
                "Login"
              )}
            </Motion.button>
          </form>

          {/* REGISTER */}
          <p className="text-center text-sm text-[#6f655d] mt-6">
            Don&apos;t have an account?{" "}

            <Link
              to="/register"
              className="
                font-semibold
                text-[#7a0d16]
                hover:underline
              "
            >
              Register
            </Link>
          </p>

        </Motion.div>

      </main>
    </div>
  );
}

export default Login;