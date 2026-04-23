import { useState } from "react";
import { motion as Motion } from "framer-motion";
import API from "../../services/api";
import { toast } from "react-toastify";

function ContactPage() {
  const adminEmail = "lakshr2004@gmail.com";
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/contact", form);
      toast.success("Message sent to admin!");
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    }
  };

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[#faf6ef] min-h-screen py-10 md:py-16 px-4 md:px-6"
    >
      <div className="max-w-5xl mx-auto bg-[#f6ead4] rounded-xl md:rounded-2xl shadow-xl p-6 md:p-10">

        <Motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold text-[#5b0f1b] mb-6"
        >
          Contact Us
        </Motion.h1>

        {/* Admin Email */}
        <div className="bg-[#5b0f1b] text-white p-4 rounded-lg mb-8">
          <p className="font-semibold text-sm md:text-base">Admin Email:</p>
          <p className="text-base md:text-lg">{adminEmail}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          <Motion.input
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            required
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white border border-[#e0d6c4] focus:border-[#8b1e3f] focus:ring-1 focus:ring-[#8b1e3f] outline-none text-sm md:text-base"
          />

          <Motion.input
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            required
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white border border-[#e0d6c4] focus:border-[#8b1e3f] focus:ring-1 focus:ring-[#8b1e3f] outline-none text-sm md:text-base"
          />

          <Motion.textarea
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            name="message"
            placeholder="Write your message to admin..."
            rows="4"
            value={form.message}
            required
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white border border-[#e0d6c4] focus:border-[#8b1e3f] focus:ring-1 focus:ring-[#8b1e3f] outline-none text-sm md:text-base"
          />

          <Motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.03 }}
            type="submit"
            className="bg-[#8b1e3f] hover:bg-[#b02a4f] text-white px-6 py-3 rounded-xl font-semibold transition text-sm md:text-base w-full md:w-auto"
          >
            Send Message
          </Motion.button>

        </form>
      </div>
    </Motion.div>
  );
}

export default ContactPage;
