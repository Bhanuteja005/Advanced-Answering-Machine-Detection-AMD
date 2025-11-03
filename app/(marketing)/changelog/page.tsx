import { AnimationContainer, MaxWidthWrapper } from "@/components";
import { CheckCircle2Icon, SparklesIcon, ZapIcon } from "lucide-react";
import React from 'react'

const ChangeLogPage = () => {
    const changelog = [
        {
            version: "1.2.0",
            date: "November 2024",
            title: "Google Gemini AI Integration",
            items: [
                "Added Gemini Flash AMD strategy for multimodal audio analysis",
                "Improved detection accuracy across all strategies",
                "Enhanced dashboard with real-time call status updates",
                "Added confidence scores to AMD results"
            ]
        },
        {
            version: "1.1.0",
            date: "October 2024",
            title: "HuggingFace ML Support",
            items: [
                "Integrated HuggingFace ML models for AMD detection",
                "Added recording playback in call history",
                "Improved error handling and logging",
                "Enhanced UI/UX with better visualizations"
            ]
        },
        {
            version: "1.0.0",
            date: "September 2024",
            title: "Initial Release",
            items: [
                "Twilio Native AMD detection",
                "Media Streams real-time WebSocket support",
                "Call history and analytics dashboard",
                "User authentication with Better Auth",
                "Responsive design with dark mode"
            ]
        }
    ];

    return (
        <div className="flex flex-col items-center justify-center py-12 md:py-20">
            <MaxWidthWrapper className="max-w-4xl">
                <AnimationContainer delay={0.1}>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-center !leading-tight">
                        <span className="text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text">
                            Change Log
                        </span>
                    </h1>
                    <p className="text-base md:text-lg mt-6 text-center text-muted-foreground max-w-2xl mx-auto">
                        Stay up to date with the latest features, improvements, and updates to our AMD system.
                    </p>
                </AnimationContainer>

                <div className="mt-16 space-y-12">
                    {changelog.map((release, index) => (
                        <AnimationContainer key={release.version} delay={0.1 * (index + 2)}>
                            <div className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl p-8">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h2 className="text-3xl font-bold font-heading mb-2">{release.title}</h2>
                                        <div className="flex items-center gap-4">
                                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-sm font-medium">
                                                <SparklesIcon className="w-4 h-4" />
                                                v{release.version}
                                            </span>
                                            <span className="text-muted-foreground text-sm">{release.date}</span>
                                        </div>
                                    </div>
                                </div>
                                <ul className="space-y-3">
                                    {release.items.map((item, itemIndex) => (
                                        <li key={itemIndex} className="flex items-start gap-3">
                                            <CheckCircle2Icon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-muted-foreground">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </AnimationContainer>
                    ))}
                </div>

                <AnimationContainer delay={0.5} className="mt-16">
                    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-violet-500/10 to-fuchsia-500/10 p-8 text-center">
                        <ZapIcon className="w-12 h-12 mx-auto mb-4 text-violet-500" />
                        <h3 className="text-2xl font-bold font-heading mb-2">More to come!</h3>
                        <p className="text-muted-foreground">
                            We're constantly working on new features and improvements. Stay tuned for updates!
                        </p>
                    </div>
                </AnimationContainer>
            </MaxWidthWrapper>
        </div>
    )
};

export default ChangeLogPage
