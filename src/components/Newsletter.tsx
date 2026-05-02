import { useState } from "react";
import { Send, CheckCircle2, Loader2, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) { toast.error("Enter a valid email address"); return; }
    setLoading(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: email.trim().toLowerCase() });
    setLoading(false);
    if (error) {
      if (error.code === "23505") { toast.success("You're already subscribed! 🎉"); setEmail(""); }
      else { toast.error("Something went wrong. Please try again."); }
      return;
    }
    setSubscribed(true);
    toast.success("You're subscribed! Welcome to the Siya family! 🎉");
  };

  return (
    <section className="py-10 md:py-14">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary/30 via-background to-primary/10 border-2 border-secondary/40 p-8 md:p-14"
        >
          {/* Decorative floating elements */}
          <div className="absolute top-4 right-8 text-5xl opacity-20 animate-float">🎁</div>
          <div className="absolute bottom-4 left-8 text-4xl opacity-15 animate-float" style={{ animationDelay: "1.5s" }}>🎉</div>
          <div className="absolute top-1/2 right-1/4 text-3xl opacity-10 animate-float" style={{ animationDelay: "0.8s" }}>⭐</div>

          <div className="relative max-w-xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-secondary/30 mb-5">
              <Gift size={26} className="text-secondary-foreground" />
            </div>

            <h2 className="text-3xl md:text-4xl font-display font-semibold mb-3">Stay in the Loop! 📬</h2>
            <p className="text-muted-foreground font-semibold mb-8">
              Subscribe for exclusive deals, new arrivals & surprise discounts — straight to your inbox!
            </p>

            {subscribed ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-primary" />
                </div>
                <p className="font-display font-semibold text-xl">You're in! 🎊</p>
                <p className="text-muted-foreground font-semibold text-sm">We'll send you the best deals right to your inbox.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 px-5 py-3.5 rounded-2xl border-2 border-border bg-card text-foreground focus:outline-none focus:border-primary font-semibold text-sm"
                />
                <button
                  type="submit" disabled={loading}
                  className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-7 py-3.5 rounded-2xl hover:bg-primary/90 transition-all hover:scale-105 shadow-toy disabled:opacity-60 whitespace-nowrap"
                >
                  {loading ? <Loader2 size={17} className="animate-spin" /> : <><Send size={17} /> Subscribe</>}
                </button>
              </form>
            )}

            <p className="text-xs text-muted-foreground font-bold mt-4">No spam, ever. Unsubscribe anytime. 💌</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
