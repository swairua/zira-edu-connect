import { Download, Mail, Phone, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPANY_INFO } from "@/lib/company-data";

interface ProfileHeroProps {
  onDownloadPDF: () => void;
  isGeneratingPDF?: boolean;
}

export const ProfileHero = ({ onDownloadPDF, isGeneratingPDF }: ProfileHeroProps) => {
  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-gradient-to-br from-[#F97316] via-[#EA580C] to-[#1E3A5A]">
      {/* Pattern overlay for depth */}
      <div 
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Radial glow effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-300 rounded-full blur-[150px]" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10 pt-24 pb-24">
        {/* Download button - top right */}
        <div className="flex justify-end mb-8">
          <Button 
            onClick={onDownloadPDF}
            disabled={isGeneratingPDF}
            className="bg-white/95 text-[#1E3A5A] hover:bg-white shadow-xl backdrop-blur-sm border border-white/50"
            size="lg"
          >
            <Download className="mr-2 h-5 w-5" />
            {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
          </Button>
        </div>

        <div className="flex flex-col items-center text-center text-white">
          {/* Logo with glassmorphism backdrop */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full scale-150" />
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 p-8 md:p-10 rounded-3xl shadow-2xl">
              <img 
                src="/zira-logo-white.png" 
                alt="Zira Technologies Logo" 
                className="h-28 md:h-40 drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]"
              />
            </div>
          </div>
          
          {/* Company name with enhanced typography */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-4 drop-shadow-lg">
            {COMPANY_INFO.name.toUpperCase()}
          </h1>
          
          {/* Decorative line */}
          <div className="w-24 h-1 bg-white/60 rounded-full mb-6" />
          
          {/* Tagline */}
          <p className="text-xl md:text-2xl lg:text-3xl font-medium text-orange-100 mb-6 max-w-3xl drop-shadow-md">
            {COMPANY_INFO.tagline}
          </p>
          
          {/* Mission statement */}
          <p className="text-base md:text-lg text-white/85 max-w-3xl mb-10 leading-relaxed">
            {COMPANY_INFO.mission}
          </p>
          
          {/* Contact bar with enhanced styling */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <a 
              href={`https://${COMPANY_INFO.website}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 px-5 py-3 rounded-full hover:bg-white/25 transition-all hover:scale-105 shadow-lg"
            >
              <Globe className="h-5 w-5" />
              <span className="font-medium">{COMPANY_INFO.website}</span>
            </a>
            <a 
              href={`mailto:${COMPANY_INFO.email}`}
              className="flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 px-5 py-3 rounded-full hover:bg-white/25 transition-all hover:scale-105 shadow-lg"
            >
              <Mail className="h-5 w-5" />
              <span className="font-medium">{COMPANY_INFO.email}</span>
            </a>
            <a 
              href={`tel:${COMPANY_INFO.phone}`}
              className="flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 px-5 py-3 rounded-full hover:bg-white/25 transition-all hover:scale-105 shadow-lg"
            >
              <Phone className="h-5 w-5" />
              <span className="font-medium">{COMPANY_INFO.phone}</span>
            </a>
          </div>
        </div>
      </div>
      
      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path 
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
};
