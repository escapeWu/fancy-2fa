"use client";

import { useState } from "react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { RecoveryCodes } from "./recovery-codes";

type Setup2faDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSuccess: (name: string, issuer: string) => void;
};

export function Setup2faDialog({
  isOpen,
  setIsOpen,
  onSuccess,
}: Setup2faDialogProps) {
  const [step, setStep] = useState(1);
  const [accountName, setAccountName] = useState("");
  const [issuerName, setIssuerName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const { toast } = useToast();

  const qrCodeImage = PlaceHolderImages.find((img) => img.id === "qr-code");
  const secretKey = "ABCD EFGH IJKL MNOP QRST UVWX"; // Placeholder

  const handleNext = () => {
    if (step === 1 && (!accountName || !issuerName)) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please enter both an account and issuer name.",
        });
        return;
    }
    setStep((s) => s + 1);
  };
  
  const handleVerify = () => {
    // Dummy validation
    if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
        toast({
            title: "Verification Successful!",
            description: `2FA has been enabled for ${issuerName}.`,
        });
        setStep(s => s + 1);
    } else {
        toast({
            variant: "destructive",
            title: "Invalid Code",
            description: "Please enter a valid 6-digit code.",
        });
    }
  }

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
        setStep(1);
        setAccountName("");
        setIssuerName("");
        setVerificationCode("");
    }, 300);
  }
  
  const handleFinish = () => {
    onSuccess(accountName, issuerName);
    handleClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
              <DialogDescription>
                Scan the QR code with your authenticator app.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="issuer-name">Issuer</Label>
                      <Input id="issuer-name" placeholder="e.g., Google" value={issuerName} onChange={e => setIssuerName(e.target.value)} />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="account-name">Account</Label>
                      <Input id="account-name" placeholder="e.g., user@example.com" value={accountName} onChange={e => setAccountName(e.target.value)} />
                  </div>
              </div>
              <div className="flex justify-center">
                {qrCodeImage && (
                  <Image
                    src={qrCodeImage.imageUrl}
                    alt={qrCodeImage.description}
                    width={200}
                    height={200}
                    className="rounded-lg"
                    data-ai-hint={qrCodeImage.imageHint}
                  />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Or enter this key manually</p>
                <p className="font-mono bg-muted rounded-md p-2 mt-1 tracking-wider">
                  {secretKey}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
              <Button type="button" onClick={handleNext}>Next</Button>
            </DialogFooter>
          </>
        )}
        {step === 2 && (
            <>
                <DialogHeader>
                    <DialogTitle>Verify Code</DialogTitle>
                    <DialogDescription>Enter the 6-digit code from your authenticator app.</DialogDescription>
                </DialogHeader>
                <div className="py-4 flex flex-col items-center gap-4">
                    <Label htmlFor="verification-code" className="sr-only">Verification Code</Label>
                    <Input 
                        id="verification-code"
                        placeholder="123 456"
                        maxLength={7}
                        value={verificationCode}
                        onChange={e => setVerificationCode(e.target.value.replace(/\s/g, ''))}
                        className="text-2xl text-center font-mono tracking-widest h-14"
                    />
                </div>
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setStep(1)}>Back</Button>
                    <Button type="button" onClick={handleVerify}>Verify</Button>
                </DialogFooter>
            </>
        )}
        {step === 3 && (
            <>
                 <DialogHeader>
                    <DialogTitle>Save Your Recovery Codes</DialogTitle>
                    <DialogDescription>
                        Store these somewhere safe. You can use them to access your account if you lose your device.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <RecoveryCodes />
                </div>
                 <DialogFooter>
                    <Button type="button" onClick={handleFinish}>Done</Button>
                </DialogFooter>
            </>
        )}
      </DialogContent>
    </Dialog>
  );
}
