"use client";

import { useState } from "react";
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
  const { toast } = useToast();

  const secretKey = "ABCD EFGH IJKL MNOP QRST UVWX"; // Placeholder

  const handleNext = () => {
    if (step === 1) {
      if (!accountName || !issuerName) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please enter both an account and issuer name.",
        });
        return;
      }
      toast({
          title: "Account Ready",
          description: `2FA is ready for ${issuerName}. Save your recovery codes.`,
      });
      setStep(2); // Move to recovery codes
    }
  };
  
  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
        setStep(1);
        setAccountName("");
        setIssuerName("");
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
                Enter account details and the secret key in your authenticator app.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-4">
                  <div className="space-y-2">
                      <Label htmlFor="issuer-name">Issuer</Label>
                      <Input id="issuer-name" placeholder="e.g., Google" value={issuerName} onChange={e => setIssuerName(e.target.value)} />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="account-name">Account</Label>
                      <Input id="account-name" placeholder="e.g., user@example.com" value={accountName} onChange={e => setAccountName(e.target.value)} />
                  </div>
              </div>
              
              <div className="space-y-2 pt-4 text-center">
                <Label htmlFor="secret-key" className="text-muted-foreground">Secret Key</Label>
                <Input
                  id="secret-key"
                  readOnly
                  value={secretKey}
                  className="font-mono tracking-wider text-center"
                />
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
