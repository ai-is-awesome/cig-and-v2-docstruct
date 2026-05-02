import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  NODE_CATEGORIES,
  nodesByCategory,
  type NodeCategoryKey,
} from "./node-taxonomy";
import { cn } from "@/lib/utils";

export function NodePalette() {
  const [query, setQuery] = useState("");
  const grouped = nodesByCategory();

  const onDragStart = (e: React.DragEvent, typeKey: string) => {
    e.dataTransfer.setData("application/x-canvas-node", typeKey);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="w-72 shrink-0 border-r border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Node Library</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Drag a node onto the canvas
        </p>
        <div className="relative mt-3">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search nodes…"
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {(Object.keys(NODE_CATEGORIES) as NodeCategoryKey[]).map((k) => {
          const cat = NODE_CATEGORIES[k];
          const items = grouped[k].filter(
            (n) =>
              !query ||
              n.label.toLowerCase().includes(query.toLowerCase()) ||
              n.short.toLowerCase().includes(query.toLowerCase())
          );
          if (items.length === 0) return null;
          const accent = `hsl(${cat.hue})`;
          const accentSoft = `hsl(${cat.hue} / 0.1)`;
          return (
            <Collapsible key={k} defaultOpen>
              <CollapsibleTrigger
                className={cn(
                  "group w-full flex items-center justify-between rounded-lg px-2.5 py-2",
                  "hover:bg-accent/40 transition-colors"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: accent }}
                  />
                  <span className="text-xs font-semibold text-foreground">
                    {cat.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {items.length}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=closed]:-rotate-90" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-1.5">
                <div className="space-y-1 py-1">
                  {items.map((n) => {
                    const Icon = n.icon;
                    return (
                      <div
                        key={n.type}
                        draggable
                        onDragStart={(e) => onDragStart(e, n.type)}
                        className={cn(
                          "group cursor-grab active:cursor-grabbing rounded-lg border border-transparent",
                          "px-2.5 py-2 hover:border-border hover:bg-background transition-all"
                        )}
                        style={{ background: accentSoft }}
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                            style={{ background: "white", color: accent }}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-medium text-foreground truncate">
                              {n.label}
                            </div>
                            <div className="text-[10px] text-muted-foreground line-clamp-2 leading-snug">
                              {n.short}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </aside>
  );
}
