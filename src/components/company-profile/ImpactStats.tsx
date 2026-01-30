import { useEffect, useState, useRef } from "react";
import { IMPACT_STATS, COMPANY_IMAGES } from "@/lib/company-data";

export const ImpactStats = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const gradientColors = [
    "from-orange-500 to-orange-600",
    "from-blue-500 to-blue-600",
    "from-green-500 to-green-600",
    "from-purple-500 to-purple-600",
  ];

  return (
    <section ref={sectionRef} className="py-16 md:py-20 relative overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img 
          src={COMPANY_IMAGES.studentsLearning}
          alt="African students learning in school environment"
          className="w-full h-full object-cover opacity-[0.08]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-background/92" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Track Record & <span className="text-[#F97316]">Impact</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Numbers that speak to our commitment to African business transformation
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {IMPACT_STATS.map((stat, index) => (
            <div 
              key={index}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradientColors[index]} p-8 text-white text-center transform transition-all duration-700 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Decorative circle */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
              <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full" />
              
              <div className="relative z-10">
                <div className={`text-4xl md:text-5xl font-bold mb-2 transition-all duration-1000 ${
                  isVisible ? 'scale-100' : 'scale-50'
                }`}>
                  {stat.value}
                </div>
                <div className="text-xl font-semibold mb-1">{stat.label}</div>
                <div className="text-sm text-white/80">{stat.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
