import { motion } from "framer-motion";

const WhatsAppButton = () => (
  <motion.a
    href="https://wa.me/919773729154?text=Hi%20Siya%20Collection!%20I%20am%20interested%20in%20your%20toys."
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat on WhatsApp"
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
    whileHover={{ scale: 1.12 }}
    whileTap={{ scale: 0.95 }}
    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-pop"
    style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
  >
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.658 4.615 1.804 6.52L4 29l7.67-1.784A11.94 11.94 0 0016 28c6.627 0 12-5.373 12-12S22.627 3 16 3z" fill="white"/>
      <path d="M21.5 19.5c-.3.8-1.5 1.5-2.2 1.6-.6.1-1.4.1-2.3-.2-.5-.2-1.2-.4-2-.8-3.5-1.5-5.8-5-6-5.3-.2-.3-1.5-2-.5-3.6.2-.4.6-.8 1-1 .2-.1.5-.1.7-.1h.5c.2 0 .4.1.6.5l.8 2c.1.2.1.4 0 .6l-.5.6c-.1.1-.2.3-.1.5.5.9 1.1 1.7 1.9 2.4.8.7 1.7 1.2 2.7 1.5.2.1.4 0 .5-.1l.6-.7c.2-.2.4-.3.6-.2l2 .8c.2.1.4.2.5.4.1.3-.1 1.1-.4 1.9z" fill="#25D366"/>
    </svg>
    {/* Pulse ring */}
    <span className="absolute inset-0 rounded-2xl animate-ping opacity-30" style={{ background: "#25D366" }} />
  </motion.a>
);

export default WhatsAppButton;
