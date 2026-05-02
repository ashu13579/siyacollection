import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingCart, User, Menu, X, Shield, Search,
  LogOut, Heart, Package, UserCog, ChevronDown, Zap,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

// ── Majorette dropdown data ──────────────────────────────────────────────────
const majoretteCategories = [
  { label: "Die-Cast Cars",      icon: "🚗", slug: "majorette-diecast",    color: "bg-red-50 text-red-600" },
  { label: "Road Sets",          icon: "🛣️",  slug: "majorette-road-sets", color: "bg-orange-50 text-orange-600" },
  { label: "Garage Playsets",    icon: "🏗️",  slug: "majorette-garage",    color: "bg-yellow-50 text-yellow-700" },
  { label: "Theme Vehicles",     icon: "🚒", slug: "majorette-theme",      color: "bg-orange-50 text-orange-600" },
  { label: "Collector Series",   icon: "⭐", slug: "majorette-collector",  color: "bg-purple-50 text-purple-600" },
  { label: "Gift Packs",         icon: "🎁", slug: "majorette-gift",       color: "bg-pink-50 text-pink-600" },
];

const majoretteFeatured = [
  { label: "NEW: Porsche 911 Set", badge: "New", color: "from-[#FF6B00] to-[#E8002D]", icon: "🏎️" },
  { label: "Street Fire Series",   badge: "Hot", color: "from-[#FF3B3B] to-[#CC0000]", icon: "🔥" },
];

// ── Announcement bar messages ────────────────────────────────────────────────
const announcements = [
  "🎁 Free delivery above ₹999",
  "🏎️ Majorette Die-Cast — Now in stock!",
  "🔥 Up to 40% OFF on soft toys — Use SIYA40",
  "✨ New arrivals every week!",
  "🚚 Mumbai's favourite toy store since 2020",
  "🎉 Same-day delivery in Kandivali",
];

// ── Main nav links ───────────────────────────────────────────────────────────
const baseNavLinks = [
  { to: "/",                           label: "Home",       emoji: "" },
  { to: "/products",                   label: "Shop All",   emoji: "🛍️" },
  { to: "/products?category=hot-wheels", label: "Hot Wheels", emoji: "🏎️" },
  { to: "/products?category=soft-toys",  label: "Soft Toys",  emoji: "🧸" },
  { to: "/products?category=rc-toys",    label: "RC Toys",    emoji: "🎮" },
  { to: "/contact",                    label: "Contact",    emoji: "💬" },
];

