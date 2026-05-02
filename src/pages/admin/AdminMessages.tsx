import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail, MailOpen, Trash2, Phone, Clock } from "lucide-react";

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

const AdminMessages = () => {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages").select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Message[];
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-messages"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Message deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
    },
  });

  const unreadCount = messages.filter(m => !m.is_read).length;

  const handleExpand = (id: string) => {
    setExpanded(prev => prev === id ? null : id);
    const msg = messages.find(m => m.id === id);
    if (msg && !msg.is_read) markReadMutation.mutate(id);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-2">
            Messages
            {unreadCount > 0 && (
              <span className="text-sm bg-primary text-primary-foreground font-bold px-2.5 py-0.5 rounded-full">{unreadCount} new</span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{messages.length} total contact form submissions</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/></div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Mail size={48} className="mx-auto mb-3 opacity-30"/>
          <p className="font-semibold">No messages yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`bg-card rounded-2xl border shadow-card overflow-hidden transition-all ${!msg.is_read ? "border-primary/40" : "border-border"}`}>
              <div className="p-5 flex items-start gap-4 cursor-pointer" onClick={() => handleExpand(msg.id)}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${!msg.is_read ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {msg.is_read ? <MailOpen size={18}/> : <Mail size={18}/>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`font-bold truncate ${!msg.is_read ? "text-foreground" : "text-muted-foreground"}`}>{msg.name}</p>
                    <p className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                      <Clock size={11}/> {new Date(msg.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">{msg.message}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <a href={`mailto:${msg.email}`} onClick={e => e.stopPropagation()} className="hover:text-primary underline">{msg.email}</a>
                    {msg.phone && <span className="flex items-center gap-1"><Phone size={10}/> {msg.phone}</span>}
                  </div>
                </div>
                {!msg.is_read && <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"/>}
              </div>

              {expanded === msg.id && (
                <div className="px-5 pb-5 pt-0 border-t border-border bg-muted/30">
                  <p className="text-sm text-foreground leading-relaxed mt-4 mb-4 whitespace-pre-wrap">{msg.message}</p>
                  <div className="flex gap-2">
                    <a href={`mailto:${msg.email}?subject=Re: Your message to Siya Collection`}
                      className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90">
                      <Mail size={13}/> Reply via Email
                    </a>
                    {msg.phone && (
                      <a href={`https://wa.me/91${msg.phone.replace(/\D/g,'')}?text=Hi ${encodeURIComponent(msg.name)}, thanks for contacting Siya Collection!`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-[#25D366] text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90">
                        WhatsApp
                      </a>
                    )}
                    <button onClick={() => { if (confirm("Delete this message?")) deleteMutation.mutate(msg.id); }}
                      className="flex items-center gap-1.5 bg-destructive/10 text-destructive text-xs font-bold px-4 py-2 rounded-lg hover:bg-destructive hover:text-white transition-colors ml-auto">
                      <Trash2 size={13}/> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
