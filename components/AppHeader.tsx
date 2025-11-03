'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authClient } from '@/lib/authClient';
import { Button } from "@/components/ui/button";
import { PhoneIcon, HistoryIcon, LogOutIcon } from "lucide-react";
import { useEffect, useState } from 'react';
import { cn } from "@/utils";

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [scroll, setScroll] = useState(false);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScroll(window.scrollY > 8);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Don't show header on login/signup/home pages
  if (pathname === '/login' || pathname === '/signup' || pathname === '/') {
    return null;
  }

  return (
    <header className={cn(
      "sticky top-0 inset-x-0 h-16 w-full border-b border-transparent z-[99999] select-none transition-all",
      scroll && "border-border bg-background/80 backdrop-blur-md shadow-sm"
    )}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 h-full sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/dial" className="flex items-center gap-2">
            <span className="text-xl font-bold font-heading !leading-none bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              AMD System
            </span>
          </Link>
          <nav className="hidden md:flex gap-2">
            <Link href="/dial">
              <Button
                variant={pathname === '/dial' ? 'primary' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <PhoneIcon className="w-4 h-4" />
                Dial
              </Button>
            </Link>
            <Link href="/history">
              <Button
                variant={pathname === '/history' ? 'primary' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <HistoryIcon className="w-4 h-4" />
                History
              </Button>
            </Link>
          </nav>
        </div>

        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <LogOutIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
