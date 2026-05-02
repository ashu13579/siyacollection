import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Phone, Mail, Save, Loader2, KeyRound, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ display_name: "", phone: "", email: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name, phone, email").eq("user_id", user.id).single()
      .then(({ data }) => {
        if (data) setProfile({ display_name: data.display_name || "", phone: data.phone || "", email: data.email || user.email || "" });
      });
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary"/></div>;
  if (!user) { navigate("/auth"); return null; }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.display_name.trim()) { toast.error("Name is required"); return; }
    if (profile.phone && !/^\d{10}$/.test(profile.phone)) { toast.error("Enter a valid 10-digit phone number"); return; }
    setSavingProfile(true);
    const { error } = await supabase.from("profiles").update({
      display_name: profile.display_name.trim(),
      phone: profile.phone.trim() || null,
    }).eq("user_id", user.id);
    setSavingProfile(false);
    if (error) { toast.error(error.message); return; }
    setProfileSaved(true);
    toast.success("Profile updated! ✅");
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.next.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (pwForm.next !== pwForm.confirm) { toast.error("Passwords don't match"); return; }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: pwForm.next });
    setSavingPw(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password changed successfully! ✅");
    setPwForm({ current: "", next: "", confirm: "" });
    setShowPw(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="My Profile" url="/profile" />
      <Header />
      <main className="container py-8 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-black mb-8 flex items-center gap-3">
          <User size={32} className="text-primary"/> My Profile
        </h1>

        <div className="space-y-6">
          {/* Profile info */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border shadow-card p-6">
            <h2 className="text-xl font-black mb-5">Personal Information</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-sm font-bold mb-1 block">Full Name *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                  <input value={profile.display_name} onChange={e => setProfile({...profile, display_name: e.target.value})}
                    placeholder="Your full name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
                </div>
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">Email <span className="font-normal text-muted-foreground">(cannot be changed)</span></label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                  <input value={profile.email} disabled
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-muted text-sm opacity-70 cursor-not-allowed"/>
                </div>
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">Phone Number <span className="font-normal text-muted-foreground">(optional)</span></label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                  <input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})}
                    placeholder="10-digit mobile number" maxLength={10}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
                </div>
              </div>
              <button type="submit" disabled={savingProfile}
                className="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-60">
                {savingProfile ? <Loader2 size={16} className="animate-spin"/> : profileSaved ? <CheckCircle2 size={16}/> : <Save size={16}/>}
                {savingProfile ? "Saving…" : profileSaved ? "Saved!" : "Save Changes"}
              </button>
            </form>
          </motion.div>

          {/* Change password */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl border border-border shadow-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black">Password</h2>
              <button onClick={() => setShowPw(!showPw)} className="text-sm text-primary font-bold hover:underline">
                {showPw ? "Cancel" : "Change Password"}
              </button>
            </div>
            {!showPw ? (
              <p className="text-sm text-muted-foreground flex items-center gap-2"><KeyRound size={16}/> ••••••••••••</p>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                {[
                  { label: "New Password", key: "next", placeholder: "At least 6 characters" },
                  { label: "Confirm New Password", key: "confirm", placeholder: "Repeat new password" },
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-sm font-bold mb-1 block">{field.label}</label>
                    <input type="password" value={pwForm[field.key as keyof typeof pwForm]}
                      onChange={e => setPwForm({...pwForm, [field.key]: e.target.value})}
                      placeholder={field.placeholder} minLength={6}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
                  </div>
                ))}
                <button type="submit" disabled={savingPw}
                  className="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-60">
                  {savingPw ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}
                  {savingPw ? "Updating…" : "Update Password"}
                </button>
              </form>
            )}
          </motion.div>

          {/* Quick links */}
          <div className="flex flex-wrap gap-3">
            <Link to="/orders" className="flex items-center gap-2 bg-muted font-bold px-5 py-2.5 rounded-xl hover:bg-muted/70 text-sm transition-colors">
              📦 My Orders
            </Link>
            <Link to="/wishlist" className="flex items-center gap-2 bg-muted font-bold px-5 py-2.5 rounded-xl hover:bg-muted/70 text-sm transition-colors">
              ❤️ Wishlist
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Profile;
