import api from "./axios";

export type FlowStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "DELETED";

export interface Flow {
  id: number;
  organizationId: number | null;
  name: string;
  description: string | null;
  metaFlowId: string | null;
  status: FlowStatus;
  metaFlowStatus: string | null;
  version: number;
  createdAt: string;
  updatedAt: string | null;
  lastPublishedAt: string | null;
  lastPublishError: string | null;
}

export interface FlowRequest {
  name: string;
  description?: string;
}

export interface FlowNode {
  id: number;
  flowId: number;
  nodeType: string;
  label: string | null;
  config: string | null;
  positionX: number | null;
  positionY: number | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface FlowEdge {
  id: number;
  flowId: number;
  sourceNodeId: number;
  targetNodeId: number;
  sourceHandle: string | null;
  condition: string | null;
  createdAt: string;
}

/* =========================
   FLOW
========================= */

export const getFlows = async (): Promise<Flow[]> => {
  const response = await api.get<Flow[]>("/flows");
  return response.data;
};

export const getFlowById = async (
  flowId: number
): Promise<Flow> => {
  const response = await api.get<Flow>(`/flows/${flowId}`);
  return response.data;
};

export const createFlow = async (
  request: FlowRequest
): Promise<Flow> => {
  const response = await api.post<Flow>("/flows", request);
  return response.data;
};

export const updateFlow = async (
  flowId: number,
  request: FlowRequest
): Promise<Flow> => {
  const response = await api.put<Flow>(
    `/flows/${flowId}`,
    request
  );
  return response.data;
};

export const deleteFlow = async (
  flowId: number
): Promise<void> => {
  await api.delete(`/flows/${flowId}`);
};

/* =========================
   NODES
========================= */

export const getFlowNodes = async (
  flowId: number
): Promise<FlowNode[]> => {
  const response = await api.get<FlowNode[]>(
    `/flows/${flowId}/nodes`
  );
  return response.data;
};


export interface FlowNodeRequest {
  nodeKey: string;
  nodeType: string;
  name: string;
  config?: string | null;
  positionX?: number | null;
  positionY?: number | null;
}

export const createFlowNode = async (
  flowId: number,
  request: FlowNodeRequest
): Promise<FlowNode> => {
  const response = await api.post<FlowNode>(
    `/flows/${flowId}/nodes`,
    request
  );

  return response.data;
};

export const updateFlowNode = async (
  flowId: number,
  nodeId: number,
  request: FlowNodeRequest
): Promise<FlowNode> => {
  const response = await api.put<FlowNode>(
    `/flows/${flowId}/nodes/${nodeId}`,
    request
  );

  return response.data;
};

export const deleteFlowNode = async (
  flowId: number,
  nodeId: number
): Promise<void> => {
  await api.delete(`/flows/${flowId}/nodes/${nodeId}`);
};

/* =========================
   EDGES
========================= */

export const getFlowEdges = async (
  flowId: number
): Promise<FlowEdge[]> => {
  const response = await api.get<FlowEdge[]>(
    `/flows/${flowId}/edges`
  );
  return response.data;
};
export interface FlowEdgeRequest {
  sourceNodeId: number;
  targetNodeId: number;
  sourceHandle?: string | null;
  condition?: string | null;
}

export const createFlowEdge = async (
  flowId: number,
  request: FlowEdgeRequest
): Promise<FlowEdge> => {
  const response = await api.post<FlowEdge>(
    `/flows/${flowId}/edges`,
    request
  );

  return response.data;
};

export const updateFlowEdge = async (
  flowId: number,
  edgeId: number,
  request: FlowEdgeRequest
): Promise<FlowEdge> => {
  const response = await api.put<FlowEdge>(
    `/flows/${flowId}/edges/${edgeId}`,
    request
  );

  return response.data;
};

export const deleteFlowEdge = async (
  flowId: number,
  edgeId: number
): Promise<void> => {
  await api.delete(`/flows/${flowId}/edges/${edgeId}`);
};
/* =========================
   META
========================= */

export const syncFlowToMeta = async (
  flowId: number
): Promise<unknown> => {
  const response = await api.post(
    `/flows/${flowId}/sync-meta`
  );
  return response.data;
};

export const getFlowMetaJson = async (
  flowId: number
): Promise<unknown> => {
  const response = await api.get(
    `/flows/${flowId}/meta-json`
  );
  return response.data;
};

export const publishFlowToMeta = async (
  flowId: number
): Promise<void> => {
  await api.post(`/flows/${flowId}/publish-meta`);
};

export const testFlow = async (
  flowId: number,
  customerPhoneNumber: string
): Promise<string> => {
  const response = await api.post<string>(
    `/flows/${flowId}/test`,
    null,
    {
      params: {
        customerPhoneNumber,
      },
    }
  );

  return response.data;
};