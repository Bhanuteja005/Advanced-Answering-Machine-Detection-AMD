import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-center gap-8 px-16 py-32 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Advanced Answering Machine Detection
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Make intelligent outbound calls with AI-powered answering machine detection. 
          Choose between Twilio's native detection or advanced ML-based classification.
        </p>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Link
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 md:w-auto"
            href="/signup"
          >
            Get Started
          </Link>
          <Link
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-zinc-300 px-6 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:bg-zinc-900 md:w-auto"
            href="/login"
          >
            Sign In
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">
              Fast Detection
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Get AMD results in 1-2 seconds with Twilio's built-in detection
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">
              ML-Powered
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Optional Hugging Face integration for 80-95% accuracy
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">
              Full Control
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              View history, override results, and export data
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
