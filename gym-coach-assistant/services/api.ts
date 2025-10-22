import type { Student, Exercise, Goal, MonthlyPerformance } from '../types';
import { ExerciseType } from '../types';
import db from './db';
import { GOOGLE_SHEETS_CONFIG } from './config';

// Import initial mock data as fallback
import mockApi from './mockData';

// Type for pending changes queue
interface PendingChange {
  type: 'athlete' | 'goal';
  athleteId?: number;
  athleteName?: string;
  goalId?: string;
  action?: 'add' | 'complete' | 'uncomplete' | 'delete';
  completionDate?: string | null;
  data?: any;
  goalData?: Goal;
}

class API {
  private initialized = false;
  private pendingChanges: PendingChange[] = [];

  // Initialize database
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      await db.init();

      // Load pending changes from localStorage
      this.loadPendingChanges();

      // Check if database is already populated
      const students = await db.getStudents();

      if (students.length === 0) {
        console.log('📥 First launch - trying to sync with Google Sheets...');

        // Try to sync from Google Sheets first
        if (navigator.onLine) {
          try {
            await this.syncFromGoogleSheets();
            console.log('✅ Initial data loaded from Google Sheets');
          } catch (error) {
            console.warn('⚠️ Could not load from Google Sheets, using mock data');
            await this.initWithMockData();
          }
        } else {
          console.log('📴 No internet - using mock data');
          await this.initWithMockData();
        }
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  // Initialize with mock data (fallback)
  private async initWithMockData(): Promise<void> {
    const [mockStudents, mockExercises] = await Promise.all([
      mockApi.getStudents(),
      mockApi.getExercises(),
    ]);

    // Load all goals for all students
    const allGoalsPromises = mockStudents.map(s => mockApi.getGoalsByStudentId(s.id));
    const allGoalsArrays = await Promise.all(allGoalsPromises);
    const allGoals = allGoalsArrays.flat();

    await Promise.all([
      db.saveStudents(mockStudents),
      db.saveExercises(mockExercises),
      db.saveGoals(allGoals),
    ]);

    console.log('✅ Database initialized with mock data');
  }

  // Students
  async getStudents(): Promise<Student[]> {
    await this.init();
    return db.getStudents();
  }

  async updateStudent(student: Student): Promise<void> {
    await this.init();

    // Save to IndexedDB
    await db.updateStudent(student);

    // Add to pending changes queue
    this.addPendingChange({
      type: 'athlete',
      athleteId: student.id,
      athleteName: `${student.lastName} ${student.firstName}`,
      data: this.transformStudentForSheets(student)
    });

    console.log('📝 Student update queued for sync:', student.id);
  }

  // Exercises
  async getExercises(): Promise<Exercise[]> {
    await this.init();
    return db.getExercises();
  }

  // Goals
  async getGoalsByStudentId(studentId: number): Promise<Goal[]> {
    await this.init();
    return db.getGoalsByStudentId(studentId);
  }

  async addGoal(goal: Goal): Promise<void> {
    await this.init();
    await db.addGoal(goal);

    // Add to pending changes queue
    this.addPendingChange({
      type: 'goal',
      goalId: goal.id,
      action: 'add',
      goalData: goal
    });

    console.log('🎯 New goal added and queued for sync:', goal.id);
  }

  async updateGoal(goalId: string, completionDate: string | null): Promise<void> {
    await this.init();

    const goals = await db.getGoals();
    const goal = goals.find(g => g.id === goalId);

    if (goal) {
      goal.completionDate = completionDate;
      await db.saveGoals(goals);

      // Add to pending changes
      this.addPendingChange({
        type: 'goal',
        goalId: goalId,
        action: completionDate ? 'complete' : 'uncomplete',
        completionDate: completionDate
      });

      console.log('🎯 Goal update queued:', goalId);
    }
  }

  async deleteGoal(goalId: string): Promise<void> {
    await this.init();

    const goals = await db.getGoals();
    const updatedGoals = goals.filter(g => g.id !== goalId);
    await db.saveGoals(updatedGoals);

    // Add to pending changes
    this.addPendingChange({
      type: 'goal',
      goalId: goalId,
      action: 'delete'
    });

    console.log('🗑️ Goal deletion queued:', goalId);
  }

  // Pending changes management
  private addPendingChange(change: PendingChange): void {
    this.pendingChanges.push(change);
    this.savePendingChanges();
  }

  getPendingChanges(): PendingChange[] {
    return this.pendingChanges;
  }

  getPendingChangesCount(): number {
    return this.pendingChanges.length;
  }

  private loadPendingChanges(): void {
    try {
      const stored = localStorage.getItem('pendingChanges');
      if (stored) {
        this.pendingChanges = JSON.parse(stored);
        console.log('📂 Loaded pending changes:', this.pendingChanges.length);
      }
    } catch (error) {
      console.error('Error loading pending changes:', error);
      this.pendingChanges = [];
    }
  }

  private savePendingChanges(): void {
    try {
      localStorage.setItem('pendingChanges', JSON.stringify(this.pendingChanges));
      console.log('💾 Saved pending changes:', this.pendingChanges.length);
    } catch (error) {
      console.error('Error saving pending changes:', error);
    }
  }

  // Sync status
  async getLastSync(): Promise<string | null> {
    await this.init();
    return db.getLastSync();
  }

  async setLastSync(timestamp: string): Promise<void> {
    await this.init();
    return db.setLastSync(timestamp);
  }

  // Transform Student to Google Sheets format
  private transformStudentForSheets(student: Student): any {
    return {
      id: student.id,
      group: student.group,
      schedule: '', // Not in current structure
      performance: student.performance.map(p => ({
        'Подтягивания': p[ExerciseType.PullUps] || 0,
        'Отжимания': p[ExerciseType.PushUps] || 0,
        'Брусья': p[ExerciseType.Dips] || 0
      }))
    };
  }

  // Transform Google Sheets data to Student format
  private transformStudentFromSheets(data: any): Student {
    const performance: MonthlyPerformance[] = GOOGLE_SHEETS_CONFIG.MONTHS.map((month, index) => {
      const record = data.monthlyRecords?.[index] || {};
      return {
        month,
        [ExerciseType.PullUps]: record['Подтягивания'] || 0,
        [ExerciseType.PushUps]: record['Отжимания'] || 0,
        [ExerciseType.Dips]: record['Брусья'] || 0,
      };
    });

    return {
      id: data.id,
      lastName: data.lastName,
      firstName: data.firstName,
      group: data.group,
      isActive: data.isActive === true || data.isActive === 'Да',
      performance,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
  }

  // Sync with Google Sheets
  async syncWithServer(): Promise<void> {
    await this.init();

    if (!navigator.onLine) {
      throw new Error('Нет подключения к интернету');
    }

    console.log('🔄 Starting sync with Google Sheets...');

    try {
      // Step 1: Send pending changes
      if (this.pendingChanges.length > 0) {
        console.log(`📤 Syncing ${this.pendingChanges.length} pending changes...`);
        await this.syncPendingChanges();
      }

      // Step 2: Load fresh data from Google Sheets
      await this.syncFromGoogleSheets();

      // Step 3: Update last sync timestamp
      await db.setLastSync(new Date().toISOString());

      console.log('✅ Sync completed successfully');
    } catch (error) {
      console.error('❌ Sync failed:', error);
      throw error;
    }
  }

  // Sync FROM Google Sheets (download)
  private async syncFromGoogleSheets(): Promise<void> {
    const url = GOOGLE_SHEETS_CONFIG.WEBAPP_URL;

    // Fetch students
    console.log('📥 Fetching students...');
    const studentsResponse = await fetch(`${url}?action=getAllStudents`);
    const studentsResult = await studentsResponse.json();

    if (!studentsResult.success) {
      throw new Error('Failed to fetch students');
    }

    const students = studentsResult.data.students.map((s: any) =>
      this.transformStudentFromSheets(s)
    );

    // Fetch exercises
    console.log('📥 Fetching exercises...');
    const exercisesResponse = await fetch(`${url}?action=getExercises`);
    const exercisesResult = await exercisesResponse.json();

    const exercises = exercisesResult.success ? exercisesResult.data.exercises : [];

    // Fetch goals
    console.log('📥 Fetching goals...');
    const goalsResponse = await fetch(`${url}?action=getGoals`);
    const goalsResult = await goalsResponse.json();

    const goals = goalsResult.success ? goalsResult.data.goals.map((g: any) => ({
      id: g.id || crypto.randomUUID(),
      studentId: g.studentId,
      studentFullName: g.studentName || '',
      exerciseId: g.exerciseId,
      exerciseName: g.exerciseName,
      setDate: g.dateSet,
      completionDate: g.dateCompleted || null,
      notes: g.notes || ''
    })) : [];

    // Save to IndexedDB
    await Promise.all([
      db.saveStudents(students),
      db.saveExercises(exercises),
      db.saveGoals(goals),
    ]);

    console.log(`✅ Synced: ${students.length} students, ${exercises.length} exercises, ${goals.length} goals`);
  }

  // Sync TO Google Sheets (upload pending changes)
  private async syncPendingChanges(): Promise<void> {
    const url = GOOGLE_SHEETS_CONFIG.WEBAPP_URL;
    const successfulChanges: PendingChange[] = [];

    for (const change of this.pendingChanges) {
      try {
        if (change.type === 'athlete') {
          console.log('📤 Updating student:', change.athleteName);

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
              action: 'updateStudent',
              params: { studentData: change.data }
            })
          });

          const result = await response.json();
          if (result.success) {
            successfulChanges.push(change);
          } else {
            console.error('Failed to update student:', result.error);
          }
        } else if (change.type === 'goal') {
          if (change.action === 'add' && change.goalData) {
            console.log('📤 Adding new goal:', change.goalId);

            const response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain' },
              body: JSON.stringify({
                action: 'addGoal',
                params: {
                  goalData: {
                    id: change.goalData.id,
                    studentId: change.goalData.studentId,
                    exerciseId: change.goalData.exerciseId,
                    dateSet: change.goalData.setDate,
                    dateCompleted: change.goalData.completionDate,
                    notes: change.goalData.notes || ''
                  }
                }
              })
            });

            const result = await response.json();
            if (result.success) {
              successfulChanges.push(change);
            } else {
              console.error('Failed to add goal:', result.error);
            }
          } else if (change.action === 'delete') {
            console.log('📤 Deleting goal:', change.goalId);

            const response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain' },
              body: JSON.stringify({
                action: 'deleteGoal',
                params: { goalId: change.goalId }
              })
            });

            const result = await response.json();
            if (result.success) {
              successfulChanges.push(change);
            } else {
              console.error('Failed to delete goal:', result.error);
            }
          } else if (change.action === 'complete' || change.action === 'uncomplete') {
            console.log('📤 Updating goal:', change.goalId);

            const response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain' },
              body: JSON.stringify({
                action: 'updateGoal',
                params: {
                  goalData: {
                    id: change.goalId,
                    dateCompleted: change.completionDate
                  }
                }
              })
            });

            const result = await response.json();
            if (result.success) {
              successfulChanges.push(change);
            } else {
              console.error('Failed to update goal:', result.error);
            }
          }
        }
      } catch (error) {
        console.error('Error syncing change:', error);
      }
    }

    // Remove successful changes from queue
    if (successfulChanges.length > 0) {
      this.pendingChanges = this.pendingChanges.filter(
        c => !successfulChanges.includes(c)
      );
      this.savePendingChanges();
      console.log(`✅ Successfully synced ${successfulChanges.length} changes`);
    }

    if (this.pendingChanges.length > 0) {
      console.warn(`⚠️ ${this.pendingChanges.length} changes failed to sync`);
    }
  }
}

const api = new API();

export default api;
