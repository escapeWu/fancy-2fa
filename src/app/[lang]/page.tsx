import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { OnetimeCompute } from "@/components/onetime-compute";
import { getDictionary } from "@/i18n/dictionaries";
import { Locale } from "@/i18n/config";

export default async function Home({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex justify-between items-center border-b-2 text-accent-foreground">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold font-headline">{dict.landing.title}</span>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href={`/${lang}/login`}>{dict.common.login}</Link>
        </Button>
      </header>
      <main className="flex-1">
        <OnetimeCompute dict={dict} />
      </main>
      <footer className="p-4 text-center text-muted-foreground text-xs">
        {dict.common.copyright.replace("{year}", new Date().getFullYear().toString())}
      </footer>
    </div>
  );
}
