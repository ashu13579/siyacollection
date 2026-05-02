import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";

interface DbCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image_url: string | null;
  color: string;
  sort_order: number;
}

const emptyCategory = { name: "", slug: "", icon: "🎁", image_url: "", color: "toy-teal", sort_order: 0 };

const AdminCategories = () => {
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCategory);
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    if (data) setCategories(data as DbCategory[]);
  };

  useEffect(() => { fetchData(); }, []);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("category-images").upload(path, file);
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("category-images").getPublicUrl(path);
    setForm((prev) => ({ ...prev, image_url: data.publicUrl }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error("Name is required"); return; }
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, "-");
    const payload = { ...form, slug, image_url: form.image_url || null };

    if (editing) {
      const { error } = await supabase.from("categories").update(payload).eq("id", editing);
      if (error) { toast.error(error.message); return; }
      toast.success("Category updated! ✅");
    } else {
      const { error } = await supabase.from("categories").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Category added! 🎉");
    }
    setShowForm(false);
    setEditing(null);
    setForm(emptyCategory);
    fetchData();
  };

  const handleEdit = (c: DbCategory) => {
    setForm({ name: c.name, slug: c.slug, icon: c.icon, image_url: c.image_url || "", color: c.color, sort_order: c.sort_order });
    setEditing(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Category deleted");
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black">Categories</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyCategory); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all">
          <Plus size={18} /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl p-6 border border-border mb-8 shadow-card">
          <h2 className="text-xl font-black mb-4">{editing ? "Edit Category" : "New Category"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-bold">Slug</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated"
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-bold">Icon (emoji)</label>
              <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-bold">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: +e.target.value })}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-bold">Image</label>
              <div className="mt-2 flex items-center gap-4">
                {form.image_url && (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-border group">
                    <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setForm({ ...form, image_url: "" })}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={12} />
                    </button>
                  </div>
                )}
                <label className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <Upload size={20} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">{uploading ? "..." : "Upload"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                </label>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} className="bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-xl hover:opacity-90">{editing ? "Update" : "Add"} Category</button>
            <button onClick={() => { setShowForm(false); setEditing(null); setForm(emptyCategory); }}
              className="px-6 py-2.5 rounded-xl border border-border font-semibold hover:bg-muted transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="bg-card rounded-2xl p-5 border border-border shadow-card">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {c.image_url ? (
                  <img src={c.image_url} alt={c.name} className="w-14 h-14 rounded-xl object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-2xl">{c.icon}</div>
                )}
                <div>
                  <h3 className="font-bold">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">{c.slug}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(c)} className="p-2 rounded-lg hover:bg-muted"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCategories;
