import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type JSX,
} from "react";
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    addEdge,
    useEdgesState,
    useNodesState,
    Position,
    type Connection,
    type Edge,
    type ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";
import "reactflow/dist/base.css";
import dagre from "dagre";
import type { XBarNode } from "./types/XBarNode.ts";
import type { XBarData } from "./types/XBarData.ts";
import type { Category } from "./types/Category.ts";
import type { BarLevel } from "./types/XBarLevel.ts";
import CustomNode from "./components/XBarNode.tsx";
import CustomEdge from "./components/XBarEdge.tsx";
import { v4 as uuidv4 } from "uuid";

// Define nodeTypes and edgeTypes outside component to prevent recreation
const nodeTypes = {
    xbarnode: CustomNode,
};

const edgeTypes = {
    xbaredge: CustomEdge,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const NODE_WIDTH = 120;
const NODE_HEIGHT = 44;

function layout(
    nodes: XBarNode[],
    edges: Edge[],
    direction: "TB" | "LR" = "TB"
): XBarNode[] {
    // Create a new graph instance for each layout operation
    const graph = new dagre.graphlib.Graph();
    graph.setDefaultEdgeLabel(() => ({}));
    graph.setGraph({
        rankdir: direction,
        nodesep: 100,
        ranksep: 150,
        marginx: 100,
        marginy: 100,
    });

    nodes.forEach((n) => {
        graph.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });
    edges.forEach((e) => graph.setEdge(e.source, e.target));

    dagre.layout(graph);

    // Get the actual viewport dimensions
    const viewportWidth = window.innerWidth || 1200;
    const viewportHeight = window.innerHeight || 800;

    // Calculate the bounds of the layout
    let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

    nodes.forEach((n) => {
        const nodePos = graph.node(n.id);
        if (nodePos) {
            minX = Math.min(minX, nodePos.x - NODE_WIDTH / 2);
            maxX = Math.max(maxX, nodePos.x + NODE_WIDTH / 2);
            minY = Math.min(minY, nodePos.y - NODE_HEIGHT / 2);
            maxY = Math.max(maxY, nodePos.y + NODE_HEIGHT / 2);
        }
    });

    // Calculate center offset to center the diagram within the viewport
    const layoutWidth = maxX - minX;
    const layoutHeight = maxY - minY;

    // Add padding to ensure nodes don't touch the edges
    const padding = 200;
    const centerOffsetX = (viewportWidth - layoutWidth - padding) / 2;
    const centerOffsetY = (viewportHeight - layoutHeight - padding) / 2;

    return nodes.map((n) => {
        const nodePos = graph.node(n.id);
        if (!nodePos) return n; // Fallback if node not found

        return {
            ...n,
            position: {
                x: nodePos.x - NODE_WIDTH / 2 - minX + centerOffsetX,
                y: nodePos.y - NODE_HEIGHT / 2 - minY + centerOffsetY,
            },
        };
    });
}

const CAT_OPTS: Category[] = ["S", "N", "V", "A", "Adv", "P", "Det", "_"];
const BAR_OPTS: BarLevel[] = ["XP", "X′", "X"];

function createId(prefix = "id"): string {
    return `${prefix}_${uuidv4()}`;
}

function label(cat: Category, bar: BarLevel): string {
    if (cat === "S" || cat === "Det") {
        return cat;
    }
    if (cat == "_") {
        return "";
    }
    switch (bar) {
        case "XP":
            return `${cat}P`;
        case "X′":
            return `${cat}′`;
        case "X":
            return `${cat}`;
    }
}

function createNode(
    cat: Category,
    bar: BarLevel,
    position = { x: 0, y: 0 },
    direction: "TB" | "LR" = "TB"
): XBarNode {
    return {
        id: createId("xbar"),
        type: "xbarnode",
        position,
        data: { cat, bar, text: label(cat, bar), direction },
        style: {
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
        },
        sourcePosition: direction === "TB" ? Position.Bottom : Position.Right,
        targetPosition: direction === "TB" ? Position.Top : Position.Left,
    } as XBarNode;
}

function createEdge(source: string, target: string): Edge {
    return {
        id: createId("e"),
        source,
        target,
        type: "xbaredge",
        style: {
            stroke: "grey",
            strokeWidth: 3,
            strokeOpacity: 1,
        },
    } as Edge;
}

export default function XBarDiagram(): JSX.Element {
    const [nodes, setNodes, onNodesChange] = useNodesState<XBarData>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [direction, setDirection] = useState<"TB" | "LR">("TB");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [category, setCategory] = useState<Category>("N");
    const [barLevel, setBarLevel] = useState<BarLevel>("XP");
    const rfRef = useRef<HTMLDivElement | null>(null);
    const [reactFlowInstance, setReactFlowInstance] =
        useState<ReactFlowInstance | null>(null);

    const centerView = useCallback(() => {
        // Use setTimeout to ensure the DOM is updated before trying to center
        setTimeout(() => {
            if (rfRef.current) {
                const reactFlowElement = rfRef.current.querySelector(
                    ".react-flow__viewport"
                );
                if (reactFlowElement) {
                    // Trigger a window resize event to force ReactFlow to recalculate
                    window.dispatchEvent(new Event("resize"));
                }
            }
        }, 100);
    }, []);

    const centerViewOnNodes = useCallback(() => {
        // Use ReactFlow's built-in fitView to center and show all nodes
        setTimeout(() => {
            if (rfRef.current) {
                // Try multiple selectors for the fit view button
                const selectors = [
                    '[data-testid="rf__controls-fitview"]',
                    ".react-flow__controls-fitview",
                    'button[title*="fit"]',
                    'button[aria-label*="fit"]',
                    ".react-flow__controls button:last-child", // Usually the last button is fit view
                ];

                let fitViewButton: HTMLButtonElement | null = null;
                for (const selector of selectors) {
                    fitViewButton = rfRef.current.querySelector(
                        selector
                    ) as HTMLButtonElement;
                    if (fitViewButton) {
                        console.log(
                            "Found fit view button with selector:",
                            selector
                        );
                        break;
                    }
                }

                if (fitViewButton) {
                    fitViewButton.click();
                } else if (reactFlowInstance) {
                    console.log("Using ReactFlow instance fitView");
                    reactFlowInstance.fitView({ padding: 0.2 });
                } else {
                    console.log(
                        "No fit view button or instance found, using resize fallback"
                    );
                    // Fallback: trigger a resize event to recalculate layout
                    window.dispatchEvent(new Event("resize"));
                }
            }
        }, 100);
    }, [reactFlowInstance]);

    const onConnect = useCallback(
        (params: Edge | Connection) => {
            setEdges((eds) => addEdge({ ...params }, eds));
        },
        [setEdges]
    );

    const onNodeClick = useCallback(
        (_evt: React.MouseEvent, node: XBarNode) => {
            setSelectedId(node.id);
        },
        [setSelectedId]
    );

    const onPaneClick = useCallback(() => {
        setSelectedId(null);
    }, []);

    const deleteSelection = useCallback(() => {
        if (!selectedId) return;

        // Remove edges connected to the selected node
        const newEdges = edges.filter(
            (e) => e.source !== selectedId && e.target !== selectedId
        );

        // Remove the selected node
        const newNodes = nodes.filter((n) => n.id !== selectedId);

        // Apply layout to remaining nodes
        const laidOutNodes = layout(newNodes, newEdges, direction);

        setNodes(laidOutNodes);
        setEdges(newEdges);
        setSelectedId(null);
    }, [selectedId, nodes, edges, direction, setNodes, setEdges]);

    // Keyboard shortcuts
    const onKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (
                (event.key === "Delete" || event.key === "Backspace") &&
                selectedId
            ) {
                event.preventDefault(); // Prevent default browser behavior
                deleteSelection();
            }
        },
        [selectedId, deleteSelection]
    );

    // Add keyboard event listener
    useEffect(() => {
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [onKeyDown]);

    // Update all existing nodes with the current direction
    const updateNodesDirection = useCallback(() => {
        setNodes((currentNodes) =>
            currentNodes.map((node) => ({
                ...node,
                data: {
                    ...node.data,
                    direction,
                },
                sourcePosition:
                    direction === "TB" ? Position.Bottom : Position.Right,
                targetPosition:
                    direction === "TB" ? Position.Top : Position.Left,
            }))
        );
    }, [direction, setNodes]);

    // Center view when nodes change
    useEffect(() => {
        if (nodes.length > 0) {
            centerView();
        }
    }, [nodes.length, centerView]);

    // Update node directions when direction changes
    useEffect(() => {
        if (nodes.length > 0) {
            updateNodesDirection();
        }
    }, [direction, updateNodesDirection, nodes.length]);

    // Debug edges state changes
    useEffect(() => {
        console.log("Edges state changed:", edges.length, edges);
        console.log(
            "Edge details:",
            edges.map((e) => ({
                id: e.id,
                source: e.source,
                target: e.target,
                type: e.type,
                style: e.style,
            }))
        );
    }, [edges]);

    const selectedNode = useMemo(
        () => nodes.find((n) => n.id === selectedId) as XBarNode | undefined,
        [nodes, selectedId]
    );

    const relabelNode = useCallback(
        (nodeId: string, newCat: Category, newBar: BarLevel) => {
            setNodes((nds) =>
                nds.map((n) =>
                    n.id === nodeId
                        ? {
                              ...n,
                              data: {
                                  ...n.data,
                                  cat: newCat,
                                  bar: newBar,
                                  text: label(newCat, newBar),
                              },
                          }
                        : n
                )
            );
        },
        [setNodes]
    );

    const addNewNode = useCallback(() => {
        const sel = nodes.find((n) => n.id === selectedId);

        const node = createNode(category, barLevel, undefined, direction);
        let edge = null;
        let allEdges = edges;

        if (!sel) {
            node.position = {
                x: 0,
                y: 0,
            };
        } else {
            node.position = {
                x: sel.position.x + 200,
                y: sel.position.y,
            };
            edge = createEdge(sel.id, node.id);
            allEdges = [...edges, edge];
        }

        const allNodes = [...nodes, node];
        const laidOutNodes = layout(allNodes, allEdges, direction);

        setNodes(laidOutNodes);
        setEdges(allEdges);
        centerView();
    }, [
        category,
        nodes,
        edges,
        direction,
        setNodes,
        setEdges,
        centerView,
        barLevel,
        selectedId,
    ]);

    const doLayout = useCallback(() => {
        const laidOutNodes = layout([...nodes], edges, direction);
        setNodes(laidOutNodes);
    }, [nodes, edges, direction, setNodes]);

    // JSON export/import
    const exportJSON = useCallback(() => {
        const payload = JSON.stringify({ nodes, edges }, null, 2);
        const blob = new Blob([payload], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "xbar-diagram.json";
        a.click();
        URL.revokeObjectURL(url);
    }, [nodes, edges]);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const importJSON = useCallback(
        async (file?: File) => {
            const f = file ?? fileInputRef.current?.files?.[0];
            if (!f) return;
            const text = await f.text();
            const parsed = JSON.parse(text) as {
                nodes: XBarNode[];
                edges: Edge[];
            };
            // Update imported nodes with current direction
            const updatedNodes = parsed.nodes.map((node) => ({
                ...node,
                data: {
                    ...node.data,
                    direction,
                },
                sourcePosition:
                    direction === "TB" ? Position.Bottom : Position.Right,
                targetPosition:
                    direction === "TB" ? Position.Top : Position.Left,
            }));
            setNodes(updatedNodes);
            setEdges(parsed.edges);
            // Center the view on the imported nodes without changing their positions
            setTimeout(() => centerViewOnNodes(), 200);
        },
        [setNodes, setEdges, centerViewOnNodes, direction]
    );

    return (
        <div className="w-screen h-screen flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-3 border-b bg-white/80 backdrop-blur">
                <select
                    className="border rounded px-2 py-1"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    title="Category for the new node"
                >
                    {CAT_OPTS.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
                <select
                    className="border rounded px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    value={barLevel}
                    disabled={
                        category === "Det" ||
                        category === "S" ||
                        category === "_"
                    }
                    onChange={(e) => setBarLevel(e.target.value as BarLevel)}
                    title="Bar level for the new node"
                >
                    {BAR_OPTS.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
                <button
                    className="px-3 py-1 rounded bg-slate-900 text-white"
                    onClick={addNewNode}
                >
                    + Add
                </button>
                <div className="mx-2 w-px h-6 bg-slate-200" />
                <button className="px-3 py-1 rounded border" onClick={doLayout}>
                    Auto‑layout
                </button>
                <button
                    className="px-3 py-1 rounded border"
                    onClick={centerViewOnNodes}
                >
                    Center View
                </button>
                <select
                    className="border rounded px-2 py-1"
                    value={direction}
                    onChange={(e) =>
                        setDirection(e.target.value as "TB" | "LR")
                    }
                >
                    <option value="TB">Top‑Down</option>
                    <option value="LR">Left‑Right</option>
                </select>
                <div className="mx-2 w-px h-6 bg-slate-200" />
                <button
                    className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={deleteSelection}
                    disabled={!selectedId}
                    title="Delete selected node and its connections"
                >
                    Delete
                </button>
                <div className="mx-2 w-px h-6 bg-slate-200" />
                <button
                    className="px-3 py-1 rounded border"
                    onClick={exportJSON}
                >
                    Export to JSON
                </button>
                <label className="px-3 py-1 rounded border cursor-pointer">
                    Open JSON
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/json"
                        className="hidden"
                        onChange={(e) => importJSON(e.target.files?.[0])}
                    />
                </label>
                {selectedNode && (
                    <div className="ml-auto flex items-center gap-2 text-sm">
                        <span className="text-slate-500">Selected:</span>
                        <strong>
                            {(selectedNode.data as XBarData).text ?? "head"}
                        </strong>
                        <select
                            className="border rounded px-2 py-1"
                            value={(selectedNode.data as XBarData).cat}
                            onChange={(e) =>
                                relabelNode(
                                    selectedNode.id,
                                    e.target.value as Category,
                                    (selectedNode.data as XBarData).bar
                                )
                            }
                        >
                            {CAT_OPTS.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                        <select
                            className="border rounded px-2 py-1"
                            value={(selectedNode.data as XBarData).bar}
                            onChange={(e) =>
                                relabelNode(
                                    selectedNode.id,
                                    (selectedNode.data as XBarData).cat,
                                    e.target.value as BarLevel
                                )
                            }
                        >
                            {BAR_OPTS.map((b) => (
                                <option key={b} value={b}>
                                    {b}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="px-3 py-2 text-sm text-slate-600 bg-slate-50 border-b">
                {selectedId ? (
                    <span>
                        Selected:{" "}
                        <strong>{selectedNode?.data.text ?? "head"}</strong>
                        {selectedNode?.data.bar === "X′" &&
                            " (X′) - You can add a Complement"}
                        {selectedNode?.data.bar === "XP" &&
                            " (XP) - You can add a Specifier"}
                    </span>
                ) : (
                    <span>
                        Click on a node to select it, then use the buttons above
                        to add subnodes
                    </span>
                )}
                <span className="ml-4 text-xs text-slate-500">
                    Nodes: {nodes.length} | Edges: {edges.length}
                </span>
            </div>

            {/* Canvas */}
            <div ref={rfRef} className="flex-1 overflow-hidden">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    fitViewOptions={{ padding: 0.2 }}
                    defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                    minZoom={0.5}
                    maxZoom={2}
                    proOptions={{ hideAttribution: true }}
                    nodesDraggable={true}
                    nodesConnectable={false}
                    elementsSelectable={true}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    onEdgeClick={(edge) => console.log("Edge clicked:", edge)}
                    onEdgeUpdate={(oldEdge, newConnection) =>
                        console.log("Edge update:", oldEdge, newConnection)
                    }
                    onError={(error) =>
                        console.error("ReactFlow error:", JSON.stringify(error))
                    }
                    onInit={(instance) => {
                        setReactFlowInstance(instance);
                        console.log("ReactFlow initialized:", instance);
                    }}
                >
                    <MiniMap />
                    <Controls />
                    <Background />
                </ReactFlow>
            </div>
        </div>
    );
}
