import { ExternalLink } from "lucide-react";
import { PLATFORMS } from "@/lib/company-data";
import { Button } from "@/components/ui/button";

export const PlatformShowcase = () => {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our <span className="text-[#F97316]">Platform Suite</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Six powerful platforms powering thousands of businesses across Africa
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {PLATFORMS.map((platform, index) => {
            const Icon = platform.icon;
            return (
              <div 
                key={index}
                className="group relative bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Gradient header */}
                <div className={`h-2 bg-gradient-to-r ${platform.gradient}`} />
                
                <div className="p-6">
                  {/* Icon and title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.gradient} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground group-hover:text-[#F97316] transition-colors">
                        {platform.name}
                      </h3>
                      {platform.url && (
                        <a 
                          href={`https://${platform.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:text-[#F97316] flex items-center gap-1"
                        >
                          {platform.url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {platform.description}
                  </p>

                  {/* Stats badge */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${platform.gradient} text-white`}>
                      {platform.stats}
                    </span>
                    
                    {platform.url && (
                      <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-[#F97316]">
                        <a href={`https://${platform.url}`} target="_blank" rel="noopener noreferrer">
                          Learn More
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
