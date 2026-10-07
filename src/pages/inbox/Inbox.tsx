import {
  useEffect, useMemo, useRef, useState,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import {
  ArrowLeft, Check, CheckCheck,
  Circle, FileText, Image as ImageIcon,
  Paperclip, Search, Send, Smile,
  UserRound, Video, Music, X, Wifi, ShoppingBag, MoreVertical,
} from "lucide-react";
import {
  markConversationAsRead,
} from "../../api/conversationApi";
import { getActiveProducts, type Product } from "../../api/productApi";
import useConversations from "../../hooks/useConversations";
import useMessages from "../../hooks/useMessages";
import { sendProductMessage } from "../../api/catalogApi";
import { getContacts, type Contact } from "../../api/contactApi";

export default function Inbox() {
  const {
    conversations,
    loading: conversationsLoading,
    error: conversationsError,
    refresh: refreshConversations,
  } = useConversations();

  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);

  const [search, setSearch] = useState("");
  // const [showContactDetails, setShowContactDetails] = useState(false);
  const [, setShowContactDetails] = useState(false);
  const [showInboxMenu, setShowInboxMenu] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedGroupContacts, setSelectedGroupContacts] = useState<Contact[]>([]);
  const [contactSearch, setContactSearch] = useState("");
  const [contactsLoading, setContactsLoading] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [showConversationList, setShowConversationList] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);


  const [showCatalogPicker, setShowCatalogPicker] = useState(false);


  const openCatalogPicker = async () => {
    setAttachmentMenuOpen(false);
    setShowCatalogPicker(true);

    try {
      setCatalogLoading(true);

      const products = await getActiveProducts();

      setCatalogProducts(products);
    } catch (error) {
      console.error("Failed to load catalog products:", error);
    } finally {
      setCatalogLoading(false);
    }
  };

  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [selectedCatalogProducts, setSelectedCatalogProducts] =
    useState<Product[]>([]);

  const {
    messages,
    loading: messagesLoading,
    sending,
    error: messagesError,
    sendMessage,
    sendMedia,
    mediaProgress,
    refresh,
  } = useMessages(selectedConversationId);

  /*
   * Select first conversation automatically
   */
  useEffect(() => {
    if (
      selectedConversationId === null &&
      conversations.length > 0
    ) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  /*
   * Filter conversations
   */
  const filteredConversations = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const name = conversation.contactName?.toLowerCase() ?? "";
      const phone = conversation.phoneNumber?.toLowerCase() ?? "";
      const lastMessage =
        conversation.lastMessageText?.toLowerCase() ?? "";

      return (
        name.includes(keyword) ||
        phone.includes(keyword) ||
        lastMessage.includes(keyword)
      );
    });
  }, [conversations, search]);

  /*
   * Selected conversation
   */
  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === selectedConversationId
      ) ?? null,
    [conversations, selectedConversationId]
  );

  /*
   * Auto scroll messages to bottom
   */
  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }

    const timer = window.setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 50);

    return () => {
      window.clearTimeout(timer);
    };
  }, [messages, selectedConversationId]);

  /*
   * Mark conversation as read
   */
  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }

    const selected = conversations.find(
      (conversation) => conversation.id === selectedConversationId
    );

    if (!selected || selected.unreadCount <= 0) {
      return;
    }

    const markAsRead = async () => {
      try {
        await markConversationAsRead(selectedConversationId);
        await refreshConversations();
      } catch (error) {
        console.error(
          "Failed to mark conversation as read:",
          error
        );
      }
    };

    void markAsRead();
  }, [
    selectedConversationId,
    conversations,
    refreshConversations,
  ]);

  /*
   * Select conversation
   */
  const handleSelectConversation = (conversationId: number) => {
    setSelectedConversationId(conversationId);

    /*
     * On mobile/tablet show chat after selecting conversation.
     */
    setShowConversationList(false);
  };

  /*
   * Back to conversation list on mobile
   */
  const handleBackToConversations = () => {
    setShowConversationList(true);
  };


  const handleFileSelect = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    setSelectedFiles((previous) => [
      ...previous,
      ...files,
    ]);

    event.target.value = "";
  };

  const clearSelectedFiles = () => {
    setSelectedFiles([]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((previous) =>
      previous.filter((_, fileIndex) => fileIndex !== index)
    );
  };



  /*
   * Send message
   */

  const handleSendMessage = async () => {
    const text = messageText.trim();

    if (
      (!text && selectedFiles.length === 0) ||
      sending ||
      !selectedConversationId
    ) {
      return;
    }

    let success = false;

    if (selectedFiles.length > 0) {
      success = await sendMedia(
        selectedFiles,
        text
      );
    } else {
      success = await sendMessage(text);
    }

    if (success) {
      setMessageText("");
      setSelectedFiles([]);

      window.setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 50);
    }
  };
  /*
   * Enter = Send
   * Shift + Enter = New line
   */
  const handleComposerKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

  /*
   * Format time
   */
  const formatTime = (dateString: string | null) => {
    if (!dateString) {
      return "";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /*
   * Avatar initials
   */
  const getInitials = (name: string | null) => {
    if (!name) {
      return "?";
    }

    const words = name.trim().split(/\s+/);

    return words
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  return (
    <div className="flex h-[calc(100dvh-var(--header-height)-2rem)] min-h-[520px] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)] lg:min-h-[600px]">
      {/* =====================================================
          CONVERSATION SIDEBAR
         ===================================================== */}

      <aside
        className={`${showConversationList ? "flex" : "hidden"
          } w-full shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] lg:flex lg:w-[360px]`}
      >
        {/* Sidebar Header */}
        <div className="border-b border-[var(--color-border)] px-4 py-4 sm:px-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                Inbox
              </h2>

              <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                {conversations.length} conversations
              </p>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowInboxMenu((previous) => !previous)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-hover)]"
                title="More options"
              >
                <MoreVertical size={17} />
              </button>

              {showInboxMenu && (
                <div className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-xl">

                  <button
                    type="button"
                    onClick={async () => {
                      setShowInboxMenu(false);
                      setShowNewGroupModal(true);

                      try {
                        setContactsLoading(true);
                        const data = await getContacts();
                        setContacts(data);
                      } catch (error) {
                        console.error("Failed to load contacts:", error);
                      } finally {
                        setContactsLoading(false);
                      }
                    }}
                    className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
                  >
                    New Group
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowInboxMenu(false);
                      console.log("New Broadcast List");
                    }}
                    className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
                  >
                    New Broadcast List
                  </button>

                  <div className="my-1 border-t border-[var(--color-border)]" />

                  <button
                    type="button"
                    onClick={() => {
                      setShowInboxMenu(false);
                      console.log("Read All");
                    }}
                    className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
                  >
                    Read All
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowInboxMenu(false);
                      console.log("Starred Messages");
                    }}
                    className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
                  >
                    Starred Messages
                  </button>

                  <div className="my-1 border-t border-[var(--color-border)]" />

                  <button
                    type="button"
                    onClick={() => {
                      setShowInboxMenu(false);
                      console.log("Settings");
                    }}
                    className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
                  >
                    Settings
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search conversations..."
              className="h-10 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] pl-10 pr-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {conversationsLoading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="flex animate-pulse gap-3 rounded-xl p-3"
                >
                  <div className="h-11 w-11 shrink-0 rounded-full bg-[var(--color-surface-muted)]" />

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 h-3 w-32 rounded bg-[var(--color-surface-muted)]" />

                    <div className="h-3 w-48 max-w-full rounded bg-[var(--color-surface-muted)]" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversationsError ? (
            <div className="p-5 text-sm text-[var(--color-danger)]">
              {conversationsError}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                <Search size={20} />
              </div>

              <p className="text-sm font-medium text-[var(--color-text)]">
                No conversations found
              </p>

              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Try a different search term.
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const isSelected =
                conversation.id === selectedConversationId;

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() =>
                    handleSelectConversation(conversation.id)
                  }
                  className={`flex w-full gap-3 border-b border-[var(--color-border)] px-4 py-3 text-left transition sm:px-4 ${isSelected
                    ? "bg-[var(--color-primary-light)]"
                    : "hover:bg-[var(--color-surface-hover)]"
                    }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold ${isSelected
                        ? "bg-[var(--color-primary)] text-[var(--color-text-inverse)]"
                        : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]"
                        }`}
                    >
                      {getInitials(conversation.contactName)}
                    </div>

                    {conversation.status === "OPEN" && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--color-surface)] bg-[var(--color-success)]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-[var(--color-text)]">
                        {conversation.contactName ||
                          conversation.phoneNumber ||
                          "Unknown contact"}
                      </span>

                      <span className="shrink-0 text-[11px] text-[var(--color-text-muted)]">
                        {formatTime(conversation.lastMessageAt)}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="min-w-0 truncate text-xs text-[var(--color-text-secondary)]">
                        {conversation.lastMessageText ||
                          "No messages yet"}
                      </p>

                      {conversation.unreadCount > 0 && (
                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] px-1.5 text-[10px] font-semibold text-[var(--color-text-inverse)]">
                          {conversation.unreadCount > 99
                            ? "99+"
                            : conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* =====================================================
          CHAT AREA
         ===================================================== */}

      <section
        className={`${showConversationList ? "hidden" : "flex"
          } min-w-0 flex-1 flex-col bg-[var(--color-bg)] lg:flex`}
      >
        {selectedConversation ? (
          <>
            {/* =================================================
                CHAT HEADER
               ================================================= */}

            <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-3 sm:h-[72px] sm:px-5">
              <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                {/* Mobile Back */}
                <button
                  type="button"
                  onClick={handleBackToConversations}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-hover)] lg:hidden"
                  title="Back to conversations"
                >
                  <ArrowLeft size={19} />
                </button>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-sm font-semibold text-[var(--color-primary)]">
                  {getInitials(selectedConversation.contactName)}
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-[var(--color-text)] sm:text-[15px]">
                    {selectedConversation.contactName ||
                      selectedConversation.phoneNumber ||
                      "Unknown contact"}
                  </h3>

                  <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                    <span className="max-w-[160px] truncate text-xs text-[var(--color-text-muted)] sm:max-w-none">
                      {selectedConversation.phoneNumber ||
                        "No phone"}
                    </span>

                    <span className="text-[var(--color-border-strong)]">
                      •
                    </span>

                    <span
                      className={`text-xs ${selectedConversation.status === "OPEN"
                        ? "text-[var(--color-success)]"
                        : "text-[var(--color-text-muted)]"
                        }`}
                    >
                      {selectedConversation.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                <button
                  type="button"
                  onClick={() => setShowContactDetails(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-hover)]"
                  title="Contact"
                >
                  <UserRound size={18} />
                </button>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-hover)]"
                  title="More options"
                >
                  <MoreVertical size={18} />
                </button>
              </div>
            </header>

            {/* =================================================
                MESSAGES
               ================================================= */}

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-6">
              {messagesLoading ? (
                <div className="space-y-4">
                  <div className="flex justify-start">
                    <div className="h-12 w-52 max-w-[75%] animate-pulse rounded-2xl bg-[var(--color-surface-muted)]" />
                  </div>

                  <div className="flex justify-end">
                    <div className="h-12 w-64 max-w-[75%] animate-pulse rounded-2xl bg-[var(--color-primary-light)]" />
                  </div>

                  <div className="flex justify-start">
                    <div className="h-16 w-72 max-w-[75%] animate-pulse rounded-2xl bg-[var(--color-surface-muted)]" />
                  </div>
                </div>
              ) : messagesError ? (
                <div className="flex h-full items-center justify-center px-4">
                  <div className="rounded-xl border border-[var(--color-danger-light)] bg-[var(--color-surface)] px-5 py-4 text-center text-sm text-[var(--color-danger)]">
                    {messagesError}
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-5 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                    <Wifi size={24} />
                  </div>

                  <h3 className="text-sm font-semibold text-[var(--color-text)]">
                    Start the conversation
                  </h3>

                  <p className="mt-1 max-w-xs text-xs leading-5 text-[var(--color-text-muted)]">
                    Send a WhatsApp message from SiteGenius to
                    begin chatting with this contact.
                  </p>
                </div>
              ) : (
                <div className="mx-auto flex max-w-4xl flex-col gap-3">
                  {messages.map((message) => {
                    const outgoing =
                      message.direction === "OUTGOING";

                    return (
                      <div
                        key={message.id}
                        className={`flex ${outgoing
                          ? "justify-end"
                          : "justify-start"
                          }`}
                      >
                        <div
                          className={`flex max-w-[88%] flex-col sm:max-w-[72%] ${outgoing
                            ? "items-end"
                            : "items-start"
                            }`}
                        >
                          <div
                            className={`break-words rounded-2xl px-3 py-2.5 text-sm leading-6 shadow-[var(--shadow-xs)] ${outgoing
                              ? "rounded-br-md bg-[var(--color-primary)] text-[var(--color-text-inverse)]"
                              : "rounded-bl-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
                              }`}
                          >
                            {message.messageType === "IMAGE" && message.mediaUrl ? (
                              <div className="space-y-2">
                                <img
                                  src={message.mediaUrl}
                                  alt={message.mediaCaption || "WhatsApp image"}
                                  className="max-h-[320px] max-w-full rounded-xl object-cover"
                                />

                                {message.mediaCaption && (
                                  <p className="whitespace-pre-wrap">
                                    {message.mediaCaption}
                                  </p>
                                )}
                              </div>
                            ) : message.messageType === "VIDEO" && message.mediaUrl ? (
                              <div className="space-y-2">
                                <video
                                  src={message.mediaUrl}
                                  controls
                                  className="max-h-[320px] max-w-full rounded-xl"
                                />

                                {message.mediaCaption && (
                                  <p className="whitespace-pre-wrap">
                                    {message.mediaCaption}
                                  </p>
                                )}
                              </div>
                            ) : message.messageType === "AUDIO" && message.mediaUrl ? (
                              <div className="min-w-[220px] space-y-2">
                                <audio
                                  src={message.mediaUrl}
                                  controls
                                  className="w-full"
                                />

                                {message.mediaCaption && (
                                  <p className="whitespace-pre-wrap">
                                    {message.mediaCaption}
                                  </p>
                                )}
                              </div>
                            ) : message.messageType === "DOCUMENT" && message.mediaUrl ? (
                              <a
                                href={message.mediaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex min-w-[220px] items-center gap-3 rounded-xl bg-black/5 p-3 transition hover:bg-black/10"
                              >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/80">
                                  <FileText size={20} />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-medium">
                                    {message.mediaFileName || "Document"}
                                  </p>

                                  {message.mediaSize && (
                                    <p className="mt-0.5 text-xs opacity-70">
                                      {(message.mediaSize / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  )}
                                </div>
                              </a>
                            ) : (
                              <p className="whitespace-pre-wrap">
                                {message.messageText}
                              </p>
                            )}
                          </div>

                          <div
                            className={`mt-1 flex items-center gap-1.5 px-1 text-[10px] text-[var(--color-text-muted)] ${outgoing ? "justify-end" : ""
                              }`}
                          >
                            <span>
                              {formatTime(message.createdAt)}
                            </span>

                            {outgoing && (
                              <>
                                {message.deliveryStatus === "READ" ? (
                                  <CheckCheck
                                    size={13}
                                    className="text-blue-500"
                                  />
                                ) : message.deliveryStatus === "DELIVERED" ? (
                                  <CheckCheck
                                    size={13}
                                    className="text-[var(--color-text-muted)]"
                                  />
                                ) : message.deliveryStatus === "SENT" ? (
                                  <Check
                                    size={13}
                                    className="text-[var(--color-text-muted)]"
                                  />
                                ) : message.deliveryStatus === "FAILED" ? (
                                  <span
                                    className="text-red-500"
                                    title="Message failed"
                                  >
                                    !
                                  </span>
                                ) : message.whatsappMessageId ? (
                                  <Check
                                    size={13}
                                    className="text-[var(--color-text-muted)]"
                                  />
                                ) : (
                                  <Check
                                    size={13}
                                    className="text-[var(--color-text-muted)]"
                                  />
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Auto-scroll target */}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* =================================================
                COMPOSER
               ================================================= */}

            <div className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] p-2.5 sm:p-4">
              <div className="mx-auto max-w-4xl">
                {selectedFiles.length > 0 && (
                  <div className="mb-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3">

                    {/* Header */}
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text)]">
                          {selectedFiles.length} file
                          {selectedFiles.length > 1 ? "s" : ""} selected
                        </p>

                        <p className="text-xs text-[var(--color-text-muted)]">
                          Ready to upload and send
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={clearSelectedFiles}
                        disabled={sending}
                        className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-muted)] hover:text-red-500"
                        title="Remove all"
                      >
                        <X size={17} />
                      </button>
                    </div>

                    {/* Selected files */}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="relative flex w-36 shrink-0 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2"
                        >
                          {file.type.startsWith("image/") ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="h-12 w-12 shrink-0 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]">
                              {file.type.startsWith("video/") ? (
                                <Video size={19} />
                              ) : file.type.startsWith("audio/") ? (
                                <Music size={19} />
                              ) : (
                                <FileText size={19} />
                              )}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-[var(--color-text)]">
                              {file.name}
                            </p>

                            <p className="mt-0.5 text-[10px] text-[var(--color-text-muted)]">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeSelectedFile(index)}
                            disabled={sending}
                            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)] shadow-sm ring-1 ring-[var(--color-border)] hover:text-red-500"
                            title="Remove"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Upload / Send progress */}
                    {mediaProgress.total > 0 &&
                      mediaProgress.phase !== "idle" && (
                        <div className="mt-3 space-y-2">

                          {/* Upload */}
                          <div>
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-xs text-[var(--color-text-secondary)]">
                                Uploading
                              </span>

                              <span className="text-xs font-semibold text-[var(--color-text)]">
                                {mediaProgress.uploaded} / {mediaProgress.total}
                              </span>
                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
                              <div
                                className="h-full rounded-full bg-[var(--color-primary)] transition-all"
                                style={{
                                  width: `${(mediaProgress.uploaded /
                                    mediaProgress.total) *
                                    100
                                    }%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Sending */}
                          <div>
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-xs text-[var(--color-text-secondary)]">
                                Sending to WhatsApp
                              </span>

                              <span className="text-xs font-semibold text-[var(--color-text)]">
                                {mediaProgress.sent} / {mediaProgress.total}
                              </span>
                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
                              <div
                                className="h-full rounded-full bg-[var(--color-success)] transition-all"
                                style={{
                                  width: `${(mediaProgress.sent /
                                    mediaProgress.total) *
                                    100
                                    }%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Current file */}
                          {mediaProgress.currentFile && (
                            <p className="truncate text-[10px] text-[var(--color-text-muted)]">
                              Current: {mediaProgress.currentFile}
                            </p>
                          )}

                          {/* Completed */}
                          {mediaProgress.phase === "completed" && (
                            <p className="text-xs font-medium text-[var(--color-success)]">
                              ✓ All files sent successfully
                            </p>
                          )}
                        </div>
                      )}
                  </div>
                )}
                <div className="flex items-end gap-1.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-1.5 transition focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary-soft)] sm:gap-2 sm:p-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setAttachmentMenuOpen((previous) => !previous)
                      }
                      disabled={sending || !selectedConversationId}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-50"
                      title="Attach"
                    >
                      <Paperclip size={19} />
                    </button>

                    {attachmentMenuOpen && (
                      <div className="absolute bottom-12 left-0 z-50 w-64 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-xl">

                        {/* Photos */}
                        <button
                          type="button"
                          onClick={() => {
                            photoInputRef.current?.click();
                            setAttachmentMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[var(--color-surface-muted)]"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                            <ImageIcon size={20} />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-[var(--color-text)]">
                              Photos
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)]">
                              Upload images
                            </p>
                          </div>
                        </button>

                        {/* Videos */}
                        <button
                          type="button"
                          onClick={() => {
                            videoInputRef.current?.click();
                            setAttachmentMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[var(--color-surface-muted)]"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                            <Video size={20} />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-[var(--color-text)]">
                              Videos
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)]">
                              Upload videos
                            </p>
                          </div>
                        </button>

                        {/* Documents */}
                        <button
                          type="button"
                          onClick={() => {
                            documentInputRef.current?.click();
                            setAttachmentMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[var(--color-surface-muted)]"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <FileText size={20} />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-[var(--color-text)]">
                              Documents
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)]">
                              PDF, Word, Excel, etc.
                            </p>
                          </div>
                        </button>

                        {/* Audio */}
                        <button
                          type="button"
                          onClick={() => {
                            audioInputRef.current?.click();
                            setAttachmentMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[var(--color-surface-muted)]"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                            <Music size={20} />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-[var(--color-text)]">
                              Audio
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)]">
                              Send audio files
                            </p>
                          </div>
                        </button>

                        {/* Catalog */}
                        <button
                          type="button"
                          onClick={openCatalogPicker}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[var(--color-surface-muted)]"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                            <ShoppingBag size={20} />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-[var(--color-text)]">
                              Catalog
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)]">
                              Send products
                            </p>
                          </div>
                        </button>
                      </div>
                    )}

                    {/* Hidden file inputs */}
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />

                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />

                    <input
                      ref={documentInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />

                    <input
                      ref={audioInputRef}
                      type="file"
                      accept="audio/*"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>

                  <textarea
                    value={messageText}
                    onChange={(event) =>
                      setMessageText(event.target.value)
                    }
                    onKeyDown={handleComposerKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    className="max-h-32 min-h-9 min-w-0 flex-1 resize-none border-0 bg-transparent px-1 py-2 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]"
                  />

                  <button
                    type="button"
                    className="mb-0.5 hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-hover)] sm:flex"
                    title="Emoji"
                  >
                    <Smile size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleSendMessage()}
                    disabled={
                      (!messageText.trim() && selectedFiles.length === 0) ||
                      sending ||
                      !selectedConversationId
                    }
                    className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] text-[var(--color-text-inverse)] transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                    title="Send message"
                  >
                    {sending ? (
                      <Circle
                        size={17}
                        className="animate-pulse"
                      />
                    ) : (
                      <Send size={17} />
                    )}
                  </button>
                </div>

                <p className="mt-2 hidden px-1 text-[10px] text-[var(--color-text-muted)] sm:block">
                  Press Enter to send · Shift + Enter for a new line
                </p>
              </div>

            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-5 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
              <UserRound size={28} />
            </div>

            <h2 className="text-base font-semibold text-[var(--color-text)]">
              Select a conversation
            </h2>

            <p className="mt-1 max-w-sm text-sm text-[var(--color-text-muted)]">
              Choose a conversation from the left to view
              messages and reply to your customer.
            </p>
          </div>
        )}

      </section>
      {showCatalogPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-[var(--color-surface)] shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-[var(--color-text)]">
                  Select Products
                </h2>

                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                  Select products to send in WhatsApp
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCatalogPicker(false);
                  setCatalogSearch("");
                  setSelectedCatalogProducts([]);
                }}
                className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
              >
                <X size={19} />
              </button>
            </div>

            {/* Search */}
            <div className="border-b border-[var(--color-border)] p-4">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                />

                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(event) =>
                    setCatalogSearch(event.target.value)
                  }
                  placeholder="Search products..."
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] py-2.5 pl-10 pr-4 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>

            {/* Products */}
            <div className="flex-1 overflow-y-auto p-4">
              {catalogLoading ? (
                <div className="flex min-h-40 items-center justify-center">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Loading products...
                  </p>
                </div>
              ) : (
                (() => {
                  const filteredProducts = catalogProducts.filter(
                    (product) =>
                      product.name
                        .toLowerCase()
                        .includes(catalogSearch.toLowerCase()) ||
                      product.sku
                        .toLowerCase()
                        .includes(catalogSearch.toLowerCase())
                  );

                  if (filteredProducts.length === 0) {
                    return (
                      <div className="flex min-h-40 items-center justify-center">
                        <p className="text-sm text-[var(--color-text-muted)]">
                          No products found.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {filteredProducts.map((product) => {
                        const selected =
                          selectedCatalogProducts.some(
                            (item) => item.id === product.id
                          );

                        return (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => {
                              setSelectedCatalogProducts((previous) => {
                                if (
                                  previous.some(
                                    (item) => item.id === product.id
                                  )
                                ) {
                                  return previous.filter(
                                    (item) =>
                                      item.id !== product.id
                                  );
                                }

                                return [...previous, product];
                              });
                            }}
                            className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${selected
                              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                              : "border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]"
                              }`}
                          >
                            {/* Product image */}
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-16 w-16 shrink-0 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
                                <ShoppingBag size={22} />
                              </div>
                            )}

                            {/* Product details */}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                                {product.name}
                              </p>

                              <p className="mt-1 text-sm font-medium text-[var(--color-primary)]">
                                {product.currency} {product.price}
                              </p>

                              {product.sku && (
                                <p className="mt-0.5 truncate text-xs text-[var(--color-text-muted)]">
                                  SKU: {product.sku}
                                </p>
                              )}
                            </div>

                            {/* Selection */}
                            <div
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected
                                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                                : "border-[var(--color-border)]"
                                }`}
                            >
                              {selected && (
                                <Check size={13} />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] px-5 py-4">
              <p className="text-sm text-[var(--color-text-muted)]">
                {selectedCatalogProducts.length} product
                {selectedCatalogProducts.length !== 1
                  ? "s"
                  : ""}{" "}
                selected
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCatalogPicker(false);
                    setSelectedCatalogProducts([]);
                    setCatalogSearch("");
                  }}
                  className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    selectedCatalogProducts.length === 0 ||
                    !selectedConversationId ||
                    sending
                  }
                  onClick={async () => {
                    if (
                      !selectedConversationId ||
                      selectedCatalogProducts.length === 0
                    ) {
                      return;
                    }

                    try {
                      for (const product of selectedCatalogProducts) {
                        await sendProductMessage(
                          selectedConversationId,
                          product.id
                        );
                      }

                      setShowCatalogPicker(false);
                      setSelectedCatalogProducts([]);
                      setCatalogSearch("");

                      await refresh();

                    } catch (error) {
                      console.error(
                        "Failed to send catalog products:",
                        error
                      );
                    }
                  }}
                  className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send Products"}
                </button>
              </div>
            </div>
          </div>
        </div>

      )}


      {showNewGroupModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-[var(--color-surface)] shadow-2xl">

            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-[var(--color-text)]">
                  New Group
                </h2>

                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                  Create a WhatsApp group
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowNewGroupModal(false);
                  setGroupName("");
                  setSelectedGroupContacts([]);
                  setContactSearch("");
                }}
                className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-5">

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                  Group name
                </label>

                <input
                  type="text"
                  value={groupName}
                  onChange={(event) => setGroupName(event.target.value)}
                  placeholder="Enter group name"
                  className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3">

                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      Add participants
                    </p>

                    <p className="text-xs text-[var(--color-text-muted)]">
                      {selectedGroupContacts.length} selected
                    </p>
                  </div>
                </div>

                <input
                  type="text"
                  value={contactSearch}
                  onChange={(event) => setContactSearch(event.target.value)}
                  placeholder="Search contacts..."
                  className="mb-3 h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                />

                <div className="max-h-52 space-y-1 overflow-y-auto">

                  {contactsLoading ? (
                    <p className="py-6 text-center text-xs text-[var(--color-text-muted)]">
                      Loading contacts...
                    </p>
                  ) : (
                    contacts
                      .filter((contact) => {
                        const keyword = contactSearch.toLowerCase().trim();

                        return (
                          !keyword ||
                          contact.name.toLowerCase().includes(keyword) ||
                          contact.phoneNumber.toLowerCase().includes(keyword)
                        );
                      })
                      .map((contact) => {
                        const selected = selectedGroupContacts.some(
                          (item) => item.id === contact.id
                        );

                        return (
                          <button
                            key={contact.id}
                            type="button"
                            onClick={() => {
                              setSelectedGroupContacts((previous) =>
                                selected
                                  ? previous.filter(
                                    (item) => item.id !== contact.id
                                  )
                                  : [...previous, contact]
                              );
                            }}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${selected
                              ? "bg-[var(--color-primary-light)]"
                              : "hover:bg-[var(--color-surface-muted)]"
                              }`}
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-xs font-semibold text-[var(--color-text-secondary)]">
                              {contact.name
                                .split(" ")
                                .slice(0, 2)
                                .map((word) => word.charAt(0).toUpperCase())
                                .join("")}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-[var(--color-text)]">
                                {contact.name}
                              </p>

                              <p className="truncate text-xs text-[var(--color-text-muted)]">
                                {contact.phoneNumber}
                              </p>
                            </div>

                            <div
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected
                                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                                : "border-[var(--color-border)]"
                                }`}
                            >
                              {selected && <Check size={13} />}
                            </div>
                          </button>
                        );
                      })
                  )}

                </div>
              </div>

            </div>

            <div className="flex justify-end gap-2 border-t border-[var(--color-border)] px-5 py-4">

              <button
                type="button"
                onClick={() => {
                  setShowNewGroupModal(false);
                  setGroupName("");
                  setSelectedGroupContacts([]);
                  setContactSearch("");
                }}
                className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!groupName.trim()}
                onClick={() => {
                  console.log("Create group:", groupName);
                }}
                className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Create Group
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}