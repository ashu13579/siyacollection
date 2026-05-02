import { useState } from "react";
import { Phone, Mail, MapPin, Instagram, Clock, Send, Loader2, CheckCircle2, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

const contactItems = [
  { icon: Phone, label: "+91 97737 29154", href: "tel:+919773729154", color: "bg-primary/10 text-primary" },
  { icon: Mail, label: "siyacollection@gmail.com", href: "mailto:siyacollection@gmail.com", color: "bg-accent/10 text-accent" },
  { icon: MapPin, label: "Kandivali West, Mumbai, MH - 400067", href: null, color: "bg-green-100 text-green-700" },
  { icon: Clock, label: "Mon–Sat 10AM–9PM | Sun 11AM–7PM", href: null, color: "bg-secondary/30 text-secondary-foreground" },
  { icon: Instagram, label: "@siyacollection", href: "https://instagram.com/siyacollection", color: "bg-pink-100 text-pink-600" },
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in name, email and message"); return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) { toast.error("Enter a valid email address"); return; }
    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: form.name.trim(), email: form.email.trim(),
      phone: form.phone.trim() || null, message: form.message.trim(),
    });
    setSending(false);
    if (error) { toast.error("Failed to send. Please WhatsApp or email us directly."); return; }
    setSent(true);
    toast.success("Message sent! We'll reply soon 🎉");
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <div className="bg-foreground py-12 md:py-16 text-center">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-5xl mb-4">📞</div>
            <h1 className="text-4xl md:text-5xl font-display font-semibold text-background mb-2">Get In Touch</h1>
            <p className="text-background/50 font-semibold">We'd love to hear from you!</p>
          </motion.div>
        </div>
      </div>

      <main className="container py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

          {/* Contact info */}
          <div className="space-y-5">
            <div className="bg-card rounded-3xl p-6 border-2 border-border shadow-card">
              <h3 className="text-2xl font-display font-semibold mb-6">Siya Collection</h3>
              <div className="space-y-4">
                {contactItems.map(({ icon: Icon, label, href, color }) =>
                  href ? (
                    <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 group hover:opacity-80 transition-opacity">
                      <div className={`w-11 h-11 rounded-2xl ${color} flex items-center justify-center shrink-0`}>
                        <Icon size={19} />
                      </div>
                      <span className="font-semibold text-sm group-hover:text-primary transition-colors">{label}</span>
                    </a>
                  ) : (
                    <div key={label} className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-2xl ${color} flex items-center justify-center shrink-0`}>
                        <Icon size={19} />
                      </div>
                      <span className="font-semibold text-sm">{label}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/919773729154?text=Hi%20Siya%20Collection!%20I%20need%20help%20with%20an%20order."
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 bg-[#25D366] text-white p-5 rounded-3xl hover:opacity-90 transition-all hover:scale-[1.02] shadow-md"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <MessageCircle size={22} />
              </div>
              <div>
                <p className="font-display font-semibold text-lg">Chat on WhatsApp</p>
                <p className="text-sm text-white/80 font-semibold">Fastest way to reach us!</p>
              </div>
            </a>

            {/* Map */}
            <div className="rounded-3xl overflow-hidden border-2 border-border shadow-card h-[220px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3767.5!2d72.84!3d19.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDEyJzAwLjAiTiA3MsKwNTAnMjQuMCJF!5e0!3m2!1sen!2sin!4v1234567890"
                className="w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Siya Collection location"
              />
            </div>
          </div>

          {/* Form */}
          <div className="bg-card rounded-3xl p-6 md:p-8 border-2 border-border shadow-card">
            <h3 className="text-2xl font-display font-semibold mb-6">Send Us a Message</h3>

            {sent ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center text-center py-12 gap-4">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 size={40} className="text-primary" />
                </div>
                <h4 className="text-2xl font-display font-semibold">Message Sent! 🎉</h4>
                <p className="text-muted-foreground font-semibold">We'll get back to you within 24 hours.</p>
                <button onClick={() => setSent(false)} className="mt-2 text-primary font-bold underline text-sm">
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { key: "name", label: "Your Name *", placeholder: "e.g. Priya Sharma", type: "text" },
                  { key: "email", label: "Email Address *", placeholder: "priya@email.com", type: "email" },
                  { key: "phone", label: "Phone Number", placeholder: "+91 98765 43210 (optional)", type: "tel" },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key}>
                    <label className="block text-sm font-bold mb-1.5">{label}</label>
                    <input
                      type={type}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-border bg-background focus:outline-none focus:border-primary font-semibold text-sm transition-colors"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-bold mb-1.5">Message *</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us how we can help…"
                    rows={4}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-border bg-background focus:outline-none focus:border-primary font-semibold text-sm resize-none transition-colors"
                  />
                </div>
                <button
                  type="submit" disabled={sending}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all hover:scale-[1.02] shadow-toy disabled:opacity-60 text-base"
                >
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  {sending ? "Sending…" : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Contact;
