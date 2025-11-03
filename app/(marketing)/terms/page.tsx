import { AnimationContainer, MaxWidthWrapper } from "@/components";
import Link from "next/link";

const TermsPage = () => {
    return (
        <MaxWidthWrapper className="max-w-3xl mx-auto px-8 mb-40">
            <AnimationContainer delay={0.1} className="w-full">
                <h1 className="text-4xl md:text-6xl font-heading font-bold my-12 text-center w-full">
                    Terms and Conditions
                </h1>
                <p className="text-sm mb-2 italic mt-20">
                    Last updated: November 3rd, 2025
                </p>
                <p className="mt-4">
                    Welcome to AMD System. These terms and conditions outline the rules and regulations for the use of AMD System&apos;s website and services.
                </p>

                <h2 className="text-xl font-medium mt-8">
                    Acceptance of Terms
                </h2>

                <p className="mt-8 text-muted-foreground">
                    By accessing and using AMD System, you accept and agree to be bound by these terms and conditions. If you do not agree to these terms, you may not use our website or services.
                </p>

                <h2 className="text-xl font-medium mt-12">
                    Changes to Terms
                </h2>
                <p className="mt-8 text-muted-foreground">
                    AMD System reserves the right to modify these terms at any time. We will notify you of any changes by updating the &quot;Last updated&quot; data at the top of this page. Your continued use of our website and services after any modifications indicates your acceptance of the new terms.
                </p>

                <h2 className="text-xl font-medium mt-12">
                    Use of Services
                </h2>

                <h3 className="text-lg mt-8">
                    Eligibility
                </h3>
                <p className="mt-8">
                    To use AMD System, you must be at least 18 years old and capable of entering into a binding contract.
                </p>

                <h3 className="text-lg mt-8">
                    Account Registration
                </h3>
                <div className="mt-8">
                    <ul className="list-disc ml-8 text-muted-foreground">
                        <li>You must provide accurate and complete information during the registration process.</li>
                        <li>You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.</li>
                        <li>You agree to notify us immediately of any unantuhorized use of your account.</li>
                    </ul>
                </div>

                <h3 className="text-lg mt-8">
                    Acceptable Use
                </h3>
                <div className="mt-8">
                    You agree not to use AMD System for any unlawful or prohibited activities, including but not limited to:
                    <ul className="list-disc text-muted-foreground ml-8">
                        <li>Making calls to numbers on Do Not Call lists or without proper consent.</li>
                        <li>Using the service for harassment, spam, or malicious purposes.</li>
                        <li>Attempting to gain unauthorized access to other user accounts or AMD System&apos;s infrastructure.</li>
                        <li>Violating telecommunications regulations or laws.</li>
                    </ul>
                </div>

                <h2 className="text-xl font-medium mt-12">
                    AMD Detection Services
                </h2>

                <h3 className="text-lg mt-8">
                    Call Services
                </h3>
                <p className="mt-8 text-muted-foreground">
                    AMD System provides answering machine detection services using various strategies. You agree to use these services responsibly and in compliance with all applicable telecommunications laws and regulations.
                </p>

                <h3 className="text-lg mt-8">
                    Analytics and Reporting
                </h3>
                <p className="mt-8 text-muted-foreground">
                    AMD System offers call analytics and history. You agree to use this data responsibly and comply with all applicable privacy and data protection laws.
                </p>

                <h3 className="text-lg mt-8">
                    Service Accuracy
                </h3>
                <p className="mt-8 text-muted-foreground">
                    While we strive for high accuracy in AMD detection, results may vary. AMD System makes no guarantees about the accuracy of detection results.
                </p>

                <h3 className="text-lg mt-8">
                    Business Transfers
                </h3>
                <p className="mt-8 text-muted-foreground">
                    In the event of a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred to the acquiring entity.
                </p>

                <h2 className="text-xl font-medium mt-12">
                    User Content
                </h2>

                <h3 className="text-lg mt-8">
                    Ownership
                </h3>

                <p className="mt-8 text-muted-foreground">
                    You retain ownership of your call data and analytics. However, by using our service, you grant AMD System a license to process and analyze call data as necessary to provide detection services.
                </p>

                <h2 className="text-xl font-medium mt-12">
                    Responsibility
                </h2>
                <p className="mt-8 text-muted-foreground">
                    You are solely responsible for your use of the AMD System and compliance with telecommunications laws. AMD System does not endorse or assume liability for how you use our detection services.
                </p>

                <h2 className="text-xl font-medium mt-12">
                    Privacy
                </h2>

                <p className="mt-8 text-muted-foreground">
                    Your privacy is important to us. Please review our <Link href="/privacy" className="underline">Privacy Policy</Link> to understand how we collect, use, and protect your information.
                </p>

                <h2 className="text-xl font-medium mt-12">
                    Termination
                </h2>
                <p className="mt-8 text-muted-foreground">
                    AMD System reserves the right to suspend or terminate your account at any time, with or without notice, for any reason, including but not limited to violation of these terms or applicable laws.
                </p>

                <h2 className="text-xl font-medium mt-12">
                    Disclaimers and Limitations of Liability
                </h2>

                <h3 className="text-lg mt-8">
                    No Warranties
                </h3>
                <p className="mt-8 text-muted-foreground">
                    AMD System is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We do not warrant that the service will be uninterrupted, error-free, or that detection results will be 100% accurate.
                </p>

                <h3 className="text-lg mt-8">
                    Limitation of Liability
                </h3>
                <p className="mt-8 text-muted-foreground">
                    In no event shall AMD System be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the service, including but not limited to costs incurred from incorrect AMD detection results.
                </p>

                <h2 className="text-xl font-medium mt-12">
                    Governing Law
                </h2>
                <p className="mt-8 text-muted-foreground">
                    These terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                </p>

                <h2 className="text-xl font-medium mt-12">
                    Contact Us
                </h2>
                <p className="mt-8 text-muted-foreground">
                    If you have any questions or concerns about these Terms and Conditions, please contact us at support@amdsystem.com.
                </p>

                <p className="mt-8 font-medium">
                    By using AMD System, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.
                </p>
            </AnimationContainer>
        </MaxWidthWrapper>
    );
};

export default TermsPage;
