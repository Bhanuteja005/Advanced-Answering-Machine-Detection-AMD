import React from 'react';
import { Footer, Navbar } from "@/components";
import { aeonik } from "@/utils/constants/fonts";

interface Props {
    children: React.ReactNode
}

const MarketingLayout = ({ children }: Props) => {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <div id="home" className="absolute inset-0 bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] h-full" />
            <Navbar />
            <main className="mt-20 mx-auto w-full z-0 relative">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default MarketingLayout
