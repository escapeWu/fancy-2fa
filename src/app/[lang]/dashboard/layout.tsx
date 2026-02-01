import { Header } from "@/components/dashboard/header";
import { GlobalProgressProvider, GlobalProgressBar } from "@/components/dashboard/global-progress";
import { getDictionary } from "@/i18n/dictionaries";
import { Locale } from "@/i18n/config";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <GlobalProgressProvider>
      <div className="flex min-h-screen w-full flex-col">
        <GlobalProgressBar />
        <Header dict={dict} lang={lang} />
        <main className="flex-1">{children}</main>
      </div>
    </GlobalProgressProvider>
  );
}
