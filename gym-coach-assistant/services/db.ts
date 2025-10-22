import type { Student, Exercise, Goal } from '../types';

const DB_NAME = 'GymCoachDB';
const DB_VERSION = 1;

interface DB {
  students: Student[];
  exercises: Exercise[];
  goals: Goal[];
  lastSync: string | null;
}

class GymCoachDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('students')) {
          db.createObjectStore('students', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('exercises')) {
          db.createObjectStore('exercises', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('goals')) {
          db.createObjectStore('goals', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta');
        }
      };
    });
  }

  // Students
  async getStudents(): Promise<Student[]> {
    return this.getAll<Student>('students');
  }

  async saveStudents(students: Student[]): Promise<void> {
    return this.saveAll('students', students);
  }

  async updateStudent(student: Student): Promise<void> {
    return this.update('students', student);
  }

  // Exercises
  async getExercises(): Promise<Exercise[]> {
    return this.getAll<Exercise>('exercises');
  }

  async saveExercises(exercises: Exercise[]): Promise<void> {
    return this.saveAll('exercises', exercises);
  }

  // Goals
  async getGoals(): Promise<Goal[]> {
    return this.getAll<Goal>('goals');
  }

  async saveGoals(goals: Goal[]): Promise<void> {
    return this.saveAll('goals', goals);
  }

  async addGoal(goal: Goal): Promise<void> {
    return this.add('goals', goal);
  }

  async getGoalsByStudentId(studentId: number): Promise<Goal[]> {
    const goals = await this.getGoals();
    return goals.filter(g => g.studentId === studentId);
  }

  // Last sync timestamp
  async getLastSync(): Promise<string | null> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['meta'], 'readonly');
      const store = transaction.objectStore('meta');
      const request = store.get('lastSync');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async setLastSync(timestamp: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['meta'], 'readwrite');
      const store = transaction.objectStore('meta');
      const request = store.put(timestamp, 'lastSync');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Helper methods
  private async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  private async saveAll<T extends { id: number | string }>(
    storeName: string,
    items: T[]
  ): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      // Clear existing data
      store.clear();

      // Add new data
      items.forEach(item => store.add(item));

      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();
    });
  }

  private async add<T>(storeName: string, item: T): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(item);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async update<T>(storeName: string, item: T): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

// Singleton instance
const db = new GymCoachDB();

export default db;
