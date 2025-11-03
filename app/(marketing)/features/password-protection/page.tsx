import { AnimationContainer, MaxWidthWrapper } from "@/components";
import { Button } from "@/components/ui/button";
import { BorderBeam } from "@/components/ui/border-beam";
import MagicBadge from "@/components/ui/magic-badge";
import { PhoneIcon, ArrowRightIcon, WifiIcon, ClockIcon, ActivityIcon } from "lucide-react";
import Link from "next/link";

export default function MediaStreamsPage() {
    return (
        <div className="overflow-x-hidden scrollbar-hide">
            <MaxWidthWrapper>
                <div className="flex flex-col items-center justify-center w-full text-center py-12 md:py-20">
                    <AnimationContainer className="flex flex-col items-center justify-center w-full text-center">
                        <MagicBadge title="Media Streams AMD" />
                        <h1 className="text-foreground text-center py-6 text-4xl font-medium tracking-normal text-balance sm:text-5xl md:text-6xl lg:text-7xl !leading-[1.15] w-full font-heading">
                            <span className="text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text">Real-Time</span> Audio Streaming
                        </h1>
                        <p className="mb-8 text-lg tracking-tight text-muted-foreground md:text-xl text-balance max-w-3xl">
                            Stream audio in real-time using WebSocket connections for live AMD analysis.
                            <br className="hidden md:block" />
                            Get live updates with 2-3 second latency for responsive detection.
                        </p>
                        <div className="flex items-center justify-center whitespace-nowrap gap-4 z-50">
                            <Button asChild size="lg">
                                <Link href="/dial" className="flex items-center">
                                    Try It Now
                                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link href="/resources/help">
                                    Documentation
                                </Link>
                            </Button>
                        </div>
                    </AnimationContainer>

                    <AnimationContainer delay={0.2} className="relative pt-20 pb-20 md:py-32 px-2 bg-transparent w-full">
                        <div className="absolute md:top-[10%] left-1/2 gradient w-3/4 -translate-x-1/2 h-1/4 md:h-1/3 inset-0 blur-[5rem]"></div>
                        <div className="-m-2 rounded-xl p-2 ring-1 ring-inset ring-foreground/20 lg:-m-4 lg:rounded-2xl bg-opacity-50 backdrop-blur-3xl">
                            <BorderBeam size={250} duration={12} delay={9} />
                            <div className="rounded-md lg:rounded-xl bg-foreground/10 ring-1 ring-border p-8">
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <WifiIcon className="w-8 h-8 text-violet-500 flex-shrink-0 mt-1" />
                                        <div className="text-left">
                                            <h3 className="text-xl font-bold mb-2">WebSocket Streaming</h3>
                                            <p className="text-muted-foreground">Continuous audio streaming via WebSockets enables real-time processing and analysis.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <ActivityIcon className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
                                        <div className="text-left">
                                            <h3 className="text-xl font-bold mb-2">Live Updates</h3>
                                            <p className="text-muted-foreground">Get instant feedback as the call progresses with minimal latency.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <PhoneIcon className="w-8 h-8 text-fuchsia-500 flex-shrink-0 mt-1" />
                                        <div className="text-left">
                                            <h3 className="text-xl font-bold mb-2">Flexible Integration</h3>
                                            <p className="text-muted-foreground">Integrate with custom AMD logic and third-party services for enhanced detection.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -bottom-4 inset-x-0 w-full h-1/2 bg-gradient-to-t from-background z-40"></div>
                        </div>
                    </AnimationContainer>

                    <AnimationContainer delay={0.3} className="w-full max-w-5xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
                            <div className="p-6 rounded-xl border border-white/10 bg-card">
                                <ClockIcon className="w-10 h-10 text-violet-500 mb-4" />
                                <h3 className="text-xl font-bold mb-2">2-3 Seconds</h3>
                                <p className="text-muted-foreground text-sm">Latency</p>
                            </div>
                            <div className="p-6 rounded-xl border border-white/10 bg-card">
                                <WifiIcon className="w-10 h-10 text-fuchsia-500 mb-4" />
                                <h3 className="text-xl font-bold mb-2">Real-Time</h3>
                                <p className="text-muted-foreground text-sm">WebSocket Streaming</p>
                            </div>
                            <div className="p-6 rounded-xl border border-white/10 bg-card">
                                <ActivityIcon className="w-10 h-10 text-blue-500 mb-4" />
                                <h3 className="text-xl font-bold mb-2">Live</h3>
                                <p className="text-muted-foreground text-sm">Updates</p>
                            </div>
                        </div>
                    </AnimationContainer>

                    <AnimationContainer delay={0.4} className="w-full max-w-4xl mt-12">
                        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-violet-500/10 to-fuchsia-500/10 p-12 text-center">
                            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
                                Ready to get started?
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8">
                                Start using Media Streams AMD in your calls today.
                            </p>
                            <Button asChild size="lg">
                                <Link href="/dial">
                                    Make Your First Call
                                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </AnimationContainer>
                </div>
            </MaxWidthWrapper>
        </div>
    )
}
