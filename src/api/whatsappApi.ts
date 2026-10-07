import api from "./axios";

export type WhatsAppNumberStatus =
  | "ACTIVE"
  | "INACTIVE";

export interface WhatsAppNumber {
  id: number;
  organizationId: number | null;

  phoneNumber: string;
  displayName: string | null;

  phoneNumberId: string;
  wabaId: string;

  status: WhatsAppNumberStatus;

  createdAt: string;
}

/**
 * Get all WhatsApp numbers
 */
export const getWhatsAppNumbers = async (): Promise<
  WhatsAppNumber[]
> => {
  const response = await api.get<WhatsAppNumber[]>(
    "/whatsapp-numbers"
  );

  return response.data;
};

/**
 * Get WhatsApp number by ID
 */
export const getWhatsAppNumberById = async (
  id: number
): Promise<WhatsAppNumber> => {
  const response = await api.get<WhatsAppNumber>(
    `/whatsapp-numbers/${id}`
  );

  return response.data;
};

/**
 * Create WhatsApp number
 * SUPER_ADMIN only
 */
export const createWhatsAppNumber = async (
  organizationId: number,
  data: {
    phoneNumber: string;
    displayName?: string;
    phoneNumberId: string;
    wabaId: string;
    accessToken: string;
    status?: WhatsAppNumberStatus;
  }
): Promise<WhatsAppNumber> => {
  const response = await api.post<WhatsAppNumber>(
    `/whatsapp-numbers/organization/${organizationId}`,
    data
  );

  return response.data;
};

/**
 * Update WhatsApp number
 * SUPER_ADMIN only
 */
export const updateWhatsAppNumber = async (
  id: number,
  data: {
    phoneNumber?: string;
    displayName?: string;
    phoneNumberId?: string;
    wabaId?: string;
    accessToken?: string;
    status?: WhatsAppNumberStatus;
  }
): Promise<WhatsAppNumber> => {
  const response = await api.put<WhatsAppNumber>(
    `/whatsapp-numbers/${id}`,
    data
  );

  return response.data;
};

/**
 * Delete WhatsApp number
 * SUPER_ADMIN only
 */
export const deleteWhatsAppNumber = async (
  id: number
): Promise<void> => {
  await api.delete(`/whatsapp-numbers/${id}`);
};