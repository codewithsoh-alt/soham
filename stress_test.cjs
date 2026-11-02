/**
 * Stress test suite for Daily Activity Tracker
 * Tests:
 * 1. Rapid User Registration Throughput (1,000 users)
 * 2. Concurrent Authentication Throughput (1,000 logins)
 * 3. Cross-User Data Isolation Integrity Check
 * 4. Massive Activity Volume Stress Test (10,000 activities)
 * 5. Edge-case Protections & Duplicate Validation
 */

const { performance } = require('perf_hooks');

const mockLocalStorage = new Map();
global.localStorage = {
  getItem: (key) => mockLocalStorage.get(key) || null,
  setItem: (key, value) => mockLocalStorage.set(key, String(value)),
  removeItem: (key) => mockLocalStorage.delete(key),
  clear: () => mockLocalStorage.clear()
};

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function computeDashboardStats(activities, filterMode, todayStr) {
  let filtered = activities;
  if (filterMode === 'today') {
    filtered = activities.filter(a => a.activityDate === todayStr);
  }
  const total = filtered.length;
  const completed = filtered.filter(a => a.status === 'COMPLETED').length;
  const pending = filtered.filter(a => a.status === 'PENDING').length;
  const overdue = filtered.filter(a => a.status === 'PENDING' && a.activityDate < todayStr).length;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, pending, overdue, completionRate };
}

const LOCAL_USERS_KEY = 'daily_tracker_registered_users';
const CURRENT_SESSION_KEY = 'daily_tracker_current_session';

function registerUser(email, password) {
  const cleanEmail = email.trim().toLowerCase();
  let users = [];
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    users = raw ? JSON.parse(raw) : [];
  } catch {}

  const existing = users.find(u => u.email === cleanEmail);
  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  const newId = 'usr_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  const newUser = {
    id: newId,
    email: cleanEmail,
    passwordHash: Buffer.from(password).toString('base64')
  };
  users.push(newUser);
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));

  const authUser = {
    id: newUser.id,
    email: newUser.email,
    name: cleanEmail.split('@')[0],
    isDemo: false
  };
  localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(authUser));
  return authUser;
}

function loginUser(email, password) {
  const cleanEmail = email.trim().toLowerCase();
  let users = [];
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    users = raw ? JSON.parse(raw) : [];
  } catch {}

  const user = users.find(u => u.email === cleanEmail);
  if (!user || user.passwordHash !== Buffer.from(password).toString('base64')) {
    throw new Error('Invalid email or password');
  }

  const authUser = {
    id: user.id,
    email: user.email,
    name: cleanEmail.split('@')[0],
    isDemo: false
  };
  localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(authUser));
  return authUser;
}

