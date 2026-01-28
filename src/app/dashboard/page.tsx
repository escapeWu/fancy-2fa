"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, ShieldCheck } from "lucide-react";
import { Setup2faDialog } from "@/components/dashboard/setup-2fa-dialog";
import { AccountCard } from "@/components/dashboard/account-card";

export type Account = {
  id: string;
  name: string;
  issuer: string;
};

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddAccount = (name: string, issuer: string) => {
    const newAccount: Account = {
      id: new Date().toISOString(),
      name,
      issuer,
    };
    setAccounts((prev) => [...prev, newAccount]);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold font-headline">
          Authenticator Codes
        </h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No accounts yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add an account to start generating secure codes.
          </p>
          <div className="mt-6">
            <Button onClick={() => setIsDialogOpen(true)}>
              Enable 2FA for an Account
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}

      <Setup2faDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        onSuccess={handleAddAccount}
      />
    </div>
  );
}
