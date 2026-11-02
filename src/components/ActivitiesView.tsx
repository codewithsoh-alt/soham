import React, { useState, useMemo } from 'react';
import { Activity, Category, Priority, Status } from '../types';
import { Search, Plus, Calendar, Clock, Edit2, Trash2, X, AlertCircle, FileText } from 'lucide-react';

interface ActivitiesViewProps {
  activities: Activity[];
  categories: Category[];
  todayDateStr: string;
  initialFilter?: string;
  onToggleStatus: (id: number, currentStatus: string) => void;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (id: number) => void;
  onOpenNewActivity: (date?: string) => void;
}

export const ActivitiesView: React.FC<ActivitiesViewProps> = ({
  activities,
  categories,
  todayDateStr,
  initialFilter,
  onToggleStatus,
  onEditActivity,
  onDeleteActivity,
  onOpenNewActivity,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(
    initialFilter === 'overdue' ? 'OVERDUE' : ''
  );
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  const getCategory = (catId: number | null): Category | undefined => {
    return categories.find((c) => c.id === catId);
  };

  const formatTimeWindow = (start?: string | null, end?: string | null) => {
    if (!start && !end) return '';
    const s = start ? start.slice(0, 5) : '';
    const e = end ? end.slice(0, 5) : '';
    if (s && !e) return s;
    if (!s && e) return e;
    return `${s} - ${e}`;
  };

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      // Search
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const titleMatch = activity.title.toLowerCase().includes(query);
        const descMatch = (activity.description || '').toLowerCase().includes(query);
        const notesMatch = (activity.notes || '').toLowerCase().includes(query);
        if (!titleMatch && !descMatch && !notesMatch) return false;
      }

      // Status
      if (statusFilter === 'OVERDUE') {
        if (!activity.overdue) return false;
      } else if (statusFilter) {
        if (activity.status !== statusFilter) return false;
      }

      // Priority
      if (priorityFilter && activity.priority !== priorityFilter) {
        return false;
      }

      // Category
      if (categoryFilter) {
        if (categoryFilter === 'none') {
          if (activity.categoryId !== null) return false;
        } else {
          if (activity.categoryId !== Number(categoryFilter)) return false;
        }
      }

      // Date
      if (dateFilter && activity.activityDate !== dateFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort by date descending, then start time ascending
      if (a.activityDate !== b.activityDate) {
        return b.activityDate.localeCompare(a.activityDate);
      }
      return (a.startTime || '99:99').localeCompare(b.startTime || '99:99');
    });
  }, [activities, searchTerm, statusFilter, priorityFilter, categoryFilter, dateFilter]);

  const hasActiveFilters =
    searchTerm || statusFilter || priorityFilter || categoryFilter || dateFilter;

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
    setCategoryFilter('');
    setDateFilter('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Activities</h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Search, filter, edit, or create new activities.
          </p>
        </div>
        <div>
          <button
            onClick={() => onOpenNewActivity(dateFilter || undefined)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Activity</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or description..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Status Select */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="OVERDUE">Overdue Only</option>
            </select>
          </div>

          {/* Priority Select */}
          <div className="md:col-span-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
            >
              <option value="">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Category Select */}
          <div className="md:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <option value="none">Unassigned</option>
            </select>
          </div>

          {/* Date input */}
          <div className="md:col-span-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
            />
          </div>
        </div>

        {/* Clear filters pill */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <span className="text-slate-500">
              Showing {filteredActivities.length} of {activities.length} activities
            </span>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Activities List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-14">
              <p className="text-slate-500 text-sm mb-3">No matching activities found.</p>
              <button
                onClick={() => onOpenNewActivity(dateFilter || undefined)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create an Activity</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map((activity) => {
                const isCompleted = activity.status === 'COMPLETED';
                const timeString = formatTimeWindow(activity.startTime, activity.endTime);
                const category = getCategory(activity.categoryId);

                return (
                  <div
                    key={activity.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCompleted
                        ? 'bg-slate-50 border-slate-200 opacity-80'
                        : activity.overdue
                        ? 'bg-white border-l-4 border-l-red-500 border-slate-200 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Left: Checkbox & Info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => onToggleStatus(activity.id, activity.status)}
                        className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                      />
                      <div className="space-y-1 min-w-0 flex-1">
                        {/* Title & Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-semibold text-sm ${
                              isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {activity.title}
                          </span>

                          {/* Priority Badge */}
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              activity.priority === 'HIGH'
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : activity.priority === 'MEDIUM'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {activity.priority}
                          </span>

                          {/* Category Badge */}
                          {category && (
                            <span
                              className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full text-white shadow-2xs"
                              style={{ backgroundColor: category.color || '#3b82f6' }}
                            >
                              {category.name}
                            </span>
                          )}

                          {/* Overdue Badge */}
                          {activity.overdue && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white">
                              Overdue
                            </span>
                          )}
                        </div>

                        {/* Metadata row */}
                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1 font-mono text-[11px] text-slate-600">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {activity.activityDate}
                          </span>

                          {timeString && (
                            <span className="flex items-center gap-1 font-mono text-[11px] text-slate-600">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {timeString}
                            </span>
                          )}

                          {activity.description && (
                            <span className="text-slate-600 truncate max-w-lg">
                              {activity.description}
                            </span>
                          )}

                          {activity.notes && (
                            <span className="flex items-center gap-1 text-slate-500 italic max-w-sm truncate">
                              <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                              {activity.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => onEditActivity(activity)}
                        title="Edit Activity"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteActivity(activity.id)}
                        title="Delete Activity"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
