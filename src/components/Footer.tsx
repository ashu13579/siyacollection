import { Link } from "react-router-dom";
import { Instagram, Phone, MapPin, Mail, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      {/* Top wave */}
      <div className="overflow-hidden leading-none rotate-180">
        <svg viewBox="0 0 1440 40" fill="none" className="w-full" preserveAspectRatio="none">
          <path d="M0 40 C360 10 1080 10 1440 40 L1440 40 L0 40 Z" fill="hsl(225 40% 12%)" />
        </svg>
      </div>

      <div className="container py-14 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-secondary flex items-center justify-center text-2xl">🎠</div>
              <div>
                <h3 className="text-xl font-display font-semibold text-background">Siya Collection</h3>
                <p className="text-xs text-background/50 font-bold">Premium Toy Store · Mumbai</p>
              </div>
            </div>
            <p className="text-sm text-background/60 leading-relaxed font-semibold">
              Your one-stop destination for premium toys, collectibles & fun! Serving happy families in Mumbai since 2020. 🎉
            </p>
            <div className="flex gap-2 mt-5">
              <a href="https://instagram.com/siyacollection" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-2xl bg-background/10 hover:bg-secondary hover:text-secondary-foreground flex items-center justify-center transition-all duration-200 hover:scale-110"
                aria-label="Instagram">
                <Instagram size={17} />
              </a>
              <a href="tel:+919773729154"
                className="w-10 h-10 rounded-2xl bg-background/10 hover:bg-secondary hover:text-secondary-foreground flex items-center justify-center transition-all duration-200 hover:scale-110"
                aria-label="Phone">
                <Phone size={17} />
              </a>
              <a href="mailto:siyacollection@gmail.com"
                className="w-10 h-10 rounded-2xl bg-background/10 hover:bg-secondary hover:text-secondary-foreground flex items-center justify-center transition-all duration-200 hover:scale-110"
                aria-label="Email">
                <Mail size={17} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-background text-lg mb-5">Quick Links</h4>
            <div className="flex flex-col gap-2.5">
              {[
                { to: "/products", label: "🛍️ All Products" },
                { to: "/products?category=hot-wheels", label: "🏎️ Hot Wheels" },
                { to: "/products?category=soft-toys", label: "🧸 Soft Toys" },
                { to: "/products?category=rc-toys", label: "🎮 RC Toys" },
                { to: "/products?category=collectibles", label: "✨ Collectibles" },
                { to: "/contact", label: "💬 Contact Us" },
              ].map(({ to, label }) => (
                <Link key={to} to={to}
                  className="text-sm text-background/60 hover:text-secondary font-semibold transition-colors duration-200">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-display font-semibold text-background text-lg mb-5">Policies</h4>
            <div className="flex flex-col gap-2.5">
              {[
                { to: "/privacy-policy", label: "Privacy Policy" },
                { to: "/refund-policy", label: "Refund Policy" },
                { to: "/terms", label: "Terms & Conditions" },
                { to: "/shipping-policy", label: "Shipping Policy" },
              ].map(({ to, label }) => (
                <Link key={to} to={to}
                  className="text-sm text-background/60 hover:text-secondary font-semibold transition-colors duration-200">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-background text-lg mb-5">Get In Touch</h4>
            <div className="flex flex-col gap-4">
              <a href="tel:+919773729154"
                className="flex items-center gap-3 text-sm text-background/60 hover:text-secondary font-semibold transition-colors">
                <div className="w-8 h-8 rounded-xl bg-background/10 flex items-center justify-center shrink-0">
                  <Phone size={14} />
                </div>
                +91 97737 29154
              </a>
              <a href="mailto:siyacollection@gmail.com"
                className="flex items-center gap-3 text-sm text-background/60 hover:text-secondary font-semibold transition-colors">
                <div className="w-8 h-8 rounded-xl bg-background/10 flex items-center justify-center shrink-0">
                  <Mail size={14} />
                </div>
                siyacollection@gmail.com
              </a>
              <p className="flex items-start gap-3 text-sm text-background/60 font-semibold">
                <div className="w-8 h-8 rounded-xl bg-background/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={14} />
                </div>
                Kandivali West, Mumbai, Maharashtra, India
              </p>
              <a href="https://instagram.com/siyacollection" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-background/60 hover:text-secondary font-semibold transition-colors">
                <div className="w-8 h-8 rounded-xl bg-background/10 flex items-center justify-center shrink-0">
                  <Instagram size={14} />
                </div>
                @siyacollection
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-background/12 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-background/40 font-semibold">
          <p>© {new Date().getFullYear()} Siya Collection. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Made with <Heart size={13} className="fill-accent text-accent" /> in Mumbai
          </p>
          <div className="flex items-center gap-2">
            {["Razorpay", "UPI", "COD", "Cards"].map((p) => (
              <span key={p} className="bg-background/10 text-background/50 text-xs font-bold px-2.5 py-1 rounded-lg">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
