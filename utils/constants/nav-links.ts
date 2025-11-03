import { HelpCircleIcon, LineChartIcon, PhoneIcon, BrainCircuitIcon, NewspaperIcon, ZapIcon } from "lucide-react";

export const NAV_LINKS = [
    {
        title: "Strategies",
        href: "/features",
        menu: [
            {
                title: "Twilio Native AMD",
                tagline: "Fast detection with built-in Twilio engine.",
                href: "/features/link-shortening",
                icon: ZapIcon,
            },
            {
                title: "Media Streams",
                tagline: "Real-time WebSocket audio streaming.",
                href: "/features/password-protection",
                icon: PhoneIcon,
            },
            {
                title: "HuggingFace ML",
                tagline: "Advanced ML-powered detection.",
                href: "/features/analytics",
                icon: BrainCircuitIcon,
            },
            {
                title: "Gemini AI",
                tagline: "Multimodal audio analysis with Google AI.",
                href: "/features/qr-codes",
                icon: BrainCircuitIcon,
            },
        ],
    },
    {
        title: "Pricing",
        href: "/enterprise",
    },
    {
        title: "Call History",
        href: "/history",
    },
    {
        title: "Documentation",
        href: "/resources",
        menu: [
            {
                title: "Blog",
                tagline: "Learn about AMD strategies and best practices.",
                href: "/resources/blog",
                icon: NewspaperIcon,
            },
            {
                title: "Help Center",
                tagline: "Get answers to your questions.",
                href: "/resources/help",
                icon: HelpCircleIcon,
            },
        ]
    },
    {
        title: "Changelog",
        href: "/changelog",
    },
];
