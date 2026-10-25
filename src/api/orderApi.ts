import api from "./axios";

export type OrderStatus =
    | "NEW" | "CONFIRMED" | "PROCESSING" | "READY"
    | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export const ORDER_STATUSES: OrderStatus[] = [
    "NEW", "CONFIRMED", "PROCESSING", "READY",
    "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED",
];

export const PAYMENT_STATUSES: PaymentStatus[] = [
    "PENDING", "PAID", "FAILED", "REFUNDED",
];

export interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    sku: string | null;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    currency: string | null;
}

export interface Order {
    id: number;
    conversationId: number;
    contactId: number;
    orderNumber: string;
    totalAmount: number;
    currency: string | null;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    shippingAddress?: string | null;
    customerPhone?: string | null;
    customerName?: string | null;
    items: OrderItem[];
    createdAt: string;
}

export const getOrders = async (): Promise<Order[]> =>
    (await api.get<Order[]>("/orders")).data;

export const getOrdersByConversation = async (
    conversationId: number
): Promise<Order[]> =>
    (await api.get<Order[]>(`/orders/conversation/${conversationId}`)).data;

export const updateOrderStatus = async (
    orderId: number,
    status: OrderStatus
): Promise<Order> =>
    (await api.put<Order>(`/orders/${orderId}/status`, null, { params: { status } })).data;

export const updatePaymentStatus = async (
    orderId: number,
    paymentStatus: PaymentStatus
): Promise<Order> =>
    (await api.put<Order>(`/orders/${orderId}/payment`, null, { params: { paymentStatus } })).data;
