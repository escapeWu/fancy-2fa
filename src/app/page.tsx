import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex justify-between items-center border-b-2">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold font-headline">Guardian Gate</span>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href="/login">Login</Link>
        </Button>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-2xl">
          <Shield className="h-20 w-20 mx-auto text-primary mb-6" />
          <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter">
            Stop. Who goes there?
          </h1>
          <p className="mt-6 text-lg max-w-xl mx-auto">
            This is Guardian Gate. The one and only. The final frontier of your digital identity. Add a layer of security that's as stylish as it is strong.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="rounded-full px-10">
              <Link href="/login">Enter the Gate</Link>
            </Button>
          </div>
        </div>
      </main>
      <footer className="p-4 text-center text-muted-foreground text-xs">
        © {new Date().getFullYear()} Guardian Gate. NO Rights Reserved.
      </footer>
    </div>
  );
}
