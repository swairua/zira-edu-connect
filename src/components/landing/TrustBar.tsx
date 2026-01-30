import { Building2 } from "lucide-react";

export const TrustBar = () => {
  const schoolTypes = [
    "Primary Schools",
    "Secondary Schools",
    "International Schools",
    "Private Academies",
    "TVET Institutions",
    "Boarding Schools",
    "Day Schools",
    "Mixed Schools",
    "Girls Schools",
    "Boys Schools",
  ];

  return (
    <section className="py-12 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-muted-foreground mb-8">
          TRUSTED BY LEADING SCHOOLS ACROSS KENYA & EAST AFRICA
        </p>
        
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll gap-8 sm:gap-12">
            {[...schoolTypes, ...schoolTypes].map((type, index) => (
              <div 
                key={`${type}-${index}`}
                className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-background rounded-lg border border-border/50 whitespace-nowrap"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-landing-blue/10 flex items-center justify-center">
                  <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-landing-blue" />
                </div>
                <span className="font-medium text-muted-foreground text-sm sm:text-base">{type}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 mt-10">
          <div className="text-center px-2">
            <div className="text-2xl sm:text-3xl font-bold text-landing-blue">1,000+</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Schools</div>
          </div>
          <div className="w-px h-10 sm:h-12 bg-border hidden sm:block" />
          <div className="text-center px-2">
            <div className="text-2xl sm:text-3xl font-bold text-landing-coral">500,000+</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Students</div>
          </div>
          <div className="w-px h-10 sm:h-12 bg-border hidden sm:block" />
          <div className="text-center px-2">
            <div className="text-2xl sm:text-3xl font-bold text-primary">KES 10B+</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Fees Collected</div>
          </div>
        </div>
      </div>
    </section>
  );
};
