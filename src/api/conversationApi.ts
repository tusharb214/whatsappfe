 import api from "./axios";

export interface Conversation {
  id: number;
  organizationId: number | null;

  contactId: number | null;
  contactName: string | null;
  phoneNumber: string | null;

  assignedAgentId: number | null;
  assignedAgentName: string | null;

  status: string;

  lastMessageAt: string | null;
  createdAt: string;

  unreadCount: number;

  lastMessageText: string | null;
  lastMessageDirection: string | null;
}

/**
 * Get all conversations
 *
 * Optional filters:
 * - status
 * - assignedAgentId
 * - unread
 */
export const getConversations = async (params?: {
  status?: string;
  assignedAgentId?: number;
  unread?: boolean;
}): Promise<Conversation[]> => {
  const response = await api.get<Conversation[]>(
    "/conversations",
    {
      params,
    }
  );

  return response.data;
};

/**
 * Get conversation by ID
 */
export const getConversationById = async (
  conversationId: number
): Promise<Conversation> => {
  const response = await api.get<Conversation>(
    `/conversations/${conversationId}`
  );

  return response.data;
};

/**
 * Create conversation for a contact
 */
export const createConversation = async (
  contactId: number
): Promise<Conversation> => {
  const response = await api.post<Conversation>(
    `/conversations/contact/${contactId}`
  );

  return response.data;
};

/**
 * Assign conversation to an agent
 */
export const assignConversation = async (
  conversationId: number,
  agentId: number
): Promise<Conversation> => {
  const response = await api.put<Conversation>(
    `/conversations/${conversationId}/assign/${agentId}`
  );

  return response.data;
};

/**
 * Update conversation status
 */
export const updateConversationStatus = async (
  conversationId: number,
  status: string
): Promise<Conversation> => {
  const response = await api.put<Conversation>(
    `/conversations/${conversationId}/status`,
    null,
    {
      params: {
        status,
      },
    }
  );

  return response.data;
};

/**
 * Get conversations assigned to
 * currently logged-in agent
 */
export const getMyConversations = async (): Promise<
  Conversation[]
> => {
  const response = await api.get<Conversation[]>(
    "/conversations/my"
  );

  return response.data;
};

/**
 * Mark conversation as read
 */
export const markConversationAsRead = async (
  conversationId: number
): Promise<string> => {
  const response = await api.put<string>(
    `/conversations/${conversationId}/read`
  );

  return response.data;
};

/**
 * Search conversations
 */
export const searchConversations = async (
  keyword: string
): Promise<Conversation[]> => {
  const response = await api.get<Conversation[]>(
    "/conversations/search",
    {
      params: {
        keyword,
      },
    }
  );

  return response.data;
};