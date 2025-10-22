
import type { Goal, Exercise } from '../types';
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { TargetIcon, CheckCircleIcon, PlusCircleIcon, XMarkIcon } from './icons';

interface GoalManagerProps {
  studentId: number;
  studentFullName: string;
}

const GoalItem: React.FC<{ goal: Goal }> = ({ goal }) => {
  const isCompleted = !!goal.completionDate;
  return (
    <div className={`p-4 rounded-lg flex items-start space-x-4 ${isCompleted ? 'bg-green-50 dark:bg-green-900/50' : 'bg-yellow-50 dark:bg-yellow-900/50'}`}>
        <div className={`mt-1 ${isCompleted ? 'text-green-500' : 'text-yellow-500'}`}>
            {isCompleted ? <CheckCircleIcon className="w-6 h-6" /> : <TargetIcon className="w-6 h-6" />}
        </div>
        <div>
            <p className="font-bold text-gray-800 dark:text-gray-100">{goal.exerciseName}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
                Цель поставлена: {new Date(goal.setDate).toLocaleDateString()}
            </p>
            {isCompleted && (
                <p className="text-sm text-green-700 dark:text-green-300 font-semibold">
                    Выполнено: {new Date(goal.completionDate as string).toLocaleDateString()}
                </p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">"{goal.notes}"</p>
        </div>
    </div>
  );
};

const AddGoalModal: React.FC<{ studentId: number; studentFullName: string; onClose: () => void; onAddGoal: (newGoal: Goal) => void; exercises: Exercise[] }> = ({ studentId, studentFullName, onClose, onAddGoal, exercises }) => {
    const [exerciseId, setExerciseId] = useState<string>(exercises.length > 0 ? exercises[0].id.toString() : '');
    const [setDate, setSetDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedExercise = exercises.find(ex => ex.id === parseInt(exerciseId));
        if (!selectedExercise) return;

        const newGoal: Goal = {
            id: crypto.randomUUID(),
            studentId,
            studentFullName,
            exerciseId: selectedExercise.id,
            exerciseName: selectedExercise.name,
            setDate: new Date(setDate).toISOString(),
            completionDate: null,
            notes,
        };
        onAddGoal(newGoal);
        onClose();
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Новая цель</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                    <label htmlFor="exercise" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Упражнение</label>
                    <select id="exercise" value={exerciseId} onChange={e => setExerciseId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        {exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="setDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Дата постановки</label>
                    <input type="date" id="setDate" value={setDate} onChange={e => setSetDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Заметки</label>
                    <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Отмена</button>
                    <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Добавить</button>
                </div>
            </form>
        </div>
      </div>
    );
};

const GoalManager: React.FC<GoalManagerProps> = ({ studentId, studentFullName }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [goalsData, exercisesData] = await Promise.all([
        api.getGoalsByStudentId(studentId),
        api.getExercises(),
      ]);
      setGoals(goalsData);
      setExercises(exercisesData);
      setIsLoading(false);
    };
    fetchData();
  }, [studentId]);

  const handleAddGoal = useCallback(async (newGoal: Goal) => {
      try {
        await api.addGoal(newGoal);
        setGoals(prev => [...prev, newGoal]);
      } catch (error) {
        console.error('Failed to add goal:', error);
      }
  }, []);

  if (isLoading) {
    return <div className="text-center p-4 text-gray-500 dark:text-gray-400">Загрузка целей...</div>;
  }

  return (
    <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Цели</h3>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700">
                <PlusCircleIcon className="w-5 h-5" />
                <span>Новая цель</span>
            </button>
        </div>
      {goals.length > 0 ? (
        <div className="space-y-3">
          {goals.map(goal => <GoalItem key={goal.id} goal={goal} />)}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 py-4">Цели еще не поставлены.</p>
      )}

      {isModalOpen && (
        <AddGoalModal 
            studentId={studentId} 
            studentFullName={studentFullName}
            onClose={() => setIsModalOpen(false)}
            onAddGoal={handleAddGoal}
            exercises={exercises}
        />
      )}
    </div>
  );
};

export default GoalManager;
