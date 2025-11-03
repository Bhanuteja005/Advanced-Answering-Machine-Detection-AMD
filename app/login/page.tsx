'use client';

import { useState } from 'react';
import { authClient } from '@/lib/authClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AnimationContainer, MaxWidthWrapper } from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BorderBeam } from "@/components/ui/border-beam";
import { LoaderIcon, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Login failed');
      }

      // Redirect on success
      router.push('/dial');
    } catch (error: any) {
      setError(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Starting Google OAuth...');
      
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/dial',
      });

      // The browser will redirect to Google
      console.log('✅ OAuth initiated successfully');
    } catch (error: any) {
      console.error('❌ Exception during OAuth:', error);
      setError(error.message || 'An error occurred during Google sign in');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] -z-10" />
      
      {/* Gradient Blur Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-full blur-[100px] -z-10" />
      
      <MaxWidthWrapper className="relative z-50">
        <AnimationContainer className="flex items-center justify-center py-12">
          <div className="w-full max-w-md">
            <div className="relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 shadow-2xl overflow-visible">
              {/* Border Beam Effect */}
              <BorderBeam size={250} duration={12} delay={9} className="pointer-events-none" />
              
              <div className="mb-8 text-center relative">
                <Link href="/" className="inline-block mb-6">
                  <span className="text-3xl font-bold font-sans !leading-none bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                    AMD System
                  </span>
                </Link>
                <h2 className="text-4xl font-bold font-sans tracking-tight text-white">
                  Welcome back
                </h2>
                <p className="mt-3 text-base text-gray-400">
                  Sign in to access your AMD dashboard
                </p>
              </div>

              <form className="space-y-6 relative" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-200">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-violet-500"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-200">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-violet-500 pr-10"
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={loading}
                      className="absolute top-1 right-1 h-8 w-8 hover:bg-white/10 text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-medium h-11"
                >
                  {loading ? (
                    <LoaderIcon className="w-5 h-5 animate-spin" />
                  ) : "Sign in"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-black px-3 text-gray-400">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-3 h-11 bg-white/5 border-white/10 hover:bg-white/10 text-white"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </Button>

                <div className="text-center text-sm mt-6">
                  <span className="text-gray-400">Don&apos;t have an account? </span>
                  <Link
                    href="/signup"
                    className="font-medium bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent hover:from-violet-300 hover:to-fuchsia-300"
                  >
                    Sign up for free
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </AnimationContainer>
      </MaxWidthWrapper>
    </div>
  );
}
