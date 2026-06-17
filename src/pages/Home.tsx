import { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Fleet from '../components/Fleet';
import FeaturedVehicles from '../components/FeaturedVehicles';
import WhyChooseUs from '../components/WhyChooseUs';
import AboutMysore from '../components/AboutMysore';
import Pricing from '../components/Pricing';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';
import InquiryModal from '../components/InquiryModal';
import BranchPopup from '../components/BranchPopup';

export default function Home() {
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [branchOpen, setBranchOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Fleet />
      <FeaturedVehicles />
      <WhyChooseUs />
      <AboutMysore />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Contact />
      <Footer onBranchClick={() => setBranchOpen(true)} />

      {/* Global overlays */}
      <WhatsAppFloat onInquiry={() => setInquiryOpen(true)} />
      <InquiryModal open={inquiryOpen} onClose={() => setInquiryOpen(false)} />
      <BranchPopup open={branchOpen} onClose={() => setBranchOpen(false)} />
    </div>
  );
}
