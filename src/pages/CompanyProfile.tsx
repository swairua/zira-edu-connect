import { useState } from "react";
import { ProfileHero } from "@/components/company-profile/ProfileHero";
import { AboutSection } from "@/components/company-profile/AboutSection";
import { PlatformShowcase } from "@/components/company-profile/PlatformShowcase";
import { EduSuiteFeatures } from "@/components/company-profile/EduSuiteFeatures";
import { ImpactStats } from "@/components/company-profile/ImpactStats";
import { SchoolTestimonials } from "@/components/company-profile/SchoolTestimonials";
import { PricingOverview } from "@/components/company-profile/PricingOverview";
import { WhyChooseZira } from "@/components/company-profile/WhyChooseZira";
import { ContactCTA } from "@/components/company-profile/ContactCTA";
import { generateCompanyProfilePDF } from "@/lib/pdf/company-profile-pdf";
import { SEOHead } from "@/components/seo/SEOHead";
import { StructuredData, getOrganizationSchema } from "@/components/seo/StructuredData";
import { toast } from "sonner";

const CompanyProfile = () => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    toast.info("Generating PDF with images...", { duration: 3000 });
    
    try {
      await generateCompanyProfilePDF();
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" data-page="company-profile">
      <SEOHead 
        title="Zira Technologies - Company Profile | Leading African EdTech Company"
        description="Zira Technologies is a Kenyan technology company powering African digital transformation. Explore our platforms: EduSuite, Homes, Lock, SMS, Social, and Shop."
        canonicalUrl="https://zira-edusuite.lovable.app/company-profile"
      />
      <StructuredData data={getOrganizationSchema()} />
      
      <ProfileHero onDownloadPDF={handleDownloadPDF} isGeneratingPDF={isGeneratingPDF} />
      <AboutSection />
      <PlatformShowcase />
      <EduSuiteFeatures />
      <ImpactStats />
      <SchoolTestimonials />
      <PricingOverview />
      <WhyChooseZira />
      <ContactCTA />
    </div>
  );
};

export default CompanyProfile;
