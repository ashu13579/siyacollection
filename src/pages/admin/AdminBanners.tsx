import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, X, Save, Megaphone } from "lucide-react";

interface DbBanner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link: string;
  is_active: boolean;
  sort_order: number;
}

interface OffersBarData {
  id: string;
  title: string;
  emoji: string;
  highlight_text: string;
  description: string;
  coupon_code: string;
  is_active: boolean;
}

const emptyBanner = { title: "", subtitle: "", image_url: "", link: "/products", is_active: true, sort_order: 0 };

const AdminBanners = () => {
  const [banners, setBanners] = useState<DbBanner[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyBanner);
  const [uploading, setUploading] = useState(false);

  // Offers bar state
  const [offer, setOffer] = useState<OffersBarData | null>(null);
  const [offerSaving, setOfferSaving] = useState(false);

  const fetchData = async () => {
    const { data } = await supabase.from("banners").select("*").order("sort_order");
    if (data) setBanners(data as DbBanner[]);
  };

  const fetchOffer = async () => {
    const { data } = await supabase.from("offers_bar").select("*").order("created_at", { ascending: false }).limit(1).single();
    if (data) setOffer(data as OffersBarData);
  };

  useEffect(() => {
    fetchData();
    fetchOffer();
  }, []);

  const handleSaveOffer = async () => {
    if (!offer) return;
    setOfferSaving(true);
    const { error } = await supabase
      .from("offers_bar")
      .update({
        title: offer.title,
        emoji: offer.emoji,
        highlight_text: offer.highlight_text,
        description: offer.description,
        coupon_code: offer.coupon_code,
        is_active: offer.is_active,
      })
      .eq("id", offer.id);
    if (error) { toast.error(error.message); }
    else { toast.success("Offers bar updated! ✅"); }
    setOfferSaving(false);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("banner-images").upload(path, file);
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("banner-images").getPublicUrl(path);
    setForm((prev) => ({ ...prev, image_url: data.publicUrl }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error("Title is required"); return; }
    const payload = { ...form, subtitle: form.subtitle || null, image_url: form.image_url || null };
    if (editing) {
      const { error } = await supabase.from("banners").update(payload).eq("id", editing);
      if (error) { toast.error(error.message); return; }
      toast.success("Banner updated! ✅");
    } else {
      const { error } = await supabase.from("banners").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Banner added! 🎉");
    }
    setShowForm(false); setEditing(null); setForm(emptyBanner); fetchData();
  };

  const handleEdit = (b: DbBanner) => {
    setForm({ title: b.title, subtitle: b.subtitle || "", image_url: b.image_url || "", link: b.link, is_active: b.is_active, sort_order: b.sort_order });
    setEditing(b.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Banner deleted"); fetchData();
  };

  return (
    <div className="space-y-10">

      {/* ── OFFERS BAR SECTION ── */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
            <Megaphone size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Offers Bar</h1>
            <p className="text-sm text-muted-foreground">The promo banner shown on the homepage between Featured Products and Best Sellers</p>
          </div>
        </div>

        {offer ? (
          <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
            {/* Live preview */}
            <div className="mb-6 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary via-toy-teal to-primary p-6 text-center text-primary-foreground">
                <p className="text-xl font-black">{offer.emoji} {offer.title}</p>
                <p className="text-sm opacity-90 mt-1">
                  Get <span className="font-black text-secondary">{offer.highlight_text}</span> {offer.description}
                </p>
                <p className="text-xs opacity-80 mt-2">
                  Use code: <span className="font-bold bg-white/20 px-2 py-0.5 rounded-md">{offer.coupon_code}</span>
                </p>
              </div>
              <p className="text-xs text-muted-foreground text-center py-1 bg-muted">↑ Live preview</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold mb-1 block">Emoji</label>
                <input
                  value={offer.emoji}
                  onChange={e => setOffer({ ...offer, emoji: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="🎁"
                />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">Title</label>
                <input
                  value={offer.title}
                  onChange={e => setOffer({ ...offer, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Mega Toy Sale!"
                />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">Highlight Text <span className="font-normal text-muted-foreground">(shown in yellow)</span></label>
                <input
                  value={offer.highlight_text}
                  onChange={e => setOffer({ ...offer, highlight_text: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="FLAT 40% OFF"
                />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">Description <span className="font-normal text-muted-foreground">(text after highlight)</span></label>
                <input
                  value={offer.description}
                  onChange={e => setOffer({ ...offer, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="on all soft toys this weekend!"
                />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">Coupon Code</label>
                <input
                  value={offer.coupon_code}
                  onChange={e => setOffer({ ...offer, coupon_code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono tracking-widest"
                  placeholder="SIYA40"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setOffer({ ...offer, is_active: !offer.is_active })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${offer.is_active ? "bg-primary" : "bg-muted-foreground/30"}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${offer.is_active ? "left-7" : "left-1"}`} />
                  </div>
                  <span className="text-sm font-bold">{offer.is_active ? "Banner is visible" : "Banner is hidden"}</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleSaveOffer}
              disabled={offerSaving}
              className="mt-6 flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-60"
            >
              <Save size={16} /> {offerSaving ? "Saving…" : "Save Offers Bar"}
            </button>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border p-10 text-center text-muted-foreground">
            Run the new migration to enable the Offers Bar editor.
          </div>
        )}
      </div>

      {/* ── HERO BANNERS SECTION ── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-black">Hero Banners</h2>
            <p className="text-sm text-muted-foreground">Manage slide banners shown at the top of the homepage</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditing(null); setForm(emptyBanner); }}
            className="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all"
          >
            <Plus size={18} /> Add Banner
          </button>
        </div>

        {showForm && (
          <div className="bg-card rounded-2xl p-6 border border-border mb-6 shadow-card">
            <h2 className="text-xl font-black mb-4">{editing ? "Edit Banner" : "New Banner"}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold">Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm font-bold">Subtitle</label>
                <input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm font-bold">Link</label>
                <input value={form.link} onChange={e => setForm({ ...form, link: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                  Active
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-bold">Banner Image</label>
                <div className="mt-2 flex items-center gap-4">
                  {form.image_url && (
                    <div className="relative w-48 h-24 rounded-xl overflow-hidden border border-border group">
                      <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => setForm({ ...form, image_url: "" })}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  <label className="w-48 h-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <Upload size={20} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">{uploading ? "Uploading…" : "Upload Image"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-xl hover:opacity-90">{editing ? "Update" : "Add"} Banner</button>
              <button onClick={() => { setShowForm(false); setEditing(null); setForm(emptyBanner); }}
                className="px-6 py-2.5 rounded-xl border border-border font-semibold hover:bg-muted transition-colors">Cancel</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map(b => (
            <div key={b.id} className="bg-card rounded-2xl overflow-hidden border border-border shadow-card">
              {b.image_url ? (
                <img src={b.image_url} alt={b.title} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-muted flex items-center justify-center text-4xl">🖼️</div>
              )}
              <div className="p-4 flex items-start justify-between">
                <div>
                  <h3 className="font-bold">{b.title}</h3>
                  {b.subtitle && <p className="text-sm text-muted-foreground">{b.subtitle}</p>}
                  <span className={`text-xs font-bold mt-1 inline-block px-2 py-0.5 rounded-full ${b.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {b.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(b)} className="p-2 rounded-lg hover:bg-muted"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(b.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
          {banners.length === 0 && (
            <div className="md:col-span-2 text-center py-12 text-muted-foreground">No hero banners yet. Add your first one!</div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminBanners;
