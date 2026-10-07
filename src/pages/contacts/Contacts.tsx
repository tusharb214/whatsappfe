import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  createContact,
  deleteContact,
  getContacts,
  updateContact,
  type Contact,
} from "../../api/contactApi";

 import { useAuth } from "../../hooks/useAuth";

type ContactForm = {
  name: string;
  phoneNumber: string;
  email: string;
  profileName: string;
  status: string;
};

const emptyForm: ContactForm = {
  name: "",
  phoneNumber: "",
  email: "",
  profileName: "",
  status: "ACTIVE",
};

export default function Contacts() {
  const { user } = useAuth();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] =
    useState<Contact | null>(null);

  const [form, setForm] = useState<ContactForm>(emptyForm);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  /*
   * ---------------------------------------------------------
   * LOAD CONTACTS
   * ---------------------------------------------------------
   */

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getContacts();

      setContacts(data);
    } catch (err) {
      console.error("Failed to load contacts:", err);
      setError("Failed to load contacts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadContacts();
  }, []);

  /*
   * ---------------------------------------------------------
   * FILTER CONTACTS
   * ---------------------------------------------------------
   */

  const filteredContacts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return contacts;
    }

    return contacts.filter((contact) => {
      return (
        contact.name?.toLowerCase().includes(keyword) ||
        contact.phoneNumber?.toLowerCase().includes(keyword) ||
        contact.email?.toLowerCase().includes(keyword) ||
        contact.profileName?.toLowerCase().includes(keyword)
      );
    });
  }, [contacts, search]);

  /*
   * ---------------------------------------------------------
   * ROLE
   * ---------------------------------------------------------
   */

  const canManageContacts =
    user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  /*
   * ---------------------------------------------------------
   * OPEN CREATE MODAL
   * ---------------------------------------------------------
   */

  const handleCreate = () => {
    setEditingContact(null);
    setForm(emptyForm);
    setShowModal(true);
    setError(null);
  };

  /*
   * ---------------------------------------------------------
   * OPEN EDIT MODAL
   * ---------------------------------------------------------
   */

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);

    setForm({
      name: contact.name ?? "",
      phoneNumber: contact.phoneNumber ?? "",
      email: contact.email ?? "",
      profileName: contact.profileName ?? "",
      status: contact.status ?? "ACTIVE",
    });

    setShowModal(true);
    setError(null);
  };

  /*
   * ---------------------------------------------------------
   * CLOSE MODAL
   * ---------------------------------------------------------
   */

  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingContact(null);
    setForm(emptyForm);
  };

  /*
   * ---------------------------------------------------------
   * FORM CHANGE
   * ---------------------------------------------------------
   */

  const handleChange = (
    field: keyof ContactForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /*
   * ---------------------------------------------------------
   * SAVE CONTACT
   * ---------------------------------------------------------
   */

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Contact name is required.");
      return;
    }

    if (!form.phoneNumber.trim()) {
      setError("Phone number is required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (editingContact) {
        const updated = await updateContact(
          editingContact.id,
          {
            name: form.name.trim(),
            phoneNumber: form.phoneNumber.trim(),
            email: form.email.trim() || null,
            profileName: form.profileName.trim() || null,
            status: form.status,
          }
        );

        setContacts((previous) =>
          previous.map((contact) =>
            contact.id === updated.id
              ? updated
              : contact
          )
        );
      } else {
        const created = await createContact({
          name: form.name.trim(),
          phoneNumber: form.phoneNumber.trim(),
          email: form.email.trim() || null,
          profileName: form.profileName.trim() || null,
          status: form.status,
        });

        setContacts((previous) => [
          created,
          ...previous,
        ]);
      }

      handleCloseModal();
    } catch (err) {
      console.error("Failed to save contact:", err);

      setError(
        "Failed to save contact. Please check the details and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * DELETE CONTACT
   * ---------------------------------------------------------
   */

  const handleDelete = async (contact: Contact) => {
    const confirmed = window.confirm(
      `Delete contact "${contact.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(contact.id);
      setError(null);

      await deleteContact(contact.id);

      setContacts((previous) =>
        previous.filter(
          (item) => item.id !== contact.id
        )
      );
    } catch (err) {
      console.error("Failed to delete contact:", err);

      setError(
        "Failed to delete contact. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /*
   * ---------------------------------------------------------
   * INITIALS
   * ---------------------------------------------------------
   */

  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);

    return words
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  /*
   * ---------------------------------------------------------
   * DATE
   * ---------------------------------------------------------
   */

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      {/* =====================================================
          PAGE
         ===================================================== */}

      <div className="space-y-5">
        {/* =================================================
            TOP BAR
           ================================================= */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                <Users size={19} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  Contacts
                </h2>

                <p className="text-xs text-[var(--color-text-muted)]">
                  Manage your customer contacts
                </p>
              </div>
            </div>
          </div>

          {canManageContacts && (
            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-text-inverse)] shadow-[var(--shadow-xs)] transition hover:bg-[var(--color-primary-hover)]"
            >
              <Plus size={17} />
              Add Contact
            </button>
          )}
        </div>

        {/* =================================================
            STATS
           ================================================= */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-xs)]">
            <p className="text-xs text-[var(--color-text-muted)]">
              Total Contacts
            </p>

            <p className="mt-1 text-2xl font-semibold text-[var(--color-text)]">
              {contacts.length}
            </p>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-xs)]">
            <p className="text-xs text-[var(--color-text-muted)]">
              Active
            </p>

            <p className="mt-1 text-2xl font-semibold text-[var(--color-success)]">
              {
                contacts.filter(
                  (contact) => contact.status === "ACTIVE"
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-xs)]">
            <p className="text-xs text-[var(--color-text-muted)]">
              Search Results
            </p>

            <p className="mt-1 text-2xl font-semibold text-[var(--color-primary)]">
              {filteredContacts.length}
            </p>
          </div>
        </div>

        {/* =================================================
            SEARCH
           ================================================= */}

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-xs)]">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name, phone, email or profile..."
              className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] pl-10 pr-10 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* =================================================
            ERROR
           ================================================= */}

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-danger-light)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-danger)]">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError(null)}
              className="shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* =================================================
            CONTACTS
           ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="flex animate-pulse items-center gap-3 rounded-xl p-3"
                >
                  <div className="h-10 w-10 rounded-full bg-[var(--color-surface-muted)]" />

                  <div className="flex-1">
                    <div className="mb-2 h-3 w-40 rounded bg-[var(--color-surface-muted)]" />

                    <div className="h-3 w-56 rounded bg-[var(--color-surface-muted)]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                <UserRound size={25} />
              </div>

              <h3 className="text-sm font-semibold text-[var(--color-text)]">
                {search
                  ? "No contacts found"
                  : "No contacts yet"}
              </h3>

              <p className="mt-1 max-w-sm text-xs leading-5 text-[var(--color-text-muted)]">
                {search
                  ? "Try searching with a different name, phone number or email."
                  : "Add your first customer contact to start managing conversations."}
              </p>

              {!search && canManageContacts && (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--color-primary)] px-3.5 text-xs font-medium text-[var(--color-text-inverse)] transition hover:bg-[var(--color-primary-hover)]"
                >
                  <Plus size={15} />
                  Add Contact
                </button>
              )}
            </div>
          ) : (
            <>
              {/* =================================================
                  DESKTOP TABLE
                 ================================================= */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                        Contact
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                        Phone
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                        Email
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                        Status
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                        Added
                      </th>

                      {canManageContacts && (
                        <th className="w-24 px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredContacts.map((contact) => (
                      <tr
                        key={contact.id}
                        className="border-b border-[var(--color-border)] last:border-b-0 transition hover:bg-[var(--color-surface-hover)]"
                      >
                        {/* Contact */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-xs font-semibold text-[var(--color-primary)]">
                              {getInitials(contact.name)}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-[var(--color-text)]">
                                {contact.name}
                              </p>

                              {contact.profileName && (
                                <p className="truncate text-xs text-[var(--color-text-muted)]">
                                  {contact.profileName}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                            <Phone size={14} />
                            {contact.phoneNumber}
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-4 py-3.5">
                          {contact.email ? (
                            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                              <Mail size={14} />
                              <span className="max-w-[200px] truncate">
                                {contact.email}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-[var(--color-text-muted)]">
                              —
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                              contact.status === "ACTIVE"
                                ? "bg-[var(--color-success-light)] text-[var(--color-success)]"
                                : "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
                            }`}
                          >
                            {contact.status}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5 text-xs text-[var(--color-text-muted)]">
                          {formatDate(contact.createdAt)}
                        </td>

                        {/* Actions */}
                        {canManageContacts && (
                          <td className="px-4 py-3.5">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(contact)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
                                title="Edit contact"
                              >
                                <Edit3 size={15} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  void handleDelete(contact)
                                }
                                disabled={
                                  deletingId === contact.id
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-danger-light)] hover:text-[var(--color-danger)] disabled:opacity-50"
                                title="Delete contact"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* =================================================
                  MOBILE CARDS
                 ================================================= */}

              <div className="divide-y divide-[var(--color-border)] md:hidden">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-4 transition hover:bg-[var(--color-surface-hover)]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-sm font-semibold text-[var(--color-primary)]">
                        {getInitials(contact.name)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                              {contact.name}
                            </p>

                            {contact.profileName && (
                              <p className="mt-0.5 truncate text-xs text-[var(--color-text-muted)]">
                                {contact.profileName}
                              </p>
                            )}
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold ${
                              contact.status === "ACTIVE"
                                ? "bg-[var(--color-success-light)] text-[var(--color-success)]"
                                : "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
                            }`}
                          >
                            {contact.status}
                          </span>
                        </div>

                        <div className="mt-3 space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                            <Phone size={13} />
                            <span className="truncate">
                              {contact.phoneNumber}
                            </span>
                          </div>

                          {contact.email && (
                            <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                              <Mail size={13} />
                              <span className="truncate">
                                {contact.email}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[10px] text-[var(--color-text-muted)]">
                            Added {formatDate(contact.createdAt)}
                          </span>

                          {canManageContacts && (
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(contact)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
                                title="Edit contact"
                              >
                                <Edit3 size={15} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  void handleDelete(contact)
                                }
                                disabled={
                                  deletingId === contact.id
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-danger-light)] hover:text-[var(--color-danger)] disabled:opacity-50"
                                title="Delete contact"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* =====================================================
          CREATE / EDIT MODAL
         ===================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">
          <div className="max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] sm:max-w-lg sm:rounded-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <div>
                <h3 className="text-base font-semibold text-[var(--color-text)]">
                  {editingContact
                    ? "Edit Contact"
                    : "Add Contact"}
                </h3>

                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                  {editingContact
                    ? "Update customer information"
                    : "Add a new customer contact"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={saving}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-hover)] disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 px-5 py-5">
              {/* Name */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
                  Name
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    handleChange("name", event.target.value)
                  }
                  placeholder="e.g. Rahul Patil"
                  className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
                  Phone Number
                </label>

                <input
                  type="text"
                  value={form.phoneNumber}
                  onChange={(event) =>
                    handleChange(
                      "phoneNumber",
                      event.target.value
                    )
                  }
                  placeholder="e.g. 918855834520"
                  className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                />

                <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">
                  Use country code with the number.
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
                  Email
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    handleChange("email", event.target.value)
                  }
                  placeholder="customer@example.com"
                  className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                />
              </div>

              {/* Profile Name */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
                  WhatsApp Profile Name
                </label>

                <input
                  type="text"
                  value={form.profileName}
                  onChange={(event) =>
                    handleChange(
                      "profileName",
                      event.target.value
                    )
                  }
                  placeholder="Optional"
                  className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                />
              </div>

              {/* Status */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
                  Status
                </label>

                <select
                  value={form.status}
                  onChange={(event) =>
                    handleChange("status", event.target.value)
                  }
                  className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col-reverse gap-2 border-t border-[var(--color-border)] px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={saving}
                className="h-10 rounded-lg border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-hover)] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="h-10 rounded-lg bg-[var(--color-primary)] px-5 text-sm font-medium text-[var(--color-text-inverse)] transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingContact
                    ? "Save Changes"
                    : "Add Contact"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}