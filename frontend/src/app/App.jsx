import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import AppRoutes from "./routes";

function App() {
  const location = useLocation();

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 10,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.3,
        ease: "easeIn",
      },
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f3e9]">
      <Navbar />
      <div className="grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
          >
            <AppRoutes />
          </motion.div>
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
}

export default App;
