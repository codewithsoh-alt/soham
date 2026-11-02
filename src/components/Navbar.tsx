import React from 'react';
import { ActiveTab, AuthUser } from '../types';
import { Calendar, Plus, Tags, RotateCcw, LogOut, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewActivity: () => void;
  onOpenCategories: () => void;
  onResetData: () => void;
  overdueCount: number;
  user: AuthUser | null;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewActivity,
  onOpenCategories,
  onResetData,
  overdueCount,
  user,
  onSignOut,
}) => {
  const avatarLetter = (user?.email || 'U').charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white shadow-xs">
              <Calendar className="w-5 h-5" />
            </span>
            <div className="leading-tight">
              <span className="font-bold text-lg text-slate-900 tracking-tight block">
                Daily Activity Tracker
              </span>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                Student Planner
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                activeTab === 'activities'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Activities
              {overdueCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-600">
                  {overdueCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'calendar'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'statistics'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Statistics
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCategories}
              title="Manage Categories"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <Tags className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Categories</span>
            </button>

            <button
              onClick={onResetData}
              title="Reset Account Planner Data"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenNewActivity}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Activity</span>
            </button>

            {/* User Profile Pill & Sign Out */}
            {user && (
              <div className="flex items-center gap-1.5 pl-2 ml-1 border-l border-slate-200">
                <div
                  className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 max-w-[160px] sm:max-w-[200px]"
                  title={`Logged in as ${user.email}`}
                >
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {avatarLetter}
                  </span>
                  <span className="text-xs font-medium text-slate-700 truncate hidden sm:inline">
                    {user.email}
                  </span>
                </div>

                <button
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden border-t border-slate-100 py-2 space-x-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'activities' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Activities {overdueCount > 0 && `(${overdueCount})`}
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'calendar' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'statistics' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Statistics
          </button>
        </div>
      </div>
    </header>
  );
};
