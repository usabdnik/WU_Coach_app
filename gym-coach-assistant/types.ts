
export const MONTHS_RU = ['Сент', 'Окт', 'Нояб', 'Дек', 'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг'];

export enum ExerciseType {
  PullUps = 'Подтягивания',
  PushUps = 'Отжимания',
  Dips = 'Брусья'
}

export interface MonthlyPerformance {
  month: string;
  [ExerciseType.PullUps]: number;
  [ExerciseType.PushUps]: number;
  [ExerciseType.Dips]: number;
}

export interface Student {
  id: number;
  lastName: string;
  firstName: string;
  group: string;
  isActive: boolean;
  performance: MonthlyPerformance[];
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: number;
  name: string;
  category: string;
  description: string;
  difficulty: string;
  videoUrl?: string;
}

export interface Goal {
  id: string;
  studentId: number;
  studentFullName: string;
  exerciseId: number;
  exerciseName: string;
  setDate: string;
  completionDate: string | null;
  notes: string;
}
