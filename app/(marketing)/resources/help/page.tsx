import { AnimationContainer, MaxWidthWrapper } from "@/components";
import { BookOpenIcon, MessageCircleIcon, PhoneIcon, MailIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from 'react'

const HelpPage = () => {
    const faqs = [
        {
            question: "What is AMD (Answering Machine Detection)?",
            answer: "AMD is technology that automatically detects whether a call is answered by a human or an answering machine/voicemail. This helps optimize calling campaigns by routing calls appropriately."
        },
        {
            question: "Which AMD strategy should I use?",
            answer: "It depends on your needs. Twilio Native is fastest (1-2s) but less accurate. HuggingFace ML offers the best balance (80-95% accuracy, 2-5s). Gemini AI provides most detailed analysis (3-6s). Media Streams enables real-time custom processing."
        },
        {
            question: "How accurate is the detection?",
            answer: "Accuracy varies by strategy: Twilio Native (70-90%), HuggingFace ML (80-95%), Media Streams and Gemini AI depend on implementation. No AMD system is 100% accurate due to the variability of answering machines and voicemail systems."
        },
        {
            question: "Can I use my own phone numbers?",
            answer: "Yes, you need to configure Twilio with your own phone numbers. The AMD System works with any Twilio-configured phone number."
        },
        {
            question: "What is the pricing?",
            answer: "Check our pricing page for details. Free tier includes 100 calls/month. Pro plan starts at $49/month for 5,000 calls. Enterprise plans available for unlimited usage."
        }
    ];

    return (
        <div className="flex flex-col items-center justify-center py-12 md:py-20">
            <MaxWidthWrapper className="max-w-5xl">
                <AnimationContainer delay={0.1} className="w-full">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-center !leading-tight">
                        <span className="text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text">Help Center</span>
                    </h1>
                    <p className="text-base md:text-lg mt-6 text-center text-muted-foreground max-w-2xl mx-auto">
                        Find answers to common questions and get the support you need.
                    </p>
                </AnimationContainer>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
                    <AnimationContainer delay={0.2}>
                        <div className="p-6 rounded-xl border border-white/10 bg-card text-center">
                            <BookOpenIcon className="w-10 h-10 text-violet-500 mx-auto mb-4" />
                            <h3 className="text-lg font-bold mb-2">Documentation</h3>
                            <p className="text-sm text-muted-foreground">
                                Complete guides and API reference
                            </p>
                        </div>
                    </AnimationContainer>
                    <AnimationContainer delay={0.3}>
                        <div className="p-6 rounded-xl border border-white/10 bg-card text-center">
                            <MessageCircleIcon className="w-10 h-10 text-fuchsia-500 mx-auto mb-4" />
                            <h3 className="text-lg font-bold mb-2">Community</h3>
                            <p className="text-sm text-muted-foreground">
                                Join our developer community
                            </p>
                        </div>
                    </AnimationContainer>
                    <AnimationContainer delay={0.4}>
                        <div className="p-6 rounded-xl border border-white/10 bg-card text-center">
                            <PhoneIcon className="w-10 h-10 text-blue-500 mx-auto mb-4" />
                            <h3 className="text-lg font-bold mb-2">Call Support</h3>
                            <p className="text-sm text-muted-foreground">
                                Talk to our support team
                            </p>
                        </div>
                    </AnimationContainer>
                    <AnimationContainer delay={0.5}>
                        <div className="p-6 rounded-xl border border-white/10 bg-card text-center">
                            <MailIcon className="w-10 h-10 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-bold mb-2">Email Us</h3>
                            <p className="text-sm text-muted-foreground">
                                Get help via email
                            </p>
                        </div>
                    </AnimationContainer>
                </div>

                <AnimationContainer delay={0.6} className="mt-20">
                    <h2 className="text-3xl font-bold font-heading text-center mb-12">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-6">
                        {faqs.map((faq, index) => (
                            <div key={index} className="rounded-xl border border-white/10 bg-card/50 backdrop-blur-xl p-6">
                                <h3 className="text-xl font-bold mb-3">{faq.question}</h3>
                                <p className="text-muted-foreground">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </AnimationContainer>

                <AnimationContainer delay={0.7} className="mt-16">
                    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-violet-500/10 to-fuchsia-500/10 p-12 text-center">
                        <h2 className="text-3xl font-bold font-heading mb-4">
                            Still need help?
                        </h2>
                        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                            Our support team is here to help you get the most out of AMD System.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button asChild size="lg">
                                <Link href="mailto:support@amdsystem.com">
                                    <MailIcon className="w-4 h-4 mr-2" />
                                    Email Support
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link href="/resources/blog">
                                    <BookOpenIcon className="w-4 h-4 mr-2" />
                                    Read Blog
                                </Link>
                            </Button>
                        </div>
                    </div>
                </AnimationContainer>
            </MaxWidthWrapper>
        </div>
    )
};

export default HelpPage
