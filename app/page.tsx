import { AnimationContainer, MaxWidthWrapper } from "@/components";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import MagicBadge from "@/components/ui/magic-badge";
import { ArrowRightIcon, PhoneIcon, BrainCircuitIcon, BarChart3Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="overflow-x-hidden scrollbar-hide size-full bg-background">
      {/* Background Grid */}
      <div id="home" className="absolute inset-0 bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] h-full -z-10" />
      
      {/* Hero Section */}
      <MaxWidthWrapper>
        <div className="flex flex-col items-center justify-center w-full text-center bg-gradient-to-t from-background relative z-10">
          <AnimationContainer className="flex flex-col items-center justify-center w-full text-center">
            <button className="group relative grid overflow-hidden rounded-full px-4 py-1 shadow-[0_1000px_0_0_hsl(0_0%_20%)_inset] transition-colors duration-200 mt-20">
              <span>
                <span className="spark mask-gradient absolute inset-0 h-[100%] w-[100%] animate-flip overflow-hidden rounded-full [mask:linear-gradient(white,_transparent_50%)] before:absolute before:aspect-square before:w-[200%] before:rotate-[-90deg] before:animate-rotate before:bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] before:content-[''] before:[inset:0_auto_auto_50%] before:[translate:-50%_-15%]" />
              </span>
              <span className="backdrop absolute inset-[1px] rounded-full bg-neutral-950 transition-colors duration-200 group-hover:bg-neutral-900" />
              <span className="h-full w-full blur-md absolute bottom-0 inset-x-0 bg-gradient-to-tr from-primary/20"></span>
              <span className="z-10 py-0.5 text-sm text-neutral-100 flex items-center justify-center gap-1">
                ✨ Powered by AI & Machine Learning
                <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
              </span>
            </button>
            <h1 className="text-foreground text-center py-6 text-5xl font-medium tracking-normal text-balance sm:text-6xl md:text-7xl lg:text-8xl !leading-[1.15] w-full font-heading">
              Advanced <span className="text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text inline-bloc">
                Answering Machine
              </span> Detection
            </h1>
            <p className="mb-12 text-lg tracking-tight text-muted-foreground md:text-xl text-balance">
              Make intelligent outbound calls with AI-powered answering machine detection.
              <br className="hidden md:block" />
              <span className="hidden md:block">Choose between Twilio's native detection or advanced ML-based classification.</span>
            </p>
            <div className="flex items-center justify-center whitespace-nowrap gap-4 z-50">
              <Button asChild size="lg">
                <Link href="/signup" className="flex items-center">
                  Get Started Free
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">
                  Sign In
                </Link>
              </Button>
            </div>
          </AnimationContainer>

          <AnimationContainer delay={0.2} className="relative pt-20 pb-20 md:py-32 px-2 bg-transparent w-full">
            <div className="absolute md:top-[10%] left-1/2 gradient w-3/4 -translate-x-1/2 h-1/4 md:h-1/3 inset-0 blur-[5rem] animate-image-glow"></div>
            <div className="-m-2 rounded-xl p-2 ring-1 ring-inset ring-foreground/20 lg:-m-4 lg:rounded-2xl bg-opacity-50 backdrop-blur-3xl">
              <BorderBeam
                size={250}
                duration={12}
                delay={9}
              />
              <div className="rounded-md lg:rounded-xl bg-foreground/10 ring-1 ring-border p-8 text-left">
                <h3 className="text-xl font-bold mb-4">Call Detection Dashboard</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="p-4 bg-background/50 rounded">
                    <div className="text-2xl font-bold">98%</div>
                    <div className="text-muted-foreground">Accuracy</div>
                  </div>
                  <div className="p-4 bg-background/50 rounded">
                    <div className="text-2xl font-bold">&lt;2s</div>
                    <div className="text-muted-foreground">Detection Time</div>
                  </div>
                  <div className="p-4 bg-background/50 rounded">
                    <div className="text-2xl font-bold">4</div>
                    <div className="text-muted-foreground">AMD Strategies</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 inset-x-0 w-full h-1/2 bg-gradient-to-t from-background z-40"></div>
              <div className="absolute bottom-0 md:-bottom-8 inset-x-0 w-full h-1/4 bg-gradient-to-t from-background z-50"></div>
            </div>
          </AnimationContainer>
        </div>
      </MaxWidthWrapper>

      {/* Features Section */}
      <MaxWidthWrapper className="py-20">
        <AnimationContainer delay={0.1}>
          <div className="flex flex-col w-full items-center justify-center py-8">
            <MagicBadge title="Features" />
            <h2 className="text-center text-3xl md:text-5xl !leading-[1.1] font-medium font-heading text-foreground mt-6">
              Multiple AMD Strategies
            </h2>
            <p className="mt-4 text-center text-lg text-muted-foreground max-w-lg">
              Choose the detection method that best fits your needs, from fast native detection to advanced AI analysis.
            </p>
          </div>
        </AnimationContainer>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8">
          <AnimationContainer delay={0.2}>
            <div className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow">
              <PhoneIcon className="w-10 h-10 text-violet-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Twilio Native</h3>
              <p className="text-muted-foreground">Fast, built-in detection with 70-90% accuracy in 1-2 seconds.</p>
            </div>
          </AnimationContainer>
          
          <AnimationContainer delay={0.3}>
            <div className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow">
              <BrainCircuitIcon className="w-10 h-10 text-fuchsia-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Media Streams</h3>
              <p className="text-muted-foreground">Real-time WebSocket audio streaming with 2-3s latency.</p>
            </div>
          </AnimationContainer>
          
          <AnimationContainer delay={0.4}>
            <div className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow">
              <BarChart3Icon className="w-10 h-10 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">HuggingFace ML</h3>
              <p className="text-muted-foreground">ML-powered detection with 80-95% accuracy in 2-5 seconds.</p>
            </div>
          </AnimationContainer>
          
          <AnimationContainer delay={0.5}>
            <div className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow">
              <BrainCircuitIcon className="w-10 h-10 text-purple-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Google Gemini AI</h3>
              <p className="text-muted-foreground">Multimodal audio analysis with 3-6s processing time.</p>
            </div>
          </AnimationContainer>
        </div>
      </MaxWidthWrapper>

      {/* How It Works Section */}
      <MaxWidthWrapper className="py-20">
        <AnimationContainer delay={0.1}>
          <div className="flex flex-col w-full items-center justify-center py-8">
            <MagicBadge title="How It Works" />
            <h2 className="text-center text-3xl md:text-5xl !leading-[1.1] font-medium font-heading text-foreground mt-6">
              Simple & Powerful Detection
            </h2>
            <p className="mt-4 text-center text-lg text-muted-foreground max-w-lg">
              Get started in minutes with our intuitive interface and powerful detection capabilities.
            </p>
          </div>
        </AnimationContainer>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <AnimationContainer delay={0.2}>
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Sign Up</h3>
              <p className="text-muted-foreground">Create your free account and connect your Twilio credentials in seconds.</p>
            </div>
          </AnimationContainer>

          <AnimationContainer delay={0.3}>
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Choose Strategy</h3>
              <p className="text-muted-foreground">Select from 4 AMD strategies based on your accuracy and speed requirements.</p>
            </div>
          </AnimationContainer>

          <AnimationContainer delay={0.4}>
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Start Calling</h3>
              <p className="text-muted-foreground">Make calls and get instant AMD detection results with detailed analytics.</p>
            </div>
          </AnimationContainer>
        </div>
      </MaxWidthWrapper>

      {/* Use Cases Section */}
      <MaxWidthWrapper className="py-20">
        <AnimationContainer delay={0.1}>
          <div className="flex flex-col w-full items-center justify-center py-8">
            <MagicBadge title="Use Cases" />
            <h2 className="text-center text-3xl md:text-5xl !leading-[1.1] font-medium font-heading text-foreground mt-6">
              Built for Every Scenario
            </h2>
            <p className="mt-4 text-center text-lg text-muted-foreground max-w-lg">
              Whether you're running sales campaigns or customer outreach, we've got you covered.
            </p>
          </div>
        </AnimationContainer>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <AnimationContainer delay={0.2}>
            <div className="p-8 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl">
              <div className="text-4xl mb-4">📞</div>
              <h3 className="text-2xl font-bold mb-3">Sales & Telemarketing</h3>
              <p className="text-muted-foreground">Optimize your sales campaigns by instantly detecting answering machines and routing calls to available agents only when humans answer.</p>
            </div>
          </AnimationContainer>

          <AnimationContainer delay={0.3}>
            <div className="p-8 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-2xl font-bold mb-3">Customer Notifications</h3>
              <p className="text-muted-foreground">Ensure important notifications reach real people by detecting voicemail and scheduling follow-up calls automatically.</p>
            </div>
          </AnimationContainer>

          <AnimationContainer delay={0.4}>
            <div className="p-8 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-2xl font-bold mb-3">Market Research</h3>
              <p className="text-muted-foreground">Conduct surveys more efficiently by filtering out answering machines and focusing on live respondents.</p>
            </div>
          </AnimationContainer>

          <AnimationContainer delay={0.5}>
            <div className="p-8 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl">
              <div className="text-4xl mb-4">🏥</div>
              <h3 className="text-2xl font-bold mb-3">Healthcare Reminders</h3>
              <p className="text-muted-foreground">Improve appointment show-up rates by ensuring reminders reach patients directly, not their voicemail.</p>
            </div>
          </AnimationContainer>
        </div>
      </MaxWidthWrapper>

      {/* Stats Section */}
      <MaxWidthWrapper className="py-20">
        <AnimationContainer delay={0.1}>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-violet-500/5 to-fuchsia-500/5 p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent mb-2">
                  98%
                </div>
                <div className="text-muted-foreground">Detection Accuracy</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent mb-2">
                  &lt;2s
                </div>
                <div className="text-muted-foreground">Average Response</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent mb-2">
                  10K+
                </div>
                <div className="text-muted-foreground">Daily Calls</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent mb-2">
                  99.9%
                </div>
                <div className="text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>
        </AnimationContainer>
      </MaxWidthWrapper>

      {/* Testimonials Section */}
      <MaxWidthWrapper className="py-20">
        <AnimationContainer delay={0.1}>
          <div className="flex flex-col w-full items-center justify-center py-8">
            <MagicBadge title="Testimonials" />
            <h2 className="text-center text-3xl md:text-5xl !leading-[1.1] font-medium font-heading text-foreground mt-6">
              Loved by Developers
            </h2>
            <p className="mt-4 text-center text-lg text-muted-foreground max-w-lg">
              See what our users are saying about AMD System.
            </p>
          </div>
        </AnimationContainer>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <AnimationContainer delay={0.2}>
            <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-500">⭐</span>
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "AMD System has transformed our outbound calling. The ML-based detection is incredibly accurate, saving us hours of agent time daily."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <span className="text-white font-bold">JD</span>
                </div>
                <div>
                  <div className="font-bold">John Doe</div>
                  <div className="text-sm text-muted-foreground">Sales Director</div>
                </div>
              </div>
            </div>
          </AnimationContainer>

          <AnimationContainer delay={0.3}>
            <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-500">⭐</span>
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "The multiple strategy options are fantastic. We use Twilio Native for quick checks and Gemini AI for important calls. Perfect flexibility!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <span className="text-white font-bold">SK</span>
                </div>
                <div>
                  <div className="font-bold">Sarah Kim</div>
                  <div className="text-sm text-muted-foreground">CTO</div>
                </div>
              </div>
            </div>
          </AnimationContainer>

          <AnimationContainer delay={0.4}>
            <div className="p-6 rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-500">⭐</span>
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "Easy integration, great documentation, and the analytics dashboard gives us insights we never had before. Highly recommended!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <span className="text-white font-bold">MP</span>
                </div>
                <div>
                  <div className="font-bold">Mike Peters</div>
                  <div className="text-sm text-muted-foreground">Developer</div>
                </div>
              </div>
            </div>
          </AnimationContainer>
        </div>
      </MaxWidthWrapper>

      {/* CTA Section */}
      <MaxWidthWrapper className="py-20">
        <AnimationContainer delay={0.1}>
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-violet-500/10 to-fuchsia-500/10 p-12 text-center">
            <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of developers using our AMD system to make smarter outbound calls with AI-powered detection.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/signup">
                  Start for Free
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/enterprise">
                  View Pricing
                </Link>
              </Button>
            </div>
          </div>
        </AnimationContainer>
      </MaxWidthWrapper>
    </div>
  );
}
