import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, X, ChevronDown, ChevronUp } from "lucide-react";

interface DbProduct {
  id: string; name: string; description: string | null;
  price: number; original_price: number; category_id: string | null;
  images: string[]; rating: number; reviews: number;
  in_stock: boolean; badge: string | null; variants: any;
  stock_quantity: number | null;
}
interface DbCategory { id: string; name: string; slug: string; }
interface VariantGroup { label: string; options: string[]; }

const emptyProduct = {
  name: "", description: "", price: 0, original_price: 0,
  category_id: "", images: [] as string[], in_stock: true,
  badge: "", rating: 0, reviews: 0, stock_quantity: "" as string | number,
};

const AdminProducts = () => {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [uploading, setUploading] = useState(false);
  const [variants, setVariants] = useState<VariantGroup[]>([]);
  const [newVariantLabel, setNewVariantLabel] = useState("");
  const [newVariantOption, setNewVariantOption] = useState<Record<number, string>>({});
  const [showVariants, setShowVariants] = useState(false);

  const fetchData = async () => {
    const [p, c] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name, slug"),
    ]);
    if (p.data) setProducts(p.data as DbProduct[]);
    if (c.data) setCategories(c.data as DbCategory[]);
  };

  useEffect(() => { fetchData(); }, []);

  const handleImageUpload = async (files: FileList) => {
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) { toast.error(`Upload failed: ${error.message}`); continue; }
      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
      urls.push(urlData.publicUrl);
    }
    setForm(prev => ({ ...prev, images: [...prev.images, ...urls] }));
    setUploading(false);
  };

  const addVariantGroup = () => {
    if (!newVariantLabel.trim()) { toast.error("Enter a variant label (e.g. Size, Color)"); return; }
    if (variants.find(v => v.label.toLowerCase() === newVariantLabel.trim().toLowerCase())) {
      toast.error("Variant label already exists"); return;
    }
    setVariants([...variants, { label: newVariantLabel.trim(), options: [] }]);
    setNewVariantLabel("");
  };

  const addVariantOption = (idx: number) => {
    const opt = (newVariantOption[idx] || "").trim();
    if (!opt) return;
    if (variants[idx].options.includes(opt)) { toast.error("Option already exists"); return; }
    const updated = [...variants];
    updated[idx] = { ...updated[idx], options: [...updated[idx].options, opt] };
    setVariants(updated);
    setNewVariantOption({ ...newVariantOption, [idx]: "" });
  };

  const removeVariantOption = (gIdx: number, oIdx: number) => {
    const updated = [...variants];
    updated[gIdx].options = updated[gIdx].options.filter((_, i) => i !== oIdx);
    setVariants(updated);
  };

  const removeVariantGroup = (idx: number) => {
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!form.name || !form.price) { toast.error("Name and price are required"); return; }
    const payload = {
      name: form.name, description: form.description || null,
      price: form.price, original_price: form.original_price || form.price,
      category_id: form.category_id || null, images: form.images,
      in_stock: form.in_stock, badge: form.badge || null,
      rating: form.rating, reviews: form.reviews,
      variants: variants.length > 0 ? variants : null,
      stock_quantity: form.stock_quantity === "" ? null : Number(form.stock_quantity),
    };
    if (editing) {
      const { error } = await supabase.from("products").update(payload).eq("id", editing);
      if (error) { toast.error(error.message); return; }
      toast.success("Product updated! ✅");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Product added! 🎉");
    }
    setShowForm(false); setEditing(null); setForm(emptyProduct); setVariants([]); fetchData();
  };

  const handleEdit = (p: DbProduct) => {
    setForm({
      name: p.name, description: p.description || "",
      price: p.price, original_price: p.original_price,
      category_id: p.category_id || "", images: p.images || [],
      in_stock: p.in_stock, badge: p.badge || "",
      rating: p.rating, reviews: p.reviews,
      stock_quantity: p.stock_quantity ?? "",
    });
    setVariants(Array.isArray(p.variants) ? p.variants : []);
    setEditing(p.id); setShowForm(true); setShowVariants(Array.isArray(p.variants) && p.variants.length > 0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Product deleted"); fetchData();
  };

  const resetForm = () => { setShowForm(false); setEditing(null); setForm(emptyProduct); setVariants([]); setShowVariants(false); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black">Products</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyProduct); setVariants([]); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all">
          <Plus size={18}/> Add Product
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl p-6 border border-border mb-8 shadow-card">
          <h2 className="text-xl font-black mb-4">{editing ? "Edit Product" : "New Product"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold">Name *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
            </div>
            <div>
              <label className="text-sm font-bold">Category</label>
              <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-bold">Price (₹) *</label>
              <input type="number" value={form.price} onChange={e => setForm({...form, price: +e.target.value})}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
            </div>
            <div>
              <label className="text-sm font-bold">Original Price (₹) <span className="font-normal text-muted-foreground">for strikethrough</span></label>
              <input type="number" value={form.original_price} onChange={e => setForm({...form, original_price: +e.target.value})}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
            </div>
            <div>
              <label className="text-sm font-bold">Badge <span className="font-normal text-muted-foreground">e.g. Best Seller, New, Hot</span></label>
              <input value={form.badge} onChange={e => setForm({...form, badge: e.target.value})}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
            </div>
            <div>
              <label className="text-sm font-bold">Stock Quantity <span className="font-normal text-muted-foreground">leave blank for unlimited</span></label>
              <input type="number" min="0" value={form.stock_quantity} onChange={e => setForm({...form, stock_quantity: e.target.value})}
                placeholder="e.g. 50"
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                <input type="checkbox" checked={form.in_stock} onChange={e => setForm({...form, in_stock: e.target.checked})}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"/>
                In Stock
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-bold">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"/>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-bold">Images</label>
              <div className="mt-2 flex flex-wrap gap-3">
                {form.images.map((url, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-border group">
                    <img src={url} alt="" className="w-full h-full object-cover"/>
                    <button onClick={() => setForm(prev => ({...prev, images: prev.images.filter((_, j) => j !== i)}))}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={12}/>
                    </button>
                  </div>
                ))}
                <label className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <Upload size={20} className="text-muted-foreground"/>
                  <span className="text-xs text-muted-foreground mt-1">{uploading ? "Uploading…" : "Upload"}</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={e => e.target.files && handleImageUpload(e.target.files)}/>
                </label>
              </div>
            </div>

            {/* ── Variant Builder ── */}
            <div className="md:col-span-2">
              <button type="button" onClick={() => setShowVariants(!showVariants)}
                className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                {showVariants ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                {variants.length > 0 ? `Variants (${variants.length} group${variants.length > 1 ? "s" : ""})` : "Add Variants (Size, Color, etc.)"}
              </button>

              {showVariants && (
                <div className="mt-3 bg-muted/40 rounded-xl p-4 space-y-4 border border-border">
                  {variants.map((group, gIdx) => (
                    <div key={gIdx} className="bg-card rounded-xl p-3 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-sm">{group.label}</p>
                        <button onClick={() => removeVariantGroup(gIdx)} className="text-destructive hover:bg-destructive/10 p-1 rounded-lg"><X size={14}/></button>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {group.options.map((opt, oIdx) => (
                          <span key={oIdx} className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
                            {opt}
                            <button onClick={() => removeVariantOption(gIdx, oIdx)} className="hover:text-destructive"><X size={11}/></button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input value={newVariantOption[gIdx] || ""} onChange={e => setNewVariantOption({...newVariantOption, [gIdx]: e.target.value})}
                          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addVariantOption(gIdx); }}}
                          placeholder={`Add ${group.label} option…`}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"/>
                        <button onClick={() => addVariantOption(gIdx)}
                          className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90">Add</button>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input value={newVariantLabel} onChange={e => setNewVariantLabel(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addVariantGroup(); }}}
                      placeholder="New variant group (e.g. Size, Color)"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
                    <button onClick={addVariantGroup}
                      className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-secondary-foreground text-sm font-bold rounded-lg hover:opacity-90">
                      <Plus size={14}/> Group
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} className="bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-xl hover:opacity-90">
              {editing ? "Update" : "Add"} Product
            </button>
            <button onClick={resetForm} className="px-6 py-2.5 rounded-xl border border-border font-semibold hover:bg-muted transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-bold">Image</th>
              <th className="text-left px-4 py-3 font-bold">Name</th>
              <th className="text-left px-4 py-3 font-bold">Price</th>
              <th className="text-left px-4 py-3 font-bold hidden md:table-cell">Stock</th>
              <th className="text-left px-4 py-3 font-bold hidden md:table-cell">Badge</th>
              <th className="text-right px-4 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded-lg object-cover"/>
                    : <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-lg">📦</div>}
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{p.name}</p>
                  {Array.isArray(p.variants) && p.variants.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">{p.variants.map((v:any) => v.label).join(", ")}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="font-bold">₹{p.price.toLocaleString()}</span>
                  {p.original_price > p.price && <span className="text-muted-foreground line-through ml-2 text-xs">₹{p.original_price.toLocaleString()}</span>}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.in_stock ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                    {p.in_stock ? (p.stock_quantity != null ? `${p.stock_quantity} left` : "In Stock") : "Out of Stock"}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {p.badge && <span className="bg-accent/15 text-accent text-xs font-bold px-2 py-1 rounded-full">{p.badge}</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(p)} className="p-2 rounded-lg hover:bg-muted"><Pencil size={16}/></button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No products yet. Add your first one!</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;
