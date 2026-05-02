import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { NODE_CATEGORIES, NODE_TYPE_BY_KEY } from "./node-taxonomy";
import { cn } from "@/lib/utils";

export interface CanvasNodeData {
  typeKey: string;
  title?: string;
  subtitle?: string;
  config?: Record<string, unknown>;
  status?: "idle" | "ok" | "warning" | "error";
}

function CanvasNodeBase({ data, selected }: NodeProps) {
  const d = data as unknown as CanvasNodeData;
  const def = NODE_TYPE_BY_KEY[d.typeKey];
  if (!def) return null;
  const cat = NODE_CATEGORIES[def.category];
  const Icon = def.icon;

  const accent = `hsl(${cat.hue})`;
  const accentSoft = `hsl(${cat.hue} / 0.12)`;
  const accentRing = `hsl(${cat.hue} / 0.45)`;

  const inputs = def.inputs;
  const outputs = def.outputs;

  return (
    <div
      className={cn(
        "rounded-2xl bg-card text-card-foreground border shadow-sm transition-all",
        "min-w-[220px] max-w-[260px]",
        selected ? "shadow-lg" : "hover:shadow-md"
      )}
      style={{
        borderColor: selected ? accent : "hsl(var(--border))",
        boxShadow: selected ? `0 0 0 3px ${accentRing}` : undefined,
      }}
    >
      {/* Top accent bar */}
      <div
        className="h-1.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${accent}, ${accent}aa)` }}
      />
      <div className="px-3.5 pt-3 pb-3">
        <div className="flex items-start gap-2.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ background: accentSoft, color: accent }}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: accent }}
            >
              {cat.label}
            </div>
            <div className="text-sm font-semibold leading-tight text-foreground truncate">
              {d.title || def.label}
            </div>
          </div>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-muted-foreground line-clamp-2">
          {d.subtitle || def.short}
        </p>

        {/* Branch labels for decision nodes */}
        {outputs.length > 1 && (
          <div className="mt-2.5 flex items-center justify-between text-[10px] font-medium text-muted-foreground">
            {outputs.map((_, i) => (
              <span
                key={i}
                className="rounded-full px-2 py-0.5"
                style={{ background: accentSoft, color: accent }}
              >
                {def.type === "logic.branch"
                  ? i === 0
                    ? "True"
                    : "False"
                  : def.type === "human.approve" ||
                    def.type === "human.multiApprove"
                  ? i === 0
                    ? "Approved"
                    : "Rejected"
                  : `Path ${i + 1}`}
              </span>
            ))}
          </div>
        )}
      </div>
      fewfefwe
      {/* Input handles */}
      {inputs.map((_, i) => (
        <Handle
          key={`in-${i}`}
          type="target"
          position={Position.Left}
          id={`in-${i}`}
          style={{
            top:
              inputs.length === 1
                ? "50%"
                : `${30 + (i * 40) / Math.max(1, inputs.length - 1)}%`,
            background: accent,
            border: "2px solid white",
            width: 12,
            height: 12,
          }}
        />
      ))}
      {/* Output handles */}
      {outputs.map((_, i) => (
        <Handle
          key={`out-${i}`}
          type="source"
          position={Position.Right}
          id={`out-${i}`}
          style={{
            top:
              outputs.length === 1
                ? "50%"
                : `${30 + (i * 40) / Math.max(1, outputs.length - 1)}%`,
            background: accent,
            border: "2px solid white",
            width: 12,
            height: 12,
          }}
        />
      ))}
    </div>
  );
}

export const CanvasNode = memo(CanvasNodeBase);
