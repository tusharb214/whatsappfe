import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import {
    ORDER_STATUSES,
    PAYMENT_STATUSES,
    getOrders,
    updateOrderStatus,
    updatePaymentStatus,
    type Order,
    type OrderStatus,
    type PaymentStatus,
} from "../../api/orderApi";

const nice = (value: string) => value.replaceAll("_", " ");

const money = (amount: number | null | undefined, currency?: string | null) =>
    `${currency === "INR" || !currency ? "Rs" : currency} ${Number(amount ?? 0)}`;

const summary = (order: Order) => {
    const items = order.items ?? [];
    if (items.length === 0) return "-";
    const first = items
        .slice(0, 2)
        .map((i) => `${i.productName} x ${i.quantity}`)
        .join(", ");
    return items.length > 2 ? `${first} +${items.length - 2} more` : first;
};

const badge = (value: string) =>
    value === "DELIVERED" || value === "PAID"
        ? "bg-emerald-50 text-emerald-700"
        : value === "CANCELLED" || value === "FAILED"
        ? "bg-red-50 text-red-700"
        : value === "NEW"
        ? "bg-blue-50 text-blue-700"
        : "bg-amber-50 text-amber-700";

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState<"ALL" | OrderStatus>("ALL");
    const [search, setSearch] = useState("");
    const [openId, setOpenId] = useState<number | null>(null);

    const load = useCallback(async () => {
        try {
            setOrders(await getOrders());
            setError("");
        } catch (e) {
            console.error("Failed to load orders:", e);
            setError("Could not load orders.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
        const timer = window.setInterval(() => void load(), 20000);
        return () => window.clearInterval(timer);
    }, [load]);

    const replace = (updated: Order) =>
        setOrders((cur) => cur.map((o) => (o.id === updated.id ? updated : o)));

    const changeStatus = async (order: Order, status: OrderStatus) => {
        try {
            replace(await updateOrderStatus(order.id, status));
        } catch (e) {
            console.error(e);
            setError("Status update failed.");
        }
    };

    const changePayment = async (order: Order, status: PaymentStatus) => {
        try {
            replace(await updatePaymentStatus(order.id, status));
        } catch (e) {
            console.error(e);
            setError("Payment update failed.");
        }
    };

    const visible = useMemo(() => {
        const k = search.trim().toLowerCase();
        return orders.filter((o) => {
            if (filter !== "ALL" && o.status !== filter) return false;
            if (!k) return true;
            return (
                (o.orderNumber ?? "").toLowerCase().includes(k) ||
                (o.customerName ?? "").toLowerCase().includes(k) ||
                (o.customerPhone ?? "").toLowerCase().includes(k) ||
                (o.items ?? []).some((i) => i.productName.toLowerCase().includes(k))
            );
        });
    }, [orders, filter, search]);

    return (
        <div className="space-y-4 p-4 sm:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold text-slate-900">Orders</h1>
                    <p className="text-xs text-slate-500">
                        Orders placed on WhatsApp. Refreshes every 20 seconds.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => void load()}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                >
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {(["ALL", ...ORDER_STATUSES] as const).map((s) => (
                    <button
                        key={s}
                        type="button"
                        onClick={() => setFilter(s)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                            filter === s
                                ? "border-indigo-600 bg-indigo-600 text-white"
                                : "border-slate-200 bg-white text-slate-600"
                        }`}
                    >
                        {nice(s)} (
                        {s === "ALL"
                            ? orders.length
                            : orders.filter((o) => o.status === s).length}
                        )
                    </button>
                ))}
            </div>

            <div className="flex max-w-md items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
                <Search size={15} className="text-slate-400" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search order no, customer, phone, item..."
                    className="h-9 min-w-0 flex-1 bg-transparent text-xs outline-none"
                />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="min-w-full text-left text-xs">
                    <thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Order</th>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Items</th>
                            <th className="px-4 py-3">Total</th>
                            <th className="px-4 py-3">Payment</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visible.map((order) => (
                            <Fragment key={order.id}>
                                <tr
                                    onClick={() => setOpenId(openId === order.id ? null : order.id)}
                                    className="cursor-pointer border-b border-slate-100 align-top hover:bg-slate-50"
                                >
                                    <td className="px-4 py-3">
                                        <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                                        <p className="text-[10px] text-slate-400">
                                            {new Date(order.createdAt).toLocaleString("en-IN")}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-slate-800">
                                            {order.customerName || "Customer"}
                                        </p>
                                        <p className="text-[10px] text-slate-400">{order.customerPhone}</p>
                                    </td>
                                    <td className="max-w-[260px] px-4 py-3 text-slate-700">{summary(order)}</td>
                                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">
                                        {money(order.totalAmount, order.currency)}
                                    </td>
                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                        <select
                                            value={order.paymentStatus}
                                            onChange={(e) => void changePayment(order, e.target.value as PaymentStatus)}
                                            className={`rounded-full px-2 py-1 text-[11px] font-semibold outline-none ${badge(order.paymentStatus)}`}
                                        >
                                            {PAYMENT_STATUSES.map((s) => (
                                                <option key={s} value={s}>{nice(s)}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                        <select
                                            value={order.status}
                                            onChange={(e) => void changeStatus(order, e.target.value as OrderStatus)}
                                            className={`rounded-full px-2 py-1 text-[11px] font-semibold outline-none ${badge(order.status)}`}
                                        >
                                            {ORDER_STATUSES.map((s) => (
                                                <option key={s} value={s}>{nice(s)}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>

                                {openId === order.id && (
                                    <tr className="border-b border-slate-100 bg-slate-50">
                                        <td colSpan={6} className="px-4 py-3">
                                            <p className="mb-2 text-[11px] font-semibold text-slate-700">
                                                Items ordered
                                            </p>
                                            <div className="space-y-1">
                                                {(order.items ?? []).map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2"
                                                    >
                                                        <span className="text-xs text-slate-800">
                                                            {item.productName}{" "}
                                                            <span className="text-slate-400">x {item.quantity}</span>
                                                        </span>
                                                        <span className="text-xs text-slate-600">
                                                            {money(item.unitPrice, item.currency)} each ={" "}
                                                            {money(item.totalPrice, item.currency)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            {order.shippingAddress && (
                                                <p className="mt-2 text-xs text-slate-600">
                                                    Address: {order.shippingAddress}
                                                </p>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))}
                        {(loading || visible.length === 0) && (
                            <tr>
                                <td colSpan={6} className="px-4 py-10 text-center text-xs text-slate-400">
                                    {loading ? "Loading orders..." : "No orders found."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
