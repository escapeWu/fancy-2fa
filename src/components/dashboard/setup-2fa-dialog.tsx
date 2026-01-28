"use client";

import { useState, useEffect } from "react";
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

type Setup2faDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSuccess: (name: string, issuer: string, secretKey: string) => void;
};

export function Setup2faDialog({
  isOpen,
  setIsOpen,
  onSuccess,
}: Setup2faDialogProps) {
  const [accountName, setAccountName] = useState("");
  const [issuerName, setIssuerName] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setAccountName("");
        setIssuerName("");
        setSecretKey("");
      }, 300); // Delay to allow exit animation
      return () => clearTimeout(timer);
    }
  }, [isOpen]);


  const handleNext = () => {
    if (!accountName || !issuerName || !secretKey) {
      toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please fill out all fields.",
      });
      return;
    }
    onSuccess(accountName, issuerName, secretKey);
    toast({
        title: "Account Added",
        description: `The account for ${issuerName} was added.`,
    });
    setIsOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add 2FA Account</DialogTitle>
          <DialogDescription>
            Enter your account details and the secret key from your provider.
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
              <div className="space-y-2">
                  <Label htmlFor="secret-key">Secret Key</Label>
                  <Input
                    id="secret-key"
                    placeholder="Enter your secret key"
                    value={secretKey}
                    onChange={e => setSecretKey(e.target.value)}
                    className="font-mono tracking-wider"
                  />
              </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="button" onClick={handleNext}>Next</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
