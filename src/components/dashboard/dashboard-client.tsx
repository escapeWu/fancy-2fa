"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, ShieldCheck, ChevronDown, Check, LayoutGrid, List, Search, Filter, X, MoreHorizontal, Download, Upload, ArrowUpDown } from "lucide-react";
import { Setup2faDialog } from "@/components/dashboard/setup-2fa-dialog";
import { AccountCard } from "@/components/dashboard/account-card";
import { Account, Tag } from "@/lib/db/interfaces";
import { createAccount, updateAccount, getTags, bulkCreateAccounts } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type ViewMode = "grid" | "compact";

interface DashboardClientProps {
  initialAccounts: Account[];
  dict: any;
  lang: string;
}

const STORAGE_KEYS = {
  VIEW_MODE: 'fancy-2fa-view-mode',
  SORT_MODE: 'fancy-2fa-sort-mode',
} as const;

export function DashboardClient({ initialAccounts, dict, lang }: DashboardClientProps) {
  const accounts = initialAccounts;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [selectedIssuer, setSelectedIssuer] = useState<string>("ALL");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
      if (saved === 'grid' || saved === 'compact') return saved;
    }
    return 'grid';
  });
  const [sortMode, setSortMode] = useState<'time' | 'name'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.SORT_MODE);
      if (saved === 'time' || saved === 'name') return saved;
    }
    return 'time';
  });
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persist viewMode to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, viewMode);
  }, [viewMode]);

  // Persist sortMode to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SORT_MODE, sortMode);
  }, [sortMode]);

  const handleExport = () => {
    const headers = ['issuer', 'account', 'secret', 'remark'];
    const csvContent = [
      headers.join(','),
      ...accounts.map(a => {
        const escape = (str: string) => {
             if (!str) return '';
             if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
             }
             return str;
        };
        return `${escape(a.issuer)},${escape(a.account)},${escape(a.secret)},${escape(a.remark || '')}`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', '2fa_accounts.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(line => line.trim());
      // Skip header if it exists
      const startIndex = lines[0].toLowerCase().startsWith('issuer,') ? 1 : 0;

      const newAccounts = [];
      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (parts.length >= 3) {
            const clean = (s: string) => s ? s.trim().replace(/^"|"$/g, '').replace(/""/g, '"') : '';
            newAccounts.push({
                issuer: clean(parts[0]),
                account: clean(parts[1]),
                secret: clean(parts[2]),
                remark: parts.length >= 4 ? clean(parts[3]) : ''
            });
        }
      }

      if (newAccounts.length > 0) {
          try {
            const count = await bulkCreateAccounts(newAccounts);
            toast({
                title: dict.dashboard.importSuccessTitle,
                description: dict.dashboard.importSuccessDesc.replace("{count}", count.toString()),
            });
        } catch (error) {
            console.error("Import failed", error);
            toast({
                variant: "destructive",
                title: dict.dashboard.importFailedTitle,
                description: dict.dashboard.importFailedDesc,
            });
        }
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    getTags().then(setAvailableTags).catch(console.error);
  }, []);

  // Extract unique issuers
  const issuers = useMemo(() => {
    const uniqueIssuers = [...new Set(accounts.map((a) => a.issuer))];
    return uniqueIssuers.sort();
  }, [accounts]);

  // Group accounts by issuer
  const groupedAccounts = useMemo(() => {
    const groups: Record<string, Account[]> = {};
    for (const account of accounts) {
      if (!groups[account.issuer]) {
        groups[account.issuer] = [];
      }
      groups[account.issuer].push(account);
    }
    return groups;
  }, [accounts]);

  // Filter accounts based on selected issuer, search query and tags
  const filteredAccounts = useMemo(() => {
    let result = [...accounts]; // Create a copy to avoid mutating the original

    // Filter by issuer
    if (selectedIssuer !== "ALL") {
      result = result.filter((a) => a.issuer === selectedIssuer);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      result = result.filter((a) =>
        selectedTags.every(tagId => a.tags?.some(t => t.id === tagId))
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.issuer?.toLowerCase().includes(query) ||
          a.account?.toLowerCase().includes(query)
      );
    }

    // Sort accounts
    result.sort((a, b) => {
      if (sortMode === 'time') {
         // Sort by created_at (descending)
         return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      } else {
         // Sort by Issuer then Account (ascending)
         const issuerComp = a.issuer.localeCompare(b.issuer);
         if (issuerComp !== 0) return issuerComp;
         return a.account.localeCompare(b.account);
      }
    });

    return result;
  }, [accounts, selectedIssuer, searchQuery, selectedTags, sortMode]);

  // Group filtered accounts by issuer for display
  const filteredGroupedAccounts = useMemo(() => {
    const groups: Record<string, Account[]> = {};
    for (const account of filteredAccounts) {
      if (!groups[account.issuer]) {
        groups[account.issuer] = [];
      }
      groups[account.issuer].push(account);
    }
    return groups;
  }, [filteredAccounts]);

  // Get issuers that have filtered accounts
  const filteredIssuers = useMemo(() => {
    const issuers = Object.keys(filteredGroupedAccounts);
    if (sortMode === 'name') {
       return issuers.sort();
    } else {
       // Sort issuers by the latest account in that group
       return issuers.sort((a, b) => {
           const groupA = filteredGroupedAccounts[a];
           const groupB = filteredGroupedAccounts[b];
           // Accounts in filteredGroupedAccounts are already sorted by filteredAccounts logic
           // so groupX[0] is the first item according to sortMode.
           // If sortMode is 'time', groupX[0] is the newest.
           const latestA = groupA[0]?.created_at || '';
           const latestB = groupB[0]?.created_at || '';
           return new Date(latestB).getTime() - new Date(latestA).getTime();
       });
    }
  }, [filteredGroupedAccounts, sortMode]);

  const handleAddAccount = async (accountName: string, issuer: string, secret: string, tags: Tag[], remark: string) => {
    try {
      if (editAccount && editAccount.id) {
        await updateAccount(editAccount.id, issuer, accountName, secret, tags, remark);
        toast({
          title: dict.dialog.accountUpdatedTitle,
          description: dict.dialog.accountUpdatedDesc.replace("{issuer}", issuer),
        });
      } else {
        await createAccount(issuer, accountName, secret, tags, remark);
        toast({
          title: dict.dialog.accountAddedTitle,
          description: dict.dialog.accountAddedDesc.replace("{issuer}", issuer),
        });
      }
    } catch (error) {
      console.error("Failed to save account:", error);
      toast({
        variant: "destructive",
        title: dict.dialog.errorTitle,
        description: dict.dialog.errorDesc,
      });
      throw error;
    }
  };

  const handleEditAccount = (account: Account) => {
    setEditAccount(account);
    setIsDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditAccount(null);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center text-2xl md:text-3xl font-bold font-headline cursor-pointer hover:opacity-80 focus:outline-none">
            {selectedIssuer === "ALL" ? "ALL" : selectedIssuer}
            <ChevronDown className="ml-2 h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="border-2 shadow-hard min-w-[150px]">
            <DropdownMenuItem onClick={() => setSelectedIssuer("ALL")}>
              {selectedIssuer === "ALL" && <Check className="mr-2 h-4 w-4" />}
              <span className={selectedIssuer !== "ALL" ? "ml-6" : ""}>ALL</span>
            </DropdownMenuItem>
            {issuers.map((issuer) => (
              <DropdownMenuItem key={issuer} onClick={() => setSelectedIssuer(issuer)}>
                {selectedIssuer === issuer && <Check className="mr-2 h-4 w-4" />}
                <span className={selectedIssuer !== issuer ? "ml-6" : ""}>{issuer}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-9 px-3 border-2 ml-2">
              <Filter className="mr-2 h-4 w-4" />
              {dict.dialog.tagsLabel}
              {selectedTags.length > 0 && (
                <>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                    {selectedTags.length}
                  </Badge>
                  <div className="hidden space-x-1 lg:flex">
                    {selectedTags.length > 2 ? (
                      <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                        {selectedTags.length} selected
                      </Badge>
                    ) : (
                      availableTags
                        .filter((tag) => selectedTags.includes(tag.id))
                        .map((tag) => (
                          <Badge
                            variant="secondary"
                            key={tag.id}
                            className="rounded-sm px-1 font-normal"
                          >
                            {tag.name}
                          </Badge>
                        ))
                    )}
                  </div>
                  <div
                    className="ml-1 rounded-full p-0.5 hover:bg-secondary hover:text-primary z-50 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTags([]);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <X className="h-3 w-3" />
                  </div>
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
             <DropdownMenuLabel>{dict.dashboard.filterTags}</DropdownMenuLabel>
             <DropdownMenuSeparator />
             {availableTags.length === 0 && (
                <div className="p-2 text-sm text-muted-foreground">{dict.dashboard.noTags}</div>
             )}
             {availableTags.map(tag => (
                <DropdownMenuCheckboxItem
                  key={tag.id}
                  checked={selectedTags.includes(tag.id)}
                  onSelect={(e) => e.preventDefault()}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedTags([...selectedTags, tag.id]);
                    } else {
                      setSelectedTags(selectedTags.filter(id => id !== tag.id));
                    }
                  }}
                >
                  {tag.name}
                </DropdownMenuCheckboxItem>
             ))}
             {selectedTags.length > 0 && (
               <>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem onSelect={() => setSelectedTags([])} className="justify-center text-center cursor-pointer">
                   {dict.dashboard.clearFilters}
                 </DropdownMenuItem>
               </>
             )}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="relative w-full order-last md:order-none md:flex-1 md:max-w-md lg:max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={dict.dashboard.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-2 w-full"
          />
        </div>
          <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleImport} />
          <div className="flex items-center gap-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="mr-2 border-2">
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{dict.dashboard.sortBy}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={sortMode === 'time'} onCheckedChange={() => setSortMode('time')}>
                {dict.dashboard.sortTime}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={sortMode === 'name'} onCheckedChange={() => setSortMode('name')}>
                {dict.dashboard.sortName}
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center border-2 rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              className="rounded-none h-9 w-9"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "compact" ? "default" : "ghost"}
              size="icon"
              className="rounded-none h-9 w-9"
              onClick={() => setViewMode("compact")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          {accounts.length > 0 && (
            <div className="flex gap-2">
            <Button onClick={() => setIsDialogOpen(true)} className="rounded-full px-3 sm:px-4">
              <PlusCircle className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{dict.dashboard.addAccount}</span>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" /> {dict.dashboard.importCSV}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> {dict.dashboard.exportCSV}
                  </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-16 border-4 border-dashed border-destructive/50 rounded-xl">
          <ShieldCheck className="mx-auto h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-2xl font-medium font-headline">{dict.dashboard.emptyTitle}</h3>
          <p className="mt-2 text-md text-muted-foreground">
            {dict.dashboard.emptyDesc}
          </p>
          <div className="mt-6 flex gap-2 justify-center">
            <Button onClick={() => setIsDialogOpen(true)} className="rounded-full">
              {dict.dashboard.secureAccount}
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="rounded-full">
              <Upload className="mr-2 h-4 w-4" /> {dict.dashboard.importCSV}
            </Button>
          </div>
        </div>
      ) : selectedIssuer === "ALL" ? (
        // Grouped view when showing all
        <div className="space-y-8">
          {filteredIssuers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {dict.dashboard.noAccountsFound.replace("{query}", searchQuery)}
            </div>
          ) : (
            filteredIssuers.map((issuer) => (
              <div key={issuer}>
                <h2 className="text-xl font-bold font-headline text-primary mb-4">{issuer}</h2>
                <div className={viewMode === "compact" ? "space-y-2" : "grid gap-4 md:grid-cols-2 lg:grid-cols-3"}>
                  {filteredGroupedAccounts[issuer]?.map((account) => (
                    <AccountCard key={account.id} account={account} compact={viewMode === "compact"} onEdit={handleEditAccount} dict={dict} />
                  ))}
                </div>
                <hr className="mt-6 border-t-2 border-primary/30" />
              </div>
            ))
          )}
        </div>
      ) : (
        // Filtered view when specific issuer selected
        <div className={viewMode === "compact" ? "space-y-2" : "grid gap-4 md:grid-cols-2 lg:grid-cols-3"}>
          {filteredAccounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground col-span-full">
              {dict.dashboard.noAccountsFound.replace("{query}", searchQuery)}
            </div>
          ) : (
            filteredAccounts.map((account) => (
              <AccountCard key={account.id} account={account} compact={viewMode === "compact"} onEdit={handleEditAccount} dict={dict} />
            ))
          )}
        </div>
      )}

      <Setup2faDialog
        isOpen={isDialogOpen}
        setIsOpen={handleDialogClose}
        onSuccess={handleAddAccount}
        editAccount={editAccount}
        dict={dict}
      />
    </div>
  );
}
