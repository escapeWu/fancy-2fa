"use client";

import { useState, useEffect, useRef } from "react";
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

import { Tag, Account } from "@/lib/db/interfaces";
import { TagSelector } from "./tag-selector";

type Setup2faDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSuccess: (name: string, issuer: string, secretKey: string, tags: Tag[]) => void | Promise<void>;
  editAccount?: Account | null;
  dict: any;
};

export function Setup2faDialog({
  isOpen,
  setIsOpen,
  onSuccess,
  editAccount,
  dict,
}: Setup2faDialogProps) {
  const [accountName, setAccountName] = useState("");
  const [issuerName, setIssuerName] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [dialogContainer, setDialogContainer] = useState<HTMLDivElement | null>(null);
  const { toast } = useToast();

  const isEditMode = !!editAccount;

  useEffect(() => {
    if (isOpen && editAccount) {
      setAccountName(editAccount.account);
      setIssuerName(editAccount.issuer);
      setSecretKey(editAccount.secret);
      setSelectedTags(editAccount.tags || []);
    } else if (!isOpen) {
      const timer = setTimeout(() => {
        setAccountName("");
        setIssuerName("");
        setSecretKey("");
        setSelectedTags([]);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, editAccount]);


  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    if (!accountName || !issuerName || !secretKey) {
      toast({
          variant: "destructive",
          title: dict.dialog.missingInfoTitle,
          description: dict.dialog.missingInfoDesc,
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSuccess(accountName, issuerName, secretKey, selectedTags);
      setIsOpen(false);
    } catch (error) {
       // Let the parent handle the error toast if needed, or do it here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md" ref={setDialogContainer} onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{isEditMode ? dict.dialog.editTitle : dict.dialog.addTitle}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? dict.dialog.editDescription
              : dict.dialog.addDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="issuer-name">{dict.dialog.issuerLabel}</Label>
                  <Input
                    id="issuer-name"
                    placeholder={dict.dialog.issuerPlaceholder}
                    value={issuerName}
                    onChange={e => setIssuerName(e.target.value)}
                    disabled={isLoading}
                  />
              </div>
                <div className="space-y-2">
                  <Label htmlFor="account-name">{dict.dialog.accountLabel}</Label>
                  <Input
                    id="account-name"
                    placeholder={dict.dialog.accountPlaceholder}
                    value={accountName}
                    onChange={e => setAccountName(e.target.value)}
                    disabled={isLoading}
                  />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="secret-key">{dict.dialog.secretLabel}</Label>
                  <Input
                    id="secret-key"
                    placeholder={dict.dialog.secretPlaceholder}
                    value={secretKey}
                    onChange={e => setSecretKey(e.target.value)}
                    className="font-mono tracking-wider"
                    disabled={isLoading}
                  />
              </div>
              <div className="space-y-2">
                  <Label>{dict.dialog.tagsLabel}</Label>
                  <TagSelector selectedTags={selectedTags} onTagsChange={setSelectedTags} container={dialogContainer} dict={dict} />
              </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} disabled={isLoading}>{dict.dashboard.cancel}</Button>
          <Button type="button" onClick={handleNext} disabled={isLoading}>
            {isLoading ? dict.dialog.saving : isEditMode ? dict.dialog.save : dict.dialog.next}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
