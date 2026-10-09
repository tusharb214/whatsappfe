import { storage } from "../utils/storage";

// const API_BASE_URL = "http://localhost:8080";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "AGENT";
  status: "ACTIVE" | "INACTIVE";
  organizationId: number | null;
  organizationName: string | null;
  createdAt: string;
}

async function userRequest(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: unknown
) {
  const token = storage.getAccessToken();

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      ...(body !== undefined
        ? {
            body: JSON.stringify(body),
          }
        : {}),
    }
  );

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const errorData = await response.json();

      if (errorData?.message) {
        message = errorData.message;
      } else if (errorData?.error) {
        message = errorData.error;
      }
    } catch {
      // Ignore JSON parsing error
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// =========================================
// GET ALL USERS
// =========================================

export async function getUsers(): Promise<User[]> {
  return userRequest("/api/users", "GET");
}

// =========================================
// GET USER BY ID
// =========================================

export async function getUserById(
  id: number
): Promise<User> {
  return userRequest(`/api/users/${id}`, "GET");
}

// =========================================
// ACTIVATE USER
// =========================================

export async function activateUser(
  id: number
): Promise<User> {
  return userRequest(
    `/api/users/${id}/activate`,
    "PUT"
  );
}

// =========================================
// DEACTIVATE USER
// =========================================

export async function deactivateUser(
  id: number
): Promise<User> {
  return userRequest(
    `/api/users/${id}/deactivate`,
    "PUT"
  );
}

// =========================================
// CREATE ORGANIZATION ADMIN
// =========================================

export async function createOrganizationAdmin(
  organizationId: number,
  data: {
    name: string;
    email: string;
    password: string;
    role: "ADMIN";
  }
): Promise<User> {
  return userRequest(
    `/api/users/organization/${organizationId}/admin`,
    "POST",
    data
  );
}

// =========================================
// UPDATE USER
// =========================================

export async function updateUser(
  id: number,
  data: {
    name: string;
    email: string;
    password?: string;
    role: "ADMIN" | "AGENT";
  }
): Promise<User> {
  return userRequest(
    `/api/users/${id}`,
    "PUT",
    data
  );
}

// =========================================
// DELETE USER
// =========================================

export async function deleteUser(
  id: number
): Promise<void> {
  await userRequest(
    `/api/users/${id}`,
    "DELETE"
  );
}