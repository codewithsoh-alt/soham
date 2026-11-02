import { Category, Activity } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Study',
    color: '#0d6efd',
    description: 'Academic studies, homework, revisions',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'College',
    color: '#6f42c1',
    description: 'Lectures, labs, submissions, college events',
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Exercise',
    color: '#198754',
    description: 'Gym, workouts, sports, running',
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'Personal',
    color: '#0dcaf0',
    description: 'Habits, chores, reading, errands',
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    name: 'Work',
    color: '#fd7e14',
    description: 'Part-time jobs, projects, internships',
    createdAt: new Date().toISOString(),
  },
  {
    id: 6,
    name: 'Other',
    color: '#6c757d',
    description: 'Miscellaneous tasks',
    createdAt: new Date().toISOString(),
  },
];

/**
 * Returns ONLY ONE single welcome activity for newly registered users
 */
export const getSingleWelcomeActivity = (userId: string): Activity[] => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  return [
    {
      id: 1,
      userId,
      title: 'Welcome to Daily Activity Tracker!',
      description: 'Click the checkbox to mark this complete, or click "+ Add Activity" to schedule your classes and study sessions.',
      activityDate: todayStr,
      startTime: '09:00',
      endTime: '10:00',
      priority: 'MEDIUM',
      status: 'PENDING',
      categoryId: 1, // Study
      notes: 'Organize your study routines and track assignments by category.',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      overdue: false,
    },
  ];
};

/**
 * Rich demo activities for the demo student preview account
 */
export const getDemoActivities = (userId = 'demo_student_01'): Activity[] => {
  const now = new Date();
  const format = (d: Date) => d.toISOString().split('T')[0];

  const todayStr = format(now);

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = format(yesterday);

  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(now.getDate() - 2);
  const twoDaysAgoStr = format(twoDaysAgo);

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowStr = format(tomorrow);

  return [
    {
      id: 1,
      userId,
      title: 'Coding',
      description: 'Practice data structures and spring boot controllers',
      activityDate: todayStr,
      startTime: '07:50',
      endTime: '10:00',
      priority: 'LOW',
      status: 'PENDING',
      categoryId: 2, // College
      notes: 'Review REST API implementation',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 2,
      userId,
      title: 'IP Assignment',
      description: 'Internet Programming course project submission',
      activityDate: todayStr,
      startTime: '12:00',
      endTime: '14:00',
      priority: 'HIGH',
      status: 'COMPLETED',
      categoryId: 2, // College
      notes: 'Java full stack complete code submission',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 3,
      userId,
      title: 'Assignment IIP',
      description: 'Algorithm complexity analysis chapter 4',
      activityDate: todayStr,
      startTime: '16:00',
      endTime: '18:00',
      priority: 'HIGH',
      status: 'PENDING',
      categoryId: 1, // Study
      notes: 'Reference textbook pages 120-145',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 4,
      userId,
      title: 'Evening Run & Gym',
      description: 'Cardio workout and stretching session',
      activityDate: todayStr,
      startTime: '18:30',
      endTime: '19:30',
      priority: 'LOW',
      status: 'PENDING',
      categoryId: 3, // Exercise
      notes: '5km track run + hydration',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 5,
      userId,
      title: 'IP Something',
      description: 'Research distributed caching mechanisms',
      activityDate: yesterdayStr,
      startTime: '14:00',
      endTime: '15:30',
      priority: 'MEDIUM',
      status: 'PENDING', // Overdue
      categoryId: null,
      notes: 'Check Redis vs Hazelcast benchmarks',
      createdAt: yesterday.toISOString(),
      updatedAt: yesterday.toISOString(),
    },
    {
      id: 6,
      userId,
      title: 'Submit Lab Experiment 3',
      description: 'Submit verified circuit simulation report',
      activityDate: twoDaysAgoStr,
      startTime: '10:00',
      endTime: '11:30',
      priority: 'HIGH',
      status: 'PENDING', // Overdue
      categoryId: 2, // College
      notes: 'Upload PDF to university portal',
      createdAt: twoDaysAgo.toISOString(),
      updatedAt: twoDaysAgo.toISOString(),
    },
    {
      id: 7,
      userId,
      title: 'Read System Design Paper',
      description: 'Google Bigtable and Spanner architectural foundations',
      activityDate: tomorrowStr,
      startTime: '10:00',
      endTime: '12:00',
      priority: 'MEDIUM',
      status: 'PENDING',
      categoryId: 1, // Study
      notes: 'Prepare notes for next Monday discussion',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ];
};
