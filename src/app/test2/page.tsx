"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  type ReactFlowInstance,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { Header } from "./components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Save, Play, Rocket, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { NodePalette } from "./components/node-palette";
import { NodeInspector } from "./components/node-inspector";
import { CanvasNode, type CanvasNodeData } from "./components/canvas-node";
import { NODE_TYPE_BY_KEY, NODE_CATEGORIES } from "./components/node-taxonomy";
import { seedNodes, seedEdges } from "./components/seed-graph";

const nodeTypes = { canvasNode: CanvasNode };

function CanvasInner() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(seedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(seedEdges);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState("Untitled workflow");

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedId) ?? null,
    [nodes, selectedId]
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds
        )
      ),
    [setEdges]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const typeKey = e.dataTransfer.getData("application/x-canvas-node");
      if (!typeKey || !rfInstance || !wrapperRef.current) return;
      const def = NODE_TYPE_BY_KEY[typeKey];
      if (!def) return;
      const bounds = wrapperRef.current.getBoundingClientRect();
      const position = rfInstance.screenToFlowPosition({
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      });
      const id = `${typeKey}-${Date.now().toString(36)}`;
      const data: CanvasNodeData = {
        typeKey,
        config: { ...def.defaults },
      };
      setNodes((ns) =>
        ns.concat({
          id,
          type: "canvasNode",
          position,
          data: data as unknown as Record<string, unknown>,
        })
      );
      setSelectedId(id);
    },
    [rfInstance, setNodes]
  );

  const updateNodeData = useCallback(
    (id: string, patch: Partial<CanvasNodeData>) => {
      setNodes((ns) =>
        ns.map((n) =>
          n.id === id
            ? {
                ...n,
                data: { ...(n.data as object), ...patch } as Record<
                  string,
                  unknown
                >,
              }
            : n
        )
      );
    },
    [setNodes]
  );

  const updateNodeConfig = useCallback(
    (id: string, key: string, value: unknown) => {
      setNodes((ns) =>
        ns.map((n) => {
          if (n.id !== id) return n;
          const data = n.data as unknown as CanvasNodeData;
          return {
            ...n,
            data: {
              ...(n.data as object),
              config: { ...(data.config ?? {}), [key]: value },
            } as Record<string, unknown>,
          };
        })
      );
    },
    [setNodes]
  );

  const deleteNode = useCallback(
    (id: string) => {
      setNodes((ns) => ns.filter((n) => n.id !== id));
      setEdges((es) => es.filter((e) => e.source !== id && e.target !== id));
      setSelectedId(null);
    },
    [setNodes, setEdges]
  );

  return (
    <div className="flex flex-1 min-h-0">
      <NodePalette />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <div className="h-14 border-b border-border bg-card flex items-center gap-3 px-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 max-w-xs text-sm font-semibold border-transparent bg-transparent hover:border-border focus-visible:border-border"
          />
          <Badge variant="outline" className="text-[10px] uppercase">
            Draft
          </Badge>
          <span className="text-xs text-muted-foreground ml-2">
            {nodes.length} nodes · {edges.length} connections
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Workflow saved (local draft)")}
            >
              <Save className="h-3.5 w-3.5 mr-1.5" /> Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast.info("Test run — opens a sandbox runner (mock)")
              }
            >
              <Play className="h-3.5 w-3.5 mr-1.5" /> Test run
            </Button>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground"
              onClick={() => toast.success("Workflow published")}
            >
              <Rocket className="h-3.5 w-3.5 mr-1.5" /> Publish
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={wrapperRef}
          className="flex-1 min-h-0 bg-background"
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setRfInstance}
            nodeTypes={nodeTypes}
            onNodeClick={(_, n) => setSelectedId(n.id)}
            onPaneClick={() => setSelectedId(null)}
            fitView
            fitViewOptions={{ padding: 0.25 }}
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: "hsl(var(--primary))", strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: "hsl(var(--primary))",
              },
            }}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={18}
              size={1.4}
              color="hsl(var(--border))"
            />
            <Controls className="!bg-card !border !border-border !rounded-lg !shadow-sm" />
            <MiniMap
              pannable
              zoomable
              className="!bg-card !border !border-border !rounded-lg"
              nodeColor={(n) => {
                const d = n.data as unknown as CanvasNodeData;
                const def = d?.typeKey
                  ? NODE_TYPE_BY_KEY[d.typeKey]
                  : undefined;
                if (!def) return "hsl(var(--muted))";
                return `hsl(${NODE_CATEGORIES[def.category].hue})`;
              }}
            />
          </ReactFlow>
        </div>
      </div>

      <NodeInspector
        node={selectedNode}
        onClose={() => setSelectedId(null)}
        onChange={updateNodeData}
        onConfigChange={updateNodeConfig}
        onDelete={deleteNode}
      />
    </div>
  );
}

const WorkflowCanvas = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar activePage="workflows" />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <ReactFlowProvider>
            <CanvasInner />
          </ReactFlowProvider>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default WorkflowCanvas;
