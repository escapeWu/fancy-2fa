"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Tag } from "@/lib/db/interfaces";
import { createTag, getTags, deleteTag } from "@/lib/actions";
import { cn } from "@/lib/utils";

interface TagSelectorProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  container?: HTMLElement | null;
}

export function TagSelector({ selectedTags, onTagsChange, container }: TagSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [availableTags, setAvailableTags] = React.useState<Tag[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // Fetch tags when popover opens
  React.useEffect(() => {
    if (open) {
      loadTags();
    }
  }, [open]);

  const loadTags = async () => {
    try {
      const tags = await getTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error("Failed to load tags", error);
    }
  };

  const toggleTag = (tag: Tag) => {
    const isSelected = selectedTags.some((t) => t.id === tag.id);
    if (isSelected) {
      onTagsChange(selectedTags.filter((t) => t.id !== tag.id));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleCreateTag = async () => {
    if (!inputValue.trim()) return;
    setLoading(true);
    try {
      // Random color generator or fixed set
      const colors = ["bg-red-100 text-red-800", "bg-blue-100 text-blue-800", "bg-green-100 text-green-800", "bg-yellow-100 text-yellow-800", "bg-purple-100 text-purple-800", "bg-pink-100 text-pink-800"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const newTag = await createTag(inputValue.trim(), randomColor);
      setAvailableTags([...availableTags, newTag]);
      onTagsChange([...selectedTags, newTag]);
      setInputValue("");
    } catch (error) {
      console.error("Failed to create tag", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async (e: React.MouseEvent, tagId: number) => {
    e.stopPropagation();
    if (!confirm("Delete this tag? This will remove it from all accounts.")) return;

    try {
      await deleteTag(tagId);
      setAvailableTags(availableTags.filter((t) => t.id !== tagId));
      onTagsChange(selectedTags.filter((t) => t.id !== tagId));
    } catch (error) {
      console.error("Failed to delete tag", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreateTag();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map((tag) => (
          <Badge key={tag.id} variant="outline" className={`pl-2 pr-1 py-1 flex items-center gap-1 rounded-none ${tag.color || 'bg-gray-100 text-gray-800'}`}>
            {tag.name}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 ml-1 rounded-full hover:bg-transparent"
              onClick={() => toggleTag(tag)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
             <Button variant="outline" size="sm" className="h-7 border-dashed">
              + Tags
             </Button>
          </PopoverTrigger>
          <PopoverContent
            className="p-0 w-[200px] z-[100] pointer-events-auto"
            align="start"
            container={container}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => e.preventDefault()}
          >
             <div
               className="p-2"
               onPointerDown={(e) => e.stopPropagation()}
               onClick={(e) => e.stopPropagation()}
             >
                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                  {availableTags.length === 0 && <p className="text-xs text-muted-foreground p-2">No tags found.</p>}
                  {availableTags.map((tag) => {
                     const isSelected = selectedTags.some((t) => t.id === tag.id);
                     return (
                       <div
                         key={tag.id}
                         className={cn(
                           "flex items-center justify-between px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground group",
                           isSelected && "bg-accent"
                         )}
                         onClick={() => toggleTag(tag)}
                       >
                         <span className={cn("truncate flex-1", tag.color && "px-1 rounded")}>{tag.name}</span>
                         <div className="flex items-center gap-1">
                           {isSelected && <Check className="h-4 w-4" />}
                           <Button
                             variant="ghost"
                             size="icon"
                             className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                             onClick={(e) => tag.id && handleDeleteTag(e, tag.id)}
                           >
                             <X className="h-3 w-3" />
                           </Button>
                         </div>
                       </div>
                     );
                  })}
                </div>
                <div className="border-t mt-2 pt-2">
                   <Input
                     placeholder="New tag..."
                     value={inputValue}
                     onChange={(e) => setInputValue(e.target.value)}
                     onKeyDown={handleKeyDown}
                     className="h-8 text-xs"
                     disabled={loading}
                   />
                   <Button
                      size="sm"
                      variant="ghost"
                      className="w-full mt-1 h-6 text-xs text-muted-foreground"
                      onClick={handleCreateTag}
                      disabled={!inputValue.trim() || loading}
                   >
                     {loading ? "Creating..." : "Create +"}
                   </Button>
                </div>
             </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
