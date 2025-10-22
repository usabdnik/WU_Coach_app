
import type { Student, Exercise, Goal, MonthlyPerformance } from '../types';
import { MONTHS_RU, ExerciseType } from '../types';

// Type-safe raw data structure
type RawStudentRow = [
    number,    // id
    string,    // lastName
    string,    // firstName
    string,    // group
    boolean,   // isActive
    ...number[], // 12 months of pull-ups, 12 months of push-ups, 12 months of dips (36 numbers)
    string,    // createdAt
    string     // updatedAt
];

// Constants for data parsing to avoid magic numbers
const DataIndices = {
    ID: 0,
    LAST_NAME: 1,
    FIRST_NAME: 2,
    GROUP: 3,
    IS_ACTIVE: 4,
    PERFORMANCE_START: 5,
    MONTHS_COUNT: 12,
    CREATED_AT: 41,
    UPDATED_AT: 42,
} as const;

const PerformanceOffsets = {
    PULL_UPS: 0,
    PUSH_UPS: DataIndices.MONTHS_COUNT,
    DIPS: DataIndices.MONTHS_COUNT * 2,
} as const;

const rawStudentData: RawStudentRow[] = [
    [1, 'Иванов', 'Петр', 'А-1', true, 15, 18, 20, 22, 19, 21, 23, 24, 22, 20, 18, 16, 45, 50, 52, 55, 53, 54, 56, 58, 57, 55, 50, 48, 18, 20, 22, 24, 23, 25, 26, 27, 26, 24, 22, 20, new Date('2023-09-01').toISOString(), new Date().toISOString()],
    [2, 'Сидоров', 'Иван', 'А-1', true, 10, 12, 14, 15, 13, 14, 16, 17, 16, 15, 13, 12, 30, 35, 38, 40, 38, 39, 41, 43, 42, 40, 38, 35, 12, 15, 17, 18, 17, 18, 19, 20, 19, 18, 16, 15, new Date('2023-09-01').toISOString(), new Date().toISOString()],
    [3, 'Петров', 'Алексей', 'Б-2', true, 8, 10, 12, 13, 11, 12, 14, 15, 14, 13, 11, 10, 25, 28, 30, 32, 30, 31, 33, 35, 34, 32, 30, 28, 8, 10, 12, 13, 12, 13, 14, 15, 14, 13, 11, 10, new Date('2024-01-15').toISOString(), new Date().toISOString()],
    [4, 'Смирнов', 'Сергей', 'В-3', true, 20, 22, 24, 25, 23, 24, 26, 27, 26, 25, 23, 22, 60, 65, 68, 70, 68, 69, 71, 73, 72, 70, 68, 65, 25, 28, 30, 32, 30, 31, 33, 35, 34, 32, 30, 28, new Date('2022-09-01').toISOString(), new Date().toISOString()],
    [5, 'Кузнецов', 'Дмитрий', 'Б-2', false, 5, 6, 7, 8, 7, 7, 8, 9, 8, 8, 7, 6, 20, 22, 24, 25, 24, 24, 25, 26, 25, 24, 23, 22, 5, 7, 8, 9, 8, 9, 10, 11, 10, 9, 8, 7, new Date('2023-09-01').toISOString(), new Date().toISOString()],
];

const parseRawStudentData = (data: RawStudentRow[]): Student[] => {
    return data.map(row => {
        const performance: MonthlyPerformance[] = MONTHS_RU.map((month, i) => ({
            month,
            [ExerciseType.PullUps]: row[DataIndices.PERFORMANCE_START + PerformanceOffsets.PULL_UPS + i] as number,
            [ExerciseType.PushUps]: row[DataIndices.PERFORMANCE_START + PerformanceOffsets.PUSH_UPS + i] as number,
            [ExerciseType.Dips]: row[DataIndices.PERFORMANCE_START + PerformanceOffsets.DIPS + i] as number,
        }));

        return {
            id: row[DataIndices.ID],
            lastName: row[DataIndices.LAST_NAME],
            firstName: row[DataIndices.FIRST_NAME],
            group: row[DataIndices.GROUP],
            isActive: row[DataIndices.IS_ACTIVE],
            performance,
            createdAt: row[DataIndices.CREATED_AT],
            updatedAt: row[DataIndices.UPDATED_AT],
        };
    });
};

const exercises: Exercise[] = [
    { id: 1, name: 'Подтягивания прямым хватом', category: 'Турник', description: 'Классические подтягивания', difficulty: 'Начальный' },
    { id: 3, name: 'Выход силой на две', category: 'Турник', description: 'Explosive подъем корпуса над перекладиной', difficulty: 'Продвинутый' },
    { id: 5, name: 'Передний вис (Front Lever)', category: 'Турник', description: 'Удержание тела параллельно земле лицом вверх', difficulty: 'Элитный' },
    { id: 12, name: 'Отжимания на брусьях', category: 'Брусья', description: 'Опускание и подъем тела на параллельных брусьях', difficulty: 'Средний' },
    { id: 15, name: 'Горизонт (Planche)', category: 'Брусья', description: 'Горизонтальное удержание тела на брусьях', difficulty: 'Элитный' },
    { id: 16, name: 'Спичаг', category: 'Акробатика', description: 'Выход в стойку на руках из положения сидя', difficulty: 'Продвинутый' },
];

const goals: Goal[] = [
    { id: 'goal-1', studentId: 1, studentFullName: 'Иванов Петр', exerciseId: 3, exerciseName: 'Выход силой на две', setDate: new Date('2024-09-01').toISOString(), completionDate: new Date('2024-10-15').toISOString(), notes: 'Отлично выполнено!' },
    { id: 'goal-2', studentId: 1, studentFullName: 'Иванов Петр', exerciseId: 5, exerciseName: 'Передний вис (Front Lever)', setDate: new Date('2024-10-20').toISOString(), completionDate: null, notes: 'В процессе обучения' },
    { id: 'goal-3', studentId: 2, studentFullName: 'Сидоров Иван', exerciseId: 16, exerciseName: 'Спичаг', setDate: new Date('2024-09-10').toISOString(), completionDate: null, notes: 'Требует работы над гибкостью' },
    { id: 'goal-4', studentId: 3, studentFullName: 'Петров Алексей', exerciseId: 12, exerciseName: 'Отжимания на брусьях', setDate: new Date('2024-01-20').toISOString(), completionDate: new Date('2024-03-15').toISOString(), notes: 'Хороший прогресс' },
    { id: 'goal-5', studentId: 4, studentFullName: 'Смирнов Сергей', exerciseId: 15, exerciseName: 'Горизонт (Planche)', setDate: new Date('2024-08-01').toISOString(), completionDate: null, notes: 'Сильный ученик, есть потенциал' },
];

// Simulate API calls
const api = {
    getStudents: (): Promise<Student[]> => {
        return new Promise(resolve => setTimeout(() => resolve(parseRawStudentData(rawStudentData)), 500));
    },
    getExercises: (): Promise<Exercise[]> => {
        return new Promise(resolve => setTimeout(() => resolve(exercises), 200));
    },
    getGoalsByStudentId: (studentId: number): Promise<Goal[]> => {
        return new Promise(resolve => setTimeout(() => resolve(goals.filter(g => g.studentId === studentId)), 300));
    },
};

export default api;
