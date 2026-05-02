import { useState } from "react";
import { Star, Check, Trash2, MessageSquare } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type FilterStatus = "pending" | "approved" | "all";

interface AdminReview {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  status: string;
  created_at: string;
  product_id: string;
  user_id: string;
  products: { name: string } | null;
}

const AdminReviews = () => {
  const [filter, setFilter] = useState<FilterStatus>("pending");
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin-reviews", filter],
    queryFn: async () => {
      let query = supabase
        .from("reviews")
        .select("id, rating, title, body, status, created_at, product_id, user_id, products(name)")
        .order("created_at", { ascending: false });
      if (filter !== "all") {
        query = query.eq("status", filter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as AdminReview[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews").update({ status: "approved" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Review approved and now live!");
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["homepage-testimonials"] });
    },
    onError: () => toast.error("Failed to approve review."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Review deleted.");
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["homepage-testimonials"] });
    },
    onError: () => toast.error("Failed to delete review."),
  });

  const filters: { label: string; value: FilterStatus }[] = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "All", value: "all" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="text-primary" size={24} />
        <div>
          <h1 className="text-2xl font-black">Reviews</h1>
          <p className="text-muted-foreground text-sm">Moderate customer reviews before they go live</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 bg-muted/50 p-1 rounded-xl w-fit">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              filter === f.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No {filter !== "all" ? filter : ""} reviews</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-card rounded-2xl p-5 border border-border flex flex-col sm:flex-row gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={14} className={j < review.rating ? "fill-secondary text-secondary" : "text-muted-foreground"} />
                    ))}
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${review.status === "approved" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {review.status}
                  </span>
                  {review.products?.name && (
                    <span className="text-xs text-muted-foreground truncate">{review.products.name}</span>
                  )}
                </div>
                {review.title && <p className="font-bold text-sm mb-1">{review.title}</p>}
                {review.body ? (
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.body}</p>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No written review</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(review.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <div className="flex sm:flex-col gap-2 sm:w-28 shrink-0">
                {review.status === "pending" && (
                  <button
                    onClick={() => approveMutation.mutate(review.id)}
                    disabled={approveMutation.isPending}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Check size={15} /> Approve
                  </button>
                )}
                <button
                  onClick={() => { if (confirm("Delete this review permanently?")) deleteMutation.mutate(review.id); }}
                  disabled={deleteMutation.isPending}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-destructive/10 text-destructive text-sm font-bold px-4 py-2 rounded-xl hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
