import { X, Trash2 } from "lucide-react";
import type { Node } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { NODE_CATEGORIES, NODE_TYPE_BY_KEY } from "./node-taxonomy";
import type { CanvasNodeData } from "./canvas-node";

interface Props {
  node: Node | null;
  onClose: () => void;
  onChange: (id: string, patch: Partial<CanvasNodeData>) => void;
  onConfigChange: (id: string, key: string, value: unknown) => void;
  onDelete: (id: string) => void;
}

export function NodeInspector({
  node,
  onClose,
  onChange,
  onConfigChange,
  onDelete,
}: Props) {
  if (!node) {
    return (
      <aside className="w-80 shrink-0 border-l border-border bg-card flex flex-col items-center justify-center p-6 text-center">
        <div className="rounded-full bg-muted/40 p-3 mb-3">
          <div className="h-8 w-8 rounded-full border-2 border-dashed border-muted-foreground/40" />
        </div>
        <p className="text-sm font-medium text-foreground">Nothing selected</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
          Click any node on the canvas to configure it here.
        </p>
      </aside>
    );
  }

  const data = node.data as unknown as CanvasNodeData;
  const def = NODE_TYPE_BY_KEY[data.typeKey];
  if (!def) return null;
  const cat = NODE_CATEGORIES[def.category];
  const accent = `hsl(${cat.hue})`;

  return (
    <aside className="w-80 shrink-0 border-l border-border bg-card flex flex-col">
      <div
        className="p-4 border-b border-border"
        style={{
          background: `linear-gradient(180deg, hsl(${cat.hue} / 0.08), transparent)`,
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: accent }}
            >
              {cat.label}
            </div>
            <div className="text-sm font-semibold text-foreground">
              {def.label}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {def.short}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 -mt-1"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Label</Label>
          <Input
            value={data.title ?? def.label}
            onChange={(e) => onChange(node.id, { title: e.target.value })}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Description</Label>
          <Textarea
            value={data.subtitle ?? def.short}
            onChange={(e) => onChange(node.id, { subtitle: e.target.value })}
            className="text-xs min-h-[60px]"
          />
        </div>

        <Separator />

        <div>
          <div className="text-xs font-semibold text-foreground mb-2">
            Configuration
          </div>
          <div className="space-y-3">
            {Object.entries(def.defaults).map(([key, defVal]) => {
              const value = (data.config?.[key] ?? defVal) as unknown;
              return (
                <ConfigField
                  key={key}
                  label={key}
                  value={value}
                  onChange={(v) => onConfigChange(node.id, key, v)}
                />
              );
            })}
            {Object.keys(def.defaults).length === 0 && (
              <p className="text-[11px] text-muted-foreground">
                No configuration for this node.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
          onClick={() => onDelete(node.id)}
        >
          <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete node
        </Button>
      </div>
    </aside>
  );
}

function ConfigField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const prettyLabel = label
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase());

  if (typeof value === "boolean") {
    return (
      <div className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
        <Label className="text-xs">{prettyLabel}</Label>
        <Switch checked={value} onCheckedChange={onChange} />
      </div>
    );
  }
  if (typeof value === "number") {
    return (
      <div className="space-y-1">
        <Label className="text-xs">{prettyLabel}</Label>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-8 text-sm"
        />
      </div>
    );
  }
  if (Array.isArray(value)) {
    return (
      <div className="space-y-1">
        <Label className="text-xs">{prettyLabel}</Label>
        <Textarea
          value={value
            .map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v)))
            .join("\n")}
          readOnly
          className="text-[11px] font-mono min-h-[60px] bg-muted/30"
        />
        <p className="text-[10px] text-muted-foreground">
          Edit via dedicated builder (coming soon)
        </p>
      </div>
    );
  }
  if (value && typeof value === "object") {
    return (
      <div className="space-y-1">
        <Label className="text-xs">{prettyLabel}</Label>
        <Textarea
          value={JSON.stringify(value, null, 2)}
          readOnly
          className="text-[11px] font-mono min-h-[80px] bg-muted/30"
        />
        <p className="text-[10px] text-muted-foreground">
          Field-mapping UI per integration (coming soon)
        </p>
      </div>
    );
  }
  // Special-case enum-ish strings
  if (label === "mode" && typeof value === "string") {
    return (
      <div className="space-y-1">
        <Label className="text-xs">{prettyLabel}</Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="parallel">Parallel</SelectItem>
            <SelectItem value="sequential">Sequential</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }
  return (
    <div className="space-y-1">
      <Label className="text-xs">{prettyLabel}</Label>
      <Input
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 text-sm"
      />
    </div>
  );
}
