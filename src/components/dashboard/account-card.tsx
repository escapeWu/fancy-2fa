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
import { Badge } from "@/components/ui/badge";
import type { Account } from "@/lib/db/interfaces";
import { KeyRound, X, Pencil, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteAccount, createShareLink, deleteShareLink } from "@/lib/actions";
import { useGlobalProgress } from "./global-progress";
import { cn } from "@/lib/utils";

const DEFAULT_PERIOD = 30;

// Same color calculation as progress bar
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

interface AccountCardProps {
  account: Account;
  compact?: boolean;
  onEdit?: (account: Account) => void;
  dict: any;
}

export function AccountCard({ account, compact = false, onEdit, dict }: AccountCardProps) {
  const [code, setCode] = useState("------");
  const [copied, setCopied] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedRemark, setCopiedRemark] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { remaining: globalRemaining, progress: globalProgress } = useGlobalProgress();
  const { toast } = useToast();

  // Support non-standard periods
  const period = account.period || DEFAULT_PERIOD;
  const isNonStandard = period !== DEFAULT_PERIOD;

  // For non-standard periods, track local progress
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
      toast({
        variant: "destructive",
        title: dict.dashboard.invalidSecretTitle,
        description: dict.dashboard.invalidSecretDesc,
      });
    }
  }, [account.issuer, account.account, account.secret, period, toast]);

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
        toast({
          title: dict.dashboard.copied,
          description: dict.dashboard.copiedDesc.replace("{issuer}", account.issuer),
        });
        setTimeout(() => setCopied(false), 1000);
      });
    }
  };

  const handleCopyAccount = () => {
    if (account.account) {
      navigator.clipboard.writeText(account.account).then(() => {
        setCopiedAccount(true);
        toast({
          title: dict.dashboard.copied,
          description: dict.dashboard.copiedAccountDesc.replace("{account}", account.account),
        });
        setTimeout(() => setCopiedAccount(false), 1000);
      });
    }
  };

  const handleCopyRemark = () => {
    if (account.remark) {
      navigator.clipboard.writeText(account.remark).then(() => {
        setCopiedRemark(true);
        toast({
          title: dict.dashboard.copied,
          description: dict.dashboard.copiedRemarkDesc.replace("{remark}", account.remark),
        });
        setTimeout(() => setCopiedRemark(false), 1000);
      });
    }
  };

  const handleDelete = async () => {
    if (confirm(dict.dashboard.confirmDelete)) {
      try {
        if (account.id) {
            await deleteAccount(account.id);
            toast({
              title: dict.dialog.accountDeletedTitle,
              description: dict.dialog.accountDeletedDesc,
            });
        }
      } catch (error) {
        toast({
            variant: "destructive",
            title: dict.dialog.errorTitle,
            description: dict.dialog.deleteErrorDesc,
        });
      }
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    if (!account.id) return;
    setIsSharing(true);
    try {
      if (account.share_link) {
        // Shift+click to remove share link
        if (e.shiftKey) {
          await deleteShareLink(account.id);
          toast({
            title: dict.share?.removedTitle || "Share Removed",
            description: dict.share?.removedDesc || "The share link has been removed.",
          });
        } else {
          // Normal click: copy existing link
          const shareUrl = `${window.location.origin}${window.location.pathname.split('/').slice(0, 2).join('/')}/s/${account.share_link}`;
          await navigator.clipboard.writeText(shareUrl);
          toast({
            title: dict.share?.copiedTitle || "Link Copied",
            description: (
              <div className="flex flex-col gap-1">
                <span>{dict.share?.copiedDesc || "The share link has been copied to clipboard."}</span>
                <span className="text-xs text-purple-500 font-medium">{dict.share?.copiedHint || "Shift + Click to remove share link"}</span>
              </div>
            ),
          });
        }
      } else {
        // Create share link
        const shareLink = await createShareLink(account.id);
        const shareUrl = `${window.location.origin}${window.location.pathname.split('/').slice(0, 2).join('/')}/s/${shareLink.short_link}`;
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: dict.share?.createdTitle || "Share Link Created",
          description: dict.share?.createdDesc || "The share link has been copied to clipboard.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: dict.dialog.errorTitle,
        description: dict.share?.errorDesc || "Failed to update share link.",
      });
    } finally {
      setIsSharing(false);
    }
  };

  // Compact mode - single row layout
  if (compact) {
    return (
      <Card className="flex items-center relative group px-3 md:px-4 py-2 md:py-3 gap-2 md:gap-4">
        <div className="absolute top-1/2 -translate-y-1/2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card shadow-sm border rounded-md p-1 z-10">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-6 w-6",
              account.share_link ? "text-green-500 hover:text-green-600" : "text-muted-foreground hover:text-primary"
            )}
            onClick={handleShare}
            disabled={isSharing}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-primary"
              onClick={() => onEdit(account)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative shrink-0">
          <KeyRound className={cn("w-5 h-5 md:w-6 md:h-6 shrink-0", account.share_link ? "text-green-500" : "text-accent")} />
          {account.share_link && (
            <Share2 className="absolute -top-1 -right-1 w-3 h-3 text-green-500" />
          )}
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-baseline gap-1 md:gap-2 flex-wrap md:flex-nowrap">
            <span
              onClick={handleCopyAccount}
              className={cn(
                "font-bold text-sm md:text-base truncate max-w-[120px] md:max-w-none cursor-pointer transition-all rounded px-1",
                copiedAccount ? "bg-green-500/20 scale-105" : "hover:bg-muted active:scale-95"
              )}
            >
              {account.account}
            </span>
            <span className="text-xs md:text-sm text-muted-foreground truncate">{account.issuer}</span>
            {account.remark && (
              <span
                onClick={handleCopyRemark}
                className={cn(
                  "text-xs md:text-sm text-yellow-500 truncate cursor-pointer transition-all rounded px-1 hidden sm:inline",
                  copiedRemark ? "bg-green-500/20 scale-105" : "hover:bg-muted active:scale-95"
                )}
              >
                {account.remark}
              </span>
            )}
          </div>
        </div>
        <div
          onClick={handleCopy}
          className={cn(
            "text-xl md:text-2xl font-bold tracking-widest font-mono cursor-pointer transition-all select-none px-1 md:px-2 py-1 rounded shrink-0",
            copied ? "bg-green-500/20 scale-105" : "hover:bg-muted active:scale-95",
            (!code || code === "------" || code === "Error!") && "pointer-events-none opacity-50"
          )}
          style={{ color: textColor }}
        >
          {code !== "Error!" ? `${code.slice(0, 3)} ${code.slice(3, 6)}` : "Error!"}
        </div>
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <div className="w-10 md:w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-1000 ease-linear"
              style={{
                width: `${progress}%`,
                backgroundColor: textColor,
              }}
            />
          </div>
          <span
            className="text-[10px] md:text-xs font-mono tabular-nums w-5 md:w-6 text-right"
            style={{ color: textColor }}
          >
            {remaining}s
          </span>
        </div>
      </Card>
    );
  }

  // Normal card mode - compact layout
  return (
    <Card className="flex flex-col relative group">
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-6 w-6",
              account.share_link ? "text-green-500 hover:text-green-600" : "text-muted-foreground hover:text-primary"
            )}
            onClick={handleShare}
            disabled={isSharing}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-primary"
              onClick={() => onEdit(account)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      <CardHeader className="flex-row items-start gap-2 md:gap-3 space-y-0 p-3 md:p-4 pb-1 md:pb-2 pr-8">
        <div className="relative shrink-0 mt-0.5">
          <KeyRound className={cn("w-5 h-5 md:w-6 md:h-6", account.share_link ? "text-green-500" : "text-accent")} />
          {account.share_link && (
            <Share2 className="absolute -top-1 -right-1 w-3 h-3 text-green-500" />
          )}
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <CardTitle
            onClick={handleCopyAccount}
            className={cn(
              "truncate text-base md:text-lg cursor-pointer transition-all rounded px-1 inline-block max-w-full",
              copiedAccount ? "bg-green-500/20 scale-105" : "hover:bg-muted active:scale-95"
            )}
          >
            {account.account}
          </CardTitle>
          <CardDescription className="truncate text-xs">
            {account.issuer}
            {account.remark && (
              <span
                onClick={handleCopyRemark}
                className={cn(
                  "ml-2 text-yellow-500 cursor-pointer transition-all rounded px-1",
                  copiedRemark ? "bg-green-500/20 scale-105" : "hover:bg-muted active:scale-95"
                )}
              >
                {account.remark}
              </span>
            )}
          </CardDescription>
          {account.tags && account.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {account.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className={`text-[10px] px-1 py-0 h-4 border-0 rounded-none ${tag.color || 'bg-gray-100 text-gray-800'}`}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-center gap-2 md:gap-3 p-3 md:p-4 pt-1 pb-2 md:pb-3">
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
      {isNonStandard && (
        <div className="px-3 md:px-4 pb-2 md:pb-3">
          <Progress
            value={progress}
            aria-label={`${Math.round(progress)}% time remaining`}
            className="h-1"
          />
        </div>
      )}
    </Card>
  );
}
