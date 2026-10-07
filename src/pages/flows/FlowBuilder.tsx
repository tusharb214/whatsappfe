import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type DragEvent,
} from "react";
import {
    getFlowNodes,
    getFlowEdges,
    createFlowNode,
    updateFlowNode,
    deleteFlowNode,
    createFlowEdge,
    deleteFlowEdge,
} from "../../api/flowApi";
import {
    Background,
    Controls,
    MiniMap,
    ReactFlow,
    ReactFlowProvider,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    Handle,
    Position,
    useReactFlow,
    useUpdateNodeInternals,
    type Connection,
    type Edge,
    type Node,
    type NodeProps,

} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import {
    ArrowLeft,
    Calendar,
    CheckSquare,
    ChevronDown,
    Clock3,
    Contact,
    FileText,
    GitBranch,
    Globe,
    Image as ImageIcon,
    List,
    Mail,
    MapPin,
    MessageSquare,
    Music,
    Phone,
    Play,
    Plus,
    Redo2,
    Search,
    Send,
    Settings2,
    ShoppingBag,
    ShoppingCart,
    Shuffle,
    Square,
    Tag,
    Trash2,
    Type,
    Undo2,
    Upload,
    UserPlus,
    UserRoundCog,
    Variable,
    Video,
    Webhook,
    X,
    Zap,
} from "lucide-react";

import type { ComponentType } from "react";

interface FlowBuilderProps {
    flowId: number;
    flowName: string;
    onBack?: () => void;
}

type NodeCategory =
    | "TRIGGER"
    | "MESSAGE"
    | "INPUT"
    | "LOGIC"
    | "ACTION"
    | "COMMERCE"
    | "CONTROL";

interface ButtonConfig {
    id: string;
    text: string;
}

interface FlowNodeData extends Record<string, unknown> {
    nodeType: string;
    label: string;
    description: string;
    category: NodeCategory;
    config: Record<string, unknown>;
    buttons?: ButtonConfig[];
    iconName?: string;
}

type FlowNode = Node<FlowNodeData>;

interface NodeDefinition {
    type: string;
    label: string;
    description: string;
    category: NodeCategory;
    icon: ComponentType<{ size?: number; className?: string }>;
}

const NODE_LIBRARY: NodeDefinition[] = [
    // =========================
    // TRIGGERS
    // =========================
    {
        type: "START",
        label: "Flow Start",
        description: "Start this automation",
        category: "TRIGGER",
        icon: Play,
    },
    {
        type: "KEYWORD_TRIGGER",
        label: "Keyword Trigger",
        description: "Start when a keyword is received",
        category: "TRIGGER",
        icon: Zap,
    },
    {
        type: "MESSAGE_TRIGGER",
        label: "Incoming Message",
        description: "Trigger from customer message",
        category: "TRIGGER",
        icon: MessageSquare,
    },

    // =========================
    // MESSAGES
    // =========================
    {
        type: "TEXT_MESSAGE",
        label: "Text Message",
        description: "Send a WhatsApp text",
        category: "MESSAGE",
        icon: MessageSquare,
    },
    {
        type: "IMAGE",
        label: "Image",
        description: "Send an image",
        category: "MESSAGE",
        icon: ImageIcon,
    },
    {
        type: "VIDEO",
        label: "Video",
        description: "Send a video",
        category: "MESSAGE",
        icon: Video,
    },
    {
        type: "AUDIO",
        label: "Audio",
        description: "Send an audio file",
        category: "MESSAGE",
        icon: Music,
    },
    {
        type: "DOCUMENT",
        label: "Document",
        description: "Send a document",
        category: "MESSAGE",
        icon: FileText,
    },
    {
        type: "LOCATION",
        label: "Location",
        description: "Send a location",
        category: "MESSAGE",
        icon: MapPin,
    },
    {
        type: "CONTACT",
        label: "Contact",
        description: "Send contact information",
        category: "MESSAGE",
        icon: Contact,
    },

    // =========================
    // INTERACTIVE
    // =========================
    {
        type: "BUTTON",
        label: "Buttons",
        description: "Show reply buttons",
        category: "INPUT",
        icon: CheckSquare,
    },
    {
        type: "LIST",
        label: "List",
        description: "Show selectable options",
        category: "INPUT",
        icon: List,
    },
    {
        type: "TEXT_INPUT",
        label: "Text Input",
        description: "Ask customer for text",
        category: "INPUT",
        icon: Type,
    },
    {
        type: "PHONE_INPUT",
        label: "Phone Input",
        description: "Ask for phone number",
        category: "INPUT",
        icon: Phone,
    },
    {
        type: "EMAIL_INPUT",
        label: "Email Input",
        description: "Ask for email",
        category: "INPUT",
        icon: Mail,
    },
    {
        type: "NUMBER_INPUT",
        label: "Number Input",
        description: "Ask for a number",
        category: "INPUT",
        icon: Variable,
    },
    {
        type: "DATE_INPUT",
        label: "Date Input",
        description: "Ask for a date",
        category: "INPUT",
        icon: Calendar,
    },

    // =========================
    // LOGIC
    // =========================
    {
        type: "CONDITION",
        label: "Condition",
        description: "Create an if / else branch",
        category: "LOGIC",
        icon: GitBranch,
    },
    {
        type: "SWITCH",
        label: "Switch",
        description: "Create multiple branches",
        category: "LOGIC",
        icon: Shuffle,
    },
    {
        type: "SET_VARIABLE",
        label: "Set Variable",
        description: "Create or update a variable",
        category: "LOGIC",
        icon: Variable,
    },
    {
        type: "DELAY",
        label: "Delay",
        description: "Wait before next step",
        category: "CONTROL",
        icon: Clock3,
    },

    // =========================
    // ACTIONS
    // =========================
    {
        type: "HTTP_REQUEST",
        label: "HTTP Request",
        description: "Call an external API",
        category: "ACTION",
        icon: Globe,
    },
    {
        type: "WEBHOOK",
        label: "Webhook",
        description: "Send data to webhook",
        category: "ACTION",
        icon: Webhook,
    },
    {
        type: "ADD_TAG",
        label: "Add Tag",
        description: "Add tag to contact",
        category: "ACTION",
        icon: Tag,
    },
    {
        type: "REMOVE_TAG",
        label: "Remove Tag",
        description: "Remove tag from contact",
        category: "ACTION",
        icon: Tag,
    },
    {
        type: "CREATE_CONTACT",
        label: "Create Contact",
        description: "Create a contact",
        category: "ACTION",
        icon: UserPlus,
    },
    {
        type: "ASSIGN_AGENT",
        label: "Assign Agent",
        description: "Assign conversation",
        category: "ACTION",
        icon: UserRoundCog,
    },

    // =========================
    // COMMERCE
    // =========================
    {
        type: "PRODUCT",
        label: "Product",
        description: "Send a product",
        category: "COMMERCE",
        icon: ShoppingBag,
    },
    {
        type: "CATALOG",
        label: "Catalog",
        description: "Send product catalog",
        category: "COMMERCE",
        icon: ShoppingCart,
    },

    // =========================
    // CONTROL
    // =========================
    {
        type: "JUMP_TO_FLOW",
        label: "Go To Flow",
        description: "Continue another flow",
        category: "CONTROL",
        icon: Send,
    },
    {
        type: "END",
        label: "End",
        description: "End the automation",
        category: "CONTROL",
        icon: Square,
    },
];

