 import api from "./axios";

export interface Message {
  id: number;
  conversationId: number;
  organizationId: number | null;
  direction: "INCOMING" | "OUTGOING";

  messageType: string;
  messageText: string;

  senderAgentId: number | null;
  senderAgentName: string | null;

  whatsappMessageId: string | null;

  mediaId: string | null;
  mediaUrl: string | null;
  mediaMimeType: string | null;
  mediaFileName: string | null;
  mediaSize: number | null;
  mediaCaption: string | null;

  deliveryStatus: string | null;

  createdAt: string;
  updatedAt: string | null;
}

export const getMessagesByConversation = async (
  conversationId: number
): Promise<Message[]> => {
  const response = await api.get<Message[]>(
    `/messages/conversation/${conversationId}`
  );

  return response.data;
};

export const sendMessage = async (
  conversationId: number,
  messageText: string
): Promise<Message> => {
  const response = await api.post<Message>(
    `/messages/conversation/${conversationId}/send`,
    null,
    {
      params: {
        messageText,
        messageType: "TEXT",
      },
    }
  );

  return response.data;
};

export interface MediaUploadResponse {
  success: boolean;
  mediaId: string;
  fileName: string;
  mimeType: string;
  size: number;
}

export const uploadWhatsAppMedia = async (
  file: File
): Promise<MediaUploadResponse> => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post<MediaUploadResponse>(
    "/messages/media/upload",
    formData
  );

  return response.data;
};

export const sendMediaMessage = async (
  conversationId: number,
  mediaId: string,
  messageType: "IMAGE" | "DOCUMENT" | "VIDEO" | "AUDIO",
  fileName?: string,
  caption?: string
): Promise<Message> => {
  const response = await api.post<Message>(
    `/messages/conversation/${conversationId}/send-media`,
    null,
    {
      params: {
        mediaId,
        messageType,
        fileName,
        caption,
      },
    }
  );

  return response.data;
};