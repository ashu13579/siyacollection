import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Save, Key, Truck, CreditCard, RefreshCw, Bell } from "lucide-react";

interface AppSetting {
  id: string;
  key: string;
  value: string;
  label: string;
  is_secret: boolean;
}

const groupConfig: Record<string, { title: string; icon: React.ElementType; description: string }> = {
  twilio: { title: "WhatsApp Notifications (Twilio)", icon: Bell, description: "Receive WhatsApp alerts when a new order is placed" },
  resend: { title: "Email Notifications (Resend)", icon: Bell, description: "Receive email alerts for new orders" },
  admin: { title: "Admin Contact Details", icon: Bell, description: "Where order notifications are sent" },
  razorpay: { title: "Razorpay Payment Gateway", icon: CreditCard, description: "Configure Razorpay for accepting online payments (UPI, Cards, Net Banking)" },
  delhivery: { title: "Delhivery Shipping & Auto-Shipment", icon: Truck, description: "Configure Delhivery API for automatic shipment creation and pincode checks. Set your pickup location name exactly as registered in your Delhivery dashboard." },
};

const AdminSettings = () => {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("app_settings").select("*").order("key");
    if (error) { toast.error(error.message); return; }
    const s = (data || []) as AppSetting[];
    setSettings(s);
    const v: Record<string, string> = {};
    s.forEach((item) => { v[item.key] = item.value; });
    setValues(v);
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async () => {
    setSaving(true);
    for (const setting of settings) {
      if (values[setting.key] !== setting.value) {
        const { error } = await supabase.from("app_settings").update({ value: values[setting.key] }).eq("id", setting.id);
        if (error) { toast.error(`Failed to save ${setting.label}: ${error.message}`); setSaving(false); return; }
      }
    }
    toast.success("Settings saved! ✅");
    setSaving(false);
    fetchSettings();
  };

  const grouped = settings.reduce((acc, s) => {
    const prefix = s.key.split("_")[0];
    if (!acc[prefix]) acc[prefix] = [];
    acc[prefix].push(s);
    return acc;
  }, {} as Record<string, AppSetting[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black">Settings & API Keys</h1>
          <p className="text-muted-foreground mt-1">Manage your payment gateway and shipping integrations</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
        >
          <Save size={18} /> {saving ? "Saving..." : "Save All"}
        </button>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([prefix, items]) => {
          const config = groupConfig[prefix] || { title: prefix, icon: Key, description: "" };
          const Icon = config.icon;
          return (
            <div key={prefix} className="bg-card rounded-2xl border border-border shadow-card p-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon size={20} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-black">{config.title}</h2>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                </div>
              </div>
              <div className="grid gap-4 mt-5">
                {items.map((setting) => (
                  <div key={setting.id}>
                    <label className="text-sm font-bold mb-1 block">{setting.label}</label>
                    <div className="relative">
                      <input
                        type={setting.is_secret && !visible[setting.key] ? "password" : "text"}
                        value={values[setting.key] || ""}
                        onChange={(e) => setValues({ ...values, [setting.key]: e.target.value })}
                        placeholder={`Enter ${setting.label.toLowerCase()}`}
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary pr-12"
                      />
                      {setting.is_secret && (
                        <button
                          type="button"
                          onClick={() => setVisible({ ...visible, [setting.key]: !visible[setting.key] })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {visible[setting.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Status indicator */}
              <div className="mt-4 flex items-center gap-2">
                {items.every((s) => values[s.key]) ? (
                  <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">✅ Configured</span>
                ) : (
                  <span className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">⚠️ Not configured</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminSettings;
