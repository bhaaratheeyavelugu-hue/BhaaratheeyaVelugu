"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Edition = {
  id: string;
  date: string;
  region: string;
  language: string;
  totalPages: number;
  isPublished: boolean;
  pageCount: number;
};

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  level: number;
  totalPagesRead: number;
  createdAt: string;
  adminPermissions: { canUpload: boolean; canEdit: boolean; canDelete: boolean; canManageUsers: boolean } | null;
};

export function AdminDashboard({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const [editions, setEditions] = useState<Edition[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tab, setTab] = useState<"editions" | "users">("editions");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState<"ADMIN" | "SUPER_ADMIN">("ADMIN");
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const loadEditions = () => {
    fetch("/api/admin/editions")
      .then((r) => r.json())
      .then(setEditions)
      .catch(() => setEditions([]));
  };

  useEffect(() => {
    loadEditions();
  }, []);

  useEffect(() => {
    // Suppress ESLint warning as document.cookie modification is standard practice here
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const loadUsers = () => {
      if (!isSuperAdmin) return;
      fetch("/api/admin/users")
        .then((r) => r.json())
        .then(setUsers)
        .catch(() => setUsers([]));
    };

    if (tab === "users" && isSuperAdmin) loadUsers();
  }, [tab, isSuperAdmin]);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const file = (form.elements.namedItem("file") as HTMLInputElement)?.files?.[0];
    const date = (form.elements.namedItem("date") as HTMLInputElement)?.value;
    const region = (form.elements.namedItem("region") as HTMLInputElement)?.value || "default";
    if (!file || !date) {
      setUploadError("Select a PDF and date.");
      return;
    }
    setUploadError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("date", date);
      fd.append("region", region);
      const res = await fetch("/api/admin/editions", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      loadEditions();
      form.reset();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const togglePublish = async (id: string, isPublished: boolean) => {
    await fetch(`/api/admin/editions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !isPublished }),
    });
    loadEditions();
  };

  const deleteEdition = async (id: string) => {
    if (!confirm("Delete this edition?")) return;
    await fetch(`/api/admin/editions/${id}`, { method: "DELETE" });
    loadEditions();
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createEmail.trim()) return;
    setCreateSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: createEmail.trim(),
          password: createPassword || undefined,
          role: createRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setCreateOpen(false);
      setCreateEmail("");
      setCreatePassword("");
      
      // refresh user list
      if (isSuperAdmin) {
        fetch("/api/admin/users")
          .then((r) => r.json())
          .then(setUsers);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleRemoveStaff = async (id: string) => {
    if (!confirm("Are you sure you want to remove this user's staff access? They will become a regular reader.")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "USER" }),
      });
      if (!res.ok) throw new Error("Failed to remove staff access");
      
      // refresh user list
      if (isSuperAdmin) {
        fetch("/api/admin/users")
          .then((r) => r.json())
          .then(setUsers);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove staff access");
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 p-3 sm:p-4 md:p-8">
      <div className="rounded-2xl border border-[var(--paper-border)] bg-[var(--paper)] p-4 sm:p-6 shadow-[var(--shadow-card)] max-w-2xl mx-auto">
        <h2 className="mb-4 sm:mb-6 text-lg sm:text-xl font-bold text-[var(--ink)] font-editorial">Upload New Edition</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink-muted)]">PDF file</label>
            <input
              type="file"
              name="file"
              accept="application/pdf"
              className="w-full rounded-lg border border-[var(--paper-border)] bg-[var(--paper)] text-[var(--ink)] px-3 py-3 sm:py-2 text-base sm:text-sm min-h-[44px] sm:min-h-0"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink-muted)]">Date</label>
            <input
              type="date"
              name="date"
              required
              defaultValue={new Date(new Date().getTime() + (330 * 60000)).toISOString().split('T')[0]}
              className="w-full rounded-lg border border-[var(--paper-border)] bg-[var(--paper)] text-[var(--ink)] px-3 py-3 sm:py-2 text-base sm:text-sm min-h-[44px] sm:min-h-0"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink-muted)]">Region</label>
            <select
              name="region"
              required
              defaultValue="Telangana"
              className="w-full rounded-lg border border-[var(--paper-border)] px-3 py-3 sm:py-2 text-base sm:text-sm bg-[var(--paper)] text-[var(--ink)] min-h-[44px] sm:min-h-0"
            >
              <option value="Telangana">Telangana</option>
              <option value="Andhra Pradesh">Andhra Pradesh (Coming Soon)</option>
              <option value="Karnataka">Karnataka (Coming Soon)</option>
            </select>
          </div>
          {uploadError && (
            <p className="text-sm text-red-600">{uploadError}</p>
          )}
          <button
            type="submit"
            disabled={uploading}
            className="w-full rounded-xl bg-[var(--masthead)] py-3 sm:py-2.5 text-base sm:text-sm font-medium text-white disabled:opacity-50 hover:bg-[var(--masthead-hover)] min-h-[44px] sm:min-h-0"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </form>
      </div>

      {isSuperAdmin && (
        <div className="flex gap-2 sm:gap-4 border-b border-[var(--paper-border)] max-w-5xl mx-auto mt-8 sm:mt-12">
          <button
            type="button"
            onClick={() => setTab("editions")}
            className={`border-b-2 px-3 sm:px-4 py-3 text-sm font-medium transition-colors ${tab === "editions" ? "border-[var(--masthead)] text-[var(--masthead)]" : "border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]"}`}
          >
            Manage Editions
          </button>
          <button
            type="button"
            onClick={() => setTab("users")}
            className={`border-b-2 px-3 sm:px-4 py-3 text-sm font-medium transition-colors ${tab === "users" ? "border-[var(--masthead)] text-[var(--masthead)]" : "border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]"}`}
          >
            Users & Staff
          </button>
        </div>
      )}

      {tab === "editions" && (
        <div className="rounded-2xl border border-[var(--paper-border)] bg-[var(--paper)] p-6 shadow-[var(--shadow-card)] max-w-5xl mx-auto">
          <h2 className="mb-6 text-xl font-bold text-[var(--ink)] font-editorial">Uploaded Editions</h2>
          <ul className="space-y-2">
            {editions.map((e) => (
              <motion.li
                key={e.id}
                layout
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--paper-border)] p-3"
              >
                <div>
                  <span className="font-medium text-[var(--ink)]">{e.date}</span>
                  <span className="ml-2 text-sm text-[var(--ink-muted)]">
                    {e.region} · {e.totalPages} pages
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => togglePublish(e.id, e.isPublished)}
                    className={`rounded-lg px-3 py-1 text-xs font-medium ${e.isPublished ? "bg-green-100 text-green-800" : "bg-[var(--paper-border)] text-[var(--ink-muted)]"}`}
                  >
                    {e.isPublished ? "Published" : "Draft"}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteEdition(e.id)}
                    className="rounded-lg px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </motion.li>
            ))}
          </ul>
          {editions.length === 0 && (
            <p className="py-6 text-center text-sm text-[var(--ink-muted)]">No editions yet.</p>
          )}
        </div>
      )}

      {tab === "users" && isSuperAdmin && (
        <div className="rounded-2xl border border-[var(--paper-border)] bg-[var(--paper)] p-6 shadow-[var(--shadow-card)] max-w-5xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[var(--ink)] font-editorial">Staff Members</h2>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="rounded-lg bg-[var(--masthead)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--masthead-hover)]"
            >
              Add staff
            </button>
          </div>
          <ul className="space-y-2">
            {users.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between rounded-xl border border-[var(--paper-border)] p-3"
              >
                <div>
                  <p className="font-medium text-[var(--ink)]">{u.name || "No name provided"}</p>
                  <p className="text-sm text-[var(--ink-muted)]">{u.email} · {u.role}</p>
                </div>
                {u.role !== "SUPER_ADMIN" && (
                  <button
                    onClick={() => handleRemoveStaff(u.id)}
                    className="text-xs font-medium text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Remove Staff Access
                  </button>
                )}
              </li>
            ))}
          </ul>
          {users.length === 0 && (
            <p className="py-6 text-center text-sm text-[var(--ink-muted)]">No staff members found.</p>
          )}
        </div>
      )}

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-2xl bg-[var(--paper)] border border-[var(--paper-border)] p-6 shadow-[var(--shadow-modal)]"
          >
            <h3 className="text-lg font-semibold text-[var(--ink)] mb-2">Grant Staff Access</h3>
            <p className="text-xs text-[var(--ink-muted)] mb-4">The user must have already signed up as a reader before you can grant them staff access.</p>
            <form onSubmit={handleCreateStaff} className="space-y-3">
              <input
                type="email"
                placeholder="User's Email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--paper-border)] px-3 py-2 text-sm"
              />
              <input
                type="password"
                placeholder="New Password (Optional)"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                minLength={8}
                className="w-full rounded-lg border border-[var(--paper-border)] px-3 py-2 text-sm"
              />
              <p className="text-[10px] text-[var(--ink-muted)] -mt-1">Only fill this if you want to set/reset their staff password.</p>
              <select
                value={createRole}
                onChange={(e) => setCreateRole(e.target.value as "ADMIN" | "SUPER_ADMIN")}
                className="w-full rounded-lg border border-[var(--paper-border)] px-3 py-2 text-sm"
              >
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="flex-1 rounded-xl border border-[var(--paper-border)] py-2 text-sm font-medium text-[var(--ink-muted)] hover:bg-[var(--accent-soft)]/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="flex-1 rounded-xl bg-[var(--masthead)] py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-[var(--masthead-hover)]"
                >
                  Grant Access
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
