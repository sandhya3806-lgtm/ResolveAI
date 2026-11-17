import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Edit3,
  Eye,
  Plus,
  Power,
  Search,
  Upload,
  X,
} from 'lucide-react';
import type { KnowledgeArticle, SupportCategory } from '../../types/support';
import { formatDateOnly } from '../../utils/format';

interface KnowledgeBasePageProps {
  articles: KnowledgeArticle[];
  onCreateArticle: (payload: {
    title: string;
    category: SupportCategory;
    content: string;
    sourceRef: string;
  }) => Promise<void>;
  onUpdateArticle: (
    id: string,
    patch: Partial<KnowledgeArticle>
  ) => Promise<void>;
  initialInspectId?: string | null;
  onClearInspect?: () => void;
}

const CATEGORIES: Array<SupportCategory | 'All'> = [
  'All',
  'Billing & Payments',
  'Account Access',
  'Technical Issues',
  'Product Questions',
  'Other',
];

export function KnowledgeBasePage({
  articles,
  onCreateArticle,
  onUpdateArticle,
  initialInspectId,
  onClearInspect,
}: KnowledgeBasePageProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SupportCategory | 'All'>(
    'All'
  );
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>(
    'all'
  );

  const [viewingArticle, setViewingArticle] = useState<KnowledgeArticle | null>(
    () =>
      initialInspectId
        ? articles.find((a) => a.id === initialInspectId) || null
        : null
  );
  const [editingArticle, setEditingArticle] = useState<KnowledgeArticle | null>(
    null
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form state for Create/Edit
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] =
    useState<SupportCategory>('Product Questions');
  const [formSourceRef, setFormSourceRef] = useState('');
  const [formContent, setFormContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return articles.filter((art) => {
      if (categoryFilter !== 'All' && art.category !== categoryFilter) {
        return false;
      }
      if (statusFilter === 'active' && !art.active) return false;
      if (statusFilter === 'inactive' && art.active) return false;
      if (!q) return true;
      return (
        art.id.toLowerCase().includes(q) ||
        art.title.toLowerCase().includes(q) ||
        art.content.toLowerCase().includes(q) ||
        art.sourceRef.toLowerCase().includes(q)
      );
    });
  }, [articles, search, categoryFilter, statusFilter]);

  const openCreate = () => {
    setFormTitle('');
    setFormCategory('Product Questions');
    setFormSourceRef('');
    setFormContent('');
    setShowCreateModal(true);
  };

  const openEdit = (art: KnowledgeArticle) => {
    setFormTitle(art.title);
    setFormCategory(art.category);
    setFormSourceRef(art.sourceRef);
    setFormContent(art.content);
    setEditingArticle(art);
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim() || isSaving) return;
    setIsSaving(true);
    try {
      await onCreateArticle({
        title: formTitle.trim(),
        category: formCategory,
        content: formContent.trim(),
        sourceRef: formSourceRef.trim(),
      });
      setShowCreateModal(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle || !formTitle.trim() || !formContent.trim() || isSaving)
      return;
    setIsSaving(true);
    try {
      await onUpdateArticle(editingArticle.id, {
        title: formTitle.trim(),
        category: formCategory,
        content: formContent.trim(),
        sourceRef: formSourceRef.trim(),
      });
      setEditingArticle(null);
    } finally {
      setIsSaving(false);
    }
  };

  const closeViewModal = () => {
    setViewingArticle(null);
    onClearInspect?.();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#111827]">
            Verified Knowledge Base
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Manage approved support documentation used by ResolveAI to ground
            customer responses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#172554] hover:border-[#2563EB] transition-colors"
          >
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Upload Document</span>
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add New FAQ</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-6">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]"
              aria-hidden="true"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search knowledge articles, IDs, or reference docs..."
              aria-label="Search knowledge articles"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-[#111827] placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as SupportCategory | 'All')
              }
              aria-label="Filter articles by category"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-[#111827] focus:border-[#2563EB] focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')
              }
              aria-label="Filter articles by active status"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-[#111827] focus:border-[#2563EB] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Articles List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-14 px-6 text-center">
          <BookOpen
            className="mx-auto mb-3 h-8 w-8 text-slate-300"
            aria-hidden="true"
          />
          <h2 className="font-display text-base font-semibold text-[#111827]">
            No knowledge articles match your filters
          </h2>
          <p className="mt-1 text-xs text-[#64748B]">
            Try clearing your search or create a new verified FAQ article.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-[#F7F9FC] text-xs font-semibold text-[#64748B]">
                <tr>
                  <th className="px-5 py-3">Article Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Source / Reference</th>
                  <th className="px-4 py-3">Last Updated</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((art) => (
                  <tr key={art.id} className="hover:bg-[#F7F9FC] transition-colors">
                    <td className="px-5 py-4 max-w-sm">
                      <div className="flex items-center gap-2 text-xs text-[#64748B] mb-0.5">
                        <span className="font-mono font-semibold text-[#172554]">
                          {art.id}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#111827] leading-snug">
                        {art.title}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-xs text-[#64748B] whitespace-nowrap">
                      {art.category}
                    </td>
                    <td className="px-4 py-4 text-xs text-[#64748B] max-w-[200px] truncate">
                      {art.sourceRef}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs tabular-nums text-[#64748B] whitespace-nowrap">
                      {formatDateOnly(art.lastUpdated)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${
                          art.active
                            ? 'border-emerald-200 bg-emerald-50 text-[#16A34A]'
                            : 'border-slate-200 bg-slate-100 text-[#64748B]'
                        }`}
                      >
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        {art.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingArticle(art)}
                          title="View article details"
                          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-[#111827] hover:border-[#2563EB] hover:text-[#2563EB]"
                        >
                          <Eye className="h-3.5 w-3.5 inline mr-1" aria-hidden="true" />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(art)}
                          title="Edit FAQ"
                          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-[#111827] hover:border-[#2563EB] hover:text-[#2563EB]"
                        >
                          <Edit3 className="h-3.5 w-3.5 inline mr-1" aria-hidden="true" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateArticle(art.id, { active: !art.active })
                          }
                          title={art.active ? 'Deactivate FAQ' : 'Activate FAQ'}
                          className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                            art.active
                              ? 'border-slate-200 bg-white text-[#64748B] hover:border-red-200 hover:text-[#DC2626]'
                              : 'border-emerald-200 bg-emerald-50 text-[#16A34A] hover:bg-emerald-100'
                          }`}
                        >
                          <Power className="h-3.5 w-3.5 inline mr-1" aria-hidden="true" />
                          {art.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Article Modal */}
      {viewingArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                  <span className="font-mono font-semibold text-[#172554]">
                    {viewingArticle.id}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{viewingArticle.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>Updated {formatDateOnly(viewingArticle.lastUpdated)}</span>
                </div>
                <h2 className="font-display text-lg font-bold text-[#111827]">
                  {viewingArticle.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeViewModal}
                className="rounded-lg p-1.5 text-[#64748B] hover:bg-slate-100"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <p className="text-sm leading-relaxed text-[#111827]">
                {viewingArticle.content}
              </p>
              <div className="rounded-lg bg-[#F7F9FC] p-3 text-xs text-[#64748B]">
                Source / Reference:{' '}
                <span className="font-semibold text-[#172554]">
                  {viewingArticle.sourceRef}
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const art = viewingArticle;
                  closeViewModal();
                  openEdit(art);
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-[#172554] hover:border-[#2563EB]"
              >
                Edit Article
              </button>
              <button
                type="button"
                onClick={closeViewModal}
                className="rounded-lg bg-[#172554] px-4 py-2 text-xs font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit FAQ Modal */}
      {(showCreateModal || editingArticle) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="font-display text-lg font-bold text-[#111827]">
                {editingArticle
                  ? `Edit FAQ (${editingArticle.id})`
                  : 'Add Verified FAQ Article'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingArticle(null);
                }}
                className="rounded-lg p-1.5 text-[#64748B] hover:bg-slate-100"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={editingArticle ? handleSaveEdit : handleSaveCreate}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-[#111827] mb-1">
                  Article Title
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Configuring IP Allowlists for Enterprise Workspaces"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) =>
                      setFormCategory(e.target.value as SupportCategory)
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">
                    Source / Reference ID
                  </label>
                  <input
                    type="text"
                    value={formSourceRef}
                    onChange={(e) => setFormSourceRef(e.target.value)}
                    placeholder="e.g., SEC-DOC-14 · Network Policy"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111827] mb-1">
                  Verified Answer Content
                </label>
                <textarea
                  required
                  rows={5}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Provide factual, step-by-step instructions approved for AI citation..."
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingArticle(null);
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50"
                >
                  {isSaving
                    ? 'Saving...'
                    : editingArticle
                    ? 'Save Changes'
                    : 'Publish FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Future-Ready Upload Document Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="font-display text-base font-bold text-[#111827]">
                Document Ingestion (Roadmap)
              </h2>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="rounded-lg p-1.5 text-[#64748B] hover:bg-slate-100"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-[#F7F9FC] p-6 text-center">
              <Upload
                className="mx-auto mb-2.5 h-7 w-7 text-[#2563EB]"
                aria-hidden="true"
              />
              <p className="text-sm font-semibold text-[#111827]">
                Automated PDF & Policy Sync
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-[#64748B]">
                Bulk PDF/Markdown ingestion is reserved for Phase 2. In this
                MVP release, administrators can create, edit, and activate
                verified FAQ articles directly using the Add New FAQ workflow.
              </p>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowUploadModal(false);
                  openCreate();
                }}
                className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
              >
                Add Manual FAQ Instead
              </button>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-[#111827]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
