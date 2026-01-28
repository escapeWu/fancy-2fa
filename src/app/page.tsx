import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { OnetimeCompute } from "@/components/onetime-compute";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex justify-between items-center border-b-2">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold font-headline">Guardian Gate</span>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href="/login">Login / Sign Up</Link>
        </Button>
      </header>
      <main className="flex-1">
        <OnetimeCompute />
      </main>
      <footer className="p-4 text-center text-muted-foreground text-xs">
        © {new Date().getFullYear()} Guardian Gate. All wrongs reserved.
      </footer>
    </div>
  );
}
