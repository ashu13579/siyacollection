import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ApprovedReview {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
}

const avatarBgs = [
  "bg-[hsl(44,100%,52%)]", "bg-[hsl(221,90%,58%)]", "bg-[hsl(5,90%,58%)]",
  "bg-[hsl(145,65%,42%)]", "bg-[hsl(268,72%,58%)]", "bg-[hsl(330,80%,62%)]",
];
const avatarEmojis = ["👦", "👧", "🧑", "👩", "🧒", "👨"];

const Testimonials = () => {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["homepage-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, rating, title, body, created_at")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data as ApprovedReview[];
    },
  });

  if (!isLoading && reviews.length === 0) return null;

  return (
    <section className="py-14 md:py-20 bg-foreground overflow-hidden">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary font-bold text-sm px-4 py-1.5 rounded-full mb-4">
            ⭐ Customer Reviews
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-semibold text-background mb-3">Happy Parents</h2>
          <p className="text-background/60 font-semibold">What our customers say about Siya Collection</p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 rounded-full border-3 border-secondary border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="bg-background/8 border border-background/12 rounded-3xl p-6 flex flex-col gap-4 hover:bg-background/12 transition-colors"
              >
                {/* Quote icon */}
                <Quote size={20} className="text-secondary opacity-60" />

                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={15}
                      className={j < review.rating ? "fill-secondary text-secondary" : "fill-background/20 text-background/20"} />
                  ))}
                </div>

                {review.body && (
                  <p className="text-sm text-background/75 leading-relaxed font-semibold flex-1">
                    "{review.body}"
                  </p>
                )}

                <div className="flex items-center gap-3 mt-auto">
                  <div className={`w-10 h-10 rounded-2xl ${avatarBgs[i % avatarBgs.length]} flex items-center justify-center text-lg`}>
                    {avatarEmojis[i % avatarEmojis.length]}
                  </div>
                  <div>
                    {review.title && (
                      <p className="font-display font-semibold text-background text-sm">{review.title}</p>
                    )}
                    <p className="text-xs text-background/50 font-bold">
                      {new Date(review.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
