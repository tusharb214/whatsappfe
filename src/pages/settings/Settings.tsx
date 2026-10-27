import { useEffect, useState } from "react";
import api from "../../api/axios";

interface PaymentSettings {
    razorpayEnabled: boolean;
    razorpayKeyId: string;
    hasKeySecret: boolean;
    hasWebhookSecret: boolean;
    webhookUrl: string;
    encryptionReady: boolean;
}

export default function Settings() {
    const [settings, setSettings] = useState<PaymentSettings | null>(null);
    const [enabled, setEnabled] = useState(false);
    const [keyId, setKeyId] = useState("");
    const [keySecret, setKeySecret] = useState("");
    const [webhookSecret, setWebhookSecret] = useState("");
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [loadError, setLoadError] = useState("");

    const apply = (data: PaymentSettings) => {
        setSettings(data);
        setEnabled(data.razorpayEnabled);
        setKeyId(data.razorpayKeyId ?? "");
        setKeySecret("");
        setWebhookSecret("");
    };

    useEffect(() => {
        api.get<PaymentSettings>("/payment-settings")
            .then((response) => apply(response.data))
            .catch((error) => {
                console.error("Failed to load payment settings:", error);
                setLoadError("Could not load payment settings.");
            });
    }, []);

    const report = (text: string, error: boolean) => {
        setMessage(text);
        setIsError(error);
    };

    const save = async () => {
        setBusy(true);
        setMessage("");
        try {
            const response = await api.put<PaymentSettings>("/payment-settings", {
                razorpayEnabled: enabled,
                razorpayKeyId: keyId,
                razorpayKeySecret: keySecret,
                razorpayWebhookSecret: webhookSecret,
            });
            apply(response.data);
            report("Payment settings saved.", false);
        } catch (error: unknown) {
            const text =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                "Could not save. Please try again.";
            report(text, true);
        } finally {
            setBusy(false);
        }
    };

    const test = async () => {
        setBusy(true);
        setMessage("");
        try {
            const response = await api.post<{ ok: boolean; message: string }>("/payment-settings/test");
            report(response.data.message, !response.data.ok);
        } catch (error) {
            console.error("Test failed:", error);
            report("Test failed. Please try again.", true);
        } finally {
            setBusy(false);
        }
    };

    const copyWebhook = async () => {
        if (!settings) return;
        try {
            await navigator.clipboard.writeText(settings.webhookUrl);
            report("Webhook URL copied.", false);
        } catch {
            report("Could not copy. Select the URL and copy it manually.", true);
        }
    };

    const inputClass =
        "h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-indigo-500";

    return (
        <div className="space-y-4 p-4 sm:p-6">
            <div>
                <h1 className="text-lg font-semibold text-slate-900">Settings</h1>
                <p className="text-xs text-slate-500">Manage how your customers pay.</p>
            </div>

            {loadError && <p className="text-xs text-red-600">{loadError}</p>}
            {!settings && !loadError && <p className="text-xs text-slate-400">Loading...</p>}

            {settings && (
                <section className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-base font-semibold text-slate-900">Online payments (Razorpay)</h2>
                    <p className="mt-1 text-xs text-slate-500">
                        Customers can pay online or in cash. Online payments go straight to your
                        Razorpay account. Cash on pickup/delivery always stays available.
                    </p>

                    {!settings.encryptionReady && (
                        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
                            The server encryption key is not set, so credentials cannot be saved yet.
                        </p>
                    )}

                    <label className="mt-4 flex items-center gap-2 text-sm text-slate-800">
                        <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(event) => setEnabled(event.target.checked)}
                        />
                        Accept online payments
                    </label>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-700">Key ID</label>
                            <input
                                value={keyId}
                                onChange={(event) => setKeyId(event.target.value)}
                                placeholder="rzp_test_xxxxxxxx"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-700">Key Secret</label>
                            <input
                                type="password"
                                value={keySecret}
                                onChange={(event) => setKeySecret(event.target.value)}
                                placeholder={settings.hasKeySecret ? "Saved. Type to replace" : "Enter key secret"}
                                autoComplete="new-password"
                                className={inputClass}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-semibold text-slate-700">Webhook Secret</label>
                            <input
                                type="password"
                                value={webhookSecret}
                                onChange={(event) => setWebhookSecret(event.target.value)}
                                placeholder={
                                    settings.hasWebhookSecret ? "Saved. Type to replace" : "Choose a secret (8+ characters)"
                                }
                                autoComplete="new-password"
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="mt-4 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-600">
                        <p className="font-semibold text-slate-800">Set up in your Razorpay dashboard</p>
                        <ol className="mt-2 list-decimal space-y-1 pl-4">
                            <li>Account &amp; Settings, API Keys: generate a key (use Test mode first) and paste the Key ID and Key Secret above.</li>
                            <li>Account &amp; Settings, Webhooks: add a new webhook with the URL below and the same Webhook Secret you entered above.</li>
                            <li>Select the event <span className="font-semibold">Payment Link: paid</span> (payment_link.paid) and save.</li>
                        </ol>

                        <div className="mt-3 flex items-center gap-2">
                            <input
                                readOnly
                                value={settings.webhookUrl}
                                className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-[11px]"
                            />
                            <button
                                type="button"
                                onClick={copyWebhook}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                            >
                                Copy
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            disabled={busy}
                            onClick={save}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            disabled={busy}
                            onClick={test}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                        >
                            Test connection
                        </button>
                    </div>

                    {message && (
                        <p role="status" className={`mt-3 text-xs ${isError ? "text-red-600" : "text-emerald-600"}`}>
                            {message}
                        </p>
                    )}
                </section>
            )}
        </div>
    );
}
