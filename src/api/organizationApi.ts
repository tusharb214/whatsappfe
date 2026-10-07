 import { storage } from "../utils/storage";

const API_BASE_URL = "http://localhost:8080";

export interface Organization {
  id: number;
  name: string;
  email: string;
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "SUSPENDED";
  createdAt: string;
}

async function organizationRequest(
  endpoint: string,
  method: "GET" | "PUT"
) {
  const token = storage.getAccessToken();

  if (!token) {
    throw new Error("Authentication token not found");
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }

    if (response.status === 403) {
      throw new Error(
        "You do not have permission to perform this action"
      );
    }

    const message =
      await response.text();

    throw new Error(
      message ||
        `Request failed (${response.status})`
    );
  }

  return response;
}

/* =========================================
   GET ALL ORGANIZATIONS
   ========================================= */

export async function getOrganizations(): Promise<
  Organization[]
> {
  const response =
    await organizationRequest(
      "/api/organizations",
      "GET"
    );

  return response.json();
}

/* =========================================
   APPROVE
   ========================================= */

export async function approveOrganization(
  id: number
): Promise<Organization> {
  const response =
    await organizationRequest(
      `/api/organizations/${id}/approve`,
      "PUT"
    );

  return response.json();
}

/* =========================================
   REJECT
   ========================================= */

export async function rejectOrganization(
  id: number
): Promise<Organization> {
  const response =
    await organizationRequest(
      `/api/organizations/${id}/reject`,
      "PUT"
    );

  return response.json();
}

/* =========================================
   SUSPEND
   ========================================= */

export async function suspendOrganization(
  id: number
): Promise<Organization> {
  const response =
    await organizationRequest(
      `/api/organizations/${id}/suspend`,
      "PUT"
    );

  return response.json();
}

/* =========================================
   ACTIVATE
   ========================================= */

export async function activateOrganization(
  id: number
): Promise<Organization> {
  const response =
    await organizationRequest(
      `/api/organizations/${id}/activate`,
      "PUT"
    );

  return response.json();
}