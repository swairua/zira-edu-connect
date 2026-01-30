import { useState } from "react";
import { Check, ArrowRight, Star, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTiersPricing, formatTierRange } from "@/hooks/usePricingTiersConfig";
import { OwnershipType } from "@/hooks/usePricingFormula";
import { KEY_FEATURES_LIST } from "@/lib/company-data";

export const PricingOverview = () => {
  const [ownershipType, setOwnershipType] = useState<OwnershipType>('public');
  const { data: tiersPricing, isLoading } = useTiersPricing();

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            EduSuite <span className="text-[#F97316]">Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Transparent pricing for all schools. Choose the tier that fits your institution.
          </p>
          
          {/* Public/Private Toggle */}
          <div className="flex justify-center">
            <Tabs value={ownershipType} onValueChange={(v) => setOwnershipType(v as OwnershipType)}>
              <TabsList className="grid w-[300px] grid-cols-2">
                <TabsTrigger value="public">Public Schools</TabsTrigger>
                <TabsTrigger value="private">Private Schools</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {ownershipType === 'private' && (
            <p className="text-sm text-muted-foreground mt-2">
              Private schools include enhanced support and premium features
            </p>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-card rounded-xl border border-border p-3">
                  <Skeleton className="h-4 w-14 mx-auto mb-2" />
                  <Skeleton className="h-3 w-16 mx-auto mb-3" />
                  <Skeleton className="h-6 w-20 mx-auto mb-2" />
                  <Skeleton className="h-3 w-14 mx-auto mb-3" />
                  <Skeleton className="h-7 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {tiersPricing?.map((tierPricing) => {
                const { tier, isCustom } = tierPricing;
                const year1Price = ownershipType === 'public' ? tierPricing.publicYear1 : tierPricing.privateYear1;
                const renewalPrice = ownershipType === 'public' ? tierPricing.publicRenewal : tierPricing.privateRenewal;

                return (
                  <div
                    key={tier.id}
                    className={`relative bg-card rounded-xl border p-3 flex flex-col text-center ${
                      tier.is_popular 
                        ? "border-[#F97316] shadow-lg shadow-[#F97316]/10 ring-2 ring-[#F97316]/20" 
                        : "border-border"
                    }`}
                  >
                    {/* Popular Badge */}
                    {tier.is_popular && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                        <Badge className="bg-[#F97316] text-white text-[10px] px-1.5 py-0.5 flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-white" />
                          Popular
                        </Badge>
                      </div>
                    )}

                    {/* Tier Name */}
                    <h3 className="text-sm font-semibold text-foreground mt-1">{tier.name}</h3>
                    
                    {/* Student Range */}
                    <p className="text-[10px] text-muted-foreground mb-3">
                      {formatTierRange(tier)}
                    </p>

                    {/* Pricing */}
                    <div className="mb-3 flex-grow">
                      {isCustom ? (
                        <div className="space-y-0.5">
                          <p className="text-base font-bold text-foreground">Custom</p>
                          <p className="text-[10px] text-muted-foreground">Contact Sales</p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {/* Primary: Annual subscription (renewal) price */}
                          <div>
                            <div className="flex items-baseline justify-center gap-0.5">
                              <span className="text-[10px] text-muted-foreground">KES</span>
                              <span className="text-xl font-bold text-[#F97316]">
                                {(renewalPrice / 1000).toFixed(0)}K
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">/year</p>
                          </div>
                          {/* Secondary: One-time onboarding (discrete) */}
                          <div className="text-[10px] text-muted-foreground border-t border-border/50 pt-1.5 mt-1">
                            <span className="text-foreground/70">+{((year1Price - renewalPrice) / 1000).toFixed(0)}K</span>
                            <span className="block text-[9px]">first year setup</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    {isCustom ? (
                      <a href="#contact">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full text-[10px] h-7 px-2"
                        >
                          <Phone className="w-2.5 h-2.5 mr-1" />
                          Contact
                        </Button>
                      </a>
                    ) : (
                      <Button 
                        size="sm"
                        className={`w-full text-[10px] h-7 px-2 ${
                          tier.is_popular 
                            ? "bg-[#F97316] hover:bg-[#EA580C] text-white" 
                            : ""
                        }`}
                        variant={tier.is_popular ? "default" : "outline"}
                        asChild
                      >
                        <a href="https://ziraedx.com" target="_blank" rel="noopener noreferrer">
                          Start Trial
                        </a>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Notes */}
          <div className="mt-8 bg-muted/50 rounded-xl p-6">
            <h4 className="font-semibold text-foreground mb-4">Included with every plan:</h4>
            <div className="grid sm:grid-cols-3 gap-3">
              {KEY_FEATURES_LIST.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-muted-foreground">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              First-year setup fees apply. Contact us for custom enterprise solutions.
            </p>
            <Button 
              size="lg" 
              className="bg-[#F97316] hover:bg-[#EA580C] text-white"
              asChild
            >
              <a href="https://ziraedx.com" target="_blank" rel="noopener noreferrer">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
