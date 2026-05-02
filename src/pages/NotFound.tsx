import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-toy-pattern">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center px-4">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          className="text-8xl mb-6 inline-block"
        >
          🧩
        </motion.div>
        <h1 className="text-7xl font-display font-semibold text-primary mb-2">404</h1>
        <h2 className="text-3xl font-display font-semibold mb-3">Oops! Page not found</h2>
        <p className="text-muted-foreground font-semibold mb-8 max-w-sm mx-auto">
          Looks like this page ran away to play! Let's get you back to the toy store.
        </p>
        <Link to="/"
          className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition-all hover:scale-105 shadow-toy text-base">
          <Home size={18} /> Back to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
