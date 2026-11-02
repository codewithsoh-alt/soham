import React, { useState } from 'react';
import { Activity, Category } from '../types';
import { ChevronLeft, ChevronRight, Plus, Clock, Edit2, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarViewProps {
  activities: Activity[];
  categories: Category[];
  todayDateStr: string;
  onEditActivity: (activity: Activity) => void;
  onOpenNewActivity: (date?: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  activities,
  categories,
  todayDateStr,
  onEditActivity,
  onOpenNewActivity,
}) => {
  const initialDate = new Date(todayDateStr + 'T00:00:00');
  const [displayedYear, setDisplayedYear] = useState<number>(initialDate.getFullYear());
  const [displayedMonth, setDisplayedMonth] = useState<number>(initialDate.getMonth()); // 0-indexed
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayDateStr);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (displayedMonth === 0) {
      setDisplayedMonth(11);
      setDisplayedYear((y) => y - 1);
    } else {
      setDisplayedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (displayedMonth === 11) {
      setDisplayedMonth(0);
      setDisplayedYear((y) => y + 1);
    } else {
      setDisplayedMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    const today = new Date(todayDateStr + 'T00:00:00');
    setDisplayedYear(today.getFullYear());
    setDisplayedMonth(today.getMonth());
    setSelectedDateStr(todayDateStr);
  };

  // Calendar cells computation
  const firstDayOfWeek = new Date(displayedYear, displayedMonth, 1).getDay(); // 0 is Sunday
  const daysInCurrentMonth = new Date(displayedYear, displayedMonth + 1, 0).getDate();
  const prevMonthLastDay = new Date(displayedYear, displayedMonth, 0).getDate();

  // Trailing previous month days
  const prevMonthDays: number[] = [];
  for (let i = firstDayOfWeek; i > 0; i--) {
    prevMonthDays.push(prevMonthLastDay - i + 1);
  }

  // Current month days
  const currentMonthDays: number[] = [];
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    currentMonthDays.push(i);
  }

  const getCategory = (catId: number | null): Category | undefined => {
    return categories.find((c) => c.id === catId);
  };

  const formatDayDateString = (day: number): string => {
    const m = String(displayedMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${displayedYear}-${m}-${d}`;
  };

  // Activities for selected day
  const selectedDayActivities = activities
    .filter((a) => a.activityDate === selectedDateStr)
    .sort((a, b) => (a.startTime || '99:99').localeCompare(b.startTime || '99:99'));

  // Formatted date string for selected day panel
  const selectedDayObj = new Date(selectedDateStr + 'T00:00:00');
  const formattedSelectedDay = selectedDayObj.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

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
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Calendar View</h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Browse and inspect scheduled tasks by day.
          </p>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-base text-slate-900 min-w-36 text-center">
            {monthNames[displayedMonth]} {displayedYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors ml-1"
          >
            Today
          </button>
        </div>
      </div>

      {/* Grid + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Calendar Grid (8 cols) */}
        <div className="lg:col-span-8 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider py-1 border-b border-slate-100">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Trailing days of previous month */}
            {prevMonthDays.map((day, idx) => (
              <div
                key={`prev-${idx}`}
                className="aspect-square p-2 rounded-lg border border-slate-100 bg-slate-50/70 text-slate-400 opacity-60 flex flex-col justify-between"
              >
                <span className="text-xs font-medium">{day}</span>
              </div>
            ))}

            {/* Current month days */}
            {currentMonthDays.map((day) => {
              const dateStr = formatDayDateString(day);
              const dayTasks = activities.filter((a) => a.activityDate === dateStr);
              const isSelected = selectedDateStr === dateStr;
              const isToday = todayDateStr === dateStr;

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`aspect-square p-2 rounded-lg border cursor-pointer flex flex-col justify-between transition-all duration-150 ${
                    isSelected
                      ? 'border-2 border-blue-600 bg-blue-50/70 shadow-xs'
                      : isToday
                      ? 'border-blue-300 bg-blue-50/20 hover:border-slate-300'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isSelected
                          ? 'text-blue-700 font-extrabold'
                          : isToday
                          ? 'text-blue-600'
                          : 'text-slate-800'
                      }`}
                    >
                      {day}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task category dots */}
                  <div className="flex items-center gap-1 flex-wrap mt-1">
                    {dayTasks.slice(0, 4).map((task) => {
                      const cat = getCategory(task.categoryId);
                      const color = cat?.color || '#3b82f6';
                      return (
                        <span
                          key={task.id}
                          title={task.title}
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                      );
                    })}
                    {dayTasks.length > 4 && (
                      <span className="text-[9px] text-slate-400 font-bold leading-none">+</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Day Task Details (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
            <div>
              <h2 className="font-bold text-slate-900 text-base">{selectedDateStr}</h2>
              <p className="text-xs text-slate-500 font-medium">{formattedSelectedDay}</p>
            </div>
            <button
              onClick={() => onOpenNewActivity(selectedDateStr)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto max-h-[500px]">
            {selectedDayActivities.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-xs mb-3">No activities for this day.</p>
                <button
                  onClick={() => onOpenNewActivity(selectedDateStr)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  + Add Activity
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {selectedDayActivities.map((task) => {
                  const isCompleted = task.status === 'COMPLETED';
                  const timeStr = formatTimeWindow(task.startTime, task.endTime);
                  const cat = getCategory(task.categoryId);

                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-lg border text-sm transition-all flex items-start justify-between gap-2 ${
                        isCompleted ? 'bg-slate-50 border-slate-200 opacity-75' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`font-semibold text-xs ${
                              isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                              task.priority === 'HIGH'
                                ? 'bg-red-100 text-red-700'
                                : task.priority === 'MEDIUM'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                          {timeStr && (
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {timeStr}
                            </span>
                          )}
                          {cat && (
                            <span
                              className="px-1.5 py-0.2 text-[10px] rounded-full text-white font-medium"
                              style={{ backgroundColor: cat.color }}
                            >
                              {cat.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onEditActivity(task)}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors shrink-0"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
