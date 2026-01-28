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
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { Account } from "@/app/dashboard/page";
import { Copy, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CODE_LIFESPAN = 30; // seconds

export function AccountCard({ account }: { account: Account }) {
  const [code, setCode] = useState("------");
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const generateCode = useCallback(() => {
    if (!account.secretKey) {
      setCode("------");
      return;
    }

    try {
      // The secret is commonly Base32 encoded, and may contain spaces.
      // The library will handle decoding.
      const totp = new OTPAuth.TOTP({
        issuer: account.issuer,
        label: account.name,
        algorithm: "SHA1",
        digits: 6,
        period: CODE_LIFESPAN,
        secret: OTPAuth.Secret.fromBase32(account.secretKey.replace(/\s/g, "")),
      });
      const token = totp.generate();
      setCode(token);
    } catch (error) {
      console.error("Error generating TOTP code:", error);
      setCode("Error!");
      toast({
        variant: "destructive",
        title: "Invalid Secret Key",
        description:
          "Could not generate a code. Please check the secret key and try again.",
      });
    }
  }, [account.issuer, account.name, account.secretKey, toast]);

  useEffect(() => {
    // Generate code immediately
    generateCode();

    // Set up a timer to regenerate code and update progress
    const timer = setInterval(() => {
      const seconds = new Date().getSeconds();
      const remaining = CODE_LIFESPAN - (seconds % CODE_LIFESPAN);
      const newProgress = (remaining / CODE_LIFESPAN) * 100;

      // Regenerate when the code is about to expire
      if (seconds % CODE_LIFESPAN === 0) {
        generateCode();
      }

      setProgress(newProgress);
    }, 1000);

    return () => clearInterval(timer);
  }, [generateCode]);

  const handleCopy = () => {
    if (code && code !== "------" && code !== "Error!") {
      navigator.clipboard.writeText(code).then(() => {
        toast({
          title: "Copied to clipboard!",
          description: `The code for ${account.issuer} has been copied.`,
        });
      });
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start gap-4 space-y-0">
        <KeyRound className="w-8 h-8 text-accent" />
        <div className="flex-1">
          <CardTitle>{account.issuer}</CardTitle>
          <CardDescription>{account.name}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 justify-center items-center gap-4 text-center">
        <div className="flex-1">
          <p className="text-3xl sm:text-4xl font-bold tracking-widest text-primary font-mono">
            {code !== "Error!"
              ? `${code.slice(0, 3)} ${code.slice(3, 6)}`
              : "Error!"}
          </p>
        </div>
        <div className="w-full space-y-2">
          <Progress
            value={progress}
            aria-label={`${Math.round(progress)}% time remaining`}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={!code || code === "------" || code === "Error!"}
            className="text-muted-foreground"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
