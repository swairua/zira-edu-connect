import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, CheckCircle2, Phone, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const FinalCTA = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    school: "",
    phone: "",
    location: "",
    learnerCount: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("demo_requests")
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim(),
          school_name: formData.school.trim(),
          phone: formData.phone.trim(),
          location: formData.location.trim() || null,
          number_of_learners: formData.learnerCount || null,
        });

      if (error) throw error;
      
      // Send email notification (fire and forget - don't block on email errors)
      supabase.functions.invoke('send-demo-request-email', {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          school: formData.school.trim(),
          phone: formData.phone.trim(),
          location: formData.location.trim() || null,
          learnerCount: formData.learnerCount || null,
        }
      }).catch(err => console.error("Email notification failed:", err));
      
      toast.success("Thank you! We'll be in touch within 24 hours.");
      setFormData({ name: "", email: "", school: "", phone: "", location: "", learnerCount: "" });
    } catch (error) {
      console.error("Error submitting demo request:", error);
      toast.error("Something went wrong. Please try again or contact us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-gradient-to-br from-landing-blue via-landing-blue/95 to-primary text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-landing-coral/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-landing-gold/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Ready to Transform Your School?
              </h2>
            <p className="text-lg text-white/80">
                Join 1,000+ schools already using Zira EduSuite. Start your free trial today 
                or schedule a personalized demo.
              </p>
            </div>

            <div className="space-y-4">
              {[
                "14-day free trial, no credit card required",
                "Dedicated onboarding support",
                "Data migration assistance",
                "Training for your staff",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-landing-coral flex-shrink-0" />
                  <span className="text-white/90">{item}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-white/60">Call us</div>
                  <div className="font-medium">+254 757 878023</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-white/60">Email us</div>
                  <div className="font-medium">support@ziratech.com</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
              <div className="text-sm text-white/60">Visit us</div>
                  <div className="font-medium">Venus Complex, Northern Bypass, Nairobi, Kenya</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Get Started Today
            </h3>
            <p className="text-muted-foreground mb-6">
              Fill in your details and we'll reach out within 24 hours.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-12 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-12 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <Input
                  placeholder="School name"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  required
                  className="h-12 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <Input
                  type="tel"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="h-12 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <Input
                  placeholder="Location (City/County)"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="h-12 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <Select 
                  value={formData.learnerCount}
                  onValueChange={(value) => setFormData({ ...formData, learnerCount: value })}
                >
                  <SelectTrigger className="h-12 text-foreground">
                    <SelectValue placeholder="Number of learners" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-100">1 - 100 students</SelectItem>
                    <SelectItem value="101-300">101 - 300 students</SelectItem>
                    <SelectItem value="301-500">301 - 500 students</SelectItem>
                    <SelectItem value="501-1000">501 - 1,000 students</SelectItem>
                    <SelectItem value="1000+">1,000+ students</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full bg-landing-coral hover:bg-landing-coral/90 text-white shadow-lg shadow-landing-coral/25"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Request Demo"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-4">
              By submitting, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
