import { useState } from "react";
import { Star, Send, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import StarPicker from "./StarPicker";

interface ReviewSectionProps { productId: string; }
interface Review {
  id: string; rating: number;
  title: string | null; body: string | null; created_at: string;
}

const ReviewSection = ({ productId }: ReviewSectionProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews").select("id, rating, title, body, created_at")
        .eq("product_id", productId).eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Review[];
    },
  });

  const { data: existingReview } = useQuery({
    queryKey: ["my-review", productId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("reviews").select("id, status")
        .eq("product_id", productId).eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not logged in");
      const { error } = await supabase.from("reviews").insert({
        product_id: productId, user_id: user.id, rating,
        title: title.trim() || null, body: body.trim() || null, status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Review submitted! It will go live after approval.");
      setRating(0); setTitle(""); setBody("");
      queryClient.invalidateQueries({ queryKey: ["my-review", productId] });
    },
    onError: (err: any) => {
      if (err?.code === "23505") toast.error("You have already reviewed this product.");
      else toast.error("Could not submit review. Please try again.");
    },
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-black mb-1">Customer Reviews</h2>
      {avgRating && (
        <div className="flex items-center gap-2 mb-6">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={18} className={i < Math.round(Number(avgRating)) ? "fill-secondary text-secondary" : "text-muted-foreground"} />
            ))}
          </div>
          <span className="font-bold">{avgRating}</span>
          <span className="text-muted-foreground text-sm">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
        </div>
      )}

      <div className="bg-muted/40 rounded-2xl p-6 border border-border mb-8">
        <h3 className="font-bold text-lg mb-4">Write a Review</h3>
        {!user ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Lock size={18} />
            <span className="text-sm"><Link to="/auth" className="text-primary font-bold hover:underline">Sign in</Link> to leave a review</span>
          </div>
        ) : existingReview ? (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            {/* Fix 7: was rendering literal "checkmark" text */}
            <span className="text-lg">✅</span>
            {existingReview.status === "pending" ? "Your review is pending approval — thanks!" : "You have already reviewed this product."}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Your Rating *</label>
              <StarPicker value={rating} onChange={setRating} size={28} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Title <span className="text-muted-foreground font-normal">(optional)</span></label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summarize your experience"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-semibold">Review <span className="text-muted-foreground font-normal">(optional)</span></label>
                <span className="text-xs text-muted-foreground">{body.length}/500</span>
              </div>
              <textarea value={body} onChange={(e) => setBody(e.target.value.slice(0, 500))} placeholder="Tell us what you think..."
                rows={3} className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>
            <button onClick={() => { if (rating === 0) { toast.error("Please select a star rating first."); return; } submitMutation.mutate(); }}
              disabled={submitMutation.isPending}
              className="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-50">
              <Send size={16} /> {submitMutation.isPending ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
      ) : reviews.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">No reviews yet — be the first to review this product!</p>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {reviews.map((review, i) => (
              <motion.div key={review.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl p-5 border border-border">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={15} className={j < review.rating ? "fill-secondary text-secondary" : "text-muted-foreground"} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                {review.title && <p className="font-bold text-sm mb-1">{review.title}</p>}
                {review.body && <p className="text-sm text-muted-foreground leading-relaxed">{review.body}</p>}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
