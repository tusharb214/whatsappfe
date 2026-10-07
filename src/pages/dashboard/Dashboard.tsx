 import {
  MessageSquare,
  Users,
  Package,
  Smartphone,
  ArrowUpRight,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Inbox,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

import {
  getConversations,
  type Conversation,
} from "../../api/conversationApi";

import {
  getContacts,
  type Contact,
} from "../../api/contactApi";

import {
  getProducts,
  type Product,
} from "../../api/productApi";

import {
  getWhatsAppNumbers,
  type WhatsAppNumber,
} from "../../api/whatsappApi";

interface DashboardData {
  conversations: Conversation[];
  contacts: Contact[];
  products: Product[];
  whatsappNumbers: WhatsAppNumber[];
}

export default function Dashboard() {
  const { user } = useAuth();

  const [data, setData] = useState<DashboardData>({
    conversations: [],
    contacts: [],
    products: [],
    whatsappNumbers: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setError("");

        const [
          conversations,
          contacts,
          products,
          whatsappNumbers,
        ] = await Promise.all([
          getConversations(),
          getContacts(),
          getProducts(),
          getWhatsAppNumbers(),
        ]);

        setData({
          conversations,
          contacts,
          products,
          whatsappNumbers,
        });
      } catch (err: any) {
        console.error("Dashboard loading failed:", err);

        if (err?.response?.status === 401) {
          setError("Your session has expired. Please login again.");
        } else {
          setError(
            err?.response?.data?.message ||
              "Unable to load dashboard data."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const totalConversations = data.conversations.length;
  const totalContacts = data.contacts.length;
  const totalProducts = data.products.length;
  const totalWhatsAppNumbers =
    data.whatsappNumbers.length;

  const unreadConversations =
    data.conversations.filter(
      (conversation) => conversation.unreadCount > 0
    ).length;

  const totalUnreadMessages =
    data.conversations.reduce(
      (total, conversation) =>
        total + conversation.unreadCount,
      0
    );

  const activeWhatsAppNumbers =
    data.whatsappNumbers.filter(
      (number) => number.status === "ACTIVE"
    ).length;

  const recentConversations = [...data.conversations]
    .sort((a, b) => {
      const first = a.lastMessageAt || a.createdAt;
      const second = b.lastMessageAt || b.createdAt;

      return (
        new Date(second).getTime() -
        new Date(first).getTime()
      );
    })
    .slice(0, 5);

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "—";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const stats = [
    {
      title: "Conversations",
      value: totalConversations,
      description: `${unreadConversations} need attention`,
      icon: MessageSquare,
      iconClass:
        "bg-[var(--color-primary-light)] text-[var(--color-primary)]",
    },
    {
      title: "Contacts",
      value: totalContacts,
      description: "Customer contacts",
      icon: Users,
      iconClass:
        "bg-[var(--color-primary-light)] text-[var(--color-primary)]",
    },
    {
      title: "Products",
      value: totalProducts,
      description: "Catalogue products",
      icon: Package,
      iconClass:
        "bg-[var(--color-warning-light)] text-[var(--color-warning)]",
    },
    {
      title: "WhatsApp Numbers",
      value: totalWhatsAppNumbers,
      description:
        activeWhatsAppNumbers > 0
          ? `${activeWhatsAppNumbers} active`
          : "No active number",
      icon: Smartphone,
      iconClass:
        "bg-[var(--color-success-light)] text-[var(--color-success)]",
    },
  ];

  return (
    <div className="space-y-6">

      {/* =====================================================
          PAGE HEADER
         ===================================================== */}

      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-primary)]">
            Overview
          </p>

          <h2 className="text-2xl font-bold tracking-[-0.5px] text-[var(--color-text)] sm:text-3xl">
            Good to see you,{" "}
            {user?.name?.split(" ")[0] || "there"}.
          </h2>

          <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
            Here&apos;s what&apos;s happening in your
            WhatsApp workspace.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-full border border-[var(--color-border-light)] bg-[var(--color-surface)] px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] shadow-[var(--shadow-xs)] sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
          Workspace connected
        </div>

      </section>


      {/* =====================================================
          ERROR
         ===================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-[var(--color-danger-light)] bg-[var(--color-danger-light)] p-4 text-sm text-[var(--color-danger)]">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />

          <div>
            <p className="font-semibold">
              Dashboard data could not be loaded
            </p>

            <p className="mt-1 opacity-80">
              {error}
            </p>
          </div>
        </div>
      )}


      {/* =====================================================
          STATS
         ===================================================== */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-xs)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]"
            >
              <div className="flex items-start justify-between">

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconClass}`}
                >
                  <Icon size={19} strokeWidth={2} />
                </div>

              </div>

              <div className="mt-5">

                <p className="text-2xl font-bold tracking-[-0.4px] text-[var(--color-text)]">
                  {isLoading ? "—" : stat.value.toLocaleString()}
                </p>

                <p className="mt-1 text-xs font-semibold text-[var(--color-text)]">
                  {stat.title}
                </p>

                <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                  {isLoading ? "Loading..." : stat.description}
                </p>

              </div>
            </div>
          );
        })}

      </div>


      {/* =====================================================
          MAIN CONTENT
         ===================================================== */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">

        {/* ===================================================
            RECENT CONVERSATIONS
           =================================================== */}

        <section className="overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-surface)] shadow-[var(--shadow-xs)]">

          <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border-light)] px-5 py-4 sm:px-6">

            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text)]">
                Recent conversations
              </h3>

              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Latest customer activity from your inbox.
              </p>
            </div>

            <Link
              to="/inbox"
              className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--color-primary)] transition hover:text-[var(--color-primary-hover)]"
            >
              View inbox
              <ArrowUpRight size={14} />
            </Link>

          </div>


          <div>

            {isLoading ? (
              <div className="space-y-1 p-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="flex animate-pulse items-center gap-3 rounded-xl p-3"
                  >
                    <div className="h-10 w-10 rounded-full bg-[var(--color-surface-muted)]" />

                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-32 rounded bg-[var(--color-surface-muted)]" />
                      <div className="h-2.5 w-52 max-w-full rounded bg-[var(--color-surface-muted)]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
                  <Inbox size={21} />
                </div>

                <h4 className="mt-4 text-sm font-semibold text-[var(--color-text)]">
                  No conversations yet
                </h4>

                <p className="mt-1 max-w-xs text-xs text-[var(--color-text-muted)]">
                  Customer conversations will appear here
                  once messages start coming in.
                </p>
              </div>
            ) : (
              recentConversations.map((conversation) => {

                const name =
                  conversation.contactName ||
                  conversation.phoneNumber ||
                  "Unknown contact";

                const initial =
                  name.charAt(0).toUpperCase();

                return (
                  <Link
                    key={conversation.id}
                    to={`/inbox?conversation=${conversation.id}`}
                    className="flex items-center gap-3 border-b border-[var(--color-border-light)] px-5 py-3.5 transition last:border-b-0 hover:bg-[var(--color-surface-hover)] sm:px-6"
                  >

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-xs font-bold text-[var(--color-primary)]">
                      {initial}
                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex items-center gap-2">

                        <p className="truncate text-xs font-semibold text-[var(--color-text)]">
                          {name}
                        </p>

                        {conversation.unreadCount > 0 && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                        )}

                      </div>

                      <p className="mt-1 truncate text-[11px] text-[var(--color-text-muted)]">
                        {conversation.lastMessageText ||
                          "No messages yet"}
                      </p>

                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1">

                      <span className="text-[10px] text-[var(--color-text-muted)]">
                        {formatTime(
                          conversation.lastMessageAt
                        )}
                      </span>

                      {conversation.unreadCount > 0 && (
                        <span className="rounded-full bg-[var(--color-primary)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--color-text-inverse)]">
                          {conversation.unreadCount}
                        </span>
                      )}

                    </div>

                  </Link>
                );
              })
            )}

          </div>

        </section>


        {/* ===================================================
            WORKSPACE HEALTH
           =================================================== */}

        <section className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-surface)] shadow-[var(--shadow-xs)]">

          <div className="border-b border-[var(--color-border-light)] px-5 py-4 sm:px-6">

            <h3 className="text-sm font-semibold text-[var(--color-text)]">
              Workspace health
            </h3>

            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Live status based on your workspace data.
            </p>

          </div>


          <div className="space-y-2 p-4 sm:p-5">

            {/* WhatsApp */}

            <div className="flex items-center gap-3 rounded-xl bg-[var(--color-surface-hover)] p-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-success-light)] text-[var(--color-success)]">
                <CheckCircle2 size={17} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[var(--color-text)]">
                  WhatsApp connection
                </p>

                <p className="mt-0.5 text-[10px] text-[var(--color-text-muted)]">
                  {activeWhatsAppNumbers > 0
                    ? `${activeWhatsAppNumbers} active number${
                        activeWhatsAppNumbers > 1
                          ? "s"
                          : ""
                      }`
                    : "No active WhatsApp number"}
                </p>
              </div>

              <span
                className={`text-[10px] font-semibold ${
                  activeWhatsAppNumbers > 0
                    ? "text-[var(--color-success)]"
                    : "text-[var(--color-warning)]"
                }`}
              >
                {activeWhatsAppNumbers > 0
                  ? "Active"
                  : "Setup"}
              </span>

            </div>


            {/* Unread */}

            <div className="flex items-center gap-3 rounded-xl bg-[var(--color-surface-hover)] p-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-warning-light)] text-[var(--color-warning)]">
                <Clock3 size={17} />
              </div>

              <div className="min-w-0 flex-1">

                <p className="text-xs font-semibold text-[var(--color-text)]">
                  Unread messages
                </p>

                <p className="mt-0.5 text-[10px] text-[var(--color-text-muted)]">
                  Messages waiting for a response
                </p>

              </div>

              <span className="text-xs font-bold text-[var(--color-warning)]">
                {isLoading ? "—" : totalUnreadMessages}
              </span>

            </div>


            {/* Contacts */}

            <div className="flex items-center gap-3 rounded-xl bg-[var(--color-surface-hover)] p-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                <Users size={17} />
              </div>

              <div className="min-w-0 flex-1">

                <p className="text-xs font-semibold text-[var(--color-text)]">
                  Customer database
                </p>

                <p className="mt-0.5 text-[10px] text-[var(--color-text-muted)]">
                  Contacts available in workspace
                </p>

              </div>

              <span className="text-xs font-bold text-[var(--color-primary)]">
                {isLoading ? "—" : totalContacts}
              </span>

            </div>


            {/* Products */}

            <div className="flex items-center gap-3 rounded-xl bg-[var(--color-surface-hover)] p-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-warning-light)] text-[var(--color-warning)]">
                <Package size={17} />
              </div>

              <div className="min-w-0 flex-1">

                <p className="text-xs font-semibold text-[var(--color-text)]">
                  Product catalogue
                </p>

                <p className="mt-0.5 text-[10px] text-[var(--color-text-muted)]">
                  Products currently available
                </p>

              </div>

              <span className="text-xs font-bold text-[var(--color-warning)]">
                {isLoading ? "—" : totalProducts}
              </span>

            </div>

          </div>

        </section>

      </div>


      {/* =====================================================
          QUICK ACTIONS
         ===================================================== */}

      <section className="rounded-2xl border border-[var(--color-border-light)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-xs)] sm:p-6">

        <div className="mb-4 flex items-center justify-between">

          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)]">
              Quick actions
            </h3>

            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Jump directly to the areas you use most.
            </p>
          </div>

        </div>


        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

          <Link
            to="/inbox"
            className="group flex items-center gap-3 rounded-xl border border-[var(--color-border-light)] p-3.5 transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)]">
              <MessageSquare size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[var(--color-text)]">
                Open Inbox
              </p>

              <p className="mt-0.5 text-[10px] text-[var(--color-text-muted)]">
                Manage conversations
              </p>
            </div>

            <ArrowUpRight
              size={15}
              className="text-[var(--color-text-muted)] transition group-hover:text-[var(--color-primary)]"
            />
          </Link>


          <Link
            to="/contacts"
            className="group flex items-center gap-3 rounded-xl border border-[var(--color-border-light)] p-3.5 transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)]">
              <Users size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[var(--color-text)]">
                Contacts
              </p>

              <p className="mt-0.5 text-[10px] text-[var(--color-text-muted)]">
                View customers
              </p>
            </div>

            <ArrowUpRight
              size={15}
              className="text-[var(--color-text-muted)] transition group-hover:text-[var(--color-primary)]"
            />
          </Link>


          <Link
            to="/catalogue/products"
            className="group flex items-center gap-3 rounded-xl border border-[var(--color-border-light)] p-3.5 transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-warning-light)] text-[var(--color-warning)]">
              <Package size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[var(--color-text)]">
                Products
              </p>

              <p className="mt-0.5 text-[10px] text-[var(--color-text-muted)]">
                Manage catalogue
              </p>
            </div>

            <ArrowUpRight
              size={15}
              className="text-[var(--color-text-muted)] transition group-hover:text-[var(--color-primary)]"
            />
          </Link>


          <Link
            to="/whatsapp"
            className="group flex items-center gap-3 rounded-xl border border-[var(--color-border-light)] p-3.5 transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-success-light)] text-[var(--color-success)]">
              <Smartphone size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[var(--color-text)]">
                WhatsApp
              </p>

              <p className="mt-0.5 text-[10px] text-[var(--color-text-muted)]">
                Manage numbers
              </p>
            </div>

            <ArrowUpRight
              size={15}
              className="text-[var(--color-text-muted)] transition group-hover:text-[var(--color-primary)]"
            />
          </Link>

        </div>

      </section>


      {/* =====================================================
          EMPTY / FIRST WORKSPACE HINT
         ===================================================== */}

      {!isLoading &&
        totalConversations === 0 &&
        totalContacts === 0 &&
        totalProducts === 0 &&
        totalWhatsAppNumbers === 0 && (
          <section className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
              <Plus size={21} />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-[var(--color-text)]">
              Your workspace is ready
            </h3>

            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-[var(--color-text-secondary)]">
              Start by connecting your WhatsApp number,
              adding contacts or creating your product
              catalogue.
            </p>

          </section>
        )}

    </div>
  );
}