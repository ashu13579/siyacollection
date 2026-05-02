import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

interface PolicyPageProps { slug: string; }

// Simple markdown-ish renderer for the policy content
const renderContent = (text: string) => {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("## ")) return <h2 key={i} className="text-2xl font-black mt-8 mb-3 first:mt-0">{line.slice(3)}</h2>;
    if (line.startsWith("### ")) return <h3 key={i} className="text-lg font-bold mt-6 mb-2">{line.slice(4)}</h3>;
    if (line.startsWith("- ")) return <li key={i} className="ml-4 text-muted-foreground">{line.slice(2)}</li>;
    if (/^\d+\./.test(line)) return <li key={i} className="ml-4 text-muted-foreground list-decimal">{line.replace(/^\d+\.\s/, "")}</li>;
    if (line.trim() === "") return <div key={i} className="h-2" />;
    // Handle **bold**
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="text-muted-foreground leading-relaxed">
        {parts.map((p, j) => p.startsWith("**") ? <strong key={j} className="text-foreground font-bold">{p.slice(2,-2)}</strong> : p)}
      </p>
    );
  });
};

const PolicyPage = ({ slug }: PolicyPageProps) => {
  const { data: page, isLoading } = useQuery({
    queryKey: ["policy-page", slug],
    queryFn: async () => {
      const { data } = await supabase.from("pages_content").select("title, content, updated_at").eq("slug", slug).single();
      return data;
    },
  });

  const titleMap: Record<string, string> = {
    "privacy-policy": "Privacy Policy",
    "refund-policy": "Refund & Return Policy",
    "terms": "Terms & Conditions",
    "shipping-policy": "Shipping Policy",
  };

  const displayTitle = page?.title || titleMap[slug] || "Policy";

  return (
    <div className="min-h-screen bg-background">
      <SEO title={displayTitle} url={`/${slug}`} />
      <Header />
      <main className="container py-8 md:py-12 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm font-semibold mb-6">
          <ArrowLeft size={16} /> Home
        </Link>
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-8 bg-muted rounded-full w-1/2 mb-6"/>
            {Array.from({length:8}).map((_,i) => <div key={i} className={`h-4 bg-muted rounded-full ${i%3===2?"w-2/3":"w-full"}`}/>)}
          </div>
        ) : page ? (
          <article className="prose-sm">
            <div className="space-y-1">{renderContent(page.content)}</div>
            <p className="text-xs text-muted-foreground mt-10 pt-6 border-t border-border">
              Last updated: {new Date(page.updated_at).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}
            </p>
          </article>
        ) : (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📄</p>
            <h2 className="text-2xl font-black">{displayTitle}</h2>
            <p className="text-muted-foreground mt-2">Content coming soon.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PolicyPage;
