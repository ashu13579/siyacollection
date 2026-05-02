import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, Loader2, FileText, Eye } from "lucide-react";
import { Link } from "react-router-dom";

interface PageContent { id: string; slug: string; title: string; content: string; updated_at: string; }

const AdminPages = () => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<PageContent | null>(null);

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pages_content").select("*").order("slug");
      if (error) throw error;
      return data as PageContent[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selected) return;
      const { error } = await supabase.from("pages_content")
        .update({ title: selected.title, content: selected.content, updated_at: new Date().toISOString() })
        .eq("id", selected.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Page saved ✅");
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      queryClient.invalidateQueries({ queryKey: ["policy-page"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const slugToUrl: Record<string, string> = {
    "privacy-policy": "/privacy-policy",
    "refund-policy": "/refund-policy",
    "terms": "/terms",
    "shipping-policy": "/shipping-policy",
  };

  return (
    <div>
      <h1 className="text-3xl font-black mb-2">Policy Pages</h1>
      <p className="text-sm text-muted-foreground mb-6">Edit your policy pages. Supports ## headings, ### subheadings, - bullet points, and **bold** text.</p>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Page list */}
        <div className="lg:col-span-1 space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"/></div>
          ) : pages.map(p => (
            <button key={p.id} onClick={() => setSelected({...p})}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center gap-2 ${selected?.id === p.id ? "border-primary bg-primary/5 text-primary" : "border-border bg-card hover:border-primary/40"}`}>
              <FileText size={15} className="shrink-0"/>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{p.title}</p>
                <p className="text-xs text-muted-foreground">{new Date(p.updated_at).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="lg:col-span-3">
          {!selected ? (
            <div className="bg-card rounded-2xl border border-border p-12 text-center text-muted-foreground">
              <FileText size={40} className="mx-auto mb-3 opacity-30"/>
              <p className="font-semibold">Select a page to edit</p>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold mb-1 block">Page Title</label>
                  <input value={selected.title} onChange={e => setSelected({...selected, title: e.target.value})}
                    className="px-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary w-72"/>
                </div>
                <div className="flex gap-2">
                  {slugToUrl[selected.slug] && (
                    <Link to={slugToUrl[selected.slug]} target="_blank"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">
                      <Eye size={14}/> Preview
                    </Link>
                  )}
                  <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
                    className="flex items-center gap-1.5 bg-primary text-primary-foreground font-bold px-5 py-2 rounded-xl hover:opacity-90 disabled:opacity-60 text-sm">
                    {saveMutation.isPending ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>}
                    Save
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">Content</label>
                <p className="text-xs text-muted-foreground mb-2">Use ## for heading, ### for subheading, - for bullets, **text** for bold</p>
                <textarea value={selected.content} onChange={e => setSelected({...selected, content: e.target.value})}
                  rows={24} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary resize-y"/>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPages;
