"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download } from "lucide-react";

const mockCodes = [
  "f4d1-a2b3-c8e7",
  "g5h2-b3c4-d9f8",
  "h6i3-c4d5-e1g9",
  "i7j4-d5e6-f2h1",
  "j8k5-e6f7-g3i2",
  "k9l6-f7g8-h4j3",
  "l1m7-g8h9-i5k4",
  "m2n8-h9i1-j6l5",
];

export function RecoveryCodes() {
  const { toast } = useToast();

  const handleCopy = () => {
    const codesText = mockCodes.join("\n");
    navigator.clipboard.writeText(codesText).then(() => {
      toast({
        title: "Copied to clipboard!",
        description: "Your recovery codes have been copied.",
      });
    });
  };

  const handleDownload = () => {
    const codesText = mockCodes.join("\n");
    const blob = new Blob([codesText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "guardian-gate-recovery-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
        title: "Downloading...",
        description: "Your recovery codes are being downloaded.",
      });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 rounded-md border bg-muted p-4 font-mono text-sm">
        {mockCodes.map((code) => (
          <p key={code}>{code}</p>
        ))}
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="secondary" onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" />
          Copy all
        </Button>
        <Button variant="secondary" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  );
}
