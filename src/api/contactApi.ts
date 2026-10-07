import api from "./axios";

export interface Contact {
  id: number;
  organizationId: number | null;
  name: string;
  phoneNumber: string;
  email: string | null;
  profileName: string | null;
  status: string;
  createdAt: string;
}

/**
 * Get all contacts
 */
export const getContacts = async (): Promise<Contact[]> => {
  const response = await api.get<Contact[]>("/contacts");

  return response.data;
};

/**
 * Get contact by ID
 */
export const getContactById = async (
  contactId: number
): Promise<Contact> => {
  const response = await api.get<Contact>(
    `/contacts/${contactId}`
  );

  return response.data;
};

/**
 * Create contact
 */
export const createContact = async (
  contact: Omit<
    Contact,
    "id" | "organizationId" | "createdAt"
  >
): Promise<Contact> => {
  const response = await api.post<Contact>(
    "/contacts",
    contact
  );

  return response.data;
};

/**
 * Update contact
 */
export const updateContact = async (
  contactId: number,
  contact: Partial<
    Omit<Contact, "id" | "organizationId" | "createdAt">
  >
): Promise<Contact> => {
  const response = await api.put<Contact>(
    `/contacts/${contactId}`,
    contact
  );

  return response.data;
};

/**
 * Delete contact
 */
export const deleteContact = async (
  contactId: number
): Promise<void> => {
  await api.delete(`/contacts/${contactId}`);
};