import { CheckCircle, CreditCard, Shield, Server, Sparkles } from "lucide-react";
import { EDUSUITE_FEATURES, EDUSUITE_PORTALS, PAYMENT_INTEGRATIONS, COMPANY_IMAGES, EDUSUITE_MODULES } from "@/lib/company-data";

export const EduSuiteFeatures = () => {
  // Get Assessment category modules to highlight
  const assessmentModules = EDUSUITE_MODULES.filter(m => m.category === "Assessment");
  
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-[#1E3A5A] to-[#0F172A] text-white">
      <div className="container mx-auto px-4">
        {/* Header with image */}
        <div className="grid lg:grid-cols-2 gap-8 items-center mb-12">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[#F97316] px-4 py-2 rounded-full text-sm font-medium mb-4">
              <span>🎓</span>
              <span>Flagship Product</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Zira <span className="text-[#F97316]">EduSuite</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-xl">
              Complete school management system trusted by 1,000+ schools across Kenya
            </p>
          </div>
          <div className="relative">
            <img 
              src={COMPANY_IMAGES.studentsTechnology}
              alt="Students using technology in classroom"
              className="rounded-2xl shadow-xl w-full h-auto object-cover aspect-video"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A5A]/50 to-transparent rounded-2xl" />
          </div>
        </div>

        {/* NEW: Assessment & Curriculum Section - Highlighted */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="px-3 py-1 bg-[#F97316] rounded-full text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              New AI-Powered Features
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {assessmentModules.map((module, index) => {
              const Icon = module.icon;
              const isAI = 'isAI' in module && module.isAI;
              return (
                <div 
                  key={index}
                  className="bg-white/10 backdrop-blur-sm border border-[#F97316]/30 rounded-xl p-4 hover:bg-white/15 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F97316]/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-[#F97316]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-white">{module.title}</h4>
                        {isAI && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#F97316] text-white text-[10px] font-medium rounded">
                            <Sparkles className="w-2.5 h-2.5" />
                            AI
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{module.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-16">
          {EDUSUITE_FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            const isNew = 'isNew' in feature && feature.isNew;
            const isAI = 'isAI' in feature && feature.isAI;
            return (
              <div 
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F97316]/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-[#F97316]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-white">{feature.title}</h4>
                      {isNew && (
                        <span className="px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-medium rounded">
                          New
                        </span>
                      )}
                      {isAI && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#F97316] text-white text-[10px] font-medium rounded">
                          <Sparkles className="w-2 h-2" />
                          AI
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{feature.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Portals */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">Four Dedicated Portals</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {EDUSUITE_PORTALS.map((portal, index) => (
              <div 
                key={index}
                className={`rounded-xl p-6 text-center border-2 ${
                  portal.color === 'orange' ? 'border-orange-500 bg-orange-500/10' :
                  portal.color === 'blue' ? 'border-blue-500 bg-blue-500/10' :
                  portal.color === 'green' ? 'border-green-500 bg-green-500/10' :
                  'border-purple-500 bg-purple-500/10'
                }`}
              >
                <h4 className="font-bold text-lg mb-2">{portal.name}</h4>
                <p className="text-sm text-gray-300">{portal.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Integrations & Security */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Payment Integrations */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="h-8 w-8 text-[#F97316]" />
              <h3 className="text-xl font-bold">Payment Integrations</h3>
            </div>
            <div className="space-y-4">
              {PAYMENT_INTEGRATIONS.map((integration, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <div>
                    <span className="font-medium">{integration.name}</span>
                    <span className="text-gray-400 text-sm"> - {integration.description}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-400 italic mt-4 pt-4 border-t border-white/10">
              We also integrate with most major Kenyan banks upon request.
            </p>
          </div>

          {/* Security */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-8 w-8 text-[#F97316]" />
              <h3 className="text-xl font-bold">Security & Compliance</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span>Bank-level encryption (256-bit SSL)</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span>PCI DSS compliant payment processing</span>
              </div>
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span>99.9% platform uptime guarantee</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span>Automated daily backups</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
