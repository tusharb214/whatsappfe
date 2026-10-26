import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import {
    createPlan,
    deletePlan,
    getPlans,
    getRules,
    saveRules,
    updatePlan,
    uploadPlanImage,
    type PlanInput,
    type RuleInput,
    type SubscriptionPlan,
} from "../../api/subscriptionApi";
import { getActiveCategories } from "../../api/categoryApi";
import { getActiveProducts } from "../../api/productApi";

const EMPTY: PlanInput = {
    name: "",
    description: "",
    durationDays: 30,
    price: 0,
    currency: "INR",
    features: "",
    instructions: "",
    imageUrl: "",
    allowOnline: true,
    allowCash: true,
    active: true,
    sortOrder: 0,
};

const money = (amount: number, currency?: string | null) =>
    `${currency === "INR" || !currency ? "Rs" : currency} ${Number(amount ?? 0)}`;

export default function SubscriptionsPage() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<PlanInput | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [rules, setRules] = useState<RuleInput[]>([]);
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [products, setProducts] = useState<{ id: number; name: string }[]>([]);

    const load = useCallback(async () => {
        try {
            setPlans(await getPlans());
            setError("");
        } catch (e) {
            console.error("Failed to load plans:", e);
            setError("Could not load plans.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        const loadChoices = async () => {
            try {
                const [c, p] = await Promise.all([
                    getActiveCategories(),
                    getActiveProducts(),
                ]);
                setCategories(c as unknown as { id: number; name: string }[]);
                setProducts(p as unknown as { id: number; name: string }[]);
            } catch (e) {
                console.error("Failed to load categories/products:", e);
            }
        };
        void loadChoices();
    }, []);

    const openNew = () => {
        setEditingId(null);
        setForm({ ...EMPTY });
        setRules([]);
        setMessage("");
    };

    const openEdit = (plan: SubscriptionPlan) => {
        setEditingId(plan.id);
        setRules([]);
        getRules(plan.id)
            .then(setRules)
            .catch((e) => console.error("Failed to load rules:", e));
        setForm({
            name: plan.name,
            description: plan.description ?? "",
            durationDays: plan.durationDays,
            price: Number(plan.price),
            currency: plan.currency,
            features: plan.features ?? "",
            instructions: plan.instructions ?? "",
            imageUrl: plan.imageUrl ?? "",
            allowOnline: plan.allowOnline,
            allowCash: plan.allowCash,
            active: plan.active,
            sortOrder: plan.sortOrder,
        });
        setMessage("");
    };

    const set = <K extends keyof PlanInput>(key: K, value: PlanInput[K]) =>
        setForm((cur) => (cur ? { ...cur, [key]: value } : cur));

    const save = async () => {
        if (!form) return;
        setSaving(true);
        setError("");
        try {
            const saved =
                editingId === null
                    ? await createPlan(form)
                    : await updatePlan(editingId, form);
            await saveRules(saved.id, rules);
            setForm(null);
            setMessage("Plan saved.");
            await load();
        } catch (e) {
            console.error("Failed to save plan:", e);
            const msg =
                (e as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message ?? "Could not save the plan.";
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    const remove = async (plan: SubscriptionPlan) => {
        if (!window.confirm(`Delete plan "${plan.name}"?`)) return;
        try {
            await deletePlan(plan.id);
            setMessage("Plan deleted.");
            await load();
        } catch (e) {
            console.error("Failed to delete plan:", e);
            const msg =
                (e as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message ?? "Could not delete the plan.";
            setError(msg);
        }
    };

    const onImage = async (file: File | undefined) => {
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be smaller than 5 MB.");
            return;
        }
        setUploading(true);
        setError("");
        try {
            set("imageUrl", await uploadPlanImage(file));
        } catch (e) {
            console.error("Failed to upload image:", e);
            setError("Upload failed. Use a JPG or PNG under 5 MB.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4 p-4 sm:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold text-slate-900">Subscriptions</h1>
                    <p className="text-xs text-slate-500">
                        Create plans your customers can buy on WhatsApp.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openNew}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                    <Plus size={14} /> New plan
                </button>
            </div>

            {message && <p className="text-xs text-emerald-600">{message}</p>}
            {error && <p className="text-xs text-red-600">{error}</p>}

            {form && (
                <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-slate-900">
                            {editingId === null ? "New plan" : "Edit plan"}
                        </h2>
                        <button
                            type="button"
                            onClick={() => setForm(null)}
                            className="text-slate-400 hover:text-slate-700"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Plan name">
                            <input
                                value={form.name}
                                onChange={(e) => set("name", e.target.value)}
                                className={INPUT}
                                placeholder="Monthly Gym"
                            />
                        </Field>

                        <Field label="Duration (days)">
                            <input
                                type="number"
                                min={1}
                                value={form.durationDays}
                                onChange={(e) => set("durationDays", Number(e.target.value))}
                                className={INPUT}
                            />
                        </Field>

                        <Field label="Price">
                            <input
                                type="number"
                                min={0}
                                value={form.price}
                                onChange={(e) => set("price", Number(e.target.value))}
                                className={INPUT}
                            />
                        </Field>

                        <Field label="Currency">
                            <input
                                value={form.currency}
                                onChange={(e) => set("currency", e.target.value)}
                                className={INPUT}
                            />
                        </Field>
                    </div>

                    <Field label="Short description">
                        <input
                            value={form.description}
                            onChange={(e) => set("description", e.target.value)}
                            className={INPUT}
                            maxLength={500}
                        />
                    </Field>

                    <Field label="What is included (one per line)">
                        <textarea
                            value={form.features}
                            onChange={(e) => set("features", e.target.value)}
                            rows={4}
                            className={TEXTAREA}
                            placeholder={"Unlimited access\nFree trainer session"}
                        />
                    </Field>

                    <Field label="Instructions for the customer">
                        <textarea
                            value={form.instructions}
                            onChange={(e) => set("instructions", e.target.value)}
                            rows={3}
                            className={TEXTAREA}
                            placeholder="Carry your ID. Timing 6am to 10pm."
                        />
                    </Field>

                    <Field label="Plan image">
                        <input
                            type="file"
                            accept="image/jpeg,image/png"
                            disabled={uploading}
                            onChange={(e) => {
                                void onImage(e.target.files?.[0]);
                                e.target.value = "";
                            }}
                            className="block w-full text-xs text-slate-600"
                        />
                        {uploading && <p className="mt-1 text-[11px] text-slate-500">Uploading...</p>}
                        {form.imageUrl && (
                            <img
                                src={form.imageUrl}
                                alt="Plan"
                                className="mt-2 max-h-32 rounded-lg border border-slate-200"
                            />
                        )}
                    </Field>

                    <div className="space-y-2 rounded-lg border border-slate-200 p-3">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-slate-700">
                                What does the customer get free? (optional)
                            </p>
                            <button
                                type="button"
                                onClick={() =>
                                    setRules((cur) => [
                                        ...cur,
                                        { appliesTo: "ANY", targetId: null, quantity: 1, period: "DAY" },
                                    ])
                                }
                                className="flex items-center gap-1 text-xs font-semibold text-indigo-600"
                            >
                                <Plus size={14} /> Add benefit
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-400">
                            Example: 1 item from Meals every day. Anything beyond the limit is charged at the normal price.
                        </p>

                        {rules.map((rule, index) => {
                            const patch = (changes: Partial<RuleInput>) =>
                                setRules((cur) =>
                                    cur.map((r, i) => (i === index ? { ...r, ...changes } : r))
                                );
                            const choices = rule.appliesTo === "CATEGORY" ? categories : products;
                            return (
                                <div key={index} className="flex flex-wrap items-center gap-2">
                                    <input
                                        type="number"
                                        min={1}
                                        value={rule.quantity}
                                        onChange={(e) => patch({ quantity: Number(e.target.value) })}
                                        className="h-9 w-16 rounded-lg border border-slate-200 px-2 text-xs"
                                    />
                                    <select
                                        value={rule.appliesTo}
                                        onChange={(e) =>
                                            patch({
                                                appliesTo: e.target.value as RuleInput["appliesTo"],
                                                targetId: null,
                                            })
                                        }
                                        className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs"
                                    >
                                        <option value="ANY">item(s) from the whole menu</option>
                                        <option value="CATEGORY">item(s) from a category</option>
                                        <option value="PRODUCT">of a specific product</option>
                                    </select>
                                    {rule.appliesTo !== "ANY" && (
                                        <select
                                            value={rule.targetId ?? ""}
                                            onChange={(e) =>
                                                patch({ targetId: e.target.value ? Number(e.target.value) : null })
                                            }
                                            className="h-9 max-w-[180px] rounded-lg border border-slate-200 bg-white px-2 text-xs"
                                        >
                                            <option value="">Select...</option>
                                            {choices.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    <select
                                        value={rule.period}
                                        onChange={(e) => patch({ period: e.target.value as RuleInput["period"] })}
                                        className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs"
                                    >
                                        <option value="DAY">every day</option>
                                        <option value="WEEK">every week</option>
                                        <option value="PLAN">in total (whole plan)</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setRules((cur) => cur.filter((_, i) => i !== index))}
                                        className="text-slate-400 hover:text-red-500"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                    {(() => {
                                        const target = choices.find((c) => c.id === rule.targetId)?.name;
                                        const needsTarget = rule.appliesTo !== "ANY" && !target;
                                        const what =
                                            rule.appliesTo === "ANY"
                                                ? "from the whole menu"
                                                : rule.appliesTo === "CATEGORY"
                                                ? `from ${target ?? "..."}`
                                                : `of ${target ?? "..."}`;
                                        const when =
                                            rule.period === "DAY"
                                                ? "every day"
                                                : rule.period === "WEEK"
                                                ? "every week"
                                                : "in total";
                                        return (
                                            <p className={`w-full text-[11px] ${needsTarget ? "text-red-500" : "text-slate-500"}`}>
                                                {needsTarget
                                                    ? "Select a category/product, otherwise this benefit will not work."
                                                    : `Customer gets ${rule.quantity} item(s) ${what} ${when}.`}
                                            </p>
                                        );
                                    })()}
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-700">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={form.allowOnline}
                                onChange={(e) => set("allowOnline", e.target.checked)}
                            />
                            Online payment (Razorpay)
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={form.allowCash}
                                onChange={(e) => set("allowCash", e.target.checked)}
                            />
                            Cash (needs your approval)
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={form.active}
                                onChange={(e) => set("active", e.target.checked)}
                            />
                            Active
                        </label>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={saving}
                            onClick={() => void save()}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                        >
                            {saving ? "Saving..." : "Save plan"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setForm(null)}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                        {plan.imageUrl && (
                            <img
                                src={plan.imageUrl}
                                alt={plan.name}
                                className="mb-3 h-32 w-full rounded-lg object-cover"
                            />
                        )}
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="text-sm font-semibold text-slate-900">{plan.name}</p>
                                <p className="text-xs text-slate-500">
                                    {plan.durationDays} days · {money(plan.price, plan.currency)}
                                </p>
                            </div>
                            <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                    plan.active
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-slate-100 text-slate-500"
                                }`}
                            >
                                {plan.active ? "Active" : "Inactive"}
                            </span>
                        </div>

                        {plan.description && (
                            <p className="mt-2 text-xs text-slate-600">{plan.description}</p>
                        )}

                        <p className="mt-2 text-[11px] text-slate-400">
                            {[plan.allowOnline ? "Online" : null, plan.allowCash ? "Cash" : null]
                                .filter(Boolean)
                                .join(" + ")}
                        </p>

                        <div className="mt-3 flex gap-2">
                            <button
                                type="button"
                                onClick={() => openEdit(plan)}
                                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                            >
                                <Pencil size={13} /> Edit
                            </button>
                            <button
                                type="button"
                                onClick={() => void remove(plan)}
                                className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600"
                            >
                                <Trash2 size={13} /> Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && plans.length === 0 && !form && (
                <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                    No plans yet. Click "New plan".
                </p>
            )}
        </div>
    );
}

const INPUT =
    "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-indigo-500";

const TEXTAREA =
    "w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs leading-5 text-slate-800 outline-none focus:border-indigo-500";

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                {label}
            </label>
            {children}
        </div>
    );
}
