"use client";

import { useState, useTransition } from "react";
import { Plus, ArrowUp, ArrowDown, Edit2, Trash2, FolderTree, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  reorderCategoryAction,
} from "@/lib/actions/admin-actions";
import type { Category } from "@/lib/types/database";

const PRESET_COLORS = [
  "#C75B33", // Accent burnt orange
  "#7B5EA7", // Fashion lavender/purple
  "#3B8A6E", // Fitness sage green
  "#2E7D7A", // Amazon mint/teal
  "#2D68C4", // Blue
  "#C44D68", // Rose
];

export function CategoryManager({ categories: initialCategories }: { categories: Category[] }) {
  const { success, error: toastError } = useToast();
  const [isPending, startTransition] = useTransition();

  // Dialog State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#C75B33");
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirm State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setColor("#C75B33");
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setColor(cat.color || "#C75B33");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Category name is required.");
      return;
    }

    startTransition(async () => {
      if (editingCategory) {
        const res = await updateCategoryAction(editingCategory.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          color,
        });
        if (res.error) {
          setFormError(res.error);
          toastError(res.error);
        } else {
          success("Category updated!");
          setIsModalOpen(false);
        }
      } else {
        const res = await createCategoryAction({
          name: name.trim(),
          description: description.trim() || undefined,
          color,
        });
        if (res.error) {
          setFormError(res.error);
          toastError(res.error);
        } else {
          success("Category created!");
          setIsModalOpen(false);
        }
      }
    });
  };

  const handleReorder = (id: string, direction: "up" | "down") => {
    startTransition(async () => {
      const res = await reorderCategoryAction(id, direction);
      if (res.error) toastError(res.error);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteCategoryAction(id);
      if (res.error) {
        toastError(res.error);
      } else {
        success("Category deleted.");
        setDeleteConfirmId(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase text-muted">
            Catalog Structure
          </p>
          <h1 className="font-heading text-3xl font-bold text-charcoal-deep">
            Categories
          </h1>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-white font-medium text-sm transition-colors shadow-sm w-fit"
        >
          <Plus className="w-4 h-4" />
          Add category
        </button>
      </div>

      {initialCategories.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <div className="p-4 bg-cream rounded-full w-16 h-16 mx-auto flex items-center justify-center text-charcoal">
            <FolderTree className="w-8 h-8" />
          </div>
          <p className="text-sm text-muted">No categories created yet.</p>
          <button
            onClick={openCreateModal}
            className="px-5 py-2 rounded-full bg-accent text-white text-sm font-medium"
          >
            Create first category
          </button>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF8F5] text-xs font-semibold text-charcoal uppercase tracking-wider border-b border-border select-none">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">Order</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4">Subtitle / Description</th>
                  <th className="py-3.5 px-4 text-center">Color</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {initialCategories.map((cat, idx) => (
                  <tr key={cat.id} className="hover:bg-cream/30 transition-colors">
                    {/* Reorder buttons */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center gap-0.5">
                        <button
                          type="button"
                          disabled={isPending || idx === 0}
                          onClick={() => handleReorder(cat.id, "up")}
                          className="p-1 rounded text-neutral-400 hover:text-charcoal hover:bg-neutral-100 disabled:opacity-20 transition-colors"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isPending || idx === initialCategories.length - 1}
                          onClick={() => handleReorder(cat.id, "down")}
                          className="p-1 rounded text-neutral-400 hover:text-charcoal hover:bg-neutral-100 disabled:opacity-20 transition-colors"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-heading font-semibold text-charcoal-deep">
                        {cat.name}
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <code className="text-xs text-muted bg-cream/70 px-2 py-0.5 rounded border border-border/60">
                        {cat.slug}
                      </code>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 text-body text-xs max-w-xs truncate">
                      {cat.description || "—"}
                    </td>

                    {/* Color */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-xs font-mono text-muted">{cat.color}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(cat)}
                          className="p-2 text-neutral-400 hover:text-charcoal hover:bg-neutral-100 rounded-lg transition-colors"
                          title="Edit category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(cat.id)}
                          className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete category"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-border space-y-5">
            <h3 className="font-heading text-xl font-bold text-charcoal-deep">
              {editingCategory ? "Edit category" : "Add category"}
            </h3>

            {formError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-charcoal-deep">
                  Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grooming & Haircare"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-charcoal-deep">
                  Subtitle / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dryers, trimmers, personal care"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-charcoal-deep">
                  Color Accent
                </label>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        color === c ? "border-charcoal scale-110 shadow-sm" : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded-full border border-border cursor-pointer p-0.5 bg-transparent ml-2"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-border text-sm font-medium hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-full bg-accent hover:bg-accent-hover text-white text-sm font-medium shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingCategory ? "Update category" : "Create category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-border space-y-4">
            <h3 className="font-heading text-lg font-bold text-charcoal-deep">
              Delete this category?
            </h3>
            <p className="text-sm text-body">
              Products in this category will become Uncategorized. They will not be deleted.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-full border border-border text-sm font-medium hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isPending}
                className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium shadow-sm"
              >
                {isPending ? "Deleting..." : "Delete category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
