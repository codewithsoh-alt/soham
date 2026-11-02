import { Activity, Category, DashboardStats } from '../types';
import { INITIAL_CATEGORIES, getSingleWelcomeActivity, getDemoActivities } from '../data/seedData';

const getKey = (prefix: string, userId: string) => `${prefix}_${userId}`;

export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isActivityOverdue = (activity: Activity, todayStr = getTodayDateString()): boolean => {
  return activity.status === 'PENDING' && activity.activityDate < todayStr;
};

export const loadCategoriesForUser = (userId: string): Category[] => {
  try {
    const key = getKey('daily_tracker_cats', userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      const seeded = INITIAL_CATEGORIES.map((c) => ({ ...c, userId }));
      localStorage.setItem(key, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load categories for user', e);
    return INITIAL_CATEGORIES.map((c) => ({ ...c, userId }));
  }
};

export const saveCategoriesForUser = (userId: string, categories: Category[]): void => {
  try {
    const key = getKey('daily_tracker_cats', userId);
    localStorage.setItem(key, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save categories for user', e);
  }
};

export const loadActivitiesForUser = (userId: string, isDemo = false): Activity[] => {
  try {
    const key = getKey('daily_tracker_acts', userId);
    const raw = localStorage.getItem(key);
    const todayStr = getTodayDateString();
    let activities: Activity[];

    if (!raw) {
      if (isDemo || userId === 'demo_student_01') {
        activities = getDemoActivities(userId);
      } else {
        // Newly registered user gets ONLY 1 single welcome activity!
        activities = getSingleWelcomeActivity(userId);
      }
      localStorage.setItem(key, JSON.stringify(activities));
    } else {
      activities = JSON.parse(raw);
    }

    return activities.map((a) => ({
      ...a,
      overdue: isActivityOverdue(a, todayStr),
    }));
  } catch (e) {
    console.error('Failed to load activities for user', e);
    return getSingleWelcomeActivity(userId);
  }
};

export const saveActivitiesForUser = (userId: string, activities: Activity[]): void => {
  try {
    const key = getKey('daily_tracker_acts', userId);
    localStorage.setItem(key, JSON.stringify(activities));
  } catch (e) {
    console.error('Failed to save activities for user', e);
  }
};

export const computeDashboardStats = (
  activities: Activity[],
  scope: 'today' | 'week' | 'overall',
  todayStr = getTodayDateString()
): DashboardStats => {
  const overdueCount = activities.filter((a) => isActivityOverdue(a, todayStr)).length;

  let scopedActivities: Activity[] = [];

  if (scope === 'today') {
    scopedActivities = activities.filter((a) => a.activityDate === todayStr);
  } else if (scope === 'week') {
    const now = new Date(todayStr + 'T00:00:00');
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

    const startOfWeek = format(monday);
    const endOfWeek = format(sunday);

    scopedActivities = activities.filter(
      (a) => a.activityDate >= startOfWeek && a.activityDate <= endOfWeek
    );
  } else {
    scopedActivities = activities;
  }

  const total = scopedActivities.length;
  const completed = scopedActivities.filter((a) => a.status === 'COMPLETED').length;
  const pending = scopedActivities.filter((a) => a.status === 'PENDING').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 1000) / 10 : 0;

  return {
    total,
    completed,
    pending,
    completionRate,
    overdueCount,
  };
};

export const resetUserData = (
  userId: string,
  isDemo = false
): { categories: Category[]; activities: Activity[] } => {
  const categories = INITIAL_CATEGORIES.map((c) => ({ ...c, userId }));
  const activities = isDemo ? getDemoActivities(userId) : getSingleWelcomeActivity(userId);
  saveCategoriesForUser(userId, categories);
  saveActivitiesForUser(userId, activities);
  return { categories, activities };
};
