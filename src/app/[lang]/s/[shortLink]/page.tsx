import { getDictionary } from "@/i18n/dictionaries";
import { Locale } from "@/i18n/config";
import { getAccountByShortLink } from "@/lib/actions";
import { SharedCodeDisplay } from "@/components/shared-code-display";
import { Logo } from "@/components/logo";
import { ShieldX } from "lucide-react";

export default async function SharedPage({
  params,
}: {
  params: Promise<{ lang: Locale; shortLink: string }>;
}) {
  const { lang, shortLink } = await params;
  const dict = await getDictionary(lang);

  const account = await getAccountByShortLink(shortLink);

  if (!account) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="p-4 flex justify-between items-center border-b-2 text-accent-foreground">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold font-headline">{dict.landing.title}</span>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-16">
            <ShieldX className="mx-auto h-16 w-16 text-destructive" />
            <h1 className="mt-4 text-2xl font-bold font-headline">
              {dict.share?.notFoundTitle || "Link Not Found"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {dict.share?.notFoundDesc || "This share link is invalid or has been removed."}
            </p>
          </div>
        </main>
        <footer className="p-4 text-center text-muted-foreground text-xs">
          {dict.common.copyright.replace("{year}", new Date().getFullYear().toString())}
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex justify-between items-center border-b-2 text-accent-foreground">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold font-headline">{dict.landing.title}</span>
        </div>
      </header>
      <main className="flex-1">
        <SharedCodeDisplay account={account} dict={dict} />
      </main>
      <footer className="p-4 text-center text-muted-foreground text-xs">
        {dict.common.copyright.replace("{year}", new Date().getFullYear().toString())}
      </footer>
    </div>
  );
}
