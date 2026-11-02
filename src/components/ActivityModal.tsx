import React, { useState, useEffect } from 'react';
import { Activity, Category, Priority, Status } from '../types';
import { X, AlertCircle } from 'lucide-react';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>, editId?: number) => void;
  activityToEdit?: Activity | null;
  categories: Category[];
  defaultDate?: string;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  activityToEdit,
  categories,
  defaultDate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [categoryId, setCategoryId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activityToEdit) {
      setTitle(activityToEdit.title);
      setDescription(activityToEdit.description || '');
      setActivityDate(activityToEdit.activityDate);
      setStartTime(activityToEdit.startTime ? activityToEdit.startTime.slice(0, 5) : '');
      setEndTime(activityToEdit.endTime ? activityToEdit.endTime.slice(0, 5) : '');
      setPriority(activityToEdit.priority);
      setCategoryId(activityToEdit.categoryId ? String(activityToEdit.categoryId) : '');
      setNotes(activityToEdit.notes || '');
    } else {
      setTitle('');
      setDescription('');
      setActivityDate(defaultDate || new Date().toISOString().split('T')[0]);
      setStartTime('');
      setEndTime('');
      setPriority('MEDIUM');
      setCategoryId('');
      setNotes('');
    }
    setError(null);
  }, [activityToEdit, defaultDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!activityDate) {
      setError('Activity date is required');
      return;
    }

    // Time window constraint: start_time <= end_time
    if (startTime && endTime) {
      if (startTime > endTime) {
        setError(`Start time (${startTime}) must not be after end time (${endTime})`);
        return;
      }
    }

    onSave(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        activityDate,
        startTime: startTime || null,
        endTime: endTime || null,
        priority,
        status: activityToEdit ? activityToEdit.status : 'PENDING',
        categoryId: categoryId ? Number(categoryId) : null,
        notes: notes.trim() || undefined,
      },
      activityToEdit ? activityToEdit.id : undefined
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-900">
            {activityToEdit ? 'Edit Activity' : 'Add Activity'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              required
              maxLength={150}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Complete Chapter 3 Assignment"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details..."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
            />
          </div>

          {/* Date, Start Time, End Time row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 bg-white"
              />
            </div>
          </div>

          {/* Priority & Category row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
              >
                <option value="">None / Unassigned</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reference links or reminders..."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs transition-colors"
            >
              Save Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
