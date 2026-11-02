import React from 'react';
import { Activity, Category, DashboardStats } from '../types';
import { Plus, Clock, Edit2, AlertCircle, CheckCircle2, ListTodo, AlertTriangle, ArrowRight } from 'lucide-react';

interface DashboardViewProps {
  activities: Activity[];
  categories: Category[];
  stats: DashboardStats;
  todayDateStr: string;
  onToggleStatus: (id: number, currentStatus: string) => void;
  onEditActivity: (activity: Activity) => void;
  onOpenNewActivity: () => void;
  onNavigateToActivities: (filter?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activities,
  categories,
  stats,
  todayDateStr,
  onToggleStatus,
  onEditActivity,
  onOpenNewActivity,
  onNavigateToActivities,
}) => {
  // Format current date display: "Monday, October 26, 2026"
  const todayDateObj = new Date(todayDateStr + 'T00:00:00');
  const formattedToday = todayDateObj.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Filter activities scheduled for today, sorted by start time
  const todayActivities = activities
    .filter((a) => a.activityDate === todayDateStr)
    .sort((a, b) => (a.startTime || '99:99').localeCompare(b.startTime || '99:99'));

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Today's Overview</h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">{formattedToday}</p>
        </div>
        <div>
          <button
            onClick={onOpenNewActivity}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Activity</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Today */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-blue-600 shadow-xs hover:-translate-y-0.5 transition-all">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Today</div>
          <div className="text-3xl font-bold text-blue-600 mt-1">{stats.total}</div>
        </div>

        {/* Completed */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-emerald-600 shadow-xs hover:-translate-y-0.5 transition-all">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completed</div>
          <div className="text-3xl font-bold text-emerald-600 mt-1">{stats.completed}</div>
        </div>

        {/* Pending */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-amber-500 shadow-xs hover:-translate-y-0.5 transition-all">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending</div>
          <div className="text-3xl font-bold text-amber-500 mt-1">{stats.pending}</div>
        </div>

        {/* Overdue Tasks */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-red-500 shadow-xs hover:-translate-y-0.5 transition-all">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overdue Tasks</div>
          <div className="text-3xl font-bold text-red-500 mt-1">{stats.overdueCount}</div>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-800">Today's Completion Rate</span>
          <span className="text-sm font-bold text-blue-600">{Math.round(stats.completionRate)}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, stats.completionRate))}%` }}
          />
        </div>
      </div>

      {/* Overdue Alert Section */}
      {stats.overdueCount > 0 && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-800 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span className="text-sm">
              <strong className="font-semibold text-red-900">
                {stats.overdueCount} {stats.overdueCount === 1 ? 'task is' : 'tasks are'} overdue
              </strong>{' '}
              from previous days.
            </span>
          </div>
          <button
            onClick={() => onNavigateToActivities('overdue')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <span>Review Overdue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Today's Activities List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-blue-600" />
            Scheduled for Today
          </h2>
          <button
            onClick={() => onNavigateToActivities()}
            className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            View All
          </button>
        </div>

        <div className="p-5">
          {todayActivities.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-500 text-sm mb-3">No activities scheduled for today.</p>
              <button
                onClick={onOpenNewActivity}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add an Activity</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {todayActivities.map((activity) => {
                const isCompleted = activity.status === 'COMPLETED';
                const timeString = formatTimeWindow(activity.startTime, activity.endTime);
                const category = getCategory(activity.categoryId);

                return (
                  <div
                    key={activity.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isCompleted
                        ? 'bg-slate-50 border-slate-200 opacity-80'
                        : activity.overdue
                        ? 'bg-white border-l-4 border-l-red-500 border-slate-200'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Left: Checkbox & Activity details */}
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => onToggleStatus(activity.id, activity.status)}
                        className="mt-1 sm:mt-0 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                      />
                      <div className="min-w-0 flex-1">
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
                              className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-white shadow-2xs"
                              style={{ backgroundColor: category.color || '#3b82f6' }}
                            >
                              {category.name}
                            </span>
                          )}
                        </div>

                        {/* Subline info */}
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                          {timeString && (
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {timeString}
                            </span>
                          )}
                          {activity.description && (
                            <span className="truncate max-w-md">{activity.description}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditActivity(activity)}
                        title="Edit Activity"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
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
