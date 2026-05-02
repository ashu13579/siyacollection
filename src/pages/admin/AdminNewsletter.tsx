import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Trash2, Download } from "lucide-react";

interface Subscriber { id: string; email: string; is_active: boolean; subscribed_at: string; }

const AdminNewsletter = () => {
  const queryClient = useQueryClient();

  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ["newsletter-subscribers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("newsletter_subscribers").select("*").order("subscribed_at", { ascending: false });
      if (error) throw error;
      return data as Subscriber[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => supabase.from("newsletter_subscribers").delete().eq("id", id),
    onSuccess: () => { toast.success("Removed"); queryClient.invalidateQueries({ queryKey: ["newsletter-subscribers"] }); },
  });

  const handleExport = () => {
    const csv = ["Email,Subscribed At", ...subscribers.filter(s => s.is_active).map(s =>
      `${s.email},${new Date(s.subscribed_at).toLocaleDateString("en-IN")}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "newsletter_subscribers.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported!");
  };

  const active = subscribers.filter(s => s.is_active).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black">Newsletter</h1>
          <p className="text-sm text-muted-foreground mt-1">{active} active subscriber{active !== 1 ? "s" : ""}</p>
        </div>
        {subscribers.length > 0 && (
          <button onClick={handleExport}
            className="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all">
            <Download size={16}/> Export CSV
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/></div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Mail size={48} className="mx-auto mb-3 opacity-30"/>
          <p className="font-semibold">No subscribers yet</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-bold">Email</th>
                <th className="text-left px-4 py-3 font-bold hidden sm:table-cell">Subscribed</th>
                <th className="text-left px-4 py-3 font-bold">Status</th>
                <th className="text-right px-4 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map(s => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{s.email}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {new Date(s.subscribed_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {s.is_active ? "Active" : "Unsubscribed"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { if (confirm("Remove this subscriber?")) deleteMutation.mutate(s.id); }}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 size={15}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminNewsletter;
