import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { KeyRound } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex justify-start">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">Guardian Gate</span>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-2xl">
          <KeyRound className="h-16 w-16 mx-auto text-primary mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
            Your Fortress of Digital Security
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Simple, secure two-factor authentication to protect your online
            accounts. Add an extra layer of security and keep your data safe.
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </main>
      <footer className="p-4 text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} Guardian Gate. All Rights Reserved.
      </footer>
    </div>
  );
}