const CATEGORY_LABELS: Record<NodeCategory, string> = {
    TRIGGER: "Triggers",
    MESSAGE: "Messages",
    INPUT: "Interactive",
    LOGIC: "Logic",
    ACTION: "Actions",
    COMMERCE: "Commerce",
    CONTROL: "Flow Control",
};

const CATEGORY_ORDER: NodeCategory[] = [
    "TRIGGER",
    "MESSAGE",
    "INPUT",
    "LOGIC",
    "ACTION",
    "COMMERCE",
    "CONTROL",
];

function createDefaultConfig(type: string): Record<string, unknown> {
    switch (type) {
        case "TEXT_MESSAGE":
            return {
                text: "Hello! 👋",
            };

        case "IMAGE":
        case "VIDEO":
        case "AUDIO":
        case "DOCUMENT":
            return {
                mediaUrl: "",
                caption: "",
            };

        case "LOCATION":
            return {
                latitude: "",
                longitude: "",
                name: "",
                address: "",
            };

        case "CONTACT":
            return {
                name: "",
                phone: "",
            };

        case "BUTTON":
            return {
                text: "Choose an option",
            };

        case "LIST":
            return {
                text: "Please select an option",
                buttonText: "View options",
            };

        case "TEXT_INPUT":
            return {
                question: "What is your name?",
                variable: "name",
            };

        case "PHONE_INPUT":
            return {
                question: "Please enter your phone number.",
                variable: "phone",
            };

        case "EMAIL_INPUT":
            return {
                question: "Please enter your email.",
                variable: "email",
            };

        case "NUMBER_INPUT":
            return {
                question: "Please enter a number.",
                variable: "number",
            };

        case "DATE_INPUT":
            return {
                question: "Please select a date.",
                variable: "date",
            };

        case "CONDITION":
            return {
                variable: "customer.status",
                operator: "equals",
                value: "premium",
            };

        case "SWITCH":
            return {
                variable: "customer.status",
            };

        case "SET_VARIABLE":
            return {
                variable: "customer.status",
                value: "active",
            };

        case "DELAY":
            return {
                amount: 5,
                unit: "MINUTES",
            };

        case "HTTP_REQUEST":
            return {
                method: "GET",
                url: "",
                body: "",
                responseVariable: "apiResponse",
            };

        case "WEBHOOK":
            return {
                url: "",
                method: "POST",
                body: "",
            };

        case "ADD_TAG":
        case "REMOVE_TAG":
            return {
                tag: "",
            };

        case "CREATE_CONTACT":
            return {
                nameVariable: "name",
                phoneVariable: "phone",
                emailVariable: "email",
            };

        case "ASSIGN_AGENT":
            return {
                agentId: "",
            };

        case "PRODUCT":
            return {
                productId: "",
            };

        case "CATALOG":
            return {
                catalogId: "",
            };

        case "KEYWORD_TRIGGER":
            return {
                keywords: "hi,hello,start",
            };

        case "MESSAGE_TRIGGER":
            return {
                messageType: "ANY",
            };

        case "JUMP_TO_FLOW":
            return {
                flowId: "",
            };

        default:
            return {};
    }
}

