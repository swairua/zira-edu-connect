import { X, Check, ArrowRight } from "lucide-react";

const oldWay = [
  "Manual record keeping in paper files",
  "Lost or delayed fee payments",
  "Parents have no visibility",
  "Time-consuming report generation",
  "Communication gaps with stakeholders",
  "Scattered data across systems",
];

const newWay = [
  "Digital records accessible anywhere",
  "Automated M-Pesa fee collection",
  "Real-time parent portal access",
  "One-click automated reports",
  "Instant SMS & in-app notifications",
  "Unified platform for everything",
];

export const BenefitsSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <span className="text-sm font-medium text-primary">The Transformation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            From Chaos to Clarity
          </h2>
          <p className="text-lg text-muted-foreground">
            See how schools transform their operations with Zira EduSuite
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* The Old Way */}
          <div className="relative bg-card rounded-2xl border border-destructive/20 p-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-full blur-2xl" />
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <X className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold text-muted-foreground">The Old Way</h3>
            </div>

            <ul className="space-y-4">
              {oldWay.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-destructive" />
                  </div>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>

            {/* Strikethrough overlay effect */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-3/4 h-0.5 bg-destructive/20 rotate-12" />
            </div>
          </div>

          {/* Arrow in middle (desktop) */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-landing-coral to-primary flex items-center justify-center shadow-xl">
              <ArrowRight className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* The New Way */}
          <div className="relative bg-gradient-to-br from-landing-blue/5 to-primary/5 rounded-2xl border border-primary/20 p-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-primary">With Zira EduSuite</h3>
            </div>

            <ul className="space-y-4">
              {newWay.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{item}</span>
                </li>
              ))}
            </ul>

            {/* Glow effect */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-landing-coral/20 rounded-full blur-2xl" />
          </div>
        </div>

        {/* Mobile Arrow */}
        <div className="flex lg:hidden justify-center my-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-landing-coral to-primary flex items-center justify-center shadow-lg rotate-90">
            <ArrowRight className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </section>
  );
};
