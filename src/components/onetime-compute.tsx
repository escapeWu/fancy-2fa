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
import { useToast } from "@/hooks/use-toast";
import { History, KeyRound, ShieldQuestion } from "lucide-react";
import type { Account } from "@/app/dashboard/page";

export function OnetimeCompute() {
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
        title: "Could not load history",
        description: "Your browser may not support local storage.",
      });
    }
  }, [toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim()) {
      toast({
        variant: "destructive",
        title: "Secret Key Required",
        description: "Please enter a secret key to generate a code.",
      });
      return;
    }

    const newAccount: Account = {
      id: new Date().toISOString(),
      name: secret.trim(),
      issuer: "One-Time",
      secretKey: secret.trim(),
    };

    setActiveAccount(newAccount);

    setHistory((prev) => {
      const newHistory = [
        newAccount,
        ...prev.filter((item) => item.name !== secret.trim()),
      ].slice(0, 5); // Keep last 5 unique keys
      try {
        localStorage.setItem("gg-onetime-history", JSON.stringify(newHistory));
      } catch (error) {
        console.error("Failed to save history to localStorage", error);
        toast({
            variant: "destructive",
            title: "Could not save history",
            description: "Your browser may not support local storage.",
          });
      }
      return newHistory;
    });

    setSecret("");
  };

  const handleHistoryClick = (account: Account) => {
    setActiveAccount(account);
  };
  
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good Morning";
    if (hours < 18) return "Good Afternoon";
    return "Good Evening";
  };


  return (
    <div className="container mx-auto max-w-2xl p-4 md:p-8 space-y-6">
        <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tighter">
                2FA Verification
            </h1>
            <p className="text-muted-foreground mt-2">
                Need a code in a pinch? Use this one-time generator.
            </p>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter Secret Key</CardTitle>
          <CardDescription>
            Click to enter your 2FA secret key to generate a one-time password. This key is only stored in your browser.
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
            <Button type="submit" className="w-full sm:w-auto">Generate</Button>
          </form>
        </CardContent>
      </Card>

      {activeAccount ? (
        <div id="code-display">
            <h2 className="text-xl font-bold font-headline mb-4">Secret Key Display Area</h2>
            <AccountCard key={activeAccount.id} account={activeAccount} />
        </div>
      ) : (
        <div className="text-center py-10 border-4 border-dashed border-destructive/50 rounded-xl">
          <ShieldQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-medium font-headline">SECRET KEY DISPLAY AREA</h3>
          <p className="mt-1 text-md text-muted-foreground">
            Your generated code will appear here.
          </p>
        </div>
      )}

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-6 w-6" />
              History of used 2FA
            </CardTitle>
            <CardDescription>
              Select a key to quickly generate a new code. Capped at 5 recent entries.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {history.map((item) => (
              <Button
                key={item.id}
                variant="outline"
                className="w-full justify-start font-mono"
                onClick={() => handleHistoryClick(item)}
              >
                <KeyRound className="mr-2" />
                <span className="truncate">{item.name}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
