import React, { useState } from 'react';
import { Category } from '../types';
import { X, Plus, Trash2, Tag, AlertCircle } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void;
  onDeleteCategory: (id: number) => void;
}

const PRESET_COLORS = [
  '#0d6efd', // Blue
  '#6f42c1', // Purple
  '#198754', // Green
  '#0dcaf0', // Cyan
  '#fd7e14', // Orange
  '#dc3545', // Red
  '#d63384', // Pink
  '#6c757d', // Slate
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#0d6efd');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    const trimmed = name.trim();
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setError(`Category with name "${trimmed}" already exists`);
      return;
    }

    onAddCategory({
      name: trimmed,
      color,
      description: description.trim() || undefined,
    });

    setName('');
    setDescription('');
    setColor('#0d6efd');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-lg text-slate-900">Manage Categories</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* New Category Form */}
          <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Add New Category</h4>

            {error && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Category Name (e.g., Coding, Project)"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                />
              </div>

              {/* Color picker */}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5 bg-white"
                  title="Choose category color"
                />
                <span className="font-mono text-xs text-slate-600 uppercase">{color}</span>
              </div>
            </div>

            {/* Quick color preset dots */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-500 font-medium mr-1">Presets:</span>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-4 h-4 rounded-full transition-transform ${
                    color.toLowerCase() === c.toLowerCase() ? 'scale-125 ring-2 ring-slate-400' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <div>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </button>
          </form>

          {/* Existing Categories List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Existing Categories ({categories.length})
            </h4>
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
              {categories.map((cat) => (
                <div key={cat.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">{cat.name}</div>
                      {cat.description && (
                        <div className="text-xs text-slate-500 truncate">{cat.description}</div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteCategory(cat.id)}
                    title="Delete Category"
                    className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