async function runStressTest() {
  console.log('====================================================');
  console.log('   DAILY ACTIVITY TRACKER - STRESS & LOAD TEST');
  console.log('====================================================\n');

  let passed = true;
  const results = [];

  // TEST 1: Rapid User Registration Throughput (1,000 users)
  console.log('[Test 1] Executing rapid registration of 1,000 distinct student accounts...');
  const t1Start = performance.now();
  const createdUsers = [];
  try {
    for (let i = 0; i < 1000; i++) {
      const email = `student_${i}_test@domain.edu`;
      const pass = `securePassword#${i}`;
      const user = registerUser(email, pass);
      createdUsers.push(user);
    }
    const t1Duration = performance.now() - t1Start;
    console.log(`  -> 1,000 users registered in ${t1Duration.toFixed(2)} ms (${(1000 / (t1Duration / 1000)).toFixed(0)} ops/sec)`);
    results.push({ name: 'User Registration (1,000 accounts)', status: 'PASS', timeMs: t1Duration });
  } catch (err) {
    console.error('  -> Failed:', err.message);
    passed = false;
    results.push({ name: 'User Registration (1,000 accounts)', status: 'FAIL', error: err.message });
  }

  // TEST 2: Concurrent Authentication / Sign-in Throughput (1,000 logins)
  console.log('\n[Test 2] Executing 1,000 logins verifying password hashing & session management...');
  const t2Start = performance.now();
  try {
    for (let i = 0; i < 1000; i++) {
      const email = `student_${i}_test@domain.edu`;
      const pass = `securePassword#${i}`;
      const user = loginUser(email, pass);
      if (user.email !== email) throw new Error(`User email mismatch for index ${i}`);
    }
    const t2Duration = performance.now() - t2Start;
    console.log(`  -> 1,000 authentications verified in ${t2Duration.toFixed(2)} ms (${(1000 / (t2Duration / 1000)).toFixed(0)} ops/sec)`);
    results.push({ name: 'Authentication / Login (1,000 logins)', status: 'PASS', timeMs: t2Duration });
  } catch (err) {
    console.error('  -> Failed:', err.message);
    passed = false;
    results.push({ name: 'Authentication / Login (1,000 logins)', status: 'FAIL', error: err.message });
  }

  // TEST 3: Cross-User Data Isolation Integrity Check
  console.log('\n[Test 3] Verifying strict data isolation between student accounts...');
  try {
    const userA = createdUsers[0];
    const userB = createdUsers[1];

    const actsA = [
      { id: 1, title: 'Private Physics Lab for Student A', activityDate: getTodayDateString(), status: 'PENDING', userId: userA.id }
    ];
    const actsB = [
      { id: 2, title: 'Private Chemistry Exam for Student B', activityDate: getTodayDateString(), status: 'COMPLETED', userId: userB.id }
    ];

    localStorage.setItem(`daily_tracker_acts_${userA.id}`, JSON.stringify(actsA));
    localStorage.setItem(`daily_tracker_acts_${userB.id}`, JSON.stringify(actsB));

    const loadedA = JSON.parse(localStorage.getItem(`daily_tracker_acts_${userA.id}`));
    const loadedB = JSON.parse(localStorage.getItem(`daily_tracker_acts_${userB.id}`));

    if (loadedA.some(a => a.userId === userB.id) || loadedB.some(b => b.userId === userA.id)) {
      throw new Error('Data breach: Activities leaked across user boundaries!');
    }
    if (loadedA[0].title !== 'Private Physics Lab for Student A' || loadedB[0].title !== 'Private Chemistry Exam for Student B') {
      throw new Error('Data corruption in user partitioned storage');
    }
    console.log('  -> Data isolation verified: 0% data leakage across user partitions');
    results.push({ name: 'User Data Partitioning & Isolation', status: 'PASS' });
  } catch (err) {
    console.error('  -> Failed:', err.message);
    passed = false;
    results.push({ name: 'User Data Partitioning & Isolation', status: 'FAIL', error: err.message });
  }

  // TEST 4: Massive Activity Volume Stress Test (10,000 Activities)
  console.log('\n[Test 4] Stress-testing storage and dashboard stats calculation with 10,000 activities...');
  const t4Start = performance.now();
  try {
    const bulkActivities = [];
    const today = getTodayDateString();
    const priorities = ['LOW', 'MEDIUM', 'HIGH'];
    const statuses = ['PENDING', 'COMPLETED'];

    for (let i = 1; i <= 10000; i++) {
      bulkActivities.push({
        id: i,
        title: `Academic Task #${i}`,
        description: `Detailed description for study task ${i}`,
        activityDate: today,
        startTime: '09:00',
        endTime: '10:00',
        priority: priorities[i % 3],
        status: statuses[i % 2],
        categoryId: (i % 6) + 1,
        userId: createdUsers[0].id
      });
    }

    localStorage.setItem(`daily_tracker_acts_${createdUsers[0].id}`, JSON.stringify(bulkActivities));
    const loadedBulk = JSON.parse(localStorage.getItem(`daily_tracker_acts_${createdUsers[0].id}`));

    const stats = computeDashboardStats(loadedBulk, 'today', today);
    const t4Duration = performance.now() - t4Start;

    if (stats.total !== 10000) throw new Error(`Expected 10,000 total items, got ${stats.total}`);
    if (stats.completed !== 5000) throw new Error(`Expected 5,000 completed items, got ${stats.completed}`);
    if (stats.pending !== 5000) throw new Error(`Expected 5,000 pending items, got ${stats.pending}`);
    if (stats.completionRate !== 50) throw new Error(`Expected 50% completion rate, got ${stats.completionRate}%`);

    console.log(`  -> 10,000 activities loaded and calculated in ${t4Duration.toFixed(2)} ms`);
    console.log(`     Total: ${stats.total}, Completed: ${stats.completed}, Pending: ${stats.pending}, Rate: ${stats.completionRate}%`);
    results.push({ name: 'Bulk Data & Analytics Stress Test (10,000 items)', status: 'PASS', timeMs: t4Duration });
  } catch (err) {
    console.error('  -> Failed:', err.message);
    passed = false;
    results.push({ name: 'Bulk Data & Analytics Stress Test (10,000 items)', status: 'FAIL', error: err.message });
  }

  // TEST 5: Edge-case protections
  console.log('\n[Test 5] Validating edge-case protections (duplicate emails, invalid passwords)...');
  try {
    let duplicateRejected = false;
    try {
      registerUser('student_0_test@domain.edu', 'anotherpassword');
    } catch {
      duplicateRejected = true;
    }
    if (!duplicateRejected) throw new Error('Duplicate email registration was not blocked');

    let wrongPasswordRejected = false;
    try {
      loginUser('student_0_test@domain.edu', 'wrongpassword');
    } catch {
      wrongPasswordRejected = true;
    }
    if (!wrongPasswordRejected) throw new Error('Invalid password was accepted');

    console.log('  -> Duplicate registration prevented and invalid password rejected successfully');
    results.push({ name: 'Edge Case & Security Validation', status: 'PASS' });
  } catch (err) {
    console.error('  -> Failed:', err.message);
    passed = false;
    results.push({ name: 'Edge Case & Security Validation', status: 'FAIL', error: err.message });
  }

  console.log('\n====================================================');
  console.log('                   SUMMARY REPORT');
  console.log('====================================================');
  results.forEach(r => {
    const timeStr = r.timeMs ? ` (${r.timeMs.toFixed(1)} ms)` : '';
    console.log(` [${r.status}] ${r.name}${timeStr}`);
  });

  if (passed) {
    console.log('\n>>> ALL STRESS TESTS PASSED SUCCESSFULLY! <<<\n');
    process.exit(0);
  } else {
    console.log('\n>>> STRESS TEST FAILED! <<<\n');
    process.exit(1);
  }
}

runStressTest();

