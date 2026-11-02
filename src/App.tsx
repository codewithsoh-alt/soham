import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ActiveTab, Activity, Category, DashboardStats, ToastMessage } from './types';
import {
  loadActivitiesForUser,
  saveActivitiesForUser,
  loadCategoriesForUser,
  saveCategoriesForUser,
  computeDashboardStats,
  getTodayDateString,
  resetUserData,
  isActivityOverdue,
} from './storage/storage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthView } from './components/AuthView';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ActivitiesView } from './components/ActivitiesView';
import { CalendarView } from './components/CalendarView';
import { StatisticsView } from './components/StatisticsView';
import { ActivityModal } from './components/ActivityModal';
import { CategoryModal } from './components/CategoryModal';
import { ToastContainer } from './components/Toast';

function AuthenticatedApp() {
  const { user, signOut, loading: authLoading } = useAuth();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [todayDateStr, setTodayDateStr] = useState<string>(getTodayDateString());

  // Modal states
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Filters navigation
  const [activitiesFilter, setActivitiesFilter] = useState<string | undefined>();

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (message: string, type: 'success' | 'danger' | 'info' | 'warning' = 'info') => {
      const id = Date.now().toString() + Math.random().toString().slice(2, 6);
      setToasts((prev) => [...prev, { id, message, type }]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Whenever user changes, load their private partitioned data
  useEffect(() => {
    if (user) {
      const loadedCats = loadCategoriesForUser(user.id);
      const loadedActs = loadActivitiesForUser(user.id, user.isDemo);
      setCategories(loadedCats);
      setActivities(loadedActs);
      setTodayDateStr(getTodayDateString());
    } else {
      setActivities([]);
      setCategories([]);
    }
  }, [user]);

  // Calculate today stats strictly for current user
  const todayStats: DashboardStats = useMemo(() => {
    return computeDashboardStats(activities, 'today', todayDateStr);
  }, [activities, todayDateStr]);

  const overdueCount = useMemo(() => {
    return activities.filter((a) => isActivityOverdue(a, todayDateStr)).length;
  }, [activities, todayDateStr]);

  // Toggle status (PENDING <-> COMPLETED)
  const handleToggleStatus = (id: number, currentStatus: string) => {
    if (!user) return;
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    const updated = activities.map((act) => {
      if (act.id === id) {
        const nextAct = {
          ...act,
          status: newStatus as Activity['status'],
          updatedAt: new Date().toISOString(),
        };
        nextAct.overdue = isActivityOverdue(nextAct, todayDateStr);
        return nextAct;
      }
      return act;
    });

    setActivities(updated);
    saveActivitiesForUser(user.id, updated);
    showToast(
      newStatus === 'COMPLETED' ? 'Activity marked as completed' : 'Activity marked as pending',
      'success'
    );
  };

  // Open Create Modal
  const handleOpenNewActivity = (date?: string) => {
    setActivityToEdit(null);
    setModalDefaultDate(date || todayDateStr);
    setIsActivityModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditActivity = (activity: Activity) => {
    setActivityToEdit(activity);
    setModalDefaultDate(activity.activityDate);
    setIsActivityModalOpen(true);
  };

  // Save Activity (Create or Update)
  const handleSaveActivity = (
    data: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>,
    editId?: number
  ) => {
    if (!user) return;
    const now = new Date().toISOString();

    if (editId) {
      // Update
      const updated = activities.map((act) => {
        if (act.id === editId) {
          const nextAct = {
            ...act,
            ...data,
            userId: user.id,
            updatedAt: now,
          };
          nextAct.overdue = isActivityOverdue(nextAct, todayDateStr);
          return nextAct;
        }
        return act;
      });

      setActivities(updated);
      saveActivitiesForUser(user.id, updated);
      showToast('Activity updated successfully', 'success');
    } else {
      // Create
      const newId = activities.length > 0 ? Math.max(...activities.map((a) => a.id)) + 1 : 1;
      const newAct: Activity = {
        id: newId,
        userId: user.id,
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      newAct.overdue = isActivityOverdue(newAct, todayDateStr);

      const updated = [newAct, ...activities];
      setActivities(updated);
      saveActivitiesForUser(user.id, updated);
      showToast('Activity created successfully', 'success');
    }

    setIsActivityModalOpen(false);
    setActivityToEdit(null);
  };

  // Delete Activity
  const handleDeleteActivity = (id: number) => {
    if (!user) return;
    const act = activities.find((a) => a.id === id);
    const title = act ? `"${act.title}"` : 'this activity';
    if (!window.confirm(`Are you sure you want to delete ${title}?`)) {
      return;
    }

    const updated = activities.filter((a) => a.id !== id);
    setActivities(updated);
    saveActivitiesForUser(user.id, updated);
    showToast('Activity deleted', 'info');
  };

  // Category Management
  const handleAddCategory = (newCatData: Omit<Category, 'id' | 'createdAt'>) => {
    if (!user) return;
    const newId = categories.length > 0 ? Math.max(...categories.map((c) => c.id)) + 1 : 1;
    const newCat: Category = {
      id: newId,
      userId: user.id,
      ...newCatData,
      createdAt: new Date().toISOString(),
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    saveCategoriesForUser(user.id, updated);
    showToast(`Category "${newCat.name}" added`, 'success');
  };

  const handleDeleteCategory = (catId: number) => {
    if (!user) return;
    const cat = categories.find((c) => c.id === catId);
    if (!window.confirm(`Are you sure you want to delete category "${cat?.name}"?`)) {
      return;
    }

    // Unassign category from user's activities
    const updatedActs = activities.map((a) =>
      a.categoryId === catId ? { ...a, categoryId: null } : a
    );
    setActivities(updatedActs);
    saveActivitiesForUser(user.id, updatedActs);

    const updatedCats = categories.filter((c) => c.id !== catId);
    setCategories(updatedCats);
    saveCategoriesForUser(user.id, updatedCats);
    showToast('Category deleted', 'info');
  };

  // Reset current user's data
  const handleResetData = () => {
    if (!user) return;
    if (window.confirm('Reset this account\'s activities and categories to standard starter data?')) {
      const { categories: resetCats, activities: resetActs } = resetUserData(user.id, user.isDemo);
      setCategories(resetCats);
      setActivities(resetActs);
      showToast('Account data reset to starter template', 'info');
    }
  };

  const handleNavigateToActivities = (filter?: string) => {
    setActivitiesFilter(filter);
    setActiveTab('activities');
  };

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await signOut();
      showToast('Signed out successfully', 'info');
    }
  };

  // Loading spinner during auth hydration
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Loading student session...</span>
        </div>
      </div>
    );
  }

  // If not signed in, show dedicated AuthView
  if (!user) {
    return (
      <>
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        <AuthView onSuccessToast={(msg) => showToast(msg, 'success')} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Main Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setActivitiesFilter(undefined);
        }}
        onOpenNewActivity={() => handleOpenNewActivity()}
        onOpenCategories={() => setIsCategoryModalOpen(true)}
        onResetData={handleResetData}
        overdueCount={overdueCount}
        user={user}
        onSignOut={handleSignOut}
      />

      {/* Main Views Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            activities={activities}
            categories={categories}
            stats={todayStats}
            todayDateStr={todayDateStr}
            onToggleStatus={handleToggleStatus}
            onEditActivity={handleOpenEditActivity}
            onOpenNewActivity={() => handleOpenNewActivity()}
            onNavigateToActivities={handleNavigateToActivities}
          />
        )}

        {activeTab === 'activities' && (
          <ActivitiesView
            activities={activities}
            categories={categories}
            todayDateStr={todayDateStr}
            initialFilter={activitiesFilter}
            onToggleStatus={handleToggleStatus}
            onEditActivity={handleOpenEditActivity}
            onDeleteActivity={handleDeleteActivity}
            onOpenNewActivity={handleOpenNewActivity}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            activities={activities}
            categories={categories}
            todayDateStr={todayDateStr}
            onEditActivity={handleOpenEditActivity}
            onOpenNewActivity={handleOpenNewActivity}
          />
        )}

        {activeTab === 'statistics' && (
          <StatisticsView
            activities={activities}
            categories={categories}
            todayDateStr={todayDateStr}
          />
        )}
      </main>

      {/* Activity Add/Edit Modal */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => {
          setIsActivityModalOpen(false);
          setActivityToEdit(null);
        }}
        onSave={handleSaveActivity}
        activityToEdit={activityToEdit}
        categories={categories}
        defaultDate={modalDefaultDate}
      />

      {/* Category Management Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 font-medium">
        <p>Daily Activity Tracker &bull; Student Academic Planner &bull; Secured with Supabase Auth</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}
