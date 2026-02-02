"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";
import { LifeBuoy, LogOut, Settings, User } from "lucide-react";
import { logout } from "@/lib/auth-actions";
import { useGlobalProgress } from "./global-progress";
import { LanguageSwitcher } from "../language-switcher";

// Same color calculation as the top progress bar
function getProgressColor(p: number): string {
  if (p > 50) {
    const ratio = (p - 50) / 50;
    const r = Math.round(255 * (1 - ratio));
    const g = 200;
    return `rgb(${r}, ${g}, 0)`;
  } else {
    const ratio = p / 50;
    const r = Math.round(180 + 75 * ratio);
    const g = Math.round(200 * ratio);
    return `rgb(${r}, ${g}, 0)`;
  }
}

export function Header({ dict, lang }: { dict: any; lang: string }) {
  const { progress } = useGlobalProgress();

  return (
    <header className="sticky top-[5px] z-40">
      <div className="flex h-14 md:h-16 items-center gap-2 md:gap-4 text-accent-foreground px-3 md:px-6 bg-background">
      <Link href={`/${lang}/dashboard`} className="flex items-center gap-1.5 md:gap-2 font-semibold">
        <Logo className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        <span className="text-base md:text-lg font-bold font-headline">{dict.dashboard.title}</span>
      </Link>
      <div className="ml-auto flex items-center gap-2 md:gap-4">
        <LanguageSwitcher />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>GG</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-2 shadow-hard">
            <DropdownMenuLabel className="text-muted-foreground">{dict.dashboard.myAccount}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              <span>{dict.common.profile}</span>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <Settings className="mr-2 h-4 w-4" />
              <span>{dict.common.settings}</span>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <LifeBuoy className="mr-2 h-4 w-4" />
              <span>{dict.common.support}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={logout}>
              <input type="hidden" name="lang" value={lang} />
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full flex items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{dict.common.logout}</span>
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      </div>
      {/* Bottom progress bar - same as top */}
      <div className="h-[5px] bg-secondary/30">
        <div
          className="h-full transition-all duration-1000 ease-linear"
          style={{
            width: `${progress}%`,
            backgroundColor: getProgressColor(progress),
          }}
        />
      </div>
    </header>
  );
}
