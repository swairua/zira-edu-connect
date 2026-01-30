import { Smartphone, Building2, Shield, Zap, RefreshCw, Lock } from "lucide-react";

const integrations = [
  {
    name: "M-Pesa",
    description: "Direct integration with Safaricom M-Pesa for instant fee payments",
    icon: Smartphone,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    name: "KCB Bank",
    description: "Bank transfer integration for bulk payments",
    icon: Building2,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    name: "Equity Bank",
    description: "Seamless connection to Equity banking services",
    icon: Building2,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    name: "Co-operative Bank",
    description: "Integrated payments via Co-op banking",
    icon: Building2,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
];

const features = [
  {
    icon: Zap,
    title: "Instant Reconciliation",
    description: "Payments auto-reconcile within seconds",
  },
  {
    icon: RefreshCw,
    title: "Real-time Updates",
    description: "Fee balances update immediately after payment",
  },
  {
    icon: Shield,
    title: "Secure Transactions",
    description: "Bank-level encryption for all transactions",
  },
  {
    icon: Lock,
    title: "PCI Compliant",
    description: "Meets all security standards",
  },
];

export const IntegrationsSection = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-landing-blue via-landing-blue/95 to-primary text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-landing-coral/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4">
            <span className="text-sm font-medium">Payment Integrations</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Seamless Payment Collection
          </h2>
          <p className="text-lg text-white/80">
            Connect with Kenya's leading payment providers for hassle-free fee collection
          </p>
        </div>

        {/* Integrations Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-colors"
            >
              <div className={`w-14 h-14 ${integration.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                <integration.icon className={`w-7 h-7 ${integration.color}`} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{integration.name}</h3>
              <p className="text-sm text-white/70">{integration.description}</p>
            </div>
          ))}
        </div>

        {/* Features Row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-landing-coral/20 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5 text-landing-coral" />
              </div>
              <div>
                <h4 className="font-medium mb-1">{feature.title}</h4>
                <p className="text-sm text-white/70">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 lg:gap-16">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-landing-coral">99.9%</div>
              <div className="text-xs sm:text-sm text-white/70 mt-1">Uptime</div>
            </div>
            <div className="w-16 h-px sm:w-px sm:h-12 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-landing-gold">&lt;5s</div>
              <div className="text-xs sm:text-sm text-white/70 mt-1">Payment Processing</div>
            </div>
            <div className="w-16 h-px sm:w-px sm:h-12 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">1M+</div>
              <div className="text-xs sm:text-sm text-white/70 mt-1">Transactions/Month</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
