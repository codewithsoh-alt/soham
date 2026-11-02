export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type Status = 'PENDING' | 'COMPLETED';

export interface Category {
  id: number;
  userId?: string;
  name: string;
  color: string;
  description?: string;
  createdAt?: string;
}

export interface Activity {
  id: number;
  userId?: string;
  title: string;
  description?: string;
  activityDate: string; // YYYY-MM-DD
  startTime?: string | null; // HH:mm
  endTime?: string | null; // HH:mm
  priority: Priority;
  status: Status;
  categoryId: number | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  overdue?: boolean;
}

export interface DashboardStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number; // 0 to 100
  overdueCount: number;
}

export type StatsScope = 'today' | 'week' | 'overall';

export type ActiveTab = 'dashboard' | 'activities' | 'calendar' | 'statistics';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'danger' | 'info' | 'warning';
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  isDemo?: boolean;
}
