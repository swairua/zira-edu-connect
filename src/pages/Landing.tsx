import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustBar } from "@/components/landing/TrustBar";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { PortalsShowcase } from "@/components/landing/PortalsShowcase";
import { IntegrationsSection } from "@/components/landing/IntegrationsSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PricingPreview } from "@/components/landing/PricingPreview";
import { FAQSection, faqData } from "@/components/landing/FAQSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SEOHead } from "@/components/seo/SEOHead";
import { StructuredData, getOrganizationSchema, getSoftwareApplicationSchema, getFAQSchema, getWebSiteSchema } from "@/components/seo/StructuredData";

const Landing = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const scrollTo = searchParams.get('scrollTo');
    if (scrollTo) {
      setTimeout(() => {
        const element = document.getElementById(scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [searchParams]);
  // Combine all structured data schemas
  const structuredData = [
    getOrganizationSchema(),
    getSoftwareApplicationSchema(),
    getFAQSchema(faqData),
    getWebSiteSchema()
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Components */}
      <SEOHead 
        title="Zira EduSuite | Best School Management Software in Kenya | M-Pesa Integration"
        description="Complete school management system trusted by 1,000+ schools in Kenya. Automate fee collection with M-Pesa, track academics, manage staff, and keep parents informed. Start your free trial today."
        canonicalUrl="https://zira-edusuite.lovable.app/"
      />
      <StructuredData data={structuredData} />
      
      <LandingNavbar />
      <HeroSection />
      <TrustBar />
      <FeaturesGrid />
      <BenefitsSection />
      <PortalsShowcase />
      <IntegrationsSection />
      <TestimonialsSection />
      <PricingPreview />
      <FAQSection />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
};

export default Landing;
