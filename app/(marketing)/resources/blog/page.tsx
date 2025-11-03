import { AnimationContainer, Blogs, MaxWidthWrapper } from "@/components";
import React from 'react'

const BlogPage = () => {
    return (
        <div className="flex flex-col items-center justify-center pb-20">
            <MaxWidthWrapper>
                <AnimationContainer delay={0.1} className="w-full">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-center mt-6 !leading-tight">
                        AMD System <span className="text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text">Blog</span>
                    </h1>
                    <p className="text-base md:text-lg mt-6 text-center text-muted-foreground max-w-2xl mx-auto">
                        Learn about AMD strategies, best practices, and the latest updates in answering machine detection technology.
                    </p>
                </AnimationContainer>
                <AnimationContainer delay={0.2} className="w-full pt-20">
                    <Blogs />
                </AnimationContainer>
            </MaxWidthWrapper>
        </div>
    )
};

export default BlogPage
