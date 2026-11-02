import React, { useState, useMemo } from 'react';
import { Activity, Category, StatsScope } from '../types';
import { computeDashboardStats } from '../storage/storage';

interface StatisticsViewProps {
  activities: Activity[];
  categories: Category[];
  todayDateStr: string;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  activities,
  categories,
  todayDateStr,
}) => {
  const [scope, setScope] = useState<StatsScope>('today');

  // Compute scoped activities
  const scopedActivities = useMemo(() => {
    if (scope === 'today') {
      return activities.filter((a) => a.activityDate === todayDateStr);
    }
    if (scope === 'week') {
      const now = new Date(todayDateStr + 'T00:00:00');
      const day = now.getDay();
      const diffToMonday = (day === 0 ? -6 : 1) - day;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMonday);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const format = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dt = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dt}`;
      };

      const start = format(monday);
      const end = format(sunday);
      return activities.filter((a) => a.activityDate >= start && a.activityDate <= end);
    }
    return activities;
  }, [activities, scope, todayDateStr]);

  const stats = useMemo(() => {
    return computeDashboardStats(activities, scope, todayDateStr);
  }, [activities, scope, todayDateStr]);

  // Category distribution
  const categoryBreakdown = useMemo(() => {
    const categoryCounts: Record<string, { count: number; color: string }> = {};

    scopedActivities.forEach((act) => {
      let name = 'Unassigned';
      let color = '#6c757d';

      if (act.categoryId) {
        const cat = categories.find((c) => c.id === act.categoryId);
        if (cat) {
          name = cat.name;
          color = cat.color || '#3b82f6';
        }
      }

      if (!categoryCounts[name]) {
        categoryCounts[name] = { count: 0, color };
      }
      categoryCounts[name].count += 1;
    });

    const total = scopedActivities.length;
    return Object.entries(categoryCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([name, data]) => ({
        name,
        count: data.count,
        color: data.color,
        percentage: total > 0 ? Math.round((data.count / total) * 100) : 0,
      }));
  }, [scopedActivities, categories]);

  // Priority distribution
  const priorityBreakdown = useMemo(() => {
    const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    scopedActivities.forEach((act) => {
      if (counts[act.priority] !== undefined) {
        counts[act.priority]++;
      }
    });

    const total = scopedActivities.length;
    const configs: Array<{ priority: 'HIGH' | 'MEDIUM' | 'LOW'; color: string; label: string }> = [
      { priority: 'HIGH', color: '#ef4444', label: 'HIGH' },
      { priority: 'MEDIUM', color: '#f59e0b', label: 'MEDIUM' },
      { priority: 'LOW', color: '#10b981', label: 'LOW' },
    ];

    return configs.map((cfg) => {
      const count = counts[cfg.priority];
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return {
        priority: cfg.priority,
        label: cfg.label,
        count,
        percentage,
        color: cfg.color,
      };
    });
  }, [scopedActivities]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Productivity & Analytics</h1>
        <p className="text-sm font-medium text-slate-500 mt-0.5">
          Overview of your activity performance and category distribution.
        </p>
      </div>

      {/* Stats Scope Selector */}
      <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
        <button
          onClick={() => setScope('today')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            scope === 'today'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setScope('week')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            scope === 'week'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setScope('overall')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            scope === 'overall'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Time
        </button>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Activities */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-blue-600 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Activities
          </div>
          <div className="text-3xl font-bold text-blue-600 mt-1">{stats.total}</div>
        </div>

        {/* Completed */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-emerald-600 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completed</div>
          <div className="text-3xl font-bold text-emerald-600 mt-1">{stats.completed}</div>
        </div>

        {/* Pending */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-amber-500 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending</div>
          <div className="text-3xl font-bold text-amber-500 mt-1">{stats.pending}</div>
        </div>

        {/* Success Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-cyan-500 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Success Rate
          </div>
          <div className="text-3xl font-bold text-cyan-600 mt-1">
            {Math.round(stats.completionRate)}%
          </div>
        </div>
      </div>

      {/* Distribution Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="font-bold text-slate-900 text-base mb-4">Activities by Category</h2>
          {categoryBreakdown.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No activity data available in this scope.
            </div>
          ) : (
            <div className="space-y-4">
              {categoryBreakdown.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-2 text-slate-800">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </span>
                    <span className="text-slate-500">
                      {cat.count} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Priority Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="font-bold text-slate-900 text-base mb-4">Priority Breakdown</h2>
          {scopedActivities.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">No data.</div>
          ) : (
            <div className="space-y-4">
              {priorityBreakdown.map((item) => (
                <div key={item.priority} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{item.label}</span>
                    <span className="text-slate-500">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
