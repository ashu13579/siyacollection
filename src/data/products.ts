export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  images: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  badge?: string;
  variants?: { label: string; options: string[] }[];
}

export const categories = [
  { id: "soft-toys", name: "Soft Toys", icon: "🧸", color: "toy-pink" },
  { id: "rc-toys", name: "RC Toys", icon: "🚗", color: "toy-teal" },
  { id: "educational", name: "Educational", icon: "🧩", color: "toy-yellow" },
  { id: "action-figures", name: "Action Figures", icon: "🦸", color: "toy-orange" },
  { id: "collectibles", name: "Collectibles", icon: "✨", color: "toy-purple" },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Giant Teddy Bear",
    description: "Super soft and huggable 4ft teddy bear. Perfect gift for kids and loved ones. Made with premium plush material.",
    price: 1499,
    originalPrice: 2499,
    category: "soft-toys",
    images: ["https://images.unsplash.com/photo-1562040506-a9b32cb51b94?w=600&h=600&fit=crop"],
    rating: 4.8,
    reviews: 234,
    inStock: true,
    badge: "Best Seller",
    variants: [{ label: "Size", options: ["2ft", "3ft", "4ft"] }, { label: "Color", options: ["Brown", "White", "Pink"] }],
  },
  {
    id: "2",
    name: "RC Monster Truck",
    description: "High-speed remote control monster truck with 4WD and rechargeable battery. Hours of fun guaranteed!",
    price: 2199,
    originalPrice: 3499,
    category: "rc-toys",
    images: ["https://images.unsplash.com/photo-1581235707960-35f13de9ee28?w=600&h=600&fit=crop"],
    rating: 4.6,
    reviews: 189,
    inStock: true,
    badge: "🔥 Hot",
  },
  {
    id: "3",
    name: "Building Blocks Set (500pc)",
    description: "Creative building blocks set with 500 pieces. Develops creativity, motor skills, and imagination.",
    price: 899,
    originalPrice: 1299,
    category: "educational",
    images: ["https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&h=600&fit=crop"],
    rating: 4.9,
    reviews: 312,
    inStock: true,
    badge: "Top Rated",
  },
  {
    id: "4",
    name: "Superhero Action Figure Set",
    description: "Set of 6 premium superhero action figures with accessories. Detailed and poseable.",
    price: 1799,
    originalPrice: 2499,
    category: "action-figures",
    images: ["https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=600&h=600&fit=crop"],
    rating: 4.7,
    reviews: 156,
    inStock: true,
  },
  {
    id: "5",
    name: "Anime Collectible Figure",
    description: "Limited edition anime collectible figure with detailed craftsmanship. A must-have for collectors.",
    price: 3499,
    originalPrice: 4999,
    category: "collectibles",
    images: ["https://images.unsplash.com/photo-1613861615601-a1c8ef6b40b9?w=600&h=600&fit=crop"],
    rating: 4.9,
    reviews: 89,
    inStock: true,
    badge: "Limited",
  },
  {
    id: "6",
    name: "Musical Learning Tablet",
    description: "Interactive kids tablet with songs, alphabets, and games. Perfect for toddlers aged 2-5.",
    price: 699,
    originalPrice: 999,
    category: "educational",
    images: ["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=600&fit=crop"],
    rating: 4.5,
    reviews: 278,
    inStock: true,
  },
  {
    id: "7",
    name: "Plush Unicorn",
    description: "Magical rainbow unicorn soft toy. Ultra-soft and perfect for cuddling.",
    price: 799,
    originalPrice: 1199,
    category: "soft-toys",
    images: ["https://images.unsplash.com/photo-1559715541-5daf8a0296d0?w=600&h=600&fit=crop"],
    rating: 4.8,
    reviews: 198,
    inStock: true,
    badge: "New",
  },
  {
    id: "8",
    name: "RC Racing Drone",
    description: "Beginner-friendly racing drone with HD camera. Easy controls and stable flight.",
    price: 4999,
    originalPrice: 6999,
    category: "rc-toys",
    images: ["https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=600&h=600&fit=crop"],
    rating: 4.4,
    reviews: 67,
    inStock: false,
  },
];

export const testimonials = [
  { name: "Priya Sharma", text: "My daughter loved the teddy bear! Amazing quality and fast delivery. Siya Collection is now our go-to toy store.", rating: 5 },
  { name: "Rahul Patel", text: "The RC monster truck was a hit at my son's birthday party. Great value for money!", rating: 5 },
  { name: "Anita Desai", text: "Beautiful collection of anime figures. Authentic quality. Highly recommend for collectors!", rating: 4 },
  { name: "Vikram Singh", text: "Ordered the building blocks set for my nephew. He's been playing with it non-stop. Excellent educational toy.", rating: 5 },
];