function FlowNodeCard({ data, selected }: NodeProps<FlowNode>) {
    const buttons = data.buttons ?? [];
    const hasBranches =
        data.nodeType === "BUTTON" ||
        data.nodeType === "CONDITION" ||
        data.nodeType === "SWITCH" ||
        data.nodeType === "LIST";

    return (
        <div
            className={`relative min-w-[250px] max-w-[290px] overflow-visible rounded-2xl border bg-white shadow-lg transition ${selected
                ? "border-indigo-500 ring-2 ring-indigo-100"
                : "border-slate-200"
                }`}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="!h-3 !w-3 !border-2 !border-white !bg-indigo-500"
            />

            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Settings2 size={17} />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                        {data.label}
                    </p>

                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        {data.nodeType.replaceAll("_", " ")}
                    </p>
                </div>
            </div>

            <div className="px-4 py-3">
                <NodePreview data={data} />
            </div>

            {hasBranches ? (
                <div className="border-t border-slate-100">
                    {data.nodeType === "BUTTON" && buttons.length > 0 ? (
                        buttons.map((button, index) => (
                            <div
                                key={button.id}
                                className="relative flex items-center justify-between border-b border-slate-100 px-4 py-2.5 last:border-b-0"
                            >
                                <span className="truncate text-xs font-medium text-slate-700">
                                    {button.text || `Button ${index + 1}`}
                                </span>

                                <Handle
                                    type="source"
                                    position={Position.Right}
                                    id={button.id}
                                    className="!right-[-6px] !h-3 !w-3 !border-2 !border-white !bg-indigo-500"
                                />
                            </div>
                        ))
                    ) : (
                        <>
                            <div className="relative flex items-center justify-between px-4 py-2.5">
                                <span className="text-xs font-medium text-slate-700">
                                    {data.nodeType === "CONDITION"
                                        ? "TRUE"
                                        : data.nodeType === "SWITCH"
                                            ? "CASE"
                                            : "OPTIONS"}
                                </span>

                                <Handle
                                    type="source"
                                    position={Position.Right}
                                    id="true"
                                    className="!right-[-6px] !h-3 !w-3 !border-2 !border-white !bg-emerald-500"
                                />
                            </div>

                            {(data.nodeType === "CONDITION" ||
                                data.nodeType === "SWITCH") && (
                                    <div className="relative flex items-center justify-between border-t border-slate-100 px-4 py-2.5">
                                        <span className="text-xs font-medium text-slate-700">
                                            {data.nodeType === "CONDITION" ? "FALSE" : "DEFAULT"}
                                        </span>

                                        <Handle
                                            type="source"
                                            position={Position.Right}
                                            id="false"
                                            className="!right-[-6px] !h-3 !w-3 !border-2 !border-white !bg-red-400"
                                        />
                                    </div>
                                )}
                        </>
                    )}
                </div>
            ) : (
                data.nodeType !== "END" && (
                    <Handle
                        type="source"
                        position={Position.Bottom}
                        className="!h-3 !w-3 !border-2 !border-white !bg-indigo-500"
                    />
                )
            )}
        </div>
    );
}

function NodePreview({ data }: { data: FlowNodeData }) {
    const config = data.config ?? {};

    switch (data.nodeType) {
        case "TEXT_MESSAGE":
            return (
                <p className="line-clamp-3 whitespace-pre-wrap text-xs leading-5 text-slate-600">
                    {String(config.text || "Enter your message...")}
                </p>
            );

        case "IMAGE":
            return (
                <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                    🖼 {String(config.caption || "Image message")}
                </div>
            );

        case "VIDEO":
            return (
                <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                    🎥 {String(config.caption || "Video message")}
                </div>
            );

        case "AUDIO":
            return (
                <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                    🎵 Audio message
                </div>
            );

        case "DOCUMENT":
            return (
                <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                    📄 {String(config.caption || "Document")}
                </div>
            );

        case "BUTTON":
            return (
                <p className="text-xs text-slate-500">
                    {String(config.text || "Choose an option")}
                </p>
            );

        case "LIST":
            return (
                <p className="text-xs text-slate-500">
                    {String(config.text || "Select an option")}
                </p>
            );

        case "CONDITION":
            return (
                <div className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">
                        {String(config.variable || "variable")}
                    </span>{" "}
                    {String(config.operator || "equals")}{" "}
                    <span className="font-semibold text-slate-700">
                        {String(config.value || "")}
                    </span>
                </div>
            );

        case "DELAY":
            return (
                <p className="text-xs text-slate-500">
                    Wait {String(config.amount || 0)}{" "}
                    {String(config.unit || "MINUTES").toLowerCase()}
                </p>
            );

        case "HTTP_REQUEST":
            return (
                <p className="truncate text-xs text-slate-500">
                    {String(config.method || "GET")}{" "}
                    {String(config.url || "API URL")}
                </p>
            );

        case "SET_VARIABLE":
            return (
                <p className="truncate text-xs text-slate-500">
                    {String(config.variable || "variable")} ={" "}
                    {String(config.value || "")}
                </p>
            );

        default:
            return (
                <p className="text-xs text-slate-500">
                    {data.description}
                </p>
            );
    }
}

