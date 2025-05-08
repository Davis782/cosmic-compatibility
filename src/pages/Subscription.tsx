
import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type SubscriptionFeature = {
  name: string;
  included: boolean;
};

type SubscriptionTier = {
  id: string;
  name: string;
  description: string;
  price: number;
  features: SubscriptionFeature[];
  popular?: boolean;
  buttonText: string;
};

const subscriptionTiers: SubscriptionTier[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Essential features for getting started",
    price: 0,
    buttonText: "Current Plan",
    features: [
      { name: "Limited matches per day", included: true },
      { name: "Basic profile creation", included: true },
      { name: "View zodiac compatibility", included: true },
      { name: "Access to public events", included: true },
      { name: "Advanced filters", included: false },
      { name: "Unlimited messaging", included: false },
      { name: "Detailed compatibility analysis", included: false },
      { name: "Background checks", included: false },
      { name: "Priority support", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description: "Everything you need for serious dating",
    price: 25,
    popular: true,
    buttonText: "Subscribe",
    features: [
      { name: "Unlimited matches", included: true },
      { name: "Advanced profile creation", included: true },
      { name: "Detailed zodiac compatibility", included: true },
      { name: "Priority event registration", included: true },
      { name: "Advanced filters", included: true },
      { name: "Unlimited messaging", included: true },
      { name: "Detailed compatibility analysis", included: true },
      { name: "Background checks", included: false },
      { name: "Priority support", included: false },
    ],
  },
  {
    id: "elite",
    name: "Elite",
    description: "The ultimate dating experience",
    price: 50,
    buttonText: "Subscribe",
    features: [
      { name: "Unlimited matches", included: true },
      { name: "Premium profile creation", included: true },
      { name: "Advanced zodiac compatibility", included: true },
      { name: "VIP event access", included: true },
      { name: "Advanced filters", included: true },
      { name: "Unlimited messaging", included: true },
      { name: "Detailed compatibility analysis", included: true },
      { name: "Background checks", included: true },
      { name: "Priority support", included: true },
    ],
  },
];

const Subscription = () => {
  const { toast } = useToast();
  const { subscriptionTier: currentTier } = useAuth();
  
  const handleSubscribe = (tier: string) => {
    // In a real app, this would connect to a payment processor
    toast({
      title: "Coming Soon",
      description: `Subscription functionality will be implemented soon!`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Choose Your Plan</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Unlock advanced features and find your perfect match with our premium subscription plans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {subscriptionTiers.map((tier) => (
            <Card 
              key={tier.id} 
              className={`flex flex-col ${
                tier.popular 
                  ? "border-primary shadow-lg ring-2 ring-primary" 
                  : ""
              }`}
            >
              {tier.popular && (
                <span className="bg-primary text-white text-xs font-bold uppercase py-1 px-2 rounded-t-lg mx-auto">
                  Most Popular
                </span>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${tier.price}</span>
                  <span className="text-gray-400">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li 
                      key={index} 
                      className={`flex items-center ${
                        !feature.included ? "text-gray-400" : ""
                      }`}
                    >
                      <span className={`mr-2 ${feature.included ? "text-primary" : ""}`}>
                        {feature.included ? (
                          <CheckIcon className="h-5 w-5" />
                        ) : (
                          <span className="block h-5 w-5 border border-gray-400 rounded-full"></span>
                        )}
                      </span>
                      {feature.name}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full ${tier.id === currentTier ? "bg-gray-300 hover:bg-gray-300 cursor-default" : ""}`}
                  variant={tier.id === currentTier ? "secondary" : "default"}
                  disabled={tier.id === currentTier}
                  onClick={() => handleSubscribe(tier.id)}
                >
                  {tier.id === currentTier ? "Current Plan" : tier.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4">Subscription FAQ</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">How do I cancel my subscription?</h3>
              <p className="text-gray-600">
                You can cancel your subscription at any time from your account settings. 
                Your features will remain active until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Can I switch between plans?</h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately, 
                while downgrades will apply at the end of your current billing cycle.
              </p>
            </div>
            <div>
              <h3 className="font-medium">How do background checks work?</h3>
              <p className="text-gray-600">
                Background checks are conducted through a trusted third-party provider 
                and verify identity and safety information. Elite subscribers receive 
                priority processing for background checks.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Subscription;
