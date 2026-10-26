import api from "./axios";

export interface MembershipRow {
    id: number;
    customerName: string | null;
    customerPhone: string;
    planId: number;
    planName: string;
    durationDays: number | null;
    paymentMethod: "ONLINE" | "CASH";
    status: string;
    amount: number;
    currency: string;
    requestedAt: string;
    startDate: string | null;
    endDate: string | null;
    daysLeft: number | null;
}

export interface MembershipOrder {
    id: number;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    currency: string;
    itemCount: number;
    createdAt: string;
}

export const getMemberships = async (): Promise<MembershipRow[]> =>
    (await api.get<MembershipRow[]>("/memberships")).data;

export const approveMembership = async (id: number) =>
    (await api.post(`/memberships/${id}/approve`)).data;

export const rejectMembership = async (id: number) =>
    (await api.post(`/memberships/${id}/reject`)).data;

export const getMembershipOrders = async (id: number): Promise<MembershipOrder[]> =>
    (await api.get<MembershipOrder[]>(`/memberships/${id}/orders`)).data;

export interface MembershipBenefit {
    orderNumber: string;
    at: string;
    items: { name: string; qty: number }[];
}

export const getMembershipBenefits = async (id: number): Promise<MembershipBenefit[]> =>
    (await api.get<MembershipBenefit[]>(`/memberships/${id}/benefits`)).data;