// ── Majorette mega-dropdown ──────────────────────────────────────────────────
const MajoretteMegaMenu = ({ onClose }: { onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 12, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 12, scale: 0.97 }}
    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
    className="absolute left-0 top-full mt-3 w-[560px] bg-white rounded-3xl shadow-pop border-2 border-border z-50 overflow-hidden"
  >
    {/* Header strip */}
    <div className="bg-gradient-to-r from-[#E8002D] via-[#FF3B3B] to-[#FF6B35] px-6 py-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">🚗</div>
      <div>
        <p className="text-white font-display font-semibold text-lg leading-none">Majorette</p>
        <p className="text-white/70 text-xs font-bold mt-0.5">Premium Die-Cast Vehicles from France 🇫🇷</p>
      </div>
      <Link
        to="/products?category=majorette"
        onClick={onClose}
        className="ml-auto bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap"
      >
        View All <ChevronDown size={12} className="rotate-[-90deg]" />
      </Link>
    </div>

    <div className="p-5 grid grid-cols-3 gap-3">
      {/* Category grid */}
      <div className="col-span-2 grid grid-cols-2 gap-2.5">
        {majoretteCategories.map((cat) => (
          <Link
            key={cat.slug}
            to={`/products?category=${cat.slug}`}
            onClick={onClose}
            className="flex items-center gap-2.5 p-3 rounded-2xl hover:bg-muted/70 transition-colors group"
          >
            <div className={`w-9 h-9 rounded-xl ${cat.color} flex items-center justify-center text-base shrink-0 group-hover:scale-110 transition-transform`}>
              {cat.icon}
            </div>
            <span className="text-sm font-bold text-foreground group-hover:text-[#E8002D] transition-colors">
              {cat.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Featured cards */}
      <div className="flex flex-col gap-2.5">
        <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest px-1">Featured</p>
        {majoretteFeatured.map((f) => (
          <Link
            key={f.label}
            to="/products?category=majorette"
            onClick={onClose}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${f.color} p-3.5 flex flex-col gap-1 hover:scale-[1.03] transition-transform`}
          >
            <span className="text-2xl">{f.icon}</span>
            <span className="bg-white/25 text-white text-[10px] font-black px-2 py-0.5 rounded-full w-fit">{f.badge}</span>
            <p className="text-white text-xs font-bold leading-tight">{f.label}</p>
          </Link>
        ))}
        <Link
          to="/products?category=majorette"
          onClick={onClose}
          className="flex items-center justify-center gap-1.5 bg-[#E8002D] text-white text-xs font-bold px-3 py-2.5 rounded-xl hover:bg-[#C00025] transition-colors"
        >
          <Zap size={12} className="fill-white" /> Shop Majorette
        </Link>
      </div>
    </div>
  </motion.div>
);

// ── Main Header component ────────────────────────────────────────────────────
const Header = () => {
  const { totalItems } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const { user, isAdmin, signOut } = useAuth();

  const [mobileOpen, setMobileOpen]       = useState(false);
  const [userMenuOpen, setUserMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen]       = useState(false);
  const [searchQuery, setSearchQuery]     = useState("");
  const [majoretteOpen, setMajoretteOpen] = useState(false);
  const [mobileMajOpen, setMobileMajOpen] = useState(false);

  const location = useLocation();
  const navigate  = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);
  const majRef    = useRef<HTMLDivElement>(null);

  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);

  // Close Majorette dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (majRef.current && !majRef.current.contains(e.target as Node)) {
        setMajoretteOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/products?search=${encodeURIComponent(q)}`);
    setSearchQuery(""); setSearchOpen(false);
  };

  const isMajoretteActive = location.search.includes("majorette");

  return (
    <>
      {/* ── Announcement marquee bar ── */}
      <div className="bg-foreground text-background text-center py-2 px-4 text-sm font-bold overflow-hidden">
        <div className="marquee-track gap-14">
          {[...announcements, ...announcements].flatMap((t, i) => [
            <span key={`t${i}`} className="whitespace-nowrap">{t}</span>,
            <span key={`s${i}`} className="opacity-30 whitespace-nowrap mx-1">◆</span>,
          ])}
        </div>
      </div>

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-[3px] border-secondary shadow-sm">
        <div className="container flex items-center justify-between h-16 md:h-[72px] gap-3">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#E8002D] flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform duration-300">
              🏎️
            </div>
            <span className="text-2xl md:text-[26px] font-display font-semibold leading-none">
              <span className="text-foreground">Siya</span>
              <span className="text-primary"> Collection</span>
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {baseNavLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap
                  ${location.pathname === link.to && !link.to.includes("?")
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-secondary/30"
                  }`}
              >
                {link.emoji && <span className="mr-1">{link.emoji}</span>}
                {link.label}
              </Link>
            ))}

            {/* ── Majorette nav item with mega-dropdown ── */}
            <div ref={majRef} className="relative">
              <button
                onClick={() => setMajoretteOpen((v) => !v)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap
                  ${isMajoretteActive || majoretteOpen
                    ? "bg-[#E8002D]/10 text-[#E8002D]"
                    : "text-foreground hover:bg-[#E8002D]/10 hover:text-[#E8002D]"
                  }`}
              >
                <span>🚗</span>
                <span>Majorette</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${majoretteOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {majoretteOpen && (
                  <MajoretteMegaMenu onClose={() => setMajoretteOpen(false)} />
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* ── Search expand ── */}
          <AnimatePresence>
            {searchOpen && (
              <motion.form
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "220px" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSearch}
                className="hidden sm:flex items-center overflow-hidden"
              >
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
                  placeholder="Search toys…"
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-secondary bg-background text-sm focus:outline-none focus:border-primary font-semibold"
                />
              </motion.form>
            )}
          </AnimatePresence>

          {/* ── Action buttons ── */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 rounded-xl hover:bg-muted transition-colors"
              aria-label="Search"
            >
              <Search size={21} />
            </button>

            <Link to="/wishlist" className="relative p-2.5 rounded-xl hover:bg-muted transition-colors hidden sm:flex" aria-label="Wishlist">
              <Heart size={21} />
              {wishlistCount > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </motion.span>
              )}
            </Link>

            <Link
              to="/cart"
              className="relative flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all hover:scale-105 shadow-md"
              aria-label="Cart"
            >
              <ShoppingCart size={18} />
              <span className="hidden sm:block">Cart</span>
              {totalItems > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="bg-secondary text-secondary-foreground text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </motion.span>
              )}
            </Link>

            {/* User menu */}
            <div className="relative hidden sm:flex">
              {user ? (
                <>
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="p-2.5 rounded-xl hover:bg-muted transition-colors">
                    {isAdmin ? <Shield size={21} className="text-primary" /> : <User size={21} />}
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-card border-2 border-border rounded-2xl shadow-pop overflow-hidden z-50"
                      >
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-3 text-sm font-bold hover:bg-primary/10 text-primary transition-colors">
                            <Shield size={15} /> Admin Panel
                          </Link>
                        )}
                        <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 text-sm font-bold hover:bg-muted transition-colors">
                          <UserCog size={15} /> My Profile
                        </Link>
                        <Link to="/orders" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 text-sm font-bold hover:bg-muted transition-colors">
                          <Package size={15} /> My Orders
                        </Link>
                        <hr className="border-border" />
                        <button onClick={() => { signOut(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors">
                          <LogOut size={15} /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link to="/auth" className="p-2.5 rounded-xl hover:bg-muted transition-colors flex items-center">
                  <User size={21} />
                </Link>
              )}
            </div>

            <button className="lg:hidden p-2.5 rounded-xl hover:bg-muted transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ── Mobile search ── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="sm:hidden border-t border-border overflow-hidden bg-card">
              <form onSubmit={handleSearch} className="container py-3 flex gap-2">
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search toys…"
                  className="flex-1 px-4 py-2.5 rounded-2xl border-2 border-secondary bg-background text-sm focus:outline-none focus:border-primary font-semibold" />
                <button type="submit" className="bg-primary text-white px-5 py-2.5 rounded-2xl text-sm font-bold">Go</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Mobile nav drawer ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t-2 border-secondary overflow-hidden bg-card"
            >
              <div className="container py-4 flex flex-col gap-1">
                {baseNavLinks.map((link) => (
                  <Link key={link.label} to={link.to} onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-2xl font-bold hover:bg-muted transition-colors text-base">
                    {link.emoji} {link.label}
                  </Link>
                ))}

                {/* Majorette mobile accordion */}
                <div className="rounded-2xl overflow-hidden border-2 border-[#E8002D]/20">
                  <button
                    onClick={() => setMobileMajOpen(!mobileMajOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 font-bold text-base bg-[#E8002D]/5 text-[#E8002D] hover:bg-[#E8002D]/10 transition-colors"
                  >
                    <span>🚗 Majorette</span>
                    <ChevronDown size={16} className={`transition-transform ${mobileMajOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {mobileMajOpen && (
                      <motion.div
                        initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-2 p-3 bg-[#E8002D]/5">
                          {majoretteCategories.map((cat) => (
                            <Link
                              key={cat.slug}
                              to={`/products?category=${cat.slug}`}
                              onClick={() => { setMobileOpen(false); setMobileMajOpen(false); }}
                              className="flex items-center gap-2 p-2.5 rounded-xl bg-white hover:bg-muted transition-colors"
                            >
                              <span className="text-base">{cat.icon}</span>
                              <span className="text-xs font-bold">{cat.label}</span>
                            </Link>
                          ))}
                          <Link
                            to="/products?category=majorette"
                            onClick={() => { setMobileOpen(false); setMobileMajOpen(false); }}
                            className="col-span-2 flex items-center justify-center gap-2 bg-[#E8002D] text-white font-bold py-2.5 rounded-xl text-sm hover:bg-[#C00025] transition-colors"
                          >
                            <Zap size={14} className="fill-white" /> Shop All Majorette
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <hr className="border-border my-1" />
                {user ? (
                  <>
                    {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-2xl font-bold hover:bg-primary/10 text-primary transition-colors flex items-center gap-2"><Shield size={16} /> Admin Panel</Link>}
                    <Link to="/profile" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-2xl font-bold hover:bg-muted transition-colors flex items-center gap-2"><UserCog size={16} /> My Profile</Link>
                    <Link to="/orders" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-2xl font-bold hover:bg-muted transition-colors flex items-center gap-2"><Package size={16} /> My Orders</Link>
                    <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-2xl font-bold hover:bg-muted transition-colors flex items-center gap-2"><Heart size={16} /> Wishlist</Link>
                    <button onClick={() => { signOut(); setMobileOpen(false); }} className="px-4 py-3 rounded-2xl font-bold hover:bg-destructive/10 text-destructive transition-colors text-left flex items-center gap-2"><LogOut size={16} /> Sign Out</button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-2xl font-bold hover:bg-muted transition-colors flex items-center gap-2"><User size={16} /> Sign In</Link>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* ── Category quick-bar below header ── */}
      <div className="bg-gradient-to-r from-primary via-[hsl(240,80%,55%)] to-[hsl(268,72%,52%)] sticky top-[67px] md:top-[75px] z-40 overflow-x-auto scrollbar-hide shadow-md">
        <div className="container flex items-center gap-1 py-0 h-10">
          {[
            { slug: "hot-wheels",   label: "🏎️ Hot Wheels",   active: "#FFD600" },
            { slug: "majorette",    label: "🚗 Majorette",     active: "#FF3B3B" },
            { slug: "soft-toys",    label: "🧸 Soft Toys",     active: "#FF6FA3" },
            { slug: "rc-toys",      label: "🎮 RC Toys",       active: "#22C55E" },
            { slug: "educational",  label: "🧩 Educational",   active: "#F59E0B" },
            { slug: "action-figures",label:"🦸 Action Figs",   active: "#F97316" },
            { slug: "collectibles", label: "✨ Collectibles",   active: "#A78BFA" },
          ].map((cat) => {
            const isActive = location.search.includes(cat.slug);
            return (
              <Link
                key={cat.slug}
                to={`/products?category=${cat.slug}`}
                className={`whitespace-nowrap px-3.5 py-1 rounded-full text-xs font-black transition-all duration-200 flex-shrink-0
                  ${isActive
                    ? "bg-white text-foreground shadow-sm"
                    : "text-white/80 hover:text-white hover:bg-white/20"
                  }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Header;
