import { useCallback, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import {
    approveMembership,
    getMembershipBenefits,
    getMemberships,
    rejectMembership,
    type MembershipBenefit,
    type MembershipRow,
} from "../../api/membershipApi";

const fmt = (v: string | null) =>
    v ? new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";
const fmtTime = (v: string | null) =>
    v ? new Date(v).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "-";
const money = (n: number, c?: string) => `${!c || c === "INR" ? "Rs" : c} ${Number(n ?? 0)}`;
const iso = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const addDays = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return iso(d);
};

const STATUS_LABEL: Record<string, string> = {
    ACTIVE: "Active",
    PENDING_APPROVAL: "Pending approval",
    PENDING_PAYMENT: "Pending payment",
    EXPIRED: "Expired",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
};

const STATUS_COLOR: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    PENDING_APPROVAL: "bg-amber-100 text-amber-700",
    PENDING_PAYMENT: "bg-amber-100 text-amber-700",
    EXPIRED: "bg-slate-100 text-slate-600",
    REJECTED: "bg-red-100 text-red-700",
    CANCELLED: "bg-red-100 text-red-700",
};

type DateField = "requestedAt" | "startDate" | "endDate";
const FIELD_LABEL: Record<DateField, string> = {
    requestedAt: "Bought / requested on",
    startDate: "Starts on",
    endDate: "Ends on",
};

const inputCls =
    "h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]";

