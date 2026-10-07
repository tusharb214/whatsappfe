import api from "./axios";

export interface SendProductResponse {
  success?: boolean;
  messageId?: string;
  message?: string;
}

export const sendProductMessage = async (
  conversationId: number,
  productId: number
): Promise<SendProductResponse> => {
  const response = await api.post<SendProductResponse>(
    "/catalogue/send-product",
    null,
    {
      params: {
        conversationId,
        productId,
      },
    }
  );

  return response.data;
};