import { Mail, Phone, MapPin, Globe, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPANY_INFO } from "@/lib/company-data";

export const ContactCTA = () => {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-[#1E3A5A] via-[#0F172A] to-[#1E3A5A] text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: CTA */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to <span className="text-[#F97316]">Transform</span> Your School?
              </h2>
              <p className="text-lg text-gray-300 mb-8">
                Join 1,000+ schools already using Zira EduSuite. Start your 14-day free trial today 
                and see why we're Kenya's most trusted school management platform.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-[#F97316] hover:bg-[#EA580C] text-white"
                  asChild
                >
                  <a href="https://ziraedx.com" target="_blank" rel="noopener noreferrer">
                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                  asChild
                >
                  <a href={`https://wa.me/${COMPANY_INFO.whatsapp.replace(/\+|\s/g, '')}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp Us
                  </a>
                </Button>
              </div>
            </div>

            {/* Right: Contact info */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-6">Contact Us</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#F97316]/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-[#F97316]" />
                  </div>
                  <div>
                    <div className="font-medium mb-1">Email</div>
                    <a href={`mailto:${COMPANY_INFO.email}`} className="text-gray-300 hover:text-[#F97316]">
                      {COMPANY_INFO.email}
                    </a>
                    <br />
                    <a href={`mailto:${COMPANY_INFO.supportEmail}`} className="text-gray-300 hover:text-[#F97316]">
                      {COMPANY_INFO.supportEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#F97316]/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-[#F97316]" />
                  </div>
                  <div>
                    <div className="font-medium mb-1">Phone / WhatsApp</div>
                    <a href={`tel:${COMPANY_INFO.phone}`} className="text-gray-300 hover:text-[#F97316]">
                      {COMPANY_INFO.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#F97316]/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-[#F97316]" />
                  </div>
                  <div>
                    <div className="font-medium mb-1">Office</div>
                    <span className="text-gray-300">{COMPANY_INFO.headquarters}</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#F97316]/20 flex items-center justify-center flex-shrink-0">
                    <Globe className="h-5 w-5 text-[#F97316]" />
                  </div>
                  <div>
                    <div className="font-medium mb-1">Websites</div>
                    <div className="flex flex-wrap gap-2">
                      <a 
                        href={`https://${COMPANY_INFO.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-[#F97316]"
                      >
                        {COMPANY_INFO.website}
                      </a>
                      <span className="text-gray-500">•</span>
                      <a 
                        href="https://ziraedx.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-[#F97316]"
                      >
                        ziraedx.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-white/10 text-center">
            <img 
              src="/zira-logo-white.png" 
              alt="Zira Technologies" 
              className="h-12 mx-auto mb-4"
            />
            <p className="text-gray-400">
              © {new Date().getFullYear()} {COMPANY_INFO.name}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
