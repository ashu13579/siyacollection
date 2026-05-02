import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Truck, RotateCcw, ShieldCheck } from "lucide-react";

const floatingToys = [
  { emoji: "🏁", top: "8%", right: "22%", delay: 0, size: "text-5xl" },
  { emoji: "🚗", top: "18%", right: "8%", delay: 0.8, size: "text-4xl" },
  { emoji: "🎮", top: "55%", right: "14%", delay: 1.4, size: "text-3xl" },
  { emoji: "🦕", top: "72%", right: "28%", delay: 0.4, size: "text-4xl" },
  { emoji: "🚀", top: "40%", right: "4%", delay: 1.8, size: "text-3xl" },
];

const trustItems = [
  { icon: Truck, label: "Free delivery above ₹999" },
  { icon: RotateCcw, label: "7-day easy returns" },
  { icon: ShieldCheck, label: "100% safe & genuine" },
];

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-toy-pattern">
      {/* Decorative circles */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative py-16 md:py-24 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-10 items-center">

          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground font-bold text-sm px-5 py-2.5 rounded-full mb-6 shadow-md animate-badge-pop"
            >
              <Sparkles size={15} />
              New Arrivals — Up to 40% Off!
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-semibold leading-[1.05] tracking-tight">
              Where Every
              <br />
              Toy Tells a{" "}
              <span className="relative inline-block">
                <span className="text-gradient-warm">Story</span>
                {/* Underline squiggle */}
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M2 9 C40 3, 80 11, 120 5 C160 -1, 180 9, 198 6" stroke="hsl(44 100% 52%)" strokeWidth="3.5" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>

            <p className="mt-7 text-base md:text-lg text-muted-foreground max-w-md leading-relaxed font-semibold">
              Discover premium toys, collectibles & gifts at Siya Collection —
              Mumbai's most-loved toy store, serving happy families since 2020.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="group inline-flex items-center gap-2.5 bg-primary text-white font-bold px-8 py-4 rounded-2xl text-base hover:bg-primary/90 transition-all hover:scale-105 shadow-toy"
              >
                Shop Now
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/products?category=collectibles"
                className="inline-flex items-center gap-2.5 bg-card text-foreground font-bold px-8 py-4 rounded-2xl text-base border-2 border-border hover:border-primary/40 hover:bg-muted/60 transition-all"
              >
                🏆 Collectibles
              </Link>
            </div>

            {/* Trust strip */}
            <div className="mt-10 flex flex-wrap gap-5">
              {trustItems.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon size={15} className="text-primary" />
                  </div>
                  {label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: visual card stack */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="relative hidden lg:flex items-center justify-center"
          >
            {/* Big card */}
            <div className="relative w-[400px] h-[400px]">
              {/* Spinning ring */}
              <div className="absolute inset-0 rounded-[40px] border-[3px] border-dashed border-secondary/50 animate-spin-slow" />

              {/* Main showcase card */}
              <div className="absolute inset-4 bg-gradient-to-br from-[#FF6B00] via-[#FF3D00] to-[#C0392B] rounded-[32px] flex flex-col items-center justify-center shadow-pop overflow-hidden">
                <div className="absolute inset-0 dot-pattern opacity-30" />
                <div className="relative text-center">
                  <div className="text-9xl mb-4 animate-float">🏎️</div>
                  <div className="bg-white/20 backdrop-blur-sm text-white font-bold px-5 py-2 rounded-full text-sm">
                    Best Seller ✨
                  </div>
                </div>
              </div>

              {/* Floating toy emojis */}
              {floatingToys.map(({ emoji, top, right, delay, size }) => (
                <motion.div
                  key={emoji}
                  className={`absolute ${size} cursor-default select-none`}
                  style={{ top, right }}
                  animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 3 + delay, repeat: Infinity, ease: "easeInOut", delay }}
                >
                  {emoji}
                </motion.div>
              ))}

              {/* Stats chips */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="absolute -left-8 top-16 bg-card rounded-2xl shadow-pop px-5 py-3 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary/30 flex items-center justify-center text-xl">🚚</div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold">Delivery</p>
                  <p className="text-sm font-display font-semibold">Same Day</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute -right-10 bottom-20 bg-card rounded-2xl shadow-pop px-5 py-3 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-xl">⭐</div>
                <div>
                  <p className="text-sm font-display font-semibold">4.9/5 Rating</p>
                  <p className="text-xs text-muted-foreground font-bold">2000+ reviews</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
        <svg viewBox="0 0 1440 40" fill="none" className="w-full" preserveAspectRatio="none">
          <path d="M0 40 C360 10 1080 10 1440 40 L1440 40 L0 40 Z" fill="hsl(44 30% 92%)" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
