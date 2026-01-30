import { Target, Eye, MapPin } from "lucide-react";
import { COMPANY_INFO, COMPANY_IMAGES } from "@/lib/company-data";

export const AboutSection = () => {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            About <span className="text-[#F97316]">Zira Technologies</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            A Kenyan technology company building digital infrastructure for Africa's business revolution
          </p>
        </div>

        {/* Two column layout with image and cards in one row */}
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
          {/* Image */}
          <div className="relative order-2 lg:order-1">
            <img 
              src={COMPANY_IMAGES.schoolBuilding}
              alt="African school compound with building blocks and grounds"
              className="rounded-2xl shadow-xl w-full h-auto object-cover aspect-[4/3] border border-border"
              loading="lazy"
            />
            <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-[#F97316] text-white p-4 md:p-5 rounded-xl shadow-lg">
              <span className="text-2xl md:text-3xl font-bold block">1,000+</span>
              <span className="text-sm">Schools Trust Us</span>
            </div>
          </div>

          {/* Mission, Vision, Headquarters cards in one row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 order-1 lg:order-2">
            {/* Mission */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 p-5 rounded-2xl border border-orange-200 dark:border-orange-800 h-full">
              <div className="flex flex-col h-full">
                <div className="w-10 h-10 bg-[#F97316] rounded-xl flex items-center justify-center flex-shrink-0 mb-3">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">Our Mission</h3>
                <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                  {COMPANY_INFO.mission}
                </p>
              </div>
            </div>

            {/* Vision */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 p-5 rounded-2xl border border-blue-200 dark:border-blue-800 h-full">
              <div className="flex flex-col h-full">
                <div className="w-10 h-10 bg-[#1E3A5A] rounded-xl flex items-center justify-center flex-shrink-0 mb-3">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">Our Vision</h3>
                <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                  {COMPANY_INFO.vision}
                </p>
              </div>
            </div>

            {/* Headquarters */}
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/20 dark:to-teal-900/20 p-5 rounded-2xl border border-teal-200 dark:border-teal-800 h-full">
              <div className="flex flex-col h-full">
                <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 mb-3">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">Headquarters</h3>
                <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                  {COMPANY_INFO.headquarters}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-foreground mb-8">Our Core Values</h3>
          <div className="flex flex-wrap justify-center gap-6">
            {COMPANY_INFO.values.map((value, index) => (
              <div 
                key={index} 
                className="bg-card px-6 py-4 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <h4 className="font-bold text-[#F97316] mb-1">{value.title}</h4>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
