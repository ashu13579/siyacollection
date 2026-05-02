import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Check, Tag } from "lucide-react";

interface OffersBarData {
  title: string;
  emoji: string;
  highlight_text: string;
  description: string;
  coupon_code: string;
  is_active: boolean;
}

const defaultOffer: OffersBarData = {
  title: "Mega Toy Sale!",
  emoji: "🎁",
  highlight_text: "FLAT 40% OFF",
  description: "on all soft toys this weekend only!",
  coupon_code: "SIYA40",
  is_active: true,
};

const OffersBar = () => {
  const [offer, setOffer] = useState<OffersBarData>(defaultOffer);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.from("offers_bar").select("*").eq("is_active", true)
      .order("created_at", { ascending: false }).limit(1).single()
      .then(({ data }) => { if (data) setOffer(data as OffersBarData); });
  }, []);

  if (!offer.is_active) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(offer.coupon_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-10 md:py-14">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl"
          style={{
            background: "linear-gradient(135deg, hsl(221 90% 48%), hsl(268 72% 58%), hsl(330 80% 62%))",
          }}
        >
          {/* Animated dot pattern */}
          <div className="absolute inset-0 dot-pattern opacity-20" />

          {/* Decorative circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full" />
          <div className="absolute -bottom-8 left-1/3 w-32 h-32 bg-white/10 rounded-full" />

          <div className="relative p-8 md:p-14 text-center text-white">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-6xl mb-4 inline-block"
            >
              {offer.emoji}
            </motion.div>

            <h3 className="text-3xl md:text-5xl font-display font-semibold mb-3">{offer.title}</h3>
            <p className="text-lg md:text-xl text-white/90 font-semibold mb-6">
              Get{" "}
              <span className="text-secondary font-display font-semibold text-2xl md:text-3xl">
                {offer.highlight_text}
              </span>{" "}
              {offer.description}
            </p>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <p className="text-sm text-white/80 font-bold flex items-center gap-1.5">
                <Tag size={14} /> Use code:
              </p>
              <button
                onClick={handleCopy}
                className="group inline-flex items-center gap-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm border-2 border-white/30 hover:border-white/50 text-white font-display font-semibold px-6 py-2.5 rounded-2xl transition-all text-base"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {offer.coupon_code}
                <span className="text-white/60 text-sm font-bold">
                  {copied ? "Copied!" : "Copy"}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default OffersBar;
