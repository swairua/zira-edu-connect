import { useState, useEffect } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SCHOOL_TESTIMONIALS, COMPANY_IMAGES } from "@/lib/company-data";

export const SchoolTestimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SCHOOL_TESTIMONIALS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + SCHOOL_TESTIMONIALS.length) % SCHOOL_TESTIMONIALS.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % SCHOOL_TESTIMONIALS.length);
  };

  const currentTestimonial = SCHOOL_TESTIMONIALS[currentIndex];

  return (
    <section className="py-16 md:py-20 relative overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img 
          src={COMPANY_IMAGES.teacherClassroom}
          alt="Teacher with students"
          className="w-full h-full object-cover opacity-10"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What <span className="text-[#F97316]">Educators Say</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Hear from school leaders who have transformed their institutions with Zira EduSuite
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Main testimonial card */}
          <div className="relative bg-card/80 backdrop-blur-sm rounded-3xl border border-border shadow-lg overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#F97316]/10 to-transparent rounded-full blur-3xl" />
            
            <div className="relative p-8 md:p-12">
              {/* Quote icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-2xl flex items-center justify-center mb-6">
                <Quote className="h-8 w-8 text-white" />
              </div>

              {/* Quote text */}
              <blockquote className="text-xl md:text-2xl text-foreground leading-relaxed mb-8 font-medium">
                "{currentTestimonial.quote}"
              </blockquote>

              {/* Author info */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="font-bold text-lg text-foreground">{currentTestimonial.name}</div>
                  <div className="text-muted-foreground">{currentTestimonial.role}</div>
                </div>
                <div className="bg-[#F97316]/10 text-[#F97316] px-4 py-2 rounded-full text-sm font-medium">
                  {currentTestimonial.highlight}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              className="rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Dots */}
            <div className="flex gap-2">
              {SCHOOL_TESTIMONIALS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrentIndex(index);
                  }}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'bg-[#F97316] w-8' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
