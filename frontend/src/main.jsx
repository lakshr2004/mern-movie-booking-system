import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import App from "./app/App";
import AuthProvider from "./features/auth/AuthContext";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
      <ToastContainer
        position="top-left"
        autoClose={2000}
        theme="dark"
      />
    </AuthProvider>
  </BrowserRouter>
);
