import { buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/utils";
import { ArrowRightIcon, CalendarIcon, PhoneIcon, BrainCircuitIcon, WaypointsIcon, ZapIcon } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Input } from "./input";
import { Integrations } from "./integrations";
import { Label } from "./label";

export const CARDS = [
    {
        Icon: ZapIcon,
        name: "Twilio Native AMD",
        description: "Ultra-fast detection in 1-2 seconds with 70-90% accuracy using Twilio's built-in engine.",
        href: "#",
        cta: "Learn more",
        className: "col-span-3 lg:col-span-1",
        background: (
            <Card className="absolute top-10 left-10 origin-top rounded-none rounded-tl-md transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_0%,#000_100%)] group-hover:scale-105 border border-border border-r-0">
                <CardHeader>
                    <CardTitle>
                        ⚡ Twilio Native
                    </CardTitle>
                    <CardDescription>
                        Fast & cost-effective detection
                    </CardDescription>
                </CardHeader>
                <CardContent className="-mt-4">
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span>1-2 second detection</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            <span>70-90% accuracy</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-violet-500"></div>
                            <span>No extra costs</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        ),
    },
    {
        Icon: PhoneIcon,
        name: "Call History & Analytics",
        description: "Track all calls with detailed analytics, detection results, and recordings.",
        href: "/history",
        cta: "View history",
        className: "col-span-3 lg:col-span-2",
        background: (
            <Command className="absolute right-10 top-10 w-[70%] origin-to translate-x-0 border border-border transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:-translate-x-10 p-2">
                <Input placeholder="Search call history..." />
                <div className="mt-1 cursor-pointer">
                    <div className="px-4 py-2 hover:bg-muted rounded-md flex justify-between">
                        <span>+1234567890</span>
                        <span className="text-green-500">Human</span>
                    </div>
                    <div className="px-4 py-2 hover:bg-muted rounded-md flex justify-between">
                        <span>+1987654321</span>
                        <span className="text-yellow-500">Machine</span>
                    </div>
                    <div className="px-4 py-2 hover:bg-muted rounded-md flex justify-between">
                        <span>+1567890123</span>
                        <span className="text-green-500">Human</span>
                    </div>
                    <div className="px-4 py-2 hover:bg-muted rounded-md flex justify-between">
                        <span>+1345678901</span>
                        <span className="text-blue-500">Unknown</span>
                    </div>
                </div>
            </Command>
        ),
    },
    {
        Icon: WaypointsIcon,
        name: "Multiple Strategies",
        description: "Choose from 4 different AMD strategies optimized for your use case.",
        href: "#",
        cta: "Learn more",
        className: "col-span-3 lg:col-span-2 max-w-full overflow-hidden",
        background: (
            <Integrations className="absolute right-2 pl-28 md:pl-0 top-4 h-[300px] w-[600px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
        ),
    },
    {
        Icon: BrainCircuitIcon,
        name: "AI-Powered Detection",
        description: "Advanced ML models from HuggingFace and Gemini AI for maximum accuracy.",
        className: "col-span-3 lg:col-span-1",
        href: "#",
        cta: "Learn more",
        background: (
            <Card className="absolute right-2 top-10 origin-top rounded-md border border-border transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:scale-105 p-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="text-2xl">🤗</div>
                        <div className="text-sm">
                            <div className="font-semibold text-foreground">HuggingFace</div>
                            <div className="text-muted-foreground">80-95% accuracy</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-2xl">✨</div>
                        <div className="text-sm">
                            <div className="font-semibold text-foreground">Gemini AI</div>
                            <div className="text-muted-foreground">Multimodal analysis</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-2xl">🌐</div>
                        <div className="text-sm">
                            <div className="font-semibold text-foreground">Media Streams</div>
                            <div className="text-muted-foreground">Real-time WebSocket</div>
                        </div>
                    </div>
                </div>
            </Card>
        ),
    },
];

const BentoGrid = ({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) => {
    return (
        <div
            className={cn(
                "grid w-full auto-rows-[22rem] grid-cols-3 gap-4",
                className,
            )}
        >
            {children}
        </div>
    );
};

const BentoCard = ({
    name,
    className,
    background,
    Icon,
    description,
    href,
    cta,
}: {
    name: string;
    className: string;
    background: ReactNode;
    Icon: any;
    description: string;
    href: string;
    cta: string;
}) => (
    <div
        key={name}
        className={cn(
            "group relative col-span-3 flex flex-col justify-between border border-border/60 overflow-hidden rounded-xl",
            "bg-black [box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
            className,
        )}
    >
        <div>{background}</div>
        <div className="pointer-events-none z-10 flex flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-10">
            <Icon className="h-12 w-12 origin-left text-neutral-700 transition-all duration-300 ease-in-out group-hover:scale-75" />
            <h3 className="text-xl font-semibold text-neutral-300">
                {name}
            </h3>
            <p className="max-w-lg text-neutral-400">{description}</p>
        </div>

        <div
            className={cn(
                "absolute bottom-0 flex w-full translate-y-10 flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100",
            )}
        >
            <Link href={href} className={buttonVariants({ size: "sm", variant: "ghost", className: "cursor-pointer" })}>
                {cta}
                <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
        </div>
        <div className="pointer-events-none absolute inset-0 transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10" />
    </div>
);

export { BentoCard, BentoGrid };
