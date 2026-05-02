import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import FeaturedProducts from "@/components/FeaturedProducts";
import OffersBar from "@/components/OffersBar";
import BestSellers from "@/components/BestSellers";
import HotWheels from "@/components/HotWheels";
import Majorette from "@/components/Majorette";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO url="/" />
      <Header />
      <main>
        <Hero />
        <Categories />
        <FeaturedProducts />
        <OffersBar />
        <BestSellers />
        <HotWheels />
        <Majorette />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
