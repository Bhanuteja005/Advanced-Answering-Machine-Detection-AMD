import { AnimationContainer, MaxWidthWrapper } from "@/components";import { AnimationContainer, MaxWidthWrapper } from "@/components";

import { Button } from "@/components/ui/button";import { Button } from "@/components/ui/button";

import { BorderBeam } from "@/components/ui/border-beam";import { LampContainer } from "@/components/ui/lamp";

import MagicBadge from "@/components/ui/magic-badge";import MagicBadge from "@/components/ui/magic-badge";

import { ZapIcon, ArrowRightIcon, CheckCircle2Icon, ClockIcon, TargetIcon } from "lucide-react";import { COMPANIES } from "@/utils";

import Link from "next/link";import { ArrowRightIcon } from "lucide-react";

import Image from "next/image";

export default function TwilioNativeAMDPage() {import Link from "next/link";

    return (

        <div className="overflow-x-hidden scrollbar-hide">const LinkShorteningPage = () => {

            <MaxWidthWrapper>    return (

                <div className="flex flex-col items-center justify-center w-full text-center py-12 md:py-20">        <>

                    <AnimationContainer className="flex flex-col items-center justify-center w-full text-center">            <MaxWidthWrapper>

                        <MagicBadge title="Twilio Native AMD" />                <AnimationContainer delay={0.1} className="w-full">

                        <h1 className="text-foreground text-center py-6 text-4xl font-medium tracking-normal text-balance sm:text-5xl md:text-6xl lg:text-7xl !leading-[1.15] w-full font-heading">                    <div className="flex flex-col items-center justify-center py-10 max-w-xl mx-auto">

                            <span className="text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text">Fast</span> & Built-in Detection                        <MagicBadge title="Simple" />

                        </h1>                        <h1 className="text-2xl md:text-4xl lg:text-5xl font-semibold font-heading text-center mt-6 !leading-tight">

                        <p className="mb-8 text-lg tracking-tight text-muted-foreground md:text-xl text-balance max-w-3xl">                            Shorten links and track their performance

                            Leverage Twilio's native answering machine detection for lightning-fast results.                        </h1>

                            <br className="hidden md:block" />                        <p className="text-base md:text-lg mt-6 text-center text-muted-foreground">

                            Get detection results in 1-2 seconds with 70-90% accuracy.                            Simplify your workflow with powerful link management tools. Shorten links, track clicks, and optimize your strategy with ease.

                        </p>                        </p>

                        <div className="flex items-center justify-center whitespace-nowrap gap-4 z-50">                        <div className="flex items-center justify-center gap-x-4 mt-8">

                            <Button asChild size="lg">                            <Button size="sm" asChild>

                                <Link href="/dial" className="flex items-center">                                <Link href="/dashboard">

                                    Try It Now                                    Get started

                                    <ArrowRightIcon className="w-4 h-4 ml-2" />                                </Link>

                                </Link>                            </Button>

                            </Button>                            <Button size="sm" variant="outline" asChild>

                            <Button asChild variant="outline" size="lg">                                <Link href="/blog">

                                <Link href="/resources/help">                                    Learn more

                                    Documentation                                </Link>

                                </Link>                            </Button>

                            </Button>                        </div>

                        </div>                    </div>

                    </AnimationContainer>                </AnimationContainer>

                <AnimationContainer delay={0.2} className="w-full">

                    <AnimationContainer delay={0.2} className="relative pt-20 pb-20 md:py-32 px-2 bg-transparent w-full">                    <div className="w-full flex max-w-4xl py-10 mx-auto">

                        <div className="absolute md:top-[10%] left-1/2 gradient w-3/4 -translate-x-1/2 h-1/4 md:h-1/3 inset-0 blur-[5rem]"></div>                        <Image

                        <div className="-m-2 rounded-xl p-2 ring-1 ring-inset ring-foreground/20 lg:-m-4 lg:rounded-2xl bg-opacity-50 backdrop-blur-3xl">                            src="/assets/shorten-links.svg"

                            <BorderBeam size={250} duration={12} delay={9} />                            alt="Shorten links and track their performance"

                            <div className="rounded-md lg:rounded-xl bg-foreground/10 ring-1 ring-border p-8">                            width={80}

                                <div className="space-y-6">                            height={80}

                                    <div className="flex items-start gap-4">                            className="w-full h-auto"

                                        <ZapIcon className="w-8 h-8 text-violet-500 flex-shrink-0 mt-1" />                        />

                                        <div className="text-left">                    </div>

                                            <h3 className="text-xl font-bold mb-2">Ultra-Fast Detection</h3>                </AnimationContainer>

                                            <p className="text-muted-foreground">Get results in 1-2 seconds, perfect for high-volume calling scenarios where speed is critical.</p>                <AnimationContainer delay={0.3} className="w-full">

                                        </div>                    <div className="py-14">

                                    </div>                        <div className="mx-auto px-4 md:px-8">

                                    <div className="flex items-start gap-4">                            <h2 className="text-center text-sm font-medium font-heading text-neutral-400 uppercase">

                                        <CheckCircle2Icon className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />                                Trusted by the best in the industry

                                        <div className="text-left">                            </h2>

                                            <h3 className="text-xl font-bold mb-2">No Additional Setup</h3>                            <div className="mt-8">

                                            <p className="text-muted-foreground">Built directly into Twilio's platform - no extra configuration or infrastructure needed.</p>                                <ul className="flex flex-wrap items-center gap-x-6 gap-y-6 md:gap-x-16 justify-center py-8">

                                        </div>                                    {COMPANIES.map((company) => (

                                    </div>                                        <li key={company.name}>

                                    <div className="flex items-start gap-4">                                            <Image

                                        <TargetIcon className="w-8 h-8 text-fuchsia-500 flex-shrink-0 mt-1" />                                                src={company.logo}

                                        <div className="text-left">                                                alt={company.name}

                                            <h3 className="text-xl font-bold mb-2">70-90% Accuracy</h3>                                                width={80}

                                            <p className="text-muted-foreground">Reliable detection for most use cases, with optimized performance for standard answering machines.</p>                                                height={80}

                                        </div>                                                quality={100}

                                    </div>                                                className="w-28 h-auto"

                                </div>                                            />

                            </div>                                        </li>

                            <div className="absolute -bottom-4 inset-x-0 w-full h-1/2 bg-gradient-to-t from-background z-40"></div>                                    ))}

                        </div>                                </ul>

                    </AnimationContainer>                            </div>

                        </div>

                    <AnimationContainer delay={0.3} className="w-full max-w-5xl">                    </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">                </AnimationContainer>

                            <div className="p-6 rounded-xl border border-white/10 bg-card">            </MaxWidthWrapper>

                                <ClockIcon className="w-10 h-10 text-violet-500 mb-4" />            <MaxWidthWrapper className="pt-20">

                                <h3 className="text-xl font-bold mb-2">1-2 Seconds</h3>                <AnimationContainer delay={0.4} className="w-full">

                                <p className="text-muted-foreground text-sm">Detection Time</p>                    <LampContainer className="max-w-2xl mx-auto">

                            </div>                        <div className="flex flex-col items-center justify-center relative w-full text-center">

                            <div className="p-6 rounded-xl border border-white/10 bg-card">                            <h2 className="bg-gradient-to-br from-neutral-300 to-neutral-500 py-4 bg-clip-text text-center text-4xl font-semibold font-heading tracking-tight text-transparent md:text-7xl mt-8">

                                <TargetIcon className="w-10 h-10 text-fuchsia-500 mb-4" />                                Powerup your link strategy

                                <h3 className="text-xl font-bold mb-2">70-90%</h3>                            </h2>

                                <p className="text-muted-foreground text-sm">Accuracy Rate</p>                            <p className="text-muted-foreground mt-6 max-w-lg mx-auto text-base md:text-lg">

                            </div>                                Take control of your links with advanced features and real-time insights. Simplify your workflow and achieve more.

                            <div className="p-6 rounded-xl border border-white/10 bg-card">                            </p>

                                <ZapIcon className="w-10 h-10 text-blue-500 mb-4" />                            <div className="mt-6">

                                <h3 className="text-xl font-bold mb-2">Built-in</h3>                                <Button asChild>

                                <p className="text-muted-foreground text-sm">Native Integration</p>                                    <Link href="/auth/sign-up" className="flex items-center">

                            </div>                                        Get started for free

                        </div>                                        <ArrowRightIcon className="w-4 h-4 ml-2" />

                    </AnimationContainer>                                    </Link>

                                </Button>

                    <AnimationContainer delay={0.4} className="w-full max-w-4xl mt-12">                            </div>

                        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-violet-500/10 to-fuchsia-500/10 p-12 text-center">                        </div>

                            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">                    </LampContainer>

                                Ready to get started?                </AnimationContainer>

                            </h2>            </MaxWidthWrapper>

                            <p className="text-lg text-muted-foreground mb-8">        </>

                                Start using Twilio Native AMD in your calls today.    )

                            </p>};

                            <Button asChild size="lg">

                                <Link href="/dial">export default LinkShorteningPage

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
