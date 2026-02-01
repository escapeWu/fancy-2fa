"use client";

import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { login } from "@/lib/auth-actions";
import { useState } from "react";
import { Locale } from "@/i18n/config";

// We'll pass the dictionary as props or use a client-side context/hook in a real large app.
// For simplicity, we can pass props from the parent server component.

export function LoginForm({ dict, lang }: { dict: any, lang: Locale }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;

    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    formData.append("lang", lang); // Pass language to server action

    const result = await login(formData);

    if (result?.error) {
      setError(dict.login.error); // Use translated error
      setIsLoading(false);
    }
    // If successful, the server action will redirect, so we don't need to set loading to false
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">{dict.login.title}</CardTitle>
        <CardDescription>
          Enter your secret key to continue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="secretKey">{dict.login.passwordLabel}</Label>
            <div className="relative">
              <Input
                id="secretKey"
                name="secretKey"
                type={showSecretKey ? "text" : "password"}
                placeholder="Enter your secret key"
                required
                className="pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowSecretKey(!showSecretKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={isLoading}
              >
                {showSecretKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showSecretKey ? "Hide secret key" : "Show secret key"}
                </span>
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Lock className="mr-2 h-4 w-4" />
            )}
            {isLoading ? dict.login.loading : dict.login.submit}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