export default function MembershipsPage() {
    const [rows, setRows] = useState<MembershipRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [status, setStatus] = useState("ALL");
    const [plan, setPlan] = useState("ALL");
    const [payment, setPayment] = useState("ALL");
    const [search, setSearch] = useState("");
    const [dateField, setDateField] = useState<DateField>("requestedAt");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [selected, setSelected] = useState<MembershipRow | null>(null);
    const [benefits, setBenefits] = useState<MembershipBenefit[]>([]);
    const [benefitsLoading, setBenefitsLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setRows(await getMemberships());
            setError("");
        } catch (e) {
            console.error(e);
            setError("Could not load memberships.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const act = async (fn: (id: number) => Promise<unknown>, id: number) => {
        try {
            await fn(id);
            await load();
        } catch (e) {
            console.error(e);
            setError("Action failed. Only admins can approve or reject.");
        }
    };

    const openHistory = async (row: MembershipRow) => {
        setSelected(row);
        setBenefits([]);
        setBenefitsLoading(true);
        try {
            setBenefits(await getMembershipBenefits(row.id));
        } catch (e) {
            console.error(e);
        } finally {
            setBenefitsLoading(false);
        }
    };

    const quick = (f: string, t: string, field: DateField = dateField) => {
        setDateField(field);
        setFrom(f);
        setTo(t);
    };

    const planNames = useMemo(() => Array.from(new Set(rows.map((r) => r.planName))), [rows]);

    const filtered = rows.filter((r) => {
        if (status !== "ALL" && r.status !== status) return false;
        if (plan !== "ALL" && r.planName !== plan) return false;
        if (payment !== "ALL" && r.paymentMethod !== payment) return false;
        const q = search.trim().toLowerCase();
        if (q && !`${r.customerName ?? ""} ${r.customerPhone}`.toLowerCase().includes(q)) return false;
        if (from || to) {
            const v = r[dateField];
            if (!v) return false;
            const day = v.slice(0, 10);
            if (from && day < from) return false;
            if (to && day > to) return false;
        }
        return true;
    });

    const count = (fn: (r: MembershipRow) => boolean) => filtered.filter(fn).length;
    const revenue = filtered
        .filter((r) => r.status === "ACTIVE" || r.status === "EXPIRED")
        .reduce((sum, r) => sum + Number(r.amount ?? 0), 0);

    const cards = [
        { label: "Total in this view", value: filtered.length, color: "text-[var(--color-primary)]" },
        { label: "Active", value: count((r) => r.status === "ACTIVE"), color: "text-green-600" },
        { label: "Pending approval", value: count((r) => r.status === "PENDING_APPROVAL"), color: "text-amber-600" },
        { label: "Ending in 7 days", value: count((r) => r.status === "ACTIVE" && (r.daysLeft ?? 99) <= 7), color: "text-orange-600" },
        { label: "Expired", value: count((r) => r.status === "EXPIRED"), color: "text-slate-600" },
        { label: "Collected", value: money(revenue), color: "text-[var(--color-text)]" },
    ];

    const chips: { label: string; run: () => void }[] = [
        { label: "All time", run: () => { setFrom(""); setTo(""); setStatus("ALL"); } },
        { label: "Today", run: () => quick(addDays(0), addDays(0), "requestedAt") },
        { label: "Last 7 days", run: () => quick(addDays(-7), addDays(0), "requestedAt") },
        { label: "Last 30 days", run: () => quick(addDays(-30), addDays(0), "requestedAt") },
        { label: "Ending today", run: () => { quick(addDays(0), addDays(0), "endDate"); setStatus("ACTIVE"); } },
        { label: "Ending in 7 days", run: () => { quick(addDays(0), addDays(7), "endDate"); setStatus("ACTIVE"); } },
    ];

    const totalItems = benefits.reduce((n, b) => n + b.items.reduce((m, i) => m + i.qty, 0), 0);

    return (
        <div className="space-y-5 p-4 sm:p-6">
            <div className="rounded-2xl bg-[var(--color-primary)] px-5 py-5 text-white shadow-sm">
                <h1 className="text-xl font-semibold">Memberships</h1>
                <p className="mt-1 text-sm text-white/80">
                    Who bought or requested a plan, when it ends, and what they received.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                {cards.map((c) => (
                    <div key={c.label} className="rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
                        <p className="text-xs text-slate-500">{c.label}</p>
                        <p className={`mt-1 text-2xl font-semibold ${c.color}`}>{c.value}</p>
                    </div>
                ))}
            </div>

            <div className="space-y-3 rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
                <div className="flex flex-wrap gap-2">
                    {chips.map((c) => (
                        <button
                            key={c.label}
                            onClick={c.run}
                            className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-medium text-slate-700 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                        >
                            {c.label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-end gap-3">
                    <div>
                        <p className="mb-1 text-[11px] text-slate-500">Search</p>
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or phone" className={inputCls} />
                    </div>
                    <div>
                        <p className="mb-1 text-[11px] text-slate-500">Status</p>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
                            <option value="ALL">All status</option>
                            {Object.entries(STATUS_LABEL).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <p className="mb-1 text-[11px] text-slate-500">Plan</p>
                        <select value={plan} onChange={(e) => setPlan(e.target.value)} className={inputCls}>
                            <option value="ALL">All plans</option>
                            {planNames.map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <p className="mb-1 text-[11px] text-slate-500">Payment</p>
                        <select value={payment} onChange={(e) => setPayment(e.target.value)} className={inputCls}>
                            <option value="ALL">Cash + Online</option>
                            <option value="CASH">Cash</option>
                            <option value="ONLINE">Online</option>
                        </select>
                    </div>
                    <div>
                        <p className="mb-1 text-[11px] text-slate-500">Date type</p>
                        <select value={dateField} onChange={(e) => setDateField(e.target.value as DateField)} className={inputCls}>
                            {(Object.keys(FIELD_LABEL) as DateField[]).map((k) => (
                                <option key={k} value={k}>{FIELD_LABEL[k]}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <p className="mb-1 text-[11px] text-slate-500">From</p>
                        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                        <p className="mb-1 text-[11px] text-slate-500">To</p>
                        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
                    </div>
                </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-white shadow-sm">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            {["Customer", "Plan", "Payment", "Status", "Bought on", "Start", "End", "Days left", ""].map((h) => (
                                <th key={h} className="whitespace-nowrap px-3 py-3 font-medium">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr><td colSpan={9} className="px-3 py-8 text-center text-slate-400">Loading...</td></tr>
                        )}
                        {!loading && filtered.length === 0 && (
                            <tr><td colSpan={9} className="px-3 py-8 text-center text-slate-400">No memberships found.</td></tr>
                        )}
                        {filtered.map((r) => (
                            <tr key={r.id} className="border-t border-slate-100">
                                <td className="px-3 py-3">
                                    <p className="font-medium text-slate-900">{r.customerName || "-"}</p>
                                    <p className="text-slate-500">{r.customerPhone}</p>
                                </td>
                                <td className="px-3 py-3">{r.planName}<p className="text-slate-500">{money(r.amount, r.currency)}</p></td>
                                <td className="px-3 py-3">{r.paymentMethod === "CASH" ? "Cash" : "Online"}</td>
                                <td className="px-3 py-3">
                                    <span className={`rounded-full px-2 py-0.5 ${STATUS_COLOR[r.status] ?? "bg-slate-100"}`}>
                                        {STATUS_LABEL[r.status] ?? r.status}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-3 py-3">{fmtTime(r.requestedAt)}</td>
                                <td className="whitespace-nowrap px-3 py-3">{fmt(r.startDate)}</td>
                                <td className="whitespace-nowrap px-3 py-3">{fmt(r.endDate)}</td>
                                <td className={`px-3 py-3 font-semibold ${r.daysLeft !== null && r.daysLeft <= 3 ? "text-red-600" : r.daysLeft !== null && r.daysLeft <= 7 ? "text-amber-600" : ""}`}>
                                    {r.daysLeft ?? "-"}
                                </td>
                                <td className="whitespace-nowrap px-3 py-3">
                                    <div className="flex gap-2">
                                        {r.status === "PENDING_APPROVAL" && (
                                            <>
                                                <button onClick={() => void act(approveMembership, r.id)} className="rounded bg-green-600 px-2 py-1 text-white">Approve</button>
                                                <button onClick={() => void act(rejectMembership, r.id)} className="rounded bg-red-600 px-2 py-1 text-white">Reject</button>
                                            </>
                                        )}
                                        <button onClick={() => void openHistory(r)} className="rounded border border-[var(--color-border)] px-2 py-1 hover:border-[var(--color-primary)]">
                                            What they got
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selected && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={() => setSelected(null)}>
                    <div className="h-full w-full max-w-md overflow-y-auto bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between bg-[var(--color-primary)] p-4 text-white">
                            <div>
                                <p className="text-sm font-semibold">{selected.customerName || selected.customerPhone}</p>
                                <p className="text-xs text-white/80">
                                    {selected.planName}: {fmt(selected.startDate)} to {fmt(selected.endDate)}
                                </p>
                            </div>
                            <button onClick={() => setSelected(null)}><X size={18} /></button>
                        </div>

                        <div className="p-4">
                            <div className="mb-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                                Received from plan so far: <b className="text-slate-900">{totalItems} item(s)</b>
                            </div>
                            {benefitsLoading && <p className="text-xs text-slate-400">Loading...</p>}
                            {!benefitsLoading && benefits.length === 0 && (
                                <p className="text-xs text-slate-400">No plan benefit used yet.</p>
                            )}
                            <div className="space-y-3">
                                {benefits.map((b) => (
                                    <div key={b.orderNumber} className="rounded-lg border border-slate-200 p-3 text-xs">
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-slate-900">{fmt(b.at)}</span>
                                            <span className="text-slate-500">{b.orderNumber}</span>
                                        </div>
                                        <ul className="mt-2 space-y-1">
                                            {b.items.map((i, idx) => (
                                                <li key={idx} className="flex justify-between">
                                                    <span>{i.name}</span>
                                                    <span className="text-slate-500">x {i.qty}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
