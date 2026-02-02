"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AccountCard } from "@/components/dashboard/account-card";
import { GlobalProgressProvider, GlobalProgressBar } from "@/components/dashboard/global-progress";
import { useToast } from "@/hooks/use-toast";
import { History, KeyRound, ShieldQuestion, X } from "lucide-react";
import type { Account } from "@/lib/db/interfaces";

export function OnetimeCompute({ dict }: { dict: any }) {
  const [secret, setSecret] = useState("");
  const [activeAccount, setActiveAccount] = useState<Account | null>(null);
  const [history, setHistory] = useState<Account[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("gg-onetime-history");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
      toast({
        variant: "destructive",
        title: dict.onetime.loadErrorTitle,
        description: dict.onetime.storageErrorDesc,
      });
    }
  }, [toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim()) {
      toast({
        variant: "destructive",
        title: dict.onetime.secretRequiredTitle,
        description: dict.onetime.secretRequiredDesc,
      });
      return;
    }

    const newAccount: Account = {
      id: Date.now(),
      account: secret.trim(),
      issuer: "One-Time",
      secret: secret.trim(),
    };

    setActiveAccount(newAccount);

    setHistory((prev) => {
      const newHistory = [
        newAccount,
        ...prev.filter((item) => item.secret !== secret.trim()),
      ].slice(0, 5); // Keep last 5 unique keys
      try {
        localStorage.setItem("gg-onetime-history", JSON.stringify(newHistory));
      } catch (error) {
        console.error("Failed to save history to localStorage", error);
        toast({
            variant: "destructive",
            title: dict.onetime.saveErrorTitle,
            description: dict.onetime.storageErrorDesc,
          });
      }
      return newHistory;
    });

    setSecret("");
  };

  const handleHistoryClick = (account: Account) => {
    setActiveAccount(account);
  };

  const handleDeleteHistory = (e: React.MouseEvent, accountId: number | undefined) => {
    e.stopPropagation();
    setHistory((prev) => {
      const newHistory = prev.filter((item) => item.id !== accountId);
      try {
        localStorage.setItem("gg-onetime-history", JSON.stringify(newHistory));
      } catch (error) {
        console.error("Failed to save history to localStorage", error);
      }
      return newHistory;
    });
    if (activeAccount?.id === accountId) {
      setActiveAccount(null);
    }
  };
  
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good Morning";
    if (hours < 18) return "Good Afternoon";
    return "Good Evening";
  };


  return (
    <GlobalProgressProvider>
      <GlobalProgressBar />
      <div className="container mx-auto max-w-2xl p-3 md:p-8 pt-4 md:pt-10 space-y-4 md:space-y-6">
        <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-bold font-headline tracking-tighter">
                {dict.onetime.title}
            </h1>
            <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
                {dict.onetime.description}
            </p>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>{dict.onetime.enterKeyTitle}</CardTitle>
          <CardDescription>
            {dict.onetime.enterKeyDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="e.g., JBSWY3DPEHPK3PXP"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="font-mono flex-1"
            />
            <Button type="submit" className="w-full sm:w-auto">{dict.onetime.generate}</Button>
          </form>
        </CardContent>
      </Card>

      {activeAccount ? (
        <div id="code-display">
            <h2 className="text-xl font-bold font-headline mb-4">{dict.onetime.displayTitle}</h2>
            <AccountCard key={activeAccount.id} account={activeAccount} dict={dict} />
        </div>
      ) : (
        <div className="text-center py-10 border-4 border-dashed border-destructive/50 rounded-xl">
          <ShieldQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-medium font-headline">{dict.onetime.displayEmptyTitle}</h3>
          <p className="mt-1 text-md text-muted-foreground">
            {dict.onetime.displayEmptyDesc}
          </p>
        </div>
      )}

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-6 w-6" />
              {dict.onetime.historyTitle}
            </CardTitle>
            <CardDescription>
              {dict.onetime.historyDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {history.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="flex-1 justify-start font-mono text-xs md:text-sm px-2 md:px-4 h-9 md:h-10 min-w-0"
                  onClick={() => handleHistoryClick(item)}
                >
                  <KeyRound className="mr-1 md:mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">{item.account}</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 text-red-500 hover:bg-red-500 hover:text-white border-red-500 h-9 w-9 md:h-10 md:w-10"
                  onClick={(e) => handleDeleteHistory(e, item.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
    </GlobalProgressProvider>
  );
}
