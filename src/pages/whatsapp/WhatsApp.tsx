 import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Phone,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Trash2,
  Wifi,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  deleteWhatsAppNumber,
  getWhatsAppNumbers,
  type WhatsAppNumber,
} from "../../api/whatsappApi";

import { useAuth } from "../../hooks/useAuth";

export default function WhatsApp() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [numbers, setNumbers] = useState<WhatsAppNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const canManage =
    user?.role === "ADMIN" ||
    user?.role === "SUPER_ADMIN";

  const loadNumbers = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getWhatsAppNumbers();

      setNumbers(data);
    } catch (err) {
      console.error("Failed to load WhatsApp numbers:", err);

      setError(
        "We couldn't load your WhatsApp connections. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNumbers();
  }, []);

  const activeNumbers = numbers.filter(
    (number) => number.status === "ACTIVE"
  );

  const handleDelete = async (number: WhatsAppNumber) => {
    const confirmed = window.confirm(
      `Remove WhatsApp number "${number.phoneNumber}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(number.id);
      setError(null);

      await deleteWhatsAppNumber(number.id);

      setNumbers((previous) =>
        previous.filter((item) => item.id !== number.id)
      );
    } catch (err) {
      console.error("Failed to delete WhatsApp number:", err);

      setError(
        "We couldn't remove this WhatsApp connection."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* =====================================================
          PAGE HEADER
         ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-start gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-whatsapp-light)] text-[var(--color-whatsapp)]">
            <Phone size={21} />
          </div>

          <div>
            <h1 className="text-xl font-semibold text-[var(--color-text)]">
              WhatsApp
            </h1>

            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Connect and manage your WhatsApp Business accounts
            </p>
          </div>

        </div>

        {canManage && numbers.length > 0 && (
          <button
            type="button"
            onClick={() => navigate("/whatsapp/connect")}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-text-inverse)] shadow-[var(--shadow-xs)] transition hover:bg-[var(--color-primary-hover)] sm:w-auto"
          >
            Connect WhatsApp
            <ChevronRight size={17} />
          </button>
        )}

      </div>


      {/* =====================================================
          ERROR
         ===================================================== */}

      {error && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() => void loadNumbers()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
          >
            <RefreshCw size={14} />
            Retry
          </button>

        </div>
      )}


      {/* =====================================================
          LOADING
         ===================================================== */}

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
            >
              <div className="h-11 w-11 rounded-xl bg-[var(--color-surface-hover)]" />

              <div className="mt-5 h-4 w-36 rounded bg-[var(--color-surface-hover)]" />

              <div className="mt-3 h-3 w-24 rounded bg-[var(--color-surface-hover)]" />

              <div className="mt-6 h-9 w-full rounded-lg bg-[var(--color-surface-hover)]" />
            </div>
          ))}

        </div>
      )}


      {/* =====================================================
          EMPTY STATE
         ===================================================== */}

      {!loading && numbers.length === 0 && (
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">

          <div className="px-5 py-10 text-center sm:px-8 sm:py-14">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-whatsapp-light)] text-[var(--color-whatsapp)]">
              <Smartphone size={30} />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-[var(--color-text)] sm:text-xl">
              Connect your WhatsApp Business
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--color-text-muted)]">
              Connect your WhatsApp Business account through Meta's secure
              setup. No WABA ID, Phone Number ID or access token is required.
            </p>

            {canManage && (
              <button
                type="button"
                onClick={() => navigate("/whatsapp/connect")}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-medium text-[var(--color-text-inverse)] transition hover:bg-[var(--color-primary-hover)] sm:w-auto"
              >
                Connect WhatsApp
                <ChevronRight size={18} />
              </button>
            )}

            {/* Security */}
            <div className="mx-auto mt-7 flex max-w-lg items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 text-left">

              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-[var(--color-success)]"
              />

              <div>
                <p className="text-xs font-semibold text-[var(--color-text)]">
                  Secure Meta connection
                </p>

                <p className="mt-1 text-[11px] leading-5 text-[var(--color-text-muted)]">
                  Your WhatsApp credentials are handled securely by the
                  platform. You don't need to copy or paste API credentials.
                </p>
              </div>

            </div>

          </div>
        </div>
      )}


      {/* =====================================================
          CONNECTED NUMBERS
         ===================================================== */}

      {!loading && numbers.length > 0 && (
        <>
          {/* Stats */}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <p className="text-xs font-medium text-[var(--color-text-muted)]">
                Connected
              </p>

              <p className="mt-1 text-xl font-semibold text-[var(--color-text)]">
                {numbers.length}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <p className="text-xs font-medium text-[var(--color-text-muted)]">
                Active
              </p>

              <p className="mt-1 text-xl font-semibold text-[var(--color-success)]">
                {activeNumbers.length}
              </p>
            </div>

            <div className="col-span-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:col-span-1">
              <p className="text-xs font-medium text-[var(--color-text-muted)]">
                Connection
              </p>

              <div className="mt-1 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />

                <p className="text-sm font-semibold text-[var(--color-text)]">
                  Ready
                </p>
              </div>
            </div>

          </div>


          {/* Number Cards */}

          <div>
            <div className="mb-4 flex items-center justify-between">

              <div>
                <h2 className="text-base font-semibold text-[var(--color-text)]">
                  Connected numbers
                </h2>

                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  WhatsApp Business numbers connected to this workspace
                </p>
              </div>

              {canManage && (
                <button
                  type="button"
                  onClick={() => navigate("/whatsapp/connect")}
                  className="hidden items-center gap-1.5 text-xs font-medium text-[var(--color-primary)] hover:underline sm:inline-flex"
                >
                  Connect another
                  <ChevronRight size={14} />
                </button>
              )}

            </div>


            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

              {numbers.map((number) => {

                const isActive =
                  number.status === "ACTIVE";

                return (
                  <div
                    key={number.id}
                    className="group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-xs)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]"
                  >

                    {/* Top */}

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-whatsapp-light)] text-[var(--color-whatsapp)]">
                          <Phone size={19} />
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                            {number.displayName ||
                              "WhatsApp Business"}
                          </p>

                          <p className="mt-1 truncate text-xs text-[var(--color-text-muted)]">
                            {number.phoneNumber}
                          </p>

                        </div>

                      </div>


                      {/* Menu */}

                      {canManage && (
                        <div className="relative">

                          <button
                            type="button"
                            onClick={() =>
                              void handleDelete(number)
                            }
                            disabled={
                              deletingId === number.id
                            }
                            title="Remove connection"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                          >
                            {deletingId === number.id ? (
                              <RefreshCw
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>

                        </div>
                      )}

                    </div>


                    {/* Status */}

                    <div className="mt-5 flex items-center justify-between border-t border-[var(--color-border)] pt-4">

                      <div className="flex items-center gap-2">

                        <span
                          className={`h-2 w-2 rounded-full ${
                            isActive
                              ? "bg-[var(--color-success)]"
                              : "bg-slate-400"
                          }`}
                        />

                        <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                          {isActive
                            ? "Connected"
                            : "Inactive"}
                        </span>

                      </div>

                      {isActive && (
                        <div className="inline-flex items-center gap-1.5 text-[10px] font-medium text-[var(--color-success)]">
                          <CheckCircle2 size={13} />
                          Active
                        </div>
                      )}

                    </div>


                    {/* Connection */}

                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--color-bg)] px-3 py-2">

                      <Wifi
                        size={14}
                        className={
                          isActive
                            ? "text-[var(--color-success)]"
                            : "text-[var(--color-text-muted)]"
                        }
                      />

                      <span className="text-[11px] text-[var(--color-text-muted)]">
                        WhatsApp Cloud connection
                      </span>

                    </div>

                  </div>
                );
              })}

            </div>
          </div>
        </>
      )}

    </div>
  );
}