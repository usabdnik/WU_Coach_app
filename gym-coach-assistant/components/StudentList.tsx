
import type { Student } from '../types';
import React, { useState, useMemo } from 'react';
import { SearchIcon, ChartBarIcon } from './icons';
import { ExerciseType } from '../types';

interface StudentListProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
}

const StudentCard: React.FC<{ student: Student; onClick: () => void }> = ({ student, onClick }) => {
    const maxPullUps = Math.max(0, ...student.performance.map(p => p[ExerciseType.PullUps]));

    return (
        <li
            onClick={onClick}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center justify-between space-x-4 cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-blue-500 transition-all duration-200"
        >
            <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {student.lastName} {student.firstName}
                </p>
                <p className={`text-sm ${student.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    {student.group} - {student.isActive ? 'Активен' : 'Неактивен'}
                </p>
            </div>
            <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Рекорд подтягиваний</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center justify-end">
                    <ChartBarIcon className="w-5 h-5 mr-2" />
                    {maxPullUps}
                </p>
            </div>
        </li>
    );
};


const StudentList: React.FC<StudentListProps> = ({ students, onSelectStudent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');

  const groups = useMemo(() => ['All', ...Array.from(new Set(students.map(s => s.group)))], [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const nameMatch = `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
      const groupMatch = selectedGroup === 'All' || student.group === selectedGroup;
      return nameMatch && groupMatch;
    });
  }, [students, searchTerm, selectedGroup]);

  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Поиск по имени или фамилии..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      <div>
        <div className="flex flex-wrap gap-2">
          {groups.map(group => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-3 py-1 text-sm font-medium rounded-full transition-colors duration-200 ${
                selectedGroup === group
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {group === 'All' ? 'Все группы' : group}
            </button>
          ))}
        </div>
      </div>
      
      <ul className="space-y-3">
        {filteredStudents.map(student => (
          <StudentCard key={student.id} student={student} onClick={() => onSelectStudent(student)} />
        ))}
        {filteredStudents.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Ученики не найдены.</p>
        )}
      </ul>
    </div>
  );
};

export default StudentList;
