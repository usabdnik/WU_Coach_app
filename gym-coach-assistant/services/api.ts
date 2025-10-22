import type { Student, Exercise, Goal } from '../types';
import db from './db';

// Import initial mock data
import mockApi from './mockData';

class API {
  private initialized = false;

  // Initialize database with mock data if empty
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      await db.init();

      // Check if database is already populated
      const students = await db.getStudents();

      if (students.length === 0) {
        console.log('Initializing database with mock data...');
        // First time - populate with mock data
        const [mockStudents, mockExercises, mockGoals] = await Promise.all([
          mockApi.getStudents(),
          mockApi.getExercises(),
          mockApi.getGoalsByStudentId(0), // Get all goals
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

        console.log('Database initialized successfully');
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  // Students
  async getStudents(): Promise<Student[]> {
    await this.init();
    return db.getStudents();
  }

  async updateStudent(student: Student): Promise<void> {
    await this.init();
    return db.updateStudent(student);
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
    return db.addGoal(goal);
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

  // Sync with Google Sheets (placeholder)
  async syncWithServer(): Promise<void> {
    await this.init();
    console.log('Syncing with server...');

    // TODO: Implement actual Google Sheets sync
    // For now, just update the last sync timestamp
    await db.setLastSync(new Date().toISOString());

    console.log('Sync completed');
  }
}

const api = new API();

export default api;
