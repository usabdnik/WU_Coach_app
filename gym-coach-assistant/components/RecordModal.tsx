
import type { Student, MonthlyPerformance } from '../types';
import React, { useState } from 'react';
import { ExerciseType } from '../types';
import { XMarkIcon } from './icons';

interface RecordModalProps {
  student: Student;
  onClose: () => void;
  onSave: (updatedPerformance: MonthlyPerformance[]) => void;
}

const RecordModal: React.FC<RecordModalProps> = ({ student, onClose, onSave }) => {
  const [performanceData, setPerformanceData] = useState<MonthlyPerformance[]>(JSON.parse(JSON.stringify(student.performance)));

  const handleInputChange = (monthIndex: number, exercise: ExerciseType, value: string) => {
    const numericValue = parseInt(value, 10);
    if (!isNaN(numericValue) && numericValue >= 0) {
      const updatedData = [...performanceData];
      updatedData[monthIndex] = {
        ...updatedData[monthIndex],
        [exercise]: numericValue,
      };
      setPerformanceData(updatedData);
    }
  };
  
  const handleSave = () => {
    onSave(performanceData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Редактировать рекорды: {student.firstName} {student.lastName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-4">
            <div className="grid grid-cols-4 gap-2 text-center font-semibold text-gray-700 dark:text-gray-300 sticky top-0 bg-gray-50 dark:bg-gray-700 py-2">
                <div>Месяц</div>
                <div>{ExerciseType.PullUps}</div>
                <div>{ExerciseType.PushUps}</div>
                <div>{ExerciseType.Dips}</div>
            </div>
            <div className="space-y-2 mt-2">
            {performanceData.map((perf, index) => (
                <div key={perf.month} className="grid grid-cols-4 gap-2 items-center">
                <div className="font-medium text-gray-800 dark:text-gray-200">{perf.month}</div>
                <input
                    type="number"
                    value={perf[ExerciseType.PullUps]}
                    onChange={(e) => handleInputChange(index, ExerciseType.PullUps, e.target.value)}
                    className="w-full p-1 border rounded text-center dark:bg-gray-600 dark:text-white dark:border-gray-500"
                />
                <input
                    type="number"
                    value={perf[ExerciseType.PushUps]}
                    onChange={(e) => handleInputChange(index, ExerciseType.PushUps, e.target.value)}
                    className="w-full p-1 border rounded text-center dark:bg-gray-600 dark:text-white dark:border-gray-500"
                />
                <input
                    type="number"
                    value={perf[ExerciseType.Dips]}
                    onChange={(e) => handleInputChange(index, ExerciseType.Dips, e.target.value)}
                    className="w-full p-1 border rounded text-center dark:bg-gray-600 dark:text-white dark:border-gray-500"
                />
                </div>
            ))}
            </div>
        </div>
        
        <div className="p-4 border-t dark:border-gray-700 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
            Отмена
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordModal;
