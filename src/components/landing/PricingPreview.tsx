import { useState } from "react";
import { Check, Star, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTiersPricing, formatTierRange } from "@/hooks/usePricingTiersConfig";
import { OwnershipType } from "@/hooks/usePricingFormula";
import { KEY_FEATURES_LIST } from "@/lib/company-data";

export const PricingPreview = () => {
  const [ownershipType, setOwnershipType] = useState<OwnershipType>('public');
  const { data: tiersPricing, isLoading } = useTiersPricing();

  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-landing-blue/10 rounded-full mb-4">
            <span className="text-sm font-medium text-landing-blue">Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Affordable Annual Subscriptions
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Low annual fees with optional Year 1 onboarding. Start with a 14-day free trial.
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
                      ? "border-landing-coral shadow-lg shadow-landing-coral/10 ring-2 ring-landing-coral/20" 
                      : "border-border"
                  }`}
                >
                  {/* Popular Badge */}
                  {tier.is_popular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                      <Badge className="bg-landing-coral text-white text-[10px] px-1.5 py-0.5 flex items-center gap-0.5">
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
                            <span className="text-xl font-bold text-primary">
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
                    <Link to="/auth">
                      <Button 
                        size="sm"
                        className={`w-full text-[10px] h-7 px-2 ${
                          tier.is_popular 
                            ? "bg-landing-coral hover:bg-landing-coral/90 text-white" 
                            : ""
                        }`}
                        variant={tier.is_popular ? "default" : "outline"}
                      >
                        Start Trial
                      </Button>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Feature List */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-center mb-4">All tiers include:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {KEY_FEATURES_LIST.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            Prices shown are annual subscription costs. First year includes one-time onboarding & training.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Need a custom solution?{" "}
            <a href="#contact" className="text-landing-blue hover:underline font-medium">
              Contact our sales team
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};
