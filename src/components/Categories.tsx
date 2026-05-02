import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useDbCategories } from "@/hooks/useProducts";

const fallbackCategories = [
  { id: "soft-toys",    slug: "soft-toys",    name: "Soft Toys",       icon: "🧸", bg: "from-[#FFE0EC] to-[#FFB6CC]", ring: "#FF6FA3", count: "120+" },
  { id: "rc-toys",      slug: "rc-toys",      name: "RC Toys",         icon: "🏎️", bg: "from-[#DCF0FF] to-[#AAD8FF]", ring: "#1A6FE8", count: "85+"  },
  { id: "educational",  slug: "educational",  name: "Educational",     icon: "🧩", bg: "from-[#FFF5B2] to-[#FFE44D]", ring: "#D4A000", count: "200+" },
  { id: "action-figures",slug:"action-figures",name:"Action Figures",  icon: "🦸", bg: "from-[#FFE4CC] to-[#FFBB80]", ring: "#FF7A00", count: "95+"  },
  { id: "collectibles", slug: "collectibles", name: "Collectibles",    icon: "✨", bg: "from-[#EDE0FF] to-[#C9AAFF]", ring: "#7C3AED", count: "60+"  },
  { id: "hot-wheels",   slug: "hot-wheels",   name: "Hot Wheels",      icon: "🚗", bg: "from-[#FFE0E0] to-[#FFAAAA]", ring: "#EF4444", count: "150+" },
];

const Categories = () => {
  const { data: dbCategories = [] } = useDbCategories();

  const cats = dbCategories.length > 0
    ? dbCategories.map((c, i) => ({
        ...fallbackCategories[i % fallbackCategories.length],
        id: c.id,
        slug: c.slug,
        name: c.name,
        icon: c.icon || fallbackCategories[i % fallbackCategories.length].icon,
        image_url: c.image_url,
      }))
    : fallbackCategories;

  return (
    <section className="py-14 md:py-20 bg-muted/40">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display font-semibold mb-3">Shop by Category</h2>
          <p className="text-muted-foreground font-semibold">Find the perfect toy for every little explorer</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {cats.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-3xl hover:shadow-toy transition-all duration-300 hover:-translate-y-2 cursor-pointer block"
                style={{ background: `linear-gradient(135deg, ${cat.bg.replace("from-[", "").replace("] to-[", ", ").replace("]", "")})` }}
              >
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name}
                    className="w-16 h-16 rounded-2xl object-cover group-hover:scale-110 transition-transform duration-300 shadow-md" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300"
                    style={{ background: "rgba(255,255,255,0.5)", boxShadow: `0 4px 16px ${cat.ring}40` }}>
                    {cat.icon}
                  </div>
                )}
                <div className="text-center">
                  <p className="font-display font-semibold text-foreground text-sm">{cat.name}</p>
                  <p className="text-xs text-muted-foreground font-bold mt-0.5">{cat.count} items</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
