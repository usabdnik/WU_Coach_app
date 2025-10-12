
import type { Student, MonthlyPerformance } from '../types';
import React, { useState, useMemo } from 'react';
import { ExerciseType } from '../types';
import PerformanceChart from './PerformanceChart';
import RecordModal from './RecordModal';
import GoalManager from './GoalManager';
import { PencilIcon } from './icons';

interface StudentDetailViewProps {
    student: Student;
    onUpdateStudent: (updatedStudent: Student) => void;
}

const exerciseConfigs = {
    [ExerciseType.PullUps]: { color: "#3b82f6" }, // blue-500
    [ExerciseType.PushUps]: { color: "#10b981" }, // emerald-500
    [ExerciseType.Dips]: { color: "#ef4444" }, // red-500
};

const StudentDetailView: React.FC<StudentDetailViewProps> = ({ student: initialStudent, onUpdateStudent }) => {
    const [student, setStudent] = useState(initialStudent);
    const [activeTab, setActiveTab] = useState<ExerciseType>(ExerciseType.PullUps);
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

    const allTimeRecord = useMemo(() => {
        return Math.max(0, ...student.performance.map(p => p[activeTab]));
    }, [student.performance, activeTab]);

    const handleSaveRecords = (updatedPerformance: MonthlyPerformance[]) => {
        const updatedStudent = { ...student, performance: updatedPerformance, updatedAt: new Date().toISOString() };
        setStudent(updatedStudent);
        onUpdateStudent(updatedStudent);
    };
    
    const handleGroupChange = (newGroup: string) => {
        const updatedStudent = { ...student, group: newGroup, updatedAt: new Date().toISOString() };
        setStudent(updatedStudent);
        onUpdateStudent(updatedStudent);
    };

    return (
        <div className="pb-8">
            <div className="bg-white dark:bg-gray-800 p-4 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{student.lastName} {student.firstName}</h2>
                <div className="flex items-center space-x-2 mt-1">
                     <span className="text-gray-600 dark:text-gray-300">Группа:</span>
                     <select 
                        value={student.group}
                        onChange={(e) => handleGroupChange(e.target.value)}
                        className="bg-gray-100 dark:bg-gray-700 border-none rounded p-1"
                      >
                         <option value="А-1">А-1</option>
                         <option value="А-2">А-2</option>
                         <option value="Б-1">Б-1</option>
                         <option value="Б-2">Б-2</option>
                         <option value="В-1">В-1</option>
                         <option value="В-2">В-2</option>
                         <option value="В-3">В-3</option>
                     </select>
                     <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${student.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                        {student.isActive ? 'Активен' : 'Неактивен'}
                    </span>
                </div>
            </div>

            <div className="p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Показатели</h3>
                        <button onClick={() => setIsRecordModalOpen(true)} className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                            <PencilIcon className="w-4 h-4" />
                            <span>Редактировать</span>
                        </button>
                    </div>

                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                            {Object.values(ExerciseType).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setActiveTab(type)}
                                    className={`${
                                        activeTab === type
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                                    } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                                >
                                    {type}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="mt-4">
                        <div className="text-center mb-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Рекорд за все время</p>
                            <p className="text-4xl font-extrabold" style={{ color: exerciseConfigs[activeTab].color }}>{allTimeRecord}</p>
                        </div>
                        <PerformanceChart data={student.performance} exerciseType={activeTab} color={exerciseConfigs[activeTab].color} />
                    </div>
                </div>
            </div>
            
            <div className="mt-2">
                <GoalManager studentId={student.id} studentFullName={`${student.firstName} ${student.lastName}`} />
            </div>

            {isRecordModalOpen && (
                <RecordModal
                    student={student}
                    onClose={() => setIsRecordModalOpen(false)}
                    onSave={handleSaveRecords}
                />
            )}
        </div>
    );
};

export default StudentDetailView;
