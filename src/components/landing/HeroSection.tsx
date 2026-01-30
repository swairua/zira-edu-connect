import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Play, CheckCircle2, Users, CreditCard, BookOpen } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-landing-blue via-landing-blue/90 to-primary" />
      
      {/* Decorative Blobs */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-landing-coral/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-landing-gold/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/30 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="text-white space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <span className="w-2 h-2 bg-landing-coral rounded-full animate-pulse" />
              <span className="text-sm font-medium">Trusted by 1,000+ Schools in Kenya</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              The Complete{" "}
              <span className="text-landing-coral">School Management</span>{" "}
              Solution
            </h1>

            <p className="text-lg sm:text-xl text-white/80 max-w-xl">
              Streamline admissions, automate fee collection with M-Pesa, track academics, 
              and keep parents informed — all in one powerful platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="bg-landing-coral hover:bg-landing-coral/90 text-white shadow-xl shadow-landing-coral/30 font-semibold text-lg px-8"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 font-semibold text-lg px-8"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 pt-4">
              {[
                "No credit card required",
                "14-day free trial",
                "Cancel anytime",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-white/80">
                  <CheckCircle2 className="w-5 h-5 text-landing-coral" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Dashboard Preview */}
          <div className="relative hidden lg:block animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {/* Main Dashboard Card */}
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              
              {/* Mock Dashboard Content */}
              <div className="space-y-4">
                <div className="h-8 bg-gradient-to-r from-landing-blue/10 to-primary/10 rounded-lg" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-landing-blue/10 rounded-lg p-4 text-center">
                    <Users className="w-6 h-6 mx-auto text-landing-blue mb-2" />
                    <div className="text-2xl font-bold text-landing-blue">1,234</div>
                    <div className="text-xs text-muted-foreground">Students</div>
                  </div>
                  <div className="bg-landing-coral/10 rounded-lg p-4 text-center">
                    <CreditCard className="w-6 h-6 mx-auto text-landing-coral mb-2" />
                    <div className="text-2xl font-bold text-landing-coral">98%</div>
                    <div className="text-xs text-muted-foreground">Fee Collection</div>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <BookOpen className="w-6 h-6 mx-auto text-primary mb-2" />
                    <div className="text-2xl font-bold text-primary">45</div>
                    <div className="text-xs text-muted-foreground">Classes</div>
                  </div>
                </div>
                <div className="h-32 bg-gradient-to-br from-muted/50 to-muted rounded-lg" />
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -top-4 -left-8 bg-white rounded-xl shadow-xl p-4 animate-bounce" style={{ animationDuration: "3s" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Payment Received</div>
                  <div className="text-xs text-muted-foreground">KES 15,000 via M-Pesa</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-xl p-4 animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-landing-blue/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-landing-blue" />
                </div>
                <div>
                  <div className="text-sm font-semibold">New Enrollment</div>
                  <div className="text-xs text-muted-foreground">Grade 5 admission approved</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};
