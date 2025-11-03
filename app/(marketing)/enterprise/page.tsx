import React from 'react'
import { AnimationContainer, MaxWidthWrapper } from "@/components";
import { Button } from "@/components/ui/button";
import { CheckCircle2Icon, ArrowRightIcon, PhoneIcon, MailIcon } from "lucide-react";
import Link from "next/link";

const EnterprisePage = () => {
    const plans = [
        {
            name: "Free",
            price: "$0",
            period: "forever",
            description: "Perfect for trying out AMD detection",
            features: [
                "100 calls per month",
                "Twilio Native AMD",
                "Basic call history",
                "Email support",
                "7-day data retention"
            ],
            cta: "Get Started",
            href: "/signup",
            highlighted: false
        },
        {
            name: "Pro",
            price: "$49",
            period: "/month",
            description: "For growing businesses and teams",
            features: [
                "5,000 calls per month",
                "All AMD strategies",
                "Advanced analytics",
                "Priority support",
                "30-day data retention",
                "API access",
                "Custom webhooks"
            ],
            cta: "Start Free Trial",
            href: "/signup",
            highlighted: true
        },
        {
            name: "Enterprise",
            price: "Custom",
            period: "",
            description: "For large-scale deployments",
            features: [
                "Unlimited calls",
                "All AMD strategies",
                "Advanced analytics & reporting",
                "24/7 dedicated support",
                "Unlimited data retention",
                "SLA guarantees",
                "Custom integrations",
                "On-premise deployment option"
            ],
            cta: "Contact Sales",
            href: "#contact",
            highlighted: false
        }
    ];

    return (
        <div className="flex flex-col items-center justify-center py-12 md:py-20">
            <MaxWidthWrapper className="max-w-7xl">
                <AnimationContainer delay={0.1}>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-center !leading-tight">
                        Choose the <span className="text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text">Right Plan</span> for You
                    </h1>
                    <p className="text-base md:text-lg mt-6 text-center text-muted-foreground max-w-2xl mx-auto">
                        Start free and scale as you grow. All plans include access to our powerful AMD detection system.
                    </p>
                </AnimationContainer>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                    {plans.map((plan, index) => (
                        <AnimationContainer key={plan.name} delay={0.1 * (index + 2)}>
                            <div className={`rounded-2xl p-8 h-full flex flex-col ${
                                plan.highlighted 
                                    ? 'border-2 border-violet-500 bg-gradient-to-b from-violet-500/10 to-fuchsia-500/10 relative' 
                                    : 'border border-white/10 bg-card/50 backdrop-blur-xl'
                            }`}>
                                {plan.highlighted && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <span className="px-4 py-1 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-medium">
                                            Most Popular
                                        </span>
                                    </div>
                                )}
                                
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold font-heading mb-2">{plan.name}</h3>
                                    <p className="text-muted-foreground text-sm">{plan.description}</p>
                                </div>

                                <div className="mb-8">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-bold">{plan.price}</span>
                                        {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8 flex-grow">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-start gap-3">
                                            <CheckCircle2Icon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button 
                                    asChild 
                                    className={`w-full ${plan.highlighted ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600' : ''}`}
                                    variant={plan.highlighted ? undefined : 'outline'}
                                >
                                    <Link href={plan.href} className="flex items-center justify-center">
                                        {plan.cta}
                                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        </AnimationContainer>
                    ))}
                </div>

                <AnimationContainer delay={0.5} className="mt-20">
                    <div id="contact" className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl p-12 text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
                            Need a Custom Solution?
                        </h2>
                        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                            Our enterprise team is ready to help you build a custom AMD solution tailored to your specific needs.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button asChild size="lg">
                                <Link href="mailto:sales@amdsystem.com" className="flex items-center">
                                    <MailIcon className="w-4 h-4 mr-2" />
                                    Email Sales
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link href="tel:+1234567890" className="flex items-center">
                                    <PhoneIcon className="w-4 h-4 mr-2" />
                                    Call Us
                                </Link>
                            </Button>
                        </div>
                    </div>
                </AnimationContainer>
            </MaxWidthWrapper>
        </div>
    )
};

export default EnterprisePage
