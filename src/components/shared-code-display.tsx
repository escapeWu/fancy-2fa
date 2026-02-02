"use client";

import { useState, useEffect, useCallback } from "react";
import * as OTPAuth from "otpauth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GlobalProgressProvider, GlobalProgressBar, useGlobalProgress } from "@/components/dashboard/global-progress";
import type { Account } from "@/lib/db/interfaces";
import { KeyRound, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_PERIOD = 30;

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

interface SharedCodeDisplayProps {
  account: Account;
  dict: any;
}

function SharedCodeCard({ account, dict }: SharedCodeDisplayProps) {
  const [code, setCode] = useState("------");
  const [copied, setCopied] = useState(false);
  const { remaining: globalRemaining, progress: globalProgress } = useGlobalProgress();

  const period = account.period || DEFAULT_PERIOD;
  const isNonStandard = period !== DEFAULT_PERIOD;

  const [localRemaining, setLocalRemaining] = useState(period);
  const [localProgress, setLocalProgress] = useState(100);

  const generateCode = useCallback(() => {
    if (!account.secret) {
      setCode("------");
      return;
    }

    try {
      const totp = new OTPAuth.TOTP({
        issuer: account.issuer,
        label: account.account,
        algorithm: "SHA1",
        digits: 6,
        period: period,
        secret: OTPAuth.Secret.fromBase32(
          account.secret.replace(/\s/g, "").toUpperCase()
        ),
      });
      const token = totp.generate();
      setCode(token);
    } catch (error) {
      console.error("Error generating TOTP code:", error);
      setCode("Error!");
    }
  }, [account.issuer, account.account, account.secret, period]);

  useEffect(() => {
    generateCode();

    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = period - (now % period);

      if (isNonStandard) {
        setLocalRemaining(remaining);
        setLocalProgress((remaining / period) * 100);
      }

      if (now % period === 0) {
        generateCode();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [generateCode, period, isNonStandard]);

  const remaining = isNonStandard ? localRemaining : globalRemaining;
  const progress = isNonStandard ? localProgress : globalProgress;
  const textColor = getProgressColor(progress);

  const handleCopy = () => {
    if (code && code !== "------" && code !== "Error!") {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
      });
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start gap-3 space-y-0 p-4 pb-2">
        <div className="relative shrink-0 mt-0.5">
          <KeyRound className="w-6 h-6 text-green-500" />
          <Share2 className="absolute -top-1 -right-1 w-3 h-3 text-green-500" />
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="truncate text-lg">
            {account.account}
          </CardTitle>
          <CardDescription className="truncate text-xs">
            {account.issuer}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-center gap-3 p-4 pt-1 pb-3">
        <p
          onClick={handleCopy}
          className={cn(
            "text-2xl sm:text-3xl font-bold tracking-widest font-mono transition-all cursor-pointer select-none px-2 py-1 rounded",
            copied ? "bg-green-500/20 scale-105" : "hover:bg-muted active:scale-95",
            (!code || code === "------" || code === "Error!") && "pointer-events-none opacity-50"
          )}
          style={{ color: textColor }}
        >
          {code !== "Error!"
            ? `${code.slice(0, 3)} ${code.slice(3, 6)}`
            : "Error!"}
        </p>
        <span
          className="text-sm font-mono tabular-nums transition-colors"
          style={{ color: textColor }}
        >
          {remaining}s
        </span>
      </CardContent>
      <div className="px-4 pb-3">
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-1000 ease-linear"
            style={{
              width: `${progress}%`,
              backgroundColor: textColor,
            }}
          />
        </div>
      </div>
    </Card>
  );
}

export function SharedCodeDisplay({ account, dict }: SharedCodeDisplayProps) {
  return (
    <GlobalProgressProvider>
      <GlobalProgressBar />
      <div className="container mx-auto max-w-md p-4 md:p-8 pt-6 md:pt-10 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tighter">
            {dict.share?.title || "Shared Code"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {dict.share?.description || "This verification code has been shared with you."}
          </p>
        </div>

        <SharedCodeCard account={account} dict={dict} />

        <p className="text-center text-xs text-muted-foreground">
          {dict.share?.clickToCopy || "Click the code to copy"}
        </p>
      </div>
    </GlobalProgressProvider>
  );
}
