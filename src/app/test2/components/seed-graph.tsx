import type { Edge, Node } from "@xyflow/react";
import type { CanvasNodeData } from "./canvas-node";
import { NODE_TYPE_BY_KEY } from "./node-taxonomy";

const make = (
  id: string,
  typeKey: string,
  x: number,
  y: number,
  overrides: Partial<CanvasNodeData> = {}
): Node => ({
  id,
  type: "canvasNode",
  position: { x, y },
  data: {
    typeKey,
    config: { ...NODE_TYPE_BY_KEY[typeKey].defaults },
    ...overrides,
  } as unknown as Record<string, unknown>,
});

export const seedNodes: Node[] = [
  make("t1", "trigger.email", 0, 200, { title: "Customer email inbox" }),
  make("e1", "extract.template", 320, 200, { title: "Extract Invoice fields" }),
  make("b1", "logic.branch", 640, 200, {
    title: "Amount > $10,000?",
    config: { condition: "extraction.total > 10000" },
  }),
  make("v1", "human.verify", 960, 80, { title: "Verify line items" }),
  make("a1", "human.approve", 960, 320, { title: "Manager approval" }),
  make("e2", "comms.email", 1280, 80, { title: "Notify ops team" }),
  make("d1", "dest.salesforce", 1280, 320, { title: "Create Opportunity" }),
  make("d2", "dest.googleSheets", 1280, 480, {
    title: "Append to ledger sheet",
  }),
];

export const seedEdges: Edge[] = [
  {
    id: "t1-e1",
    source: "t1",
    target: "e1",
    sourceHandle: "out-0",
    targetHandle: "in-0",
    animated: true,
  },
  {
    id: "e1-b1",
    source: "e1",
    target: "b1",
    sourceHandle: "out-0",
    targetHandle: "in-0",
    animated: true,
  },
  {
    id: "b1-v1",
    source: "b1",
    target: "v1",
    sourceHandle: "out-0",
    targetHandle: "in-0",
    animated: true,
    label: "True",
  },
  {
    id: "b1-a1",
    source: "b1",
    target: "a1",
    sourceHandle: "out-1",
    targetHandle: "in-0",
    animated: true,
    label: "False",
  },
  {
    id: "v1-e2",
    source: "v1",
    target: "e2",
    sourceHandle: "out-0",
    targetHandle: "in-0",
    animated: true,
  },
  {
    id: "a1-d1",
    source: "a1",
    target: "d1",
    sourceHandle: "out-0",
    targetHandle: "in-0",
    animated: true,
    label: "Approved",
  },
  {
    id: "a1-d2",
    source: "a1",
    target: "d2",
    sourceHandle: "out-0",
    targetHandle: "in-0",
    animated: true,
    label: "Approved",
  },
];
