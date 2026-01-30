import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    quote: "Zira EduSuite transformed how we manage our school. Fee collection via M-Pesa increased our on-time payments by 40%. Parents love the real-time updates!",
    name: "Mary W.",
    role: "Principal",
    location: "Kenya",
    rating: 5,
  },
  {
    quote: "The parent portal has dramatically reduced our administrative burden. We spend less time on phone calls and more time on what matters - education.",
    name: "James O.",
    role: "Head Teacher",
    location: "Kenya",
    rating: 5,
  },
  {
    quote: "Implementation was smooth and the support team is excellent. Our teachers now mark attendance in seconds instead of minutes. Highly recommended!",
    name: "Grace M.",
    role: "School Administrator",
    location: "Kenya",
    rating: 5,
  },
  {
    quote: "The M-Pesa integration has been a game changer. We now receive 95% of fees on time. The automated reminders save us countless hours every month.",
    name: "Peter K.",
    role: "Finance Director",
    location: "Kenya",
    rating: 5,
  },
  {
    quote: "Training took just 2 days and now our entire staff uses it daily. The CBC curriculum support is exactly what we needed for the new education system.",
    name: "Sarah A.",
    role: "ICT Coordinator",
    location: "Kenya",
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-landing-gold/10 rounded-full mb-4">
            <span className="text-sm font-medium text-landing-gold">Testimonials</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Loved by Schools Across Kenya
          </h2>
          <p className="text-lg text-muted-foreground">
            Hear what educators and administrators are saying about Zira EduSuite
          </p>
        </div>

        {/* Main Testimonial */}
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-card rounded-3xl border border-border p-8 sm:p-12 shadow-xl relative overflow-hidden">
            {/* Quote Icon */}
            <div className="absolute top-8 right-8 w-16 h-16 rounded-full bg-landing-coral/10 flex items-center justify-center">
              <Quote className="w-8 h-8 text-landing-coral" />
            </div>

            {/* Stars */}
            <div className="flex gap-1 mb-6">
              {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-landing-gold text-landing-gold" />
              ))}
            </div>

            {/* Quote */}
            <blockquote className="text-xl sm:text-2xl text-foreground leading-relaxed mb-8">
              "{testimonials[currentIndex].quote}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-landing-blue to-primary flex items-center justify-center text-white font-bold text-lg">
                {testimonials[currentIndex].name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-foreground">
                  {testimonials[currentIndex].name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {testimonials[currentIndex].role}
                </div>
                <div className="text-xs text-muted-foreground">
                  {testimonials[currentIndex].location}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-8 border-t border-border">
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex 
                        ? "w-8 bg-landing-coral" 
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prev}
                  className="rounded-full"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={next}
                  className="rounded-full"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail previews */}
        <div className="hidden lg:flex justify-center gap-6 mt-8">
          {testimonials.map((testimonial, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                index === currentIndex 
                  ? "bg-card border-2 border-landing-coral shadow-lg" 
                  : "bg-card/50 border border-border hover:border-landing-coral/50"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-landing-blue to-primary flex items-center justify-center text-white font-bold text-sm">
                {testimonial.name.charAt(0)}
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-foreground">{testimonial.name}</div>
                <div className="text-xs text-muted-foreground">{testimonial.role}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