function FlowBuilderCanvas({
    flowId,
    flowName,
    onBack,
}: FlowBuilderProps) {
    const reactFlowWrapper = useRef<HTMLDivElement | null>(null);

    const { screenToFlowPosition } = useReactFlow();
    const updateNodeInternals = useUpdateNodeInternals();

    const [nodes, setNodes] = useState<FlowNode[]>([]);

    const [edges, setEdges] = useState<Edge[]>([]);
    const initializedFlowRef = useRef<number | null>(null);

    useEffect(() => {
        if (initializedFlowRef.current === flowId) {
            return;
        }
        initializedFlowRef.current = flowId;

        const loadFlowData = async () => {
            try {
                const [apiNodes, apiEdges] = await Promise.all([
                    getFlowNodes(flowId),
                    getFlowEdges(flowId),
                ]);

                const loadedNodes: FlowNode[] = apiNodes.map((node) => {
                    const definition = NODE_LIBRARY.find(
                        (item) => item.type === node.nodeType
                    );

                    let config: Record<string, unknown> = {};

                    try {
                        config = node.config ? JSON.parse(node.config) : {};
                    } catch {
                        config = {};
                    }

                    return {
                        id: String(node.id),
                        type: "flowNode",
                        deletable: node.nodeType !== "START",
                        position: {
                            x: node.positionX ?? 100,
                            y: node.positionY ?? 100,
                        },
                        data: {
                            nodeType: node.nodeType,
                            label: node.label ?? definition?.label ?? node.nodeType,
                            description: definition?.description ?? "",
                            category: definition?.category ?? "CONTROL",
                            config,
                            buttons: Array.isArray(config.buttons)
                                ? (config.buttons as ButtonConfig[])
                                : [],
                        },
                    };
                });
                const loadedEdges: Edge[] = apiEdges.map((edge) => ({
                    id: String(edge.id),
                    source: String(edge.sourceNodeId),
                    target: String(edge.targetNodeId),
                    sourceHandle: edge.sourceHandle ?? undefined,
                    data: {
                        condition: edge.condition ?? null,
                    },
                }));

                if (loadedNodes.length > 0) {
                    setNodes(loadedNodes);
                } else {
                    const startNode = await createFlowNode(flowId, {
                        nodeKey: "START",
                        nodeType: "START",
                        name: "Flow Start",
                        config: JSON.stringify({}),
                        positionX: 100,
                        positionY: 100,
                    });

                    setNodes([
                        {
                            id: String(startNode.id),
                            type: "flowNode",
                            deletable: false,
                            position: {
                                x: startNode.positionX ?? 100,
                                y: startNode.positionY ?? 100,
                            },
                            data: {
                                nodeType: "START",
                                label: startNode.label ?? "Flow Start",
                                description: "Start this automation",
                                category: "TRIGGER",
                                config: {},
                            },
                        },
                    ]);
                }

                setEdges(loadedEdges);
            } catch (error) {
                console.error("Failed to load flow data:", error);
            }
        };

        loadFlowData();
    }, [flowId]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
        null
    );

    const [search, setSearch] = useState("");
    const [showLibrary, setShowLibrary] = useState(true);
    const [showProperties, setShowProperties] = useState(true);

    const [history, setHistory] = useState<
        { nodes: FlowNode[]; edges: Edge[] }[]
    >([]);

    const [future, setFuture] = useState<
        { nodes: FlowNode[]; edges: Edge[] }[]
    >([]);

    const selectedNode = useMemo(
        () =>
            nodes.find((node) => node.id === selectedNodeId) ?? null,
        [nodes, selectedNodeId]
    );

    const filteredLibrary = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) {
            return NODE_LIBRARY;
        }

        return NODE_LIBRARY.filter(
            (item) =>
                item.label.toLowerCase().includes(keyword) ||
                item.description.toLowerCase().includes(keyword) ||
                item.type.toLowerCase().includes(keyword)
        );
    }, [search]);

    const pushHistory = useCallback(() => {
        setHistory((current) => [
            ...current.slice(-29),
            {
                nodes: structuredClone(nodes),
                edges: structuredClone(edges),
            },
        ]);

        setFuture([]);
    }, [nodes, edges]);

    const updateNode = useCallback(
        async (
            nodeId: string,
            updater: (node: FlowNode) => FlowNode
        ) => {
            const currentNode = nodes.find((node) => node.id === nodeId);

            if (!currentNode) return;

            pushHistory();

            const updatedNode = updater(currentNode);

            setNodes((current) =>
                current.map((node) =>
                    node.id === nodeId ? updatedNode : node
                )
            );

            try {
                await updateFlowNode(flowId, Number(nodeId), {
                    nodeKey: nodeId,
                    nodeType: updatedNode.data.nodeType,
                    name: updatedNode.data.label,
                    config: JSON.stringify({
                        ...updatedNode.data.config,
                        buttons: updatedNode.data.buttons ?? [],
                    }),
                    positionX: updatedNode.position.x,
                    positionY: updatedNode.position.y,
                });
            } catch (error) {
                console.error("Failed to update flow node:", error);
            }
        },
        [flowId, nodes, pushHistory]
    );

    const onConnect = useCallback(
        async (connection: Connection) => {
            if (!connection.source || !connection.target) return;

            const sourceNodeId = Number(connection.source);
            const targetNodeId = Number(connection.target);

            // START node is currently local-only
            if (
                !Number.isFinite(sourceNodeId) ||
                !Number.isFinite(targetNodeId)
            ) {
                return;
            }

            pushHistory();

            try {
                const apiEdge = await createFlowEdge(flowId, {
                    sourceNodeId,
                    targetNodeId,
                    sourceHandle: connection.sourceHandle ?? null,
                    condition: null,
                });

                setEdges((current) =>
                    addEdge(
                        {
                            id: String(apiEdge.id),
                            source: String(apiEdge.sourceNodeId),
                            target: String(apiEdge.targetNodeId),
                            sourceHandle: apiEdge.sourceHandle ?? undefined,
                            animated: true,
                            style: { strokeWidth: 2 },
                        },
                        current
                    )
                );
            } catch (error) {
                console.error("Failed to create flow edge:", error);
            }
        },
        [flowId, pushHistory]
    );

    const onEdgesDelete = useCallback(
        async (deletedEdges: Edge[]) => {
            pushHistory();

            try {
                await Promise.all(
                    deletedEdges
                        .filter((edge) => Number.isFinite(Number(edge.id)))
                        .map((edge) => deleteFlowEdge(flowId, Number(edge.id)))
                );
            } catch (error) {
                console.error("Failed to delete flow edge:", error);
            }
        },
        [flowId, pushHistory]
    );

    const onNodeDragStop = useCallback(
              async (_event: MouseEvent | TouchEvent, node: FlowNode) => {
            if (!node.id || !Number.isFinite(Number(node.id))) {
                return;
            }

            try {
                await updateFlowNode(flowId, Number(node.id), {
                    nodeKey: node.id,
                    nodeType: node.data.nodeType,
                    name: node.data.label,
                    config: JSON.stringify({
                        ...node.data.config,
                        buttons: node.data.buttons ?? [],
                    }),
                    positionX: node.position.x,
                    positionY: node.position.y,
                });
            } catch (error) {
                console.error("Failed to save node position:", error);
            }
        },
        [flowId]
    );

    const onNodesDelete = useCallback(
        async (deletedNodes: FlowNode[]) => {
            const nodeIds = deletedNodes
                .filter((node) => node.data.nodeType !== "START")
                .map((node) => Number(node.id))
                .filter((id) => Number.isFinite(id));

            if (nodeIds.length === 0) {
                return;
            }

            try {
                await Promise.all(
                    nodeIds.map((nodeId) => deleteFlowNode(flowId, nodeId))
                );
            } catch (error) {
                console.error("Failed to delete flow nodes:", error);
            }
        },
        [flowId]
    );

    const addNode = useCallback(
        async (type: string, position?: { x: number; y: number }) => {
            try {
                const libraryNode = NODE_LIBRARY.find((node) => node.type === type);

                if (!libraryNode) return;

                const config = createDefaultConfig(type);

                const apiNode = await createFlowNode(flowId, {
                    nodeKey: `${type}-${Date.now()}`,
                    nodeType: type,
                    name: libraryNode.label,
                    config: JSON.stringify(config),
                    positionX: position?.x ?? 250,
                    positionY: position?.y ?? 150,
                });

                const newNode: FlowNode = {
                    id: String(apiNode.id),
                    type: "flowNode",
                    position: {
                        x: apiNode.positionX ?? 250,
                        y: apiNode.positionY ?? 150,
                    },
                    data: {
                        nodeType: apiNode.nodeType,
                        label: apiNode.label ?? libraryNode.label,
                        description: libraryNode.description,
                                                 category: libraryNode.category,
                        config,
                        buttons: [],
                    },
                    deletable: type !== "START",
                };

                setNodes((currentNodes) => [...currentNodes, newNode]);
                setSelectedNodeId(String(apiNode.id));
            } catch (error) {
                console.error("Failed to create flow node:", error);
            }
        },
        [flowId, setNodes]
    );


    const onDragStart = (
        event: DragEvent<HTMLButtonElement>,
        definition: NodeDefinition
    ) => {
        event.dataTransfer.setData(
            "application/reactflow",
            definition.type
        );

        event.dataTransfer.effectAllowed = "move";
    };

    const onDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    };

    const onDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();

        const type = event.dataTransfer.getData(
            "application/reactflow"
        );

        if (!type) {
            return;
        }

        const definition = NODE_LIBRARY.find(
            (item) => item.type === type
        );

        if (!definition) {
            return;
        }

        const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });

        addNode(definition.type, position);
    };
    const deleteSelectedNode = async () => {
        if (!selectedNodeId || selectedNode?.data.nodeType === "START") {
            return;
        }
        pushHistory();

        const nodeId = Number(selectedNodeId);

        try {
            await deleteFlowNode(flowId, nodeId);
        } catch (error) {
            console.error("Failed to delete flow node:", error);
            return;
        }

        setNodes((current) =>
            current.filter((node) => node.id !== selectedNodeId)
        );

        setEdges((current) =>
            current.filter(
                (edge) =>
                    edge.source !== selectedNodeId &&
                    edge.target !== selectedNodeId
            )
        );

        setSelectedNodeId(null);
    };

    const undo = () => {
        const previous = history[history.length - 1];

        if (!previous) {
            return;
        }

        setFuture((current) => [
            ...current,
            {
                nodes: structuredClone(nodes),
                edges: structuredClone(edges),
            },
        ]);

        setNodes(previous.nodes);
        setEdges(previous.edges);
        setHistory((current) => current.slice(0, -1));
    };

    const redo = () => {
        const next = future[future.length - 1];

        if (!next) {
            return;
        }

        setHistory((current) => [
            ...current,
            {
                nodes: structuredClone(nodes),
                edges: structuredClone(edges),
            },
        ]);

        setNodes(next.nodes);
        setEdges(next.edges);
        setFuture((current) => current.slice(0, -1));
    };

    const updateConfig = (
        key: string,
        value: string | number | boolean
    ) => {
        if (!selectedNode) {
            return;
        }

        updateNode(selectedNode.id, (node) => ({
            ...node,
            data: {
                ...node.data,
                config: {
                    ...node.data.config,
                    [key]: value,
                },
            },
        }));
    };

    const updateLabel = (value: string) => {
        if (!selectedNode) {
            return;
        }

        updateNode(selectedNode.id, (node) => ({
            ...node,
            data: {
                ...node.data,
                label: value,
            },
        }));
    };

    const addButton = () => {
        if (!selectedNode) {
            return;
        }

        const currentButtons = selectedNode.data.buttons ?? [];

        const button: ButtonConfig = {
            id: `${selectedNode.id}-button-${Date.now()}`,
            text: `Option ${currentButtons.length + 1}`,
        };

        updateNode(selectedNode.id, (node) => ({
            ...node,
            data: {
                ...node.data,
                buttons: [...(node.data.buttons ?? []), button],
            },
        }));
        window.setTimeout(() => updateNodeInternals(selectedNode.id), 0);
    };

    const updateButton = (
        buttonId: string,
        value: string
    ) => {
        if (!selectedNode) {
            return;
        }

        updateNode(selectedNode.id, (node) => ({
            ...node,
            data: {
                ...node.data,
                buttons: (node.data.buttons ?? []).map((button) =>
                    button.id === buttonId
                        ? {
                            ...button,
                            text: value,
                        }
                        : button
                ),
            },
        }));
    };

    const removeButton = (buttonId: string) => {
        if (!selectedNode) {
            return;
        }

        updateNode(selectedNode.id, (node) => ({
            ...node,
            data: {
                ...node.data,
                                buttons: (node.data.buttons ?? []).filter(
                    (button) => button.id !== buttonId
                ),
            },
        }));
        window.setTimeout(() => updateNodeInternals(selectedNode.id), 0);
    };

    const renderPropertyFields = () => {
        if (!selectedNode) {
            return null;
        }

        const config = selectedNode.data.config ?? {};

        switch (selectedNode.data.nodeType) {
            case "TEXT_MESSAGE":
                return (
                    <PropertyTextarea
                        label="Message"
                        value={String(config.text ?? "")}
                        onChange={(value) => updateConfig("text", value)}
                        placeholder="Type your WhatsApp message..."
                    />
                );

            case "IMAGE":
            case "VIDEO":
            case "AUDIO":
            case "DOCUMENT":
                return (
                    <>
                        <PropertyInput
                            label="Media URL"
                            value={String(config.mediaUrl ?? "")}
                            onChange={(value) =>
                                updateConfig("mediaUrl", value)
                            }
                            placeholder="https://..."
                        />

                        <PropertyTextarea
                            label="Caption"
                            value={String(config.caption ?? "")}
                            onChange={(value) =>
                                updateConfig("caption", value)
                            }
                        />
                    </>
                );

            case "BUTTON":
                return (
                    <>
                        <PropertyTextarea
                            label="Message"
                            value={String(config.text ?? "")}
                            onChange={(value) => updateConfig("text", value)}
                        />

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label className="text-xs font-semibold text-slate-700">
                                    Buttons
                                </label>

                                <button
                                    type="button"
                                    onClick={addButton}
                                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600"
                                >
                                    <Plus size={14} />
                                    Add
                                </button>
                            </div>

                            <div className="space-y-2">
                                {(selectedNode.data.buttons ?? []).map(
                                    (button, index) => (
                                        <div
                                            key={button.id}
                                            className="flex items-center gap-2"
                                        >
                                            <input
                                                value={button.text}
                                                onChange={(event) =>
                                                    updateButton(
                                                        button.id,
                                                        event.target.value
                                                    )
                                                }
                                                placeholder={`Button ${index + 1}`}
                                                className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-indigo-500"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeButton(button.id)
                                                }
                                                className="text-slate-400 hover:text-red-500"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </>
                );

            case "LIST":
                return (
                    <>
                        <PropertyTextarea
                            label="Message"
                            value={String(config.text ?? "")}
                            onChange={(value) => updateConfig("text", value)}
                        />

                        <PropertyInput
                            label="Button Text"
                            value={String(config.buttonText ?? "")}
                            onChange={(value) =>
                                updateConfig("buttonText", value)
                            }
                        />
                    </>
                );

            case "TEXT_INPUT":
            case "PHONE_INPUT":
            case "EMAIL_INPUT":
            case "NUMBER_INPUT":
            case "DATE_INPUT":
                return (
                    <>
                        <PropertyTextarea
                            label="Question"
                            value={String(config.question ?? "")}
                            onChange={(value) =>
                                updateConfig("question", value)
                            }
                        />

                        <PropertyInput
                            label="Save response as"
                            value={String(config.variable ?? "")}
                            onChange={(value) =>
                                updateConfig("variable", value)
                            }
                            placeholder="customer_name"
                        />
                    </>
                );

            case "CONDITION":
                return (
                    <>
                        <PropertyInput
                            label="Variable"
                            value={String(config.variable ?? "")}
                            onChange={(value) =>
                                updateConfig("variable", value)
                            }
                            placeholder="customer.status"
                        />

                        <PropertySelect
                            label="Operator"
                            value={String(config.operator ?? "equals")}
                            options={[
                                "equals",
                                "not_equals",
                                "contains",
                                "not_contains",
                                "greater_than",
                                "less_than",
                                "exists",
                                "not_exists",
                            ]}
                            onChange={(value) =>
                                updateConfig("operator", value)
                            }
                        />

                        <PropertyInput
                            label="Value"
                            value={String(config.value ?? "")}
                            onChange={(value) =>
                                updateConfig("value", value)
                            }
                        />
                    </>
                );

            case "DELAY":
                return (
                    <>
                        <PropertyInput
                            label="Amount"
                            type="number"
                            value={String(config.amount ?? 5)}
                            onChange={(value) =>
                                updateConfig("amount", Number(value))
                            }
                        />

                        <PropertySelect
                            label="Unit"
                            value={String(config.unit ?? "MINUTES")}
                            options={[
                                "SECONDS",
                                "MINUTES",
                                "HOURS",
                                "DAYS",
                            ]}
                            onChange={(value) =>
                                updateConfig("unit", value)
                            }
                        />
                    </>
                );

            case "HTTP_REQUEST":
                return (
                    <>
                        <PropertySelect
                            label="Method"
                            value={String(config.method ?? "GET")}
                            options={["GET", "POST", "PUT", "PATCH", "DELETE"]}
                            onChange={(value) =>
                                updateConfig("method", value)
                            }
                        />

                        <PropertyInput
                            label="URL"
                            value={String(config.url ?? "")}
                            onChange={(value) =>
                                updateConfig("url", value)
                            }
                            placeholder="https://api.example.com"
                        />

                        <PropertyTextarea
                            label="Request Body"
                            value={String(config.body ?? "")}
                            onChange={(value) =>
                                updateConfig("body", value)
                            }
                            placeholder='{"name":"{{name}}"}'
                        />

                        <PropertyInput
                            label="Response Variable"
                            value={String(config.responseVariable ?? "")}
                            onChange={(value) =>
                                updateConfig("responseVariable", value)
                            }
                        />
                    </>
                );

            case "SET_VARIABLE":
                return (
                    <>
                        <PropertyInput
                            label="Variable"
                            value={String(config.variable ?? "")}
                            onChange={(value) =>
                                updateConfig("variable", value)
                            }
                        />

                        <PropertyInput
                            label="Value"
                            value={String(config.value ?? "")}
                            onChange={(value) =>
                                updateConfig("value", value)
                            }
                        />
                    </>
                );

            case "ADD_TAG":
            case "REMOVE_TAG":
                return (
                    <PropertyInput
                        label="Tag"
                        value={String(config.tag ?? "")}
                        onChange={(value) => updateConfig("tag", value)}
                        placeholder="customer"
                    />
                );

            case "ASSIGN_AGENT":
                return (
                    <PropertyInput
                        label="Agent ID"
                        value={String(config.agentId ?? "")}
                        onChange={(value) =>
                            updateConfig("agentId", value)
                        }
                    />
                );

            case "PRODUCT":
                return (
                    <PropertyInput
                        label="Product ID"
                        value={String(config.productId ?? "")}
                        onChange={(value) =>
                            updateConfig("productId", value)
                        }
                    />
                );

            case "CATALOG":
                return (
                    <PropertyInput
                        label="Catalog ID"
                        value={String(config.catalogId ?? "")}
                        onChange={(value) =>
                            updateConfig("catalogId", value)
                        }
                    />
                );

            case "KEYWORD_TRIGGER":
                return (
                    <PropertyTextarea
                        label="Keywords"
                        value={String(config.keywords ?? "")}
                        onChange={(value) =>
                            updateConfig("keywords", value)
                        }
                        placeholder="hi, hello, start"
                    />
                );

            default:
                return (
                    <p className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                        This node is ready for configuration.
                    </p>
                );
        }
    };

    const nodeTypes = useMemo(
        () => ({
            flowNode: FlowNodeCard,
        }),
        []
    );

    return (
        <div className="flex h-[calc(100vh-80px)] min-h-0 flex-col overflow-hidden bg-slate-50">
            {/* HEADER */}
            <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <Play
                                size={16}
                                className="text-indigo-600"
                            />

                            <h1 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                                {flowName}
                            </h1>
                        </div>

                        <p className="text-[11px] text-slate-400">
                            Flow #{flowId} · Visual Builder
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={undo}
                        disabled={history.length === 0}
                        className="hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 sm:flex"
                        title="Undo"
                    >
                        <Undo2 size={16} />
                    </button>

                    <button
                        type="button"
                        onClick={redo}
                        disabled={future.length === 0}
                        className="hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 sm:flex"
                        title="Redo"
                    >
                        <Redo2 size={16} />
                    </button>

                    <span className="hidden rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700 sm:block">
                        DRAFT
                    </span>

                    <button
                        type="button"
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 sm:px-4 sm:text-sm"
                    >
                        <Upload size={15} />
                        <span className="hidden sm:inline">
                            Save Flow
                        </span>
                    </button>
                </div>
            </header>

            {/* BUILDER */}
            <div className="relative flex min-h-0 flex-1">
                {/* LEFT LIBRARY */}
                {showLibrary && (
                    <aside className="absolute left-0 top-0 z-30 h-full w-[280px] overflow-y-auto border-r border-slate-200 bg-white shadow-xl lg:relative lg:shadow-none">
                        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Node Library
                                    </h2>

                                    <p className="mt-1 text-[11px] text-slate-400">
                                        Drag or click a node to add it
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowLibrary(false)}
                                    className="lg:hidden"
                                >
                                    <X size={17} />
                                </button>
                            </div>

                            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
                                <Search
                                    size={15}
                                    className="text-slate-400"
                                />

                                <input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search nodes..."
                                    className="h-9 min-w-0 flex-1 bg-transparent text-xs outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-5 p-3">
                            {CATEGORY_ORDER.map((category) => {
                                const items = filteredLibrary.filter(
                                    (item) => item.category === category
                                );

                                if (items.length === 0) {
                                    return null;
                                }

                                return (
                                    <section key={category}>
                                        <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            {CATEGORY_LABELS[category]}
                                        </p>

                                        <div className="space-y-1.5">
                                            {items.map((item) => {
                                                const Icon = item.icon;

                                                return (
                                                    <button
                                                        key={item.type}
                                                        type="button"
                                                        draggable
                                                        onDragStart={(event) =>
                                                            onDragStart(event, item)
                                                        }
                                                        onClick={() => addNode(item.type)}
                                                        className="group flex w-full items-center gap-3 rounded-xl border border-transparent bg-white p-2.5 text-left transition hover:border-indigo-200 hover:bg-indigo-50"
                                                    >
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-white group-hover:text-indigo-600">
                                                            <Icon size={17} />
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs font-semibold text-slate-800">
                                                                {item.label}
                                                            </p>

                                                            <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-400">
                                                                {item.description}
                                                            </p>
                                                        </div>

                                                        <Plus
                                                            size={14}
                                                            className="text-slate-300 group-hover:text-indigo-600"
                                                        />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    </aside>
                )}

                {/* CANVAS */}
                <div
                    ref={reactFlowWrapper}
                    className="relative min-w-0 flex-1"
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                >
                    {!showLibrary && (
                        <button
                            type="button"
                            onClick={() => setShowLibrary(true)}
                            className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-md"
                        >
                            <Plus size={15} />
                            Nodes
                        </button>
                    )}

                    {!showProperties && (
                        <button
                            type="button"
                            onClick={() => setShowProperties(true)}
                            className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-md"
                        >
                            <Settings2 size={15} />
                            Properties
                        </button>
                    )}

                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        onNodesChange={(changes) => {
                            setNodes((currentNodes) =>
                                applyNodeChanges(changes, currentNodes)
                            );
                        }}
                        onEdgesChange={(changes) =>
                            setEdges((current) => applyEdgeChanges(changes, current))
                        }
                        onConnect={onConnect}
                        onEdgesDelete={onEdgesDelete}
                        onNodeDragStop={onNodeDragStop}
                        onNodesDelete={onNodesDelete}


                        onNodeClick={(_, node) => {
                            setSelectedNodeId(node.id);
                            setShowProperties(true);
                        }}
                        onPaneClick={() => setSelectedNodeId(null)}
                        fitView
                        fitViewOptions={{
                            padding: 0.25,
                        }}
                        defaultEdgeOptions={{
                            animated: true,
                            style: {
                                strokeWidth: 2,
                            },
                        }}
                        deleteKeyCode={["Backspace", "Delete"]}
                    >
                        <Background
                            gap={20}
                            size={1}
                            color="#e2e8f0"
                        />

                        <Controls />

                        <MiniMap
                            pannable
                            zoomable
                            nodeColor="#6366f1"
                        />
                    </ReactFlow>
                </div>

                {/* RIGHT PROPERTIES */}
                {showProperties && (
                    <aside className="absolute right-0 top-0 z-30 h-full w-[320px] overflow-y-auto border-l border-slate-200 bg-white shadow-xl lg:relative lg:shadow-none">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                            <div>
                                <h2 className="text-sm font-semibold text-slate-900">
                                    Properties
                                </h2>

                                <p className="text-[10px] text-slate-400">
                                    Configure selected node
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowProperties(false)}
                                className="text-slate-400 hover:text-slate-700"
                            >
                                <X size={17} />
                            </button>
                        </div>

                        {!selectedNode ? (
                            <div className="flex h-[calc(100%-65px)] items-center justify-center p-6 text-center">
                                <div>
                                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                        <Settings2 size={20} />
                                    </div>

                                    <p className="text-sm font-semibold text-slate-700">
                                        Select a node
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-slate-400">
                                        Click any node on the canvas to configure
                                        its behavior.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5 p-4">
                                <div className="rounded-xl bg-indigo-50 p-3">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                                        {selectedNode.data.category}
                                    </p>

                                    <p className="mt-1 text-sm font-bold text-slate-900">
                                        {selectedNode.data.nodeType.replaceAll(
                                            "_",
                                            " "
                                        )}
                                    </p>
                                </div>

                                <PropertyInput
                                    label="Node Name"
                                    value={selectedNode.data.label}
                                    onChange={updateLabel}
                                />

                                {renderPropertyFields()}

                                {selectedNode.data.nodeType !== "START" && (
                                    <button
                                        type="button"
                                        onClick={deleteSelectedNode}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                                    >
                                        <Trash2 size={15} />
                                        Delete Node
                                    </button>
                                )}
                            </div>
                        )}
                    </aside>
                )}
            </div>
        </div>
    );
}

function PropertyInput({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                {label}
            </label>

            <input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
        </div>
    );
}

function PropertyTextarea({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                {label}
            </label>

            <textarea
                value={value}
                placeholder={placeholder}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                rows={5}
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs leading-5 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
        </div>
    );
}

function PropertySelect({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                {label}
            </label>

            <div className="relative">
                <select
                    value={value}
                    onChange={(event) =>
                        onChange(event.target.value)
                    }
                    className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-xs text-slate-800 outline-none focus:border-indigo-500"
                >
                    {options.map((option) => (
                        <option key={option} value={option}>
                            {option.replaceAll("_", " ")}
                        </option>
                    ))}
                </select>

                <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-3 text-slate-400"
                />
            </div>
        </div>
    );
}

export default function FlowBuilder(props: FlowBuilderProps) {
    return (
        <ReactFlowProvider>
            <FlowBuilderCanvas {...props} />
        </ReactFlowProvider>
    );
}